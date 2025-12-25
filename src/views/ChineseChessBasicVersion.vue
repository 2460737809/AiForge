<template>
  <div class="chess-container">
    <div class="chess-header">
      <h1>在线中国象棋</h1>
      <div class="game-info">
        <div class="current-player">
          当前玩家: <span :class="currentPlayer">{{ currentPlayer === 'red' ? '红方' : '黑方' }}</span>
        </div>
        <div class="game-status">{{ gameStatus }}</div>
      </div>
      <div class="control-buttons">
        <button @click="resetGame" class="btn btn-primary">重新开始</button>
        <button @click="undoMove" :disabled="moveHistory.length === 0" class="btn btn-secondary">悔棋</button>
      </div>
      
      <!-- 游戏模式选择 -->
      <div v-if="!gameStarted" class="game-mode-selector">
        <h3>游戏模式</h3>
        <div class="mode-options">
          <div 
            class="mode-option"
            :class="{ 'active': gameMode === 'pvp' }"
            @click="changeGameMode('pvp')"
          >
            <div class="mode-icon">👥</div>
            <div class="mode-name">双人对战</div>
          </div>
          <div 
            class="mode-option"
            :class="{ 'active': gameMode === 'pvc' }"
            @click="changeGameMode('pvc')"
          >
            <div class="mode-icon">🤖</div>
            <div class="mode-name">人机对战</div>
          </div>
        </div>
        
        <!-- AI难度选择 -->
        <div v-if="gameMode === 'pvc'" class="difficulty-selector">
          <h4>AI难度</h4>
          <div class="difficulty-options">
            <button 
              v-for="level in ['easy', 'normal', 'hard']"
              :key="level"
              class="difficulty-btn"
              :class="{ 'active': aiDifficulty === level }"
              @click="aiDifficulty = level"
            >
              {{ level === 'easy' ? '简单' : level === 'normal' ? '普通' : '困难' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 棋子皮肤选择 -->
      <div v-if="!gameStarted" class="skin-selector">
        <h3>选择棋子皮肤</h3>
        <div class="skin-options">
          <div 
            v-for="skin in skins" 
            :key="skin.id"
            class="skin-option"
            :class="{ 'active': currentSkin === skin.id }"
            @click="changeSkin(skin.id)"
          >
            <div class="skin-preview">
              <div class="preview-piece red" :style="getSkinStyle(skin.id, 'red')">{{ skin.redSample }}</div>
              <div class="preview-piece black" :style="getSkinStyle(skin.id, 'black')">{{ skin.blackSample }}</div>
            </div>
            <div class="skin-name">{{ skin.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chess-board-wrapper">
      <!-- 红方被吃棋子 -->
      <div class="captured-pieces red-captured">
        <h4>红方失子</h4>
        <div class="pieces-list">
          <div
            v-for="(piece, index) in capturedPieces.red"
            :key="'red-' + index"
            class="captured-piece"
            :style="getSkinStyle(currentSkin, 'red')"
          >
            {{ piece.name }}
          </div>
          <div v-if="capturedPieces.red.length === 0" class="no-pieces">无</div>
        </div>
      </div>

      <div class="chess-board">
        <!-- 棋盘线条 -->
        <svg class="board-lines" viewBox="0 0 540 600" xmlns="http://www.w3.org/2000/svg">
          <!-- 横线 -->
          <line v-for="i in 10" :key="`h-${i}`" 
                :x1="30" :y1="30 + (i - 1) * 60" 
                :x2="510" :y2="30 + (i - 1) * 60" 
                stroke="#000" stroke-width="2" />
          
          <!-- 竖线（左右完整，中间只到楚河汉界） -->
          <!-- 左右两条完整竖线 -->
          <line :x1="30" :y1="30" :x2="30" :y2="570" stroke="#000" stroke-width="3" />
          <line :x1="510" :y1="30" :x2="510" :y2="570" stroke="#000" stroke-width="3" />
          
          <!-- 中间7条竖线,分段绘制 -->
          <template v-for="i in 7" :key="'v-' + i">
            <line :x1="30 + i * 60" :y1="30" :x2="30 + i * 60" :y2="270" stroke="#000" stroke-width="2" />
            <line :x1="30 + i * 60" :y1="330" :x2="30 + i * 60" :y2="570" stroke="#000" stroke-width="2" />
          </template>
          
          <!-- 九宫格斜线 -->
          <!-- 上方九宫格 -->
          <line :x1="210" :y1="30" :x2="330" :y2="150" stroke="#000" stroke-width="2" />
          <line :x1="330" :y1="30" :x2="210" :y2="150" stroke="#000" stroke-width="2" />
          <!-- 下方九宫格 -->
          <line :x1="210" :y1="450" :x2="330" :y2="570" stroke="#000" stroke-width="2" />
          <line :x1="330" :y1="450" :x2="210" :y2="570" stroke="#000" stroke-width="2" />
          
          <!-- 兵/卒位置标记 -->
          <g v-for="pos in pawnMarkers" :key="pos.key">
            <line :x1="pos.x - 8" :y1="pos.y - 8" :x2="pos.x - 3" :y2="pos.y - 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y - 8" :x2="pos.x - 8" :y2="pos.y - 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y - 8" :x2="pos.x + 3" :y2="pos.y - 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y - 8" :x2="pos.x + 8" :y2="pos.y - 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y + 8" :x2="pos.x - 3" :y2="pos.y + 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y + 8" :x2="pos.x - 8" :y2="pos.y + 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y + 8" :x2="pos.x + 3" :y2="pos.y + 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y + 8" :x2="pos.x + 8" :y2="pos.y + 3" stroke="#000" stroke-width="1.5" />
          </g>
          
          <!-- 炮位置标记 -->
          <g v-for="pos in cannonMarkers" :key="pos.key">
            <line :x1="pos.x - 8" :y1="pos.y - 8" :x2="pos.x - 3" :y2="pos.y - 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y - 8" :x2="pos.x - 8" :y2="pos.y - 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y - 8" :x2="pos.x + 3" :y2="pos.y - 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y - 8" :x2="pos.x + 8" :y2="pos.y - 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y + 8" :x2="pos.x - 3" :y2="pos.y + 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x - 8" :y1="pos.y + 8" :x2="pos.x - 8" :y2="pos.y + 3" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y + 8" :x2="pos.x + 3" :y2="pos.y + 8" stroke="#000" stroke-width="1.5" />
            <line :x1="pos.x + 8" :y1="pos.y + 8" :x2="pos.x + 8" :y2="pos.y + 3" stroke="#000" stroke-width="1.5" />
          </g>
        </svg>
        
        <!-- 交叉点（用于点击） -->
        <div
          v-for="(row, rowIndex) in 10"
          :key="`row-${rowIndex}`"
          class="board-row"
          :style="{ top: (30 + rowIndex * 60) + 'px' }"
        >
          <div
            v-for="(col, colIndex) in 9"
            :key="`point-${rowIndex}-${colIndex}`"
            class="board-point"
            :style="{ left: (30 + colIndex * 60) + 'px' }"
            :class="{ 
              'selected': selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex,
              'valid-move': isValidMovePosition(rowIndex, colIndex)
            }"
            @click="handleCellClick(rowIndex, colIndex)"
          >
            <!-- 棋子 -->
            <div
              v-if="board[rowIndex][colIndex]"
              class="chess-piece"
              :class="[
                board[rowIndex][colIndex].color,
                { 'selected': selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex }
              ]"
              :style="getSkinStyle(currentSkin, board[rowIndex][colIndex].color)"
            >
              {{ board[rowIndex][colIndex].name }}
            </div>
          </div>
        </div>
        
        <!-- 将军提示 -->
        <div v-if="checkWarning.isCheck" class="check-warning">
          <div class="warning-text">将军！</div>
        </div>
        
        <!-- 绝杀特效 -->
        <transition name="checkmate">
          <div v-if="checkmateEffect.show" class="checkmate-effect">
            <div class="checkmate-piece" :style="{
              fontSize: '180px',
              color: checkmateEffect.color === 'red' ? '#ff4444' : '#333'
            }">
              {{ checkmateEffect.pieceName }}
            </div>
            <div class="checkmate-text">绝杀！</div>
            <div class="checkmate-subtext">{{ checkmateEffect.killType }}</div>
          </div>
        </transition>
      </div>

      <!-- 移动历史 -->
      <div class="move-history">
        <h3>棋谱记录</h3>
        <div class="history-table">
          <div class="history-header">
            <div class="header-cell">回合</div>
            <div class="header-cell">红方</div>
            <div class="header-cell">黑方</div>
          </div>
          <div class="history-body">
            <div
              v-for="(round, index) in formattedHistory"
              :key="index"
              class="history-row"
            >
              <div class="history-cell round-num">{{ index + 1 }}</div>
              <div class="history-cell red-move">{{ round.red || '-' }}</div>
              <div class="history-cell black-move">{{ round.black || '-' }}</div>
            </div>
            <div v-if="moveHistory.length === 0" class="empty-history">暂无棋谱</div>
          </div>
        </div>
      </div>

      <!-- 黑方被吃棋子 -->
      <div class="captured-pieces black-captured">
        <h4>黑方失子</h4>
        <div class="pieces-list">
          <div
            v-for="(piece, index) in capturedPieces.black"
            :key="'black-' + index"
            class="captured-piece"
            :style="getSkinStyle(currentSkin, 'black')"
          >
            {{ piece.name }}
          </div>
          <div v-if="capturedPieces.black.length === 0" class="no-pieces">无</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 棋盘状态
const board = ref([])
const currentPlayer = ref('red') // red 或 black
const selectedPiece = ref(null)
const validMoves = ref([])
const moveHistory = ref([])
const gameStatus = ref('游戏进行中')
const gameStarted = ref(false)
const currentSkin = ref('classic')
// 被吃掉的棋子
const capturedPieces = ref({
  red: [],
  black: []
})
// 游戏模式和 AI 设置
const gameMode = ref('pvp') // 'pvp' 或 'pvc'
const aiDifficulty = ref('normal') // 'easy', 'normal', 'hard'
const isAiThinking = ref(false)
// 将军提示
const checkWarning = ref({
  isCheck: false,
  checkedColor: '' // 被将军的一方
})
// 绝杀特效
const checkmateEffect = ref({
  show: false,
  pieceName: '',
  killType: '',
  color: ''
})

// 棋子皮肤配置
const skins = ref([
  {
    id: 'classic',
    name: '经典样式',
    redSample: '帅',
    blackSample: '将',
    red: {
      background: 'radial-gradient(circle, #ff6b6b, #ee5a6f)',
      border: '#c92a2a',
      color: '#fff'
    },
    black: {
      background: 'radial-gradient(circle, #495057, #212529)',
      border: '#000',
      color: '#fff'
    }
  },
  {
    id: 'wood',
    name: '木质纹理',
    redSample: '帅',
    blackSample: '将',
    red: {
      background: 'linear-gradient(135deg, #d4a574 0%, #c8956e 100%)',
      border: '#8b5a3c',
      color: '#8b0000'
    },
    black: {
      background: 'linear-gradient(135deg, #654321 0%, #3e2723 100%)',
      border: '#1a0d00',
      color: '#ffd700'
    }
  },
  {
    id: 'jade',
    name: '青玉风格',
    redSample: '帅',
    blackSample: '将',
    red: {
      background: 'linear-gradient(135deg, #ffebcd 0%, #ffd700 100%)',
      border: '#b8860b',
      color: '#8b0000'
    },
    black: {
      background: 'linear-gradient(135deg, #2f4f4f 0%, #1c3d3d 100%)',
      border: '#0a1a1a',
      color: '#f0f8ff'
    }
  },
  {
    id: 'modern',
    name: '现代简约',
    redSample: '帅',
    blackSample: '将',
    red: {
      background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
      border: '#8b2e5a',
      color: '#fff'
    },
    black: {
      background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
      border: '#1a202c',
      color: '#fff'
    }
  }
])

// 格式化棋谱为回合制
const formattedHistory = computed(() => {
  const rounds = []
  for (let i = 0; i < moveHistory.value.length; i += 2) {
    const redMove = moveHistory.value[i]
    const blackMove = moveHistory.value[i + 1]
    rounds.push({
      red: redMove ? `${redMove.piece}${redMove.from}${redMove.to}` : '',
      black: blackMove ? `${blackMove.piece}${blackMove.from}${blackMove.to}` : ''
    })
  }
  return rounds
})

// 获取皮肤样式
const getSkinStyle = (skinId, color) => {
  const skin = skins.value.find(s => s.id === skinId)
  if (!skin) return {}
  const style = skin[color]
  return {
    background: style.background,
    borderColor: style.border,
    color: style.color
  }
}

// 切换皮肤
const changeSkin = (skinId) => {
  if (gameStarted.value) return
  currentSkin.value = skinId
}

// 切换游戏模式
const changeGameMode = (mode) => {
  if (gameStarted.value) return
  gameMode.value = mode
}

// 兵/卒位置标记（炮架）
const pawnMarkers = computed(() => {
  const markers = []
  // 黑方卒
  const blackPawnCols = [0, 2, 4, 6, 8]
  blackPawnCols.forEach(col => {
    markers.push({ x: 30 + col * 60, y: 30 + 3 * 60, key: `bp-${col}` })
  })
  // 红方兵
  const redPawnCols = [0, 2, 4, 6, 8]
  redPawnCols.forEach(col => {
    markers.push({ x: 30 + col * 60, y: 30 + 6 * 60, key: `rp-${col}` })
  })
  return markers
})

// 炮位置标记
const cannonMarkers = computed(() => {
  return [
    { x: 30 + 1 * 60, y: 30 + 2 * 60, key: 'bc1' },
    { x: 30 + 7 * 60, y: 30 + 2 * 60, key: 'bc2' },
    { x: 30 + 1 * 60, y: 30 + 7 * 60, key: 'rc1' },
    { x: 30 + 7 * 60, y: 30 + 7 * 60, key: 'rc2' }
  ]
})

// 初始化棋盘
const initBoard = () => {
  const newBoard = Array(10).fill(null).map(() => Array(9).fill(null))
  
  // 红方棋子
  newBoard[9][0] = { name: '车', color: 'red', type: 'rook' }
  newBoard[9][1] = { name: '马', color: 'red', type: 'knight' }
  newBoard[9][2] = { name: '相', color: 'red', type: 'elephant' }
  newBoard[9][3] = { name: '仕', color: 'red', type: 'advisor' }
  newBoard[9][4] = { name: '帅', color: 'red', type: 'king' }
  newBoard[9][5] = { name: '仕', color: 'red', type: 'advisor' }
  newBoard[9][6] = { name: '相', color: 'red', type: 'elephant' }
  newBoard[9][7] = { name: '马', color: 'red', type: 'knight' }
  newBoard[9][8] = { name: '车', color: 'red', type: 'rook' }
  newBoard[7][1] = { name: '炮', color: 'red', type: 'cannon' }
  newBoard[7][7] = { name: '炮', color: 'red', type: 'cannon' }
  newBoard[6][0] = { name: '兵', color: 'red', type: 'pawn' }
  newBoard[6][2] = { name: '兵', color: 'red', type: 'pawn' }
  newBoard[6][4] = { name: '兵', color: 'red', type: 'pawn' }
  newBoard[6][6] = { name: '兵', color: 'red', type: 'pawn' }
  newBoard[6][8] = { name: '兵', color: 'red', type: 'pawn' }
  
  // 黑方棋子
  newBoard[0][0] = { name: '车', color: 'black', type: 'rook' }
  newBoard[0][1] = { name: '马', color: 'black', type: 'knight' }
  newBoard[0][2] = { name: '象', color: 'black', type: 'elephant' }
  newBoard[0][3] = { name: '士', color: 'black', type: 'advisor' }
  newBoard[0][4] = { name: '将', color: 'black', type: 'king' }
  newBoard[0][5] = { name: '士', color: 'black', type: 'advisor' }
  newBoard[0][6] = { name: '象', color: 'black', type: 'elephant' }
  newBoard[0][7] = { name: '马', color: 'black', type: 'knight' }
  newBoard[0][8] = { name: '车', color: 'black', type: 'rook' }
  newBoard[2][1] = { name: '炮', color: 'black', type: 'cannon' }
  newBoard[2][7] = { name: '炮', color: 'black', type: 'cannon' }
  newBoard[3][0] = { name: '卒', color: 'black', type: 'pawn' }
  newBoard[3][2] = { name: '卒', color: 'black', type: 'pawn' }
  newBoard[3][4] = { name: '卒', color: 'black', type: 'pawn' }
  newBoard[3][6] = { name: '卒', color: 'black', type: 'pawn' }
  newBoard[3][8] = { name: '卒', color: 'black', type: 'pawn' }
  
  board.value = newBoard
}

// 获取有效移动位置（不过滤将军检查，用于内部将军检测）
const getValidMovesRaw = (row, col) => {
  const piece = board.value[row][col]
  if (!piece) return []
  
  const moves = []
  
  switch (piece.type) {
    case 'rook': // 车
      // 横向和纵向移动
      for (let i = 0; i < 10; i++) {
        if (i !== row && (!board.value[i][col] || board.value[i][col].color !== piece.color)) {
          if (isPathClear(row, col, i, col)) moves.push({ row: i, col })
        }
      }
      for (let j = 0; j < 9; j++) {
        if (j !== col && (!board.value[row][j] || board.value[row][j].color !== piece.color)) {
          if (isPathClear(row, col, row, j)) moves.push({ row, col: j })
        }
      }
      break
      
    case 'knight': // 马
      const knightMoves = [
        { dr: -2, dc: -1, legRow: -1, legCol: 0 }, // 上上左
        { dr: -2, dc: 1, legRow: -1, legCol: 0 },  // 上上右
        { dr: -1, dc: -2, legRow: 0, legCol: -1 }, // 左左上
        { dr: -1, dc: 2, legRow: 0, legCol: 1 },   // 右右上
        { dr: 1, dc: -2, legRow: 0, legCol: -1 },  // 左左下
        { dr: 1, dc: 2, legRow: 0, legCol: 1 },    // 右右下
        { dr: 2, dc: -1, legRow: 1, legCol: 0 },   // 下下左
        { dr: 2, dc: 1, legRow: 1, legCol: 0 }     // 下下右
      ]
      knightMoves.forEach(({ dr, dc, legRow, legCol }) => {
        const newRow = row + dr
        const newCol = col + dc
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 9) {
          if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
            // 检查马腿（蹩马腿）
            const blockRow = row + legRow
            const blockCol = col + legCol
            if (!board.value[blockRow][blockCol]) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      })
      break
      
    case 'cannon': // 炮
      // 炮的移动规则（需要跳过一个棋子吃子）
      for (let i = 0; i < 10; i++) {
        if (i !== row) {
          const target = board.value[i][col]
          if (!target) {
            if (isPathClear(row, col, i, col)) moves.push({ row: i, col })
          } else if (target.color !== piece.color) {
            if (hasOneJump(row, col, i, col)) moves.push({ row: i, col })
          }
        }
      }
      for (let j = 0; j < 9; j++) {
        if (j !== col) {
          const target = board.value[row][j]
          if (!target) {
            if (isPathClear(row, col, row, j)) moves.push({ row, col: j })
          } else if (target.color !== piece.color) {
            if (hasOneJump(row, col, row, j)) moves.push({ row, col: j })
          }
        }
      }
      break
      
    case 'pawn': // 兵/卒
      if (piece.color === 'red') {
        if (row > 0 && (!board.value[row - 1][col] || board.value[row - 1][col].color !== piece.color)) {
          moves.push({ row: row - 1, col })
        }
        if (row < 5) { // 过河
          if (col > 0 && (!board.value[row][col - 1] || board.value[row][col - 1].color !== piece.color)) {
            moves.push({ row, col: col - 1 })
          }
          if (col < 8 && (!board.value[row][col + 1] || board.value[row][col + 1].color !== piece.color)) {
            moves.push({ row, col: col + 1 })
          }
        }
      } else {
        if (row < 9 && (!board.value[row + 1][col] || board.value[row + 1][col].color !== piece.color)) {
          moves.push({ row: row + 1, col })
        }
        if (row >= 5) { // 过河
          if (col > 0 && (!board.value[row][col - 1] || board.value[row][col - 1].color !== piece.color)) {
            moves.push({ row, col: col - 1 })
          }
          if (col < 8 && (!board.value[row][col + 1] || board.value[row][col + 1].color !== piece.color)) {
            moves.push({ row, col: col + 1 })
          }
        }
      }
      break
      
    case 'king': // 帅/将
      const kingMoves = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      kingMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (piece.color === 'red') {
          if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        } else {
          if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      })
      break
      
    case 'advisor': // 士/仕
      const advisorMoves = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      advisorMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (piece.color === 'red') {
          if (newRow >= 7 && newRow <= 9 && newCol >= 3 && newCol <= 5) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        } else {
          if (newRow >= 0 && newRow <= 2 && newCol >= 3 && newCol <= 5) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              moves.push({ row: newRow, col: newCol })
            }
          }
        }
      })
      break
      
    case 'elephant': // 相/象
      const elephantMoves = [[-2, -2], [-2, 2], [2, -2], [2, 2]]
      elephantMoves.forEach(([dr, dc]) => {
        const newRow = row + dr
        const newCol = col + dc
        if (piece.color === 'red') {
          if (newRow >= 5 && newRow <= 9 && newCol >= 0 && newCol < 9) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              // 检查象眼
              const blockRow = row + dr / 2
              const blockCol = col + dc / 2
              if (!board.value[blockRow][blockCol]) {
                moves.push({ row: newRow, col: newCol })
              }
            }
          }
        } else {
          if (newRow >= 0 && newRow <= 4 && newCol >= 0 && newCol < 9) {
            if (!board.value[newRow][newCol] || board.value[newRow][newCol].color !== piece.color) {
              // 检查象眼
              const blockRow = row + dr / 2
              const blockCol = col + dc / 2
              if (!board.value[blockRow][blockCol]) {
                moves.push({ row: newRow, col: newCol })
              }
            }
          }
        }
      })
      break
  }
  
  return moves
}

