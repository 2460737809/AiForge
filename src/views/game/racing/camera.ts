import * as THREE from "three"
import { CAMERA_CONFIG } from "./constants"

/**
 * 更新相机位置，使其跟随车辆
 * @param camera - Three.js 相机对象
 * @param vehicleMesh - 车辆网格对象
 */
export function updateCamera(
  camera: THREE.PerspectiveCamera,
  vehicleMesh: THREE.Group
): void {
  // 更新相机（跟随车辆，类似地平线视角）
  const quaternion = (vehicleMesh as any).quaternion as THREE.Quaternion
  const position = (vehicleMesh as any).position as THREE.Vector3
  
  // 计算相机目标位置（在车辆后方，稍微高一点）
  const cameraOffset = new THREE.Vector3(
    0,
    CAMERA_CONFIG.HEIGHT,
    CAMERA_CONFIG.DISTANCE
  )
  cameraOffset.applyQuaternion(quaternion)

  const targetCameraPos = position.clone().add(cameraOffset)
  const cameraPos = (camera as any).position as THREE.Vector3
  
  // 使用更平滑的插值，减少抖动
  cameraPos.lerp(targetCameraPos, 0.15)

  // 相机看向车辆前方（稍微向下看，确保能看到道路）
  const lookAtPos = position.clone()
  lookAtPos.y += 0.5 // 降低看向高度
  const forwardOffset = new THREE.Vector3(0, 0, 15) // 缩短看向距离
  forwardOffset.applyQuaternion(quaternion)
  lookAtPos.add(forwardOffset)
  
  // 平滑看向目标
  const currentLookAt = new THREE.Vector3()
  camera.getWorldDirection(currentLookAt)
  currentLookAt.multiplyScalar(15).add(cameraPos)
  const smoothLookAt = currentLookAt.lerp(lookAtPos, 0.2)
  camera.lookAt(smoothLookAt)
}

/**
 * 处理窗口大小变化
 * @param camera - Three.js 相机对象
 * @param renderer - Three.js 渲染器对象
 * @returns 清理函数，用于移除事件监听器
 */
export function handleResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): () => void {
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  window.addEventListener("resize", onResize)

  return () => {
    window.removeEventListener("resize", onResize)
  }
}

