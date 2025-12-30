import * as THREE from "three"
import { RENDER_CONFIG, CAMERA_CONFIG } from "./constants"

export function createScene(container: HTMLElement): {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
} {
  // Three.js 场景
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(RENDER_CONFIG.BACKGROUND_COLOR)
  scene.fog = new THREE.Fog(
    RENDER_CONFIG.FOG_COLOR,
    RENDER_CONFIG.FOG_NEAR,
    RENDER_CONFIG.FOG_FAR
  )

  // 相机
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  )
  // 相机初始位置：在车辆后方，稍微高一点
  camera.position.set(0, 3, 8)
  camera.lookAt(0, 1, 0)

  // 渲染器
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  container.appendChild(renderer.domElement)

  return { scene, camera, renderer }
}

export function createLighting(scene: THREE.Scene): void {
  // 环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  // 方向光（太阳）
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(50, 100, 50)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  directionalLight.shadow.camera.near = 0.5
  directionalLight.shadow.camera.far = 500
  directionalLight.shadow.camera.left = -100
  directionalLight.shadow.camera.right = 100
  directionalLight.shadow.camera.top = 100
  directionalLight.shadow.camera.bottom = -100
  scene.add(directionalLight)
}

import * as CANNON from "cannon-es"

export function createGround(
  scene: THREE.Scene,
  world: CANNON.World
): void {
  // 创建大地（草地）
  const groundSize = 1000
  const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize)
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d8b3d, // 绿色草地
    roughness: 0.8,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // 物理地面
  const groundShape = new CANNON.Plane()
  const groundBody = new CANNON.Body({ mass: 0 })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(1, 0, 0),
    -Math.PI / 2
  )
  world.addBody(groundBody)
}

