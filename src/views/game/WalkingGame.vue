<template>
  <div class="game-container">
    <div ref="gameCanvas" class="game-canvas" @click="enableMouseControl"></div>
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
        <div class="key-item">
          <span class="key">左键点击</span> 锁定视角
        </div>
        <div class="key-item">
          <span class="key">右键</span> 攻击
        </div>
        <div class="key-item">
          <span class="key">1-5</span> 切换武器
        </div>
        <div class="key-item">
          <span class="key">鼠标移动</span> 旋转视角
        </div>
      </div>
      <div class="player-status">
        <div class="health-bar-container">
          <div class="health-bar">
            <div class="health-fill" :style="{ width: playerHealthPercent + '%' }"></div>
          </div>
          <span class="health-text">❤️ {{ playerHealth.toFixed(0) }} / {{ playerMaxHealth }}</span>
        </div>
        <div class="weapon-selector">
          <div
            v-for="(weapon, index) in weapons"
            :key="weapon.id"
            class="weapon-slot"
            :class="{ active: currentWeaponIndex === index, disabled: !weapon.unlocked }"
            @click="switchWeapon(index)"
          >
            <span class="weapon-icon">{{ weapon.icon }}</span>
            <span class="weapon-name">{{ weapon.name }}</span>
            <span class="weapon-damage">{{ weapon.damage }}</span>
          </div>
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
        <div class="stat-item" :class="{ 'collision-active': isColliding }">
          <span class="stat-label">碰撞状态:</span>
          <span class="stat-value">{{ isColliding ? "⚠️ 碰撞中" : "✅ 正常" }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">敌人:</span>
          <span class="stat-value">{{ enemies.length }} 个</span>
        </div>
      </div>
      <div v-if="!isMouseControlEnabled" class="mouse-hint">点击画面启用鼠标控制视角</div>
    </div>

    <div v-for="enemy in enemies" :key="enemy.id" class="enemy-health-bar" :style="getEnemyHealthBarStyle(enemy)">
      <div class="enemy-health-fill" :style="{ width: (enemy.health / enemy.maxHealth) * 100 + '%' }"></div>
      <span class="enemy-name">{{ enemy.name }}</span>
    </div>

    <div v-if="isAttacking" class="attack-indicator" :class="currentWeapon.type">
      {{ currentWeapon.name }} 攻击中!
    </div>

    <div v-if="gameOver" class="game-over-overlay">
      <div class="game-over-content">
        <h2>游戏结束</h2>
        <p>你被敌人击败了!</p>
        <button @click="restartGame">重新开始</button>
      </div>
    </div>

    <div v-if="victory" class="victory-overlay">
      <div class="victory-content">
        <h2>🎉 胜利!</h2>
        <p>你击败了所有敌人!</p>
        <button @click="restartGame">再玩一次</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import * as THREE from "three"
import type { Weapon, Enemy, Projectile, HitEffect, AttackTrail, Vector3 } from "./types"
import { WEAPONS, ENEMY_TYPES, GAME_CONSTANTS } from "./types"
import { createWeaponModel, getWeaponPosition } from "./weapons"
import { createEnemies, updateEnemyAI, removeDeadEnemies } from "./enemies"
import { checkCollision, createHitEffect, createMeleeAttackTrail, createRangedAttackTrail, updateEffects, getEnemyHealthBarStyle as getEnemyBarStyle } from "./utils"

const gameCanvas = ref<HTMLElement | null>(null)
const playerPosition = ref<Vector3>({ x: 0, y: 0, z: 0 })
const currentSpeed = ref(0)
const isColliding = ref(false)
const isMouseControlEnabled = ref(false)
const playerHealth = ref(100)
const playerMaxHealth = GAME_CONSTANTS.PLAYER_MAX_HEALTH
const playerHealthPercent = computed(() => (playerHealth.value / playerMaxHealth) * 100)
const isAttacking = ref(false)
const gameOver = ref(false)
const victory = ref(false)

const weapons = ref<Weapon[]>([...WEAPONS])
const currentWeaponIndex = ref(0)
const currentWeapon = computed(() => weapons.value[currentWeaponIndex.value])

let enemies: Enemy[] = []
let projectiles: Projectile[] = []
let hitEffects: HitEffect[] = []
let attackTrails: AttackTrail[] = []

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let player: THREE.Group | null = null
let clock: THREE.Clock
let keys: Map<string, boolean> = new Map()
let obstacles: THREE.Mesh[] = []
let trees: THREE.Group[] = []
let playerWeapon: THREE.Group | null = null

let cameraYaw = 0
let cameraPitch = 0.5

let velocityY = 0
let isJumping = ref(false)
let isRunning = ref(false)
let lastAttackTime = 0

let animationFrameId: number | null = null

const initScene = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 50, 100)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
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
  const groundGeometry = new THREE.PlaneGeometry(GAME_CONSTANTS.GROUND_SIZE, GAME_CONSTANTS.GROUND_SIZE)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d8b3d,
    roughness: 0.8,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const gridHelper = new THREE.GridHelper(GAME_CONSTANTS.GROUND_SIZE, 50, 0x2d6b2d, 0x2d6b2d)
  gridHelper.position.y = 0.01
  scene.add(gridHelper)
}

