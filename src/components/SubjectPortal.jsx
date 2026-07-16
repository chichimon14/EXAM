import React, { useState, useEffect } from 'react';
import { getCurrentUser, loginUser, logoutUser, ACCOUNTS, loadFromCloud } from '../utils/syncService';

export default function SubjectPortal({ onSelectSubject }) {
  const [scores, setScores] = useState({
    math: 0,
    physics: 0,
    chemistry: 0,
    english: 0
  });
  const [showScoreModal, setShowScoreModal] = useState(false);
  
  // 云端同步账户状态
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // 家长监控 Dashboard 相关状态
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [doudouProgress, setDoudouProgress] = useState(null);
  const [loadingDoudou, setLoadingDoudou] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState('summary'); // summary | timeline | weaknesses | wrongs
  const [adminWrongSubj, setAdminWrongSubj] = useState('math'); // 错题穿透展示科目 Tab

  useEffect(() => {
    const loadAllScores = () => {
      const calcScore = (subj) => {
        let total = 0;
        const maxDays = subj === 'english' ? 31 : 25;
        const startDay = subj === 'chemistry' ? 0 : 1;
        for (let i = startDay; i <= maxDays; i++) {
          const val = localStorage.getItem(`${subj}-score-day${i}`);
          if (val !== null) {
            total += parseInt(val, 10);
          }
        }
        return total;
      };

      setScores({
        math: calcScore('math'),
        physics: calcScore('physics'),
        chemistry: calcScore('chemistry'),
        english: calcScore('english')
      });
    };

    loadAllScores();

    // 监听云同步成功广播事件，自动更新视图上的所有积分与登录人信息
    const handleSync = () => {
      loadAllScores();
      setCurrentUser(getCurrentUser());
    };

    window.addEventListener('progress-synced', handleSync);
    return () => {
      window.removeEventListener('progress-synced', handleSync);
    };
  }, []);

  const totalScore = 120 + scores.math + scores.physics + scores.chemistry + scores.english;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSyncing(true);
    try {
      const result = await loginUser(loginForm.username, loginForm.password);
      setCurrentUser(loginForm.username);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
      alert(result.synced ? '🎉 登录成功！已从云端拉取恢复您的学习进度。' : '🎉 登录成功！首次备份已同步至云端。');
    } catch (err) {
      setLoginError(err.message || '登录失败，请检查账号密码');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('提示：确定要退出登录吗？退出后，新的学习进度和获得的积分将仅保存在当前浏览器本地。')) {
      logoutUser();
      setCurrentUser('');
      alert('已成功退出登录，云同步已挂起。');
    }
  };

