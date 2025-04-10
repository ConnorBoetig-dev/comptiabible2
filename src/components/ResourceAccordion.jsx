const ResourceAccordion = ({ isDarkMode, onContentSelect, isMobile }) => {
  // ... existing code ...

  return (
    <div style={{ 
      width: '100%',
      marginBottom: isMobile ? '2rem' : 0 
    }}>
      {Object.entries(resources).map(([exam, domains]) => (
        <div key={exam} style={{ 
          marginBottom: '10px',
          backgroundColor: isDarkMode ? '#363636' : '#f0f0f0',
          borderRadius: '4px',
        }}>
          {/* ... existing accordion content ... */}
        </div>
      ))}
    </div>
  );
};