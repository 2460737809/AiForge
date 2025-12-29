<template>
  <div class="game-container">
    <div ref="gameCanvas" class="game-canvas"></div>
    <div class="game-ui">
      <div class="controls-info">
        <h3>操作说明</h3>
        <div class="key-item">
          <span class="key">W</span> 或 <span class="key">↑</span> 向前移动
        </div>
        <div class="key-item">
          <span class="key">S</span> 或 <span class="key">↓</span> 向后移动
        </div>
        <div class="key-item">
          <span class="key">A</span> 或 <span class="key">←</span> 向左移动
        </div>
        <div class="key-item">
          <span class="key">D</span> 或 <span class="key">→</span> 向右移动
        </div>
        <div class="key-item">
          <span class="key">空格</span> 跳跃
        </div>
        <div class="key-item">
          <span class="key">Shift</span> 加速跑
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">位置:</span>
          <span class="stat-value">({{ playerPosition.x.toFixed(1) }}, {{ playerPosition.z.toFixed(1) }})</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">速度:</span>
          <span class="stat-value">{{ currentSpeed.toFixed(1) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

interface Vector3 {
  x: number
  y: number
  z: number
}

const gameCanvas = ref<HTMLElement | null>(null)
const playerPosition = ref<Vector3>({ x: 0, y: 0, z: 0 })
const currentSpeed = ref(0)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let player: THREE.Group
let clock: THREE.Clock
let keys: Map<string, boolean> = new Map()

const MOVE_SPEED = 5
const RUN_SPEED = 10
const JUMP_FORCE = 8
const GRAVITY = 20
const PLAYER_HEIGHT = 1.8

let velocityY = 0
let isJumping = false
let isRunning = false

const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 50, 100)

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 10, 15)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  if (gameCanvas.value) {
    gameCanvas.value.appendChild(renderer.domElement)
  }

  clock = new THREE.Clock()
}

const createLighting = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(50, 50, 25)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 150
  directionalLight.shadow.camera.left = -50
  directionalLight.shadow.camera.right = 50
  directionalLight.shadow.camera.top = 50
  directionalLight.shadow.camera.bottom = -50
  scene.add(directionalLight)
}

const createGround = () => {
  const groundGeometry = new THREE.PlaneGeometry(100, 100)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d8b3d,
    roughness: 0.8,
    metalness: 0.1
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const gridHelper = new THREE.GridHelper(100, 50, 0x2d6b2d, 0x2d6b2d)
  gridHelper.position.y = 0.01
  scene.add(gridHelper)
}

const createPlayer = () => {
  player = new THREE.Group()

  const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 16)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a90d9,
    roughness: 0.5,
    metalness: 0.1
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1.1
  body.castShadow = true
  player.add(body)

  const headGeometry = new THREE.SphereGeometry(0.25, 16, 16)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.5,
    metalness: 0
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = 1.8
  head.castShadow = true
  player.add(head)

  const leftArmGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8)
  const leftArmMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90d9 })
  const leftArm = new THREE.Mesh(leftArmGeometry, leftArmMaterial)
  leftArm.position.set(-0.45, 1.1, 0)
  leftArm.rotation.z = Math.PI / 6
  leftArm.castShadow = true
  player.add(leftArm)

  const rightArmGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8)
  const rightArmMaterial = new THREE.MeshStandardMaterial({ color: 0x4a90d9 })
  const rightArm = new THREE.Mesh(rightArmGeometry, rightArmMaterial)
  rightArm.position.set(0.45, 1.1, 0)
  rightArm.rotation.z = -Math.PI / 6
  rightArm.castShadow = true
  player.add(rightArm)

  const leftLegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8)
  const leftLegMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const leftLeg = new THREE.Mesh(leftLegGeometry, leftLegMaterial)
  leftLeg.position.set(-0.15, 0.35, 0)
  leftLeg.castShadow = true
  player.add(leftLeg)

  const rightLegGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.7, 8)
  const rightLegMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
  const rightLeg = new THREE.Mesh(rightLegGeometry, rightLegMaterial)
  rightLeg.position.set(0.15, 0.35, 0)
  rightLeg.castShadow = true
  player.add(rightLeg)

  player.position.y = 0
  scene.add(player)
}

