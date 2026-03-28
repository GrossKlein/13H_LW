import type { ClaimType, ClaimStatus, ReviewStatus } from './enums';

export interface Claim {
  id: string;
  statement: string;
  asserted_by: string;
  asserted_in: string;
  proceeding_ids: string[];
  claim_type: ClaimType;
  claim_status: ClaimStatus;
  contradiction_type: string | null;
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  related_event_ids: string[];
  judicial_treatment: string | null;
  legal_significance: string;
  review_status: ReviewStatus;
  notes_internal: string | null;
}
