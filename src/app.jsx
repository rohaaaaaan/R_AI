import React from 'react';
import './app.css';
import CodeEditorPanel from './components/CodeEditerPanel';
import ChatPanel from './components/ChatPanel';

function App() {
  return (
    <div className="main-container">
      <div className="left-panel">
      <CodeEditorPanel />
      </div>
      <div className="right-panel">
        <ChatPanel />
      </div>
    </div>
  );
}
export default App;