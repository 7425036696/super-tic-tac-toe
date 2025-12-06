import type{ BoardWinner } from './types';

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const checkWinner = (cells: BoardWinner[]): { winner: BoardWinner, line: number[] | null } => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] !== 'D' && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line };
    }
  }

  if (cells.every((cell) => cell !== null)) {
    return { winner: 'D', line: null };
  }

  return { winner: null, line: null };
};