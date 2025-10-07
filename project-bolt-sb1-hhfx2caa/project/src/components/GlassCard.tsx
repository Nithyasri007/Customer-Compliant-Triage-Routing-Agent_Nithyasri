import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hover = true,
  delay = 0
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={`
        backdrop-blur-xl rounded-2xl border transition-all duration-300
        bg-white/10 dark:bg-slate-800/70
        border-white/20 dark:border-slate-700/50
        shadow-lg dark:shadow-black/30
        ${hover ? 'hover:shadow-xl dark:hover:shadow-black/50 hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
