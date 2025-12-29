import * as THREE from "three"

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Weapon {
  id: string
  name: string
  icon: string
  damage: number
  type: "melee" | "ranged"
  range: number
  cooldown: number
  unlocked: boolean
}

export interface Enemy {
  id: number
  name: string
  mesh: THREE.Group
  health: number
  maxHealth: number
  speed: number
  damage: number
  attackRange: number
  attackCooldown: number
  lastAttackTime: number
  state: "idle" | "chasing" | "attacking" | "fleeing"
  lastHitTime: number
  isAggressive: boolean
}

export interface Projectile {
  mesh: THREE.Mesh
  velocity: Vector3
  damage: number
  owner: "player"
}

export interface HitEffect {
  mesh: THREE.Mesh
  createdAt: number
  lifetime: number
}

export interface AttackTrail {
  mesh: THREE.Mesh
  createdAt: number
  lifetime: number
}

export const WEAPONS: Weapon[] = [
  { id: "fist", name: "拳头", icon: "👊", damage: 10, type: "melee", range: 1.5, cooldown: 0.5, unlocked: true },
  { id: "sword", name: "剑", icon: "⚔️", damage: 25, type: "melee", range: 2.5, cooldown: 0.8, unlocked: true },
  { id: "axe", name: "斧头", icon: "🪓", damage: 40, type: "melee", range: 2.2, cooldown: 1.2, unlocked: true },
  { id: "bow", name: "弓箭", icon: "🏹", damage: 30, type: "ranged", range: 30, cooldown: 1.5, unlocked: true },
  { id: "gun", name: "枪", icon: "🔫", damage: 50, type: "ranged", range: 50, cooldown: 0.3, unlocked: true },
]

export const ENEMY_TYPES = [
  { name: "🐰 兔子", color: 0xffb6c1, health: 30, speed: 4, damage: 5, size: 0.4 },
  { name: "🐺 狼", color: 0x808080, health: 60, speed: 6, damage: 15, size: 0.6 },
  { name: "🐻 熊", color: 0x8b4513, health: 120, speed: 3, damage: 25, size: 0.9 },
  { name: "🐍 蛇", color: 0x228b22, health: 25, speed: 5, damage: 10, size: 0.3 },
]

export const GAME_CONSTANTS = {
  MOVE_SPEED: 5,
  RUN_SPEED: 10,
  JUMP_FORCE: 8,
  GRAVITY: 20,
  PLAYER_HEIGHT: 1.8,
  PLAYER_RADIUS: 0.4,
  CAMERA_SMOOTHING: 0.1,
  MOUSE_SENSITIVITY: 0.002,
  GROUND_SIZE: 100,
  OBSTACLE_COUNT: 20,
  TREE_COUNT: 30,
  PLAYER_MAX_HEALTH: 100,
  PROJECTILE_MAX_DISTANCE: 60,
}
