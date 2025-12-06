import type{ CellValue, GameState, Difficulty, Player } from '../types';
import { checkWinner, WINNING_LINES } from '../constants';

type Move = { boardIndex: number; cellIndex: number; score?: number };

// Helper: Get all valid moves for the current state
const getValidMoves = (gameState: GameState): Move[] => {
  const moves: Move[] = [];
  const { boards, activeBoardIndex, macroBoard } = gameState;

  // If activeBoardIndex is null (free move) or the active board is already full/won
  if (activeBoardIndex === null || macroBoard[activeBoardIndex] !== null) {
    // Can play on any board that isn't full/won
    for (let b = 0; b < 9; b++) {
      if (macroBoard[b] === null) {
        for (let c = 0; c < 9; c++) {
          if (boards[b][c] === null) {
            moves.push({ boardIndex: b, cellIndex: c });
          }
        }
      }
    }
  } else {
    // Must play on active board
    for (let c = 0; c < 9; c++) {
      if (boards[activeBoardIndex][c] === null) {
        moves.push({ boardIndex: activeBoardIndex, cellIndex: c });
      }
    }
  }
  return moves;
};

// --- LEVEL 1: EASY (Random) ---
const getRandomMove = (moves: Move[]): Move => {
  return moves[Math.floor(Math.random() * moves.length)];
};

// --- LEVEL 2: MEDIUM (Win/Block Local) ---
const getMediumMove = (gameState: GameState, moves: Move[], player: Player): Move => {
  const opponent = player === 'X' ? 'O' : 'X';

  // 1. Check for immediate local board win
  for (const move of moves) {
    const tempBoard = [...gameState.boards[move.boardIndex]];
    tempBoard[move.cellIndex] = player;
    if (checkWinner(tempBoard).winner === player) {
      return move;
    }
  }

  // 2. Block opponent's immediate local board win
  for (const move of moves) {
    const tempBoard = [...gameState.boards[move.boardIndex]];
    tempBoard[move.cellIndex] = opponent;
    if (checkWinner(tempBoard).winner === opponent) {
      return move;
    }
  }

  return getRandomMove(moves);
};

// --- LEVEL 3: HARD (Heuristics) ---
// Penalize giving free moves, prioritize center/corners, prioritize winning macro board
const evaluateMoveHard = (gameState: GameState, move: Move, player: Player): number => {
  let score = 0;
  const { boardIndex, cellIndex } = move;
  const targetBoardIndex = cellIndex; // Where the opponent will be sent

  // 1. Win Local Board
  const tempBoard = [...gameState.boards[boardIndex]];
  tempBoard[cellIndex] = player;
  const localCheck = checkWinner(tempBoard);
  if (localCheck.winner === player) score += 100;

  // 2. Avoid sending opponent to a won/full board (giving them a free move)
  // unless we just won the game, in which case it doesn't matter.
  const isTargetFullOrWon = gameState.macroBoard[targetBoardIndex] !== null || 
                            (localCheck.winner === null && isBoardFull(gameState.boards[targetBoardIndex])); // approx check
  
  if (isTargetFullOrWon && !localCheck.winner) {
     score -= 50; // Punishment for giving free move
  }

  // 3. Positional Heuristics (Center > Corner > Edge)
  const center = 4;
  const corners = [0, 2, 6, 8];
  if (cellIndex === center) score += 5;
  else if (corners.includes(cellIndex)) score += 3;

  return score + Math.random() * 2; // Add jitter to avoid identical games
};

const getHardMove = (gameState: GameState, moves: Move[], player: Player): Move => {
    // Check for winning the game immediately first (Macro win)
    for (const move of moves) {
        const simState = simulateMove(gameState, move, player);
        if (simState.winner === player) return move;
    }

    // Otherwise use simple heuristic scoring
    const scoredMoves = moves.map(move => ({
        ...move,
        score: evaluateMoveHard(gameState, move, player)
    }));
    
    scoredMoves.sort((a, b) => (b.score || 0) - (a.score || 0));
    return scoredMoves[0];
};


// --- LEVEL 4: IMPOSSIBLE (Minimax with Alpha-Beta) ---

const MAX_DEPTH = 9; // Ultra-deep search for impossible difficulty
const INF = 100000;

// Evaluation function for Minimax
const evaluateState = (gameState: GameState, player: Player): number => {
    const opponent = player === 'X' ? 'O' : 'X';
    
    if (gameState.winner === player) return 10000;
    if (gameState.winner === opponent) return -10000;
    if (gameState.winner === 'D') return 0;

    let score = 0;

    // Macro Board Evaluation - Heavily weight winning positions
    for (const line of WINNING_LINES) {
        let pCount = 0;
        let oCount = 0;
        for (const idx of line) {
            if (gameState.macroBoard[idx] === player) pCount++;
            else if (gameState.macroBoard[idx] === opponent) oCount++;
        }
        if (pCount === 2 && oCount === 0) score += 300; // Increased from 100
        if (pCount === 1 && oCount === 0) score += 20;
        if (oCount === 2 && pCount === 0) score -= 300; // Increased from 100
        if (oCount === 1 && pCount === 0) score -= 20;
    }

    // Micro Board Evaluation (weight heavily towards center board)
    for (let b = 0; b < 9; b++) {
        const boardWeight = b === 4 ? 3 : (b % 2 === 0 ? 2 : 1); // Center=3, corners=2, edges=1 
        if (gameState.macroBoard[b] === null) {
            // Count pieces in this board
            let localScore = 0;
            const cells = gameState.boards[b];
            for (const line of WINNING_LINES) {
                let pCount = 0;
                let oCount = 0;
                for (const idx of line) {
                    if (cells[idx] === player) pCount++;
                    else if (cells[idx] === opponent) oCount++;
                }
                if (pCount === 2 && oCount === 0) localScore += 5;
                if (oCount === 2 && pCount === 0) localScore -= 5;
            }
            score += localScore * boardWeight;
        }
    }

    return score;
};

