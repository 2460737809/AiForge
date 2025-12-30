// 道路配置
export const ROAD_CONFIG = {
  LENGTH: 50, // 每段道路长度
  WIDTH: 8, // 道路宽度
  SEGMENTS_AHEAD: 20, // 前方生成的道路段数
  SEGMENTS_BEHIND: 5, // 后方保留的道路段数
}

// 车辆配置
export const VEHICLE_CONFIG = {
  MAX_SPEED: 33.3, // 最大速度 120 km/h (m/s)
  ACCELERATION: 8, // 加速度 (更平滑)
  DECELERATION: 12, // 减速度
  MAX_STEER_SPEED: 1.5, // 最大转向速度 (rad/s) - 降低转向速度
  FRICTION: 0.98, // 摩擦力 (更平滑的减速)
  MASS: 800, // 车辆质量
  FORCE_MULTIPLIER: 8, // 力倍数 (降低，使控制更平滑)
  DRAG_FACTOR: 0.98, // 阻力系数 (更平滑)
  MAX_VELOCITY: 33.3, // 最大速度限制 (m/s)
}

// 相机配置
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  DISTANCE: 15, // 相机距离车辆的距离
  HEIGHT: 8, // 相机高度
  LERP_FACTOR: 0.1, // 相机平滑移动系数
}

// 风景配置
export const SCENERY_CONFIG = {
  WIDTH: 50, // 每侧风景宽度
  TREE_COUNT: 10, // 每段道路的树木数量
  ROCK_COUNT: 5, // 每段道路的石头数量
}

// 物理世界配置
export const PHYSICS_CONFIG = {
  GRAVITY: -9.82,
}

// 渲染配置
export const RENDER_CONFIG = {
  BACKGROUND_COLOR: 0x87ceeb, // 天空蓝
  FOG_COLOR: 0x87ceeb,
  FOG_NEAR: 100,
  FOG_FAR: 500,
}

