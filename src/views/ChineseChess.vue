<template>
  <div class="chess-container">
    <div class="chess-header">
      <h1>在线中国象棋</h1>
      <div class="game-info">
        <div class="current-player">
          当前玩家:
          <span :class="currentPlayer">{{ currentPlayer === "red" ? "红方" : "黑方" }}</span>
        </div>
        <div class="game-status">{{ gameStatus }}</div>
      </div>
      <div class="control-buttons">
        <button @click="startGame" class="btn btn-primary" v-if="!gameStarted && gameMode === 'pvc'">开始游戏</button>
        <button @click="resetGame" class="btn btn-primary" v-else>重新开始</button>
        <button @click="undoMove" :disabled="moveHistory.length === 0" class="btn btn-secondary">悔棋</button>
        <button @click="showTacticsInfo = true" class="btn btn-secondary">战术知识</button>
      </div>

      <!-- 战术信息弹窗 -->
      <Teleport to="body">
        <TacticsInfo :show="showTacticsInfo" @close="showTacticsInfo = false" />
      </Teleport>

      <!-- 游戏模式选择 -->
      <div v-if="!gameStarted" class="game-mode-selector">
        <h3>游戏模式</h3>
        <div class="mode-options">
          <div class="mode-option" :class="{ active: gameMode === 'pvp' }" @click="changeGameMode('pvp')">
            <div class="mode-icon">👥</div>
            <div class="mode-name">双人对战</div>
          </div>
          <div class="mode-option" :class="{ active: gameMode === 'pvc' }" @click="changeGameMode('pvc')">
            <div class="mode-icon">🤖</div>
            <div class="mode-name">人机对战</div>
          </div>
        </div>

        <!-- 玩家颜色选择（仅在人机对战模式下显示） -->
        <div v-if="gameMode === 'pvc'" class="color-selector">
          <h4>选择棋子颜色</h4>
          <div class="color-options">
            <div class="color-option" :class="{ active: playerColor === 'red' }" @click="changePlayerColor('red')">
              <div class="color-preview" :style="getSkinStyle('classic', 'red')">帅</div>
              <div class="color-name">执红先行</div>
            </div>
            <div class="color-option" :class="{ active: playerColor === 'black' }" @click="changePlayerColor('black')">
              <div class="color-preview" :style="getSkinStyle('classic', 'black')">将</div>
              <div class="color-name">执黑后行</div>
            </div>
          </div>
        </div>

        <!-- AI难度选择 -->
        <div v-if="gameMode === 'pvc'" class="difficulty-selector">
          <h4>AI难度</h4>
          <div class="difficulty-options-horizontal">
            <button v-for="level in ['novice', '1star', '2star', '3star', '4star', '5star', '6star', '7star', '8star', '9star', 'master', 'grandmaster', 'champion']" :key="level" class="difficulty-btn" :class="{ active: aiDifficulty === level }" @click="aiDifficulty = level">
              {{ getDifficultyName(level) }}
            </button>
          </div>
        </div>
      </div>

      <!-- 棋子皮肤选择 -->
      <div v-if="!gameStarted" class="skin-selector">
        <h3>选择棋子皮肤</h3>
        <div class="skin-options">
          <div v-for="skin in skinManager.getAllSkins()" :key="skin.id" class="skin-option" :class="{ active: currentSkin === skin.id }" @click="changeSkin(skin.id)">
            <div class="skin-preview">
              <div class="preview-piece red" :style="getSkinStyle(skin.id, 'red')">{{ skin.redSample }}</div>
              <div class="preview-piece black" :style="getSkinStyle(skin.id, 'black')">{{ skin.blackSample }}</div>
            </div>
            <div class="skin-name">{{ skin.name }}</div>
          </div>
        </div>
      </div>

      <!-- 棋盘皮肤选择 -->
      <div v-if="!gameStarted" class="board-skin-selector">
        <h3>选择棋盘皮肤</h3>
        <div class="board-skin-options">
          <div v-for="skin in boardSkins" :key="skin.id" class="board-skin-option" :class="{ active: currentBoardSkin === skin.id }" @click="changeBoardSkin(skin.id)">
            <div class="board-skin-preview" :style="skin.style">
              <div class="board-skin-name">{{ skin.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chess-board-wrapper">
      <!-- 红方被吃棋子 -->
      <div class="captured-pieces red-captured">
        <h4>红方失子</h4>
        <div class="pieces-list">
          <div v-for="(piece, index) in capturedPieces.red" :key="'red-' + index" class="captured-piece" :style="getSkinStyle(currentSkin, 'red')">
            {{ piece.name }}
          </div>
          <div v-if="capturedPieces.red.length === 0" class="no-pieces">无</div>
        </div>
      </div>

      <div class="chess-board" :style="currentBoardSkinStyle" :class="{ flipped: isBoardFlipped }">
        <!-- 棋盘线条 -->
        <svg class="board-lines" viewBox="0 0 540 600" xmlns="http://www.w3.org/2000/svg">
          <!-- 横线 -->
          <line v-for="i in 10" :key="`h-${i}`" :x1="30" :y1="30 + (i - 1) * 60" :x2="510" :y2="30 + (i - 1) * 60" stroke="#000" stroke-width="2" />

          <!-- 竖线（左右完整，中间只到楚河汉界） -->
          <line :x1="30" :y1="30" :x2="30" :y2="570" stroke="#000" stroke-width="3" />
          <line :x1="510" :y1="30" :x2="510" :y2="570" stroke="#000" stroke-width="3" />

          <!-- 中间7条竖线,分段绘制 -->
          <template v-for="i in 7" :key="'v-' + i">
            <line :x1="30 + i * 60" :y1="30" :x2="30 + i * 60" :y2="270" stroke="#000" stroke-width="2" />
            <line :x1="30 + i * 60" :y1="330" :x2="30 + i * 60" :y2="570" stroke="#000" stroke-width="2" />
          </template>

          <!-- 九宫格斜线 -->
          <line :x1="210" :y1="30" :x2="330" :y2="150" stroke="#000" stroke-width="2" />
          <line :x1="330" :y1="30" :x2="210" :y2="150" stroke="#000" stroke-width="2" />
          <line :x1="210" :y1="450" :x2="330" :y2="570" stroke="#000" stroke-width="2" />
          <line :x1="330" :y1="450" :x2="210" :y2="570" stroke="#000" stroke-width="2" />

          <!-- 楚河汉界文字 -->
          <text x="150" y="300" font-size="30" font-family="Arial, sans-serif" font-weight="bold" fill="rgba(0,0,0,0.6)">楚河</text>
          <text x="360" y="300" font-size="30" font-family="Arial, sans-serif" font-weight="bold" fill="rgba(0,0,0,0.6)">汉界</text>

          <!-- 动态水流效果 -->
          <defs>
            <linearGradient id="river-water" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#87CEEB" stop-opacity="0.7" />
              <stop offset="50%" stop-color="#4682B4" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#1E90FF" stop-opacity="0.3" />
            </linearGradient>
            <pattern id="waves" x="0" y="0" width="40" height="10" patternUnits="userSpaceOnUse">
              <path d="M0,5 Q10,0 20,5 T40,5" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1" />
            </pattern>
          </defs>

          <!-- 河流区域 -->
          <rect x="30" y="270" width="480" height="60" fill="url(#river-water)" opacity="0.4" />
          <rect x="30" y="270" width="480" height="60" fill="url(#waves)" opacity="0.3" />

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
        <div v-for="(row, rowIndex) in 10" :key="`row-${rowIndex}`" class="board-row" :style="{ top: 30 + rowIndex * 60 + 'px' }">
          <div
            v-for="(col, colIndex) in 9"
            :key="`point-${rowIndex}-${colIndex}`"
            class="board-point"
            :style="{ left: 30 + colIndex * 60 + 'px' }"
            :class="{
              selected: selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex,
              'valid-move': isValidMovePosition(rowIndex, colIndex),
            }"
            @click="handleCellClick(rowIndex, colIndex)"
          >
            <!-- 棋子 -->
            <div v-if="chessBoard.getPiece(rowIndex, colIndex)" class="chess-piece" :class="[chessBoard.getPiece(rowIndex, colIndex).color, { selected: selectedPiece && selectedPiece.row === rowIndex && selectedPiece.col === colIndex }]" :style="getSkinStyle(currentSkin, chessBoard.getPiece(rowIndex, colIndex).color)" :data-row="rowIndex" :data-col="colIndex">
              {{ chessBoard.getPiece(rowIndex, colIndex).name }}
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
            <div
              class="checkmate-piece"
              :style="{
                fontSize: '180px',
                color: checkmateEffect.color === 'red' ? '#ff4444' : '#333',
              }"
            >
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
            <div v-for="(round, index) in formattedHistory" :key="index" class="history-row">
              <div class="history-cell round-num">{{ index + 1 }}</div>
              <div class="history-cell red-move">{{ round.red || "-" }}</div>
              <div class="history-cell black-move">{{ round.black || "-" }}</div>
            </div>
            <div v-if="moveHistory.length === 0" class="empty-history">暂无棋谱</div>
          </div>
        </div>
      </div>

      <!-- 黑方被吃棋子 -->
      <div class="captured-pieces black-captured">
        <h4>黑方失子</h4>
        <div class="pieces-list">
          <div v-for="(piece, index) in capturedPieces.black" :key="'black-' + index" class="captured-piece" :style="getSkinStyle(currentSkin, 'black')">
            {{ piece.name }}
          </div>
          <div v-if="capturedPieces.black.length === 0" class="no-pieces">无</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { ChessBoard, ChessRules, ChessAI, ChessSkin, BOARD_SIZE } from "./chess"
