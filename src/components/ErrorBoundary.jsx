import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleResetCache = () => {
    if (window.confirm("确定要清除本地缓存吗？这会重置该学科的学习记录和金币，但可以修复因脏数据引起的崩溃。")) {
      const subject = this.props.subject || '';
      if (subject) {
        // 清除该学科相关的 localStorage 键
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`${subject}-`)) {
            localStorage.removeItem(key);
          }
        });
        alert("缓存清除成功，正在刷新页面...");
        window.location.reload();
      } else {
        localStorage.clear();
        alert("所有本地缓存已重置，正在刷新页面...");
        window.location.reload();
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div className="glass-card scale-up" style={{
            maxWidth: '640px',
            width: '100%',
            padding: '30px',
            borderRadius: '16px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
                  ⚠️ 模块载入发生未知错误
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  非常抱歉，该学科模块在运行时发生崩溃。错误已成功捕获。
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#f8fafc',
              border: '1px solid #edf2f7',
              borderRadius: '8px',
              fontSize: '0.85rem',
              color: '#334155'
            }}>
              <div style={{ fontWeight: 'bold', color: '#dc2626', marginBottom: '8px', fontFamily: 'monospace' }}>
                Error: {this.state.error && this.state.error.toString()}
              </div>
              <details style={{ cursor: 'pointer' }}>
                <summary style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 'bold' }}>展开详细错误堆栈</summary>
                <pre style={{
                  marginTop: '8px',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  color: '#e2e8f0',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  fontSize: '0.7rem',
                  lineHeight: '1.5',
                  fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                  whiteSpace: 'pre-wrap'
                }}>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            </div>

            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button
                className="btn btn-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 'bold',
                  backgroundColor: 'hsl(var(--color-optics))',
                  borderColor: 'hsl(var(--color-optics))'
                }}
                onClick={() => {
                  // 通过强制重载回到大厅
                  localStorage.removeItem('doudou-active-subject');
                  window.location.href = window.location.pathname;
                }}
              >
                🏠 返回学科大厅
              </button>
              
              <button
                className="btn btn-secondary"
                style={{
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  color: '#dc2626',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                  backgroundColor: 'rgba(239, 68, 68, 0.02)'
                }}
                onClick={this.handleResetCache}
              >
                🔄 清除该学科缓存并重置
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
