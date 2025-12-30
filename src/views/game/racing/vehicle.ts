import * as THREE from "three"
import * as CANNON from "cannon-es"
import { VEHICLE_CONFIG } from "./constants"

export interface Vehicle {
  body: CANNON.Body
  mesh: THREE.Group
  speed: number
  rotation: number
  update: (delta: number, keys: Map<string, boolean>) => void
  getSpeed: () => number
  getPosition: () => CANNON.Vec3
  cleanup: () => void
}

export function createVehicle(
  scene: THREE.Scene,
  world: CANNON.World
): Vehicle {
  // 创建车辆网格
  const vehicleMesh = new THREE.Group()

  // 车身
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4)
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.5,
    metalness: 0.3,
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = 1
  body.castShadow = true
  vehicleMesh.add(body)

  // 车窗
  const windowGeometry = new THREE.BoxGeometry(1.5, 0.8, 1.5)
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    transparent: true,
    opacity: 0.7,
  })
  const window = new THREE.Mesh(windowGeometry, windowMaterial)
  window.position.set(0, 1.2, 0.5)
  vehicleMesh.add(window)

  // 车轮
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16)
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  const wheelPositions = [
    [-0.8, 0.4, 1.2],
    [0.8, 0.4, 1.2],
    [-0.8, 0.4, -1.2],
    [0.8, 0.4, -1.2],
  ]

  wheelPositions.forEach((pos) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial)
    wheel.position.set(pos[0], pos[1], pos[2])
    wheel.rotation.z = Math.PI / 2
    wheel.castShadow = true
    vehicleMesh.add(wheel)
  })

  scene.add(vehicleMesh)

  // 创建物理车辆
  const vehicleShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2))
  const vehicleBody = new CANNON.Body({ mass: VEHICLE_CONFIG.MASS })
  vehicleBody.addShape(vehicleShape)
  // 车辆初始位置：在地面上方，确保能看到
  vehicleBody.position.set(0, 1, 0)
  vehicleBody.material = new CANNON.Material("vehicle")
  vehicleBody.material.friction = 0.8 // 增加摩擦力，防止滑动
  vehicleBody.material.restitution = 0.1
  // 设置初始速度为零，防止车辆飞出去
  vehicleBody.velocity.set(0, 0, 0)
  vehicleBody.angularVelocity.set(0, 0, 0)
  // 锁定Y轴旋转，防止车辆翻滚
  vehicleBody.fixedRotation = false
  vehicleBody.linearDamping = 0.4 // 线性阻尼，使运动更平滑
  vehicleBody.angularDamping = 0.4 // 角阻尼，使旋转更平滑
  world.addBody(vehicleBody)
  
  // 同步初始网格位置
  vehicleMesh.position.set(0, 1, 0)

  let vehicleSpeed = 0
  let vehicleRotation = 0

  const update = (delta: number, keys: Map<string, boolean>) => {
    // 加速/减速
    if (keys.get("KeyW") || keys.get("ArrowUp")) {
      vehicleSpeed = Math.min(
        vehicleSpeed + VEHICLE_CONFIG.ACCELERATION * delta,
        VEHICLE_CONFIG.MAX_SPEED
      )
    } else if (keys.get("KeyS") || keys.get("ArrowDown")) {
      vehicleSpeed = Math.max(
        vehicleSpeed - VEHICLE_CONFIG.ACCELERATION * delta,
        -VEHICLE_CONFIG.MAX_SPEED * 0.5
      )
    } else {
      // 自然减速
      vehicleSpeed *= Math.pow(VEHICLE_CONFIG.FRICTION, delta * 60)
      if (Math.abs(vehicleSpeed) < 0.1) vehicleSpeed = 0
    }

    // 转向（只有在移动时才能转向）
    if (Math.abs(vehicleSpeed) > 0.1) {
      if (keys.get("KeyA") || keys.get("ArrowLeft")) {
        vehicleRotation = Math.min(
          vehicleRotation + VEHICLE_CONFIG.MAX_STEER_SPEED * delta,
          Math.PI / 4
        )
      } else if (keys.get("KeyD") || keys.get("ArrowRight")) {
        vehicleRotation = Math.max(
          vehicleRotation - VEHICLE_CONFIG.MAX_STEER_SPEED * delta,
          -Math.PI / 4
        )
      } else {
        // 自然回正
        vehicleRotation *= Math.pow(0.9, delta * 60)
      }
    } else {
      vehicleRotation *= Math.pow(0.9, delta * 60)
    }

    // 应用旋转（转向速度与当前速度相关，速度越快转向越慢）
    const turnFactor = Math.min(
      Math.abs(vehicleSpeed) / VEHICLE_CONFIG.MAX_SPEED,
      1
    )
    // 降低转向速度，使转向更平滑
    const actualTurnSpeed = vehicleRotation * turnFactor * delta * 0.8
    vehicleBody.quaternion.y += actualTurnSpeed

    // 计算前进方向
    const forward = new CANNON.Vec3(
      Math.sin(vehicleBody.quaternion.y),
      0,
      Math.cos(vehicleBody.quaternion.y)
    )

    // 计算当前速度在前进方向上的分量
    const currentSpeed = vehicleBody.velocity.dot(forward)
    const speedDiff = vehicleSpeed - currentSpeed

    // 应用力来达到目标速度（更平滑的方式）
    const forceMagnitude = speedDiff * vehicleBody.mass * VEHICLE_CONFIG.FORCE_MULTIPLIER
    const force = forward.scale(forceMagnitude)
    vehicleBody.applyLocalForce(force, new CANNON.Vec3(0, 0, 0))

    // 限制最大速度
    const currentVelocity = vehicleBody.velocity.length()
    if (currentVelocity > VEHICLE_CONFIG.MAX_VELOCITY) {
      const scale = VEHICLE_CONFIG.MAX_VELOCITY / currentVelocity
      vehicleBody.velocity.x *= scale
      vehicleBody.velocity.z *= scale
    }

    // 限制Y轴速度，防止车辆飞起来
    if (vehicleBody.velocity.y > 0.1) {
      vehicleBody.velocity.y *= 0.5
    }

    // 同步网格位置（直接同步，物理引擎已经足够平滑）
    const meshPos = vehicleMesh.position as any
    const bodyPos = vehicleBody.position
    meshPos.set(bodyPos.x, bodyPos.y, bodyPos.z)
    
    const meshQuat = vehicleMesh.quaternion as any
    const bodyQuat = vehicleBody.quaternion
    meshQuat.set(bodyQuat.x, bodyQuat.y, bodyQuat.z, bodyQuat.w)
  }

  const getSpeed = (): number => {
    return vehicleBody.velocity.length() * 3.6 // 转换为 km/h
  }

  const getPosition = (): CANNON.Vec3 => {
    return vehicleBody.position
  }

  const cleanup = () => {
    // 清理几何体和材质
    vehicleMesh.traverse((child) => {
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
  }

  return {
    body: vehicleBody,
    mesh: vehicleMesh,
    get speed() {
      return vehicleSpeed
    },
    get rotation() {
      return vehicleRotation
    },
    update,
    getSpeed,
    getPosition,
    cleanup,
  }
}

