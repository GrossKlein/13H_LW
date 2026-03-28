import type { Claim } from '../types/claim';
import type { Evidence } from '../types/evidence';
import type { Event } from '../types/event';
import type { Entity } from '../types/entity';
import type { Proceeding } from '../types/proceeding';

import claimsData from '../data/claims.json';
import evidenceData from '../data/evidence.json';
import eventsData from '../data/events.json';
import entitiesData from '../data/entities.json';
import proceedingsData from '../data/proceedings.json';

const claimById = new Map<string, Claim>();
const evidenceById = new Map<string, Evidence>();
const eventById = new Map<string, Event>();
const entityById = new Map<string, Entity>();
const proceedingById = new Map<string, Proceeding>();

(claimsData as Claim[]).forEach((c) => claimById.set(c.id, c));
(evidenceData as Evidence[]).forEach((e) => evidenceById.set(e.id, e));
(eventsData as Event[]).forEach((e) => eventById.set(e.id, e));
(entitiesData as Entity[]).forEach((e) => entityById.set(e.id, e));
(proceedingsData as Proceeding[]).forEach((p) => proceedingById.set(p.id, p));

export {
  claimById,
  evidenceById,
  eventById,
  entityById,
  proceedingById,
};

export function getClaims(): Claim[] {
  return [...claimsData] as Claim[];
}

export function getEvidence(): Evidence[] {
  return [...evidenceData] as Evidence[];
}

export function getEvents(): Event[] {
  return [...eventsData] as Event[];
}

export function getEntities(): Entity[] {
  return [...entitiesData] as Entity[];
}

export function getProceedings(): Proceeding[] {
  return [...proceedingsData] as Proceeding[];
}

export function getClaimById(id: string): Claim | undefined {
  return claimById.get(id);
}

export function getEvidenceById(id: string): Evidence | undefined {
  return evidenceById.get(id);
}

export function getEventById(id: string): Event | undefined {
  return eventById.get(id);
}

export function getEntityById(id: string): Entity | undefined {
  return entityById.get(id);
}

export function getProceedingById(id: string): Proceeding | undefined {
  return proceedingById.get(id);
}