const simulateMove = (state: GameState, move: Move, player: Player): GameState => {
    // Deep copy essential parts
    const newBoards = state.boards.map(r => [...r]);
    const newMacroBoard = [...state.macroBoard];
    
    newBoards[move.boardIndex][move.cellIndex] = player;

    // Check micro win
    const microCheck = checkWinner(newBoards[move.boardIndex]);
    if (microCheck.winner) {
        newMacroBoard[move.boardIndex] = microCheck.winner;
    }

    // Check macro win
    const macroCheck = checkWinner(newMacroBoard);
    let winner = macroCheck.winner;
    if (!winner && newMacroBoard.every(b => b !== null)) winner = 'D';

    // Determine next active board
    let nextActive = move.cellIndex;
    if (newMacroBoard[nextActive]) {
        nextActive = null as any; // Cast to conform to types, effectively null
    }
    // If game over, active doesn't matter
    if (winner) nextActive = null as any;

    return {
        ...state,
        boards: newBoards,
        macroBoard: newMacroBoard,
        currentPlayer: player === 'X' ? 'O' : 'X',
        activeBoardIndex: nextActive === null ? null : nextActive,
        winner: winner,
        winningLine: macroCheck.line,
        history: [] // Not needed for simulation
    };
};

const minimax = (state: GameState, depth: number, alpha: number, beta: number, isMaximizing: boolean, player: Player): number => {
    if (state.winner || depth === 0) {
        return evaluateState(state, player);
    }

    const moves = getValidMoves(state);
    if (moves.length === 0) return 0; // Draw

    if (isMaximizing) {
        let maxEval = -INF;
        // Smart move ordering for better alpha-beta pruning
        const sortedMoves = moves.length > 20 
            ? moves.map(m => ({...m, score: evaluateMoveHard(state, m, player)}))
                   .sort((a,b) => (b.score || 0) - (a.score || 0))
                   .slice(0, 20)
                   .map(({boardIndex, cellIndex}) => ({boardIndex, cellIndex}))
            : moves;
        
        for (const move of sortedMoves) {
            const nextState = simulateMove(state, move, player);
            const evalScore = minimax(nextState, depth - 1, alpha, beta, false, player);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = INF;
        const opponent = player === 'X' ? 'O' : 'X';
        // Smart move ordering for better alpha-beta pruning
        const sortedMoves = moves.length > 20 
            ? moves.map(m => ({...m, score: evaluateMoveHard(state, m, opponent)}))
                   .sort((a,b) => (b.score || 0) - (a.score || 0))
                   .slice(0, 20)
                   .map(({boardIndex, cellIndex}) => ({boardIndex, cellIndex}))
            : moves;

const getImpossibleMove = (gameState: GameState, moves: Move[], player: Player): Move => {
    // If first move, center is best.
    const isFirstMove = gameState.boards.flat().every(c => c === null);
    if (isFirstMove) return { boardIndex: 4, cellIndex: 4 };

    let bestScore = -INF;
    let bestMove = moves[0];
    
    // Sort moves by heuristic first to improve pruning
    const sortedMoves = moves.map(m => ({...m, score: evaluateMoveHard(gameState, m, player)})).sort((a,b) => b.score - a.score);

    // Search more moves for truly impossible play - explore more of the game tree
    const searchMoves = sortedMoves.length > 35 ? sortedMoves.slice(0, 35) : sortedMoves;

    for (const move of searchMoves) {
        const simState = simulateMove(gameState, move, player);
        // If immediate win, take it (but keep searching to find the best immediate win)
        if (simState.winner === player) {
            bestMove = move;
            bestScore = INF;
            continue;
        }

        // Skip if already found a winning move
        if (bestScore === INF) continue;

        const score = minimax(simState, MAX_DEPTH - 1, -INF, INF, false, player);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};      const simState = simulateMove(gameState, move, player);
        // If immediate win, take it
        if (simState.winner === player) return move;

        const score = minimax(simState, MAX_DEPTH - 1, -INF, INF, false, player);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
};

// --- MAIN BOT FUNCTION ---
export const getBotMove = (gameState: GameState, difficulty: Difficulty): Move => {
  const moves = getValidMoves(gameState);
  
  if (moves.length === 0) return { boardIndex: 0, cellIndex: 0 }; // Should not happen if check is correct

  const player = gameState.currentPlayer;

  switch (difficulty) {
    case 'EASY':
      return getRandomMove(moves);
    case 'MEDIUM':
      return getMediumMove(gameState, moves, player);
    case 'HARD':
      return getHardMove(gameState, moves, player);
    case 'IMPOSSIBLE':
      return getImpossibleMove(gameState, moves, player);
    default:
      return getRandomMove(moves);
  }
};

// Helper
const isBoardFull = (cells: CellValue[]): boolean => cells.every(c => c !== null);