// 获取有效移动位置（带将军检查过滤）
const getValidMoves = (row, col) => {
  const piece = board.value[row][col]
  if (!piece) return []
  
  const moves = getValidMovesRaw(row, col)
  
  // 关键：过滤掉会让自己继续处于将军状态的移动
  return filterMovesToEscapeCheck(piece.color, row, col, moves)
}

// 过滤移动：只保留能解除将军的移动
const filterMovesToEscapeCheck = (color, fromRow, fromCol, moves) => {
  // 检查当前是否被将军
  const checkResult = isInCheck(color)
  
  // 如果没有被将军，但仍然需要过滤不能送将的移动
  const validMoves = []
  
  for (const move of moves) {
    // 模拟移动
    const piece = board.value[fromRow][fromCol]
    const originalPiece = board.value[move.row][move.col]
    board.value[move.row][move.col] = piece
    board.value[fromRow][fromCol] = null
    
    // 检查移动后是否还在将军状态
    const stillInCheck = isInCheck(color).isCheck
    
    // 恢复棋局
    board.value[fromRow][fromCol] = piece
    board.value[move.row][move.col] = originalPiece
    
    // 如果移动后不在将军状态，则是有效移动
    if (!stillInCheck) {
      validMoves.push(move)
    }
  }
  
  return validMoves
}

