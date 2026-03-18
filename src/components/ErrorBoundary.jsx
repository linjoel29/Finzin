import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--error)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1rem' }}>Oops, something went wrong.</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            We're sorry for the inconvenience. Please try refreshing the page or going back.
          </p>
          <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
            {this.state.error && this.state.error.toString()}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', border: 'none', borderRadius: '14px', fontWeight: 800, cursor: 'pointer' }}
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
