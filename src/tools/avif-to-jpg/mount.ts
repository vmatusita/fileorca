// This tool's entry: hydrates its Panel (the page loads this file and the shared island chunk, nothing else).
import { mountIsland } from '../image/mount.ts';
import AvifToJpgPanel from './Panel.tsx';

mountIsland(AvifToJpgPanel);