// 检查路径是否畅通
const isPathClear = (fromRow, fromCol, toRow, toCol) => {
  if (fromRow === toRow) {
    const start = Math.min(fromCol, toCol)
    const end = Math.max(fromCol, toCol)
    for (let i = start + 1; i < end; i++) {
      if (board.value[fromRow][i]) return false
    }
  } else if (fromCol === toCol) {
    const start = Math.min(fromRow, toRow)
    const end = Math.max(fromRow, toRow)
    for (let i = start + 1; i < end; i++) {
      if (board.value[i][fromCol]) return false
    }
  }
  return true
}

// 检查炮是否隔一个子
const hasOneJump = (fromRow, fromCol, toRow, toCol) => {
  let jumpCount = 0
  if (fromRow === toRow) {
    const start = Math.min(fromCol, toCol)
    const end = Math.max(fromCol, toCol)
    for (let i = start + 1; i < end; i++) {
      if (board.value[fromRow][i]) jumpCount++
    }
  } else if (fromCol === toCol) {
    const start = Math.min(fromRow, toRow)
    const end = Math.max(fromRow, toRow)
    for (let i = start + 1; i < end; i++) {
      if (board.value[i][fromCol]) jumpCount++
    }
  }
  return jumpCount === 1
}

// 检查是否是有效移动位置
const isValidMovePosition = (row, col) => {
  return validMoves.value.some(move => move.row === row && move.col === col)
}