import TacticsInfo from "./chess/TacticsInfo.vue"

// 初始化游戏引擎
const chessBoard = new ChessBoard()
const chessRules = new ChessRules(chessBoard)
const chessAI = new ChessAI(chessBoard, chessRules)
const skinManager = new ChessSkin()

// 游戏状态
const currentPlayer = ref("red")
const selectedPiece = ref(null)
const validMoves = ref([])
const moveHistory = ref([])
const gameStatus = ref("游戏进行中")
const gameStarted = ref(false)
const currentSkin = ref("classic")

// 被吃掉的棋子
const capturedPieces = ref({
  red: [],
  black: [],
})

// 游戏模式和 AI 设置
const gameMode = ref("pvp")
const aiDifficulty = ref("novice")
const isAiThinking = ref(false)

// 玩家颜色选择
const playerColor = ref("red") // 玩家选择的颜色

// 将军提示
const checkWarning = ref({
  isCheck: false,
  checkedColor: "",
})

// 绝杀特效
const checkmateEffect = ref({
  show: false,
  pieceName: "",
  killType: "",
  color: "",
})

// 战术信息显示
const showTacticsInfo = ref(false)

// 棋盘皮肤
const currentBoardSkin = ref("classic")
const boardSkins = ref([
  {
    id: "classic",
    name: "经典木纹",
    style: {
      background: "linear-gradient(45deg, #e8c4a8 0%, #d4a574 100%)",
      border: "3px solid #8b5a3c",
    },
  },
  {
    id: "wood",
    name: "深色木纹",
    style: {
      background: "linear-gradient(45deg, #8b4513 0%, #5d2906 100%)",
      border: "3px solid #4a2004",
    },
  },
  {
    id: "bamboo",
    name: "竹纹",
    style: {
      background: "linear-gradient(45deg, #d2b48c 0%, #b8860b 100%)",
      border: "3px solid #8b6914",
    },
  },
  {
    id: "marble",
    name: "大理石",
    style: {
      background: "linear-gradient(45deg, #f5f5f5 0%, #e0e0e0 100%)",
      border: "3px solid #9e9e9e",
    },
  },
  {
    id: "emerald",
    name: "翡翠绿",
    style: {
      background: "linear-gradient(45deg, #50c878 0%, #2e8b57 100%)",
      border: "3px solid #006400",
    },
  },
])

