import React from 'react';
import { Flame, Zap, ThumbsUp, SkipForward, Circle } from 'lucide-react';

export default function GlowBadge({ rating, className = '' }) {
  const getBadgeStyle = () => {
    const r = (rating || '').toLowerCase();
    
    if (r === 'banger') {
      return {
        bg: 'bg-[#4c1d95]/80',
        text: 'text-[#a855f7]',
        glow: 'shadow-[0_0_12px_rgba(168,85,247,0.4)]',
        Icon: Zap,
        label: 'BANGER'
      };
    } else if (r === 'fire') {
      return {
        bg: 'bg-[#431407]/80',
        text: 'text-[#f97316]',
        glow: 'shadow-[0_0_12px_rgba(249,115,22,0.4)]',
        Icon: Flame,
        label: 'FIRE'
      };
    } else if (r === 'decent') {
      return {
        bg: 'bg-[#083344]/80',
        text: 'text-[#06b6d4]',
        glow: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
        Icon: ThumbsUp,
        label: 'DECENT'
      };
    } else if (r === 'skip') {
      return {
        bg: 'bg-[#1e293b]/80',
        text: 'text-[#94a3b8]',
        glow: 'shadow-[0_0_8px_rgba(71,85,105,0.4)]',
        Icon: SkipForward,
        label: 'SKIP'
      };
    } else {
      return {
        bg: 'bg-surface2',
        text: 'text-white',
        glow: '',
        Icon: Circle,
        label: rating || 'UNKNOWN'
      };
    }
  };

  const style = getBadgeStyle();
  const Icon = style.Icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${style.bg} ${style.text} ${style.glow} hover:animate-pulse-glow transition-all ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{style.label}</span>
    </div>
  );
}
