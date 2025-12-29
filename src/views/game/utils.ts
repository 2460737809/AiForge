import * as THREE from "three"
import type { HitEffect, AttackTrail, Vector3 } from "./types"
import { GAME_CONSTANTS } from "./types"

export function checkCollision(
  newX: number,
  newZ: number,
  obstacles: THREE.Mesh[],
  trees: THREE.Group[]
): boolean {
  const playerSphere = new THREE.Sphere(
    new THREE.Vector3(newX, GAME_CONSTANTS.PLAYER_HEIGHT / 2, newZ),
    GAME_CONSTANTS.PLAYER_RADIUS
  )

  for (const obstacle of obstacles) {
    const obstacleBox = new THREE.Box3().setFromObject(obstacle)
    obstacleBox.expandByScalar(-0.05)
    if (obstacleBox.intersectsSphere(playerSphere)) {
      return true
    }
  }

  for (const tree of trees) {
    const trunk = tree.children[0]
    if (trunk) {
      const trunkBox = new THREE.Box3().setFromObject(trunk)
      trunkBox.expandByScalar(-0.05)
      if (trunkBox.intersectsSphere(playerSphere)) {
        return true
      }
    }
  }

  return false
}

export function createHitEffect(scene: THREE.Scene, position: THREE.Vector3): HitEffect {
  const geometry = new THREE.SphereGeometry(0.3, 16, 16)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 1,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(position)
  mesh.position.y += 1
  scene.add(mesh)

  return {
    mesh,
    createdAt: Date.now(),
    lifetime: 500,
  }
}

export function createMeleeAttackTrail(
  scene: THREE.Scene,
  startPos: THREE.Vector3,
  endPos: THREE.Vector3,
  weaponType: string
): AttackTrail {
  const direction = new THREE.Vector3().subVectors(endPos, startPos)
  const length = direction.length()
  direction.normalize()

  const trailGeometry = new THREE.CylinderGeometry(0.05, 0.1, length, 8, 1)
  
  let color = 0xc0c0c0
  if (weaponType === "axe") color = 0x708090
  else if (weaponType === "fist") color = 0xffb6c1

  const trailMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.8,
  })
  const mesh = new THREE.Mesh(trailGeometry, trailMaterial)

  const midpoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5)
  mesh.position.copy(midpoint)
  mesh.position.y += 1

  mesh.lookAt(endPos.x, mesh.position.y, endPos.z)
  mesh.rotateX(Math.PI / 2)

  scene.add(mesh)

  return {
    mesh,
    createdAt: Date.now(),
    lifetime: 200,
  }
}

export function createRangedAttackTrail(scene: THREE.Scene, startPos: THREE.Vector3, direction: THREE.Vector3, weaponType: string): AttackTrail {
  const trailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8, 1)
  
  let color = 0x8b4513
  if (weaponType === "gun") color = 0xffff00

  const trailMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.6,
  })
  const mesh = new THREE.Mesh(trailGeometry, trailMaterial)

  mesh.position.copy(startPos)
  mesh.position.y += 1.3

  const lookTarget = new THREE.Vector3().copy(startPos).add(direction.multiplyScalar(1))
  mesh.lookAt(lookTarget.x, mesh.position.y, lookTarget.z)
  mesh.rotateX(Math.PI / 2)

  scene.add(mesh)

  return {
    mesh,
    createdAt: Date.now(),
    lifetime: 150,
  }
}

export function updateEffects(
  effects: (HitEffect | AttackTrail)[],
  scene: THREE.Scene
): void {
  const now = Date.now()

  for (let i = effects.length - 1; i >= 0; i--) {
    const effect = effects[i]
    const elapsed = now - effect.createdAt
    const progress = elapsed / effect.lifetime

    if (progress >= 1) {
      scene.remove(effect.mesh)
      effects.splice(i, 1)
    } else {
      if ("mesh" in effect.mesh) {
        const material = effect.mesh.material as THREE.MeshBasicMaterial
        material.opacity = 1 - progress
        effect.mesh.scale.multiplyScalar(1 + progress * 0.1)
      }
    }
  }
}

export function getEnemyHealthBarStyle(
  enemy: { mesh: THREE.Group; maxHealth: number },
  camera: THREE.Camera,
  window: Window
): { left: string; top: string } {
  const screenPos = new THREE.Vector3(
    enemy.mesh.position.x,
    enemy.mesh.position.y + enemy.maxHealth * 2,
    enemy.mesh.position.z
  )

  screenPos.project(camera)

  const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth
  const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight

  return {
    left: x + "px",
    top: y + "px",
  }
}
