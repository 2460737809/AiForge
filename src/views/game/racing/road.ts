import * as THREE from "three"
import * as CANNON from "cannon-es"
import { ROAD_CONFIG } from "./constants"

export interface RoadManager {
  segments: THREE.Mesh[]
  createSegment: (z: number) => void
  update: (vehicleZ: number) => void
  cleanup: () => void
}

export function createRoadManager(
  scene: THREE.Scene,
  world: CANNON.World
): RoadManager {
  const segments: THREE.Mesh[] = []
  const roadBodies: CANNON.Body[] = []

  const createSegment = (z: number) => {
    // 道路几何体
    const roadGeometry = new THREE.PlaneGeometry(
      ROAD_CONFIG.WIDTH,
      ROAD_CONFIG.LENGTH
    )
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333, // 深灰色道路
      roughness: 0.7,
      metalness: 0.1,
    })
    const road = new THREE.Mesh(roadGeometry, roadMaterial)
    road.rotation.x = -Math.PI / 2
    road.position.z = z
    road.receiveShadow = true
    scene.add(road)

    // 道路标记线
    const lineGeometry = new THREE.PlaneGeometry(0.2, ROAD_CONFIG.LENGTH)
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 })
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial)
    centerLine.rotation.x = -Math.PI / 2
    centerLine.position.set(0, 0.01, z)
    scene.add(centerLine)

    // 道路边缘线
    const edgeLineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const leftLine = new THREE.Mesh(lineGeometry, edgeLineMaterial)
    leftLine.rotation.x = -Math.PI / 2
    leftLine.position.set(-ROAD_CONFIG.WIDTH / 2, 0.01, z)
    scene.add(leftLine)

    const rightLine = new THREE.Mesh(lineGeometry, edgeLineMaterial)
    rightLine.rotation.x = -Math.PI / 2
    rightLine.position.set(ROAD_CONFIG.WIDTH / 2, 0.01, z)
    scene.add(rightLine)

    segments.push(road)

    // 物理道路
    const roadShape = new CANNON.Plane()
    const roadBody = new CANNON.Body({ mass: 0 })
    roadBody.addShape(roadShape)
    roadBody.quaternion.setFromAxisAngle(
      new CANNON.Vec3(1, 0, 0),
      -Math.PI / 2
    )
    roadBody.position.set(0, 0, z)
    world.addBody(roadBody)
    roadBodies.push(roadBody)
  }

  const update = (vehicleZ: number) => {
    // 验证 vehicleZ 是否有效
    if (!isFinite(vehicleZ) || isNaN(vehicleZ)) {
      console.warn("无效的车辆Z位置:", vehicleZ)
      return
    }

    // 移除后方的道路段
    while (
      segments.length > 0 &&
      (segments[0] as any).position.z <
        vehicleZ - ROAD_CONFIG.SEGMENTS_BEHIND * ROAD_CONFIG.LENGTH
    ) {
      const segment = segments.shift()
      const roadBody = roadBodies.shift()
      
      if (segment) {
        const segmentZ = (segment as any).position.z
        scene.remove(segment)
        
        // 移除相关的标记线（中心线、边缘线）
        const childrenToRemove: THREE.Mesh[] = []
        scene.traverse((child) => {
          if (
            child instanceof THREE.Mesh &&
            Math.abs((child as any).position.z - segmentZ) < 0.1 &&
            child !== segment
          ) {
            if (
              child.material instanceof THREE.MeshStandardMaterial &&
              (child.material.color.getHex() === 0xffff00 ||
                child.material.color.getHex() === 0xffffff)
            ) {
              childrenToRemove.push(child)
            }
          }
        })
        childrenToRemove.forEach((child) => scene.remove(child))
      }

      if (roadBody) {
        world.removeBody(roadBody)
      }
    }

    // 生成前方的道路段
    let lastSegmentZ = vehicleZ
    if (segments.length > 0) {
      const segmentZs = segments.map((s) => (s as any).position.z).filter(z => isFinite(z) && !isNaN(z))
      if (segmentZs.length > 0) {
        lastSegmentZ = Math.max(...segmentZs)
      }
    }

    // 限制生成数量，防止无限循环
    const maxSegmentsToGenerate = ROAD_CONFIG.SEGMENTS_AHEAD * 2
    let segmentsGenerated = 0

    while (
      lastSegmentZ <
      vehicleZ + ROAD_CONFIG.SEGMENTS_AHEAD * ROAD_CONFIG.LENGTH &&
      segmentsGenerated < maxSegmentsToGenerate
    ) {
      const newZ = lastSegmentZ + ROAD_CONFIG.LENGTH
      if (isFinite(newZ) && !isNaN(newZ)) {
        createSegment(newZ)
        lastSegmentZ = newZ
        segmentsGenerated++
      } else {
        break
      }
    }
  }

  const cleanup = () => {
    // 清理所有道路段和标记线
    segments.forEach((segment) => {
      const segmentZ = (segment as any).position.z
      scene.remove(segment)
      
      // 清理几何体和材质
      if (segment.geometry) segment.geometry.dispose()
      if (segment.material) {
        if (Array.isArray(segment.material)) {
          segment.material.forEach((mat) => mat.dispose())
        } else {
          segment.material.dispose()
        }
      }
      
      // 移除相关的标记线
      const childrenToRemove: THREE.Mesh[] = []
      scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          Math.abs((child as any).position.z - segmentZ) < 0.1 &&
          child !== segment
        ) {
          childrenToRemove.push(child)
        }
      })
      childrenToRemove.forEach((child) => {
        scene.remove(child)
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })
    
    // 清理物理体
    roadBodies.forEach((body) => world.removeBody(body))
    
    segments.length = 0
    roadBodies.length = 0
  }

  return {
    segments,
    createSegment,
    update,
    cleanup,
  }
}

