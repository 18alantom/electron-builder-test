const path = require('path');
const { app, BrowserWindow } = require('electron');
const { ipcMain } = require('electron/main');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
    },
  });

  win.loadURL('http://0.0.0.0:3000');
}

ipcMain.handle('incr', (_, a) => Number(a) + 2);

app.whenReady().then(() => {
  createWindow();
});