const createPlayer = () => {
  player = new THREE.Group()

  const bodyGeometry = new THREE.CapsuleGeometry(0.25, 0.5, 8, 16)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xe70011,
    roughness: 0.6,
    metalness: 0.1,
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1.1
  body.castShadow = true
  player.add(body)

  const overallsGeometry = new THREE.CapsuleGeometry(0.26, 0.35, 8, 16)
  const overallsMaterial = new THREE.MeshStandardMaterial({
    color: 0x0066cc,
    roughness: 0.5,
    metalness: 0.1,
  })
  const overalls = new THREE.Mesh(overallsGeometry, overallsMaterial)
  overalls.position.y = 0.9
  overalls.castShadow = true
  player.add(overalls)

  const buttonGeometry = new THREE.CircleGeometry(0.04, 16)
  const buttonMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.3, roughness: 0.3 })
  const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial)
  button1.position.set(-0.12, 0.95, 0.23)
  player.add(button1)
  const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial)
  button2.position.set(0.12, 0.95, 0.23)
  player.add(button2)

  const faceGeometry = new THREE.SphereGeometry(0.22, 16, 16)
  const faceMaterial = new THREE.MeshStandardMaterial({
    color: 0xffdbac,
    roughness: 0.5,
    metalness: 0,
  })
  const face = new THREE.Mesh(faceGeometry, faceMaterial)
  face.position.y = 1.65
  face.castShadow = true
  player.add(face)

  const mustacheGeometry = new THREE.BoxGeometry(0.15, 0.04, 0.03)
  const mustacheMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 })
  const mustache = new THREE.Mesh(mustacheGeometry, mustacheMaterial)
  mustache.position.set(0, 1.55, 0.2)
  player.add(mustache)

  const noseGeometry = new THREE.SphereGeometry(0.05, 8, 8)
  const nose = new THREE.Mesh(noseGeometry, faceMaterial)
  nose.position.set(0, 1.62, 0.2)
  nose.scale.set(1, 0.8, 0.8)
  player.add(nose)

  const eyeGeometry = new THREE.SphereGeometry(0.04, 8, 8)
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-0.08, 1.72, 0.16)
  player.add(leftEye)
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(0.08, 1.72, 0.16)
  player.add(rightEye)

  const capGeometry = new THREE.CylinderGeometry(0.23, 0.23, 0.15, 16)
  const capMaterial = new THREE.MeshStandardMaterial({ color: 0xe70011, roughness: 0.6 })
  const cap = new THREE.Mesh(capGeometry, capMaterial)
  cap.position.y = 1.88
  cap.castShadow = true
  player.add(cap)

  const brimGeometry = new THREE.BoxGeometry(0.4, 0.04, 0.08)
  const brim = new THREE.Mesh(brimGeometry, capMaterial)
  brim.position.set(0, 1.82, 0.15)
  player.add(brim)

  const armGeometry = new THREE.CapsuleGeometry(0.08, 0.35, 4, 8)
  const gloveMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  const overallsStrapMaterial = new THREE.MeshStandardMaterial({ color: 0xe70011 })

  const leftArmGroup = new THREE.Group()
  const leftArm = new THREE.Mesh(armGeometry, gloveMaterial)
  leftArm.position.y = -0.15
  leftArm.castShadow = true
  leftArmGroup.add(leftArm)
  const leftShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), overallsStrapMaterial)
  leftShoulder.position.y = 0.1
  leftArmGroup.add(leftShoulder)
  leftArmGroup.position.set(-0.35, 1.2, 0)
  leftArmGroup.rotation.z = Math.PI / 4
  player.add(leftArmGroup)

  const rightArmGroup = new THREE.Group()
  const rightArm = new THREE.Mesh(armGeometry, gloveMaterial)
  rightArm.position.y = -0.15
  rightArm.castShadow = true
  rightArmGroup.add(rightArm)
  const rightShoulder = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), overallsStrapMaterial)
  rightShoulder.position.y = 0.1
  rightArmGroup.add(rightShoulder)
  rightArmGroup.position.set(0.35, 1.2, 0)
  rightArmGroup.rotation.z = -Math.PI / 4
  player.add(rightArmGroup)

  const shoeGeometry = new THREE.CapsuleGeometry(0.1, 0.15, 4, 8)
  const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3317, roughness: 0.8 })

  const leftShoe = new THREE.Mesh(shoeGeometry, shoeMaterial)
  leftShoe.position.set(-0.15, 0.12, 0.05)
  leftShoe.rotation.x = Math.PI / 2
  leftShoe.castShadow = true
  player.add(leftShoe)

  const rightShoe = new THREE.Mesh(shoeGeometry, shoeMaterial)
  rightShoe.position.set(0.15, 0.12, 0.05)
  rightShoe.rotation.x = Math.PI / 2
  rightShoe.castShadow = true
  player.add(rightShoe)

  player.position.y = 0
  scene.add(player)

  switchWeapon(0)
}

