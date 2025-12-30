import * as CANNON from "cannon-es"
import { PHYSICS_CONFIG } from "./constants"

export function createPhysicsWorld(): CANNON.World {
  const world = new CANNON.World()
  world.gravity.set(0, PHYSICS_CONFIG.GRAVITY, 0)
  world.broadphase = new CANNON.NaiveBroadphase()
  return world
}

