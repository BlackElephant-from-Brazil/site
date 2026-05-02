'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export function ParallaxContainer({
  children,
  className = '',
  speed = 0.5,
  direction = 'up',
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const multiplier = direction === 'up' ? -1 : 1;
  const y = useTransform(scrollYProgress, [0, 1], [100 * speed * multiplier, -100 * speed * multiplier]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// Parallax for background elements
interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
  yOffset?: [number, number];
  opacity?: [number, number];
}

export function ParallaxBackground({
  children,
  className = '',
  yOffset = [0, -100],
  opacity = [1, 0.5],
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], yOffset);
  const opacityValue = useTransform(scrollYProgress, [0, 1], opacity);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y, opacity: opacityValue }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Floating animation for decorative elements
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
  delay?: number;
}

export function FloatingElement({
  children,
  className = '',
  duration = 3,
  distance = 10,
  delay = 0,
}: FloatingElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-distance, distance, -distance],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// Glow pulse animation
interface GlowPulseProps {
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
}

export function GlowPulse({
  children,
  className = '',
  color = 'var(--color-lime)',
  duration = 2,
}: GlowPulseProps) {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 20px ${color}40`,
          `0 0 40px ${color}60`,
          `0 0 20px ${color}40`,
        ],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
}
