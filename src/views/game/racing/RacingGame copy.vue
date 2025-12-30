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

// 控制变量
let targetEngineForce = 0
let currentEngineForce = 0
let steeringValue = 0
let isBraking = false // 刹车状态
const maxEngineForce = 200 // 最大引擎力，限制最高速度
const brakeForce = 400 // 刹车力
const forceSmoothFactor = 0.05 // 引擎力平滑系数，降低以减缓加速度
const airResistance = 0.95 // 空气阻力系数
const rollingResistance = 0.9 // 滚动阻力系数

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
    contactEquationRelaxation: 3, // 增加接触松弛值以增加摩擦
  })
  world.addContactMaterial(wheelGroundContact)

  const groundShape = new CANNON.Plane()
  const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
  world.addBody(groundBody)
}

const createRoad = () => {
  // 道路（Three.js）
  const roadGeometry = new THREE.PlaneGeometry(20, 500)
  const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, side: THREE.DoubleSide })
  const road = new THREE.Mesh(roadGeometry, roadMaterial)
  road.rotation.x = -Math.PI / 2
  road.position.y = 0.01
  road.receiveShadow = true
  scene.add(road)

  // 道路边线
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
  const lineGeo = new THREE.PlaneGeometry(1, 500)

  const leftLine = new THREE.Mesh(lineGeo, lineMat)
  leftLine.rotation.x = -Math.PI / 2
  leftLine.position.set(-10.5, 0.02, 0)
  scene.add(leftLine)

  const rightLine = new THREE.Mesh(lineGeo, lineMat)
  rightLine.rotation.x = -Math.PI / 2
  rightLine.position.set(10.5, 0.02, 0)
  scene.add(rightLine)

  // 中间虚线
  for (let i = -250; i < 250; i += 10) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 5), new THREE.MeshStandardMaterial({ color: 0xffff00 }))
    dash.rotation.x = -Math.PI / 2
    dash.position.set(0, 0.02, i)
    scene.add(dash)
  }

  // 草地
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x228b22 })
  const grassGeo = new THREE.PlaneGeometry(100, 500)
  const leftGrass = new THREE.Mesh(grassGeo, grassMat)
  leftGrass.rotation.x = -Math.PI / 2
  leftGrass.position.set(-60.5, 0, 0)
  scene.add(leftGrass)

  const rightGrass = new THREE.Mesh(grassGeo, grassMat)
  rightGrass.rotation.x = -Math.PI / 2
  rightGrass.position.set(60.5, 0, 0)
  scene.add(rightGrass)

  createTrees()
}

const createTrees = () => {
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8)
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  const leavesGeo = new THREE.ConeGeometry(2, 4, 8)
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 })

  for (let i = 0; i < 30; i++) {
    const z = (Math.random() - 0.5) * 400
    const side = Math.random() > 0.5 ? 1 : -1
    const x = side * (15 + Math.random() * 40)
    const treeGroup = new THREE.Group()
    const trunk = new THREE.Mesh(trunkGeo, trunkMat)
    trunk.position.y = 1
    treeGroup.add(trunk)
    const leaves = new THREE.Mesh(leavesGeo, leavesMat)
    leaves.position.y = 3
    treeGroup.add(leaves)
    treeGroup.position.set(x, 0, z)
    scene.add(treeGroup)
  }
}

