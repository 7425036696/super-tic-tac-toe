import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type{ GameState, Difficulty, Opponent } from './types';
import { checkWinner } from './constants';
import SmallBoard from './components/SmallBoard';
import StartScreen from './components/StartScreen';
import { XIcon, OIcon, RefreshCw, InfoIcon } from './components/Icons';
import { useSound } from './hooks/useSound';
import { getBotMove } from './utils/bot';

const INITIAL_STATE: GameState = {
  boards: Array(9).fill(null).map(() => Array(9).fill(null)),
  macroBoard: Array(9).fill(null),
  currentPlayer: 'X',
  activeBoardIndex: null,
  winner: null,
  winningLine: null,
  history: [],
};

const App: React.FC = () => {
  // Game Setup State
  const [gameStarted, setGameStarted] = useState(false);
  const [opponent, setOpponent] = useState<Opponent>('HUMAN');
  const [botDifficulty, setBotDifficulty] = useState<Difficulty>('MEDIUM');

  // Game Play State
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [showRules, setShowRules] = useState(false);
  
  const { playMove, playBoardWin, playGameWin, playError } = useSound();

  const handleStartGame = (opp: Opponent, diff?: Difficulty) => {
    setOpponent(opp);
    if (diff) setBotDifficulty(diff);
    setGameStarted(true);
    resetGame();
  };

  const returnToMenu = () => {
    setGameStarted(false);
    setGameState(INITIAL_STATE);
  };

  const handleCellClick = useCallback((boardIndex: number, cellIndex: number) => {
    // If it's bot's turn and playing against bot, ignore click
    if (opponent === 'BOT' && gameState.currentPlayer === 'O' && !gameState.winner) return;

    processMove(boardIndex, cellIndex);
  }, [gameState, opponent]);

  const processMove = (boardIndex: number, cellIndex: number) => {
    setGameState(prev => {
        // Validation handled inside setState to ensure latest state access
        // (Though React batches, this is safe pattern)
        if (prev.winner) return prev;
        
        // Validate Move
        if (prev.activeBoardIndex !== null && prev.activeBoardIndex !== boardIndex) {
            playError();
            return prev;
        }
        if (prev.macroBoard[boardIndex]) {
            playError();
            return prev;
        }
        if (prev.boards[boardIndex][cellIndex]) {
            playError();
            return prev;
        }

        // Apply Move
        const newBoards = prev.boards.map((board, bIdx) => 
            bIdx === boardIndex 
            ? board.map((cell, cIdx) => cIdx === cellIndex ? prev.currentPlayer : cell)
            : board
        );

        // Sound
        playMove(prev.currentPlayer);

        // Check Small Win
        const newMacroBoard = [...prev.macroBoard];
        const smallBoardCheck = checkWinner(newBoards[boardIndex]);
        if (smallBoardCheck.winner) {
            newMacroBoard[boardIndex] = smallBoardCheck.winner;
            playBoardWin(smallBoardCheck.winner);
        }

        // Check Global Win
        const macroCheck = checkWinner(newMacroBoard);
        let nextActiveBoard: number | null = cellIndex;
        
        // If target board is full or won, next player can play anywhere
        if (newMacroBoard[nextActiveBoard]) {
            nextActiveBoard = null;
        } else {
             // Edge case: Board not won, but full (Draw)
             const isTargetFull = newBoards[nextActiveBoard].every(c => c !== null);
             if (isTargetFull) nextActiveBoard = null;
        }

        // Check Draw
        if (!macroCheck.winner && newMacroBoard.every(b => b !== null)) {
            macroCheck.winner = 'D';
        }

        if (macroCheck.winner) {
            playGameWin();
        }

        return {
            ...prev,
            boards: newBoards,
            macroBoard: newMacroBoard,
            currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
            activeBoardIndex: macroCheck.winner ? null : nextActiveBoard,
            winner: macroCheck.winner,
            winningLine: macroCheck.line,
            history: [...prev.history, { 
                boards: prev.boards,
                macroBoard: prev.macroBoard,
                currentPlayer: prev.currentPlayer,
                activeBoardIndex: prev.activeBoardIndex
            }]
        };
    });
  };

  // Bot Logic Effect
  useEffect(() => {
    if (!gameStarted || opponent !== 'BOT' || gameState.winner || gameState.currentPlayer !== 'O') return;

    // Small delay for realism
    const timer = setTimeout(() => {
       const move = getBotMove(gameState, botDifficulty);
       processMove(move.boardIndex, move.cellIndex);
    }, 600);

    return () => clearTimeout(timer);
  }, [gameState.currentPlayer, gameStarted, opponent, gameState.winner]);

  const resetGame = () => {
    setGameState(INITIAL_STATE);
    playMove('X'); 
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4 font-sans select-none overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-orange-600/5 blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-600/5 blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-lg flex items-center justify-between mb-8 z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic cursor-pointer" onClick={returnToMenu}>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-orange-600 drop-shadow-sm">SUPER</span>
            <span className="text-zinc-700 mx-2">/</span>
            <span className="text-white">TACTOE</span>
          </h1>
        </div>
        
        {gameStarted && (
            <div className="flex gap-3">
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowRules(!showRules)}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                aria-label="Rules"
            >
                <InfoIcon />
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.5 }}
                onClick={resetGame}
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
                aria-label="Reset Game"
            >
                <RefreshCw />
            </motion.button>
            </div>
        )}
      </header>

      <AnimatePresence mode="wait">
        {!gameStarted ? (
            <StartScreen onStart={handleStartGame} key="start-screen" />
        ) : (
            <motion.div 
              key="game-board"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full flex flex-col items-center"
            >
                {/* Rules Modal */}
                <AnimatePresence>
                    {showRules && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-lg overflow-hidden mb-6 z-10"
                    >
                        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
                        <h3 className="text-lg font-bold text-white mb-3">How to Play</h3>
                        <ul className="text-sm text-zinc-400 space-y-2 list-disc list-inside marker:text-orange-500">
                            <li>Win 3 small boards in a row to win the match.</li>
                            <li>Where you play in a small board determines where your opponent plays next.</li>
                            <li><strong className="text-white">Top Right</strong> cell sends opponent to <strong className="text-white">Top Right</strong> board.</li>
                            <li>If a board is won/full, you gain a <strong className="text-orange-400">Free Move</strong>.</li>
                        </ul>
                        </div>
                    </motion.div>
                    )}
                </AnimatePresence>

                {/* Status Bar */}
                <div className="w-full max-w-lg grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-8 z-10">
                    
                    {/* Player X Status */}
                    <motion.div 
                    animate={{ 
                        opacity: gameState.currentPlayer === 'X' ? 1 : 0.4,
                        scale: gameState.currentPlayer === 'X' ? 1.05 : 0.95,
                        borderColor: gameState.currentPlayer === 'X' ? 'rgba(249,115,22,0.3)' : 'transparent'
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all border ${gameState.currentPlayer === 'X' ? 'bg-orange-500/10 shadow-[0_0_15px_-5px_rgba(249,115,22,0.3)]' : ''}`}
                    >
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <XIcon className="text-orange-500 w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">You</span>
                        <span className="text-lg font-black text-orange-500">TURN</span>
                    </div>
                    </motion.div>
                    
                    <div className="h-10 w-[2px] bg-zinc-800 rounded-full"></div>

                    {/* Player O Status */}
                    <motion.div 
                    animate={{ 
                        opacity: gameState.currentPlayer === 'O' ? 1 : 0.4,
                        scale: gameState.currentPlayer === 'O' ? 1.05 : 0.95,
                        borderColor: gameState.currentPlayer === 'O' ? 'rgba(52,211,153,0.3)' : 'transparent'
                    }}
                    className={`flex flex-row-reverse items-center gap-3 p-2 rounded-xl transition-all border ${gameState.currentPlayer === 'O' ? 'bg-emerald-500/10 shadow-[0_0_15px_-5px_rgba(52,211,153,0.3)]' : ''}`}
                    >
                    <div className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <OIcon className="text-emerald-400 w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            {opponent === 'BOT' ? `Bot (${botDifficulty})` : 'Player 2'}
                        </span>
                        <span className="text-lg font-black text-emerald-400">TURN</span>
                    </div>
                    </motion.div>
                </div>

                {/* Main Game Board */}
                <main className="relative w-full max-w-[min(100vw-2rem,450px)] aspect-square mb-8 z-0">
                    
                    {/* Game Winner Overlay */}
                    <AnimatePresence>
                    {gameState.winner && (
                        <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-[-50px] z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
                        >
                        {/* Rotating Burst Background */}
                        <motion.div 
                            className="absolute inset-0 flex items-center justify-center opacity-20"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            <div className="w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_20deg,rgba(255,255,255,0.1)_40deg,transparent_60deg)] rounded-full"></div>
                            <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_180deg,transparent_0deg,transparent_20deg,rgba(255,255,255,0.1)_40deg,transparent_60deg)] rounded-full"></div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="relative p-8 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl flex flex-col items-center w-64"
                        >
                            {gameState.winner === 'D' ? (
                            <h2 className="text-6xl font-black text-zinc-200 mb-6 tracking-tighter">DRAW</h2>
                            ) : (
                            <>
                                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Winner</h2>
                                <motion.div 
                                className="mb-8 relative"
                                >
                                {/* Glow effect */}
                                <div className={`absolute inset-0 blur-2xl ${gameState.winner === 'X' ? 'bg-orange-500/40' : 'bg-emerald-500/40'}`}></div>
                                
                                {gameState.winner === 'X' ? (
                                    <XIcon className="w-32 h-32 text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)] relative z-10" strokeWidth={3} />
                                ) : (
                                    <OIcon className="w-32 h-32 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] relative z-10" strokeWidth={3} />
                                )}
                                </motion.div>
                            </>
                            )}
                            
                            <div className="w-full space-y-3">
                                <button 
                                onClick={resetGame}
                                className="w-full px-8 py-3 bg-zinc-100 text-zinc-950 font-bold rounded-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                Play Again
                                </button>
                                <button 
                                onClick={returnToMenu}
                                className="w-full px-8 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 active:scale-95 transition-all"
                                >
                                Menu
                                </button>
                            </div>
                        </motion.div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {/* 
                    THE MACRO BOARD 
                    Added grid-rows-3 to ensure equal height rows.
                    */}
                    <div className="w-full h-full bg-zinc-800 p-2 rounded-2xl grid grid-cols-3 grid-rows-3 gap-2 shadow-2xl ring-1 ring-white/5">
                    {gameState.boards.map((board, boardIdx) => {
                        const isTarget = gameState.winner === null && (gameState.activeBoardIndex === null || gameState.activeBoardIndex === boardIdx);
                        const isBoardWon = !!gameState.macroBoard[boardIdx];
                        const isWinningBoard = gameState.winningLine?.includes(boardIdx);

                        return (
                        <motion.div 
                            key={boardIdx} 
                            animate={isWinningBoard ? { scale: [1, 1.02, 1], borderColor: "#fff" } : {}}
                            transition={{ duration: 1, repeat: isWinningBoard ? Infinity : 0 }}
                            className={`
                            relative w-full h-full rounded-xl overflow-hidden transition-all duration-300 
                            ${isWinningBoard ? 'z-10 ring-2 ring-white shadow-[0_0_30px_rgba(255,255,255,0.25)]' : ''}
                            `}
                        >
                            <SmallBoard
                            id={boardIdx}
                            cells={board}
                            status={gameState.macroBoard[boardIdx]}
                            isActive={gameState.activeBoardIndex === boardIdx}
                            isValidTarget={isTarget && !isBoardWon}
                            currentPlayer={gameState.currentPlayer}
                            onCellClick={handleCellClick}
                            />
                        </motion.div>
                        );
                    })}
                    </div>
                </main>

                {/* Footer Info */}
                <footer className="text-center h-8 z-10">
                    <AnimatePresence mode="wait">
                    {gameState.activeBoardIndex === null && !gameState.winner ? (
                        <motion.div 
                        key="free-move"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-bold animate-pulse"
                        >
                        <span className="mr-2">⚡</span> Free Move Active
                        </motion.div>
                    ) : (
                        <motion.p
                        key="hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }} 
                        className="text-zinc-500 text-sm font-medium"
                        >
                        Win 3 boards in a line to win the game.
                        </motion.p>
                    )}
                    </AnimatePresence>
                </footer>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
