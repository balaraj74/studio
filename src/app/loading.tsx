
'use client';

import { useState, useEffect } from 'react';
import { AgrisenceLogo } from '@/components/agrisence-logo';
import { Progress } from '@/components/ui/progress';

const loadingMessages = [
  '🌱 Analyzing Farm Data...',
  '🌾 Preparing AI Insights...',
  '☀️ Fetching Weather Updates...',
  '🚜 Optimizing Your Dashboard...',
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    const progressTimer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 95) {
          return prevProgress; // Stall near the end
        }
        return prevProgress + 5;
      });
    }, 500); // Increment progress every 0.5 seconds

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-b from-primary/20 via-yellow-500/10 to-sky-500/10 text-center">
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-card/80 backdrop-blur-lg shadow-2xl space-y-6 w-80">
        <div className="h-24 w-24">
            <AgrisenceLogo />
        </div>
        
        <div className="w-full text-center space-y-3">
          <p className="text-sm font-medium text-muted-foreground transition-opacity animate-in fade-in duration-500">
            {loadingMessages[messageIndex]}
          </p>
          <Progress value={progress} className="w-full h-2" />
        </div>
      </div>
    </div>
  );
}
