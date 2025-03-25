import React from 'react';

function LoadingSpinner({ isDarkMode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      width: '100%'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: `4px solid ${isDarkMode ? '#333' : '#f3f3f3'}`,
        borderTop: `4px solid ${isDarkMode ? '#fff' : '#3498db'}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default LoadingSpinner;