// A server of dist/ of its own for each test of the service worker (F8; DECISOES § 294), with the rules of
// scripts/serve-dist.ts. A port of its own gives each test a clean origin (registrations and caches are per origin);
// close() turns the network off for real (the worker's fetch fails, in Chromium and WebKit alike), and reopen() turns it
// back on at the same origin; override() swaps a file, like /sw.js for the kill switch or a new build.
import type { AddressInfo, Socket } from 'node:net';
import { createDistServer } from '../../../scripts/serve-dist.ts';

export interface SwServer {
  origin: string;
  /** Every request the server received, in order. */
  requests: { method: string; pathname: string }[];
  override(pathname: string, body: string | null): void;
  close(): Promise<void>;
  reopen(): Promise<void>;
}

export async function startSwServer(): Promise<SwServer> {
  const overrides = new Map<string, string>();
  const requests: { method: string; pathname: string }[] = [];
  const sockets = new Set<Socket>();
  const server = createDistServer({ overrides, onRequest: (method, pathname) => requests.push({ method, pathname }) });
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  const listen = (port: number) =>
    new Promise<number>((resolve, reject) => {
      server.once('error', reject);
      server.listen(port, '127.0.0.1', () => {
        server.off('error', reject);
        resolve((server.address() as AddressInfo).port);
      });
    });
  const port = await listen(0);
  return {
    origin: `http://127.0.0.1:${port}`,
    requests,
    override(pathname, body) {
      if (body === null) overrides.delete(pathname);
      else overrides.set(pathname, body);
    },
    close: () =>
      new Promise<void>((resolve) => {
        for (const socket of sockets) socket.destroy();
        if (!server.listening) {
          resolve();
          return;
        }
        server.close(() => resolve());
      }),
    reopen: async () => {
      await listen(port);
    },
  };
}
