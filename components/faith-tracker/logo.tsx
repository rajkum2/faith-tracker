"use client";

import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const sizeMap = {
    sm: { svg: 28, text: 'text-sm' },
    md: { svg: 36, text: 'text-lg' },
    lg: { svg: 48, text: 'text-xl' },
  };
  
  const { svg, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo SVG */}
      <svg 
        width={svg} 
        height={svg} 
        viewBox="0 0 100 100" 
        className="flex-shrink-0"
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="#1E40AF"/>
        
        {/* Inner circle */}
        <circle cx="50" cy="50" r="42" fill="#ffffff"/>
        
        {/* Map pin shape */}
        <path 
          d="M50 25 C38 25 28 35 28 47 C28 60 50 78 50 78 C50 78 72 60 72 47 C72 35 62 25 50 25" 
          fill="#1E40AF"
        />
        
        {/* Inner circle for faith symbol */}
        <circle cx="50" cy="47" r="12" fill="#ffffff"/>
        
        {/* Om symbol */}
        <path 
          d="M45 42 Q43 42 43 44 Q43 46 45 46 L48 46 Q50 46 50 48 Q50 50 48 50 L45 50 Q43 50 43 52 Q43 54 45 54 L50 54 L52 56 M50 50 L52 52 L52 54" 
          stroke="#1E40AF" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Text */}
      {showText && (
        <span className={`font-semibold text-slate-900 ${text}`}>
          Faith Tracker
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
    >
      <circle cx="50" cy="50" r="48" fill="#1E40AF"/>
      <circle cx="50" cy="50" r="42" fill="#ffffff"/>
      <path 
        d="M50 25 C38 25 28 35 28 47 C28 60 50 78 50 78 C50 78 72 60 72 47 C72 35 62 25 50 25" 
        fill="#1E40AF"
      />
      <circle cx="50" cy="47" r="12" fill="#ffffff"/>
      <path 
        d="M45 42 Q43 42 43 44 Q43 46 45 46 L48 46 Q50 46 50 48 Q50 50 48 50 L45 50 Q43 50 43 52 Q43 54 45 54 L50 54 L52 56 M50 50 L52 52 L52 54" 
        stroke="#1E40AF" 
        strokeWidth="2.5" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}
