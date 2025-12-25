// 棋子皮肤配置类
export class ChessSkin {
  constructor() {
    this.skins = [
      {
        id: 'classic',
        name: '经典样式',
        redSample: '帅',
        blackSample: '将',
        red: {
          background: 'radial-gradient(circle, #ff6b6b, #ee5a6f)',
          border: '#c92a2a',
          color: '#fff'
        },
        black: {
          background: 'radial-gradient(circle, #495057, #212529)',
          border: '#000',
          color: '#fff'
        }
      },
      {
        id: 'wood',
        name: '木质纹理',
        redSample: '帅',
        blackSample: '将',
        red: {
          background: 'linear-gradient(135deg, #d4a574 0%, #c8956e 100%)',
          border: '#8b5a3c',
          color: '#8b0000'
        },
        black: {
          background: 'linear-gradient(135deg, #654321 0%, #3e2723 100%)',
          border: '#1a0d00',
          color: '#ffd700'
        }
      },
      {
        id: 'jade',
        name: '青玉风格',
        redSample: '帅',
        blackSample: '将',
        red: {
          background: 'linear-gradient(135deg, #ffebcd 0%, #ffd700 100%)',
          border: '#b8860b',
          color: '#8b0000'
        },
        black: {
          background: 'linear-gradient(135deg, #2f4f4f 0%, #1c3d3d 100%)',
          border: '#0a1a1a',
          color: '#f0f8ff'
        }
      },
      {
        id: 'modern',
        name: '现代简约',
        redSample: '帅',
        blackSample: '将',
        red: {
          background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
          border: '#8b2e5a',
          color: '#fff'
        },
        black: {
          background: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
          border: '#1a202c',
          color: '#fff'
        }
      }
    ]
  }

  // 获取所有皮肤
  getAllSkins() {
    return this.skins
  }

  // 获取皮肤样式
  getSkinStyle(skinId, color) {
    const skin = this.skins.find(s => s.id === skinId)
    if (!skin) return {}
    const style = skin[color]
    return {
      background: style.background,
      borderColor: style.border,
      color: style.color
    }
  }

  // 获取皮肤信息
  getSkinById(skinId) {
    return this.skins.find(s => s.id === skinId)
  }
}
