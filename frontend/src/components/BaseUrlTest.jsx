import React, { useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '../config';

const BaseUrlTest = () => {
  const [testResults, setTestResults] = useState([]);

  const testUrls = [
    { name: 'Current Config', url: `${API_BASE_URL}${API_ENDPOINTS.LOGIN}` },
    { name: 'Direct Backend', url: `http://192.168.0.104:8080${API_ENDPOINTS.LOGIN}` },
    { name: 'Localhost Backend', url: `http://localhost:8080${API_ENDPOINTS.LOGIN}` },
    { name: 'Relative Path', url: `/auth/login` },
  ];

  const testUrl = async (testUrl) => {
    try {
      console.log(`Testing: ${testUrl.name} - ${testUrl.url}`);
      
      const response = await fetch(testUrl.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'sanjoy', password: 'a' }),
      });

      setTestResults(prev => [...prev, {
        name: testUrl.name,
        url: testUrl.url,
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      }]);

    } catch (error) {
      setTestResults(prev => [...prev, {
        name: testUrl.name,
        url: testUrl.url,
        status: 'ERROR',
        statusText: error.message,
        success: false
      }]);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    testUrls.forEach(testUrl => {
      setTimeout(() => testUrl(testUrl), 100);
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Base URL Test</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Configuration:</h3>
        <div className="bg-gray-100 p-3 rounded">
          <p><strong>API_BASE_URL:</strong> "{API_BASE_URL}"</p>
          <p><strong>Login Endpoint:</strong> {API_ENDPOINTS.LOGIN}</p>
          <p><strong>Full URL:</strong> {API_BASE_URL}{API_ENDPOINTS.LOGIN}</p>
        </div>
      </div>

      <button 
        onClick={runAllTests}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Test All URLs
      </button>

      {testResults.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded border ${
                  result.success ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                }`}
              >
                <p><strong>{result.name}:</strong></p>
                <p className="text-sm text-gray-600">{result.url}</p>
                <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  Status: {result.status} - {result.statusText}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseUrlTest; 