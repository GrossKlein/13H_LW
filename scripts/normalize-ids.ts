import { readFileSync } from 'fs';
import { join } from 'path';
import type { Claim } from '../src/types/claim';
import type { Evidence } from '../src/types/evidence';
import type { Event } from '../src/types/event';
import type { Entity } from '../src/types/entity';
import type { Proceeding } from '../src/types/proceeding';

const dataDir = join(__dirname, '../src/data');

const claimIdPattern = /^claim-\d{4}$/;
const evidenceIdPattern = /^evidence-\d{4}$/;
const eventIdPattern = /^event-\d{4}$/;
const entityIdPattern = /^entity-\d{4}$/;
const proceedingIdPattern = /^proc-\d{4}$/;

export function isValidClaimId(id: string): boolean {
  return claimIdPattern.test(id);
}

export function isValidEvidenceId(id: string): boolean {
  return evidenceIdPattern.test(id);
}

export function isValidEventId(id: string): boolean {
  return eventIdPattern.test(id);
}

export function isValidEntityId(id: string): boolean {
  return entityIdPattern.test(id);
}

export function isValidProceedingId(id: string): boolean {
  return proceedingIdPattern.test(id);
}

export function makeSequentialId(prefix: string, index: number): string {
  return `${prefix}-${String(index).padStart(4, '0')}`;
}

const claims = JSON.parse(readFileSync(join(dataDir, 'claims.json'), 'utf-8')) as Claim[];
const evidence = JSON.parse(readFileSync(join(dataDir, 'evidence.json'), 'utf-8')) as Evidence[];
const events = JSON.parse(readFileSync(join(dataDir, 'events.json'), 'utf-8')) as Event[];
const entities = JSON.parse(readFileSync(join(dataDir, 'entities.json'), 'utf-8')) as Entity[];
const proceedings = JSON.parse(readFileSync(join(dataDir, 'proceedings.json'), 'utf-8')) as Proceeding[];

const claimCompliance = claims.filter((c) => isValidClaimId(c.id));
const evidenceCompliance = evidence.filter((e) => isValidEvidenceId(e.id));
const eventCompliance = events.filter((e) => isValidEventId(e.id));
const entityCompliance = entities.filter((e) => isValidEntityId(e.id));
const proceedingCompliance = proceedings.filter((p) => isValidProceedingId(p.id));

console.log('=== ID Compliance Report ===');
console.log(`Claims: ${claimCompliance.length}/${claims.length} valid`);
console.log(`Evidence: ${evidenceCompliance.length}/${evidence.length} valid`);
console.log(`Events: ${eventCompliance.length}/${events.length} valid`);
console.log(`Entities: ${entityCompliance.length}/${entities.length} valid`);
console.log(`Proceedings: ${proceedingCompliance.length}/${proceedings.length} valid`);

if (claimCompliance.length < claims.length) {
  const invalid = claims.filter((c) => !isValidClaimId(c.id));
  console.log('\nInvalid claim IDs:');
  invalid.forEach((c) => console.log(`  - ${c.id}`));
}

if (evidenceCompliance.length < evidence.length) {
  const invalid = evidence.filter((e) => !isValidEvidenceId(e.id));
  console.log('\nInvalid evidence IDs:');
  invalid.forEach((e) => console.log(`  - ${e.id}`));
}

if (eventCompliance.length < events.length) {
  const invalid = events.filter((e) => !isValidEventId(e.id));
  console.log('\nInvalid event IDs:');
  invalid.forEach((e) => console.log(`  - ${e.id}`));
}

if (entityCompliance.length < entities.length) {
  const invalid = entities.filter((e) => !isValidEntityId(e.id));
  console.log('\nInvalid entity IDs:');
  invalid.forEach((e) => console.log(`  - ${e.id}`));
}

if (proceedingCompliance.length < proceedings.length) {
  const invalid = proceedings.filter((p) => !isValidProceedingId(p.id));
  console.log('\nInvalid proceeding IDs:');
  invalid.forEach((p) => console.log(`  - ${p.id}`));
}

console.log('\n=== All Datasets Loaded ===');
console.log(`Total claims: ${claims.length}`);
console.log(`Total evidence: ${evidence.length}`);
console.log(`Total events: ${events.length}`);
console.log(`Total entities: ${entities.length}`);
console.log(`Total proceedings: ${proceedings.length}`);
