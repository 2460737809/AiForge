import * as THREE from "three"
import type { Enemy } from "./types"

interface EnemyTypeConfig {
  name: string
  color: number
  health: number
  speed: number
  damage: number
  size: number
}

export function createEnemy(type: EnemyTypeConfig, id: number, scene: THREE.Scene): Enemy {
  const group = new THREE.Group()
  const size = type.size

  const bodyGeometry = new THREE.CapsuleGeometry(size * 0.5, size, 8, 16)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: type.color,
    roughness: 0.7,
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = size * 0.5
  body.castShadow = true
  group.add(body)

  const headGeometry = new THREE.SphereGeometry(size * 0.4, 16, 16)
  const head = new THREE.Mesh(headGeometry, bodyMaterial)
  head.position.y = size * 1.1
  head.castShadow = true
  group.add(head)

  const eyeGeometry = new THREE.SphereGeometry(size * 0.1, 8, 8)
  const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 })

  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  leftEye.position.set(-size * 0.15, size * 1.2, size * 0.3)
  group.add(leftEye)

  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial)
  rightEye.position.set(size * 0.15, size * 1.2, size * 0.3)
  group.add(rightEye)

  const legGeometry = new THREE.CylinderGeometry(size * 0.1, size * 0.1, size * 0.5, 8)
  const legMaterial = new THREE.MeshStandardMaterial({ color: type.color })

  for (let i = 0; i < 4; i++) {
    const leg = new THREE.Mesh(legGeometry, legMaterial)
    leg.position.set((i % 2 === 0 ? -1 : 1) * size * 0.3, size * 0.2, (i < 2 ? -1 : 1) * size * 0.3)
    leg.castShadow = true
    group.add(leg)
  }

  let enemyType = "rabbit"
  if (type.name.includes("狼")) enemyType = "wolf"
  else if (type.name.includes("熊")) enemyType = "bear"
  else if (type.name.includes("蛇")) enemyType = "snake"

  if (enemyType === "snake") {
    for (let i = 0; i < 5; i++) {
      const segmentGeometry = new THREE.SphereGeometry(size * (0.5 - i * 0.08), 8, 8)
      const segment = new THREE.Mesh(segmentGeometry, bodyMaterial)
      segment.position.z = -i * size * 0.4
      segment.castShadow = true
      group.add(segment)
    }
  }

  // 确保敌人生成在玩家附近可见区域（距离玩家10-40单位）
  const angle = Math.random() * Math.PI * 2
  const distance = 10 + Math.random() * 30 // 距离玩家10-40单位
  const x = Math.cos(angle) * distance
  const z = Math.sin(angle) * distance
  
  // 敌人直接站在地面上（y=0），因为body的position.y已经设置为size * 0.5
  group.position.set(x, 0, z)

  scene.add(group)

  return {
    id,
    name: type.name,
    mesh: group,
    health: type.health,
    maxHealth: type.health,
    speed: type.speed,
    damage: type.damage,
    attackRange: size + 1,
    attackCooldown: 1.5,
    lastAttackTime: 0,
    state: "idle",
    lastHitTime: 0,
    isAggressive: false,
  }
}

export function updateEnemyAI(
  enemy: Enemy,
  player: THREE.Group,
  delta: number,
  clock: THREE.Clock,
  playerHealth: { value: number },
  gameOver: { value: boolean }
): void {
  if (enemy.health <= 0) return

  const now = clock.getElapsedTime()
  const distanceToPlayer = enemy.mesh.position.distanceTo(player.position)

  if (enemy.isAggressive) {
    if (now - enemy.lastHitTime > 8) {
      enemy.isAggressive = false
      enemy.state = "idle"
      return
    }

    if (distanceToPlayer < enemy.attackRange) {
      enemy.state = "attacking"

      if (now - enemy.lastAttackTime > enemy.attackCooldown) {
        enemy.lastAttackTime = now
        playerHealth.value -= enemy.damage

        if (playerHealth.value <= 0) {
          playerHealth.value = 0
          gameOver.value = true
        }
      }
    } else if (distanceToPlayer < 25) {
      enemy.state = "chasing"

      const direction = new THREE.Vector3()
      direction.subVectors(player.position, enemy.mesh.position).normalize()

      const newX = enemy.mesh.position.x + direction.x * enemy.speed * delta
      const newZ = enemy.mesh.position.z + direction.z * enemy.speed * delta

      enemy.mesh.position.x = newX
      enemy.mesh.position.z = newZ

      enemy.mesh.lookAt(player.position.x, player.position.y, player.position.z)
    } else {
      enemy.isAggressive = false
      enemy.state = "idle"
    }
  } else {
    enemy.state = "idle"
  }
}

export function createEnemies(enemyTypes: EnemyTypeConfig[], scene: THREE.Scene): Enemy[] {
  const enemies: Enemy[] = []
  let id = 0

  for (const type of enemyTypes) {
    const count = type.name.includes("兔") ? 4 : type.name.includes("狼") ? 3 : type.name.includes("熊") ? 2 : 3
    for (let i = 0; i < count; i++) {
      enemies.push(createEnemy(type, id++, scene))
    }
  }

  return enemies
}

export function removeDeadEnemies(enemies: Enemy[], scene: THREE.Scene): void {
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].health <= 0) {
      scene.remove(enemies[i].mesh)
      enemies.splice(i, 1)
    }
  }
}
