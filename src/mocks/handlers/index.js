import { userHandlers } from './users'
import { roleHandlers } from './roles'
import { menuHandlers } from './menus'

// 合并所有 handlers
export const handlers = [...userHandlers, ...roleHandlers, ...menuHandlers]
