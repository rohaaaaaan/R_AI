// Import required modules from Electron
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs =require('fs').promises;

// Determine if we're in development mode
const isDev = process.env.NODE_ENV !== 'production'

// Disable GPU acceleration before app is ready
app.disableHardwareAcceleration()

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error)
})

// Function to create the main application window
function createWindow() {
    try {
    // Create a new browser window with specific configurations
    const win = new BrowserWindow({
        width: 800,        // Set window width
        height: 600,       // Set window height
        webPreferences: {
            nodeIntegration: false,     // Disabel Node.js integration in renderer process
            contextIsolation: true,    // Disable context isolation for this example
            webSecurity: true,         // Enable web security
            devTools: isDev,          // Only enable DevTools in development
            sandbox: false,           // Required for node integration
            allowRunningInsecureContent: isDev,  // Allow loading local resources in dev
            preload: path.join(__dirname, 'preload.js') // Preload script
        },
        backgroundColor: '#ffffff'    // Set background color
    })

    // Load the appropriate URL based on development or production mode
    if (isDev) {
        // Load Vite dev server URL in development
        win.loadURL('http://localhost:5173')
        // Open DevTools automatically in development
        win.webContents.openDevTools()
        
        // Watch for changes in development
        win.webContents.on('did-fail-load', () => {
            console.log('Page failed to load - retrying...')
            setTimeout(() => {
                win.loadURL('http://localhost:5173')
            }, 1000)
        })
    } else {
        // Load built files in production

    }
    } catch (error) {
        console.error('Error creating window:', error)
    }
}



// Handle window-all-closed event
app.on('window-all-closed', () => {
    // Quit the application if platform is not macOS (darwin)
    // This follows the macOS convention of keeping apps running until explicit Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Handle activate event (macOS specific)
app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    // and there are no other open windows
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// When Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
    createWindow()
})

// IPC Handlers

// Test IPC communication
ipcMain.handle('test-ipc', async () => {
  console.log('IPC test call received from renderer process');
  return {
    success: true,
    message: 'IPC communication is working!',
    timestamp: new Date().toISOString()
  };
});
// File dialog operations
ipcMain.handle('open-file-dialog', async () => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JavaScript Files', extensions: ['js', 'jsx', 'ts', 'tsx'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      return { success: true, filePath: result.filePaths[0] };
    }
    
    return { success: false, message: 'No file selected' };
  } catch (error) {
    console.error('Error opening file dialog:', error);
    return { success: false, error: error.message };
  }
});
//open file operation
ipcMain.handle('open-file', async () => {
  try {
    // Show open dialog
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'JavaScript Files', extensions: ['js', 'jsx', 'ts', 'tsx'] },
        { name: 'Web Files', extensions: ['html', 'css', 'json'] },
        { name: 'Text Files', extensions: ['txt', 'md', 'log'] },
        { name: 'Python Files', extensions: ['py'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    // Check if user cancelled
    if (result.canceled || !result.filePaths.length) {
      return { 
        success: false, 
        message: 'No file selected',
        cancelled: true 
      };
    }
    
    const filePath = result.filePaths[0];
    
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Get file stats for additional info
    const stats = await fs.stat(filePath);
    
    console.log(`File opened: ${filePath} (${stats.size} bytes)`);
    
    return {
      success: true,
      filePath: filePath,
      content: content,
      fileName: path.basename(filePath),
      fileExtension: path.extname(filePath),
      fileSize: stats.size,
      lastModified: stats.mtime.toISOString(),
      message: 'File opened successfully'
    };
    
  } catch (error) {
    console.error('Error opening file:', error);
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to open file'
    };
  }
});
// File system operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Error reading file:', error);
    return { success: false, error: error.message };
  }
});
//

// Write file operation
ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true, message: 'File saved successfully' };
  } catch (error) {
    console.error('Error writing file:', error);
    return { success: false, error: error.message };
  }
});


// Save file dialog
ipcMain.handle('save-file-dialog', async () => {
  try {
    const result = await dialog.showSaveDialog({
      filters: [
        { name: 'JavaScript Files', extensions: ['js', 'jsx', 'ts', 'tsx'] },
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (!result.canceled && result.filePath) {
      return { success: true, filePath: result.filePath };
    }
    
    return { success: false, message: 'Save dialog canceled' };
  } catch (error) {
    console.error('Error opening save dialog:', error);
    return { success: false, error: error.message };
  }
});

// Directory operations
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const result = items.map(item => ({
      name: item.name,
      isFile: item.isFile(),
      isDirectory: item.isDirectory(),
      path: path.join(dirPath, item.name)
    }));
    return { success: true, items: result };
  } catch (error) {
    console.error('Error reading directory:', error);
    return { success: false, error: error.message };
  }
});
// Create directory 
ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true, message: 'Directory created successfully' };
  } catch (error) {
    console.error('Error creating directory:', error);
    return { success: false, error: error.message };
  }
});

// System information
ipcMain.handle('get-system-info', async () => {
  try {
    return {
      success: true,
      info: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        electronVersion: process.versions.electron,
        chromeVersion: process.versions.chrome,
        cwd: process.cwd()
      }
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return { success: false, error: error.message };
  }
});