// 格式化棋谱
const formattedHistory = computed(() => {
  const rounds = []
  for (let i = 0; i < moveHistory.value.length; i += 2) {
    const redMove = moveHistory.value[i]
    const blackMove = moveHistory.value[i + 1]
    rounds.push({
      red: redMove ? `${redMove.piece}${redMove.from}${redMove.to}` : "",
      black: blackMove ? `${blackMove.piece}${blackMove.from}${blackMove.to}` : "",
    })
  }
  return rounds
})

// 兵/卒位置标记
const pawnMarkers = computed(() => {
  const markers = []
  const blackPawnCols = [0, 2, 4, 6, 8]
  const redPawnCols = [0, 2, 4, 6, 8]

  if (isBoardFlipped.value) {
    // 当棋盘翻转时（玩家执黑），位置也要相应调整
    redPawnCols.forEach((col) => {
      markers.push({ x: 30 + col * 60, y: 30 + 3 * 60, key: `rp-${col}` })
    })
    blackPawnCols.forEach((col) => {
      markers.push({ x: 30 + col * 60, y: 30 + 6 * 60, key: `bp-${col}` })
    })
  } else {
    blackPawnCols.forEach((col) => {
      markers.push({ x: 30 + col * 60, y: 30 + 3 * 60, key: `bp-${col}` })
    })
    redPawnCols.forEach((col) => {
      markers.push({ x: 30 + col * 60, y: 30 + 6 * 60, key: `rp-${col}` })
    })
  }

  return markers
})