const createObstacles = () => {
  obstacles = []
  const obstacleColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xf38181]

  for (let i = 0; i < GAME_CONSTANTS.OBSTACLE_COUNT; i++) {
    const width = 1 + Math.random() * 2
    const height = 1 + Math.random() * 3
    const depth = 1 + Math.random() * 2

    const geometry = new THREE.BoxGeometry(width, height, depth)
    const material = new THREE.MeshStandardMaterial({
      color: obstacleColors[Math.floor(Math.random() * obstacleColors.length)],
      roughness: 0.5,
      metalness: 0.1,
    })
    const obstacle = new THREE.Mesh(geometry, material)

    const x = (Math.random() - 0.5) * 80
    const z = (Math.random() - 0.5) * 80

    if (Math.abs(x) < 3 && Math.abs(z) < 3) continue

    obstacle.position.set(x, height / 2, z)
    obstacle.castShadow = true
    obstacle.receiveShadow = true
    scene.add(obstacle)
    obstacles.push(obstacle)
  }
}

const createTrees = () => {
  trees = []
  for (let i = 0; i < GAME_CONSTANTS.TREE_COUNT; i++) {
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
    trees.push(tree)
  }
}

const switchWeapon = (index: number) => {
  if (index >= 0 && index < weapons.value.length && weapons.value[index].unlocked) {
    currentWeaponIndex.value = index

    if (player && playerWeapon) {
      player.remove(playerWeapon)
      playerWeapon = null
    }

    const weapon = weapons.value[index]
    if (weapon.id !== "fist" && player) {
      const weaponModel = createWeaponModel(weapon)
      if (weaponModel) {
        const pos = getWeaponPosition(weapon.id)
        weaponModel.position.set(...pos.position)
        weaponModel.rotation.set(...pos.rotation)
        playerWeapon = weaponModel
        player.add(playerWeapon)
      }
    }
  }
}

const performAttack = () => {
  if (!player || gameOver.value || victory.value) return

  const now = clock.getElapsedTime()
  const weapon = currentWeapon.value

  if (now - lastAttackTime < weapon.cooldown) return
  lastAttackTime = now

  isAttacking.value = true
  setTimeout(() => {
    isAttacking.value = false
  }, weapon.cooldown * 300)

  if (weapon.type === "melee") {
    performMeleeAttack(weapon)
  } else {
    performRangedAttack(weapon)
  }

  if (playerWeapon) {
    const originalRotation = playerWeapon.rotation.clone()
    playerWeapon.rotation.x = -Math.PI / 3
    setTimeout(() => {
      if (playerWeapon) playerWeapon.rotation.copy(originalRotation)
    }, 200)
  }
}

