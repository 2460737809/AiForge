import { defineStore } from 'pinia'

export const usePartyStore = defineStore('party', {
  state: () => ({
    config: {
      animationType: 'confetti',
      particleCount: 50,
      colorMode: 'random',
      color: '#ff6b6b',
      particleSize: 1,
      spreadSpeed: 5,
      gravity: 10,
      enabled: true,
      rotating: true,
      fadeOut: true
    },
    isGlobalEnabled: false
  }),

  actions: {
    updateConfig(newConfig) {
      this.config = { ...this.config, ...newConfig }
    },
    setConfigValue(key, value) {
      this.config[key] = value
    },
    toggleGlobal() {
      this.isGlobalEnabled = !this.isGlobalEnabled
    },
    setGlobalEnabled(enabled) {
      this.isGlobalEnabled = enabled
    },
    resetConfig() {
      this.config = {
        animationType: 'confetti',
        particleCount: 50,
        colorMode: 'random',
        color: '#ff6b6b',
        particleSize: 1,
        spreadSpeed: 5,
        gravity: 10,
        enabled: true,
        rotating: true,
        fadeOut: true
      }
    }
  }
})
