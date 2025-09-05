import * as React from 'react';
import { cn } from '@/lib/utils';

export const AgrisenceLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 200 180" 
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto"
      aria-label="AgriSence Logo"
    >
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(120, 70%, 45%)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(180, 50%, 50%)' }} />
        </linearGradient>
        <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'hsl(50, 100%, 85%)' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(45, 100%, 60%)' }} />
        </radialGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="2" dy="4" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <g filter="url(#dropShadow)">
        {/* Main leaf shape */}
        <path 
          d="M100 10 C 40 30, 20 80, 50 120 C 60 110, 80 100, 100 95 C 160 80, 180 40, 150 15 C 140 25, 120 20, 100 10 Z"
          fill="url(#leafGradient)"
        />
        <path
          d="M150 15 C 180 40, 165 90, 140 110 L 130 100 C 145 85, 155 50, 150 15 Z"
          fill="hsl(195, 65%, 55%)"
        />

        {/* Sun and Hills */}
        <circle cx="100" cy="80" r="20" fill="url(#sunGradient)" />
        <path d="M75 90 C 85 75, 115 75, 125 90 L 120 100 C 110 85, 90 85, 80 100 Z" fill="hsl(120, 60%, 35%)" opacity="0.8" />
        <path d="M85 95 C 95 85, 105 85, 115 95 L 110 105 C 105 95, 95 95, 90 105 Z" fill="hsl(120, 60%, 40%)" opacity="0.9" />

        {/* Digital Pixels */}
        <rect x="145" y="25" width="10" height="10" rx="2" fill="hsl(205, 70%, 60%)" />
        <rect x="160" y="35" width="12" height="12" rx="2" fill="hsl(205, 70%, 60%)" />
        <rect x="155" y="50" width="8" height="8" rx="2" fill="hsl(205, 70%, 60%)" />
        <rect x="172" y="48" width="10" height="10" rx="2" fill="hsl(205, 70%, 60%)" />
        <rect x="165" y="62" width="7" height="7" rx="2" fill="hsl(205, 70%, 60%)" />
        <rect x="150" y="70" width="9" height="9" rx="2" fill="hsl(205, 70%, 60%)" />
      </g>
      
      {/* Text */}
      <text 
        x="100" 
        y="160" 
        fontFamily="var(--font-inter), sans-serif" 
        fontSize="36" 
        fontWeight="600"
        fill="hsl(220, 15%, 25%)"
        textAnchor="middle"
        letterSpacing="-1"
      >
        AgriSence
      </text>
    </svg>
  </div>
);