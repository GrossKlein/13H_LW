import type { EvidenceType, ReliabilityLevel } from './enums';

export interface Evidence {
  id: string;
  type: EvidenceType;
  source: string;
  date: string | null;
  excerpt: string;
  full_reference: string | null;
  proceeding_ids: string[];
  related_claim_ids: string[];
  related_event_ids: string[];
  provenance: string;
  reliability_level: ReliabilityLevel;
  notes_internal: string | null;
}
