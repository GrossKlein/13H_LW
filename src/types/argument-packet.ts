import type { ArgumentExportFormat } from './enums';

export interface ArgumentPacket {
  id: string;
  issue: string;
  thesis: string;
  claim_ids: string[];
  evidence_ids: string[];
  event_ids: string[];
  contradiction_map: string;
  timeline_support: string;
  legal_hooks: string[];
  weaknesses: string[];
  export_format: ArgumentExportFormat;
}
