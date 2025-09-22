import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'

// Create a root container for React
const root = ReactDOM.createRoot(document.getElementById('root'))

// Render the App component into the root container
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