// 处理格子点击
const handleCellClick = (row, col) => {
  // 如果是人机模式且轮到AI，不允许点击
  if (gameMode.value === 'pvc' && currentPlayer.value === 'black') return
  // AI思考中不允许点击
  if (isAiThinking.value) return
  
  // 第一次移动开始游戏
  if (!gameStarted.value && moveHistory.value.length === 0) {
    gameStarted.value = true
  }
  
  const piece = board.value[row][col]
  
  if (selectedPiece.value) {
    // 已选中棋子，尝试移动
    if (isValidMovePosition(row, col)) {
      movePiece(selectedPiece.value.row, selectedPiece.value.col, row, col)
      selectedPiece.value = null
      validMoves.value = []
    } else if (piece && piece.color === currentPlayer.value) {
      // 选择同色棋子
      selectedPiece.value = { row, col }
      validMoves.value = getValidMoves(row, col)
    } else {
      selectedPiece.value = null
      validMoves.value = []
    }
  } else if (piece && piece.color === currentPlayer.value) {
    // 选择棋子
    selectedPiece.value = { row, col }
    validMoves.value = getValidMoves(row, col)
  }
}

// 移动棋子
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const piece = board.value[fromRow][fromCol]
  const capturedPiece = board.value[toRow][toCol]
  
  // 记录被吃的棋子
  if (capturedPiece) {
    capturedPieces.value[capturedPiece.color].push(capturedPiece)
  }
  
  // 记录移动历史
  moveHistory.value.push({
    piece: piece.name,
    from: `${String.fromCharCode(65 + fromCol)}${10 - fromRow}`,
    to: `${String.fromCharCode(65 + toCol)}${10 - toRow}`,
    fromRow,
    fromCol,
    toRow,
    toCol,
    capturedPiece
  })
  
  // 执行移动
  board.value[toRow][toCol] = piece
  board.value[fromRow][fromCol] = null
  
  // 检查是否吃掉将/帅
  if (capturedPiece && capturedPiece.type === 'king') {
    // 绝杀特效
    const kingPos = { row: toRow, col: toCol }
    const killType = analyzeCheckmateType(piece, { row: toRow, col: toCol }, kingPos)
    
    checkmateEffect.value = {
      show: true,
      pieceName: piece.name,
      killType: killType,
      color: piece.color
    }
    
    gameStatus.value = `${currentPlayer.value === 'red' ? '红方' : '黑方'}获胜！${killType}`
    
    setTimeout(() => {
      alert(gameStatus.value)
    }, 2000)
  } else {
    // 切换玩家
    currentPlayer.value = currentPlayer.value === 'red' ? 'black' : 'red'
    
    // 检查将军和绝杀
    const opponentColor = currentPlayer.value
    const checkmateResult = isCheckmate(opponentColor)
    
    if (checkmateResult.isCheckmate) {
      // 绝杀！
      const kingPos = findKing(opponentColor)
      const killType = analyzeCheckmateType(
        checkmateResult.killerPiece, 
        checkmateResult.killerPos, 
        kingPos
      )
      
      checkmateEffect.value = {
        show: true,
        pieceName: checkmateResult.killerPiece.name,
        killType: killType,
        color: checkmateResult.killerPiece.color
      }
      
      checkWarning.value = { isCheck: false, checkedColor: '' }
      
      const winner = opponentColor === 'red' ? '黑方' : '红方'
      gameStatus.value = `${winner}获胜！${killType}`
      
      setTimeout(() => {
        alert(gameStatus.value)
      }, 2000)
    } else {
      // 检查是否将军
      const checkResult = isInCheck(opponentColor)
      if (checkResult.isCheck) {
        checkWarning.value = {
          isCheck: true,
          checkedColor: opponentColor
        }
        gameStatus.value = `将军！${opponentColor === 'red' ? '红方' : '黑方'}被将军`
        
        // 2秒后清除将军提示
        setTimeout(() => {
          checkWarning.value = { isCheck: false, checkedColor: '' }
          gameStatus.value = '游戏进行中'
        }, 2000)
      } else {
        checkWarning.value = { isCheck: false, checkedColor: '' }
        gameStatus.value = '游戏进行中'
      }
    }
    
    // 如果是人机模式且轮到AI，触发AI移动
    if (gameMode.value === 'pvc' && currentPlayer.value === 'black' && !checkmateResult.isCheckmate) {
      setTimeout(() => {
        aiMove()
      }, 500) // 稍微延迟让玩家看到移动
    }
  }
}

