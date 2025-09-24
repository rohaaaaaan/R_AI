import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react'; // Import Monaco Editor


const CodeEditorPanel = ({ onFileOpen, currentFile, fileContent }) => { // Props for handling file open, current file name, and file content
  const [loading, setLoading] = useState(false);// State to manage loading status
  const [editorContent, setEditorContent] = useState('');// State to manage editor content
  const [isDirty, setIsDirty] = useState(false); // State to track if content has unsaved changes
    const [originalContent, setOriginalContent] = useState(''); // State to store original content for comparison
  const editorRef = useRef(null); // Ref for the Monaco Editor instance

  // Sync fileContent prop with editorContent state
  useEffect(() => {
    if (fileContent) {
      console.log('🔄 Syncing file content to editor:', fileContent.length, 'characters');
      setEditorContent(fileContent);
      setOriginalContent(fileContent); // Set original content for dirty check
      setIsDirty(false); // Reset dirty state on new file load
    }
  }, [fileContent]);

   // Check for changes whenever editor content changes
  useEffect(() => {
    if (originalContent !== undefined && editorContent !== originalContent) {
      if (!isDirty) {
        setIsDirty(true);
        console.log('📝 File marked as dirty (unsaved changes detected)');
      }
    } else if (isDirty && editorContent === originalContent) {
      setIsDirty(false);
      console.log('✨ File marked as clean (content matches original)');
    }
  }, [editorContent, originalContent, isDirty]);

  // Function to handle file opening
  const handleOpenFile = async () => {
    // Warn user if there are unsaved changes
       if (isDirty) { // Check for unsaved changes
      const confirmOpen = window.confirm(
        'You have unsaved changes. Are you sure you want to open a new file? Your changes will be lost.'
      );
      if (!confirmOpen) {
        return;
      }
    }
    if (!window.electronAPI) {// Check if electronAPI is available
      alert('File operations are only available in the Electron app');
      return;
    }
    setLoading(true);// Set loading to true
    try {
      const result = await window.electronAPI.openFile();
       // Open file
    if (result.success) {
      console.log('📁 File opened successfully:', result.fileName); 
      console.log('📁 File content length:', result.content.length);
      onFileOpen(result); // Call the onFileOpen prop with the selected file path
      setEditorContent(result.content); //Set editor content immediately
      setOriginalContent(result.content); // Update original content
      setIsDirty(false); // Reset dirty state

    } else if (!result.cancelled) {
        // Only show error if user didn't cancel
        console.error('Failed to open file:', result.message || result.error);// Log error
        alert(`Error: ${result.message || result.error}`);// Alert the user about the error
      }
    } catch (error) {
      console.error('Error during file open:', error);
      alert(`Error opening file: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

   const getLanguageFromExtension = (extension) => { // Map file extensions to Monaco Editor languages
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.md': 'markdown',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.sql': 'sql',
      '.sh': 'shell',
      '.bat': 'bat',
      '.ps1': 'powershell'
    };
    return languageMap[extension?.toLowerCase()] || 'plaintext';
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    console.log('Monaco Editor mounted successfully');
    console.log('🎯 Current editor content length:', editorContent.length);
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on'
    });
    if (editorContent) {
      editor.setValue(editorContent);
    }
  };

  // Handle editor content change
  const handleEditorChange = (value) => {
    console.log('✏️ Editor content changed, length:', value?.length || 0);
    setEditorContent(value || ''); 
  };

  // Save current editor content
  const handleSaveFile = async () => {
    if (!currentFile || !window.electronAPI) {
      alert('No file to save or Electron API not available');
      return;
    }

    try {
      const result = await window.electronAPI.writeFile(currentFile.filePath, editorContent);// Save file content
      if (result.success) {
        console.log('File saved successfully');
        setOriginalContent(editorContent); // Update original content
        setIsDirty(false); // Reset dirty state
        alert('File saved successfully!');
      } else {
        console.error('Failed to save file:', result.error);
        alert(`Error saving file: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      alert(`Error saving file: ${error.message}`);
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl+S (Cmd+S on Mac) for save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (currentFile && isDirty) {
          handleSaveFile();
        }
      }
    };
      window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, isDirty, editorContent]);

  //  DEBUG: Log current state
  console.log('🔍 CodeEditorPanel render:');
  console.log('  - currentFile:', currentFile?.fileName || 'none');
  console.log('  - fileContent prop length:', fileContent?.length || 0);
  console.log('  - editorContent state length:', editorContent?.length || 0);
  console.log('  - isDirty:', isDirty);


  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with file controls */}
      <div style={{ 
        padding: '15px',
        borderBottom: '1px solid #ddd',
        backgroundColor: isDirty ? '#2d1f0f' : '#1e1e1e', // Change background when dirty
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#ffffff' }}>
          R Code Editor {isDirty && <span style={{ color: '#ffa500' }}>●</span>} {/* Dirty indicator */}
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}> {/* Controls container */}
          <button
            onClick={handleOpenFile} 
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#6c757d' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {loading ? 'Opening...' : '📁 Open File'}
          </button>
           {currentFile && (
            <button
              onClick={handleSaveFile} 
              disabled={!isDirty} //  Disable save button when no changes
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: isDirty ? 1 : 0.6 // ✅ Visual feedback for disabled state

              }}
            >
              💾 {isDirty ? 'Save Changes' : 'Saved'} {/* ✅ Dynamic button text */}
            </button>
          )}
          {currentFile && (
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                fontWeight: '500',
                color: isDirty ? '#ffa500' : '#ffffff' // ✅ Orange filename when dirty
              }}>
                {isDirty ? '●' : ''}{currentFile.fileName} {/* ✅ Dirty indicator */}
              </span>
              <span style={{ fontSize: '12px' }}>
                ({(currentFile.fileSize / 1024).toFixed(1)} KB)
              </span>
              <span style={{ 
                fontSize: '12px',
                backgroundColor: '#0e639c',
                padding: '2px 6px',
                borderRadius: '3px'
              }}>
                {getLanguageFromExtension(currentFile.fileExtension)}
              </span>
            </div>
          )}
        </div>
      </div>
      
       {/* Monaco Editor Area */}
      <div style={{ 
        flex: 1,
        backgroundColor: '#1e1e1e',
        overflow: 'hidden'
      }}>
        {currentFile ? (
          <Editor
            height="100%"
            language={getLanguageFromExtension(currentFile.fileExtension)}
            value={editorContent} // Controlled content
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
              fontSize: 14,
              lineHeight: 20,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              insertSpaces: true,
              renderLineHighlight: 'all',
              bracketPairColorization: {
                enabled: true
              }
            }}
            loading={
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: 'white',
                backgroundColor: '#1e1e1e'
              }}>
                <div>Loading Monaco Editor...</div>
              </div>
            }
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#cccccc',
            backgroundColor: '#1e1e1e'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.5 }}>⌨️</div>
            <h4 style={{ marginBottom: '10px', color: '#ffffff' }}>Monaco Editor Ready</h4>
            <p style={{ textAlign: 'center', maxWidth: '300px' }}>
              Click "Open File" to load a file into the professional code editor.
              Features include syntax highlighting, IntelliSense, and more.
            </p>
            
            <div style={{
              marginTop: '30px',
              padding: '20px',
              backgroundColor: '#252526',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#cccccc'
            }}>
              <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>Supported Languages:</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <span>JavaScript</span>
                <span>TypeScript</span>
                <span>HTML</span>
                <span>CSS</span>
                <span>JSON</span>
                <span>Python</span>
                <span>Java</span>
                <span>C/C++</span>
                <span>Markdown</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {currentFile && (
        <div style={{
          padding: '8px 15px',
          backgroundColor: '#007acc',
          color: 'white',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span>📄 {currentFile.fileName}</span>
            <span style={{ marginLeft: '20px' }}>
              🔤 {getLanguageFromExtension(currentFile.fileExtension)}
            </span>
          </div>
          <div>
            <span>📏 {editorContent.length} characters</span>
            <span style={{ marginLeft: '20px' }}>
              📊 {editorContent.split('\n').length} lines
            </span>
          </div>
        </div>
      )}
    </div>
  );
};


export default CodeEditorPanel;