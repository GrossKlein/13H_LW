import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Claim {
  id: string;
  statement: string;
  asserted_by: string;
  supporting_evidence_ids: string[];
  contradicting_evidence_ids: string[];
  related_event_ids: string[];
  proceeding_ids: string[];
}

interface Evidence {
  id: string;
  type: string;
  excerpt: string;
  related_claim_ids: string[];
  related_event_ids: string[];
  proceeding_ids: string[];
}

interface Event {
  id: string;
  date: string;
  description: string;
  related_claim_ids: string[];
  related_evidence_ids: string[];
  related_entity_ids: string[];
  proceeding_id: string | null;
}

interface Entity {
  id: string;
  name: string;
  entity_type: string;
}

interface Proceeding {
  id: string;
  title: string;
  claim_ids: string[];
  event_ids: string[];
  evidence_ids: string[];
}

interface Node {
  id: string;
  type: 'claim' | 'evidence' | 'event' | 'entity' | 'proceeding';
  label: string;
  connections: number;
  data: any;
}

interface Link {
  source: string;
  target: string;
  type: 'supporting' | 'contradicting' | 'related' | 'participation';
}

const COLORS = {
  'claim': '#d4a017',
  'evidence': '#4a7ab8',
  'event': '#4aaa9a',
  'entity': '#3a8a3a',
  'proceeding': '#c44040',
};

const COLOR_CLASSES = {
  'claim': 'bg-war-amber',
  'evidence': 'bg-war-blue',
  'event': 'bg-war-cyan',
  'entity': 'bg-war-green',
  'proceeding': 'bg-war-red',
};

interface RelationshipGraphProps {
  claims: Claim[];
  evidence: Evidence[];
  events: Event[];
  entities: Entity[];
  proceedings: Proceeding[];
}

