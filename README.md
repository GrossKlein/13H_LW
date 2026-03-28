# 13 Harrison Street — Litigation War Room

Structured litigation data extracted from a 60-page investigative document concerning 13 Harrison Street, TriBeCa. Built as a typed Astro-ready data layer.

## Dataset

| Collection | Count | Description |
|------------|-------|-------------|
| Claims | 348 | Factual assertions, legal positions, credibility challenges |
| Evidence | 160 | Documents, testimony, communications, records |
| Events | 165 | Chronological timeline of litigation events |
| Entities | 135 | People, firms, courts, organizations |
| Proceedings | 38 | Cases, hearings, motions, investigations |

All items use canonical IDs (`claim-0001`, `evidence-0001`, etc.) with bidirectional relationship links validated across the full dataset.

## Structure

```
src/
  schemas/       # JSON Schema (strict, additionalProperties: false)
  types/         # TypeScript interfaces + union-type enums
  data/          # Canonical JSON datasets
    indexes/     # Derived lookup indexes
  lib/
    data.ts          # Loaders + by-id lookups
    filters.ts       # 10 pure filter functions
    relationships.ts # 12 traversal functions
    citations.ts     # Plain-string formatters
scripts/
  build-derived-indexes.ts   # Generates 4 index files
  normalize-ids.ts           # ID format verification
```

## Pipeline

Built via a 5-phase extraction pipeline:

1. **P1 — Contract Layer**: JSON Schemas + TypeScript types
2. **P2 — Raw Extraction**: 10 chapter-scoped LLM passes → merge
3. **P3 — Canonical Normalization**: Type-safe normalization in 5 batches
4. **P4 — Relationship Linking**: 4 patch passes with bidirectional validation
5. **P5 — Astro Data Layer**: Query functions, filters, traversals, citation formatters
