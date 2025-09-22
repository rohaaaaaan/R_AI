// Import required modules from Electron
const { app, BrowserWindow } = require('electron')
const path = require('path')


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
            nodeIntegration: true,     // Enable Node.js integration in renderer process
            contextIsolation: false,    // Disable context isolation for this example
            webSecurity: true,         // Enable web security
            devTools: isDev,          // Only enable DevTools in development
            sandbox: false,           // Required for node integration
            allowRunningInsecureContent: isDev  // Allow loading local resources in dev
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
        win.loadFile(path.join(__dirname, 'dist', 'index.html'))
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


