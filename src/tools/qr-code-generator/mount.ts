// This tool's entry: hydrates its panel. The page loads this file (with the qrcode matrix code, which no other page needs)
// and the shared island chunk, nothing else (DECISOES § 23).
import { mountIsland } from '../image/mount.ts';
import QrPanel from './QrPanel.tsx';

mountIsland(QrPanel);
