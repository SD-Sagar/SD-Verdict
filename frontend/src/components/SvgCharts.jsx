import React from 'react';

// Unified neon colors for compared items
export const ITEM_COLORS = [
  { border: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', text: 'text-cyan-400', hex: '#06b6d4' },      // Cyan
  { border: '#d946ef', fill: 'rgba(217, 70, 239, 0.15)', text: 'text-fuchsia-400', hex: '#d946ef' },  // Fuchsia
  { border: '#eab308', fill: 'rgba(234, 179, 8, 0.15)', text: 'text-yellow-400', hex: '#eab308' },    // Yellow
  { border: '#10b981', fill: 'rgba(16, 185, 129, 0.15)', text: 'text-emerald-400', hex: '#10b981' },  // Emerald
  { border: '#f97316', fill: 'rgba(249, 115, 22, 0.15)', text: 'text-orange-400', hex: '#f97316' }    // Orange
];

export function RadarChart({ items, categories, scores }) {
  if (!items || items.length === 0 || !categories || categories.length === 0 || !scores) return null;

  // Radar constants (Massive viewBox for padding)
  const size = 500;
  const center = size / 2;
  const radius = 130;
  const numCats = categories.length;

  // Coordinates helper
  const getCoordinates = (catIndex, value) => {
    // Start from the top (-Math.PI / 2)
    const angle = (catIndex * (2 * Math.PI / numCats)) - (Math.PI / 2);
    const distance = (value / 100) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate grid lines
  const gridLevels = [20, 40, 60, 80, 100];
  const gridPolygons = gridLevels.map(level => {
    const points = [];
    for (let i = 0; i < numCats; i++) {
      const { x, y } = getCoordinates(i, level);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  });

  // Category labels positions
  const labelPositions = categories.map((cat, i) => {
    // Offset slightly outward for text labels
    const angle = (i * (2 * Math.PI / numCats)) - (Math.PI / 2);
    const distance = radius + 45;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    
    // Text anchor alignments based on angle position
    let textAnchor = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';

    // Vertical adjustment
    let dy = '0.35em';
    if (Math.sin(angle) < -0.8) dy = '-0.2em';
    if (Math.sin(angle) > 0.8) dy = '0.9em';

    return { name: cat.name, x, y, textAnchor, dy };
  });

  // Calculate polygon paths for each item
  const itemPolygons = items.map((item, itemIdx) => {
    const points = [];
    const itemScores = scores[item] || {};
    
    for (let i = 0; i < numCats; i++) {
      const catName = categories[i].name;
      // Safeguard for scores
      const scoreObj = itemScores[catName];
      const scoreVal = scoreObj ? (typeof scoreObj === 'number' ? scoreObj : scoreObj.score) : 50;
      const { x, y } = getCoordinates(i, scoreVal || 0);
      points.push(`${x},${y}`);
    }
    
    return {
      points: points.join(' '),
      colors: ITEM_COLORS[itemIdx % ITEM_COLORS.length]
    };
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[320px] md:max-w-[450px] aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Radial Grid lines (Web Axes) */}
          {categories.map((_, i) => {
            const outerCoord = getCoordinates(i, 100);
            return (
              <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={outerCoord.x}
                y2={outerCoord.y}
                className="stroke-white/10 stroke-[1]"
              />
            );
          })}

          {/* Web concentric polygons */}
          {gridPolygons.map((points, i) => (
            <polygon
              key={`grid-${i}`}
              points={points}
              className="fill-none stroke-white/5 stroke-[1]"
            />
          ))}

          {/* Render Item Areas */}
          {itemPolygons.map((poly, i) => (
            <polygon
              key={`poly-${i}`}
              points={poly.points}
              fill={poly.colors.fill}
              stroke={poly.colors.border}
              strokeWidth="2.5"
              className="transition-all duration-500 ease-out"
            />
          ))}

          {/* Render Item Points (Vertices) */}
          {items.map((item, itemIdx) => {
            const colors = ITEM_COLORS[itemIdx % ITEM_COLORS.length];
            const itemScores = scores[item] || {};
            return categories.map((cat, catIdx) => {
              const scoreObj = itemScores[cat.name];
              const scoreVal = scoreObj ? (typeof scoreObj === 'number' ? scoreObj : scoreObj.score) : 50;
              const { x, y } = getCoordinates(catIdx, scoreVal || 0);
              return (
                <circle
                  key={`point-${itemIdx}-${catIdx}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#fff"
                  stroke={colors.border}
                  strokeWidth="2"
                />
              );
            });
          })}

          {/* Category Text Labels */}
          {labelPositions.map((pos, i) => (
            <text
              key={`label-${i}`}
              x={pos.x}
              y={pos.y}
              textAnchor={pos.textAnchor}
              dy={pos.dy}
              className="fill-gray-400 font-medium text-[9px] md:text-[11px] tracking-tight uppercase"
            >
              {pos.name}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 px-2">
        {items.map((item, idx) => {
          const colors = ITEM_COLORS[idx % ITEM_COLORS.length];
          return (
            <div key={`legend-${idx}`} className="flex items-center gap-1.5 text-xs md:text-sm">
              <span className="w-2.5 h-2.5 rounded-full border" style={{ borderColor: colors.border, backgroundColor: colors.fill }} />
              <span className="font-semibold text-gray-200">{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function BarChart({ items, categories, scores }) {
  if (!items || items.length === 0 || !categories || categories.length === 0 || !scores) return null;

  return (
    <div className="w-full space-y-5 px-1">
      {categories.map((cat) => (
        <div key={cat.id} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {cat.name}
          </div>
          
          <div className="space-y-2.5">
            {items.map((item, itemIdx) => {
              const colors = ITEM_COLORS[itemIdx % ITEM_COLORS.length];
              const itemScores = scores[item] || {};
              const scoreObj = itemScores[cat.name];
              const scoreVal = scoreObj ? (typeof scoreObj === 'number' ? scoreObj : scoreObj.score) : 50;
              const reasonText = scoreObj && typeof scoreObj === 'object' ? scoreObj.reason : '';

              return (
                <div key={`${cat.id}-${item}`} className="space-y-0.5">
                  <div className="flex justify-between items-center text-xs md:text-sm">
                    <span className="font-medium text-gray-300">{item}</span>
                    <span className="font-bold font-mono" style={{ color: colors.border }}>
                      {scoreVal}/100
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${scoreVal}%`,
                        backgroundColor: colors.border,
                        boxShadow: `0 0 8px ${colors.border}60`
                      }}
                    />
                  </div>
                  
                  {reasonText && (
                    <p className="text-[10px] md:text-xs text-gray-500 leading-tight italic">
                      {reasonText}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
