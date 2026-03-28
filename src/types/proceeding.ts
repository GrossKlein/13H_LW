export interface Proceeding {
  id: string;
  index_number: string;
  title: string;
  court: string;
  claim_ids: string[];
  event_ids: string[];
  evidence_ids: string[];
}
