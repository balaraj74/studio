import * as React from 'react';
import { cn } from '@/lib/utils';

export const AgrisenceLogo = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-center', className)} {...props}>
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 512 512" 
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-auto"
      aria-label="AgriSence Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))' }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))' }} />
        </linearGradient>
        <clipPath id="a-clip">
          <path d="M269.9 112.5l-95.2 284.1h-44.3l-20.9-66.3h-0.7c-4.9 22.8-13.8 40-26.6 51.7s-29.3 17.5-49.3 17.5c-3.1 0-6.1-0.2-9-0.5l-4.1-32.9c3.1 0.5 6.1 0.8 8.8 0.8c12.2 0 22.8-4.5 31.7-13.4s13.4-21.2 13.4-36.8V112.5h48.1v170.1c0 14-2.8 25.1-8.5 33.4s-14.7 12.4-27.3 12.4c-12.2 0-22.1-3.6-29.6-10.9s-11.3-17.6-11.3-30.8V112.5h48.1v158.4c0 23.3 8.3 34.9 25 34.9c16.3 0 24.4-11.6 24.4-34.9V112.5h41.6zm170.8 284.1h-44.3L301.2 112.5h42.9l51.9 174.1h0.7l51.2-174.1h42.9L440.7 396.6z" />
        </clipPath>
      </defs>
      <rect width="512" height="512" rx="100" fill="url(#logoGradient)" />
      <g clipPath="url(#a-clip)">
        <rect width="512" height="512" fill="hsl(var(--background))" />
      </g>
      <path 
        fill="hsl(var(--primary))"
        d="M327.3 270.8c-10.4-31.3-19.3-58.2-26.8-80.9h-0.7c-7.5 22.7-16.4 49.6-26.8 80.9l-28.7 86.2h41.9l12.7-39.2h50.5l12.7 39.2h41.9l-26.7-86.2zm-42.6-23.8c4.6-14.2 8.5-27.4 11.6-39.5h0.7c3.1 12.1 7 25.3 11.6 39.5l7.7 23.4h-39.2l7.6-23.4z"
      />
    </svg>
  </div>
);
