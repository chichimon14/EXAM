import React, { useState, useEffect } from 'react';
import SubjectPortal from './components/SubjectPortal';
import PhysicsModule from './components/PhysicsModule';
import MathModule from './components/MathModule';
import ChemistryModule from './components/ChemistryModule';
import EnglishModule from './components/EnglishModule';

export default function App() {
  const [activeSubject, setActiveSubject] = useState(null); // null (门户首页) | 'physics' | 'math' | 'chemistry' | 'english'

  useEffect(() => {
    // 强制设置根节点为亮色暖白主题 (Light mode lock)
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fafaf6', // 高雅的亮色暖白底色
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden'
    }}>
      
      {/* 学科大厅导航顶栏 (在选中具体学科时渲染) */}
      {activeSubject !== null && (
        <header style={{
          width: '100%',
          padding: '12px 24px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.01)',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="btn btn-secondary scale-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                borderColor: 'rgba(0, 0, 0, 0.08)',
                padding: '6px 14px',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
              onClick={() => setActiveSubject(null)}
            >
              🏠 返回学科大厅
            </button>
            <span style={{
              fontSize: '0.78rem',
              color: 'hsl(var(--text-secondary))',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>/</span>
              <span>当前学科：<b>
                {activeSubject === 'physics' ? '📖 中考物理宝典' : 
                 activeSubject === 'math' ? '📐 中考数学计算特训' :
                 activeSubject === 'chemistry' ? '🧪 中考化学特训' :
                 '🇬🇧 中考英语特训'}
              </b></span>
            </span>
          </div>

          <div style={{
            fontSize: '0.78rem',
            fontWeight: 'bold',
            color: 'hsl(var(--text-secondary))',
            opacity: 0.8
          }}>
            💯 2026中考数理化英语全科提分智能工作台
          </div>
        </header>
      )}

      {/* 主板学科容器 */}
      <main style={{
        flex: 1,
        padding: activeSubject === null ? '0' : '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        overflow: 'hidden'
      }}>
        {activeSubject === null && (
          <SubjectPortal onSelectSubject={(subj) => setActiveSubject(subj)} />
        )}
        {activeSubject === 'physics' && (
          <PhysicsModule />
        )}
        {activeSubject === 'math' && (
          <MathModule />
        )}
        {activeSubject === 'chemistry' && (
          <ChemistryModule />
        )}
        {activeSubject === 'english' && (
          <EnglishModule />
        )}
      </main>

    </div>
  );
}
