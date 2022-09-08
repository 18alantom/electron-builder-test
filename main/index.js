const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, protocol } = require('electron');
const { ipcMain } = require('electron/main');

/**
 * Nonsense db code to test the involvement of
 * native dependencies (better-sqlite3)
 */
const COUNTER = 'counter';
const db = require('better-sqlite3')(':memory:');
db.prepare(
  `create table if not exists incr 
        (name text primary key,
        value integer default 0)`
).run();
db.prepare('insert into incr (name, value) values (?, 0)').run(COUNTER);

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

ipcMain.handle('incr', (_, a) => {
  const value = Number(a) + 2;
  const dbwrite = db
    .prepare('update incr set value = ? where name = ?')
    .run(value, COUNTER);
  console.log(dbwrite);

  return value;
});

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
