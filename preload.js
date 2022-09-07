const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  incr: async (a) => await ipcRenderer.invoke('incr', a),
});
