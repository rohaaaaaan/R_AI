import React from 'react';
import './app.css';
import CodeEditorPanel from './components/CodeEditerPanel';
import ChatPanel from './components/ChatPanel';


function App() {
  //state for manageing opened file and its content
  const [currentFile, setCurrentFile] = React.useState(null);
  const [fileContent, setFileContent] = React.useState('');

  //Handle file opening
   const handleFileOpen = (fileData) => {
    console.log('📁 App.jsx: Received file data:', fileData);

    if (fileData.success) {
      setCurrentFile({
        filePath: fileData.filePath,
        fileName: fileData.fileName,
        fileExtension: fileData.fileExtension,
        fileSize: fileData.fileSize,
        lastModified: fileData.lastModified
      });
      setFileContent(fileData.content);
      console.log('📁 App.jsx: File state updated for Monaco Editor');
    }
  };
  return (
     <div className="main-container">
      <div className="left-panel">
        <CodeEditorPanel 
          onFileOpen={handleFileOpen}
          currentFile={currentFile}
          fileContent={fileContent}
        />
      </div>
      
      <div className="right-panel">
        <ChatPanel />
        
        {/* Display current file info in chat panel */}
        {currentFile && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0f8ff',
            borderRadius: '4px',
            border: '1px solid #b3d9ff'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#2c5aa0' }}>
              📁 Current File
            </h4>
            <div style={{ fontSize: '14px', color: '#333' }}>
              <div><strong>Name:</strong> {currentFile.fileName}</div>
              <div><strong>Size:</strong> {(currentFile.fileSize / 1024).toFixed(1)} KB</div>
              <div><strong>Type:</strong> {currentFile.fileExtension || 'No extension'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
