import React, { useState, useMemo, useEffect } from 'react';
import type { Claim } from '../types/claim';
import type { Evidence } from '../types/evidence';

interface Props {
  claims: Claim[];
  evidence: Evidence[];
}

const ROWS_PER_PAGE = 25;

const ClaimsBrowser = ({ claims, evidence }: Props) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Create evidence lookup map
  const evidenceMap = useMemo(() => {
    const map = new Map<string, Evidence>();
    evidence.forEach((e) => {
      map.set(e.id, e);
    });
    return map;
  }, [evidence]);

  // Filter claims
  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const matchesSearch = claim.statement.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = !statusFilter || claim.claim_status === statusFilter;
      const matchesType = !typeFilter || claim.claim_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [claims, searchText, statusFilter, typeFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredClaims.length / ROWS_PER_PAGE);
  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return filteredClaims.slice(start, start + ROWS_PER_PAGE);
  }, [filteredClaims, currentPage]);

  // Get unique status and type values
  const statuses = useMemo(() => {
    const set = new Set(claims.map((c) => c.claim_status));
    return Array.from(set).sort();
  }, [claims]);

  const types = useMemo(() => {
    const set = new Set(claims.map((c) => c.claim_type));
    return Array.from(set).sort();
  }, [claims]);

  const toggleExpanded = (claimId: string) => {
    setExpandedClaimId(expandedClaimId === claimId ? null : claimId);
  };

  const getEvidenceDetails = (evidenceIds: string[]) => {
    return evidenceIds
      .map((id) => evidenceMap.get(id))
      .filter((e) => e !== undefined) as Evidence[];
  };

  const formatClaimStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatClaimType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (!isHydrated) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-war-surface2 rounded-sm" />
        <div className="card space-y-4">
          <div className="h-10 bg-war-surface2 rounded-sm" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-war-surface2 rounded-sm" />
            <div className="h-10 bg-war-surface2 rounded-sm" />
          </div>
        </div>
        <div className="card space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-war-surface2 rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="section-title">Claims Browser</h1>
        <p className="text-war-text-muted text-sm">
          {filteredClaims.length} of {claims.length} claims
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
            placeholder="Filter by statement text..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
            className="input-search"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xxs font-mono uppercase tracking-widest text-war-text-muted">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-war-surface border border-war-border text-war-text rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-war-amber/40 focus:ring-1 focus:ring-war-amber/20"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {formatClaimStatus(status)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xxs font-mono uppercase tracking-widest text-war-text-muted">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-war-surface border border-war-border text-war-text rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-war-amber/40 focus:ring-1 focus:ring-war-amber/20"
            >
              <option value="">All Types</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {formatClaimType(type)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-war-surface2">
                <th className="table-header w-20">ID</th>
                <th className="table-header w-28">Status</th>
                <th className="table-header w-32">Type</th>
                <th className="table-header flex-1">Statement</th>
                <th className="table-header w-20 text-center">Evidence</th>
                <th className="table-header w-32">Asserted By</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClaims.map((claim) => (
                <React.Fragment key={claim.id}>
                  <tr
                    onClick={() => toggleExpanded(claim.id)}
                    className="cursor-pointer hover:bg-war-surface2 transition-colors"
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
                        {claim.statement}
                      </span>
                    </td>
                    <td className="table-cell text-center text-war-text-muted font-mono text-xxs">
                      {claim.supporting_evidence_ids.length +
                        claim.contradicting_evidence_ids.length}
                    </td>
                    <td className="table-cell text-war-text-dim text-sm">
                      {claim.asserted_by}
                    </td>
                  </tr>

                  {expandedClaimId === claim.id && (
                    <tr className="bg-war-surface2">
                      <td colSpan={6} className="p-4 border-b border-war-border">
                        <div className="space-y-4">
                          {/* Full statement */}
                          <div>
                            <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                              Full Statement
                            </h4>
                            <p className="text-sm text-war-text leading-relaxed">
                              {claim.statement}
                            </p>
                          </div>

                          {/* Legal significance */}
                          <div>
                            <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                              Legal Significance
                            </h4>
                            <p className="text-sm text-war-text">
                              {claim.legal_significance}
                            </p>
                          </div>

                          {/* Supporting evidence */}
                          {claim.supporting_evidence_ids.length > 0 && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-green mb-2">
                                Supporting Evidence ({claim.supporting_evidence_ids.length})
                              </h4>
                              <div className="space-y-2">
                                {getEvidenceDetails(
                                  claim.supporting_evidence_ids
                                ).map((e) => (
                                  <div
                                    key={e.id}
                                    className="bg-war-surface border border-war-border/50 rounded-sm p-3 text-sm space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-xxs text-war-text-dim">
                                        {e.id}
                                      </span>
                                      <span className="text-xxs text-war-green font-mono">
                                        {e.type}
                                      </span>
                                    </div>
                                    <p className="text-war-text-dim text-xs">
                                      {e.source}
                                    </p>
                                    <p className="text-war-text text-xs italic">
                                      "{e.excerpt}"
                                    </p>
                                    {e.full_reference && (
                                      <p className="text-war-text-muted text-xxs">
                                        Ref: {e.full_reference}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Contradicting evidence */}
                          {claim.contradicting_evidence_ids.length > 0 && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-red mb-2">
                                Contradicting Evidence (
                                {claim.contradicting_evidence_ids.length})
                              </h4>
                              <div className="space-y-2">
                                {getEvidenceDetails(
                                  claim.contradicting_evidence_ids
                                ).map((e) => (
                                  <div
                                    key={e.id}
                                    className="bg-war-surface border border-war-border/50 rounded-sm p-3 text-sm space-y-1"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-mono text-xxs text-war-text-dim">
                                        {e.id}
                                      </span>
                                      <span className="text-xxs text-war-red font-mono">
                                        {e.type}
                                      </span>
                                    </div>
                                    <p className="text-war-text-dim text-xs">
                                      {e.source}
                                    </p>
                                    <p className="text-war-text text-xs italic">
                                      "{e.excerpt}"
                                    </p>
                                    {e.full_reference && (
                                      <p className="text-war-text-muted text-xxs">
                                        Ref: {e.full_reference}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Related events */}
                          {claim.related_event_ids.length > 0 && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                                Related Events ({claim.related_event_ids.length})
                              </h4>
                              <p className="text-sm text-war-text-dim">
                                {claim.related_event_ids.join(', ')}
                              </p>
                            </div>
                          )}

                          {/* Proceedings */}
                          {claim.proceeding_ids.length > 0 && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                                Proceedings ({claim.proceeding_ids.length})
                              </h4>
                              <p className="text-sm text-war-text-dim">
                                {claim.proceeding_ids.join(', ')}
                              </p>
                            </div>
                          )}

                          {/* Contradiction type */}
                          {claim.contradiction_type && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                                Contradiction Type
                              </h4>
                              <p className="text-sm text-war-text">
                                {claim.contradiction_type}
                              </p>
                            </div>
                          )}

                          {/* Judicial treatment */}
                          {claim.judicial_treatment && (
                            <div>
                              <h4 className="text-xxs font-mono uppercase tracking-widest text-war-text-muted mb-2">
                                Judicial Treatment
                              </h4>
                              <p className="text-sm text-war-text">
                                {claim.judicial_treatment}
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-war-text-muted">
          Page {currentPage} of {totalPages || 1} (
          {filteredClaims.length} results)
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-sm bg-war-surface border border-war-border text-war-text text-sm hover:bg-war-surface2 hover:border-war-border-hi disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-sm bg-war-surface border border-war-border text-war-text text-sm hover:bg-war-surface2 hover:border-war-border-hi disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClaimsBrowser;
