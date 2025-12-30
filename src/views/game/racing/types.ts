import * as THREE from "three"
import * as CANNON from "cannon-es"

export interface GameScene {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
}

export interface GamePhysics {
  world: CANNON.World
  vehicle: CANNON.Body
}

export interface VehicleState {
  speed: number
  rotation: number
  mesh: THREE.Group
}

export interface RoadSegment {
  mesh: THREE.Mesh
  z: number
}

export interface GameState {
  speed: number
  distance: number
}

