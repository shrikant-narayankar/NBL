import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    textAlign: 'center',
                    backgroundColor: 'var(--color-bg)'
                }}>
                    <h1 style={{ marginBottom: '1rem', color: 'red' }}>Something went wrong.</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        We apologize for the inconvenience. Please try refreshing the page.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <details style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '800px', whiteSpace: 'pre-wrap' }}>
                            <summary>Error Details</summary>
                            <p>{this.state.error && this.state.error.toString()}</p>
                            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
