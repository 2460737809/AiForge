import { PIECE_VALUES, COLORS, BOARD_SIZE, AI_DIFFICULTY } from "./constants.js"

// AI 逻辑类
export class ChessAI {
  constructor(chessBoard, chessRules) {
    this.chessBoard = chessBoard
    this.chessRules = chessRules
  }

  // 获取对手颜色
  getOpponentColor(color) {
    return color === COLORS.RED ? COLORS.BLACK : COLORS.RED
  }

  // 评估棋子价值
  evaluatePiece(piece, row, col) {
    if (!piece) return 0
    let value = PIECE_VALUES[piece.type]

    // 兵/卒过河加分
    if (piece.type === "pawn") {
      if (piece.color === COLORS.RED && row < 5) value += 50
      if (piece.color === COLORS.BLACK && row >= 5) value += 50
    }
    // 中心控制加分
    if (col >= 3 && col <= 5 && row >= 3 && row <= 6) {
      value += 20
    }
    return value
  }

  // 评估棋局 (动态评估)
  evaluateBoard(aiColor) {
    let score = 0
    const board = this.chessBoard.getBoard()
    for (let row = 0; row < BOARD_SIZE.ROWS; row++) {
      for (let col = 0; col < BOARD_SIZE.COLS; col++) {
        const piece = board[row][col]
        if (piece) {
          const val = this.evaluatePiece(piece, row, col)
          // 自己的棋子加分，敌人的棋子减分
          score += piece.color === aiColor ? val : -val
        }
      }
    }
    return score
  }

  // 基础：随机移动
  selectMoveEasy(moves) {
    return moves[Math.floor(Math.random() * moves.length)]
  }