// 悔棋
const undoMove = () => {
  if (moveHistory.value.length === 0) return
  
  // 人机模式下，悔棋需要悔两步（玩家和AI）
  const steps = gameMode.value === 'pvc' ? 2 : 1
  
  for (let i = 0; i < steps && moveHistory.value.length > 0; i++) {
    const lastMove = moveHistory.value.pop()
    board.value[lastMove.fromRow][lastMove.fromCol] = board.value[lastMove.toRow][lastMove.toCol]
    board.value[lastMove.toRow][lastMove.toCol] = lastMove.capturedPiece || null
    
    // 恢复被吃的棋子
    if (lastMove.capturedPiece) {
      const color = lastMove.capturedPiece.color
      const index = capturedPieces.value[color].findIndex(
        p => p.name === lastMove.capturedPiece.name && p.type === lastMove.capturedPiece.type
      )
      if (index !== -1) {
        capturedPieces.value[color].splice(index, 1)
      }
    }
    
    currentPlayer.value = currentPlayer.value === 'red' ? 'black' : 'red'
  }
  
  selectedPiece.value = null
  validMoves.value = []
  gameStatus.value = '游戏进行中'
}

// 重新开始
const resetGame = () => {
  initBoard()
  currentPlayer.value = 'red'
  selectedPiece.value = null
  validMoves.value = []
  moveHistory.value = []
  gameStatus.value = '游戏进行中'
  gameStarted.value = false
  // 清空AI状态
  isAiThinking.value = false
  // 清空将军和绝杀状态
  checkWarning.value = { isCheck: false, checkedColor: '' }
  checkmateEffect.value = { show: false, pieceName: '', killType: '', color: '' }
  // 清空被吃棋子
  capturedPieces.value = {
    red: [],
    black: []
  }
}

