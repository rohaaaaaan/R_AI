// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Test IPC communication
  test: () => "Preload is working!",
  testIPC: () => ipcRenderer.invoke('test-ipc'),
  
  // File system operations (for future use)
  openFile: () => ipcRenderer.invoke('open-file'), 
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  saveFileDialog: () => ipcRenderer.invoke('save-file-dialog'),
  
  // Directory operations (for future use)
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
  
  // System information (for future use)
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Event listeners for real-time updates
  onFileChanged: (callback) => ipcRenderer.on('file-changed', callback),
  removeFileChangeListener: () => ipcRenderer.removeAllListeners('file-changed')
});