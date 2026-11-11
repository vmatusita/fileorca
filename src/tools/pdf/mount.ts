// Hydrates the PDF tool island: the same Panel for every PDF tool and preset, told which one by data-props (DECISOES § 23 and § 148).
import { mountIsland } from '../image/mount.ts';
import PdfPanel from './PdfPanel.tsx';

mountIsland(PdfPanel);
