import React from 'react';

export default function SubjectPortal({ onSelectSubject }) {
  const subjects = [
    {
      id: 'physics',
      name: '中考物理宝典',
      subtitle: '声光热力电 · 全景原理图解',
      desc: '专为八年级数理提分设计，涵盖 24 幅中考高反差手绘 SVG 图解及 4 大经典交互大实验，打牢力学与电学基础！',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--color-mech))' }}>
          <circle cx="12" cy="12" r="10" strokeDasharray="3,3" />
          <circle cx="12" cy="12" r="4" fill="hsl(var(--color-mech) / 0.15)" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" />
        </svg>
      ),
      badge: '12章 · 1200题',
      color: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
      borderColor: 'rgba(139, 92, 246, 0.18)'
    },
    {
      id: 'math',
      name: '中考数学计算特训',
      subtitle: '25天提分特训营 · 每日2小时',
      desc: '锁定小学混合计算、去括号、一元二次方程、勾股几何、中考统计等 25 天提分日程，自带大白话本质解剖与无限分步推导！',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--color-work))' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" fill="hsl(var(--color-work) / 0.15)" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      ),
      badge: '25天特营 · 3000题',
      color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(239, 68, 68, 0.05) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.18)'
    },
    {
      id: 'chemistry',
      name: '中考化学特训',
      subtitle: '初三暑假抢跑 · 前20元素与方程式',
      desc: '前20个元素中英文拼音拼写及化合价，10大初三经典反应方程式底层原理拆解。配备15天每日金币测练，轻松抢跑！',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--color-optics))' }}>
          <path d="M10 2v7.586a1 1 0 0 1-.293.707l-5.414 5.414A2 2 0 0 0 6 19.122A2 2 0 0 0 8 21.122h8a2 2 0 0 0 2-2a2 2 0 0 0 1.707-3.414l-5.414-5.414A1 1 0 0 1 14 9.586V2Z" fill="rgba(16, 185, 129, 0.15)" />
          <line x1="8" y1="2" x2="16" y2="2" />
          <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2,2" />
        </svg>
      ),
      badge: '15天抢跑 · 1800题',
      color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.18)'
    },
    {
      id: 'english',
      name: '中考英语特训',
      subtitle: '时态口诀 · 600词真人读音',
      desc: '覆盖小学至初二全部 600 必背单词短语及例句美音发音，集成 6 大核心时态名师口诀。配备30天金币奖励测练！',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7' }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="rgba(168, 85, 247, 0.15)" />
          <text x="7" y="11" fill="currentColor" fontSize="6" fontWeight="bold" stroke="none">Hi</text>
        </svg>
      ),
      badge: '30天冲刺 · 3600题',
      color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'rgba(168, 85, 247, 0.18)'
    }
  ];

  return (
    <div className="fade-in" style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      alignItems: 'center'
    }}>
      
      {/* 迎新头部 */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: 'hsl(var(--color-mech))',
          backgroundColor: 'hsla(var(--color-mech) / 0.08)',
          padding: '6px 16px',
          borderRadius: '30px',
          display: 'inline-block',
          alignSelf: 'center',
          letterSpacing: '1px'
        }}>
          🎓 2026中考数理化英语全科提分工作台
        </div>
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          border: 'none',
          padding: 0,
          margin: '10px 0 0 0',
          letterSpacing: '1px'
        }}>
          中考基础通关智能宝典
        </h1>
        <p style={{
          fontSize: '1rem',
          color: 'hsl(var(--text-secondary))',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          由资深中考名师联合打造，拒绝钻牛角尖的偏难怪题。专注于用简炼口诀、几何图解与智能变式技术，帮您的孩子把中考基础题的分数全部拿稳！
        </p>
      </div>

      {/* 学科选择网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        width: '100%',
        marginTop: '20px'
      }}>
        {subjects.map((sub) => {
          const isLocked = sub.locked;
          
          return (
            <div
              key={sub.id}
              className="glass-card scale-up"
              style={{
                background: sub.color,
                border: `1px solid ${sub.borderColor}`,
                padding: '28px',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative',
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.75 : 1,
                boxShadow: isLocked ? 'none' : '0 10px 30px rgba(0, 0, 0, 0.02)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => !isLocked && onSelectSubject(sub.id)}
            >
              {/* 学科学分微标记 */}
              <span style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                padding: '3px 8px',
                borderRadius: '12px',
                backgroundColor: isLocked ? 'rgba(160, 174, 192, 0.15)' : 'rgba(255,255,255,0.85)',
                border: isLocked ? 'none' : '1px solid rgba(0,0,0,0.05)',
                color: isLocked ? '#718096' : 'hsl(var(--text-primary))'
              }}>
                {sub.badge}
              </span>

              {/* 学科图标 */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                border: '1px solid rgba(0,0,0,0.02)'
              }}>
                {sub.icon}
              </div>

              {/* 标题 */}
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: 'hsl(var(--text-primary))',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {sub.name}
                  {isLocked && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </h3>
                <span style={{
                  fontSize: '0.78rem',
                  color: isLocked ? '#a0aec0' : 'hsl(var(--color-optics))',
                  fontWeight: 600,
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {sub.subtitle}
                </span>
              </div>

              {/* 描述介绍 */}
              <p style={{
                fontSize: '0.82rem',
                color: 'hsl(var(--text-secondary))',
                lineHeight: '1.6',
                margin: 0,
                flex: 1
              }}>
                {sub.desc}
              </p>

              {/* 进入按钮 */}
              {!isLocked ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: sub.id === 'physics' ? 'hsl(var(--color-mech))' : 'hsl(var(--color-work))',
                  marginTop: '8px'
                }}>
                  立即开启提分特训
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              ) : (
                <div style={{
                  fontSize: '0.82rem',
                  color: '#a0aec0',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  敬请期待...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 提分信箱说明 */}
      <div style={{
        marginTop: '30px',
        padding: '16px 24px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: 'hsl(var(--text-secondary))',
        maxWidth: '500px'
      }}>
        💡 <b>中考名师寄语：</b>中考计算不丢分是冲击深圳名校的基本底线。每天使用本系统狂练 15 分钟，让计算成为潜意识的肌肉记忆！
      </div>

    </div>
  );
}
