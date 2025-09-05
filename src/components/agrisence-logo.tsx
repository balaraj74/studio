import * as React from 'react';
import { cn } from '@/lib/utils';

export const AgrisenceLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 80 80" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AgriSence Logo"
    >
      <defs>
        <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#5CB85C' }} />
          <stop offset="100%" style={{ stopColor: '#4CAE4C' }} />
        </linearGradient>
        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#337AB7' }} />
          <stop offset="100%" style={{ stopColor: '#286090' }} />
        </linearGradient>
         <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
            <feOffset dx="1" dy="1" result="offsetblur"/>
            <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
      </defs>

      <g style={{ filter: 'url(#dropShadow)' }}>
        {/* Blue Circuit Base */}
        <path 
          d="M25,75 C25,65 30,60 40,60 C50,60 55,65 55,75 L55,70 C50,70 50,65 52,62 L60,55 C65,50 70,52 70,58 C70,64 65,66 60,61 L58,59 M25,70 C30,70 30,65 28,62 L20,55 C15,50 10,52 10,58 C10,64 15,66 20,61 L22,59"
          stroke="url(#circuitGradient)" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
        <circle cx="70" cy="58" r="4.5" fill="url(#circuitGradient)" />
        <circle cx="10" cy="58" r="4.5" fill="url(#circuitGradient)" />
        
        {/* Plant Stem */}
        <path 
          d="M40,60 V25" 
          stroke="url(#leafGradient)" 
          strokeWidth="5" 
          strokeLinecap="round" 
          fill="none" 
        />

        {/* Leaves */}
        <path 
          d="M40,45 C30,35 30,20 42,15 C45,25 50,30 40,45 Z"
          fill="url(#leafGradient)"
        />
        <path 
          d="M40,35 C50,25 50,10 38,5 C35,15 30,20 40,35 Z"
          fill="url(#leafGradient)"
        />
        
        {/* Orange Dot */}
        <circle cx="65" cy="22" r="5" fill="#F0AD4E" />
      </g>
    </svg>
  </div>
);