const performMeleeAttack = (weapon: Weapon) => {
  if (!player || !player.position) return

  const attackPos = new THREE.Vector3(
    player.position.x + Math.sin(cameraYaw) * weapon.range,
    player.position.y + 1,
    player.position.z + Math.cos(cameraYaw) * weapon.range
  )

  const trailStart = player.position.clone()
  trailStart.y += 1
  const trailEnd = attackPos.clone()
  const trail = createMeleeAttackTrail(scene, trailStart, trailEnd, weapon.id)
  attackTrails.push(trail)

  for (const enemy of enemies) {
    if (enemy.health <= 0) continue

    const enemyPos = new THREE.Vector3(enemy.mesh.position.x, enemy.mesh.position.y + enemy.maxHealth * 0.5, enemy.mesh.position.z)
    const distance = attackPos.distanceTo(enemyPos)

    if (distance < weapon.range + 1) {
      const angleToEnemy = Math.atan2(enemy.mesh.position.x - player.position.x, enemy.mesh.position.z - player.position.z)
      const angleDiff = Math.abs(angleToEnemy - cameraYaw)
      if (angleDiff < Math.PI / 2 || angleDiff > Math.PI * 1.5) {
        enemy.health -= weapon.damage
        hitEffects.push(createHitEffect(scene, enemy.mesh.position.clone()))
      }
    }
  }
}

const performRangedAttack = (weapon: Weapon) => {
  if (!player || !player.position) return

  const projectileGeometry = new THREE.SphereGeometry(0.1, 8, 8)
  const projectileMaterial = new THREE.MeshStandardMaterial({
    color: weapon.id === "bow" ? 0x8b4513 : 0xffff00,
    emissive: weapon.id === "gun" ? 0xffff00 : 0x000000,
    emissiveIntensity: 0.5,
  })
  const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial)

  projectile.position.set(
    player.position.x + Math.sin(cameraYaw) * 1,
    player.position.y + 1.3,
    player.position.z + Math.cos(cameraYaw) * 1
  )

  scene.add(projectile)

  const direction = new THREE.Vector3(Math.sin(cameraYaw), 0, Math.cos(cameraYaw)).normalize()
  const speed = weapon.id === "bow" ? 30 : 60

  const trail = createRangedAttackTrail(scene, player.position.clone(), direction, weapon.id)
  attackTrails.push(trail)

  projectiles.push({
    mesh: projectile,
    velocity: {
      x: direction.x * speed,
      y: 0,
      z: direction.z * speed,
    },
    damage: weapon.damage,
    owner: "player",
  })
}

const updateProjectiles = (delta: number) => {
  if (!player || !player.position) return

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i]

    proj.mesh.position.x += proj.velocity.x * delta
    proj.mesh.position.z += proj.velocity.z * delta

    if (proj.mesh.position.distanceTo(player.position) > GAME_CONSTANTS.PROJECTILE_MAX_DISTANCE) {
      scene.remove(proj.mesh)
      projectiles.splice(i, 1)
      continue
    }

    for (const enemy of enemies) {
      if (enemy.health <= 0) continue

      const distance = new THREE.Vector2(
        proj.mesh.position.x - enemy.mesh.position.x,
        proj.mesh.position.z - enemy.mesh.position.z
      ).length()

      if (distance < 1.5) {
        enemy.health -= proj.damage
        hitEffects.push(createHitEffect(scene, enemy.mesh.position.clone()))
        scene.remove(proj.mesh)
        projectiles.splice(i, 1)
        break
      }
    }
  }
}

const getEnemyHealthBarStyle = (enemy: Enemy) => {
  return getEnemyBarStyle(enemy, camera, window)
}

const restartGame = () => {
  playerHealth.value = playerMaxHealth
  gameOver.value = false
  victory.value = false
  currentWeaponIndex.value = 0
  lastAttackTime = 0

  for (const enemy of enemies) {
    scene.remove(enemy.mesh)
  }
  enemies = []

  for (const proj of projectiles) {
    scene.remove(proj.mesh)
  }
  projectiles = []

  for (const effect of hitEffects) {
    scene.remove(effect.mesh)
  }
  hitEffects = []

  for (const trail of attackTrails) {
    scene.remove(trail.mesh)
  }
  attackTrails = []

  if (player) {
    player.position.set(0, 0, 0)
  }
  cameraYaw = 0
  cameraPitch = 0.5

  enemies = createEnemies(ENEMY_TYPES, scene)
  switchWeapon(0)
}

