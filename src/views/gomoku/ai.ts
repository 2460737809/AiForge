import { Player, Board, BOARD_SIZE, AISearchResult } from './types';
import { isValidPosition, checkWin, copyBoard, placePiece } from './board';

// 简化的评分表
const SCORES = { FIVE: 100000, LIVE4: 10000, RUSH4: 1000, LIVE3: 1000, LIVE2: 100 };

export function getBestMove(board: Board, aiColor: Player, difficulty: string): AISearchResult {
  const opponent = aiColor === 'black' ? 'white' : 'black';
  let bestScore = -Infinity;
  let bestMove: [number, number] = [7, 7];

  // 1. 获取所有有意义的候选点（已有棋子周围2格内）
  const candidates = getCandidates(board);

  for (const [r, c] of candidates) {
    // 模拟落子
    const score = evaluatePoint(board, r, c, aiColor, opponent);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }

  return { row: bestMove[0], col: bestMove[1], score: bestScore };
}

function getCandidates(board: Board): [number, number][] {
  const set = new Set<string>();
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            if (isValidPosition(r + dr, c + dc) && board[r + dr][c + dc] === null) {
              set.add(`${r + dr},${c + dc}`);
            }
          }
        }
      }
    }
  }
  return set.size === 0 ? [[7, 7]] : Array.from(set).map(s => s.split(',').map(Number) as [number, number]);
}

function evaluatePoint(board: Board, r: number, c: number, ai: Player, human: Player): number {
  // 这里简化处理：AI得分 + 玩家防守分
  // 实际项目中可替换为复杂的 Minimax 递归
  return Math.random() * 100; // 此处仅作结构占位，建议套用你之前的 evaluateLine 逻辑
}