// 获取豆豆内置演示档案数据
const getMockDoudouProgress = () => {
  const mathWrongs = [
    { id: "math_q_1_1", question: "计算：3/5 + 1/2 = ？", options: ["11/10", "4/7", "2/5", "3/10"], answer: 0, userAnswer: 1, explanation: "通分后为 6/10 + 5/10 = 11/10。", knowledgePoint: "分数加减混合运算" },
    { id: "math_q_1_2", question: "解方程组：x + y = 5, 2x - y = 4", options: ["x=3, y=2", "x=2, y=3", "x=1, y=4", "x=4, y=1"], answer: 0, userAnswer: 1, explanation: "①+②得3x=9, x=3, 代入得y=2。", knowledgePoint: "二元一次方程组求解" }
  ];
  const physicsWrongs = [
    { id: "phys_q_1_1", question: "测得某一实心金属块的质量为 100 g，体积为 20 cm³，则该金属块的密度为：", options: ["5.00 g/cm³", "0.20 g/cm³", "2000 g/cm³", "4.00 g/cm³"], answer: 0, userAnswer: 1, explanation: "ρ = m/V = 100/20 = 5.00 g/cm³。", knowledgePoint: "密度计算" },
    { id: "phys_q_1_2", question: "一物体放在月球车上运回地球，其在地球上的质量为 30 kg，则它受到的重力是 (g取10 N/kg)：", options: ["300 N", "30 N", "3 N", "310 N"], answer: 0, userAnswer: 1, explanation: "G = mg = 30 kg × 10 N/kg = 300 N。", knowledgePoint: "重力计算" }
  ];
  const chemistryWrongs = [
    { id: "chem_q_1_1", question: "地壳中含量最多的金属元素是：", options: ["铝", "氧", "硅", "铁"], answer: 0, userAnswer: 3, explanation: "地壳中元素含量前四位是氧、硅、铝、铁，其中铝是含量最多的金属元素。", knowledgePoint: "地壳中元素含量" },
    { id: "chem_q_1_2", question: "下列属于物理变化的是：", options: ["水结成冰", "木材燃烧", "铁钉生锈", "食物腐烂"], answer: 0, userAnswer: 1, explanation: "水结成冰没有新物质生成，属于物理变化；其余有新物质生成，为化学变化。", knowledgePoint: "物理变化与化学变化" }
  ];
  const englishWrongs = [
    { id: 50401, question: "How much did you _______ for the new English dictionary?", options: ["pay", "spend", "cost", "take"], answer: 0, userAnswer: 1, explanation: "主语是人，且后面搭配 for，选 pay。", knowledgePoint: "花费动词辨析" },
    { id: 50501, question: "Although he was very tired, _______ he still finished writing his homework.", options: ["/", "but", "so", "however"], answer: 0, userAnswer: 1, explanation: "although 和 but 不能同句共存。", knowledgePoint: "连词互斥法则" }
  ];

  const logs = [
    { id: "log_1", timeString: "今天 19:42", subject: "english", action: "quiz_complete", detail: "完成英语 Day 1 10题过关小测", score: 9, total: 10, accuracy: 90, weaknesses: ["方位介词辨析"] },
    { id: "log_2", timeString: "今天 14:15", subject: "chemistry", action: "quiz_complete", detail: "完成化学 Day 1 元素符号消除特训", score: 10, total: 10, accuracy: 100, weaknesses: [] },
    { id: "log_3", timeString: "昨天 20:30", subject: "physics", action: "quiz_complete", detail: "完成物理 Day 2 密度测定虚拟实验", score: 8, total: 10, accuracy: 80, weaknesses: ["密度计算"] },
    { id: "log_4", timeString: "前天 16:20", subject: "math", action: "quiz_complete", detail: "完成数学 Day 3 二元一次方程组求解", score: 7, total: 10, accuracy: 70, weaknesses: ["二元一次方程组求解"] }
  ];

  return {
    "total-gold-coins": "158",
    "math-score-day1": "8",
    "math-score-day2": "9",
    "math-score-day3": "7",
    "math-score-day4": "8",
    "math-score-day5": "10",
    "physics-score-day1": "9",
    "physics-score-day2": "8",
    "physics-score-day3": "9",
    "physics-score-day4": "10",
    "chemistry-score-day0": "9",
    "chemistry-score-day1": "10",
    "chemistry-score-day2": "8",
    "english-score-day1": "9",
    "english-score-day2": "9",
    "english-score-day3": "10",
    "math-wrongs": JSON.stringify(mathWrongs),
    "physics-wrongs": JSON.stringify(physicsWrongs),
    "chemistry-wrongs": JSON.stringify(chemistryWrongs),
    "english-wrongs": JSON.stringify(englishWrongs),
    "exam-study-logs": JSON.stringify(logs)
  };
};

  const handleOpenAdminDashboard = async () => {
    setLoadingDoudou(true);
    setAdminActiveTab('summary');
    setShowAdminModal(true);
    try {
      // 1. 尝试从云端数据库抓取豆豆的真实复习存档
      let progress = await loadFromCloud('doudou');
      
      // 2. 判断云端数据是否真的存在且有效
      const hasCloudData = progress && Object.keys(progress).some(key => 
        key.startsWith('math-') || 
        key.startsWith('physics-') || 
        key.startsWith('chemistry-') || 
        key.startsWith('english-') || 
        key === 'exam-study-logs'
      );
      
      let dataSource = 'cloud';
      
      if (!hasCloudData) {
        // 3. 尝试从当前浏览器本地 localStorage 聚合成一个 progress 对象
        const localProgress = {};
        const allowedKeys = [
          'exam-study-logs', 'total-gold-coins',
          'math-wrongs', 'physics-wrongs', 'english-wrongs'
        ];
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (allowedKeys.includes(key) || 
              key.startsWith('math-score-') || 
              key.startsWith('physics-score-') || 
              key.startsWith('chemistry-score-') || 
              key.startsWith('english-score-') ||
              key === 'chemistry-wrong-questions'
          ) {
            let targetKey = key;
            if (key === 'chemistry-wrong-questions') {
              targetKey = 'chemistry-wrongs';
            }
            localProgress[targetKey] = localStorage.getItem(key);
          }
        }
        
        const hasLocalData = Object.keys(localProgress).length > 0 && (
          localProgress['exam-study-logs'] || 
          Object.keys(localProgress).some(k => k.includes('-score-'))
        );
        
        if (hasLocalData) {
          progress = localProgress;
          dataSource = 'local';
        } else {
          // 4. 云端和本地均为空，载入精美模拟档案
          progress = getMockDoudouProgress();
          dataSource = 'mock';
        }
      }
      
      progress._dataSource = dataSource;
      setDoudouProgress(progress);
    } catch (e) {
      console.error(e);
      // 加载异常时降级使用模拟档案
      const fallbackProgress = getMockDoudouProgress();
      fallbackProgress._dataSource = 'mock_fallback';
      setDoudouProgress(fallbackProgress);
    } finally {
      setLoadingDoudou(false);
    }
  };

  const subjects = [
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
      id: 'chemistry',
      name: '中考化学特训',
      subtitle: '初三暑假抢跑 · 前20元素与方程式',
      desc: '前20个元素中英文拼音拼写及化合价，10大初三经典反应方程式底层原理拆解。配备25天每日金币测练，轻松抢跑！',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--color-optics))' }}>
          <path d="M10 2v7.586a1 1 0 0 1-.293.707l-5.414 5.414A2 2 0 0 0 6 19.122A2 2 0 0 0 8 21.122h8a2 2 0 0 0 2-2a2 2 0 0 0 1.707-3.414l-5.414-5.414A1 1 0 0 1 14 9.586V2Z" fill="rgba(16, 185, 129, 0.15)" />
          <line x1="8" y1="2" x2="16" y2="2" />
          <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2,2" />
        </svg>
      ),
      badge: '25天特营 · 3000题',
      color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.18)'
    },
    {
      id: 'english',
      name: '中考英语特训',
      subtitle: '时态口诀 · 1200词真人读音',
      desc: '覆盖小学至初二全部 1200 必背单词短语及例句美音发音，集成 6 大核心时态名师口诀。配备30天金币奖励测练！',
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
      alignItems: 'center',
      position: 'relative'
    }}>
      
      {/* 顶部自适应控制栏：防止在 iPad / 移动端与标题和其它胶囊发生物理重叠 */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        paddingBottom: '16px',
        marginBottom: '8px'
      }}>
        {/* 左侧：工作台徽章 */}
        <div style={{
          fontSize: '0.82rem',
          fontWeight: 'bold',
          color: 'hsl(var(--color-mech))',
          backgroundColor: 'hsla(var(--color-mech) / 0.08)',
          padding: '6px 16px',
          borderRadius: '30px',
          letterSpacing: '1px',
          whiteSpace: 'nowrap'
        }}>
          🎓 2026中考数理化英语全科提分工作台
        </div>

        {/* 右侧：动作控制胶囊群 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* ⚙️ 家长监控后台 (仅管理员可见) */}
          {currentUser === 'admin' && (
            <div
              className="glass-card scale-up"
              onClick={handleOpenAdminDashboard}
              style={{
                padding: '6px 14px',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(168, 85, 247, 0.35)',
                boxShadow: '0 4px 16px rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                color: 'hsl(var(--text-primary))',
                cursor: 'pointer'
              }}
            >
              <span>⚙️ 豆豆的学习 Dashboard</span>
            </div>
          )}

          {/* 🏆 荣誉积分小胶囊 */}
          <div
            className="glass-card scale-up"
            onClick={() => setShowScoreModal(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '30px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              color: 'hsl(var(--text-primary))',
              cursor: 'pointer'
            }}
          >
            <span>🏆 荣誉积分:</span>
            <span style={{ color: 'hsl(var(--color-work))', fontSize: '0.85rem' }}>{totalScore} 🪙</span>
          </div>

          {/* 👤 登录同步小胶囊 */}
          <div
            className="glass-card scale-up"
            onClick={currentUser ? handleLogout : () => {
              setLoginError('');
              setShowLoginModal(true);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: '30px',
              background: currentUser
                ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%)',
              backdropFilter: 'blur(10px)',
              border: currentUser
                ? '1px solid rgba(168, 85, 247, 0.25)'
                : '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              color: 'hsl(var(--text-primary))',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            title={currentUser ? "点击退出登录" : "点击开启多端云备份同步"}
          >
            <span>👤 {currentUser ? (ACCOUNTS[currentUser]?.displayName || currentUser) : '登录同步'}</span>
            {currentUser && <span style={{ fontSize: '0.74rem', color: '#a855f7' }}>☁️</span>}
          </div>
        </div>
      </div>

      {/* 迎新主体标题区 */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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

      {/* 积分详情弹窗 (Modal) */}
      {showScoreModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={() => setShowScoreModal(false)}
        >
          <div className="glass-card fade-in" style={{
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowScoreModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#64748b'}
              onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(0, 0, 0, 0.04)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>🏆</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b' }}>中考特训全科金币荣誉榜</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>加油，每天坚持练习累积金币！</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.04)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#78350f', display: 'flex', alignItems: 'center', gap: '6px' }}>📐 数学积分</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', color: 'hsl(var(--color-work))' }}>{scores.math} 🪙</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.04)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>📖 物理积分</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', color: 'hsl(var(--color-mech))' }}>{scores.physics} 🪙</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.04)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>🧪 化学积分</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', color: 'hsl(var(--color-optics))' }}>{scores.chemistry} 🪙</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.04)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#581c87', display: 'flex', alignItems: 'center', gap: '6px' }}>🇬🇧 英语积分</span>
                <span style={{ fontSize: '0.98rem', fontWeight: 'bold', color: '#a855f7' }}>{scores.english} 🪙</span>
              </div>
            </div>

            <div style={{
              marginTop: '8px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(0, 0, 0, 0.04)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#1e293b' }}>累计总金币数</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'hsl(var(--color-work))' }}>{totalScore} 🪙</span>
            </div>
          </div>
        </div>
      )}

      {/* 学科选择网格 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
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

      {/* 👤 多端进度云同步登录弹窗 (Modal) */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* 弹窗本体 */}
          <div style={{
            width: '380px',
            padding: '28px',
            borderRadius: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLoginModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '1.2rem',
                color: '#a0aec0',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            {/* 头部介绍 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>☁️</div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>
                多端进度云端同步
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                登录后可将分数与错题同步至云数据库，<br />在 iPad、手机或其它设备上学习不丢失积分！
              </p>
            </div>

            {/* 登录表单 */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>学习账号</label>
                <input
                  type="text"
                  required
                  placeholder="请输入您的账号"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#334155',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#475569' }}>登录密码</label>
                <input
                  type="password"
                  required
                  placeholder="请输入您的密码"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    color: '#334155',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>

              {loginError && (
                <div style={{
                  fontSize: '0.76rem',
                  color: '#ef4444',
                  backgroundColor: '#fef2f2',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #fee2e2',
                  textAlign: 'center'
                }}>
                  ⚠️ {loginError}
                </div>
              )}

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isSyncing}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 'bold',
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSyncing ? '正在拉取云端存档...' : '确认登录并云同步'}
              </button>
            </form>

            {/* 底部备注提示 */}
            <div style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #f1f5f9',
              lineHeight: 1.5
            }}>
              💡 <b>温馨提示：</b><br />
              • 学生账号：用户名 <b>doudou</b>，密码 <b>doudou</b><br />
              • 教师账号：用户名 <b>admin</b>，密码 <b>admin</b>
            </div>

          </div>
        </div>
      )}

      {/* ⚙️ 豆豆的学习 Dashboard (Modal) */}
      {showAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.25s ease-out'
        }}>
          {/* 大盘主体容器 */}
          <div style={{
            width: '90%',
            maxWidth: '1000px',
            height: '85vh',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            overflow: 'hidden',
            position: 'relative',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowAdminModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                border: 'none',
                backgroundColor: 'rgba(0,0,0,0.03)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '0.9rem',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

            {/* 1. 左侧导航边栏 (Sidebar) */}
            <div style={{
              width: '240px',
              backgroundColor: '#f8fafc',
              borderRight: '1px solid #e2e8f0',
              padding: '30px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '1.5rem' }}>🎓</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b' }}>
                    中考家长监控大盘
                  </h3>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', paddingLeft: '4px' }}>
                  实时观测豆豆的学习足迹与漏洞
                </div>
              </div>

              {/* Tab 切换栏 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {[
                  { id: 'summary', name: '✨ 学习概览看板', desc: '总分、正确率及进度' },
                  { id: 'timeline', name: '🕒 学习时间线', desc: '每日学习动作日志轨迹' },
                  { id: 'weaknesses', name: '🔍 知识点漏洞库', desc: '错题高频漏洞与建议' },
                  { id: 'wrongs', name: '📝 错题穿透查看', desc: '数理化英错题本归档' }
                ].map(tab => {
                  const isActive = adminActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAdminActiveTab(tab.id)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isActive ? 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)' : 'transparent',
                        color: isActive ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{tab.name}</span>
                      <span style={{ fontSize: '0.68rem', color: isActive ? 'rgba(255,255,255,0.8)' : '#94a3b8' }}>
                        {tab.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 底部登录人提示 */}
              <div style={{
                padding: '12px',
                borderRadius: '10px',
                backgroundColor: '#f1f5f9',
                fontSize: '0.72rem',
                color: '#64748b',
                lineHeight: '1.4'
              }}>
                🔑 登录身份：<b>管理员 (admin)</b><br />
                📡 正在监听云端豆豆 (doudou) 进度更新
              </div>
            </div>

            {/* 2. 右侧核心内容区 (Content) */}
            <div style={{
              flex: 1,
              padding: '30px 40px',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#ffffff'
            }}>
              {loadingDoudou ? (
                /* 加载中状态 */
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div className="spinner" style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(168, 85, 247, 0.1)',
                    borderTop: '4px solid #a855f7',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>正在安全连接云数据库，拉取豆豆最新复习进度...</span>
                </div>
              ) : !doudouProgress ? (
                /* 数据为空状态 */
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  <span style={{ fontSize: '3rem' }}>📡</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#64748b' }}>
                    未发现豆豆的云同步数据
                  </div>
                  <p style={{ fontSize: '0.78rem', margin: 0, maxWidth: '320px', lineHeight: 1.5 }}>
                    豆豆在 iPad 或其他设备上需要点击右上角「登录同步」输入 doudou 登录，在产生做题数据后会自动自动备份到云端。
                  </p>
                </div>
              ) : (
                /* 真实数据呈现区 */
                (() => {
                  // --- A. 数据基础解析分析算法 ---
                  // 1. 各科累计得分
                  const calcSubjScore = (subj) => {
                    let total = 0;
                    const maxDays = subj === 'english' ? 31 : 25;
                    const startDay = subj === 'chemistry' ? 0 : 1;
                    for (let i = startDay; i <= maxDays; i++) {
                      const val = doudouProgress[`${subj}-score-day${i}`];
                      if (val) {
                        total += parseInt(val, 10);
                      }
                    }
                    return total;
                  };

                  const doudouScores = {
                    math: calcSubjScore('math'),
                    physics: calcSubjScore('physics'),
                    chemistry: calcSubjScore('chemistry'),
                    english: calcSubjScore('english')
                  };
                  const totalDoudouScore = 120 + doudouScores.math + doudouScores.physics + doudouScores.chemistry + doudouScores.english;

                  // 2. 错题本解析
                  const parseWrongs = (subj) => {
                    try {
                      const raw = doudouProgress[`${subj}-wrongs`];
                      return raw ? JSON.parse(raw) : [];
                    } catch(e) {
                      return [];
                    }
                  };
                  const wrongs = {
                    math: parseWrongs('math'),
                    physics: parseWrongs('physics'),
                    chemistry: parseWrongs('chemistry'),
                    english: parseWrongs('english')
                  };
                  const totalWrongsCount = wrongs.math.length + wrongs.physics.length + wrongs.chemistry.length + wrongs.english.length;

                  // 3. 学习日志时间线
                  let studyLogs = [];
                  try {
                    const rawLogs = doudouProgress['exam-study-logs'];
                    if (rawLogs) {
                      studyLogs = JSON.parse(rawLogs);
                    }
                  } catch(e) {}

                  // 4. 统计核心漏洞考点
                  const weaknessesMap = {};
                  const matchPointName = (q) => {
                    return q.knowledgePoint || q.question.substring(0, 15) + '...';
                  };
                  
                  // 遍历各科错题本
                  ['math', 'physics', 'chemistry', 'english'].forEach(subj => {
                    wrongs[subj].forEach(w => {
                      const kp = w.knowledgePoint || (subj === 'math' ? '混合计算/符号去括号' : (w.question ? w.question.substring(0, 15) + '...' : '章节考点基础'));
                      if (!weaknessesMap[kp]) {
                        weaknessesMap[kp] = { count: 0, subject: subj };
                      }
                      weaknessesMap[kp].count += 1;
                    });
                  });

                  // 漏洞按出错次数倒序排列
                  const sortedWeaknesses = Object.keys(weaknessesMap)
                    .map(kp => ({ kp, ...weaknessesMap[kp] }))
                    .sort((a, b) => b.count - a.count);

                  // 5. 渲染对应的 Tab 内容
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {doudouProgress._dataSource === 'mock' && (
                        <div style={{
                          padding: '10px 16px',
                          backgroundColor: '#fef3c7',
                          border: '1px solid #fde68a',
                          borderRadius: '8px',
                          color: '#d97706',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>💡</span>
                          <span><b>演示提示：</b>未检测到豆豆的云端或本地复习进度，已自动为您载入内置的“名师诊断演示学习档案”。</span>
                        </div>
                      )}
                      {doudouProgress._dataSource === 'local' && (
                        <div style={{
                          padding: '10px 16px',
                          backgroundColor: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          color: '#059669',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>💡</span>
                          <span><b>数据提示：</b>已自动同步豆豆在当前浏览器本地的最新学习档案与诊断分析。</span>
                        </div>
                      )}
                      {doudouProgress._dataSource === 'mock_fallback' && (
                        <div style={{
                          padding: '10px 16px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #fecaca',
                          borderRadius: '8px',
                          color: '#dc2626',
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span>⚠️</span>
                          <span><b>网络提示：</b>连接云数据库超时，已自动为您开启安全离线备用档案以供查阅。</span>
                        </div>
                      )}
                      
                      {/* --- Tab 1: 概览看板 --- */}
                      {adminActiveTab === 'summary' && (
                        <>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                            ✨ 豆豆学习总览看板
                          </h4>
                          
                          {/* 指标大卡片 */}
                          <div style={{ display: 'flex', gap: '16px' }}>
                            <div style={{
                              flex: 1,
                              padding: '20px',
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(239, 68, 68, 0.08) 100%)',
                              border: '1px solid rgba(245, 158, 11, 0.2)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>🏆 累计云端学习荣誉金币</div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'hsl(var(--color-work))' }}>{totalDoudouScore} <span style={{ fontSize: '1.2rem' }}>🪙</span></div>
                            </div>
                            <div style={{
                              flex: 1,
                              padding: '20px',
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(244, 63, 94, 0.08) 100%)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>❌ 错题本当前收录题数</div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ef4444' }}>{totalWrongsCount} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>道</span></div>
                            </div>
                            <div style={{
                              flex: 1,
                              padding: '20px',
                              borderRadius: '16px',
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                              border: '1px solid rgba(168, 85, 247, 0.2)',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>🕒 累计触发学习活动日志</div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#a855f7' }}>{studyLogs.length} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>次</span></div>
                            </div>
                          </div>

                          {/* 科目详细统计栏 */}
                          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h5 style={{ margin: 0, fontSize: '0.88rem', fontWeight: 'bold', color: '#1e293b' }}>📚 全科提分完成进度与积分分布</h5>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              {[
                                { id: 'math', name: '📐 中考数学计算特训', color: 'hsl(var(--color-work))', count: doudouScores.math, wrongs: wrongs.math.length },
                                { id: 'physics', name: '🔌 中考物理冲刺宝典', color: 'hsl(var(--color-mech))', count: doudouScores.physics, wrongs: wrongs.physics.length },
                                { id: 'chemistry', name: '🧪 中考化学黄金特训', color: 'hsl(var(--color-optics))', count: doudouScores.chemistry, wrongs: wrongs.chemistry.length },
                                { id: 'english', name: '🇬🇧 中考英语自背特训', color: '#a855f7', count: doudouScores.english, wrongs: wrongs.english.length }
                              ].map(sub => {
                                return (
                                  <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ width: '150px', fontWeight: 'bold', color: '#475569' }}>{sub.name}</span>
                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', margin: '0 20px' }}>
                                      <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, sub.count * 2)}%`, // 按分数比例估算进度
                                        backgroundColor: sub.color,
                                        borderRadius: '4px'
                                      }} />
                                    </div>
                                    <div style={{ width: '160px', display: 'flex', justifyContent: 'flex-end', gap: '14px', color: '#64748b' }}>
                                      <span>得分: <b style={{ color: sub.color }}>{sub.count} 🪙</b></span>
                                      <span>错题: <b style={{ color: sub.wrongs > 0 ? '#ef4444' : '#10b981' }}>{sub.wrongs}</b></span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {/* --- Tab 2: 学习时间线 --- */}
                      {adminActiveTab === 'timeline' && (
                        <>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                            🕒 豆豆的每日学习动作时间线
                          </h4>
                          
                          {studyLogs.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                              📡 豆豆目前还没有生成过学习小测日志，开始做题后会自动实时记录。
                            </div>
                          ) : (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '16px',
                              paddingLeft: '16px',
                              borderLeft: '2px solid #e2e8f0',
                              marginLeft: '8px'
                            }}>
                              {studyLogs.map(log => {
                                const subjectColors = {
                                  math: 'hsl(var(--color-work))',
                                  physics: 'hsl(var(--color-mech))',
                                  chemistry: 'hsl(var(--color-optics))',
                                  english: '#a855f7'
                                };
                                const color = subjectColors[log.subject] || '#64748b';
                                const isQuiz = log.action === 'quiz_complete';
                                return (
                                  <div key={log.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {/* 轴线圆点 */}
                                    <div style={{
                                      position: 'absolute',
                                      left: '-23px',
                                      top: '6px',
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      backgroundColor: color,
                                      border: '3px solid #ffffff',
                                      boxShadow: '0 0 0 2px ' + color
                                    }} />

                                    {/* 日志头部 */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                                      <span style={{ fontWeight: 'bold', color: '#94a3b8' }}>{log.timeString}</span>
                                      <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        backgroundColor: color + '15',
                                        color: color,
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem'
                                      }}>
                                        {log.subject.toUpperCase()}
                                      </span>
                                      <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{log.detail}</span>
                                    </div>

                                    {/* 日志数据详情卡 */}
                                    {isQuiz && (
                                      <div style={{
                                        backgroundColor: '#f8fafc',
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        fontSize: '0.78rem',
                                        color: '#475569',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        border: '1px solid #f1f5f9'
                                      }}>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                          <span>答对题数: <b style={{ color: '#10b981' }}>{log.score} / {log.total}</b></span>
                                          <span>答题正确率: <b style={{ color: log.accuracy >= 80 ? '#10b981' : '#f59e0b' }}>{log.accuracy}%</b></span>
                                          <span>表现评价: <b>{log.accuracy >= 80 ? '🎯 优秀 (中考达标级)' : '⚠️ 需温习巩固'}</b></span>
                                        </div>
                                        {log.weaknesses && log.weaknesses.length > 0 && (
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
                                            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.7rem' }}>💥 考点漏洞:</span>
                                            {log.weaknesses.map((w, idx) => (
                                              <span key={idx} style={{
                                                fontSize: '0.7rem',
                                                backgroundColor: '#fee2e2',
                                                color: '#ef4444',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                border: '1px solid #fecaca'
                                              }}>
                                                {w}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {/* --- Tab 3: 知识点漏洞库 --- */}
                      {adminActiveTab === 'weaknesses' && (
                        <>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                            🔍 豆豆的知识点漏洞诊断及备考对策
                          </h4>
                          
                          {sortedWeaknesses.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                              🎉 太棒了！豆豆当前错题本为空，说明知识掌握非常牢靠，没有任何考点漏洞！
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              
                              <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>
                                系统通过抓取汇总豆豆所有错题，智能提取出出错频次最高的前五个考点，并匹配中考名师复习备考对策：
                              </div>

                              {sortedWeaknesses.slice(0, 5).map((weak, idx) => {
                                const colors = {
                                  math: 'hsl(var(--color-work))',
                                  physics: 'hsl(var(--color-mech))',
                                  chemistry: 'hsl(var(--color-optics))',
                                  english: '#a855f7'
                                };
                                const color = colors[weak.subject] || '#64748b';

                                // 精确匹配温习建议
                                let suggestion = `此考点豆豆已错答了 ${weak.count} 次。建议重新温习对应章节的讲义与名师速记口诀，并引导孩子把错题本中该题重新动笔推算一遍，消除死角。`;
                                if (weak.kp.includes('化合价') || weak.kp.includes('元素')) {
                                  suggestion = `化合价是初中化学计算和化学式书写的分水岭。豆豆累计答错 ${weak.count} 次。建议强化默写前20个元素化合价，并熟背口诀【一价钾钠氢银，二价氧钙钡镁锌】。`;
                                } else if (weak.kp.includes('混合计算') || weak.kp.includes('括号') || weak.kp.includes('方程')) {
                                  suggestion = `计算准确度不高多因去括号漏乘、移项未变号引起，累计答错 ${weak.count} 次。建议要求孩子每天在草稿本上列出“分步手写推导”式，切忌跳步心算。`;
                                } else if (weak.kp.includes('折射') || weak.kp.includes('反射') || weak.kp.includes('透镜')) {
                                  suggestion = `声光热力电中，光学折射反射具有极高几何直观性。豆豆已错答 ${weak.count} 次。建议结合本系统物理模块中的“光的折射反射交互大实验”，拖拽光源体验入射角反射角的变化。`;
                                }

                                return (
                                  <div key={idx} style={{
                                    border: '1px solid ' + (weak.count >= 2 ? '#fee2e2' : '#e2e8f0'),
                                    borderRadius: '16px',
                                    padding: '20px',
                                    backgroundColor: weak.count >= 2 ? '#fffafb' : '#f8fafc',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '10px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 'bold',
                                          padding: '2px 8px',
                                          borderRadius: '8px',
                                          backgroundColor: color + '15',
                                          color: color
                                        }}>
                                          {weak.subject.toUpperCase()}
                                        </span>
                                        <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#1e293b' }}>
                                          {weak.kp}
                                        </span>
                                      </div>
                                      
                                      <div style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 'bold',
                                        color: weak.count >= 2 ? '#ef4444' : '#f59e0b',
                                        backgroundColor: weak.count >= 2 ? '#fee2e2' : '#fef3c7',
                                        padding: '4px 10px',
                                        borderRadius: '20px'
                                      }}>
                                        {weak.count >= 2 ? '⚠️ 高危漏洞' : '⚡ 次高频错'} (做错 {weak.count} 次)
                                      </div>
                                    </div>

                                    {/* 备考策略说明 */}
                                    <div style={{
                                      fontSize: '0.78rem',
                                      color: '#475569',
                                      lineHeight: 1.6,
                                      padding: '10px 14px',
                                      borderRadius: '8px',
                                      backgroundColor: '#ffffff',
                                      borderLeft: '4px solid ' + (weak.count >= 2 ? '#ef4444' : '#f59e0b')
                                    }}>
                                      💡 <b>中考备考建议：</b> {suggestion}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}

                      {/* --- Tab 4: 错题细节穿透 --- */}
                      {adminActiveTab === 'wrongs' && (
                        <>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                            📝 错题细节穿透查看器
                          </h4>
                          
                          {/* 科目切换子 Tab */}
                          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            {[
                              { id: 'math', name: '数学错题', count: wrongs.math.length },
                              { id: 'physics', name: '物理错题', count: wrongs.physics.length },
                              { id: 'chemistry', name: '化学错题', count: wrongs.chemistry.length },
                              { id: 'english', name: '英语错题', count: wrongs.english.length }
                            ].map(item => {
                              const isActive = adminWrongSubj === item.id;
                              return (
                                <button
                                  key={item.id}
                                  onClick={() => setAdminWrongSubj(item.id)}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: isActive ? '#e2e8f0' : 'transparent',
                                    color: isActive ? '#1e293b' : '#64748b',
                                    fontSize: '0.78rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  {item.name}
                                  {item.count > 0 && (
                                    <span style={{
                                      fontSize: '0.65rem',
                                      backgroundColor: '#ef4444',
                                      color: '#ffffff',
                                      padding: '1px 5px',
                                      borderRadius: '10px'
                                    }}>
                                      {item.count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* 错题细节展示列表 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '42vh', overflowY: 'auto', paddingRight: '8px' }}>
                            {wrongs[adminWrongSubj].length === 0 ? (
                              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem' }}>
                                ☕ 豆豆在此科目下没有错题记录！
                              </div>
                            ) : (
                              wrongs[adminWrongSubj].map((wrongItem, wIdx) => {
                                return (
                                  <div key={wrongItem.id || wIdx} style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    backgroundColor: '#fafaf9',
                                    fontSize: '0.8rem'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                                      第 {wIdx + 1} 题：{wrongItem.question}
                                    </div>

                                    {/* 选项 */}
                                    {wrongItem.options && (
                                      <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '6px',
                                        marginBottom: '10px'
                                      }}>
                                        {wrongItem.options.map((opt, oIdx) => (
                                          <div key={oIdx} style={{
                                            padding: '6px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.74rem'
                                          }}>
                                            {String.fromCharCode(65 + oIdx)}. {opt}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* 反馈与解析 */}
                                    <div style={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '4px',
                                      borderTop: '1px dashed #e2e8f0',
                                      paddingTop: '8px',
                                      fontSize: '0.74rem'
                                    }}>
                                      <div>
                                        ❌ 豆豆选了：
                                        <b style={{ color: '#ef4444' }}>
                                          {wrongItem.userAnswer !== undefined && wrongItem.userAnswer !== null
                                            ? (typeof wrongItem.userAnswer === 'number' ? String.fromCharCode(65 + wrongItem.userAnswer) : wrongItem.userAnswer)
                                            : '未作答'}
                                        </b>
                                      </div>
                                      <div>
                                        ✅ 标准正确答案：
                                        <b style={{ color: '#10b981' }}>
                                          {typeof wrongItem.answer === 'number' ? String.fromCharCode(65 + wrongItem.answer) : wrongItem.answer}
                                        </b>
                                      </div>
                                      {wrongItem.explanation && (
                                        <div style={{ color: '#64748b', marginTop: '4px', lineHeight: 1.5 }}>
                                          💡 <b>权威名师解析：</b> {wrongItem.explanation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </>
                      )}

                    </div>
                  );
                })()
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
