<template>
  <div ref="container" class="racing-game-container">
    <div class="dashboard">
      <div class="speed-display">速度: {{ Math.round(currentSpeed) }} km/h</div>
      <div class="distance-display">距离: {{ Math.round(totalDistance) }} m</div>
      <div class="brake-display" v-if="isBraking">[BRAKE]</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive, toRefs } from "vue"
import * as THREE from "three"
import * as CANNON from "cannon-es"

const container = ref<HTMLElement>()

// Three.js 变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let vehicleMesh: THREE.Group
let wheelMeshes: THREE.Mesh[] = []

// Cannon.js 变量
let world: CANNON.World
let vehicleChassisBody: CANNON.Body
let raycastVehicle: CANNON.RaycastVehicle
let groundMaterial: CANNON.Material
let wheelMaterial: CANNON.Material

// 控制及限速变量
let targetEngineForce = 0
let currentEngineForce = 0
let steeringValue = 0
let isBraking = false
const maxEngineForce = 2000 // 增加动力以支持到达 350km/h
const brakeForce = 150
const forceSmoothFactor = 0.3
const MAX_SPEED_KMH = 200 // 最大速度限制

// 动态生成器实例
let roadGenerator: any
let treeGenerator: any

const initThreeJS = () => {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x87ceeb)
  scene.fog = new THREE.Fog(0x87ceeb, 10, 150)

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 5, 10)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.value?.appendChild(renderer.domElement)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(10, 20, 10)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.set(2048, 2048)
  scene.add(directionalLight)

  roadGenerator = new DynamicRoadGenerator(scene)
  treeGenerator = new DynamicTreeGenerator(scene)

  const groundGeometry = new THREE.PlaneGeometry(200, 2000)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x228b22, side: THREE.DoubleSide })
  const ground = new THREE.Mesh(groundGeometry, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
}

const initCannonJS = () => {
  world = new CANNON.World()
  world.gravity.set(0, -9.82, 0)
  world.broadphase = new CANNON.SAPBroadphase(world)

  groundMaterial = new CANNON.Material("ground")
  wheelMaterial = new CANNON.Material("wheel")

  const wheelGroundContact = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
    friction: 0.8,
    restitution: 0,
    contactEquationStiffness: 1000,
    contactEquationRelaxation: 3,
  })
  world.addContactMaterial(wheelGroundContact)

  const groundShape = new CANNON.Plane()
  const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.addBody(groundBody)
}

