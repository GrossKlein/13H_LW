import React, { useState, useMemo } from 'react';

interface Claim {
  id: string;
  statement: string;
  claim_status: string;
  claim_type: string;
  proceeding_ids: string[];
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  [key: string]: any;
}

interface Evidence {
  id: string;
  type: string;
  source: string;
  date: string | null;
  excerpt: string;
  proceeding_ids: string[];
  [key: string]: any;
}

interface Event {
  id: string;
  date: string;
  description: string;
  event_type: string;
  proceeding_id: string | null;
  [key: string]: any;
}

interface Proceeding {
  id: string;
  index_number: string;
  title: string;
  court: string;
  claim_ids: string[];
  event_ids: string[];
  evidence_ids: string[];
}

interface Props {
  proceedings: Proceeding[];
  claims: Claim[];
  evidence: Evidence[];
  events: Event[];
}

type SortKey = 'title' | 'claim_count' | 'recent_event';
type TabType = 'claims' | 'evidence' | 'events';

export default function ProceedingsBrowser({ proceedings, claims, evidence, events }: Props) {
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('title');
  const [expandedProcId, setExpandedProcId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('claims');

  // Create lookup maps
  const claimsMap = useMemo(() => {
    const map = new Map<string, Claim>();
    claims.forEach((c) => {
      map.set(c.id, c);
    });
    return map;
  }, [claims]);

  const evidenceMap = useMemo(() => {
    const map = new Map<string, Evidence>();
    evidence.forEach((e) => {
      map.set(e.id, e);
    });
    return map;
  }, [evidence]);

  const eventsMap = useMemo(() => {
    const map = new Map<string, Event>();
    events.forEach((e) => {
      map.set(e.id, e);
    });
    return map;
  }, [events]);

  // Get related items for a proceeding (union of proceeding_ids references and back-references)
  const getRelatedClaims = (procId: string): Claim[] => {
    const relatedIds = new Set<string>();
    // Direct references: claim_ids in proceeding
    const proc = proceedings.find((p) => p.id === procId);
    if (proc) {
      proc.claim_ids.forEach((id) => relatedIds.add(id));
    }
    // Back-references: proceeding_ids in claims
    claims.forEach((c) => {
      if (c.proceeding_ids.includes(procId)) {
        relatedIds.add(c.id);
      }
    });
    return Array.from(relatedIds)
      .map((id) => claimsMap.get(id))
      .filter((c) => c !== undefined) as Claim[];
  };

  const getRelatedEvidence = (procId: string): Evidence[] => {
    const relatedIds = new Set<string>();
    // Direct references: evidence_ids in proceeding
    const proc = proceedings.find((p) => p.id === procId);
    if (proc) {
      proc.evidence_ids.forEach((id) => relatedIds.add(id));
    }
    // Back-references: proceeding_ids in evidence
    evidence.forEach((e) => {
      if (e.proceeding_ids.includes(procId)) {
        relatedIds.add(e.id);
      }
    });
    return Array.from(relatedIds)
      .map((id) => evidenceMap.get(id))
      .filter((e) => e !== undefined) as Evidence[];
  };

  const getRelatedEvents = (procId: string): Event[] => {
    const relatedIds = new Set<string>();
    // Direct references: event_ids in proceeding
    const proc = proceedings.find((p) => p.id === procId);
    if (proc) {
      proc.event_ids.forEach((id) => relatedIds.add(id));
    }
    // Back-references: proceeding_id in events
    events.forEach((e) => {
      if (e.proceeding_id === procId) {
        relatedIds.add(e.id);
      }
    });
    return Array.from(relatedIds)
      .map((id) => eventsMap.get(id))
      .filter((e) => e !== undefined) as Event[];
  };

  // Filter proceedings by search text
  const filteredProceedings = useMemo(() => {
    return proceedings.filter((proc) => {
      const searchLower = searchText.toLowerCase();
      return (
        proc.title.toLowerCase().includes(searchLower) ||
        proc.index_number.toLowerCase().includes(searchLower) ||
        proc.court.toLowerCase().includes(searchLower)
      );
    });
  }, [proceedings, searchText]);

  // Sort proceedings
  const sortedProceedings = useMemo(() => {
    const sorted = [...filteredProceedings];
    sorted.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'claim_count') {
        const aCount = getRelatedClaims(a.id).length;
        const bCount = getRelatedClaims(b.id).length;
        return bCount - aCount; // Descending
      } else if (sortBy === 'recent_event') {
        const aEvents = getRelatedEvents(a.id);
        const bEvents = getRelatedEvents(b.id);
        const aLatest = aEvents.length > 0 ? aEvents[0].date : '';
        const bLatest = bEvents.length > 0 ? bEvents[0].date : '';
        return bLatest.localeCompare(aLatest); // Descending
      }
      return 0;
    });
    return sorted;
  }, [filteredProceedings, sortBy]);

  const formatClaimStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatClaimType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatEvidenceType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const truncateText = (text: string, maxChars: number = 150) => {
    return text.length > maxChars ? text.substring(0, maxChars) + '...' : text;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="section-title">Proceedings Browser</h1>
        <p className="text-war-text-muted text-sm">
          {sortedProceedings.length} of {proceedings.length} proceedings
        </p>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="space-y-2">
          <label className="block text-xxs font-mono uppercase tracking-widest text-war-text-muted">
            Search
          </label>
          <input
            type="text"
            placeholder="Filter by title, index number, or court..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="input-search"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xxs font-mono uppercase tracking-widest text-war-text-muted">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full bg-war-surface border border-war-border text-war-text rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-war-amber/40 focus:ring-1 focus:ring-war-amber/20"
          >
            <option value="title">Title (A-Z)</option>
            <option value="claim_count">Most Claims</option>
            <option value="recent_event">Most Recent Event</option>
          </select>
        </div>
      </div>

      {/* Proceedings List */}
      <div className="space-y-3">
        {sortedProceedings.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-war-text-muted">No proceedings match your search.</p>
          </div>
        ) : (
          sortedProceedings.map((proc) => {
            const relatedClaims = getRelatedClaims(proc.id);
            const relatedEvidence = getRelatedEvidence(proc.id);
            const relatedEvents = getRelatedEvents(proc.id);
            const isExpanded = expandedProcId === proc.id;

            return (
              <div key={proc.id} className="space-y-0">
                {/* Card Header - Clickable */}
                <div
                  onClick={() => setExpandedProcId(isExpanded ? null : proc.id)}
                  className="card card-hover cursor-pointer p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h2 className="font-bold text-war-text">
                        {proc.title}
                      </h2>
                      <div className="font-mono text-xxs text-war-text-dim">
                        {proc.index_number}
                      </div>
                      <div className="text-sm text-war-text-muted">
                        {proc.court}
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-1">
                      <svg
                        className={`w-5 h-5 text-war-text-muted transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  {/* Counts Row */}
                  <div className="flex gap-6 pt-2 border-t border-war-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono text-war-text-muted uppercase">
                        Claims
                      </span>
                      <span className="font-mono text-sm text-war-blue font-bold">
                        {relatedClaims.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono text-war-text-muted uppercase">
                        Evidence
                      </span>
                      <span className="font-mono text-sm text-war-cyan font-bold">
                        {relatedEvidence.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xxs font-mono text-war-text-muted uppercase">
                        Events
                      </span>
                      <span className="font-mono text-sm text-war-amber font-bold">
                        {relatedEvents.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="bg-war-surface2 border border-t-0 border-war-border p-4 space-y-4">
                    {/* Tab Navigation */}
                    <div className="flex gap-1 border-b border-war-border">
                      <button
                        onClick={() => setActiveTab('claims')}
                        className={`px-3 py-2 text-sm font-mono uppercase text-xxs transition-colors border-b-2 ${
                          activeTab === 'claims'
                            ? 'border-war-blue text-war-blue'
                            : 'border-transparent text-war-text-muted hover:text-war-text'
                        }`}
                      >
                        Claims ({relatedClaims.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('evidence')}
                        className={`px-3 py-2 text-sm font-mono uppercase text-xxs transition-colors border-b-2 ${
                          activeTab === 'evidence'
                            ? 'border-war-cyan text-war-cyan'
                            : 'border-transparent text-war-text-muted hover:text-war-text'
                        }`}
                      >
                        Evidence ({relatedEvidence.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('events')}
                        className={`px-3 py-2 text-sm font-mono uppercase text-xxs transition-colors border-b-2 ${
                          activeTab === 'events'
                            ? 'border-war-amber text-war-amber'
                            : 'border-transparent text-war-text-muted hover:text-war-text'
                        }`}
                      >
                        Events ({relatedEvents.length})
                      </button>
                    </div>

                    {/* Tab Content */}
                    <div>
                      {/* Claims Tab */}
                      {activeTab === 'claims' && (
                        <div className="overflow-x-auto">
                          {relatedClaims.length === 0 ? (
                            <p className="text-war-text-muted text-sm py-4">
                              No claims linked to this proceeding.
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-war-surface border-b border-war-border">
                                  <th className="table-header w-24">ID</th>
                                  <th className="table-header w-28">Status</th>
                                  <th className="table-header w-28">Type</th>
                                  <th className="table-header flex-1">Statement</th>
                                </tr>
                              </thead>
                              <tbody>
                                {relatedClaims.map((claim) => (
                                  <tr
                                    key={claim.id}
                                    className="border-b border-war-border/50 hover:bg-war-surface transition-colors"
                                  >
                                    <td className="table-cell font-mono text-xxs text-war-text-dim">
                                      {claim.id}
                                    </td>
                                    <td className="table-cell">
                                      <span className={`badge badge-${claim.claim_status}`}>
                                        {formatClaimStatus(claim.claim_status)}
                                      </span>
                                    </td>
                                    <td className="table-cell">
                                      <span className={`badge badge-${claim.claim_type}`}>
                                        {formatClaimType(claim.claim_type)}
                                      </span>
                                    </td>
                                    <td className="table-cell">
                                      <span className="text-war-text line-clamp-2">
                                        {truncateText(claim.statement, 200)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}

                      {/* Evidence Tab */}
                      {activeTab === 'evidence' && (
                        <div className="overflow-x-auto">
                          {relatedEvidence.length === 0 ? (
                            <p className="text-war-text-muted text-sm py-4">
                              No evidence linked to this proceeding.
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-war-surface border-b border-war-border">
                                  <th className="table-header w-24">ID</th>
                                  <th className="table-header w-20">Type</th>
                                  <th className="table-header w-40">Source</th>
                                  <th className="table-header w-20">Date</th>
                                  <th className="table-header flex-1">Excerpt</th>
                                </tr>
                              </thead>
                              <tbody>
                                {relatedEvidence.map((evid) => (
                                  <tr
                                    key={evid.id}
                                    className="border-b border-war-border/50 hover:bg-war-surface transition-colors"
                                  >
                                    <td className="table-cell font-mono text-xxs text-war-text-dim">
                                      {evid.id}
                                    </td>
                                    <td className="table-cell">
                                      <span className="badge badge-info text-xxs">
                                        {formatEvidenceType(evid.type)}
                                      </span>
                                    </td>
                                    <td className="table-cell text-war-text-dim text-xs">
                                      {truncateText(evid.source, 80)}
                                    </td>
                                    <td className="table-cell text-war-text-muted font-mono text-xxs">
                                      {evid.date || '—'}
                                    </td>
                                    <td className="table-cell text-war-text text-xs italic">
                                      {truncateText(evid.excerpt, 150)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}

                      {/* Events Tab */}
                      {activeTab === 'events' && (
                        <div className="overflow-x-auto">
                          {relatedEvents.length === 0 ? (
                            <p className="text-war-text-muted text-sm py-4">
                              No events linked to this proceeding.
                            </p>
                          ) : (
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-war-surface border-b border-war-border">
                                  <th className="table-header w-24">ID</th>
                                  <th className="table-header w-24">Date</th>
                                  <th className="table-header w-28">Type</th>
                                  <th className="table-header flex-1">Description</th>
                                </tr>
                              </thead>
                              <tbody>
                                {relatedEvents.map((evt) => (
                                  <tr
                                    key={evt.id}
                                    className="border-b border-war-border/50 hover:bg-war-surface transition-colors"
                                  >
                                    <td className="table-cell font-mono text-xxs text-war-text-dim">
                                      {evt.id}
                                    </td>
                                    <td className="table-cell font-mono text-xxs text-war-text-muted">
                                      {evt.date}
                                    </td>
                                    <td className="table-cell">
                                      <span className="badge badge-warning text-xxs">
                                        {formatEventType(evt.event_type)}
                                      </span>
                                    </td>
                                    <td className="table-cell text-war-text">
                                      {truncateText(evt.description, 200)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
