<template>
  <div class="gomoku-wrapper">
    <header class="game-header">
      <h2 class="game-title">五子棋 · 雅弈</h2>
      <div class="game-info">
        <div class="status-badge" :class="currentPlayer">
          {{ winner ? "对局结束" : currentPlayer === "black" ? "黑方回合" : "白方回合" }}
        </div>
        <div v-if="isAIThinking" class="ai-loader">AI 思考中...</div>
      </div>
    </header>

    <main class="board-container" ref="boardRef" @click="onBoardClick">
      <div v-for="i in BOARD_SIZE" :key="'h' + i" class="line-h" :style="getLineStyle(i, 'h')"></div>
      <div v-for="i in BOARD_SIZE" :key="'v' + i" class="line-v" :style="getLineStyle(i, 'v')"></div>

      <div v-for="point in starPoints" :key="point.join(',')" class="star-point" :style="getStarStyle(point)"></div>

      <template v-for="(row, rIdx) in board" :key="'r' + rIdx">
        <div v-for="(cell, cIdx) in row" :key="'c' + cIdx">
          <transition name="fade">
            <div v-if="cell" :class="['piece', cell, 'placed']" :style="getPieceStyle(rIdx, cIdx)">
              <div v-if="isLastMove(rIdx, cIdx)" class="last-mark"></div>
            </div>
          </transition>
        </div>
      </template>
    </main>

    <footer class="game-footer">
      <div class="control-panel">
        <div class="select-group">
          <select v-model="gameMode" @change="resetGame">
            <option value="pve">人机对战</option>
            <option value="pvp">同屏双人</option>
          </select>
          <select v-if="gameMode === 'pve'" v-model="difficulty">
            <option value="easy">入门</option>
            <option value="medium">进阶</option>
          </select>
        </div>
        <div class="btn-group">
          <button @click="undoMove" :disabled="moveHistory.length === 0 || !!winner" class="btn-secondary">悔棋</button>
          <button @click="resetGame" class="btn-primary">重开一局</button>
        </div>
      </div>

      <div v-if="winner" class="win-banner">
        <span class="win-text">{{ winner === "black" ? "黑方" : "白方" }} 胜出！</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from "vue"
import "./gomoku/style.css" // 确保路径正确
import { BOARD_SIZE, Player, Board, GameMode, Difficulty } from "./gomoku/types"
import { initializeBoard, placePiece, checkWin } from "./gomoku/board"
import { getBestMove } from "./gomoku/ai"

// 核心状态
const board = ref<Board>(initializeBoard())
const currentPlayer = ref<Player>("black")
const gameMode = ref<GameMode>("pve")
const difficulty = ref<Difficulty>("medium")
const moveHistory = ref<[number, number][]>([])
const winner = ref<Player>(null)
const isAIThinking = ref(false)
const boardRef = ref<HTMLElement | null>(null)

// 棋盘星位坐标 (15x15标准)
const starPoints = [
  [3, 3],
  [3, 11],
  [11, 3],
  [11, 11],
  [7, 7],
]

// --- 响应式布局计算逻辑 ---
const getBoardMetrics = () => {
  const width = boardRef.value?.clientWidth || 360 // 默认宽度
  const padding = width * 0.06 // 边距占6%
  const spacing = (width - padding * 2) / (BOARD_SIZE - 1)
  return { padding, spacing }
}

const getLineStyle = (i: number, type: "h" | "v") => {
  const { padding, spacing } = getBoardMetrics()
  const pos = (i - 1) * spacing + padding
  return type === "h" ? { top: `${pos}px`, left: `${padding}px`, right: `${padding}px` } : { left: `${pos}px`, top: `${padding}px`, bottom: `${padding}px` }
}

const getStarStyle = (point: number[]) => {
  const { padding, spacing } = getBoardMetrics()
  return {
    top: `${point[0] * spacing + padding}px`,
    left: `${point[1] * spacing + padding}px`,
  }
}

const getPieceStyle = (r: number, c: number) => {
  const { padding, spacing } = getBoardMetrics()
  const size = spacing * 0.9 // 棋子占格子90%
  return {
    top: `${r * spacing + padding}px`,
    left: `${c * spacing + padding}px`,
    width: `${size}px`,
    height: `${size}px`,
  }
}

// --- 游戏交互逻辑 ---
const isLastMove = (r: number, c: number) => {
  const last = moveHistory.value[moveHistory.value.length - 1]
  return last && last[0] === r && last[1] === c
}

const onBoardClick = (e: MouseEvent) => {
  if (winner.value || isAIThinking.value) return

  const rect = boardRef.value!.getBoundingClientRect()
  const { padding, spacing } = getBoardMetrics()

  const x = e.clientX - rect.left - padding
  const y = e.clientY - rect.top - padding

  const col = Math.round(x / spacing)
  const row = Math.round(y / spacing)

  // 点击精度判定：必须点在交叉点一定半径内
  const dist = Math.sqrt(Math.pow(x - col * spacing, 2) + Math.pow(y - row * spacing, 2))
  if (dist < spacing * 0.45 && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
    if (!board.value[row][col]) {
      handleMove(row, col)
    }
  }
}

const handleMove = async (r: number, c: number) => {
  // 1. 玩家下子
  if (!placePiece(board.value, r, c, currentPlayer.value)) return
  moveHistory.value.push([r, c])

  const winRes = checkWin(board.value, r, c)
  if (winRes) {
    winner.value = currentPlayer.value
    return
  }

  // 2. 回合切换
  currentPlayer.value = currentPlayer.value === "black" ? "white" : "black"

  // 3. 触发 AI
  if (gameMode.value === "pve" && !winner.value) {
    isAIThinking.value = true
    // 延迟500ms模拟思考，增加真实感
    setTimeout(() => {
      const aiMove = getBestMove(board.value, "white", difficulty.value)
      if (placePiece(board.value, aiMove.row, aiMove.col, "white")) {
        moveHistory.value.push([aiMove.row, aiMove.col])
        if (checkWin(board.value, aiMove.row, aiMove.col)) {
          winner.value = "white"
        } else {
          currentPlayer.value = "black"
        }
      }
      isAIThinking.value = false
    }, 600)
  }
}

const undoMove = () => {
  if (isAIThinking.value) return
  const steps = gameMode.value === "pve" ? 2 : 1
  for (let i = 0; i < steps; i++) {
    const last = moveHistory.value.pop()
    if (last) board.value[last[0]][last[1]] = null
  }
  winner.value = null
  currentPlayer.value = moveHistory.value.length % 2 === 0 ? "black" : "white"
}

const resetGame = () => {
  board.value = initializeBoard()
  currentPlayer.value = "black"
  winner.value = null
  moveHistory.value = []
  isAIThinking.value = false
}

// 监听窗口大小变化以重绘
onMounted(() => window.addEventListener("resize", () => {}))
onUnmounted(() => window.removeEventListener("resize", () => {}))
</script>
