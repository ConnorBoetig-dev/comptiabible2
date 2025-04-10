const QuestionDisplay = ({ questions, resourceContent, generateCommandQuestion }) => {
  // ... rest of your component code
  
  return (
    // ... your existing JSX
    <button
      onClick={generateCommandQuestion}
      style={{
        padding: '0.8rem 1.5rem',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: isDarkMode ? '#0066cc' : '#007bff',
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '1.1rem',
      }}
    >
      Next
    </button>
    // ... rest of your JSX
  );
};