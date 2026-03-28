import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Claim } from '../src/types/claim';
import type { Evidence } from '../src/types/evidence';
import type { Event } from '../src/types/event';
import type { Proceeding } from '../src/types/proceeding';

const dataDir = join(__dirname, '../src/data');
const indexDir = join(dataDir, 'indexes');

if (!existsSync(indexDir)) {
  mkdirSync(indexDir, { recursive: true });
}

const claims = JSON.parse(readFileSync(join(dataDir, 'claims.json'), 'utf-8')) as Claim[];
const evidence = JSON.parse(readFileSync(join(dataDir, 'evidence.json'), 'utf-8')) as Evidence[];
const events = JSON.parse(readFileSync(join(dataDir, 'events.json'), 'utf-8')) as Event[];
const proceedings = JSON.parse(readFileSync(join(dataDir, 'proceedings.json'), 'utf-8')) as Proceeding[];

const claimsByProceeding = new Map<string, string[]>();
claims.forEach((c) => {
  c.proceeding_ids.forEach((pid) => {
    if (!claimsByProceeding.has(pid)) {
      claimsByProceeding.set(pid, []);
    }
    claimsByProceeding.get(pid)!.push(c.id);
  });
});

writeFileSync(
  join(indexDir, 'claims-by-proceeding.json'),
  JSON.stringify(Object.fromEntries(claimsByProceeding), null, 2)
);

const evidenceByClaim = new Map<string, string[]>();
evidence.forEach((e) => {
  e.related_claim_ids.forEach((cid) => {
    if (!evidenceByClaim.has(cid)) {
      evidenceByClaim.set(cid, []);
    }
    evidenceByClaim.get(cid)!.push(e.id);
  });
});

writeFileSync(
  join(indexDir, 'evidence-by-claim.json'),
  JSON.stringify(Object.fromEntries(evidenceByClaim), null, 2)
);

const eventsByProceeding = new Map<string, string[]>();
events.forEach((e) => {
  if (e.proceeding_id) {
    if (!eventsByProceeding.has(e.proceeding_id)) {
      eventsByProceeding.set(e.proceeding_id, []);
    }
    eventsByProceeding.get(e.proceeding_id)!.push(e.id);
  }
});

writeFileSync(
  join(indexDir, 'events-by-proceeding.json'),
  JSON.stringify(Object.fromEntries(eventsByProceeding), null, 2)
);

const sortedEvents = [...events].sort((a, b) => {
  const aIsUndated = a.date === 'undated';
  const bIsUndated = b.date === 'undated';

  if (aIsUndated && !bIsUndated) return 1;
  if (!aIsUndated && bIsUndated) return -1;
  if (aIsUndated && bIsUndated) return a.id.localeCompare(b.id);

  const cmp = a.date.localeCompare(b.date);
  if (cmp !== 0) return cmp;

  return a.id.localeCompare(b.id);
});

writeFileSync(
  join(indexDir, 'timeline-order.json'),
  JSON.stringify(sortedEvents.map((e) => e.id), null, 2)
);

console.log('Indexes built successfully');
