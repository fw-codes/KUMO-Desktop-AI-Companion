/// <reference types="vite/client" />

interface Window {
  electron: {
    ipcRenderer: {
      

onToken: (callback: (chunk: string) => void) => () => void
    onDone: (callback: () => void) => () => void
    askKumo: (message: string) => Promise<string>
  }
}
}