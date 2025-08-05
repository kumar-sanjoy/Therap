import React, { useState, useRef, useEffect } from 'react';
import './ImageUpload.css';

const ImageUpload = () => {
  const [question, setQuestion] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const fileInputRef = useRef(null);
  const fileLabelRef = useRef(null);
  const logsContainerRef = useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prevLogs => [...prevLogs, `[${timestamp}] ${message}`]);
  };

  const showResult = (message, isError = false) => {
    setResult({ message, isError });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      addLog(`📁 File selected: ${file.name} (${file.size} bytes, ${file.type})`);
    } else {
      addLog('❌ No file selected.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInputRef.current.files = files;
      // Manually trigger the change event
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setResult(null);
    setLogs([]);
    setShowLogs(true);

    addLog('🔄 Starting upload process...');

    if (!question.trim() && !imageFile) {
      showResult('❌ Please enter a question or select an image!', true);
      addLog('❌ Validation failed: No question or image provided');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      if (question) {
        formData.append('question', question);
        addLog(`📝 Added question: "${question}"`);
      }

      if (imageFile) {
        formData.append('image', imageFile);
        addLog(`🖼️ Added image: ${imageFile.name} (${imageFile.size} bytes)`);
      }

      addLog('📦 FormData contents:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          addLog(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          addLog(`  ${key}: "${value}"`);
        }
      }

      addLog('🌐 Sending request to: http://localhost:8092/learn/upload'); // for log

      const response = await fetch('http://localhost:8080/learn/upload', { // gateway URL
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW5qb3kiLCJpYXQiOjE3NTQzNzI1NjcsImV4cCI6MTc1NDQ1ODk2N30.HkFhwIE3PEge1R-HdMaN60ZPq7liwVgtsAJZ66G_XWu2dKFiaFnIvu5eiNaYYhaimPVObqvDgHppX9y5D9XZEQ` // Add this line
        }
      });

      addLog(`📥 Response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const data = await response.json();
        addLog('✅ Success! Response data:');
        addLog(JSON.stringify(data, null, 2));

        showResult(`
          <h3>✅ Upload Successful!</h3>
          <p><strong>Response:</strong> ${data.answer || JSON.stringify(data)}</p>
        `);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        addLog(`❌ Error response: ${JSON.stringify(errorData)}`);

        showResult(`
          <h3>❌ Upload Failed</h3>
          <p><strong>Status:</strong> ${response.status}</p>
          <p><strong>Error:</strong> ${errorData.message || 'Unknown error'}</p>
        `, true);
      }
    } catch (error) {
      addLog(`💥 Network error: ${error.message}`);
      console.error('Upload error:', error);

      showResult(`
        <h3>💥 Network Error</h3>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Make sure your server is running on http://localhost:8092</p>
      `, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll logs to the bottom whenever a new log is added
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Drag and drop event handlers
  useEffect(() => {
    const fileLabel = fileLabelRef.current;
    if (!fileLabel) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      fileLabel.classList.add('highlight');
    };

    const unhighlight = () => {
      fileLabel.classList.remove('highlight');
    };

    ['dragenter', 'dragover'].forEach(eventName => {
      fileLabel.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileLabel.addEventListener(eventName, unhighlight, false);
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileLabel.addEventListener(eventName, preventDefaults, false);
    });

    fileLabel.addEventListener('drop', handleDrop, false);

    return () => {
      // Clean up event listeners on unmount
      ['dragenter', 'dragover'].forEach(eventName => {
        fileLabel.removeEventListener(eventName, highlight, false);
      });
      ['dragleave', 'drop'].forEach(eventName => {
        fileLabel.removeEventListener(eventName, unhighlight, false);
      });
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileLabel.removeEventListener(eventName, preventDefaults, false);
      });
      fileLabel.removeEventListener('drop', handleDrop, false);
    };
  }, []);

  // Initialize logs on component mount
  useEffect(() => {
    addLog('🚀 Image upload test page loaded');
    addLog('📍 Ready to test endpoint: http://localhost:8080/learn/upload');
  }, []);

  return (
    <div className="container">
      <h1>🖼️ Image Upload Test</h1>

      <div className="endpoint-info">
        <strong>Testing endpoint:</strong> <code>POST http://localhost:8092/learn/upload</code><br />
        <strong>Parameters:</strong> <code>image</code> (file, optional), <code>question</code> (text, optional)
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="question">Question (optional):</label>
          <textarea
            id="question"
            name="question"
            placeholder="Enter your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Image (optional):</label>
          <div className="file-input-container">
            <input
              type="file"
              id="imageFile"
              className="file-input"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <label
              htmlFor="imageFile"
              className="file-input-label"
              ref={fileLabelRef}
            >
              📁 Choose Image or Drag & Drop
            </label>
          </div>
          <div className="file-preview">
            {imageFile && (
              <>
                {imageFile.type.startsWith('image/') && (
                  <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                )}
                <div className="file-info">
                  <strong>📄 {imageFile.name}</strong><br />
                  Size: {(imageFile.size / 1024).toFixed(1)} KB<br />
                  Type: {imageFile.type}
                </div>
              </>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
            <div className="loading">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          ) : (
            <span className="btn-text">🚀 Upload & Test</span>
          )}
        </button>
      </form>

      {result && (
        <div
          className={`result ${result.isError ? 'error' : 'success'}`}
          dangerouslySetInnerHTML={{ __html: result.message }}
        />
      )}

      <button className="toggle-logs" onClick={() => setShowLogs(!showLogs)}>
        {showLogs ? 'Hide Logs' : 'Show Logs'}
      </button>

      {showLogs && (
        <pre className="logs" ref={logsContainerRef}>
          {logs.join('\n')}
        </pre>
      )}
    </div>
  );
};

export default ImageUpload;