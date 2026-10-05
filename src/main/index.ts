import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { ask } from "./AI/ollama"

import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupKumoPhysics } from './physics'
import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'

ipcMain.handle('ask-kumo', async (_event, message: string ) => {
  try {
    await ask(message, (chunk) => {
      _event.sender.send('kumo-token', chunk)
    })
    _event.sender.send('kumo-done')
  } catch (error) {
    _event.sender.send('kumo-token', ' Error reaching Ollama.')
    _event.sender.send('kumo-done')
  }
})
ipcMain.on('move-window', (event, x, y) => {
  const window = BrowserWindow.fromWebContents(event.sender)

  if (window) {
    window.setPosition(x, y)
  }
})

function createWindow(): void {
 
  const mainWindow = new BrowserWindow({
    width: 350,
    height: 350,
    frame: false,
    transparent: true,
    show: false,
    alwaysOnTop: true,
  resizable: false,
  movable: true,
  skipTaskbar: false,
  backgroundColor: '#00000000',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }

  
})
setupKumoPhysics(mainWindow)
  const cursorTimer = setInterval(() => {
  if (mainWindow.isDestroyed()) return
  const c = screen.getCursorScreenPoint()
  const b = mainWindow.getBounds()
  mainWindow.webContents.send('cursor', { x: c.x - b.x, y: c.y - b.y })
}, 33)
mainWindow.on('closed', () => clearInterval(cursorTimer))

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
   
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