// 炮位置标记
const cannonMarkers = computed(() => {
  if (isBoardFlipped.value) {
    // 当棋盘翻转时（玩家执黑），位置也要相应调整
    return [
      { x: 30 + 1 * 60, y: 30 + 7 * 60, key: "rc1" },
      { x: 30 + 7 * 60, y: 30 + 7 * 60, key: "rc2" },
      { x: 30 + 1 * 60, y: 30 + 2 * 60, key: "bc1" },
      { x: 30 + 7 * 60, y: 30 + 2 * 60, key: "bc2" },
    ]
  } else {
    return [
      { x: 30 + 1 * 60, y: 30 + 2 * 60, key: "bc1" },
      { x: 30 + 7 * 60, y: 30 + 2 * 60, key: "bc2" },
      { x: 30 + 1 * 60, y: 30 + 7 * 60, key: "rc1" },
      { x: 30 + 7 * 60, y: 30 + 7 * 60, key: "rc2" },
    ]
  }
})

// 获取皮肤样式
const getSkinStyle = (skinId, color) => {
  return skinManager.getSkinStyle(skinId, color)
}

// 切换棋子皮肤
const changeSkin = (skinId) => {
  if (gameStarted.value) return
  currentSkin.value = skinId
}

// 切换棋盘皮肤
const changeBoardSkin = (skinId) => {
  if (gameStarted.value) return
  currentBoardSkin.value = skinId
}

// 获取难度名称
const getDifficultyName = (level) => {
  const names = {
    novice: "新手",
    "1star": "一星棋士",
    "2star": "二星棋士",
    "3star": "三星棋士",
    "4star": "四星棋士",
    "5star": "五星棋士",
    "6star": "六星棋士",
    "7star": "七星棋士",
    "8star": "八星棋士",
    "9star": "九星棋士",
    master: "大师",
    grandmaster: "特级大师",
    champion: "全国第一",
  }
  return names[level] || level
}

// 切换玩家颜色
const changePlayerColor = (color) => {
  if (gameStarted.value) return
  playerColor.value = color
}

// 开始游戏
const startGame = () => {
  if (gameMode.value === "pvc") {
    // 根据玩家选择的颜色设置初始玩家
    if (playerColor.value === "red") {
      currentPlayer.value = "red" // 玩家执红先行
    } else {
      currentPlayer.value = "red" // 玩家执黑，AI执红先行（永远是红方先走）
    }

    // 如果玩家选择执黑，AI（红方）先走
    if (playerColor.value === "black") {
      setTimeout(() => {
        aiMove()
      }, 500)
    }
  } else {
    currentPlayer.value = "red" // 双人对战默认红方先行
  }

  gameStarted.value = true
}

