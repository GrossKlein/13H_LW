import React, { useState, useMemo } from 'react';

interface Entity {
  id: string;
  name: string;
  entity_type: string;
  notes_internal: string | null;
}

interface Claim {
  id: string;
  statement: string;
  asserted_by: string;
  claim_status: string;
}

interface Event {
  id: string;
  date: string;
  description: string;
  related_entity_ids: string[];
}

interface EntitiesBrowserProps {
  entities: Entity[];
  claims: Claim[];
  events: Event[];
}

type SortOption = 'alphabetical' | 'most-claims' | 'most-events';

export default function EntitiesBrowser({ entities, claims, events }: EntitiesBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [expandedEntityId, setExpandedEntityId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');

  // Get unique entity types
  const entityTypes = useMemo(() => {
    const types = new Set(entities.map(e => e.entity_type));
    return Array.from(types).sort();
  }, [entities]);

  // Calculate related claims and events for each entity
  const entityMetadata = useMemo(() => {
    const metadata: Record<string, { claims: Claim[]; events: Event[] }> = {};

    entities.forEach(entity => {
      const relatedClaims = claims.filter(
        claim => claim.asserted_by.toLowerCase() === entity.name.toLowerCase()
      );
      const relatedEvents = events.filter(
        event => event.related_entity_ids.includes(entity.id)
      );

      metadata[entity.id] = {
        claims: relatedClaims,
        events: relatedEvents,
      };
    });

    return metadata;
  }, [entities, claims, events]);

  // Filter and sort entities
  const filteredAndSortedEntities = useMemo(() => {
    let filtered = entities.filter(entity => {
      const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || entity.entity_type === selectedType;
      return matchesSearch && matchesType;
    });

    // Sort based on selected option
    filtered.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'most-claims') {
        const aCount = entityMetadata[a.id].claims.length;
        const bCount = entityMetadata[b.id].claims.length;
        return bCount - aCount;
      } else if (sortBy === 'most-events') {
        const aCount = entityMetadata[a.id].events.length;
        const bCount = entityMetadata[b.id].events.length;
        return bCount - aCount;
      }
      return 0;
    });

    return filtered;
  }, [entities, searchTerm, selectedType, sortBy, entityMetadata]);

  const getStatusBadgeColor = (status: string) => {
    const statusColorMap: Record<string, string> = {
      alleged: 'bg-war-amber/20 text-war-amber',
      supported: 'bg-war-green/20 text-war-green',
      contradicted: 'bg-war-red/20 text-war-red',
      judicially_addressed: 'bg-war-blue/20 text-war-blue',
    };
    return statusColorMap[status] || 'bg-war-surface2 text-war-text-dim';
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search entities by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-search w-full"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-search"
          >
            <option value="">All Types</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="input-search"
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="most-claims">Most Claims</option>
            <option value="most-events">Most Events</option>
          </select>
        </div>
        <div className="text-xxs font-mono text-war-text-muted">
          Showing {filteredAndSortedEntities.length} of {entities.length} entities
        </div>
      </div>

      {/* Entities grid or expanded view */}
      {expandedEntityId && filteredAndSortedEntities.find(e => e.id === expandedEntityId) ? (
        <div className="card">
          {(() => {
            const entity = filteredAndSortedEntities.find(e => e.id === expandedEntityId)!;
            const metadata = entityMetadata[entity.id];

            return (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-war-border">
                  <div className="flex-1">
                    <h2 className="font-display text-xl text-war-text mb-2">{entity.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="badge bg-war-surface2 text-war-text-dim">{entity.entity_type}</span>
                      <span className="font-mono text-xxs text-war-text-muted">{entity.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedEntityId(null)}
                    className="text-war-text-muted hover:text-war-text transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {/* Internal notes if present */}
                {entity.notes_internal && (
                  <div className="bg-war-bg rounded-sm p-3 border-l-2 border-war-amber">
                    <div className="text-xxs font-mono text-war-text-muted uppercase mb-1">Internal Notes</div>
                    <div className="text-sm text-war-text">{entity.notes_internal}</div>
                  </div>
                )}

                {/* Metadata counts */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-war-surface2 rounded-sm p-3">
                    <div className="font-mono text-lg text-war-text">{metadata.claims.length}</div>
                    <div className="text-xxs font-mono text-war-text-muted uppercase">Claims Asserted</div>
                  </div>
                  <div className="bg-war-surface2 rounded-sm p-3">
                    <div className="font-mono text-lg text-war-text">{metadata.events.length}</div>
                    <div className="text-xxs font-mono text-war-text-muted uppercase">Events Involved</div>
                  </div>
                </div>

                {/* Claims asserted by this entity */}
                {metadata.claims.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="section-title">Claims Asserted by {entity.name}</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {metadata.claims.map(claim => (
                        <div key={claim.id} className="bg-war-surface2 rounded-sm p-3 border-l-2 border-war-blue/50">
                          <div className="text-sm text-war-text-dim mb-2">{truncateText(claim.statement)}</div>
                          <div className="flex items-center gap-2">
                            <span className={`badge text-xs ${getStatusBadgeColor(claim.claim_status)}`}>
                              {claim.claim_status.replace('_', ' ')}
                            </span>
                            <span className="font-mono text-xxs text-war-text-muted">{claim.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Events involving this entity */}
                {metadata.events.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="section-title">Events Involving {entity.name}</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {metadata.events.map(event => (
                        <div key={event.id} className="bg-war-surface2 rounded-sm p-3 border-l-2 border-war-cyan/50">
                          <div className="flex items-start gap-3">
                            <span className="font-mono text-xxs text-war-text-muted whitespace-nowrap pt-0.5">{event.date}</span>
                            <div className="flex-1">
                              <div className="text-sm text-war-text-dim">{truncateText(event.description, 200)}</div>
                              <span className="font-mono text-xxs text-war-text-muted mt-1 block">{event.id}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No related content message */}
                {metadata.claims.length === 0 && metadata.events.length === 0 && !entity.notes_internal && (
                  <div className="text-center py-6 text-war-text-muted">
                    <p className="text-sm">No associated claims, events, or notes for this entity.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-3 gap-3">
          {filteredAndSortedEntities.length > 0 ? (
            filteredAndSortedEntities.map(entity => {
              const metadata = entityMetadata[entity.id];
              return (
                <button
                  key={entity.id}
                  onClick={() => setExpandedEntityId(entity.id)}
                  className="card card-hover text-left"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-sans font-semibold text-war-text mb-2 line-clamp-2">{entity.name}</h3>
                      <span className="badge badge-factual_assertion text-xs">{entity.entity_type}</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <div className="flex-1">
                        <div className="font-mono text-sm text-war-text text-center">{metadata.claims.length}</div>
                        <div className="text-xxs font-mono text-war-text-muted text-center">Claims</div>
                      </div>
                      <div className="w-px bg-war-border" />
                      <div className="flex-1">
                        <div className="font-mono text-sm text-war-text text-center">{metadata.events.length}</div>
                        <div className="text-xxs font-mono text-war-text-muted text-center">Events</div>
                      </div>
                    </div>

                    <div className="pt-1 text-xxs text-war-text-muted font-mono">
                      {entity.id}
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-war-text-muted text-sm">No entities match your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
