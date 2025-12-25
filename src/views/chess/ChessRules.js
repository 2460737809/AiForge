import { 
  BOARD_SIZE, 
  COLORS, 
  PIECE_TYPES,
  KNIGHT_MOVES,
  KING_MOVES,
  ADVISOR_MOVES,
  ELEPHANT_MOVES
} from './constants.js'

// 象棋规则类
export class ChessRules {
  constructor(chessBoard) {
    this.chessBoard = chessBoard
  }

  // 检查路径是否畅通
  isPathClear(fromRow, fromCol, toRow, toCol) {
    const board = this.chessBoard.getBoard()
    
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol)
      const end = Math.max(fromCol, toCol)
      for (let i = start + 1; i < end; i++) {
        if (board[fromRow][i]) return false
      }
    } else if (fromCol === toCol) {
      const start = Math.min(fromRow, toRow)
      const end = Math.max(fromRow, toRow)
      for (let i = start + 1; i < end; i++) {
        if (board[i][fromCol]) return false
      }
    }
    return true
  }

  // 检查炮是否隔一个子
  hasOneJump(fromRow, fromCol, toRow, toCol) {
    const board = this.chessBoard.getBoard()
    let jumpCount = 0
    
    if (fromRow === toRow) {
      const start = Math.min(fromCol, toCol)
      const end = Math.max(fromCol, toCol)
      for (let i = start + 1; i < end; i++) {
        if (board[fromRow][i]) jumpCount++
      }
    } else if (fromCol === toCol) {
      const start = Math.min(fromRow, toRow)
      const end = Math.max(fromRow, toRow)
      for (let i = start + 1; i < end; i++) {
        if (board[i][fromCol]) jumpCount++
      }
    }
    return jumpCount === 1
  }

  // 获取车的合法移动
  getRookMoves(row, col, piece, board) {
    const moves = []
    
    // 横向和纵向移动
    for (let i = 0; i < BOARD_SIZE.ROWS; i++) {
      if (i !== row && (!board[i][col] || board[i][col].color !== piece.color)) {
        if (this.isPathClear(row, col, i, col)) moves.push({ row: i, col })
      }
    }
    for (let j = 0; j < BOARD_SIZE.COLS; j++) {
      if (j !== col && (!board[row][j] || board[row][j].color !== piece.color)) {
        if (this.isPathClear(row, col, row, j)) moves.push({ row, col: j })
      }
    }
    
    return moves
  }

  // 获取马的合法移动
  getKnightMoves(row, col, piece, board) {
    const moves = []
    
    KNIGHT_MOVES.forEach(({ dr, dc, legRow, legCol }) => {
      const newRow = row + dr
      const newCol = col + dc
      if (newRow >= 0 && newRow < BOARD_SIZE.ROWS && newCol >= 0 && newCol < BOARD_SIZE.COLS) {
        if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
          // 检查马腿（蹩马腿）
          const blockRow = row + legRow
          const blockCol = col + legCol
          if (!board[blockRow][blockCol]) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
    })
    
    return moves
  }

  // 获取炮的合法移动
  getCannonMoves(row, col, piece, board) {
    const moves = []
    
    // 炮的移动规则（需要跳过一个棋子吃子）
    for (let i = 0; i < BOARD_SIZE.ROWS; i++) {
      if (i !== row) {
        const target = board[i][col]
        if (!target) {
          if (this.isPathClear(row, col, i, col)) moves.push({ row: i, col })
        } else if (target.color !== piece.color) {
          if (this.hasOneJump(row, col, i, col)) moves.push({ row: i, col })
        }
      }
    }
    for (let j = 0; j < BOARD_SIZE.COLS; j++) {
      if (j !== col) {
        const target = board[row][j]
        if (!target) {
          if (this.isPathClear(row, col, row, j)) moves.push({ row, col: j })
        } else if (target.color !== piece.color) {
          if (this.hasOneJump(row, col, row, j)) moves.push({ row, col: j })
        }
      }
    }
    
    return moves
  }

  // 获取兵/卒的合法移动
  getPawnMoves(row, col, piece, board) {
    const moves = []
    
    if (piece.color === COLORS.RED) {
      if (row > 0 && (!board[row - 1][col] || board[row - 1][col].color !== piece.color)) {
        moves.push({ row: row - 1, col })
      }
      if (row < 5) { // 过河
        if (col > 0 && (!board[row][col - 1] || board[row][col - 1].color !== piece.color)) {
          moves.push({ row, col: col - 1 })
        }
        if (col < 8 && (!board[row][col + 1] || board[row][col + 1].color !== piece.color)) {
          moves.push({ row, col: col + 1 })
        }
      }
    } else {
      if (row < 9 && (!board[row + 1][col] || board[row + 1][col].color !== piece.color)) {
        moves.push({ row: row + 1, col })
      }
      if (row >= 5) { // 过河
        if (col > 0 && (!board[row][col - 1] || board[row][col - 1].color !== piece.color)) {
          moves.push({ row, col: col - 1 })
        }
        if (col < 8 && (!board[row][col + 1] || board[row][col + 1].color !== piece.color)) {
          moves.push({ row, col: col + 1 })
        }
      }
    }
    
    return moves
  }

  // 获取将/帅的合法移动
  getKingMoves(row, col, piece, board) {
    const moves = []
    
    KING_MOVES.forEach(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc
      if (piece.color === COLORS.RED) {
        if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      } else {
        if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
    })
    
    return moves
  }

  // 获取士/仕的合法移动
  getAdvisorMoves(row, col, piece, board) {
    const moves = []
    
    ADVISOR_MOVES.forEach(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc
      if (piece.color === COLORS.RED) {
        if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      } else {
        if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
    })
    
    return moves
  }

  // 获取相/象的合法移动
  getElephantMoves(row, col, piece, board) {
    const moves = []
    
    ELEPHANT_MOVES.forEach(([dr, dc]) => {
      const newRow = row + dr
      const newCol = col + dc
      if (piece.color === COLORS.RED) {
        if (newRow >= 5 && newRow <= 9 && newCol >= 0 && newCol < 9) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            // 检查象眼
            const blockRow = row + dr / 2
            const blockCol = col + dc / 2
            if (!board[blockRow][blockCol]) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      } else {
        if (newRow >= 0 && newRow <= 4 && newCol >= 0 && newCol < 9) {
          if (!board[newRow][newCol] || board[newRow][newCol].color !== piece.color) {
            // 检查象眼
            const blockRow = row + dr / 2
            const blockCol = col + dc / 2
            if (!board[blockRow][blockCol]) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      }
    })
    
    return moves
  }

  // 获取有效移动位置（不过滤将军检查）
  getValidMovesRaw(row, col) {
    const piece = this.chessBoard.getPiece(row, col)
    if (!piece) return []
    
    const board = this.chessBoard.getBoard()
    
    switch (piece.type) {
      case PIECE_TYPES.ROOK:
        return this.getRookMoves(row, col, piece, board)
      case PIECE_TYPES.KNIGHT:
        return this.getKnightMoves(row, col, piece, board)
      case PIECE_TYPES.CANNON:
        return this.getCannonMoves(row, col, piece, board)
      case PIECE_TYPES.PAWN:
        return this.getPawnMoves(row, col, piece, board)
      case PIECE_TYPES.KING:
        return this.getKingMoves(row, col, piece, board)
      case PIECE_TYPES.ADVISOR:
        return this.getAdvisorMoves(row, col, piece, board)
      case PIECE_TYPES.ELEPHANT:
        return this.getElephantMoves(row, col, piece, board)
      default:
        return []
    }
  }

  // 过滤移动：只保留能解除将军的移动
  filterMovesToEscapeCheck(color, fromRow, fromCol, moves) {
    const validMoves = []
    
    for (const move of moves) {
      // 模拟移动
      const piece = this.chessBoard.getPiece(fromRow, fromCol)
      const originalPiece = this.chessBoard.getPiece(move.row, move.col)
      this.chessBoard.setPiece(move.row, move.col, piece)
      this.chessBoard.setPiece(fromRow, fromCol, null)
      
      // 检查移动后是否还在将军状态
      const stillInCheck = this.isInCheck(color).isCheck
      
      // 恢复棋局
      this.chessBoard.setPiece(fromRow, fromCol, piece)
      this.chessBoard.setPiece(move.row, move.col, originalPiece)
      
      // 如果移动后不在将军状态，则是有效移动
      if (!stillInCheck) {
        validMoves.push(move)
      }
    }
    
    return validMoves
  }

  // 获取有效移动位置（带将军检查过滤）
  getValidMoves(row, col) {
    const piece = this.chessBoard.getPiece(row, col)
    if (!piece) return []
    
    const moves = this.getValidMovesRaw(row, col)
    
    // 过滤掉会让自己继续处于将军状态的移动
    return this.filterMovesToEscapeCheck(piece.color, row, col, moves)
  }

  // 检查指定颜色是否被将军
  isInCheck(color) {
    const kingPos = this.chessBoard.findKing(color)
    if (!kingPos) return { isCheck: false }
    
    const opponentColor = color === COLORS.RED ? COLORS.BLACK : COLORS.RED
    const board = this.chessBoard.getBoard()
    
    // 检查所有对方棋子是否能攻击到将/帅
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece && piece.color === opponentColor) {
          // 使用不过滤将军检查的版本，避免循环调用
          const moves = this.getValidMovesRaw(row, col)
          if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
            return { isCheck: true, attackerPiece: piece, attackerPos: { row, col } }
          }
        }
      }
    }
    
    return { isCheck: false }
  }

  // 获取所有可能的移动
  getAllPossibleMoves(color) {
    const moves = []
    const board = this.chessBoard.getBoard()
    
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece && piece.color === color) {
          const validMovesForPiece = this.getValidMoves(row, col)
          validMovesForPiece.forEach(move => {
            moves.push({
              fromRow: row,
              fromCol: col,
              toRow: move.row,
              toCol: move.col,
              piece: piece
            })
          })
        }
      }
    }
    
    return moves
  }

  // 检查是否被将死（无法解除将军）
  isCheckmate(color) {
    const checkResult = this.isInCheck(color)
    if (!checkResult.isCheck) return { isCheckmate: false }
    
    // 尝试所有可能的移动，看是否能解除将军
    const allMoves = this.getAllPossibleMoves(color)
    
    for (const move of allMoves) {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)
      
      // 检查是否还在将军状态
      const stillInCheck = this.isInCheck(color).isCheck
      
      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)
      
      if (!stillInCheck) {
        return { isCheckmate: false }
      }
    }
    
    return { 
      isCheckmate: true, 
      killerPiece: checkResult.attackerPiece,
      killerPos: checkResult.attackerPos
    }
  }

  // 分析绝杀类型
  analyzeCheckmateType(killerPiece, killerPos, kingPos) {
    const board = this.chessBoard.getBoard()
    const opponentColor = killerPiece.color
    
    // 检查所有配合的棋子
    const supportingPieces = []
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece && piece.color === opponentColor && piece.type !== PIECE_TYPES.KING) {
          const moves = this.getValidMovesRaw(row, col)
          // 检查是否能攻击到将/帅附近
          if (moves.some(move => 
            Math.abs(move.row - kingPos.row) <= 1 && Math.abs(move.col - kingPos.col) <= 1
          )) {
            supportingPieces.push({ piece, pos: { row, col } })
          }
        }
      }
    }
    
    // 检查具体的杀法
    const killType = this.identifySpecificCheckmateType(killerPiece, killerPos, kingPos, supportingPieces, board)
    return killType
  }
  
  // 识别具体的杀法类型
  identifySpecificCheckmateType(killerPiece, killerPos, kingPos, supportingPieces, board) {
    const { row: kRow, col: kCol } = kingPos
    const { row: klRow, col: klCol } = killerPos
    
    // 马系列杀法
    if (killerPiece.type === PIECE_TYPES.KNIGHT) {
      // 检查是否为挂角马（马在九宫角上将军）
      if (this.isCornerSquare(kRow, kCol) && this.isKnightAttackingKing(killerPos, kingPos)) {
        return '挂角马杀'
      }
      
      // 检查是否为卧槽马（马在对方底线前一行的河界边缘将军）
      if (this.isHorseInTrough(killerPos, killerPiece.color) && this.isKnightAttackingKing(killerPos, kingPos)) {
        return '卧槽马杀'
      }
      
      // 检查是否为钓鱼马（马在对方三三位置）
      if (this.isFishingHorse(killerPos, killerPiece.color) && this.isKnightAttackingKing(killerPos, kingPos)) {
        return '钓鱼马杀'
      }
      
      // 检查是否为八角马（马位于对方九宫的中心）
      if (this.isEightPointHorse(killerPos, killerPiece.color) && this.isKnightAttackingKing(killerPos, kingPos)) {
        return '八角马杀'
      }
      
      // 检查马后炮
      if (this.hasSupportingCannon(supportingPieces, killerPiece)) {
        return '马后炮杀'
      }
      
      return '马类绝杀'
    }
    
    // 炮系列杀法
    if (killerPiece.type === PIECE_TYPES.CANNON) {
      // 检查是否为重炮杀
      if (this.hasTwinCannon(killerPos, killerPiece.color, board)) {
        return '重炮杀'
      }
      
      // 检查是否为闷宫杀
      if (this.isSmotheredMate(kingPos, board)) {
        return '闷宫杀'
      }
      
      // 检查是否为天地炮
      if (this.hasHeavenEarthCannon(killerPos, killerPiece.color, board)) {
        return '天地炮杀'
      }
      
      return '炮类绝杀'
    }
    
    // 车系列杀法
    if (killerPiece.type === PIECE_TYPES.ROOK) {
      // 检查是否为铁门栓
      if (this.isIronGate(killerPos, killerPiece.color, kingPos, board)) {
        return '铁门栓杀'
      }
      
      // 检查是否为海底捞月
      if (this.isMoonFromBottomSea(killerPos, killerPiece.color, kingPos, board)) {
        return '海底捞月杀'
      }
      
      // 检查是否有双车配合
      if (this.hasTwinRook(supportingPieces)) {
        return '双车错杀'
      }
      
      return '车类绝杀'
    }
    
    // 兵卒系列杀法
    if (killerPiece.type === PIECE_TYPES.PAWN) {
      // 检查是否为白脸将
      if (this.isWhiteFaceGeneral(killerPos, killerPiece.color, kingPos, board)) {
        return '白脸将杀'
      }
      
      return '兵(卒)绝杀'
    }
    
    // 检查是否有特殊组合
    if (this.hasGhostPoundingGate(supportingPieces)) {
      return '二鬼拍门杀'
    }
    
    // 默认返回
    if (supportingPieces.length > 1) {
      switch (killerPiece.type) {
        case PIECE_TYPES.ROOK:
          return '重车绝杀'
        case PIECE_TYPES.CANNON:
          return '重炮绝杀'
        default:
          return '绝杀'
      }
    }
    
    return '绝杀'
  }
  
  // 辅助函数：检查是否为九宫角
  isCornerSquare(row, col) {
    // 红方九宫角：7-9行，3-5列；黑方九宫：0-2行，3-5列
    const redCorners = [[9, 3], [9, 5], [7, 3], [7, 5]]
    const blackCorners = [[0, 3], [0, 5], [2, 3], [2, 5]]
    
    for (const [r, c] of redCorners) {
      if (row === r && col === c) return true
    }
    for (const [r, c] of blackCorners) {
      if (row === r && col === c) return true
    }
    return false
  }
  
  // 辅助函数：检查是否为卧槽马
  isHorseInTrough(pos, color) {
    if (color === 'red') {
      // 红方视角：马在对方（黑方）底线前一行
      return (pos.row === 2 && (pos.col === 0 || pos.col === 8)) ||
             (pos.row === 0 && (pos.col === 1 || pos.col === 7))
    } else {
      // 黑方视角：马在对方（红方）底线前一行
      return (pos.row === 7 && (pos.col === 0 || pos.col === 8)) ||
             (pos.row === 9 && (pos.col === 1 || pos.col === 7))
    }
  }
  
  // 辅助函数：检查是否为钓鱼马
  isFishingHorse(pos, color) {
    if (color === 'red') {
      // 红方视角：马在对方九宫的3-3位置（从底线数第3行，第3列）
      return pos.row === 7 && pos.col === 3
    } else {
      // 黑方视角：马在对方九宫的3-3位置
      return pos.row === 2 && pos.col === 3
    }
  }
  
  // 辅助函数：检查是否为八角马
  isEightPointHorse(pos, color) {
    if (color === 'red') {
      // 红方视角：马在对方九宫中心附近
      return pos.row === 8 && pos.col === 4
    } else {
      // 黑方视角：马在对方九宫中心附近
      return pos.row === 1 && pos.col === 4
    }
  }
  
  // 辅助函数：检查马是否在攻击将/帅
  isKnightAttackingKing(knightPos, kingPos) {
    const dr = Math.abs(knightPos.row - kingPos.row)
    const dc = Math.abs(knightPos.col - kingPos.col)
    return (dr === 2 && dc === 1) || (dr === 1 && dc === 2)
  }
  
  // 辅助函数：检查是否有配合的炮
  hasSupportingCannon(supportingPieces, knightPiece) {
    return supportingPieces.some(item => 
      item.piece.type === PIECE_TYPES.CANNON && item.piece.color === knightPiece.color
    )
  }
  
  // 辅助函数：检查是否有双炮
  hasTwinCannon(cannonPos, color, board) {
    let count = 0
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece && piece.type === PIECE_TYPES.CANNON && piece.color === color) {
          count++
        }
      }
    }
    return count >= 2
  }
  
  // 辅助函数：检查是否为闷宫杀
  isSmotheredMate(kingPos, board) {
    const king = board[kingPos.row][kingPos.col]
    if (!king) return false
    
    // 检查将/帅周围是否有己方棋子阻挡
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
    let blockedCount = 0
    
    for (const [dr, dc] of directions) {
      const newRow = kingPos.row + dr
      const newCol = kingPos.col + dc
      
      if (newRow >= 0 && newRow < BOARD_SIZE.ROWS && newCol >= 0 && newCol < BOARD_SIZE.COLS) {
        const adjacentPiece = board[newRow][newCol]
        if (adjacentPiece && adjacentPiece.color === king.color) {
          blockedCount++
        }
      }
    }
    
    return blockedCount >= 2 // 至少有2个方向被己方棋子阻挡
  }
  
  // 辅助函数：检查是否有天地炮
  hasHeavenEarthCannon(cannonPos, color, board) {
    // 检查是否有中炮和底炮
    let hasMiddleCannon = false
    let hasBottomCannon = false
    
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece && piece.type === PIECE_TYPES.CANNON && piece.color === color) {
          if (piece.color === 'red') {
            // 红方视角：中炮在第5列，底炮在底线
            if (col === 4 && row >= 7) hasMiddleCannon = true
            if (row === 9) hasBottomCannon = true
          } else {
            // 黑方视角：中炮在第5列，底炮在底线
            if (col === 4 && row <= 2) hasMiddleCannon = true
            if (row === 0) hasBottomCannon = true
          }
        }
      }
    }
    
    return hasMiddleCannon && hasBottomCannon
  }
  
  // 辅助函数：检查是否为铁门栓
  isIronGate(rookPos, color, kingPos, board) {
    // 车控制底线，将被栓住
    if (color === 'red') {
      // 红方车控制黑方底线
      return rookPos.row === 9 && kingPos.row === 9 && 
             Math.abs(rookPos.col - kingPos.col) === 1
    } else {
      // 黑方车控制红方底线
      return rookPos.row === 0 && kingPos.row === 0 && 
             Math.abs(rookPos.col - kingPos.col) === 1
    }
  }
  
  // 辅助函数：检查是否为海底捞月
  isMoonFromBottomSea(rookPos, color, kingPos, board) {
    // 车在底线横向将军
    return ((color === 'red' && rookPos.row === 9) || 
            (color === 'black' && rookPos.row === 0)) &&
           rookPos.row === kingPos.row
  }
  
  // 辅助函数：检查是否有双车
  hasTwinRook(supportingPieces) {
    let rookCount = 0
    supportingPieces.forEach(item => {
      if (item.piece.type === PIECE_TYPES.ROOK) {
        rookCount++
      }
    })
    return rookCount >= 2
  }
  
  // 辅助函数：检查是否为白脸将
  isWhiteFaceGeneral(attackerPos, color, kingPos, board) {
    // 将帅不能对面的规则
    if (attackerPos.col !== kingPos.col) return false
    
    // 检查两将之间是否没有其他棋子
    const startRow = Math.min(attackerPos.row, kingPos.row)
    const endRow = Math.max(attackerPos.row, kingPos.row)
    
    let piecesBetween = 0
    for (let row = startRow + 1; row < endRow; row++) {
      if (board[row][attackerPos.col]) {
        piecesBetween++
      }
    }
    
    return piecesBetween === 0
  }
  
  // 辅助函数：检查是否为二鬼拍门
  hasGhostPoundingGate(supportingPieces) {
    let pawnCount = 0
    let rightPositions = 0
    
    supportingPieces.forEach(item => {
      if (item.piece.type === PIECE_TYPES.PAWN) {
        pawnCount++
        // 检查兵是否在正确的位置（九宫士角）
        if ((item.pos.row === 7 && item.pos.col === 3) || // 红方视角，对方九宫左上角
            (item.pos.row === 7 && item.pos.col === 5) || // 红方视角，对方九宫右上角
            (item.pos.row === 2 && item.pos.col === 3) || // 黑方视角，对方九宫左下角
            (item.pos.row === 2 && item.pos.col === 5)) { // 黑方视角，对方九宫右下角
          rightPositions++
        }
      }
    })
    
    return pawnCount >= 2 && rightPositions >= 2
  }
}