// 切换游戏模式
const changeGameMode = (mode) => {
  if (gameStarted.value) return
  gameMode.value = mode
}

// 当前棋盘皮肤样式
const currentBoardSkinStyle = computed(() => {
  const skin = boardSkins.value.find((s) => s.id === currentBoardSkin.value)
  return skin
    ? skin.style
    : {
        background: "linear-gradient(45deg, #e8c4a8 0%, #d4a574 100%)",
        border: "3px solid #8b5a3c",
      }
})

// 棋盘是否需要翻转（当玩家执黑时）
const isBoardFlipped = computed(() => {
  return gameMode.value === "pvc" && playerColor.value === "black"
})

// 检查是否是有效移动位置
const isValidMovePosition = (row, col) => {
  return validMoves.value.some((move) => move.row === row && move.col === col)
}

// 处理格子点击
const handleCellClick = (row, col) => {
  // 在人机对战模式下，判断是否是玩家的回合
  if (gameMode.value === "pvc" && currentPlayer.value !== playerColor.value) return
  if (isAiThinking.value) return

  // 确保游戏已开始
  if (!gameStarted.value) return

  const piece = chessBoard.getPiece(row, col)

  if (selectedPiece.value) {
    if (isValidMovePosition(row, col)) {
      movePiece(selectedPiece.value.row, selectedPiece.value.col, row, col)
      selectedPiece.value = null
      validMoves.value = []
    } else if (piece && piece.color === currentPlayer.value) {
      selectedPiece.value = { row, col }
      validMoves.value = chessRules.getValidMoves(row, col)
    } else {
      selectedPiece.value = null
      validMoves.value = []
    }
  } else if (piece && piece.color === currentPlayer.value) {
    selectedPiece.value = { row, col }
    validMoves.value = chessRules.getValidMoves(row, col)
  }
}

// 移动棋子
const movePiece = (fromRow, fromCol, toRow, toCol) => {
  const piece = chessBoard.getPiece(fromRow, fromCol)
  const capturedPiece = chessBoard.movePiece(fromRow, fromCol, toRow, toCol)

  if (capturedPiece) {
    capturedPieces.value[capturedPiece.color].push(capturedPiece)
  }

  moveHistory.value.push({
    piece: piece.name,
    from: `${String.fromCharCode(65 + fromCol)}${10 - fromRow}`,
    to: `${String.fromCharCode(65 + toCol)}${10 - toRow}`,
    fromRow,
    fromCol,
    toRow,
    toCol,
    capturedPiece,
  })

  if (capturedPiece && capturedPiece.type === "king") {
    const killType = chessRules.analyzeCheckmateType(piece, { row: toRow, col: toCol }, { row: toRow, col: toCol })

    checkmateEffect.value = {
      show: true,
      pieceName: piece.name,
      killType: killType,
      color: piece.color,
    }

    gameStatus.value = `${currentPlayer.value === "red" ? "红方" : "黑方"}获胜！${killType}`

    setTimeout(() => {
      alert(gameStatus.value)
    }, 2000)
  } else {
    currentPlayer.value = currentPlayer.value === "red" ? "black" : "red"

    const opponentColor = currentPlayer.value
    const checkmateResult = chessRules.isCheckmate(opponentColor)

    if (checkmateResult.isCheckmate) {
      const kingPos = chessBoard.findKing(opponentColor)
      const killType = chessRules.analyzeCheckmateType(checkmateResult.killerPiece, checkmateResult.killerPos, kingPos)

      checkmateEffect.value = {
        show: true,
        pieceName: checkmateResult.killerPiece.name,
        killType: killType,
        color: checkmateResult.killerPiece.color,
      }

      checkWarning.value = { isCheck: false, checkedColor: "" }

      const winner = opponentColor === "red" ? "黑方" : "红方"
      gameStatus.value = `${winner}获胜！${killType}`

      setTimeout(() => {
        alert(gameStatus.value)
      }, 2000)
    } else {
      const checkResult = chessRules.isInCheck(opponentColor)
      if (checkResult.isCheck) {
        checkWarning.value = {
          isCheck: true,
          checkedColor: opponentColor,
        }
        gameStatus.value = `将军！${opponentColor === "red" ? "红方" : "黑方"}被将军`

        setTimeout(() => {
          checkWarning.value = { isCheck: false, checkedColor: "" }
          gameStatus.value = "游戏进行中"
        }, 2000)
      } else {
        checkWarning.value = { isCheck: false, checkedColor: "" }
        gameStatus.value = "游戏进行中"
      }
    }

    // 在非将死的情况下，如果是在PvC模式且轮到AI，则触发AI移动
    const aiColor = playerColor.value === "red" ? "black" : "red"
    if (gameMode.value === "pvc" && currentPlayer.value === aiColor && (checkmateResult ? !checkmateResult.isCheckmate : true)) {
      setTimeout(() => {
        aiMove()
      }, 500)
    }
  }
}

