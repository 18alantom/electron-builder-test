const { contextBridge, ipcRenderer } = require('electron');

/**
 * The preload.js script allows the electron app frontend (Chromium) to access electron
 * app backend (Node) and electron specific APIs while adhering to electron
 * security best practices.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/tutorial-preload
 *
 * This script attaches the `incr` function onto the window object that can be
 * called using window.api.incr
 */
contextBridge.exposeInMainWorld('api', {
  incr: async (a) => await ipcRenderer.invoke('incr', a),
});
