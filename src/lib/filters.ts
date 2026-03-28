import type { ClaimStatus, ClaimType, EvidenceType, EventType } from '../types/enums';
import {
  getClaims,
  getEvidence,
  getEvents,
} from './data';

export function getClaimsByProceedingId(proceedingId: string) {
  return getClaims().filter((c) => c.proceeding_ids.includes(proceedingId));
}

export function getEvidenceByProceedingId(proceedingId: string) {
  return getEvidence().filter((e) => e.proceeding_ids.includes(proceedingId));
}

export function getEventsByProceedingId(proceedingId: string) {
  return getEvents().filter((e) => e.proceeding_id === proceedingId);
}

export function getClaimsByStatus(status: ClaimStatus) {
  return getClaims().filter((c) => c.claim_status === status);
}

export function getClaimsByType(type: ClaimType) {
  return getClaims().filter((c) => c.claim_type === type);
}

export function getEvidenceByType(type: EvidenceType) {
  return getEvidence().filter((e) => e.type === type);
}

export function getEventsByType(type: EventType) {
  return getEvents().filter((e) => e.event_type === type);
}

export function searchClaimsByText(query: string) {
  const q = query.toLowerCase();
  return getClaims().filter((c) => c.statement.toLowerCase().includes(q));
}

export function searchEvidenceByText(query: string) {
  const q = query.toLowerCase();
  return getEvidence().filter((e) => e.excerpt.toLowerCase().includes(q));
}

export function searchEventsByText(query: string) {
  const q = query.toLowerCase();
  return getEvents().filter((e) => e.description.toLowerCase().includes(q));
}
