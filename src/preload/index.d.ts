import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    dragStart: () => void
dragEnd: () => void
onBounce: (cb: (d: { axis: 'x' | 'y'; speed: number }) => void) => () => void
onCursor: (cb: (p: { x: number; y: number }) => void) => () => void 
}

  
}
