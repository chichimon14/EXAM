import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleClearCache = () => {
    if (window.confirm('确定要清除本地缓存吗？这会重置本地积分和进度（云端同步不受影响），并强制刷新网页解决白屏故障。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          maxWidth: '600px',
          margin: '50px auto',
          textAlign: 'center',
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
          border: '1px solid #fee2e2',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ color: '#dc2626', margin: '0 0 10px 0', fontSize: '1.4rem', fontWeight: 'bold' }}>
            系统遇到了小故障
          </h2>
          <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            检测到【{this.props.subject || '系统'}】模块在渲染或结算时发生了异常。别慌，可能是因为之前版本升级残留的本地缓存数据冲突导致的。
          </p>

          <div style={{
            textAlign: 'left',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            color: '#ef4444',
            overflowX: 'auto',
            marginBottom: '24px',
            maxHeight: '200px',
            lineHeight: '1.5'
          }}>
            <b>Error Name:</b> {this.state.error?.toString()}<br/>
            <b>Component Stack:</b> {this.state.errorInfo?.componentStack || 'No component stack trace'}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '10px 20px', fontSize: '0.88rem' }}
              onClick={() => window.location.reload()}
            >
              🔄 尝试重新加载
            </button>
            <button
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.88rem', backgroundColor: '#dc2626', borderColor: '#dc2626', fontWeight: 'bold' }}
              onClick={this.handleClearCache}
            >
              🧹 清除缓存并修复
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
