import React, { useState, useMemo, useEffect } from 'react';
import type { Claim } from '../types/claim';
import type { Event } from '../types/event';
import type { Proceeding } from '../types/proceeding';

interface TimelineProps {
  events: Event[];
  claims: Claim[];
  proceedings: Proceeding[];
}

const getEventColor = (eventType: Event['event_type']): string => {
  const colorMap: Record<Event['event_type'], string> = {
    filing: 'war-blue',
    ruling: 'war-amber',
    communication: 'war-text-dim',
    inspection: 'war-cyan',
    transaction: 'war-green',
    demand: 'war-red',
    modification: 'war-text-muted',
    obstruction: 'war-red',
  };
  return colorMap[eventType];
};

const getEventColorValue = (eventType: Event['event_type']): string => {
  const colorMap: Record<Event['event_type'], string> = {
    filing: '#2a5a8a',
    ruling: '#9a7b1a',
    communication: '#6a6a6a',
    inspection: '#2a7a6a',
    transaction: '#2a6e2a',
    demand: '#a83232',
    modification: '#8a8a8a',
    obstruction: '#a83232',
  };
  return colorMap[eventType];
};

const getDotStyle = (certainty: Event['date_certainty']): React.CSSProperties => {
  const base: React.CSSProperties = {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  };

  if (certainty === 'exact') {
    return base;
  } else if (certainty === 'approximate') {
    return {
      ...base,
      backgroundColor: 'transparent',
      border: '2px solid currentColor',
    };
  } else {
    // inferred - dashed
    return {
      ...base,
      backgroundColor: 'transparent',
      border: '2px dashed currentColor',
    };
  }
};

const extractYear = (dateStr: string): number | null => {
  const yearMatch = dateStr.match(/(\d{4})/);
  return yearMatch ? parseInt(yearMatch[1], 10) : null;
};

const isDateSpecified = (dateStr: string): boolean => {
  return dateStr && dateStr.toLowerCase() !== 'unspecified';
};

