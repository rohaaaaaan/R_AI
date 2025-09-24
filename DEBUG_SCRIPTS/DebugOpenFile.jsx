// src/components/DebugOpenFile.jsx
import React, { useState } from 'react';

const DebugOpenFile = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenFile = async () => {
    console.log('🔍 Starting file open process...');
    console.log('🔍 window.electronAPI available:', !!window.electronAPI);
    console.log('🔍 openFile method available:', !!window.electronAPI?.openFile);

    if (!window.electronAPI) {
      console.error('❌ electronAPI not available');
      setResult({ error: 'electronAPI not available' });
      return;
    }

    if (!window.electronAPI.openFile) {
      console.error('❌ openFile method not available');
      setResult({ error: 'openFile method not available' });
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Calling window.electronAPI.openFile()...');
      const fileResult = await window.electronAPI.openFile();
      
      console.log('🔍 Raw result from openFile:', fileResult);
      console.log('🔍 Result type:', typeof fileResult);
      console.log('🔍 Result keys:', Object.keys(fileResult || {}));
      
      if (fileResult.content) {
        console.log('🔍 Content length:', fileResult.content.length);
        console.log('🔍 First 100 chars:', fileResult.content.substring(0, 100));
      }

      setResult(fileResult);
    } catch (error) {
      console.error('❌ Error in handleOpenFile:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007acc', margin: '10px' }}>
      <h3>🐛 Debug Open File</h3>
      
      <button
        onClick={handleOpenFile}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#007acc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px'
        }}
      >
        {loading ? '⏳ Opening File...' : '🔍 Debug Open File'}
      </button>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <h4>📋 Debug Result:</h4>
          <pre style={{
            fontSize: '12px',
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        marginTop: '15px', 
        fontSize: '14px',
        backgroundColor: '#f8f9fa',
        padding: '10px',
        borderRadius: '4px'
      }}>
        <h4>🔍 Debug Info:</h4>
        <ul>
          <li>electronAPI available: {window.electronAPI ? '✅ Yes' : '❌ No'}</li>
          <li>openFile method: {window.electronAPI?.openFile ? '✅ Yes' : '❌ No'}</li>
          <li>testIPC method: {window.electronAPI?.testIPC ? '✅ Yes' : '❌ No'}</li>
          <li>Current URL: {window.location.href}</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugOpenFile;