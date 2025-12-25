import { Player, Board, BOARD_SIZE, WinResult } from './types';

export const initializeBoard = (): Board => 
  Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

export const isValidPosition = (r: number, c: number) => 
  r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;

export const placePiece = (board: Board, r: number, c: number, p: Player) => {
  if (isValidPosition(r, c) && board[r][c] === null) {
    board[r][c] = p;
    return true;
  }
  return false;
};

export const checkWin = (board: Board, row: number, col: number): WinResult | null => {
  const player = board[row][col];
  if (!player) return null;

  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dx, dy] of dirs) {
    const positions: [number, number][] = [[row, col]];
    // 正向找
    let r = row + dx, c = col + dy;
    while (isValidPosition(r, c) && board[r][c] === player) {
      positions.push([r, c]);
      r += dx; c += dy;
    }
    // 反向找
    r = row - dx; c = col - dy;
    while (isValidPosition(r, c) && board[r][c] === player) {
      positions.push([r, c]);
      r -= dx; c -= dy;
    }
    if (positions.length >= 5) return { positions };
  }
  return null;
};

export const checkDraw = (board: Board): boolean => 
  board.every(row => row.every(cell => cell !== null));

export const copyBoard = (board: Board): Board => board.map(row => [...row]);