// ========== 将军和绝杀检测 ==========

// 找到指定颜色的将/帅位置
const findKing = (color) => {
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === color && piece.type === 'king') {
        return { row, col }
      }
    }
  }
  return null
}

// 检查指定颜色是否被将军
const isInCheck = (color) => {
  const kingPos = findKing(color)
  if (!kingPos) return false
  
  const opponentColor = color === 'red' ? 'black' : 'red'
  
  // 检查所有对方棋子是否能攻击到将/帅
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === opponentColor) {
        // 使用不过滤将军检查的版本，避免循环调用
        const moves = getValidMovesRaw(row, col)
        if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
          return { isCheck: true, attackerPiece: piece, attackerPos: { row, col } }
        }
      }
    }
  }
  
  return { isCheck: false }
}

// 检查是否被将死（无法解除将军）
const isCheckmate = (color) => {
  const checkResult = isInCheck(color)
  if (!checkResult.isCheck) return { isCheckmate: false }
  
  // 尝试所有可能的移动，看是否能解除将军
  const allMoves = getAllPossibleMoves(color)
  
  for (const move of allMoves) {
    // 模拟移动
    const originalPiece = board.value[move.toRow][move.toCol]
    board.value[move.toRow][move.toCol] = move.piece
    board.value[move.fromRow][move.fromCol] = null
    
    // 检查是否还在将军状态
    const stillInCheck = isInCheck(color).isCheck
    
    // 恢复棋局
    board.value[move.fromRow][move.fromCol] = move.piece
    board.value[move.toRow][move.toCol] = originalPiece
    
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
const analyzeCheckmateType = (killerPiece, killerPos, kingPos) => {
  const types = []
  
  // 检测是否有其他棋子配合
  const opponentColor = killerPiece.color
  let supportCount = 0
  
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === opponentColor && piece.type !== 'king') {
        // 使用不过滤将军检查的版本
        const moves = getValidMovesRaw(row, col)
        // 检查是否能攻击到将/帅附近
        if (moves.some(move => 
          Math.abs(move.row - kingPos.row) <= 1 && Math.abs(move.col - kingPos.col) <= 1
        )) {
          supportCount++
        }
      }
    }
  }
  
  // 根据棋子类型命名
  switch (killerPiece.type) {
    case 'rook':
      return supportCount > 1 ? '重车绝杀' : '车类绝杀'
    case 'cannon':
      return supportCount > 1 ? '重炮绝杀' : '炮类绝杀'
    case 'knight':
      return supportCount > 0 ? '马后炮绝杀' : '马类绝杀'
    case 'pawn':
      return '兵(卒)绝杀'
    default:
      return '绝杀'
  }
}

