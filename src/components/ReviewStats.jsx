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
  // We use a radius of 100, which makes circumference C = 2 * PI * 100 = ~628.32
  // A semicircle length is C / 2 = 314.16.
  const radius = 100;
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
        cx="120"
        cy="120"
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth="24"
        strokeLinecap="butt"
        strokeDasharray={`${length} ${circumference - length}`}
        strokeDashoffset={-offset}
        className="transition-all duration-1000 ease-out"
      />
    );
  };

  return (
    <div className="flex flex-col items-center mb-12">
      {/* Donut Chart */}
      <div className="relative w-[240px] h-[120px] overflow-hidden mb-8">
        <svg 
          width="240" 
          height="240" 
          viewBox="0 0 240 240"
          className="absolute top-0 left-0"
          style={{ transform: 'rotate(180deg)' }} // Rotate so drawing starts from left (9 o'clock)
        >
          {/* Background track */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="transparent"
            stroke="#1f2937"
            strokeWidth="24"
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
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-2">
          <div 
            className="text-5xl font-bold mb-1"
            style={{ color: colors[highestCat] }}
          >
            {percentages[highestCat]}%
          </div>
          <div className="text-[#9ca3af] text-sm">
            {highestCount}/{total} Votes
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 text-sm font-medium border-b border-white/5 pb-8 w-full max-w-2xl">
        {['skip', 'decent', 'fire', 'banger'].map((key) => (
          <div key={key} className="flex items-center gap-2">
            <span 
              className="w-3 h-3 rounded-full" 
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