export default function RelationshipGraph({
  claims,
  evidence,
  events,
  entities,
  proceedings,
}: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodeTypes, setNodeTypes] = useState({
    claim: true,
    evidence: true,
    event: true,
    entity: true,
    proceeding: true,
  });
  const [minConnections, setMinConnections] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    label: string;
    type: string;
    info: string;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Build node and link data structures
    const nodes: Node[] = [];
    const links: Link[] = [];
    const nodeMap = new Map<string, Node>();

    // Add claims
    claims.forEach(claim => {
      const node: Node = {
        id: claim.id,
        type: 'claim',
        label: claim.statement.substring(0, 50) + '...',
        connections: 0,
        data: claim,
      };
      nodes.push(node);
      nodeMap.set(claim.id, node);

      // Supporting evidence links
      claim.supporting_evidence_ids?.forEach(evId => {
        links.push({ source: claim.id, target: evId, type: 'supporting' });
      });

      // Contradicting evidence links
      claim.contradicting_evidence_ids?.forEach(evId => {
        links.push({ source: claim.id, target: evId, type: 'contradicting' });
      });

      // Event links
      claim.related_event_ids?.forEach(evtId => {
        links.push({ source: claim.id, target: evtId, type: 'related' });
      });

      // Proceeding links
      claim.proceeding_ids?.forEach(procId => {
        links.push({ source: claim.id, target: procId, type: 'participation' });
      });
    });

    // Add evidence
    evidence.forEach(ev => {
      const node: Node = {
        id: ev.id,
        type: 'evidence',
        label: ev.type,
        connections: 0,
        data: ev,
      };
      nodes.push(node);
      nodeMap.set(ev.id, node);

      // Event links
      ev.related_event_ids?.forEach(evtId => {
        links.push({ source: ev.id, target: evtId, type: 'related' });
      });

      // Proceeding links
      ev.proceeding_ids?.forEach(procId => {
        links.push({ source: ev.id, target: procId, type: 'participation' });
      });
    });

    // Add events
    events.forEach(evt => {
      const node: Node = {
        id: evt.id,
        type: 'event',
        label: evt.description.substring(0, 40) + '...',
        connections: 0,
        data: evt,
      };
      nodes.push(node);
      nodeMap.set(evt.id, node);

      // Entity links
      evt.related_entity_ids?.forEach(entId => {
        links.push({ source: evt.id, target: entId, type: 'related' });
      });

      // Proceeding link
      if (evt.proceeding_id) {
        links.push({ source: evt.id, target: evt.proceeding_id, type: 'participation' });
      }
    });

    // Add entities
    entities.forEach(ent => {
      const node: Node = {
        id: ent.id,
        type: 'entity',
        label: ent.name,
        connections: 0,
        data: ent,
      };
      nodes.push(node);
      nodeMap.set(ent.id, node);
    });

    // Add proceedings
    proceedings.forEach(proc => {
      const node: Node = {
        id: proc.id,
        type: 'proceeding',
        label: proc.title.substring(0, 40) + '...',
        connections: 0,
        data: proc,
      };
      nodes.push(node);
      nodeMap.set(proc.id, node);
    });

    // Count connections and filter nodes with at least minConnections
    const connectionCounts = new Map<string, number>();
    links.forEach(link => {
      connectionCounts.set(link.source, (connectionCounts.get(link.source) || 0) + 1);
      connectionCounts.set(link.target, (connectionCounts.get(link.target) || 0) + 1);
    });

    // Filter nodes by type and connection count, keep up to 150 most connected
    let filteredNodes = nodes
      .filter(n => nodeTypes[n.type])
      .filter(n => (connectionCounts.get(n.id) || 0) >= minConnections)
      .map(n => ({
        ...n,
        connections: connectionCounts.get(n.id) || 0,
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 150);

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));

    // Filter links to only include those with both endpoints in filtered nodes
    const filteredLinks = links.filter(
      l => filteredNodeIds.has(l.source) && filteredNodeIds.has(l.target)
    );

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create simulation
    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks as any)
        .id((d: any) => d.id)
        .distance(60))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    // Create container for zoom/pan
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Add links
    const link = g.selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => {
        if (d.type === 'supporting') return '#3a8a3a';
        if (d.type === 'contradicting') return '#c44040';
        return '#5a5850';
      })
      .attr('stroke-width', (d: any) => d.type === 'supporting' || d.type === 'contradicting' ? 2 : 1)
      .attr('stroke-opacity', 0.4);

    // Add nodes
    const node = g.selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => 5 + Math.min(d.connections * 1.5, 15))
      .attr('fill', (d: any) => COLORS[d.type])
      .attr('stroke', (d: any) => COLORS[d.type])
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .on('mouseenter', function(event, d: any) {
        setHoveredNode(d.id);

        // Highlight connected nodes and edges
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);

        filteredLinks.forEach(l => {
          if (l.source === d.id) connectedIds.add(l.target);
          if (l.target === d.id) connectedIds.add(l.source);
        });

        node.attr('opacity', (n: any) => connectedIds.has(n.id) ? 0.9 : 0.2);
        link.attr('stroke-opacity', (l: any) =>
          l.source === d.id || l.target === d.id ? 0.8 : 0.1
        );

        // Show tooltip
        const mouseX = event.pageX;
        const mouseY = event.pageY;
        let info = '';
        if (d.type === 'claim') {
          info = `Asserted by: ${d.data.asserted_by}`;
        } else if (d.type === 'evidence') {
          info = `Type: ${d.data.type}`;
        } else if (d.type === 'event') {
          info = `Date: ${d.data.date}`;
        } else if (d.type === 'entity') {
          info = `Type: ${d.data.entity_type}`;
        } else if (d.type === 'proceeding') {
          info = `Index: ${d.data.index_number || 'N/A'}`;
        }

        setTooltip({
          x: mouseX,
          y: mouseY,
          label: d.label,
          type: d.type,
          info,
        });
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        node.attr('opacity', 0.8);
        link.attr('stroke-opacity', 0.4);
        setTooltip(null);
      })
      .call(d3.drag<SVGCircleElement, any>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });

    return () => {
      simulation.stop();
    };
  }, [claims, evidence, events, entities, proceedings, nodeTypes, minConnections]);

  return (
    <div className="relative w-full h-screen bg-war-bg">
      <svg
        ref={svgRef}
        className="w-full"
        style={{ height: 'calc(100vh - 100px)' }}
      />

      {/* Controls Panel */}
      <div className="fixed top-4 right-4 bg-war-surface/90 backdrop-blur border border-war-border rounded-lg p-4 max-w-xs space-y-4 z-10 shadow-lg">
        <div className="border-b border-war-border pb-3">
          <h3 className="font-semibold text-war-text text-sm mb-3">Node Types</h3>
          <div className="space-y-2">
            {Object.entries(nodeTypes).map(([type, enabled]) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() => setNodeTypes(prev => ({ ...prev, [type]: !prev[type] }))}
                  className="w-4 h-4 rounded"
                />
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[type as keyof typeof COLORS] }}
                />
                <span className="text-war-text text-sm capitalize">{type}s</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-b border-war-border pb-3">
          <label className="block text-war-text text-sm font-semibold mb-3">
            Min Connections: {minConnections}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={minConnections}
            onChange={(e) => setMinConnections(Number(e.target.value))}
            className="w-full h-2 bg-war-surface2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #d4a017 0%, #d4a017 ${(minConnections / 10) * 100}%, #2a2a30 ${(minConnections / 10) * 100}%, #2a2a30 100%)`,
            }}
          />
        </div>

        <div className="pt-2">
          <h4 className="text-war-text text-xs font-semibold mb-2 uppercase tracking-wider">Legend</h4>
          <div className="space-y-1 text-xxs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-0.5 bg-war-green" />
              <span className="text-war-text-dim">Supporting Evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-0.5 bg-war-red" />
              <span className="text-war-text-dim">Contradicting Evidence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-0.5 bg-war-text-muted" />
              <span className="text-war-text-dim">Other Relations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-war-surface2 border border-war-border rounded px-3 py-2 text-xs max-w-sm z-20 pointer-events-none"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[tooltip.type as keyof typeof COLORS] }}
            />
            <span className="font-semibold text-war-text capitalize">{tooltip.type}</span>
          </div>
          <div className="text-war-text-dim mb-1">{tooltip.label}</div>
          <div className="text-war-text-muted">{tooltip.info}</div>
        </div>
      )}
    </div>
  );
}
