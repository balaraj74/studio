
'use client';

import { useState, useEffect } from 'react';
import { AgrisenceLogo } from '@/components/agrisence-logo';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf } from 'lucide-react';

const loadingMessages = [
  '🌱 Analyzing Farm Data...',
  '🌾 Preparing AI Insights...',
  '☀️ Fetching Weather Updates...',
  '🚜 Optimizing Your Dashboard...',
];

export default function Loading() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2000);

    const progressTimer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prevProgress + 4;
      });
    }, 100);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const LeafMilestone = ({ milestone, progress }: { milestone: number, progress: number }) => (
    <AnimatePresence>
        {progress >= milestone && (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
                className="absolute -right-3"
                style={{ bottom: `${milestone - 5}%` }}
            >
                <Leaf className="h-4 w-4 text-primary fill-primary/50" />
            </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-accent/5 to-sky-500/10 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/farmer.png')] opacity-5"></div>
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center p-8 rounded-3xl space-y-8"
        >
            <motion.div
                key="logo"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.2,
                }}
            >
                <div className="h-24 w-24 p-4 bg-card/80 backdrop-blur-lg rounded-full shadow-2xl shadow-black/20">
                    <AgrisenceLogo />
                </div>
            </motion.div>
            
            <div className="w-full text-center space-y-4">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="text-sm font-medium text-muted-foreground"
                    >
                        {loadingMessages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
                <div className="relative h-24 w-1 mx-auto">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-1 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="absolute bottom-0 w-full bg-primary"
                            initial={{ height: '0%' }}
                            animate={{ height: `${progress}%` }}
                            transition={{ duration: 0.1, ease: 'linear' }}
                        />
                    </div>
                     <LeafMilestone milestone={25} progress={progress} />
                     <LeafMilestone milestone={50} progress={progress} />
                     <LeafMilestone milestone={75} progress={progress} />
                </div>
            </div>
        </motion.div>
    </div>
  );
}
