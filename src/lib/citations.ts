import type { Evidence } from '../types/evidence';
import type { Claim } from '../types/claim';
import type { Event } from '../types/event';

export function formatEvidenceSource(evidence: Evidence): string {
  const parts: string[] = [evidence.source];
  if (evidence.date) {
    parts.push(evidence.date);
  }
  return parts.join(' | ');
}

export function formatEvidenceReference(evidence: Evidence): string {
  return evidence.full_reference || evidence.provenance;
}

export function formatClaimCitation(claim: Claim): string {
  const parts: string[] = [claim.id, claim.asserted_in];
  return parts.join(' | ');
}

export function formatEventCitation(event: Event): string {
  const compact = compactText(event.description, 60);
  const parts: string[] = [event.id, event.date, compact];
  return parts.join(' | ');
}

export function compactText(value: string, maxLength?: number): string {
  let text = value.trim().replace(/\s+/g, ' ');

  if (maxLength && text.length > maxLength) {
    text = text.slice(0, maxLength).trim() + '...';
  }

  return text;
}