// ========== AI 逻辑 ==========

// 棋子价值表
const pieceValues = {
  king: 10000,
  advisor: 200,
  elephant: 200,
  knight: 400,
  rook: 900,
  cannon: 450,
  pawn: 100
}

// 评估棋子价值
const evaluatePiece = (piece, row, col) => {
  if (!piece) return 0
  
  let value = pieceValues[piece.type]
  
  // 兵/卒过河加分
  if (piece.type === 'pawn') {
    if (piece.color === 'red' && row < 5) value += 50
    if (piece.color === 'black' && row >= 5) value += 50
  }
  
  // 中心控制加分
  if (col >= 3 && col <= 5 && row >= 3 && row <= 6) {
    value += 20
  }
  
  return piece.color === 'black' ? value : -value
}

// 评估棋局
const evaluateBoard = () => {
  let score = 0
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      score += evaluatePiece(board.value[row][col], row, col)
    }
  }
  return score
}

// 获取所有可能的移动
const getAllPossibleMoves = (color) => {
  const moves = []
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board.value[row][col]
      if (piece && piece.color === color) {
        const validMovesForPiece = getValidMoves(row, col)
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

// AI移动逻辑
const aiMove = () => {
  if (isAiThinking.value) return
  
  isAiThinking.value = true
  gameStatus.value = 'AI思考中...'
  
  const allMoves = getAllPossibleMoves('black')
  
  if (allMoves.length === 0) {
    gameStatus.value = '红方获胜！'
    isAiThinking.value = false
    return
  }
  
  let bestMove = null
  
  if (aiDifficulty.value === 'easy') {
    // 简单难度：随机选择
    bestMove = allMoves[Math.floor(Math.random() * allMoves.length)]
  } else if (aiDifficulty.value === 'normal') {
    // 普通难度：优先吃子，其次评估位置
    let bestScore = -Infinity
    
    allMoves.forEach(move => {
      const targetPiece = board.value[move.toRow][move.toCol]
      let score = 0
      
      // 能吃子的优先考虑
      if (targetPiece) {
        score = pieceValues[targetPiece.type]
      } else {
        // 不吃子则评估位置价值
        score = Math.random() * 50
      }
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })
  } else {
    // 困难难度：简单搜索算法
    let bestScore = -Infinity
    
    allMoves.forEach(move => {
      // 模拟移动
      const originalPiece = board.value[move.toRow][move.toCol]
      board.value[move.toRow][move.toCol] = move.piece
      board.value[move.fromRow][move.fromCol] = null
      
      // 评估局面
      let score = evaluateBoard()
      
      // 如果能吃将，直接选择
      if (originalPiece && originalPiece.type === 'king') {
        score = Infinity
      }
      
      // 恢复棋局
      board.value[move.fromRow][move.fromCol] = move.piece
      board.value[move.toRow][move.toCol] = originalPiece
      
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    })
  }
  
  // 执行AI移动
  if (bestMove) {
    setTimeout(() => {
      movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol)
      isAiThinking.value = false
      gameStatus.value = '游戏进行中'
    }, 300)
  }
}

// 初始化游戏
initBoard()
</script>

<style scoped>
.chess-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.chess-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.chess-header h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 20px;
  font-size: 1.2rem;
}

.current-player span {
  font-weight: bold;
  padding: 4px 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.2);
}

.current-player span.red {
  color: #ff4444;
}

