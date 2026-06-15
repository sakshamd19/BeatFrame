import React from 'react';

export default function GlowBadge({ rating, className = '' }) {
  const getBadgeStyle = () => {
    switch(rating) {
      case 'Banger':
        return {
          bg: 'bg-[#4c1d95]/80',
          text: 'text-[#a855f7]',
          glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
          icon: '🔥',
          label: 'BANGER'
        };
      case 'Fire':
        return {
          bg: 'bg-[#431407]/80',
          text: 'text-[#f97316]',
          glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
          icon: '⚡',
          label: 'FIRE'
        };
      case 'Decent':
        return {
          bg: 'bg-[#083344]/80',
          text: 'text-[#06b6d4]',
          glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
          icon: '👌',
          label: 'DECENT'
        };
      case 'Skip':
        return {
          bg: 'bg-[#1e293b]/80',
          text: 'text-[#94a3b8]',
          glow: 'shadow-[0_0_8px_rgba(71,85,105,0.4)]',
          icon: '⏭️',
          label: 'SKIP'
        };
      default:
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