// 动态道路生成器
class DynamicRoadGenerator {
  private roadSegments: THREE.Mesh[] = []
  private roadWidth: number = 20
  private segmentLength: number = 50
  private maxSegments: number = 30 // 增加段数以应对高速
  private scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.generateInitialRoad()
  }

  private generateInitialRoad(): void {
    for (let i = 0; i < 5; i++) {
      this.addRoadSegment(0, i * -this.segmentLength)
    }
  }

  private addRoadSegment(x: number, z: number): void {
    const geometry = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength)
    const material = new THREE.MeshStandardMaterial({ color: 0x222222, side: THREE.DoubleSide, roughness: 0.9 })
    const roadSegment = new THREE.Mesh(geometry, material)
    roadSegment.rotation.x = -Math.PI / 2
    roadSegment.position.set(x, 0.01, z - this.segmentLength / 2)
    roadSegment.receiveShadow = true
    this.scene.add(roadSegment)
    this.roadSegments.push(roadSegment)
    this.addRoadMarkings(x, z)
  }

  private addRoadMarkings(x: number, z: number): void {
    const leftLineGeo = new THREE.PlaneGeometry(1, this.segmentLength)
    const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
    const leftLine = new THREE.Mesh(leftLineGeo, lineMat)
    leftLine.rotation.x = -Math.PI / 2
    leftLine.position.set(x - this.roadWidth / 2 - 0.5, 0.02, z - this.segmentLength / 2)
    this.scene.add(leftLine)

    const rightLine = new THREE.Mesh(leftLineGeo, lineMat)
    rightLine.rotation.x = -Math.PI / 2
    rightLine.position.set(x + this.roadWidth / 2 + 0.5, 0.02, z - this.segmentLength / 2)
    this.scene.add(rightLine)

    for (let i = 0; i < this.segmentLength; i += 10) {
      const dashGeo = new THREE.PlaneGeometry(0.5, 5)
      const dashMat = new THREE.MeshStandardMaterial({ color: 0xffff00 })
      const dash = new THREE.Mesh(dashGeo, dashMat)
      dash.rotation.x = -Math.PI / 2
      dash.position.set(x, 0.02, z - i - 5)
      this.scene.add(dash)
    }
  }

  update(vehiclePosition: THREE.Vector3): void {
    const frontThreshold = vehiclePosition.z - 300 // 高速时视野需要更远
    const frontSegment = this.roadSegments[this.roadSegments.length - 1]
    if (frontSegment && frontSegment.position.z > frontThreshold) {
      const newX = frontSegment.position.x + (Math.random() - 0.5) * 1.5
      this.addRoadSegment(newX, frontSegment.position.z - this.segmentLength)
    }
    while (this.roadSegments.length > this.maxSegments) {
      const segment = this.roadSegments.shift()
      if (segment) this.scene.remove(segment)
    }
  }

  clear(): void {
    this.roadSegments.forEach((s) => this.scene.remove(s))
    this.roadSegments = []
  }
}

// 动态树木生成器
class DynamicTreeGenerator {
  private trees: THREE.Group[] = []
  private treeSpacing: number = 80
  private scene: THREE.Scene

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.generateTrees(-200, 0)
  }

  private generateTrees(startZ: number, endZ: number): void {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
    const leavesGeo = new THREE.ConeGeometry(2, 4, 8)
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 })

    for (let z = startZ; z > endZ; z -= this.treeSpacing) {
      for (let i = 0; i < 2; i++) {
        if (Math.random() > 0.3) {
          const side = Math.random() > 0.5 ? 1 : -1
          const x = side * (30 + Math.random() * 20)
          const treeGroup = new THREE.Group()
          const trunk = new THREE.Mesh(trunkGeo, trunkMat)
          trunk.position.y = 1
          treeGroup.add(trunk)
          const leaves = new THREE.Mesh(leavesGeo, leavesMat)
          leaves.position.y = 3
          treeGroup.add(leaves)
          treeGroup.position.set(x, 0, z)
          this.scene.add(treeGroup)
          this.trees.push(treeGroup)
        }
      }
    }
  }

  update(vehiclePosition: THREE.Vector3): void {
    const viewDistance = 400
    const frontThreshold = vehiclePosition.z - viewDistance
    const rearThreshold = vehiclePosition.z + 150
    const farthestTree = this.trees.length > 0 ? Math.min(...this.trees.map((t) => t.position.z)) : vehiclePosition.z
    if (farthestTree > frontThreshold) this.generateTrees(farthestTree, frontThreshold)
    this.trees = this.trees.filter((t) => {
      if (t.position.z > rearThreshold) {
        this.scene.remove(t)
        return false
      }
      return true
    })
  }

  clear(): void {
    this.trees.forEach((t) => this.scene.remove(t))
    this.trees = []
  }
}

