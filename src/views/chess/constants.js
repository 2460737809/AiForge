// 棋子价值表
export const PIECE_VALUES = {
  king: 10000,
  advisor: 200,
  elephant: 200,
  knight: 400,
  rook: 900,
  cannon: 450,
  pawn: 100
}

// 棋盘尺寸
export const BOARD_SIZE = {
  ROWS: 10,
  COLS: 9,
  CELL_SIZE: 60,
  OFFSET: 30
}

// 棋子类型
export const PIECE_TYPES = {
  KING: 'king',
  ADVISOR: 'advisor',
  ELEPHANT: 'elephant',
  KNIGHT: 'knight',
  ROOK: 'rook',
  CANNON: 'cannon',
  PAWN: 'pawn'
}

// 颜色
export const COLORS = {
  RED: 'red',
  BLACK: 'black'
}

// 游戏模式
export const GAME_MODES = {
  PVP: 'pvp',
  PVC: 'pvc'
}

// 棋盘皮肤
export const BOARD_SKINS = {
  CLASSIC: 'classic',
  WOOD: 'wood',
  BAMBOO: 'bamboo',
  MARBLE: 'marble',
  EMERALD: 'emerald'
}

// AI 难度
export const AI_DIFFICULTY = {
  NOVICE: 'novice',      // 新手
  ONE_STAR: '1star',   // 一星棋士
  TWO_STAR: '2star',   // 二星棋士
  THREE_STAR: '3star', // 三星棋士
  FOUR_STAR: '4star',  // 四星棋士
  FIVE_STAR: '5star',  // 五星棋士
  SIX_STAR: '6star',   // 六星棋士
  SEVEN_STAR: '7star', // 七星棋士
  EIGHT_STAR: '8star', // 八星棋士
  NINE_STAR: '9star',  // 九星棋士
  MASTER: 'master',    // 大师
  GRANDMASTER: 'grandmaster', // 特级大师
  CHAMPION: 'champion' // 全国第一
}

// 马的移动方向（带马腿检查）
export const KNIGHT_MOVES = [
  { dr: -2, dc: -1, legRow: -1, legCol: 0 }, // 上上左
  { dr: -2, dc: 1, legRow: -1, legCol: 0 },  // 上上右
  { dr: -1, dc: -2, legRow: 0, legCol: -1 }, // 左左上
  { dr: -1, dc: 2, legRow: 0, legCol: 1 },   // 右右上
  { dr: 1, dc: -2, legRow: 0, legCol: -1 },  // 左左下
  { dr: 1, dc: 2, legRow: 0, legCol: 1 },    // 右右下
  { dr: 2, dc: -1, legRow: 1, legCol: 0 },   // 下下左
  { dr: 2, dc: 1, legRow: 1, legCol: 0 }     // 下下右
]

// 将/帅的移动方向
export const KING_MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]]

// 士/仕的移动方向
export const ADVISOR_MOVES = [[-1, -1], [-1, 1], [1, -1], [1, 1]]

// 相/象的移动方向
export const ELEPHANT_MOVES = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
