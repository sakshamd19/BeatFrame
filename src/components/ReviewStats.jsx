import React from 'react';

export default function ReviewStats({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  const counts = {
    skip: reviews.filter(r => r.rating === 'skip').length,
    decent: reviews.filter(r => r.rating === 'decent').length,
    fire: reviews.filter(r => r.rating === 'fire').length,
    banger: reviews.filter(r => r.rating === 'banger').length,
  };

  const total = reviews.length;

  const percentages = {
    skip: Math.round((counts.skip / total) * 100),
    decent: Math.round((counts.decent / total) * 100),
    fire: Math.round((counts.fire / total) * 100),
    banger: Math.round((counts.banger / total) * 100),
  };

  // Find category with highest percentage for the center display
  let highestCat = 'banger';
  let highestCount = counts.banger;
  
  Object.keys(counts).forEach(key => {
    if (counts[key] > highestCount) {
      highestCount = counts[key];
      highestCat = key;
    }
  });

  const colors = {
    skip: '#6b7280',     // Gray
    decent: '#3b82f6',   // Blue
    fire: '#f97316',     // Orange
    banger: '#8b5cf6'    // Purple
  };

  const labels = {
    skip: 'Skip',
    decent: 'Decent',
    fire: 'Fire',
    banger: 'Banger'
  };

  // SVG calculations for a semicircular donut (top half of circle)
  // We use a radius of 70, which makes circumference C = 2 * PI * 70 = ~439.82
  // A semicircle length is C / 2 = 219.91.
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const semiCircumference = circumference / 2;

  // Calculate the stroke dash offset for each segment to layer them.
  // The first segment starts at offset 0 (which is actually semiCircumference to hide bottom half).
  // We draw them sequentially.
  
  // Convert counts to lengths on the semicircle
  const lengths = {
    skip: (counts.skip / total) * semiCircumference,
    decent: (counts.decent / total) * semiCircumference,
    fire: (counts.fire / total) * semiCircumference,
    banger: (counts.banger / total) * semiCircumference,
  };

  // Calculate offsets. 
  // SVG stroke-dasharray starts from the right (3 o'clock) and goes clockwise.
  // To draw a semicircle from left to right (9 o'clock to 3 o'clock), 
  // we rotate the circle -180 degrees.
  const offsetSkip = 0;
  const offsetDecent = lengths.skip;
  const offsetFire = offsetDecent + lengths.decent;
  const offsetBanger = offsetFire + lengths.fire;

  const createSegment = (color, length, offset) => {
    if (length === 0) return null;
    return (
      <circle
        cx="90"
        cy="90"
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="butt"
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        className="transition-all duration-1000 ease-out"
      />
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8 w-full border-b border-white/5 pb-8">
      {/* Donut Chart */}
      <div className="relative w-[180px] h-[90px] overflow-hidden flex-shrink-0">
        <svg 
          width="180" 
          height="180" 
          viewBox="0 0 180 180"
          className="absolute top-0 left-0"
          style={{ transform: 'rotate(180deg)' }} // Rotate so drawing starts from left (9 o'clock)
        >
          {/* Background track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="transparent"
            stroke="#1f2937"
            strokeWidth="12"
            strokeDasharray={`${semiCircumference} ${circumference}`}
            strokeDashoffset="0"
          />
          {/* Segments */}
          {createSegment(colors.skip, lengths.skip, offsetSkip)}
          {createSegment(colors.decent, lengths.decent, offsetDecent)}
          {createSegment(colors.fire, lengths.fire, offsetFire)}
          {createSegment(colors.banger, lengths.banger, offsetBanger)}
        </svg>

        {/* Center Text */}
        <div className="absolute bottom-1 left-0 right-0 flex flex-col items-center pb-1">
          <div 
            className="text-3xl font-semibold mb-0 tracking-tight"
            style={{ color: colors[highestCat] }}
          >
            {percentages[highestCat]}%
          </div>
          <div className="text-[#9ca3af] text-[10px] font-medium">
            {highestCount}/{total} Votes
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center md:justify-end gap-3 sm:gap-4 text-xs font-medium w-full">
        {['skip', 'decent', 'fire', 'banger'].map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: colors[key] }}
            />
            <span className="text-[#9ca3af]">{labels[key]}</span>
            <span className="text-white ml-1">{percentages[key] || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