const createVehicle = () => {
  vehicleMesh = new THREE.Group()
  const chassisGeometry = new THREE.BoxGeometry(2, 0.8, 4)
  const chassisMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.6, roughness: 0.4 })
  const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial)
  chassis.position.y = 0.6
  chassis.castShadow = true
  vehicleMesh.add(chassis)

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2), new THREE.MeshStandardMaterial({ color: 0xcc0000 }))
  roof.position.set(0, 1.1, -0.3)
  vehicleMesh.add(roof)

  scene.add(vehicleMesh)

  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.2, 2))
  vehicleChassisBody = new CANNON.Body({ mass: 150, position: new CANNON.Vec3(0, 0.6, 0) })
  vehicleChassisBody.addShape(chassisShape, new CANNON.Vec3(0, -0.3, 0))
  vehicleChassisBody.angularDamping = 0.95 // 高速行驶下需要更高的旋转阻尼
  vehicleChassisBody.linearDamping = 0.05
  world.addBody(vehicleChassisBody)

  raycastVehicle = new CANNON.RaycastVehicle({
    chassisBody: vehicleChassisBody,
    indexForwardAxis: 2,
    indexRightAxis: 0,
    indexUpAxis: 1,
  })

  const wheelOptions = {
    radius: 0.3,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionRestLength: 0.3,
    suspensionStiffness: 100, // 硬悬挂更适合高速
    dampingRelaxation: 3,
    dampingCompression: 12,
    maxSuspensionForce: 100000,
    rollInfluence: 0.0, // 彻底消除侧翻影响
    axleLocal: new CANNON.Vec3(1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(),
  }

  const positions = [new CANNON.Vec3(-0.8, -0.1, 1.2), new CANNON.Vec3(0.8, -0.1, 1.2), new CANNON.Vec3(-0.8, -0.1, -1.2), new CANNON.Vec3(0.8, -0.1, -1.2)]

  positions.forEach((pos) => {
    wheelOptions.chassisConnectionPointLocal.copy(pos)
    raycastVehicle.addWheel(wheelOptions)
  })

  raycastVehicle.addToWorld(world)

  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16)
  wheelGeo.rotateZ(Math.PI / 2)
  const wheelMatMesh = new THREE.MeshStandardMaterial({ color: 0x222222 })

  raycastVehicle.wheelInfos.forEach(() => {
    const mesh = new THREE.Mesh(wheelGeo, wheelMatMesh)
    scene.add(mesh)
    wheelMeshes.push(mesh)
  })
}
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key.toLowerCase()) {
    case "w":
    case "arrowup":
      targetEngineForce = maxEngineForce
      break
    case "s":
    case "arrowdown":
      targetEngineForce = -maxEngineForce * 0.5
      break
    case "a":
    case "arrowleft":
      steeringValue = -0.3
      break
    case "d":
    case "arrowright":
      steeringValue = 0.3
      break
    case " ":
      isBraking = true
      break
  }
}

const handleKeyUp = (e: KeyboardEvent) => {
  switch (e.key.toLowerCase()) {
    case "w":
    case "arrowup":
    case "s":
    case "arrowdown":
      targetEngineForce = 0
      break
    case "a":
    case "arrowleft":
    case "d":
    case "arrowright":
      steeringValue = 0
      break
    case " ":
      isBraking = false
      break
  }
}

const state = reactive({ currentSpeed: 0, totalDistance: 0, isBraking: false })
let lastValidPosition: CANNON.Vec3 | null = null

