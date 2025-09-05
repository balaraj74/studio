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
      {/* Blue Circuit Base */}
      <path 
        d="M25,75 C25,65 30,60 40,60 C50,60 55,65 55,75 L55,70 C50,70 50,65 52,62 L60,55 C65,50 70,52 70,58 C70,64 65,66 60,61 L58,59 M25,70 C30,70 30,65 28,62 L20,55 C15,50 10,52 10,58 C10,64 15,66 20,61 L22,59"
        stroke="#337AB7" 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />
      <circle cx="70" cy="58" r="4.5" fill="#337AB7" />
      <circle cx="10" cy="58" r="4.5" fill="#337AB7" />
      
      {/* Plant Stem */}
      <path 
        d="M40,60 V25" 
        stroke="#5CB85C" 
        strokeWidth="5" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Leaves */}
      <path 
        d="M40,45 C30,35 30,20 42,15 C45,25 50,30 40,45 Z"
        fill="#5CB85C"
      />
      <path 
        d="M40,35 C50,25 50,10 38,5 C35,15 30,20 40,35 Z"
        fill="#5CB85C"
      />
      
      {/* Orange Dot */}
      <circle cx="65" cy="22" r="5" fill="#F0AD4E" />
    </svg>
  </div>
);
