import React from 'react';
import { motion } from 'framer-motion';
import type{ Difficulty, Opponent } from '../types';
import { XIcon, OIcon } from './Icons';

interface StartScreenProps {
  onStart: (opponent: Opponent, difficulty?: Difficulty) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md z-20">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 rounded-3xl shadow-2xl"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
           <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">NEW GAME</h2>
           <p className="text-zinc-500">Select a game mode to begin</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-4">
          <button 
            onClick={() => onStart('HUMAN')}
            className="group w-full relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl border border-zinc-700 transition-all active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-center justify-between relative z-10">
              <span className="font-bold text-zinc-100 text-lg">Play vs Friend</span>
              <div className="flex -space-x-2">
                 <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center text-orange-500"><XIcon className="w-4 h-4"/></div>
                 <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-600 flex items-center justify-center text-emerald-500"><OIcon className="w-4 h-4"/></div>
              </div>
            </div>
          </button>

          <div className="h-px bg-zinc-800 my-4" />

          <div className="space-y-3">
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Play vs Bot</p>
             {(['EASY', 'MEDIUM', 'HARD', 'IMPOSSIBLE'] as Difficulty[]).map((diff) => (
               <button
                 key={diff}
                 onClick={() => onStart('BOT', diff)}
                 className={`
                   w-full p-3 rounded-xl border border-zinc-800 font-bold text-sm tracking-wide transition-all active:scale-95 flex items-center justify-between
                   ${diff === 'EASY' ? 'bg-zinc-900 text-emerald-400 hover:bg-emerald-950/30 hover:border-emerald-500/30' : ''}
                   ${diff === 'MEDIUM' ? 'bg-zinc-900 text-yellow-400 hover:bg-yellow-950/30 hover:border-yellow-500/30' : ''}
                   ${diff === 'HARD' ? 'bg-zinc-900 text-orange-400 hover:bg-orange-950/30 hover:border-orange-500/30' : ''}
                   ${diff === 'IMPOSSIBLE' ? 'bg-zinc-950 text-red-500 border-red-900/20 hover:bg-red-950/30 hover:border-red-500/50 shadow-[0_0_15px_-5px_rgba(220,38,38,0.2)]' : ''}
                 `}
               >
                 <span>{diff}</span>
                 {diff === 'IMPOSSIBLE' && <span className="text-xs px-2 py-0.5 rounded bg-red-900/50 text-red-200">AI</span>}
               </button>
             ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default StartScreen;
