const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, protocol } = require('electron');
const { ipcMain } = require('electron/main');

const isDev = process.env.MODE === 'development';

if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
  ]);
}

/**
 * Create Window
 */

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
    },
  });

  if (isDev) {
    win.loadURL('http://0.0.0.0:3000');
  } else {
    registerAppProtocol();
    win.loadURL('app://./index.html');
  }
}

ipcMain.handle('incr', (_, a) => Number(a) + 2);

app.whenReady().then(() => {
  createWindow();
});

/**
 * Register Protocol
 */

function registerAppProtocol() {
  protocol.registerBufferProtocol('app', (request, respond) => {
    const pathName = decodeURI(new URL(request.url).pathname);

    fs.readFile(path.join(__dirname, pathName), (_, data) => {
      const extension = path.extname(pathName).toLowerCase();
      const mimeType =
        {
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.html': 'text/html',
        }[extension] ?? '';

      respond({ mimeType, data });
    });
  });
}