const createObstacles = () => {
  const obstacleColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181]

  for (let i = 0; i < 20; i++) {
    const width = 1 + Math.random() * 2
    const height = 1 + Math.random() * 3
    const depth = 1 + Math.random() * 2

    const geometry = new THREE.BoxGeometry(width, height, depth)
    const material = new THREE.MeshStandardMaterial({
      color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
      roughness: 0.5,
      metalness: 0.1
    })
    const obstacle = new THREE.Mesh(geometry, material)

    const x = (Math.random() - 0.5) * 80
    const z = (Math.random() - 0.5) * 80

    if (Math.abs(x) < 3 && Math.abs(z) < 3) continue

    obstacle.position.set(x, height / 2, z)
    obstacle.castShadow = true
    obstacle.receiveShadow = true
    scene.add(obstacle)
  }
}

const createTrees = () => {
  for (let i = 0; i < 30; i++) {
    const tree = new THREE.Group()

    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1
    trunk.castShadow = true
    tree.add(trunk)

    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8)
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
    leaves.position.y = 3.5
    leaves.castShadow = true
    tree.add(leaves)

    const x = (Math.random() - 0.5) * 90
    const z = (Math.random() - 0.5) * 90

    if (Math.abs(x) < 5 && Math.abs(z) < 5) continue

    tree.position.set(x, 0, z)
    scene.add(tree)
  }
}

const setupControls = () => {
  window.addEventListener('keydown', (e) => {
    keys.set(e.code, true)
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      isRunning = true
    }
    if (e.code === 'Space' && !isJumping) {
      velocityY = JUMP_FORCE
      isJumping = true
    }
  })

  window.addEventListener('keyup', (e) => {
    keys.set(e.code, false)
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      isRunning = false
    }
  })
}

const updatePlayer = (delta: number) => {
  const speed = isRunning ? RUN_SPEED : MOVE_SPEED
  let moveX = 0
  let moveZ = 0

  if (keys.get('KeyW') || keys.get('ArrowUp')) moveZ -= 1
  if (keys.get('KeyS') || keys.get('ArrowDown')) moveZ += 1
  if (keys.get('KeyA') || keys.get('ArrowLeft')) moveX -= 1
  if (keys.get('KeyD') || keys.get('ArrowRight')) moveX += 1

  if (moveX !== 0 || moveZ !== 0) {
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
    moveX /= length
    moveZ /= length

    player.position.x += moveX * speed * delta
    player.position.z += moveZ * speed * delta

    const targetRotation = Math.atan2(moveX, moveZ)
    let rotationDiff = targetRotation - player.rotation.y
    while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2
    while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2
    player.rotation.y += rotationDiff * 5 * delta

    currentSpeed.value = speed
  } else {
    currentSpeed.value = 0
  }

  velocityY -= GRAVITY * delta
  player.position.y += velocityY * delta

  if (player.position.y <= 0) {
    player.position.y = 0
    velocityY = 0
    isJumping = false
  }

  playerPosition.value = {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z
  }
}

const updateCamera = () => {
  const cameraOffset = new THREE.Vector3(0, 8, 12)
  const targetPosition = new THREE.Vector3(
    player.position.x + cameraOffset.x,
    player.position.y + cameraOffset.y,
    player.position.z + cameraOffset.z
  )
  camera.position.lerp(targetPosition, 0.05)
  camera.lookAt(player.position.x, player.position.y + 1, player.position.z)
}

const animate = () => {
  requestAnimationFrame(animate)

  const delta = clock.getDelta()
  updatePlayer(delta)
  updateCamera()

  renderer.render(scene, camera)
}

const handleResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  initScene()
  createLighting()
  createGround()
  createPlayer()
  createObstacles()
  createTrees()
  setupControls()
  animate()

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)

  if (renderer) {
    renderer.dispose()
  }

  keys.clear()
})
</script>

<style scoped lang="scss">
.game-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.game-canvas {
  width: 100%;
  height: 100%;
}

.game-ui {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  pointer-events: none;
}

.controls-info {
  background: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);

  h3 {
    margin: 0 0 16px 0;
    font-size: 1.1rem;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
      border-radius: 2px;
    }
  }
}

.key-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 0.9rem;
  color: #555;

  &:last-child {
    margin-bottom: 0;
  }
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 8px;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: #495057;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.stats {
  background: rgba(255, 255, 255, 0.95);
  padding: 16px 20px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.stat-label {
  color: #666;
  font-weight: 500;
}

.stat-value {
  color: #333;
  font-family: monospace;
  font-weight: 600;
}
</style>
