const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  initiateLockdown: (config) => ipcRenderer.send('initiate-lockdown', config),
  resumeLockdown: () => ipcRenderer.send('resume-lockdown'),
  showBlockerSetup: () => ipcRenderer.send('show-blocker-setup'),
  endBreak: () => ipcRenderer.send('end-break'),
  onTriggerBreak: (callback) => ipcRenderer.on('trigger-break', callback),
  onUpdateApp: (callback) => ipcRenderer.on('update-app', callback),
  onViolation: (callback) => ipcRenderer.on('violation', (event, data) => callback(data))
});
