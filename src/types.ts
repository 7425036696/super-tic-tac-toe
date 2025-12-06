export type Player = 'X' | 'O';
export type CellValue = Player | null;

// 'D' stands for Draw (board full but no winner)
export type BoardWinner = Player | 'D' | null; 

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'IMPOSSIBLE';
export type Opponent = 'HUMAN' | 'BOT';

export interface GameState {
  boards: CellValue[][]; // 9 boards, each with 9 cells
  macroBoard: BoardWinner[]; // State of the 9 macro boards
  currentPlayer: Player;
  activeBoardIndex: number | null; // null means can play anywhere
  winner: BoardWinner;
  winningLine: number[] | null; // Indices of the winning macro line
  history: {
    boards: CellValue[][];
    macroBoard: BoardWinner[];
    currentPlayer: Player;
    activeBoardIndex: number | null;
  }[];
}

export interface ThemeColors {
  x: string;
  o: string;
  xDim: string;
  oDim: string;
}