const updateVehicle = () => {
  // 计算当前实时速度 (km/h)
  const speed = Math.sqrt(vehicleChassisBody.velocity.x ** 2 + vehicleChassisBody.velocity.z ** 2)
  const speedKmh = speed * 3.6
  state.currentSpeed = Math.round(speedKmh)

  // 平滑引擎力切换
  currentEngineForce += (targetEngineForce - currentEngineForce) * forceSmoothFactor
  state.isBraking = isBraking

  if (isBraking) {
    currentEngineForce = 0
    raycastVehicle.setBrake(brakeForce, 0)
    raycastVehicle.setBrake(brakeForce, 1)
    raycastVehicle.setBrake(brakeForce, 2)
    raycastVehicle.setBrake(brakeForce, 3)
  } else {
    raycastVehicle.setBrake(0, 0)
    raycastVehicle.setBrake(0, 1)
    raycastVehicle.setBrake(0, 2)
    raycastVehicle.setBrake(0, 3)

    // --- 增加速度限制逻辑 ---
    // 如果超过最大速度，且玩家还在按油门，则不增加力，甚至施加微弱阻力
    if (speedKmh >= MAX_SPEED_KMH && currentEngineForce > 0) {
      raycastVehicle.applyEngineForce(0, 2)
      raycastVehicle.applyEngineForce(0, 3)
    } else {
      raycastVehicle.applyEngineForce(currentEngineForce, 2)
      raycastVehicle.applyEngineForce(currentEngineForce, 3)
    }
  }
  // --- 关键改进：高速转向衰减与死区处理 ---
  // 当速度越高，允许的最大转角越小，防止失控突然转向
  let finalSteering = 0
  if (Math.abs(steeringValue) > 0.01) {
    // 速度越高，转向灵敏度呈指数级下降
    const speedFactor = Math.max(0.02, 1 - speedKmh / 400)
    finalSteering = steeringValue * speedFactor
  }

  raycastVehicle.setSteeringValue(finalSteering, 0)
  raycastVehicle.setSteeringValue(finalSteering, 1)

  // 物理稳定性增强：强制锁定 Y 轴以外的角运动
  vehicleChassisBody.angularVelocity.x *= 0.1
  vehicleChassisBody.angularVelocity.z *= 0.1

  // 如果没有转向输入，强制归零角速度，防止漂移残留导致的“突然转向”
  if (Math.abs(steeringValue) < 0.01) {
    vehicleChassisBody.angularVelocity.y *= 0.5
  }

  for (let i = 0; i < raycastVehicle.wheelInfos.length; i++) {
    raycastVehicle.updateWheelTransform(i)
    const t = raycastVehicle.wheelInfos[i].worldTransform
    wheelMeshes[i].position.copy(t.position as any)
    wheelMeshes[i].quaternion.copy(t.quaternion as any)
  }

  vehicleMesh.position.copy(vehicleChassisBody.position as any)
  vehicleMesh.quaternion.copy(vehicleChassisBody.quaternion as any)

  if (!lastValidPosition) {
    lastValidPosition = new CANNON.Vec3().copy(vehicleChassisBody.position)
  } else {
    if (speed > 0.1) {
      const delta = vehicleChassisBody.position.distanceTo(lastValidPosition)
      state.totalDistance += delta
      lastValidPosition.copy(vehicleChassisBody.position)
    }
  }
}

const updateCamera = () => {
  // 高速行驶时摄像机稍微拉远，增加视野
  const distance = 10 + state.currentSpeed / 100
  const relativeOffset = new THREE.Vector3(0, 5, distance)
  const cameraOffset = relativeOffset.applyMatrix4(vehicleMesh.matrixWorld)
  camera.position.lerp(cameraOffset, 0.1)
  camera.lookAt(vehicleMesh.position)
}

const animate = () => {
  world.step(1 / 60)
  updateVehicle()
  const vPos = new THREE.Vector3(vehicleChassisBody.position.x, 0, vehicleChassisBody.position.z)
  if (roadGenerator) roadGenerator.update(vPos)
  if (treeGenerator) treeGenerator.update(vPos)
  updateCamera()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

onMounted(() => {
  initThreeJS()
  initCannonJS()
  createVehicle()
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)
  animate()
})

const { currentSpeed, totalDistance } = toRefs(state)

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown)
  window.removeEventListener("keyup", handleKeyUp)
  if (roadGenerator) roadGenerator.clear()
  if (treeGenerator) treeGenerator.clear()
})
</script>

<style scoped>
.racing-game-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #000;
  position: relative;
}
.dashboard {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 10px;
  font-family: Arial, sans-serif;
  font-size: 18px;
  z-index: 10;
}
.speed-display {
  color: #4caf50;
  font-weight: bold;
}
.distance-display {
  color: #2196f3;
  font-weight: bold;
  margin: 5px 0;
}
.brake-display {
  color: #f44336;
  font-weight: bold;
  margin-top: 5px;
}
</style>