const createVehicle = () => {
  vehicleMesh = new THREE.Group()

  // 车身
  const chassisGeometry = new THREE.BoxGeometry(2, 0.8, 4)
  const chassisMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, metalness: 0.6, roughness: 0.4 })
  const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial)
  chassis.position.y = 0.6
  chassis.castShadow = true
  vehicleMesh.add(chassis)

  // 车顶
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2), new THREE.MeshStandardMaterial({ color: 0xcc0000 }))
  roof.position.set(0, 1.1, -0.3)
  vehicleMesh.add(roof)

  // 玻璃
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 })
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.8, 0.2), glassMat)
  windshield.position.set(0, 1.1, -1.1)
  vehicleMesh.add(windshield)

  scene.add(vehicleMesh)

  // 物理底盘
  const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2))
  vehicleChassisBody = new CANNON.Body({ mass: 150, position: new CANNON.Vec3(0, 1.2, 0) })
  vehicleChassisBody.addShape(chassisShape)
  vehicleChassisBody.angularDamping = 0.8
  world.addBody(vehicleChassisBody)

  raycastVehicle = new CANNON.RaycastVehicle({
    chassisBody: vehicleChassisBody,
    indexForwardAxis: 2, // 设置 Z 轴为前进方向
    indexRightAxis: 0,
    indexUpAxis: 1,
  })

  const wheelOptions = {
    radius: 0.3,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    suspensionRestLength: 0.3,
    suspensionStiffness: 30,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new CANNON.Vec3(1, 0, 0),
    chassisConnectionPointLocal: new CANNON.Vec3(),
  }

  const positions = [
    new CANNON.Vec3(-0.8, -0.3, 1.2), // 左前
    new CANNON.Vec3(0.8, -0.3, 1.2), // 右前
    new CANNON.Vec3(-0.8, -0.3, -1.2), // 左后
    new CANNON.Vec3(0.8, -0.3, -1.2), // 右后
  ]

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

const handleKeyDown = (event: KeyboardEvent) => {
  switch (event.key.toLowerCase()) {
    case "w":
    case "arrowup":
      targetEngineForce = 600 // 正值表示前进
      hasStartedMoving = true // 标记为已开始移动
      break
    case "s":
    case "arrowdown":
      targetEngineForce = -600 // 负值表示后退
      hasStartedMoving = true // 标记为已开始移动
      break
    case "a":
    case "arrowleft":
      steeringValue = -0.2
      break
    case "d":
    case "arrowright":
      steeringValue = 0.2
      break
    case " ": // 空格键刹车
      isBraking = true
      break
  }
}

const handleKeyUp = (event: KeyboardEvent) => {
  switch (event.key.toLowerCase()) {
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
    case " ": // 空格键释放
      isBraking = false
      break
  }
}

// 响应式数据
const state = reactive({
  currentSpeed: 0,
  totalDistance: 0,
  isBraking: false,
})

let lastPosition: CANNON.Vec3 | null = null;
let hasStartedMoving = false; // 标记是否已经开始移动
let lastValidPosition: CANNON.Vec3 | null = null; // 存储上次有效位置

