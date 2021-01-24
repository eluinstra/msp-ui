import { app, BrowserWindow } from 'electron'
import path from 'path';

/* starting the promise for redis */

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  const indexHTML = path.join('index.html')
  win.loadFile(indexHTML)
  // win.webContents.openDevTools()
}

// app.allowRendererProcessReuse = false

app.whenReady().then(createWindow)

app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-window',
    iconPath: process.execPath,
    iconIndex: 0,
    title: 'DartsInsight',
    description: ''
  }
])

app.on('before-quit', () => {
  app.removeAllListeners('close');
});

app.on('window-all-closed', async () => {
  
  if (process.platform !== 'darwin') {
    app.setUserTasks([])
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
