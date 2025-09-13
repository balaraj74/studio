'use client';

import { motion } from 'framer-motion';
import { AgrisenceLogo } from '@/components/agrisence-logo';

// Keyframes for the sprout animation are in globals.css
const SproutAnimation = () => (
  <div className="relative w-24 h-24">
    {/* Stem */}
    <motion.div
      className="absolute bottom-0 left-1/2 w-1.5 h-full bg-primary rounded-t-full origin-bottom"
      initial={{ height: 0 }}
      animate={{ height: '100%' }}
      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
    />
    {/* Left Leaf */}
    <motion.div
      className="absolute top-1/2 left-1/2 w-10 h-10 bg-accent rounded-full origin-bottom-left"
      initial={{ scale: 0, rotate: 45 }}
      animate={{ scale: 1, rotate: 45 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}
      style={{
        clipPath: 'ellipse(50% 50% at 0% 100%)',
        marginLeft: '-2px',
        marginTop: '-20px',
      }}
    />
    {/* Right Leaf */}
    <motion.div
      className="absolute top-1/2 left-1/2 w-10 h-10 bg-accent rounded-full origin-bottom-right"
      initial={{ scale: 0, rotate: -45 }}
      animate={{ scale: 1, rotate: -45 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 1 }}
      style={{
        clipPath: 'ellipse(50% 50% at 100% 100%)',
        marginLeft: '-38px',
        marginTop: '-20px',
      }}
    />
  </div>
);

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-32 h-32">
          <AgrisenceLogo />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AgriSence
        </h1>
        <p className="text-lg text-muted-foreground">
          Your AI Farming Partner
        </p>
      </motion.div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
