// This page's entry: hydrates its Panel (the page loads this file and the shared island chunk, nothing else).
import { mountIsland } from '../../../image/mount.ts';
import To100kbPanel from './Panel.tsx';

mountIsland(To100kbPanel);
