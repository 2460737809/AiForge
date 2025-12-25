export type Player = 'black' | 'white' | null;
export type Board = Player[][];
export type GameMode = 'pvp' | 'pve';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'playing' | 'win' | 'draw';

export const BOARD_SIZE = 15;

export interface WinResult {
  positions: [number, number][];
}

export interface AISearchResult {
  row: number;
  col: number;
  score: number;
}