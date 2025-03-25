import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
  const { isDarkMode, setIsDarkMode } = useTheme();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        borderRadius: '20px',
        backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
      }}
      onClick={() => setIsDarkMode(!isDarkMode)}
    >
      {/* Sun icon */}
      <svg
        style={{
          width: '20px',
          height: '20px',
          opacity: isDarkMode ? 0.5 : 1,
          transition: 'opacity 0.3s ease',
        }}
        fill={isDarkMode ? '#fff' : '#ffd700'}
        viewBox="0 0 24 24"
      >
        <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
      </svg>

      {/* Moon icon */}
      <svg
        style={{
          width: '20px',
          height: '20px',
          opacity: isDarkMode ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
        }}
        fill={isDarkMode ? '#ffffff' : '#1a1a1a'}
        viewBox="0 0 24 24"
      >
        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
      </svg>
    </div>
  );
}

export default ThemeToggle;