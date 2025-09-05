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
      </defs>
      <path 
        fill="url(#logoGradient)" 
        d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm-28.7 352.6c-4.3 0-8.5-1.7-11.8-4.9-6.5-6.5-6.5-17 0-23.5l86.2-86.2c6.5-6.5 17-6.5 23.5 0s6.5 17 0 23.5l-86.2 86.2c-3.3 3.2-7.5 4.9-11.8 4.9zM342.6 256c-13.2 0-24-10.8-24-24s10.8-24 24-24 24 10.8 24 24-10.8 24-24 24zm-86.6 0c-13.2 0-24-10.8-24-24s10.8-24 24-24 24 10.8 24 24-10.8 24-24 24zm-86.6 0c-13.2 0-24-10.8-24-24s10.8-24 24-24 24 10.8 24 24-10.8 24-24 24z"
      />
    </svg>
  </div>
);
