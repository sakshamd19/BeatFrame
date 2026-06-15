import React from 'react';

export default function HeroOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Deep Violet Orb */}
      <div 
        className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full mix-blend-screen opacity-20 blur-[120px] animate-float"
        style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', animationDelay: '0s' }}
      ></div>
      
      {/* Electric Cyan Orb */}
      <div 
        className="absolute top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full mix-blend-screen opacity-15 blur-[100px] animate-float"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', animationDelay: '-4s' }}
      ></div>
      
      {/* Subtle bottom orb */}
      <div 
        className="absolute -bottom-1/2 left-1/4 w-[1000px] h-[600px] rounded-full mix-blend-screen opacity-10 blur-[150px] animate-float"
        style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)', animationDelay: '-2s' }}
      ></div>
    </div>
  );
}