const setupControls = () => {
  window.addEventListener("keydown", (e) => {
    keys.set(e.code, true)

    if (e.key >= "1" && e.key <= "5") {
      const index = parseInt(e.key) - 1
      switchWeapon(index)
    }

    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      isRunning.value = true
    }
    if (e.code === "Space" && !isJumping.value) {
      velocityY = GAME_CONSTANTS.JUMP_FORCE
      isJumping.value = true
    }
  })

  window.addEventListener("keyup", (e) => {
    keys.set(e.code, false)

    if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
      isRunning.value = false
    }
  })

  gameCanvas.value?.addEventListener("mousedown", (e: MouseEvent) => {
    if (e.button === 0) {
      if (!isMouseControlEnabled.value && !gameOver.value && !victory.value) {
        gameCanvas.value?.requestPointerLock()
      }
    } else if (e.button === 2) {
      if (isMouseControlEnabled.value && !gameOver.value && !victory.value) {
        performAttack()
      }
    }
  })

  gameCanvas.value?.addEventListener("contextmenu", (e: Event) => {
    e.preventDefault()
  })

  document.addEventListener("mousemove", (e) => {
    if (isMouseControlEnabled.value && document.pointerLockElement === gameCanvas.value) {
      cameraYaw -= e.movementX * GAME_CONSTANTS.MOUSE_SENSITIVITY
      cameraPitch -= e.movementY * GAME_CONSTANTS.MOUSE_SENSITIVITY
      cameraPitch = Math.max(0.1, Math.min(Math.PI / 2 - 0.1, cameraPitch))
    }
  })

  document.addEventListener("pointerlockchange", () => {
    isMouseControlEnabled.value = document.pointerLockElement === gameCanvas.value
  })

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  })
}

const enableMouseControl = () => {
  if (gameCanvas.value && !isMouseControlEnabled.value) {
    gameCanvas.value.requestPointerLock()
  }
}

const updatePlayer = (delta: number) => {
  if (!player || !player.position) return

  const speed = isRunning.value ? GAME_CONSTANTS.RUN_SPEED : GAME_CONSTANTS.MOVE_SPEED
  let moveX = 0
  let moveZ = 0

  if (keys.get("KeyW") || keys.get("ArrowUp")) moveZ -= 1
  if (keys.get("KeyS") || keys.get("ArrowDown")) moveZ += 1
  if (keys.get("KeyA") || keys.get("ArrowLeft")) moveX -= 1
  if (keys.get("KeyD") || keys.get("ArrowRight")) moveX += 1

  if (moveX !== 0 || moveZ !== 0) {
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
    moveX /= length
    moveZ /= length

    const moveAngle = Math.atan2(moveX, moveZ)
    const targetAngle = moveAngle + cameraYaw

    const newX = player.position.x + Math.sin(targetAngle) * speed * delta
    const newZ = player.position.z + Math.cos(targetAngle) * speed * delta

    if (!checkCollision(newX, newZ, obstacles, trees)) {
      player.position.x = newX
      player.position.z = newZ
      currentSpeed.value = speed
    } else {
      currentSpeed.value = 0
      isColliding.value = true
      setTimeout(() => {
        isColliding.value = false
      }, 100)
    }
  } else {
    currentSpeed.value = 0
  }

  if (keys.get("Space") && !isJumping.value && player.position.y <= GAME_CONSTANTS.PLAYER_HEIGHT + 0.1) {
    velocityY = GAME_CONSTANTS.JUMP_FORCE
    isJumping.value = true
  }

  velocityY -= GAME_CONSTANTS.GRAVITY * delta
  player.position.y += velocityY * delta

  if (player.position.y <= GAME_CONSTANTS.PLAYER_HEIGHT) {
    player.position.y = GAME_CONSTANTS.PLAYER_HEIGHT
    velocityY = 0
    isJumping.value = false
  }

  playerPosition.value = {
    x: player.position.x,
    y: player.position.y,
    z: player.position.z,
  }
}

