<template>
  <div class="racing-game-container">
    <div ref="gameCanvas" class="game-canvas"></div>
    <div class="game-ui">
      <div class="controls-info">
        <h3>操作说明</h3>
        <div class="key-item">
          <span class="key">W</span> 加速
        </div>
        <div class="key-item">
          <span class="key">S</span> 减速/倒车
        </div>
        <div class="key-item">
          <span class="key">A</span> 左转
        </div>
        <div class="key-item">
          <span class="key">D</span> 右转
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">速度:</span>
          <span class="stat-value">{{ speed.toFixed(1) }} km/h</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">距离:</span>
          <span class="stat-value">{{ distance.toFixed(0) }} m</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import * as THREE from "three"
import { createScene, createLighting, createGround } from "./scene"
import { createPhysicsWorld } from "./physics"
import { createRoadManager } from "./road"
import { createSceneryManager } from "./scenery"
import { createVehicle } from "./vehicle"
import { createControls } from "./controls"
import { updateCamera, handleResize } from "./camera"
import { ROAD_CONFIG } from "./constants"

const gameCanvas = ref<HTMLElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let world: any
let vehicle: any
let roadManager: any
let sceneryManager: any
let controls: any
let resizeCleanup: (() => void) | null = null

const speed = ref(0)
const distance = ref(0)

let animationFrameId: number | null = null
let isRunning = false

const initGame = () => {
  if (!gameCanvas.value) return

  // 防止重复初始化
  if (isRunning) {
    console.warn("游戏已经在运行中")
    return
  }

  try {
    // 创建场景
    const sceneData = createScene(gameCanvas.value)
    scene = sceneData.scene
    camera = sceneData.camera
    renderer = sceneData.renderer

    // 创建物理世界
    world = createPhysicsWorld()

    // 创建光照
    createLighting(scene)

    // 创建地面
    createGround(scene, world)

    // 创建道路管理器
    roadManager = createRoadManager(scene, world)

    // 创建风景管理器
    sceneryManager = createSceneryManager(scene)

    // 初始化道路
    for (
      let i = -ROAD_CONFIG.SEGMENTS_BEHIND;
      i <= ROAD_CONFIG.SEGMENTS_AHEAD;
      i++
    ) {
      roadManager.createSegment(i * ROAD_CONFIG.LENGTH)
      sceneryManager.create(i * ROAD_CONFIG.LENGTH)
    }

    // 创建车辆
    vehicle = createVehicle(scene, world)

    // 等待一帧，让物理引擎稳定
    requestAnimationFrame(() => {
      // 确保车辆在地面上
      if (vehicle && vehicle.body) {
        const pos = vehicle.body.position
        if (pos.y < 0.5) {
          vehicle.body.position.set(pos.x, 1, pos.z)
        }
      }
    })

    // 创建控制
    controls = createControls()
    controls.setup()

    // 处理窗口大小变化
    resizeCleanup = handleResize(camera, renderer)

    isRunning = true
  } catch (error) {
    console.error("游戏初始化错误:", error)
    isRunning = false
  }
}

const animate = () => {
  if (!isRunning) return

  animationFrameId = requestAnimationFrame(animate)

  try {
    const delta = Math.min(1 / 60, 0.016) // 限制最大delta

    // 更新物理世界
    if (world) {
      world.step(delta)
    }

    // 更新车辆
    if (vehicle && controls) {
      vehicle.update(delta, controls.keys)

      // 更新道路
      const vehiclePos = vehicle.getPosition()
      const vehicleZ = vehiclePos.z
      
      // 验证车辆位置是否有效
      if (isFinite(vehicleZ) && !isNaN(vehicleZ) && roadManager) {
        roadManager.update(vehicleZ)
      }

      // 更新风景
      if (isFinite(vehicleZ) && !isNaN(vehicleZ) && sceneryManager) {
        sceneryManager.update(vehicleZ)
      }

      // 更新相机
      if (vehicle && vehicle.mesh) {
        updateCamera(camera, vehicle.mesh)
      }

      // 更新UI
      const currentSpeed = vehicle.getSpeed()
      if (isFinite(currentSpeed) && !isNaN(currentSpeed)) {
        speed.value = currentSpeed
      }
      if (isFinite(vehicleZ) && !isNaN(vehicleZ)) {
        distance.value = Math.max(0, vehicleZ)
      }
    }

    // 渲染
    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  } catch (error) {
    console.error("动画循环错误:", error)
    isRunning = false
  }
}

onMounted(() => {
  try {
    initGame()
    // 延迟一帧再开始动画，确保所有资源都已初始化
    requestAnimationFrame(() => {
      if (isRunning) {
        animate()
      }
    })
  } catch (error) {
    console.error("游戏初始化错误:", error)
    isRunning = false
  }
})

const cleanup = () => {
  isRunning = false

  // 停止动画循环
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }

  // 清理控制
  if (controls) {
    controls.cleanup()
    controls = null
  }

  // 清理窗口大小监听
  if (resizeCleanup) {
    resizeCleanup()
    resizeCleanup = null
  }

  // 清理车辆
  if (vehicle) {
    if (scene && vehicle.mesh) {
      scene.remove(vehicle.mesh)
      // 清理车辆网格的所有子对象
      vehicle.mesh.traverse((child) => {
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
    if (world && vehicle.body) {
      world.removeBody(vehicle.body)
    }
    vehicle = null
  }

  // 清理道路
  if (roadManager) {
    roadManager.cleanup()
    roadManager = null
  }

  // 清理风景
  if (sceneryManager) {
    sceneryManager.cleanup()
    sceneryManager = null
  }

  // 清理场景中的所有对象
  if (scene) {
    while (scene.children.length > 0) {
      const child = scene.children[0]
      scene.remove(child)
      
      // 清理几何体和材质
      if (child instanceof THREE.Mesh) {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      } else if (child instanceof THREE.Group) {
        child.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            if (obj.geometry) obj.geometry.dispose()
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => mat.dispose())
              } else {
                obj.material.dispose()
              }
            }
          }
        })
      }
    }
  }

  // 清理物理世界
  if (world) {
    // 移除所有物理体
    while (world.bodies.length > 0) {
      world.removeBody(world.bodies[0])
    }
    world = null
  }

  // 清理渲染器
  if (renderer) {
    // 从DOM中移除canvas
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement)
    }
    renderer.dispose()
    renderer = null
  }

  // 清理引用
  scene = null as any
  camera = null as any
}

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.racing-game-container {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.game-canvas {
  width: 100%;
  height: 100%;
}

.game-ui {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.controls-info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
}

.controls-info h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.key-item {
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
}

.key {
  background: #444;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.stats {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  padding: 15px;
  border-radius: 10px;
  color: white;
  font-size: 14px;
}

.stat-item {
  margin: 5px 0;
  display: flex;
  gap: 10px;
}

.stat-label {
  font-weight: bold;
}

.stat-value {
  color: #4ecdc4;
}
</style>
