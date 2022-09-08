const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, protocol } = require('electron');
const { ipcMain } = require('electron/main');

/**
 * Nonsense db code to test the involvement of native dependencies
 * (better-sqlite3). Essentially it does the following:
 * - Initiallizes an in memory sqlite3 database
 * - Creates a table called incr
 * - Inserts one row into the table
 *
 * The `value` of this row will be updated everytime the 'incr' button is
 * clicked on the frontend
 */
const COUNTER = 'counter';
const db = require('better-sqlite3')(':memory:');
db.prepare(
  `create table if not exists incr 
        (name text primary key,
        value integer default 0)`
).run();
db.prepare('insert into incr (name, value) values (?, 0)').run(COUNTER);

/**
 * Check if electron is running in development mode.
 */
const isDev = process.env.MODE === 'development';

/**
 * Function that creates a window, the preload script is used
 * to expose the incr function to the frontend.
 *
 * This prevents us from having to expose the ipcRenderer API
 * https://www.electronjs.org/docs/latest/tutorial/security
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
    /**
     * Since Vite is used for the frontend, when running it in development
     * vite serves the frontend assets on the given host and port
     *
     * Check vite.config.ts
     */
    win.loadURL('http://0.0.0.0:3000');
  } else {
    /**
     * When running in development all assets are built, these are loaded by
     * electron's main process (Node) when it's renderer process (Chromium)
     * comes across an url.
     *
     * Registering the protocol allows us to intercept and respond to custom
     * schemes. Here the scheme used is 'app://' and whenever a request for this
     * is sent the callback provided responds with a buffer containing the
     * contents of the requested file.
     *
     * https://www.electronjs.org/docs/latest/api/protocol
     */
    protocol.registerBufferProtocol('app', bufferProtocolCallback);

    /**
     * First URL that is loaded is of the frontend entry point index.html from
     * the root of the repository.
     */
    win.loadURL('app://./index.html');
  }
}

/**
 * Register IPC Listeners
 *
 * When window.incr is called ipcRenderer.invoke('incr', ...) is called, this
 * sends a message to the main processes.
 *
 * Listeners with callbacks need to be registered with the 'incr' event
 *
 * https://www.electronjs.org/docs/latest/tutorial/ipc
 */
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
 * Buffer Protocol Callback
 */
function bufferProtocolCallback(request, respond) {
  /**
   * Convert the app:// url to a filepath from which the file can be read.
   */
  const pathName = decodeURI(new URL(request.url).pathname);
  const filePath = path.join(__dirname, pathName);

  /**
   * Once the file is read call respond with the mimeType of the file and the
   * contents as a Buffer.
   */
  fs.readFile(filePath, (_, data) => {
    const extension = path.extname(pathName).toLowerCase();
    const mimeType =
      {
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.html': 'text/html',
      }[extension] ?? '';

    respond({ mimeType, data });
  });
}
