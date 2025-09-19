// Import required modules from Electron
const { app, BrowserWindow } = require('electron')

// Function to create the main application window
function createWindow() {
    // Create a new browser window with specific configurations
    const win = new BrowserWindow({
        width: 800,        // Set window width
        height: 600,       // Set window height
        webPreferences: {
            nodeIntegration: true,     // Enable Node.js integration in renderer process
            contextIsolation: false     // Disable context isolation for this example
        }
    })

    // Load the index.html file from the public directory into the window
    win.loadFile('public/index.html')
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

if (isDev) {
    // Load Vite dev server
    win.loadURL('http://localhost:5173')
  } else {
    // Load built files
    win.loadFile(path.join(__dirname, 'dist/index.html'))
  }

  // When Electron has finished initialization and is ready to create browser windows
app.whenReady().then(() => {
    createWindow()
})