const Timeline = ({ events, claims, proceedings }: TimelineProps) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<Event['event_type']>>(
    new Set()
  );
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const eventTypeOptions: Event['event_type'][] = [
    'filing',
    'communication',
    'inspection',
    'ruling',
    'transaction',
    'modification',
    'demand',
    'obstruction',
  ];

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filter by event type (if any selected)
    if (selectedEventTypes.size > 0) {
      filtered = filtered.filter((e) => selectedEventTypes.has(e.event_type));
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((e) =>
        e.description.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [events, selectedEventTypes, searchText]);

  // Sort by date: specified dates first (chronologically), then unspecified at bottom
  const sortedEvents = useMemo(() => {
    const specified = filteredEvents.filter((e) => isDateSpecified(e.date));
    const unspecified = filteredEvents.filter((e) => !isDateSpecified(e.date));

    specified.sort((a, b) => {
      const yearA = extractYear(a.date) || 0;
      const yearB = extractYear(b.date) || 0;
      if (yearA !== yearB) return yearA - yearB;
      // Secondary sort by date string for same year
      return a.date.localeCompare(b.date);
    });

    return [...specified, ...unspecified];
  }, [filteredEvents]);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const groups: Record<string, Event[]> = {
      'Unspecified': [],
    };

    sortedEvents.forEach((event) => {
      if (!isDateSpecified(event.date)) {
        groups['Unspecified'].push(event);
      } else {
        const year = extractYear(event.date);
        const yearKey = year ? String(year) : 'Unspecified';
        if (!groups[yearKey]) {
          groups[yearKey] = [];
        }
        groups[yearKey].push(event);
      }
    });

    // Sort year keys numerically (excluding 'Unspecified')
    const sortedKeys = Object.keys(groups)
      .filter((k) => k !== 'Unspecified')
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    if (groups['Unspecified'].length > 0) {
      sortedKeys.push('Unspecified');
    }

    return { groups, sortedKeys };
  }, [sortedEvents]);

  const toggleEventType = (eventType: Event['event_type']) => {
    const newSet = new Set(selectedEventTypes);
    if (newSet.has(eventType)) {
      newSet.delete(eventType);
    } else {
      newSet.add(eventType);
    }
    setSelectedEventTypes(newSet);
  };

  const totalEvents = sortedEvents.length;
  const allEventsCount = filteredEvents.length;

  if (!isHydrated) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-war-surface2 rounded-sm" />
        <div className="card space-y-4">
          <div className="h-10 bg-war-surface2 rounded-sm" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-6 w-20 bg-war-surface2 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-12 h-3 bg-war-surface2 rounded-full" />
              <div className="flex-1 h-24 bg-war-surface2 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl text-war-text">Timeline</h1>
          <p className="text-war-text-muted text-sm mt-1 font-mono">
            {allEventsCount} of {events.length} events
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="card space-y-4">
        <div>
          <h3 className="section-title mb-3">Search & Filter</h3>

          {/* Text Search */}
          <input
            type="text"
            placeholder="Search event descriptions..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input-search w-full mb-4"
          />

          {/* Event Type Filter */}
          <div className="space-y-2">
            <label className="text-xxs font-mono text-war-text-muted uppercase tracking-widest">
              Event Types
            </label>
            <div className="flex flex-wrap gap-2">
              {eventTypeOptions.map((eventType) => (
                <button
                  key={eventType}
                  onClick={() => toggleEventType(eventType)}
                  className={`badge cursor-pointer transition-all ${
                    selectedEventTypes.has(eventType)
                      ? `bg-${getEventColor(eventType)}/20 text-${getEventColor(eventType)}`
                      : 'bg-war-surface2 text-war-text-dim hover:text-war-text-muted'
                  }`}
                >
                  {eventType}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedEventTypes.size > 0 || searchText.trim()) && (
            <button
              onClick={() => {
                setSelectedEventTypes(new Set());
                setSearchText('');
              }}
              className="text-xxs font-mono text-war-amber hover:text-war-amber/80 mt-3 uppercase tracking-widest"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Timeline */}
      {totalEvents === 0 ? (
        <div className="card text-center py-12">
          <div className="text-war-text-muted font-mono text-sm">
            No events match your filters
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {eventsByYear.sortedKeys.map((yearKey) => (
            <div key={yearKey}>
              {/* Year Separator */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-shrink-0">
                  <span className="font-mono text-sm font-bold text-war-amber">
                    {yearKey}
                  </span>
                </div>
                <div className="flex-1 h-px bg-war-border" />
              </div>

              {/* Events in this year */}
              <div className="space-y-4 pl-4 relative">
                {/* Vertical timeline line */}
                <div
                  className="absolute left-5 top-0 bottom-0 w-px bg-war-border/50"
                  style={{ height: '100%' }}
                />

                {eventsByYear.groups[yearKey].map((event, idx) => {
                  const colorClass = getEventColor(event.event_type);
                  const colorValue = getEventColorValue(event.event_type);
                  const claimsCount = event.related_claim_ids.length;
                  const evidenceCount = event.related_evidence_ids.length;

                  return (
                    <div key={event.id} className="flex gap-4 relative">
                      {/* Dot with vertical line */}
                      <div className="flex flex-col items-center flex-shrink-0 w-12">
                        <div
                          style={{
                            color: colorValue,
                          }}
                          className="relative z-10 flex items-center justify-center"
                        >
                          <style>{`
                            .dot-exact-${event.id} {
                              width: 12px;
                              height: 12px;
                              background-color: ${colorValue};
                              border-radius: 50%;
                            }
                            .dot-approximate-${event.id} {
                              width: 12px;
                              height: 12px;
                              background-color: transparent;
                              border: 2px solid ${colorValue};
                              border-radius: 50%;
                            }
                            .dot-inferred-${event.id} {
                              width: 12px;
                              height: 12px;
                              background-color: transparent;
                              border: 2px dashed ${colorValue};
                              border-radius: 50%;
                            }
                          `}</style>
                          <div
                            className={`dot-${event.date_certainty}-${event.id}`}
                          />
                        </div>
                      </div>

                      {/* Event card */}
                      <div
                        className={`card-hover card flex-1 border-l-4 relative`}
                        style={{ borderLeftColor: colorValue }}
                      >
                        <div className="space-y-2">
                          {/* Type badge + date */}
                          <div className="flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="badge text-xs font-mono font-semibold"
                                style={{
                                  backgroundColor: `${colorValue}20`,
                                  color: colorValue,
                                }}
                              >
                                {event.event_type}
                              </span>
                              <span className="font-mono text-xxs text-war-text-dim">
                                {event.date}
                              </span>
                            </div>
                            {event.date_certainty !== 'exact' && (
                              <span className="text-xxs font-mono text-war-text-muted">
                                {event.date_certainty}
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          <p className="text-sm text-war-text leading-relaxed">
                            {event.description}
                          </p>

                          {/* Related items */}
                          {(claimsCount > 0 || evidenceCount > 0) && (
                            <div className="flex gap-3 pt-2">
                              {claimsCount > 0 && (
                                <span className="text-xxs font-mono text-war-text-muted">
                                  <span className="text-war-amber">{claimsCount}</span> claim{claimsCount !== 1 ? 's' : ''}
                                </span>
                              )}
                              {evidenceCount > 0 && (
                                <span className="text-xxs font-mono text-war-text-muted">
                                  <span className="text-war-cyan">{evidenceCount}</span> evidence
                                </span>
                              )}
                            </div>
                          )}

                          {/* Causal tags */}
                          {event.causal_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {event.causal_tags.map((tag, idx) => (
                                <span
                                  key={`${event.id}-tag-${idx}`}
                                  className="badge text-xxs bg-war-surface2 text-war-text-muted"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Event ID */}
                          <div className="pt-2">
                            <span className="text-xxs font-mono text-war-text-muted">
                              {event.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline;
