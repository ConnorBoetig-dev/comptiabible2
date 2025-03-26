import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to your error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '1.5rem',
          margin: '1rem',
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          border: '1px solid #ef5350',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#d32f2f' }}>
            Something went wrong
          </h3>
          <p style={{ margin: '0 0 1rem 0' }}>
            An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
          </p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.9rem'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={this.handleRefresh}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
