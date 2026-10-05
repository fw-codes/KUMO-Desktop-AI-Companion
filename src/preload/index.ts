import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {

  dragStart: () => ipcRenderer.send('drag-start'),
dragEnd: () => ipcRenderer.send('drag-end'),
onBounce: (cb: (d: { axis: 'x' | 'y'; speed: number }) => void) => {
  const h = (_e: unknown, d: { axis: 'x' | 'y'; speed: number }) => cb(d)
  ipcRenderer.on('bounce', h)
  return () => ipcRenderer.removeListener('bounce', h)
},onCursor: (cb: (p: { x: number; y: number }) => void) => {
  const h = (_e: unknown, p: { x: number; y: number }) => cb(p)
  ipcRenderer.on('cursor', h)
  return () => ipcRenderer.removeListener('cursor', h)
},
  askKumo: (message: string) => ipcRenderer.invoke('ask-kumo', message),
  onToken: (callback: (chunk: string) => void) => {
    const listener = (_event: any, chunk: string) => callback(chunk)
    ipcRenderer.on('kumo-token', listener)
    return () => ipcRenderer.removeListener('kumo-token', listener)
  },
  onDone: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('kumo-done', listener)
    return () => ipcRenderer.removeListener('kumo-done', listener)
  }
  
})