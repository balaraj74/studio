import * as React from 'react';
import { cn } from '@/lib/utils';

export const AgrisenceLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto"
      aria-label="AgriSence Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
      </defs>
      
      {/* Main leaf/shield shape */}
      <path 
        d="M50 0 C15 20 15 80 50 100 C85 80 85 20 50 0 Z" 
        fill="url(#logoGradient)" 
      />
      
      {/* Tech-style veins */}
      <g stroke="hsl(var(--background))" strokeWidth="2.5" strokeLinecap="round" fill="none">
        {/* Main stem */}
        <path d="M50 95 V 50" />
        
        {/* Branching veins */}
        <path d="M50 75 L30 65" />
        <path d="M50 75 L70 65" />
        <path d="M50 60 L35 52" />
        <path d="M50 60 L65 52" />
      </g>
      
      {/* AI Node/Sensor dot */}
      <circle cx="50" cy="40" r="6" fill="hsl(var(--background))" />
      <circle cx="50" cy="40" r="3" fill="url(#logoGradient)" />
      
    </svg>
  </div>
);
