'use client';

import { motion } from 'framer-motion';
import { AgrisenceLogo } from '@/components/agrisence-logo';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-32 h-32"
      >
        <AgrisenceLogo />
      </motion.div>
      <div className="relative w-1 h-32 mt-8 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-primary"
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
        />
      </div>
      <p className="mt-4 text-lg font-medium text-muted-foreground animate-pulse">
        Cultivating your dashboard...
      </p>
    </div>
  );
}
