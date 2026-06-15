import React from 'react';

export default function FrequencyBars({ className = '' }) {
  return (
    <div className={`flex items-end gap-[3px] h-4 ${className}`}>
      <div className="w-1.5 bg-[#06b6d4] rounded-t-sm animate-equalizer" style={{ animationDelay: '0.0s', animationDuration: '0.6s' }}></div>
      <div className="w-1.5 bg-[#7c3aed] rounded-t-sm animate-equalizer" style={{ animationDelay: '0.2s', animationDuration: '0.9s' }}></div>
      <div className="w-1.5 bg-[#06b6d4] rounded-t-sm animate-equalizer" style={{ animationDelay: '0.4s', animationDuration: '1.2s' }}></div>
    </div>
  );
}
