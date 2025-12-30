export interface Controls {
  keys: Map<string, boolean>
  setup: () => void
  cleanup: () => void
}

export function createControls(): Controls {
  const keys = new Map<string, boolean>()

  const handleKeyDown = (e: KeyboardEvent) => {
    keys.set(e.code, true)
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    keys.set(e.code, false)
  }

  const setup = () => {
    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
  }

  const cleanup = () => {
    window.removeEventListener("keydown", handleKeyDown)
    window.removeEventListener("keyup", handleKeyUp)
  }

  return {
    keys,
    setup,
    cleanup,
  }
}

