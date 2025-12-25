import { BOARD_SIZE, COLORS, PIECE_TYPES } from './constants.js'

// 棋盘逻辑类
export class ChessBoard {
  constructor() {
    this.board = []
    this.initBoard()
  }

  // 初始化棋盘
  initBoard() {
    const newBoard = Array(BOARD_SIZE.ROWS).fill(null).map(() => Array(BOARD_SIZE.COLS).fill(null))
    
    // 红方棋子
    newBoard[9][0] = { name: '车', color: COLORS.RED, type: PIECE_TYPES.ROOK }
    newBoard[9][1] = { name: '马', color: COLORS.RED, type: PIECE_TYPES.KNIGHT }
    newBoard[9][2] = { name: '相', color: COLORS.RED, type: PIECE_TYPES.ELEPHANT }
    newBoard[9][3] = { name: '仕', color: COLORS.RED, type: PIECE_TYPES.ADVISOR }
    newBoard[9][4] = { name: '帅', color: COLORS.RED, type: PIECE_TYPES.KING }
    newBoard[9][5] = { name: '仕', color: COLORS.RED, type: PIECE_TYPES.ADVISOR }
    newBoard[9][6] = { name: '相', color: COLORS.RED, type: PIECE_TYPES.ELEPHANT }
    newBoard[9][7] = { name: '马', color: COLORS.RED, type: PIECE_TYPES.KNIGHT }
    newBoard[9][8] = { name: '车', color: COLORS.RED, type: PIECE_TYPES.ROOK }
    newBoard[7][1] = { name: '炮', color: COLORS.RED, type: PIECE_TYPES.CANNON }
    newBoard[7][7] = { name: '炮', color: COLORS.RED, type: PIECE_TYPES.CANNON }
    newBoard[6][0] = { name: '兵', color: COLORS.RED, type: PIECE_TYPES.PAWN }
    newBoard[6][2] = { name: '兵', color: COLORS.RED, type: PIECE_TYPES.PAWN }
    newBoard[6][4] = { name: '兵', color: COLORS.RED, type: PIECE_TYPES.PAWN }
    newBoard[6][6] = { name: '兵', color: COLORS.RED, type: PIECE_TYPES.PAWN }
    newBoard[6][8] = { name: '兵', color: COLORS.RED, type: PIECE_TYPES.PAWN }
    
    // 黑方棋子
    newBoard[0][0] = { name: '车', color: COLORS.BLACK, type: PIECE_TYPES.ROOK }
    newBoard[0][1] = { name: '马', color: COLORS.BLACK, type: PIECE_TYPES.KNIGHT }
    newBoard[0][2] = { name: '象', color: COLORS.BLACK, type: PIECE_TYPES.ELEPHANT }
    newBoard[0][3] = { name: '士', color: COLORS.BLACK, type: PIECE_TYPES.ADVISOR }
    newBoard[0][4] = { name: '将', color: COLORS.BLACK, type: PIECE_TYPES.KING }
    newBoard[0][5] = { name: '士', color: COLORS.BLACK, type: PIECE_TYPES.ADVISOR }
    newBoard[0][6] = { name: '象', color: COLORS.BLACK, type: PIECE_TYPES.ELEPHANT }
    newBoard[0][7] = { name: '马', color: COLORS.BLACK, type: PIECE_TYPES.KNIGHT }
    newBoard[0][8] = { name: '车', color: COLORS.BLACK, type: PIECE_TYPES.ROOK }
    newBoard[2][1] = { name: '炮', color: COLORS.BLACK, type: PIECE_TYPES.CANNON }
    newBoard[2][7] = { name: '炮', color: COLORS.BLACK, type: PIECE_TYPES.CANNON }
    newBoard[3][0] = { name: '卒', color: COLORS.BLACK, type: PIECE_TYPES.PAWN }
    newBoard[3][2] = { name: '卒', color: COLORS.BLACK, type: PIECE_TYPES.PAWN }
    newBoard[3][4] = { name: '卒', color: COLORS.BLACK, type: PIECE_TYPES.PAWN }
    newBoard[3][6] = { name: '卒', color: COLORS.BLACK, type: PIECE_TYPES.PAWN }
    newBoard[3][8] = { name: '卒', color: COLORS.BLACK, type: PIECE_TYPES.PAWN }
    
    this.board = newBoard
  }

  // 获取棋盘
  getBoard() {
    return this.board
  }

  // 获取指定位置的棋子
  getPiece(row, col) {
    return this.board[row]?.[col] || null
  }

  // 设置指定位置的棋子
  setPiece(row, col, piece) {
    this.board[row][col] = piece
  }

  // 移动棋子
  movePiece(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol]
    const capturedPiece = this.board[toRow][toCol]
    
    this.board[toRow][toCol] = piece
    this.board[fromRow][fromCol] = null
    
    return capturedPiece
  }

  // 找到指定颜色的将/帅位置
  findKing(color) {
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = this.board[row][col]
        if (piece && piece.color === color && piece.type === PIECE_TYPES.KING) {
          return { row, col }
        }
      }
    }
    return null
  }

  // 复制棋盘
  clone() {
    const newChessBoard = new ChessBoard()
    newChessBoard.board = this.board.map(row => [...row])
    return newChessBoard
  }
}