const updateCamera = () => {
  if (!player || !player.position) return

  const cameraDistance = 12
  const cameraHeight = 8

  const targetCameraX = player.position.x + Math.sin(cameraYaw) * cameraDistance * Math.cos(cameraPitch)
  const targetCameraZ = player.position.z + Math.cos(cameraYaw) * cameraDistance * Math.cos(cameraPitch)
  const targetCameraY = player.position.y + cameraHeight + Math.sin(cameraPitch) * 5

  camera.position.x += (targetCameraX - camera.position.x) * GAME_CONSTANTS.CAMERA_SMOOTHING
  camera.position.y += (targetCameraY - camera.position.y) * GAME_CONSTANTS.CAMERA_SMOOTHING
  camera.position.z += (targetCameraZ - camera.position.z) * GAME_CONSTANTS.CAMERA_SMOOTHING

  camera.lookAt(player.position.x, player.position.y + 1, player.position.z)
}

const updateEnemies = (delta: number) => {
  if (!player) return

  for (const enemy of enemies) {
    updateEnemyAI(enemy, player, delta, clock, playerHealth, gameOver)
  }

  removeDeadEnemies(enemies, scene)

  if (enemies.length === 0 && !gameOver.value) {
    victory.value = true
  }
}

const animate = () => {
  if (gameOver.value || victory.value) {
    animationFrameId = requestAnimationFrame(animate)
    return
  }

  const delta = Math.min(clock.getDelta(), 0.1)

  updatePlayer(delta)
  updateCamera()
  updateEnemies(delta)
  updateProjectiles(delta)
  updateEffects(hitEffects, scene)
  updateEffects(attackTrails, scene)

  renderer.render(scene, camera)

  animationFrameId = requestAnimationFrame(animate)
}

onMounted(() => {
  try {
    initScene()
    createLighting()
    createGround()
    createPlayer()
    createObstacles()
    createTrees()
    enemies = createEnemies(ENEMY_TYPES, scene)
    setupControls()
    animate()
  } catch (error) {
    console.error("Game initialization error:", error)
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  if (renderer) {
    renderer.dispose()
  }

  window.removeEventListener("keydown", () => {})
  window.removeEventListener("keyup", () => {})
  window.removeEventListener("resize", () => {})
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.game-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.controls-info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
}

.controls-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.key-item {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.key {
  background: #444;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.player-status {
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  pointer-events: auto;
}

.health-bar-container {
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 15px;
  border-radius: 10px;
  min-width: 200px;
}

.health-bar {
  width: 100%;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ff6b6b);
  transition: width 0.3s ease;
}

.health-text {
  color: white;
  font-size: 14px;
}

.weapon-selector {
  display: flex;
  gap: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 10px;
}

.weapon-slot {
  width: 60px;
  height: 70px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid transparent;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.weapon-slot:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.weapon-slot.active {
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
}

.weapon-slot.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.weapon-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.weapon-name {
  font-size: 10px;
  margin-bottom: 3px;
}

.weapon-damage {
  font-size: 12px;
  color: #ff6b6b;
}

.stats {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
}

.stat-item {
  margin: 5px 0;
  display: flex;
  gap: 10px;
}

.collision-active {
  color: #ff6b6b;
}

.mouse-hint {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 15px 30px;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.enemy-health-bar {
  position: absolute;
  width: 80px;
  height: 25px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 5px;
  overflow: hidden;
  pointer-events: none;
  transform: translate(-50%, -100%);
}

.enemy-health-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff4444, #ff6b6b);
  transition: width 0.2s ease;
}

.enemy-name {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-size: 12px;
  color: white;
  text-shadow: 1px 1px 2px black;
}

.attack-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 40px;
  background: rgba(255, 100, 100, 0.8);
  border-radius: 10px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  animation: attackFlash 0.2s ease;
}

.attack-indicator.ranged {
  background: rgba(100, 100, 255, 0.8);
}

@keyframes attackFlash {
  0% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

.game-over-overlay,
.victory-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.game-over-content,
.victory-content {
  background: rgba(255, 255, 255, 0.95);
  padding: 40px 60px;
  border-radius: 20px;
  text-align: center;
}

.game-over-content h2 {
  color: #ff4444;
  font-size: 36px;
  margin-bottom: 20px;
}

.victory-content h2 {
  color: #ffd700;
  font-size: 36px;
  margin-bottom: 20px;
}

.game-over-content p,
.victory-content p {
  font-size: 18px;
  color: #333;
  margin-bottom: 30px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  font-size: 18px;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
}
</style>
