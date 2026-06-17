import React from 'react';

export default function GlowBadge({ rating, className = '' }) {
  const getBadgeStyle = () => {
    const r = (rating || '').toLowerCase();
    
    // Map both old DB values and new ones to the new UI
    if (r === 'banger' || r === 'perfection') {
      return {
        bg: 'bg-[#4c1d95]/80',
        text: 'text-[#a855f7]',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
        icon: '✨',
        label: 'PERFECTION'
      };
    } else if (r === 'fire' || r === 'go_for_it') {
      return {
        bg: 'bg-[#064e3b]/80', // dark green bg
        text: 'text-[#10b981]', // emerald-500
        glow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
        icon: '🔥',
        label: 'GO FOR IT'
      };
    } else if (r === 'decent' || r === 'timepass') {
      return {
        bg: 'bg-[#422006]/80', // dark yellow bg
        text: 'text-[#eab308]', // yellow-500
        glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]',
        icon: '⏳',
        label: 'TIMEPASS'
      };
    } else if (r === 'skip') {
      return {
        bg: 'bg-[#450a0a]/80', // dark red bg
        text: 'text-[#ef4444]', // red-500
        glow: 'shadow-[0_0_12px_rgba(239,68,68,0.4)]',
        icon: '⏭️',
        label: 'SKIP'
      };
    } else {
      return {
        bg: 'bg-surface2',
        text: 'text-white',
        glow: '',
        icon: '•',
        label: rating || 'UNKNOWN'
      };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${style.bg} ${style.text} ${style.glow} hover:animate-pulse-glow transition-all ${className}`}>
      <span>{style.icon}</span>
      <span>{style.label}</span>
    </div>
  );
}
