import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path';
import { registerSerialPortDriverMainEvents } from './component/serialport/msp/SerialPortDriverMain';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  const indexHTML = path.join('index.html')
  win.loadFile(indexHTML)
  // win.webContents.openDevTools()
  registerSerialPortDriverMainEvents(ipcMain, win.webContents)
}

app.allowRendererProcessReuse = false

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
