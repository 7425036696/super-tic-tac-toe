import React from 'react';
import { motion } from 'framer-motion';

interface IconProps {
  className?: string;
  strokeWidth?: number;
  duration?: number;
}

export const XIcon: React.FC<IconProps> = ({ className, strokeWidth = 3, duration = 0.4 }) => (
  <motion.svg 
    initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
    animate={{ pathLength: 1, opacity: 1, scale: 1 }}
    transition={{ duration: duration, ease: "backOut" }}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ filter: "drop-shadow(0px 0px 4px currentColor)" }}
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </motion.svg>
);

export const OIcon: React.FC<IconProps> = ({ className, strokeWidth = 3, duration = 0.4 }) => (
  <motion.svg 
    initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
    animate={{ pathLength: 1, opacity: 1, scale: 1 }}
    transition={{ duration: duration, ease: "backOut" }}
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    style={{ filter: "drop-shadow(0px 0px 4px currentColor)" }}
  >
    <circle cx="12" cy="12" r="10"></circle>
  </motion.svg>
);

export const RefreshCw: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2.5" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
    <path d="M21 3v5h-5"></path>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
    <path d="M8 16H3v5"></path>
  </svg>
);

export const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2.5" 
    strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 16v-4"></path>
    <path d="M12 8h.01"></path>
  </svg>
);