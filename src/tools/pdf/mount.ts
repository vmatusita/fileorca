// Hydrates the PDF tool island: the same Panel for the 12 tools, told which one by data-props (DECISOES § 23 and § 148).
import { mountIsland } from '../image/mount.ts';
import PdfPanel from './PdfPanel.tsx';

mountIsland(PdfPanel);
