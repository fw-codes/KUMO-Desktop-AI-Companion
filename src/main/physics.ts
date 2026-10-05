import { BrowserWindow, ipcMain, screen } from 'electron'

const FRICTION = 0.95
const BOUNCE = 0.78
let GRAVITY = 0 
const MAX_V = 70


const INSET = { left: 100, right: 100, top: 230, bottom: 15 }

export function setupKumoPhysics(win: BrowserWindow): void {
  let dragTimer: NodeJS.Timeout | null = null
  let physTimer: NodeJS.Timeout | null = null
  let vx = 0
  let vy = 0
  const [W, H] = win.getSize() 

  const stopAll = (): void => {
    if (dragTimer) clearInterval(dragTimer)
    if (physTimer) clearInterval(physTimer)
    dragTimer = physTimer = null
  }
  const moveTo = (x: number, y: number): void =>
    win.setBounds({ x: Math.round(x), y: Math.round(y), width: W, height: H })

  ipcMain.on('drag-start', () => {
    stopAll()
    vx = vy = 0
    const cursor = screen.getCursorScreenPoint()
    const [wx, wy] = win.getPosition()
    const offX = cursor.x - wx
    const offY = cursor.y - wy
    let lastX = wx, lastY = wy, lastT = Date.now()

    dragTimer = setInterval(() => {
      const c = screen.getCursorScreenPoint()
      const nx = c.x - offX
      const ny = c.y - offY
      const now = Date.now()
      const dt = Math.max(now - lastT, 1) / 16.67
      vx = vx * 0.6 + ((nx - lastX) / dt) * 0.4
      vy = vy * 0.6 + ((ny - lastY) / dt) * 0.4
      moveTo(nx, ny)
      lastX = nx; lastY = ny; lastT = now
    }, 8)
  })

  ipcMain.on('drag-end', () => {
    if (dragTimer) clearInterval(dragTimer)
    dragTimer = null

    vx = Math.max(-MAX_V, Math.min(MAX_V, vx))
    vy = Math.max(-MAX_V, Math.min(MAX_V, vy))
    let [px, py] = win.getPosition()

    physTimer = setInterval(() => {
      if (win.isDestroyed()) return stopAll()
      const area = screen.getDisplayMatching(win.getBounds()).workArea

      vy += GRAVITY
      vx *= FRICTION
      vy *= FRICTION
      px += vx
      py += vy

      const hit = (axis: 'x' | 'y', speed: number): void => {
        if (speed > 3) win.webContents.send('bounce', { axis, speed })
      }

      const minX = area.x - INSET.left
      const maxX = area.x + area.width - W + INSET.right
      const minY = area.y - INSET.top
      const maxY = area.y + area.height - H + INSET.bottom

      if (px < minX) { px = minX; hit('x', Math.abs(vx)); vx = -vx * BOUNCE }
      if (px > maxX) { px = maxX; hit('x', Math.abs(vx)); vx = -vx * BOUNCE }
      if (py < minY) { py = minY; hit('y', Math.abs(vy)); vy = -vy * BOUNCE }
      if (py > maxY) {
        py = maxY
        hit('y', Math.abs(vy))
        vy = Math.abs(vy) < 1.5 ? 0 : -vy * BOUNCE
      }

      moveTo(px, py)

      if (Math.hypot(vx, vy) < 0.4 && (GRAVITY === 0 || py >= maxY - 1)) stopAll()
    }, 16)
  })
}