// AI 移动
const aiMove = () => {
  if (isAiThinking.value) return

  isAiThinking.value = true
  gameStatus.value = 'AI思考中...'

  // 确定 AI 的颜色：如果玩家是黑，AI 就是红；如果玩家是红，AI 就是黑
  const aiColor = playerColor.value === 'red' ? 'black' : 'red'
  const bestMove = chessAI.calculateBestMove(aiDifficulty.value, aiColor)

  if (!bestMove) {
    gameStatus.value = '红方获胜！'
    isAiThinking.value = false
    return
  }

  setTimeout(() => {
    movePiece(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol)
    isAiThinking.value = false
    gameStatus.value = '游戏进行中'
  }, 300)
}

// 悔棋
const undoMove = () => {
  if (moveHistory.value.length === 0) return

  let steps = 1
  if (gameMode.value === "pvc") {
    // 在人机对战模式下，根据玩家选择的颜色确定悔棋步数
    const aiColor = playerColor.value === "red" ? "black" : "red"
    // 如果最后一步是AI走的，则悔两步（AI和玩家各一步）
    if (moveHistory.value[moveHistory.value.length - 1].piece.color === aiColor) {
      steps = 2
    }
  }

  for (let i = 0; i < steps && moveHistory.value.length > 0; i++) {
    const lastMove = moveHistory.value.pop()
    chessBoard.setPiece(lastMove.fromRow, lastMove.fromCol, chessBoard.getPiece(lastMove.toRow, lastMove.toCol))
    chessBoard.setPiece(lastMove.toRow, lastMove.toCol, lastMove.capturedPiece || null)

    if (lastMove.capturedPiece) {
      const color = lastMove.capturedPiece.color
      const index = capturedPieces.value[color].findIndex((p) => p.name === lastMove.capturedPiece.name && p.type === lastMove.capturedPiece.type)
      if (index !== -1) {
        capturedPieces.value[color].splice(index, 1)
      }
    }

    // 根据玩家颜色来切换
    currentPlayer.value = currentPlayer.value === "red" ? "black" : "red"
  }

  selectedPiece.value = null
  validMoves.value = []
  gameStatus.value = "游戏进行中"
}


// 重新开始
const resetGame = () => {
  chessBoard.initBoard()
  // 根据游戏模式和玩家选择设置初始玩家
  if (gameMode.value === "pvc") {
    if (playerColor.value === "red") {
      currentPlayer.value = "red"
    } else {
      currentPlayer.value = "red" // 永远是红方先行
      // 如果玩家选黑，说明红方是 AI，需要立即触发 AI 走棋
      setTimeout(() => {
        aiMove()
      }, 500)
    }
  } else {
    currentPlayer.value = "red" // 双人对战默认红方先行
  }
  selectedPiece.value = null
  validMoves.value = []
  moveHistory.value = []
  gameStatus.value = "游戏进行中"
  gameStarted.value = false
  isAiThinking.value = false
  checkWarning.value = { isCheck: false, checkedColor: "" }
  checkmateEffect.value = { show: false, pieceName: "", killType: "", color: "" }
  capturedPieces.value = {
    red: [],
    black: [],
  }
}
</script>

<style scoped>
@import "./chess/styles.css";
</style>