  // 普通难度：优先吃子，其次评估位置
  selectMoveNormal(allMoves) {
    let bestScore = -Infinity
    let bestMove = null
    const board = this.chessBoard.getBoard()

    allMoves.forEach((move) => {
      const targetPiece = board[move.toRow][move.toCol]
      let score = 0

      // 能吃子的优先考虑
      if (targetPiece) {
        score = PIECE_VALUES[targetPiece.type]
      } else {
        // 不吃子则评估位置价值
        score = Math.random() * 50
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 一星：贪心算法（选分值最高的）
  selectMoveOneStar(moves, aiColor) {
    let bestMove = null
    let maxScore = -Infinity
    moves.forEach((move) => {
      const captured = this.chessBoard.getPiece(move.toRow, move.toCol)
      let score = captured ? PIECE_VALUES[captured.type] : 0
      if (score > maxScore) {
        maxScore = score
        bestMove = move
      }
    })
    return bestMove || moves[0]
  }

  // 二星棋士：更注重吃子价值
  selectMoveTwoStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null
    const board = this.chessBoard.getBoard()

    allMoves.forEach((move) => {
      const targetPiece = board[move.toRow][move.toCol]
      let score = 0

      // 能吃子的优先考虑
      if (targetPiece) {
        score = PIECE_VALUES[targetPiece.type] * 2 // 吃子价值翻倍
      } else {
        // 不吃子则评估位置价值
        score = Math.random() * 30
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 三星棋士：开始考虑位置价值
  selectMoveThreeStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null
    const board = this.chessBoard.getBoard()

    allMoves.forEach((move) => {
      const targetPiece = board[move.toRow][move.toCol]
      let score = 0

      // 能吃子的优先考虑
      if (targetPiece) {
        score = PIECE_VALUES[targetPiece.type] * 2
      }

      // 考虑移动后的位置价值
      score += this.evaluatePiece(move.piece, move.toRow, move.toCol)

      // 随机性减少
      score += Math.random() * 20

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 四星：考虑一步反击 (动态判断对手)
  selectMoveFourStar(moves, aiColor) {
    let bestScore = -Infinity
    let bestMove = null
    const opponentColor = this.getOpponentColor(aiColor)

    moves.forEach((move) => {
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      let score = this.evaluateBoard(aiColor)

      // 检查对手是否能反杀这个位置
      const opponentMoves = this.chessRules.getAllPossibleMoves(opponentColor)
      for (const oppMove of opponentMoves) {
        if (oppMove.toRow === move.toRow && oppMove.toCol === move.toCol) {
          score -= PIECE_VALUES[move.piece.type]
          break
        }
      }

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }

      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)
    })
    return bestMove || moves[0]
  }

  // 五星棋士：开始考虑战术组合
  selectMoveFiveStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null

    allMoves.forEach((move) => {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      // 评估移动后的局面
      let score = this.evaluateBoard()

      // 如果能吃将，直接选择
      if (originalPiece && originalPiece.type === "king") {
        score = Infinity
      }

      // 检查是否形成威胁
      const newMoves = this.chessRules.getValidMoves(move.toRow, move.toCol)
      for (const newMove of newMoves) {
        if (this.chessBoard.getPiece(newMove.row, newMove.col) && this.chessBoard.getPiece(newMove.row, newMove.col).color === COLORS.RED) {
          // 形成新的威胁
          score += PIECE_VALUES[this.chessBoard.getPiece(newMove.row, newMove.col).type] * 0.3
        }
      }

      // 检查移动后是否会被吃
      const opponentMoves = this.chessRules.getAllPossibleMoves(COLORS.RED)
      let isThreatened = false
      for (const oppMove of opponentMoves) {
        if (oppMove.toRow === move.toRow && oppMove.toCol === move.toCol) {
          isThreatened = true
          break
        }
      }
      if (isThreatened) {
        score -= PIECE_VALUES[move.piece.type] * 0.5
      }

      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 六星：Alpha-Beta 搜索（动态颜色版）
  selectMoveSixStar(moves, aiColor) {
    let bestScore = -Infinity
    let bestMove = null

    for (const move of moves) {
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      let score = this.minimax(2, false, -Infinity, Infinity, aiColor)

      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  // 七星棋士：三步预测
  selectMoveSevenStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null

    allMoves.forEach((move) => {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      // 评估移动后的局面
      let score = this.evaluateBoard()

      // 如果能吃将，直接选择
      if (originalPiece && originalPiece.type === "king") {
        score = Infinity
      }

      // 检查对手的威胁
      const opponentMoves = this.chessRules.getAllPossibleMoves(COLORS.RED)
      let maxThreat = 0
      let canCaptureKing = false

      for (const oppMove of opponentMoves) {
        if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol) && this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type === "king") {
          canCaptureKing = true
        } else if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol)) {
          maxThreat = Math.max(maxThreat, PIECE_VALUES[this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type])
        }
      }

      if (canCaptureKing) {
        score = -Infinity // 如果会导致被将死，直接放弃
      } else {
        score -= maxThreat * 0.8

        // 再预测对方一步
        if (maxThreat > 0) {
          // 模拟对方走最威胁的一步
          for (const oppMove of opponentMoves) {
            if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol) && PIECE_VALUES[this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type] === maxThreat) {
              const oppOriginalPiece = this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol)
              this.chessBoard.setPiece(oppMove.toRow, oppMove.toCol, this.chessBoard.getPiece(oppMove.fromRow, oppMove.fromCol))
              this.chessBoard.setPiece(oppMove.fromRow, oppMove.fromCol, null)

              // 再评估我方局面
              const myNextMoves = this.chessRules.getAllPossibleMoves(COLORS.BLACK)
              let bestResponseScore = -Infinity

              for (const nextMove of myNextMoves) {
                const nextOriginalPiece = this.chessBoard.getPiece(nextMove.toRow, nextMove.toCol)
                this.chessBoard.setPiece(nextMove.toRow, nextMove.toCol, this.chessBoard.getPiece(nextMove.fromRow, nextMove.fromCol))
                this.chessBoard.setPiece(nextMove.fromRow, nextMove.fromCol, null)

                const responseScore = this.evaluateBoard()
                bestResponseScore = Math.max(bestResponseScore, responseScore)

                this.chessBoard.setPiece(nextMove.fromRow, nextMove.fromCol, this.chessBoard.getPiece(nextMove.toRow, nextMove.toCol))
                this.chessBoard.setPiece(nextMove.toRow, nextMove.toCol, nextOriginalPiece)
              }

              score += bestResponseScore * 0.1 // 加上后续应对的评估

              // 恢复对手的移动
              this.chessBoard.setPiece(oppMove.fromRow, oppMove.fromCol, this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol))
              this.chessBoard.setPiece(oppMove.toRow, oppMove.toCol, oppOriginalPiece)

              break // 只考虑一个最威胁的移动
            }
          }
        }
      }

      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 八星棋士：更深入的搜索
  selectMoveEightStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null

    allMoves.forEach((move) => {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      // 评估移动后的局面
      let score = this.evaluateBoard()

      // 如果能吃将，直接选择
      if (originalPiece && originalPiece.type === "king") {
        score = Infinity
      }

      // 检查是否将军
      const opponentColor = COLORS.RED
      const checkResult = this.chessRules.isInCheck(opponentColor)
      if (checkResult.isCheck) {
        score += 50 // 将军加分
      }

      // 检查对手的威胁
      const opponentMoves = this.chessRules.getAllPossibleMoves(COLORS.RED)
      let maxThreat = 0
      let canCaptureKing = false

      for (const oppMove of opponentMoves) {
        if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol) && this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type === "king") {
          canCaptureKing = true
        } else if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol)) {
          maxThreat = Math.max(maxThreat, PIECE_VALUES[this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type])
        }
      }

      if (canCaptureKing) {
        score = -Infinity
      } else {
        score -= maxThreat * 0.8
      }

      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 九星棋士：接近专业水平
  selectMoveNineStar(allMoves) {
    let bestScore = -Infinity
    let bestMove = null

    allMoves.forEach((move) => {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      // 评估移动后的局面
      let score = this.evaluateBoard()

      // 如果能吃将，直接选择
      if (originalPiece && originalPiece.type === "king") {
        score = Infinity
      }

      // 检查是否将军
      const opponentColor = COLORS.RED
      const checkResult = this.chessRules.isInCheck(opponentColor)
      if (checkResult.isCheck) {
        score += 80 // 将军加分
      }

      // 检查是否形成绝杀
      const checkmateResult = this.chessRules.isCheckmate(opponentColor)
      if (checkmateResult.isCheckmate) {
        score = Infinity // 绝杀
      }

      // 检查对手的威胁
      const opponentMoves = this.chessRules.getAllPossibleMoves(COLORS.RED)
      let maxThreat = 0
      let canCaptureKing = false
      let canBeCheckmated = false

      for (const oppMove of opponentMoves) {
        if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol) && this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type === "king") {
          canCaptureKing = true
        } else if (this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol)) {
          maxThreat = Math.max(maxThreat, PIECE_VALUES[this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol).type])
        }

        // 检查对手的移动是否形成绝杀
        const tempPiece = this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol)
        this.chessBoard.setPiece(oppMove.toRow, oppMove.toCol, this.chessBoard.getPiece(oppMove.fromRow, oppMove.fromCol))
        this.chessBoard.setPiece(oppMove.fromRow, oppMove.fromCol, null)

        if (this.chessRules.isCheckmate(COLORS.BLACK).isCheckmate) {
          canBeCheckmated = true
        }

        // 恢复
        this.chessBoard.setPiece(oppMove.fromRow, oppMove.fromCol, this.chessBoard.getPiece(oppMove.toRow, oppMove.toCol))
        this.chessBoard.setPiece(oppMove.toRow, oppMove.toCol, tempPiece)
      }

      if (canCaptureKing) {
        score = -Infinity
      } else if (canBeCheckmated) {
        score = -Infinity * 0.9 // 几乎绝杀
      } else {
        score -= maxThreat * 0.8
      }

      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })

    return bestMove
  }

  // 大师级：专业水平
  selectMoveMaster(allMoves) {
    // 使用 Alpha-Beta 剪枝算法进行深度搜索
    return this.alphaBetaSearch(allMoves, 3) // 3步深度搜索
  }

  // 特级大师：顶尖水平
  selectMoveGrandmaster(allMoves) {
    return this.alphaBetaSearch(allMoves, 4) // 4步深度搜索
  }

  // 全国第一：最高水平
  selectMoveChampion(allMoves) {
    return this.alphaBetaSearch(allMoves, 5) // 5步深度搜索
  }

  // Alpha-Beta 剪枝搜索算法
  alphaBetaSearch(allMoves, depth) {
    let bestScore = -Infinity
    let bestMove = null

    for (const move of allMoves) {
      // 模拟移动
      const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
      this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
      this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

      // 评估位置
      const score = -this.alphaBetaMinimax(depth - 1, -Infinity, Infinity, false)

      // 恢复棋局
      this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
      this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  // Minimax 递归函数
  alphaBetaMinimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return this.evaluateBoard()
    }

    const color = isMaximizing ? COLORS.BLACK : COLORS.RED
    const moves = this.chessRules.getAllPossibleMoves(color)

    if (moves.length === 0) {
      // 检查是否被将死
      if (this.chessRules.isInCheck(color).isCheck) {
        return isMaximizing ? -Infinity : Infinity
      } else {
        return 0 // 和棋
      }
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
        this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

        const evaluation = this.alphaBetaMinimax(depth - 1, alpha, beta, false)
        maxEval = Math.max(maxEval, evaluation)

        this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
        this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

        alpha = Math.max(alpha, eval)
        if (beta <= alpha) {
          break // Alpha-Beta 剪枝
        }
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const originalPiece = this.chessBoard.getPiece(move.toRow, move.toCol)
        this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, null)

        const evaluation = this.alphaBetaMinimax(depth - 1, alpha, beta, true)
        minEval = Math.min(minEval, evaluation)

        this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
        this.chessBoard.setPiece(move.toRow, move.toCol, originalPiece)

        beta = Math.min(beta, eval)
        if (beta <= alpha) {
          break // Alpha-Beta 剪枝
        }
      }
      return minEval
    }
  }

  // 计算最佳移动
  calculateBestMove(difficulty, aiColor = COLORS.BLACK) {
    const allMoves = this.chessRules.getAllPossibleMoves(aiColor)
    if (allMoves.length === 0) return null

    switch (difficulty) {
      case AI_DIFFICULTY.NOVICE:
        return this.selectMoveEasy(allMoves)
      case AI_DIFFICULTY.ONE_STAR:
        return this.selectMoveOneStar(allMoves, aiColor)
      case AI_DIFFICULTY.TWO_STAR:
        return this.selectMoveTwoStar(allMoves)
      case AI_DIFFICULTY.THREE_STAR:
        return this.selectMoveThreeStar(allMoves)
      case AI_DIFFICULTY.FOUR_STAR:
        return this.selectMoveFourStar(allMoves, aiColor)
      case AI_DIFFICULTY.FIVE_STAR:
        return this.selectMoveFiveStar(allMoves)
      case AI_DIFFICULTY.SIX_STAR:
        return this.selectMoveSixStar(allMoves, aiColor)
      case AI_DIFFICULTY.SEVEN_STAR:
        return this.selectMoveSevenStar(allMoves)
      case AI_DIFFICULTY.EIGHT_STAR:
        return this.selectMoveEightStar(allMoves)
      case AI_DIFFICULTY.NINE_STAR:
        return this.selectMoveNineStar(allMoves)
      case AI_DIFFICULTY.MASTER:
        return this.selectMoveMaster(allMoves)
      case AI_DIFFICULTY.GRANDMASTER:
        return this.selectMoveGrandmaster(allMoves)
      case AI_DIFFICULTY.CHAMPION:
        return this.selectMoveChampion(allMoves)
      default:
        return this.selectMoveOneStar(allMoves, aiColor)
    }
  }

  minimax(depth, isMaximizing, alpha, beta, aiColor) {
    if (depth === 0) return this.evaluateBoard(aiColor)

    const currentColor = isMaximizing ? aiColor : this.getOpponentColor(aiColor)
    const moves = this.chessRules.getAllPossibleMoves(currentColor)

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const original = this.chessBoard.getPiece(move.toRow, move.toCol)
        this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, null)
        let evalScore = this.minimax(depth - 1, false, alpha, beta, aiColor)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
        this.chessBoard.setPiece(move.toRow, move.toCol, original)
        maxEval = Math.max(maxEval, evalScore)
        alpha = Math.max(alpha, evalScore)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const original = this.chessBoard.getPiece(move.toRow, move.toCol)
        this.chessBoard.setPiece(move.toRow, move.toCol, move.piece)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, null)
        let evalScore = this.minimax(depth - 1, true, alpha, beta, aiColor)
        this.chessBoard.setPiece(move.fromRow, move.fromCol, move.piece)
        this.chessBoard.setPiece(move.toRow, move.toCol, original)
        minEval = Math.min(minEval, evalScore)
        beta = Math.min(beta, evalScore)
        if (beta <= alpha) break
      }
      return minEval
    }
  }
}