.current-player span.black {
  color: #333;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

/* 游戏模式选择 */
.game-mode-selector {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.game-mode-selector h3 {
  text-align: center;
  color: #333;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.mode-option {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
  text-align: center;
}

.mode-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.mode-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.mode-name {
  font-size: 1.1rem;
  color: #333;
  font-weight: 500;
}

.difficulty-selector {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #e0e0e0;
}

.difficulty-selector h4 {
  text-align: center;
  color: #666;
  margin-bottom: 10px;
  font-size: 1rem;
}

.difficulty-options {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.difficulty-btn {
  padding: 8px 20px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  color: #666;
}

.difficulty-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.difficulty-btn.active {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.skin-selector {
  margin-top: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.skin-selector h3 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
  font-size: 1.3rem;
}

.skin-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.skin-option {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 3px solid transparent;
  text-align: center;
}

.skin-option:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.skin-option.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.skin-preview {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
}

.preview-piece {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  border: 3px solid;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.skin-name {
  font-size: 0.95rem;
  color: #666;
  font-weight: 500;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-primary {
  background: #409eff;
  color: white;
}

.btn-primary:hover {
  background: #66b1ff;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #67c23a;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #85ce61;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chess-board-wrapper {
  display: flex;
  justify-content: center;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

.chess-board {
  position: relative;
  background: #f5deb3;
  padding: 0;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: inline-block;
  width: 540px;
  height: 600px;
}

.board-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.board-row {
  display: flex;
  position: absolute;
  width: 100%;
  height: 0;
  left: 0;
}

.board-point {
  width: 50px;
  height: 50px;
  position: absolute;
  cursor: pointer;
  transition: background-color 0.2s;
  /* 让点击区域居中在交叉点 */
  transform: translate(-50%, -50%);
}

.board-point::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background-color 0.2s;
  pointer-events: none;
}

.board-point:hover::after {
  background: rgba(100, 149, 237, 0.3);
}

.board-point.selected::after {
  background: rgba(255, 215, 0, 0.6);
  width: 12px;
  height: 12px;
}

.board-point.valid-move::after {
  background: #4caf50;
  width: 10px;
  height: 10px;
}

.chess-piece {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s;
  border: 3px solid;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.chess-piece:hover {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}

.chess-piece.selected {
  animation: pulse 0.6s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

/* 将军提示 */
.check-warning {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  pointer-events: none;
}

.warning-text {
  font-size: 80px;
  font-weight: bold;
  color: #ff4444;
  text-shadow: 
    0 0 20px rgba(255, 68, 68, 0.8),
    0 0 40px rgba(255, 68, 68, 0.6),
    3px 3px 6px rgba(0, 0, 0, 0.5);
  animation: checkWarning 0.5s ease-in-out infinite alternate;
}

@keyframes checkWarning {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* 绝杀特效 */
.checkmate-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.85);
  z-index: 2000;
  pointer-events: none;
}

.checkmate-piece {
  font-weight: bold;
  text-shadow: 
    0 0 30px currentColor,
    0 0 60px currentColor,
    5px 5px 10px rgba(0, 0, 0, 0.8);
  animation: checkmateZoom 1.5s ease-out;
  opacity: 0.3;
  margin-bottom: 20px;
}

.checkmate-text {
  font-size: 100px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 
    0 0 30px rgba(255, 215, 0, 0.8),
    0 0 60px rgba(255, 215, 0, 0.6),
    5px 5px 15px rgba(0, 0, 0, 0.8);
  animation: checkmateFlash 1s ease-in-out;
  margin-bottom: 10px;
}

.checkmate-subtext {
  font-size: 40px;
  font-weight: bold;
  color: #fff;
  text-shadow: 
    0 0 20px rgba(255, 255, 255, 0.8),
    3px 3px 8px rgba(0, 0, 0, 0.8);
  animation: checkmateSlide 1s ease-out 0.3s both;
}

@keyframes checkmateZoom {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

@keyframes checkmateFlash {
  0%, 50%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  25%, 75% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

@keyframes checkmateSlide {
  0% {
    transform: translateY(30px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.checkmate-enter-active {
  animation: checkmateEnter 0.5s ease-out;
}

.checkmate-leave-active {
  animation: checkmateLeave 0.5s ease-in;
}

@keyframes checkmateEnter {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes checkmateLeave {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}



.move-history {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
  width: 350px;
  max-height: 640px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.move-history h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #409eff;
  padding-bottom: 10px;
  font-size: 1.1rem;
}

/* 被吃棋子区域 */
.captured-pieces {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 20px;
  width: 200px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.captured-pieces h4 {
  margin-bottom: 15px;
  color: #333;
  text-align: center;
  font-size: 1.1rem;
  padding-bottom: 10px;
}

.red-captured h4 {
  border-bottom: 2px solid #ff6b6b;
}

.black-captured h4 {
  border-bottom: 2px solid #495057;
}

.pieces-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  min-height: 50px;
}

.captured-piece {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  border: 2px solid;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

.no-pieces {
  color: #999;
  font-size: 0.9rem;
  text-align: center;
  padding: 10px;
  width: 100%;
}

.history-table {
  width: 100%;
}

.history-header {
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  background: #409eff;
  color: white;
  font-weight: bold;
  border-radius: 4px 4px 0 0;
}

.header-cell {
  padding: 10px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.header-cell:last-child {
  border-right: none;
}

.history-body {
  max-height: 500px;
  overflow-y: auto;
}

.history-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  border-bottom: 1px solid #e0e0e0;
}

.history-row:hover {
  background: #f5f5f5;
}

.history-cell {
  padding: 8px;
  text-align: center;
  color: #333;
  font-size: 0.9rem;
  border-right: 1px solid #e0e0e0;
}

.history-cell:last-child {
  border-right: none;
}

.round-num {
  font-weight: bold;
  background: #f5f5f5;
  color: #666;
}

.red-move {
  color: #d32f2f;
  font-weight: 500;
}

.black-move {
  color: #333;
  font-weight: 500;
}

.empty-history {
  text-align: center;
  color: #999;
  padding: 20px;
  font-style: italic;
}

@media (max-width: 1200px) {
  .chess-board-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .move-history {
    width: 100%;
    max-width: 600px;
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .chess-header h1 {
    font-size: 1.8rem;
  }

  .game-info {
    flex-direction: column;
    gap: 10px;
  }

  .board-cell {
    width: 40px;
    height: 40px;
  }

  .chess-piece {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .river-text {
    font-size: 1rem;
    padding: 0 15px;
  }
}
</style>