const updateVehicle = () => {
  // 平滑调整引擎力
  currentEngineForce += (targetEngineForce - currentEngineForce) * forceSmoothFactor
  
  // 限制最大引擎力
  if (Math.abs(currentEngineForce) > maxEngineForce) {
    currentEngineForce = Math.sign(currentEngineForce) * maxEngineForce;
  }
  
  // 同步刹车状态到响应式状态
  state.isBraking = isBraking;
  
  // 刹车逻辑
  if (isBraking) {
    // 应用刹车力，方向与当前运动方向相反
    const currentSpeed = Math.sqrt(
      vehicleChassisBody.velocity.x * vehicleChassisBody.velocity.x + 
      vehicleChassisBody.velocity.z * vehicleChassisBody.velocity.z
    );
    
    if (currentSpeed > 0.1) { // 只有在车辆移动时才刹车
      // 计算当前运动方向
      const directionX = vehicleChassisBody.velocity.x / currentSpeed;
      const directionZ = vehicleChassisBody.velocity.z / currentSpeed;
      
      // 应用反向刹车力
      const brakeForceX = -directionX * brakeForce;
      const brakeForceZ = -directionZ * brakeForce;
      
      vehicleChassisBody.applyForce(new CANNON.Vec3(brakeForceX, 0, brakeForceZ), vehicleChassisBody.position);
    } else {
      // 如果车辆几乎停止，将引擎力设为0
      currentEngineForce = 0;
    }
  } else {
    // 应用阻力
    if (targetEngineForce === 0) {
      // 当没有输入时，应用滚动阻力
      currentEngineForce *= rollingResistance
    } else {
      // 当有输入时，也应用空气阻力
      currentEngineForce *= airResistance
    }
    
    // 应用引擎力到后轮
    raycastVehicle.applyEngineForce(currentEngineForce, 2)
    raycastVehicle.applyEngineForce(currentEngineForce, 3)
  }
  
  raycastVehicle.setSteeringValue(steeringValue, 0)
  raycastVehicle.setSteeringValue(steeringValue, 1)

  for (let i = 0; i < raycastVehicle.wheelInfos.length; i++) {
    raycastVehicle.updateWheelTransform(i)
    const t = raycastVehicle.wheelInfos[i].worldTransform
    wheelMeshes[i].position.copy(t.position as any)
    wheelMeshes[i].quaternion.copy(t.quaternion as any)
  }

  vehicleMesh.position.copy(vehicleChassisBody.position as any)
  vehicleMesh.quaternion.copy(vehicleChassisBody.quaternion as any)
  
  // 计算速度和距离
  if (lastPosition) {
    const displacement = vehicleChassisBody.position.distanceTo(lastPosition);
    
    // 计算速度 (基于物理引擎的线性速度)
    const speed = Math.sqrt(
      vehicleChassisBody.velocity.x * vehicleChassisBody.velocity.x + 
      vehicleChassisBody.velocity.z * vehicleChassisBody.velocity.z
    );
    // 将速度从 m/s 转换为 km/h
    state.currentSpeed = Math.round(speed * 3.6);
    
    // 检查车辆是否在移动
    const isMoving = speed > 0.1; // 设置阈值来判断车辆是否在移动
    
    if (isMoving) {
      if (!hasStartedMoving) {
        hasStartedMoving = true; // 标记为已开始移动
        lastValidPosition = new CANNON.Vec3(vehicleChassisBody.position.x, 0, vehicleChassisBody.position.z);
      } else {
        // 如果已经有有效位置，计算距离
        if (lastValidPosition) {
          const movementDistance = vehicleChassisBody.position.distanceTo(lastValidPosition);
          state.totalDistance = movementDistance; // 直接设置为移动距离，而不是累加
        }
      }
    }
    
    // 只有在移动时才更新lastPosition，避免非移动时更新位置
    if (isMoving) {
      lastPosition = new CANNON.Vec3(vehicleChassisBody.position.x, 0, vehicleChassisBody.position.z);
    }
  } else {
    // 初始化lastPosition
    lastPosition = new CANNON.Vec3(vehicleChassisBody.position.x, 0, vehicleChassisBody.position.z);
  }
}

const updateCamera = () => {
  const relativeOffset = new THREE.Vector3(0, 5, 10)
  const cameraOffset = relativeOffset.applyMatrix4(vehicleMesh.matrixWorld)
  camera.position.lerp(cameraOffset, 0.1)
  camera.lookAt(vehicleMesh.position)
}

const animate = () => {
  world.step(1 / 60)
  updateVehicle()
  updateCamera()
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

onMounted(() => {
  initThreeJS()
  initCannonJS()
  createRoad()
  createVehicle()
  window.addEventListener("keydown", handleKeyDown)
  window.addEventListener("keyup", handleKeyUp)
  animate()
})

// 暴露给模板
const { currentSpeed, totalDistance } = toRefs(state);

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown)
  window.removeEventListener("keyup", handleKeyUp)
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

.speed-display, .distance-display {
  margin: 5px 0;
}

.speed-display {
  color: #4caf50;
  font-weight: bold;
}

.distance-display {
  color: #2196f3;
  font-weight: bold;
}

.brake-display {
  color: #f44336;
  font-weight: bold;
  margin-top: 5px;
}
</style>
