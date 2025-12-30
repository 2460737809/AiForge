import * as THREE from "three"
import { ROAD_CONFIG, SCENERY_CONFIG } from "./constants"

export interface SceneryManager {
  objects: THREE.Object3D[]
  create: (z: number) => void
  update: (vehicleZ: number) => void
  cleanup: () => void
}

export function createSceneryManager(scene: THREE.Scene): SceneryManager {
  const objects: THREE.Object3D[] = []

  const createTree = (): THREE.Group => {
    const tree = new THREE.Group()

    // 树干
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8)
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial)
    trunk.position.y = 1.5
    trunk.castShadow = true
    tree.add(trunk)

    // 树叶
    const leavesGeometry = new THREE.ConeGeometry(2, 4, 8)
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 })
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial)
    leaves.position.y = 4
    leaves.castShadow = true
    tree.add(leaves)

    return tree
  }

  const createRock = (): THREE.Mesh => {
    const rockGeometry = new THREE.DodecahedronGeometry(
      0.5 + Math.random() * 0.5,
      0
    )
    const rockMaterial = new THREE.MeshStandardMaterial({
      color: 0x696969,
      roughness: 0.9,
    })
    const rock = new THREE.Mesh(rockGeometry, rockMaterial)
    rock.castShadow = true
    rock.receiveShadow = true
    return rock
  }

  const create = (z: number) => {
    // 左侧风景
    for (let i = 0; i < SCENERY_CONFIG.TREE_COUNT; i++) {
      const x =
        -(ROAD_CONFIG.WIDTH / 2 + 5) - Math.random() * SCENERY_CONFIG.WIDTH
      const treeZ = z + (Math.random() - 0.5) * ROAD_CONFIG.LENGTH

      const tree = createTree()
      tree.position.set(x, 0, treeZ)
      scene.add(tree)
      objects.push(tree)
    }

    // 右侧风景
    for (let i = 0; i < SCENERY_CONFIG.TREE_COUNT; i++) {
      const x =
        ROAD_CONFIG.WIDTH / 2 + 5 + Math.random() * SCENERY_CONFIG.WIDTH
      const treeZ = z + (Math.random() - 0.5) * ROAD_CONFIG.LENGTH

      const tree = createTree()
      tree.position.set(x, 0, treeZ)
      scene.add(tree)
      objects.push(tree)
    }

    // 添加一些石头
    for (let i = 0; i < SCENERY_CONFIG.ROCK_COUNT; i++) {
      const side = Math.random() > 0.5 ? 1 : -1
      const x =
        (ROAD_CONFIG.WIDTH / 2 + 10) * side + (Math.random() - 0.5) * 20
      const treeZ = z + (Math.random() - 0.5) * ROAD_CONFIG.LENGTH

      const rock = createRock()
      rock.position.set(x, 0, treeZ)
      scene.add(rock)
      objects.push(rock)
    }
  }

  const update = (vehicleZ: number) => {
    // 清理远处的风景（从后往前遍历，避免索引问题）
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i]
      if (
        obj.position.z <
        vehicleZ - ROAD_CONFIG.SEGMENTS_BEHIND * ROAD_CONFIG.LENGTH
      ) {
        scene.remove(obj)
        objects.splice(i, 1)
      }
    }
  }

  const cleanup = () => {
    objects.forEach((obj) => {
      scene.remove(obj)
      
      // 清理几何体和材质
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
    })
    objects.length = 0
  }

  return {
    objects,
    create,
    update,
    cleanup,
  }
}

