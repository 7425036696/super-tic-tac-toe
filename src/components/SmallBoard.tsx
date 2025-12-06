import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type{ CellValue, BoardWinner, Player } from '../types';
import { XIcon, OIcon } from './Icons';
import { checkWinner } from '../constants';

interface SmallBoardProps {
  id: number;
  cells: CellValue[];
  status: BoardWinner;
  isActive: boolean;
  isValidTarget: boolean;
  onCellClick: (boardIndex: number, cellIndex: number) => void;
  currentPlayer: Player;
}

const SmallBoard: React.FC<SmallBoardProps> = ({
  id,
  cells,
  status,
  isValidTarget,
  onCellClick,
  currentPlayer,
}) => {
  
  // Calculate local winner line for visualization
  const { line } = useMemo(() => checkWinner(cells), [cells]);

  // Visual state logic
  const isPlayable = isValidTarget && !status;
  
  // Dynamic glow effect for the active board
  const activeGlow = isPlayable
    ? currentPlayer === 'X'
      ? 'shadow-[0_0_20px_-5px_rgba(249,115,22,0.5)] border-orange-500/50'
      : 'shadow-[0_0_20px_-5px_rgba(52,211,153,0.5)] border-emerald-500/50'
    : 'border-transparent shadow-none';

  const opacityClass = !isValidTarget && !status ? 'opacity-40 grayscale-[0.5] scale-95' : 'opacity-100 scale-100';
  
  // Background tint when won
  const wonBg = status === 'X' ? 'bg-orange-950/30' : status === 'O' ? 'bg-emerald-950/30' : 'bg-zinc-800';

  const getLineCoords = (lineIndices: number[]) => {
    const startIdx = lineIndices[0];
    const endIdx = lineIndices[2];
    
    const getXY = (i: number) => ({ x: (i % 3) * 33.33 + 16.66, y: Math.floor(i / 3) * 33.33 + 16.66 });
    const start = getXY(startIdx);
    const end = getXY(endIdx);

    return { x1: `${start.x}%`, y1: `${start.y}%`, x2: `${end.x}%`, y2: `${end.y}%` };
  };

  const lineCoords = line ? getLineCoords(line) : null;

  return (
    <motion.div 
      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${wonBg} ${activeGlow} ${opacityClass}`}
      layout
    >
      {/* 
        Grid Setup: 
        grid-cols-3 AND grid-rows-3 ensures perfect 3x3 equal squares.
        bg-zinc-800 acts as the "border lines" color.
        gap-[2px] creates the thickness of the lines.
      */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[2px] bg-zinc-800/50 p-[2px]">
        {cells.map((cell, idx) => {
          const cellIsPlayable = !cell && isPlayable;
          
          return (
            <motion.button
              key={idx}
              disabled={!cellIsPlayable}
              onClick={() => onCellClick(id, idx)}
              whileHover={cellIsPlayable ? { backgroundColor: '#27272a' } : {}} // zinc-800
              whileTap={cellIsPlayable ? { scale: 0.9 } : {}}
              className={`
                relative w-full h-full flex items-center justify-center
                ${cellIsPlayable ? 'bg-zinc-900 cursor-pointer' : 'bg-zinc-925 cursor-default'}
                transition-colors duration-200
              `}
              style={{ backgroundColor: cellIsPlayable ? '#18181b' : '#09090b' }}
            >
              <AnimatePresence>
                {cell === 'X' && <XIcon className="w-2/3 h-2/3 text-orange-500" />}
                {cell === 'O' && <OIcon className="w-2/3 h-2/3 text-emerald-400" />}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Winning Line Animation */}
      {status && lineCoords && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <motion.line
            x1={lineCoords.x1}
            y1={lineCoords.y1}
            x2={lineCoords.x2}
            y2={lineCoords.y2}
            stroke={status === 'X' ? '#f97316' : '#34d399'}
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
            filter={`drop-shadow(0 0 4px ${status === 'X' ? '#f97316' : '#34d399'})`}
          />
        </svg>
      )}

      {/* Overlay for Won State */}
      <AnimatePresence>
        {status && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px] ${status === 'D' ? 'bg-zinc-900/60' : 'bg-zinc-950/40'}`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              {status === 'X' && <XIcon className="w-20 h-20 text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.9)]" strokeWidth={4} />}
              {status === 'O' && <OIcon className="w-20 h-20 text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.9)]" strokeWidth={4} />}
              {status === 'D' && <span className="text-6xl font-black text-zinc-500 drop-shadow-lg">D</span>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SmallBoard;