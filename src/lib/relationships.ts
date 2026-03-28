import type { Claim } from '../types/claim';
import type { Evidence } from '../types/evidence';
import type { Event } from '../types/event';
import type { Proceeding } from '../types/proceeding';
import type { Entity } from '../types/entity';

import {
  getClaimById,
  getEvidenceById,
  getEventById,
  getProceedingById,
  getEntityById,
  getClaims,
  getEvidence,
  getEvents,
  getEntities,
  getProceedings,
  claimById,
  evidenceById,
  eventById,
  proceedingById,
  entityById,
} from './data';

export function getSupportingEvidenceForClaim(claimId: string): Evidence[] {
  const claim = getClaimById(claimId);
  if (!claim) return [];
  return claim.supporting_evidence_ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => e !== undefined);
}

export function getContradictingEvidenceForClaim(claimId: string): Evidence[] {
  const claim = getClaimById(claimId);
  if (!claim) return [];
  return claim.contradicting_evidence_ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => e !== undefined);
}

export function getEventsForClaim(claimId: string): Event[] {
  const claim = getClaimById(claimId);
  if (!claim) return [];
  return claim.related_event_ids
    .map((id) => getEventById(id))
    .filter((e): e is Event => e !== undefined);
}

export function getClaimsForEvidence(evidenceId: string): Claim[] {
  const evidence = getEvidenceById(evidenceId);
  if (!evidence) return [];
  return evidence.related_claim_ids
    .map((id) => getClaimById(id))
    .filter((c): c is Claim => c !== undefined);
}

export function getEventsForEvidence(evidenceId: string): Event[] {
  const evidence = getEvidenceById(evidenceId);
  if (!evidence) return [];
  return evidence.related_event_ids
    .map((id) => getEventById(id))
    .filter((e): e is Event => e !== undefined);
}

export function getClaimsForEvent(eventId: string): Claim[] {
  const event = getEventById(eventId);
  if (!event) return [];
  return event.related_claim_ids
    .map((id) => getClaimById(id))
    .filter((c): c is Claim => c !== undefined);
}

export function getEvidenceForEvent(eventId: string): Evidence[] {
  const event = getEventById(eventId);
  if (!event) return [];
  return event.related_evidence_ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => e !== undefined);
}

export function getProceedingForEvent(eventId: string): Proceeding | undefined {
  const event = getEventById(eventId);
  if (!event || !event.proceeding_id) return undefined;
  return getProceedingById(event.proceeding_id);
}

export function getProceedingsForClaim(claimId: string): Proceeding[] {
  const claim = getClaimById(claimId);
  if (!claim) return [];
  return claim.proceeding_ids
    .map((id) => getProceedingById(id))
    .filter((p): p is Proceeding => p !== undefined);
}

export function getProceedingsForEvidence(evidenceId: string): Proceeding[] {
  const evidence = getEvidenceById(evidenceId);
  if (!evidence) return [];
  return evidence.proceeding_ids
    .map((id) => getProceedingById(id))
    .filter((p): p is Proceeding => p !== undefined);
}

export function getEntitiesForEvent(eventId: string): Entity[] {
  const event = getEventById(eventId);
  if (!event) return [];
  return event.related_entity_ids
    .map((id) => getEntityById(id))
    .filter((e): e is Entity => e !== undefined);
}

export interface ProceedingBundle {
  proceeding: Proceeding;
  claims: Claim[];
  evidence: Evidence[];
  events: Event[];
}

export function getProceedingBundle(proceedingId: string): ProceedingBundle | undefined {
  const proceeding = getProceedingById(proceedingId);
  if (!proceeding) return undefined;

  const claims = proceeding.claim_ids
    .map((id) => getClaimById(id))
    .filter((c): c is Claim => c !== undefined);

  const evidence = proceeding.evidence_ids
    .map((id) => getEvidenceById(id))
    .filter((e): e is Evidence => e !== undefined);

  const events = proceeding.event_ids
    .map((id) => getEventById(id))
    .filter((e): e is Event => e !== undefined);

  return {
    proceeding,
    claims,
    evidence,
    events,
  };
}
