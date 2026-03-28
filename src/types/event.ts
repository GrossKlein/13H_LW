import type { EventType, DateCertainty } from './enums';

export interface Event {
  id: string;
  date: string;
  date_certainty: DateCertainty;
  description: string;
  event_type: EventType;
  proceeding_id: string | null;
  related_claim_ids: string[];
  related_evidence_ids: string[];
  related_entity_ids: string[];
  causal_tags: string[];
  notes_internal: string | null;
}
