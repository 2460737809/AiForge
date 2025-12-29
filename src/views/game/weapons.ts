import * as THREE from "three"
import type { Weapon } from "./types"

export function createWeaponModel(weapon: Weapon): THREE.Group | null {
  const group = new THREE.Group()

  switch (weapon.id) {
    case "sword": {
      const bladeGeometry = new THREE.BoxGeometry(0.08, 1.2, 0.02)
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        metalness: 0.8,
        roughness: 0.2,
      })
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial)
      blade.position.y = 0.6
      group.add(blade)

      const guardGeometry = new THREE.BoxGeometry(0.3, 0.08, 0.08)
      const guardMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.6,
        roughness: 0.3,
      })
      const guard = new THREE.Mesh(guardGeometry, guardMaterial)
      guard.position.y = 0.05
      group.add(guard)

      const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8)
      const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const handle = new THREE.Mesh(handleGeometry, handleMaterial)
      handle.position.y = -0.15
      group.add(handle)
      break
    }
    case "axe": {
      const handleGeometry = new THREE.CylinderGeometry(0.04, 0.05, 1.4, 8)
      const handleMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const handle = new THREE.Mesh(handleGeometry, handleMaterial)
      handle.position.y = 0.7
      group.add(handle)

      const bladeGeometry = new THREE.BoxGeometry(0.4, 0.25, 0.08)
      const bladeMaterial = new THREE.MeshStandardMaterial({
        color: 0x708090,
        metalness: 0.7,
        roughness: 0.3,
      })
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial)
      blade.position.set(0.2, 1.2, 0)
      blade.rotation.z = -0.3
      group.add(blade)
      break
    }
    case "bow": {
      const bowGeometry = new THREE.TorusGeometry(0.5, 0.03, 8, 16, Math.PI)
      const bowMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const bow = new THREE.Mesh(bowGeometry, bowMaterial)
      bow.rotation.z = Math.PI / 2
      group.add(bow)

      const stringGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.5, 0.5, 0),
        new THREE.Vector3(0, -0.5, 0),
        new THREE.Vector3(0.5, 0.5, 0),
      ])
      const stringMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
      const string = new THREE.Line(stringGeometry, stringMaterial)
      group.add(string)

      const arrowGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8)
      const arrowMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 })
      const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
      arrow.rotation.z = Math.PI / 2
      arrow.position.set(0, 0, 0.1)
      group.add(arrow)

      const tipGeometry = new THREE.ConeGeometry(0.04, 0.1, 8)
      const tipMaterial = new THREE.MeshStandardMaterial({ color: 0xc0c0c0 })
      const tip = new THREE.Mesh(tipGeometry, tipMaterial)
      tip.rotation.z = -Math.PI / 2
      tip.position.set(0.45, 0, 0.1)
      group.add(tip)
      break
    }
    case "gun": {
      const barrelGeometry = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 8)
      const barrelMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f2f2f,
        metalness: 0.8,
        roughness: 0.2,
      })
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
      barrel.rotation.z = Math.PI / 2
      barrel.position.x = 0.4
      group.add(barrel)

      const bodyGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.1)
      const body = new THREE.Mesh(bodyGeometry, barrelMaterial)
      body.position.set(0.1, 0, 0)
      group.add(body)

      const handleGeometry = new THREE.BoxGeometry(0.08, 0.2, 0.1)
      const handle = new THREE.Mesh(handleGeometry, barrelMaterial)
      handle.position.set(0, -0.15, 0)
      group.add(handle)
      break
    }
    default:
      return null
  }

  group.scale.set(0.8, 0.8, 0.8)
  return group
}

export function getWeaponPosition(weaponId: string): { position: [number, number, number]; rotation: [number, number, number] } {
  switch (weaponId) {
    case "sword":
      return { position: [0.4, 1.2, 0.25], rotation: [0, 0, -Math.PI / 6] }
    case "axe":
      return { position: [0.4, 1.2, 0.25], rotation: [0, 0, -Math.PI / 4] }
    case "bow":
      return { position: [0.35, 1.25, 0.3], rotation: [0, Math.PI / 2, 0] }
    case "gun":
      return { position: [0.35, 1.2, 0.3], rotation: [0, 0, 0] }
    default:
      return { position: [0.4, 1.2, 0.3], rotation: [0, 0, 0] }
  }
}
