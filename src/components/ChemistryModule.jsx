import React, { useState, useEffect } from 'react';
import { chemistryBlocks, chemistryDays } from '../data/chemistryData';
import { generateChemistryQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';

export default function ChemistryModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

  // 15天每日金币积分状态 { [dayId]: score }
  const [dayScores, setDayScores] = useState({});
  const [showBillModal, setShowBillModal] = useState(false);

  // 20题测试状态
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({}); // { [qId]: selectedOpt }
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedTestOpt, setSelectedTestOpt] = useState(null);
  const [testChecked, setTestChecked] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // 100题练习状态
  const [exerciseQuestions, setExerciseQuestions] = useState([]);
  const [exerciseAnswers, setExerciseAnswers] = useState({}); // { [qId]: { isCorrect, userOpt } }
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // 化学错题本状态
  const [wrongList, setWrongList] = useState([]);

  // 初始化加载错题与15天历史积分
  useEffect(() => {
    const savedWrongs = localStorage.getItem('chemistry-wrongs');
    if (savedWrongs) setWrongList(JSON.parse(savedWrongs));

    const scores = {};
    for (let i = 1; i <= 15; i++) {
      const dayKey = `day${i}`;
      const val = localStorage.getItem(`chemistry-score-${dayKey}`);
      if (val !== null) {
        scores[dayKey] = parseInt(val, 10);
      } else {
        scores[dayKey] = 0;
      }
    }
    setDayScores(scores);
  }, []);

  // 切换天数时重置
  useEffect(() => {
    setTestSubmitted(false);
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
  }, [selectedDayId]);

  // 开启20题测试
  const handleStartTest = () => {
    const dayData = chemistryDays[selectedDayId] || chemistryDays['day1'];
    const generated = generateChemistryQuestions(dayData.topicId, 20);
    setTestQuestions(generated);
    setTestAnswers({});
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
    setTestSubmitted(true);
  };

  // 100题练习自动载入
  useEffect(() => {
    if (activeTab === 'exercise') {
      const dayData = chemistryDays[selectedDayId] || chemistryDays['day1'];
      const generated = generateChemistryQuestions(dayData.topicId, 100);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedDayId, activeTab]);

  // 更新金币分值助手函数：做对 +1，做错 -1
  const updateGoldCoin = (isCorrect) => {
    const currentScore = dayScores[selectedDayId] || 0;
    const delta = isCorrect ? 1 : -1;
    const newScore = currentScore + delta;
    
    const nextScores = { ...dayScores, [selectedDayId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`chemistry-score-${selectedDayId}`, newScore.toString());
  };

  // 20题测试单步提交
  const handleTestSubmit = () => {
    if (selectedTestOpt === null) return;
    const currentQ = testQuestions[currentTestIndex];
    const isCorrect = selectedTestOpt === currentQ.answer;

    const nextAnswers = { ...testAnswers, [currentQ.id]: selectedTestOpt };
    setTestAnswers(nextAnswers);

    updateGoldCoin(isCorrect);

    if (!isCorrect) {
      const alreadyIn = wrongList.some(w => w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = { ...currentQ, userAnswer: selectedTestOpt, chapterId: selectedDayId };
        const nextWrongs = [...wrongList, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('chemistry-wrongs', JSON.stringify(nextWrongs));
      }
    }
    setTestChecked(true);
  };

  // 20题测试下一题
  const handleNextTest = () => {
    setSelectedTestOpt(null);
    setTestChecked(false);
    
    if (currentTestIndex < testQuestions.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
    } else {
      let correctCount = 0;
      testQuestions.forEach(q => {
        if (testAnswers[q.id] === q.answer) {
          correctCount++;
        }
      });
      setTestScore(Math.round((correctCount / 20) * 100));
    }
  };

  // 100题练习单步点击
  const handleExerciseOptionClick = (optionIdx) => {
    const currentQ = exerciseQuestions[currentExerciseIndex];
    if (!currentQ || exerciseAnswers[currentQ.id]) return;

    const isCorrect = optionIdx === currentQ.answer;
    const nextAnswers = {
      ...exerciseAnswers,
      [currentQ.id]: { isCorrect, userOpt: optionIdx }
    };
    setExerciseAnswers(nextAnswers);

    updateGoldCoin(isCorrect);

    if (!isCorrect) {
      const alreadyIn = wrongList.some(w => w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = { ...currentQ, userAnswer: optionIdx, chapterId: selectedDayId };
        const nextWrongs = [...wrongList, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('chemistry-wrongs', JSON.stringify(nextWrongs));
      }
    }
  };

  // 移除错题
  const handleRemoveWrong = (qId) => {
    const nextWrongs = wrongList.filter(w => w.id !== qId);
    setWrongList(nextWrongs);
    localStorage.setItem('chemistry-wrongs', JSON.stringify(nextWrongs));
  };

  const handleClearAllWrongs = () => {
    if (window.confirm('您确定要清空化学错题本中所有的题目吗？')) {
      setWrongList([]);
      localStorage.setItem('chemistry-wrongs', JSON.stringify([]));
    }
  };

  const handleResetDayScore = (dayId) => {
    if (window.confirm(`您确定要清空 Day ${dayId.replace('day', '')} 的今日化学积分吗？`)) {
      const nextScores = { ...dayScores, [dayId]: 0 };
      setDayScores(nextScores);
      localStorage.setItem(`chemistry-score-${dayId}`, '0');
    }
  };

  // 渲染化学实验/原子微观原理图
  const renderChemistryIllustrations = (dayId) => {
    const list = [];
    
    // 1. 原子微观核电排布 (Day 1 - 4)
    if (dayId === 'day1' || dayId === 'day2' || dayId === 'day3' || dayId === 'day4') {
      list.push(
        <div key="c-day-atom" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：11号钠(Na)最外层电子轨道模型 (化合价本质)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <circle cx="200" cy="55" r="14" fill="rgba(239, 68, 68, 0.15)" stroke="hsl(var(--color-danger))" strokeWidth="2" />
            <text x="200" y="59" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold" textAnchor="middle">+11</text>
            
            {/* 第一层轨道 (2电子) */}
            <circle cx="200" cy="55" r="24" fill="none" stroke="#a0aec0" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx="200" cy="31" r="3.5" fill="hsl(var(--color-optics))" />
            <circle cx="200" cy="79" r="3.5" fill="hsl(var(--color-optics))" />

            {/* 第二层轨道 (8电子) */}
            <circle cx="200" cy="55" r="38" fill="none" stroke="#718096" strokeWidth="1" strokeDasharray="3,3" />
            <circle cx="162" cy="55" r="3.5" fill="hsl(var(--color-optics))" />
            <circle cx="238" cy="55" r="3.5" fill="hsl(var(--color-optics))" />
            <circle cx="200" cy="17" r="3.5" fill="hsl(var(--color-optics))" />
            <circle cx="200" cy="93" r="3.5" fill="hsl(var(--color-optics))" />

            {/* 第三层最外层 (仅 1 电子) */}
            <circle cx="200" cy="55" r="48" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.2" />
            <circle cx="248" cy="55" r="4.5" fill="hsl(var(--color-work))" />
            
            <path d="M 252 50 Q 290 20 320 35" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.5" strokeDasharray="2,2" />
            <text x="325" y="38" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold">易失去 1e⁻ ➔ 显 +1 价</text>
          </svg>
        </div>
      );
    }

    // 2. 水的电解气泡比 (Day 8)
    if (dayId === 'day8') {
      list.push(
        <div key="c-day-water" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：电解水“正氧负氢、氢二氧一”实验管体积</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="120" y="10" width="30" height="80" rx="15" fill="none" stroke="#718096" strokeWidth="2" />
            <rect x="122" y="50" width="26" height="38" fill="rgba(59, 130, 246, 0.1)" />
            <text x="135" y="45" fill="hsl(var(--color-optics))" fontSize="10" fontWeight="bold" textAnchor="middle">氧气 1</text>
            <line x1="120" y1="90" x2="150" y2="90" stroke="hsl(var(--color-optics))" strokeWidth="3" />
            <text x="135" y="102" fill="hsl(var(--color-optics))" fontSize="8.5" fontWeight="bold" textAnchor="middle">正极 (+)</text>

            <rect x="250" y="10" width="30" height="80" rx="15" fill="none" stroke="#718096" strokeWidth="2" />
            <rect x="252" y="70" width="26" height="18" fill="rgba(16, 185, 129, 0.1)" />
            <text x="265" y="60" fill="hsl(var(--color-success))" fontSize="10" fontWeight="bold" textAnchor="middle">氢气 2</text>
            <line x1="250" y1="90" x2="280" y2="90" stroke="hsl(var(--color-success))" strokeWidth="3" />
            <text x="265" y="102" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">负极 (-)</text>
          </svg>
        </div>
      );
    }

    // 3. 铁丝燃烧集气瓶水防护 (Day 7)
    if (dayId === 'day7') {
      list.push(
        <div key="c-day-iron" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：铁丝在氧气中燃烧集气瓶底部放水防炸裂</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="160" y="10" width="80" height="80" fill="none" stroke="#4a5568" strokeWidth="2" rx="4" />
            <rect x="162" y="75" width="76" height="13" fill="rgba(59, 130, 246, 0.2)" />
            <text x="200" y="84" fill="#2b6cb0" fontSize="8.5" fontWeight="bold" textAnchor="middle">水 (吸收高温熔融物热量)</text>

            <line x1="200" y1="10" x2="200" y2="40" stroke="#718096" strokeWidth="1.5" />
            <path d="M 200 40 Q 185 55 200 70" fill="none" stroke="red" strokeWidth="1.2" />
            <circle cx="205" cy="55" r="2" fill="orange" />
            <circle cx="193" cy="62" r="2" fill="orange" />
            <text x="212" y="58" fill="orange" fontSize="7" fontWeight="bold">火星四射</text>
          </svg>
        </div>
      );
    }

    return list;
  };

  const parseSummary = (text = '') => {
    if (!text) return null;
    const parts = text.split('=========================================');
    if (parts.length < 3) {
      return <p style={{ fontSize: '0.88rem', lineHeight: '1.75', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>{text}</p>;
    }
    const header = parts[0];
    const specialCoaching = parts[1];
    const footer = parts[2];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {header.trim() && <p style={{ fontSize: '0.86rem', lineHeight: '1.7', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>{header.trim()}</p>}
        {specialCoaching.trim() && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(59, 130, 246, 0.02)',
            border: '1px solid rgba(59, 130, 246, 0.12)',
            borderLeft: '4px solid hsl(var(--color-optics))',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '0.86rem', lineHeight: '1.75', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0, fontWeight: 500 }}>{specialCoaching.trim()}</p>
          </div>
        )}
        {footer.trim() && <p style={{ fontSize: '0.86rem', lineHeight: '1.7', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>{footer.trim()}</p>}
      </div>
    );
  };

  const currentDayData = chemistryDays[selectedDayId] || chemistryDays['day1'];
  const todayGoldCoin = dayScores[selectedDayId] !== undefined ? dayScores[selectedDayId] : 0;

  return (
    <div className="app-container fade-in">
      {/* 侧边栏 */}
      <div className="sidebar" style={{ minWidth: '240px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, hsl(var(--color-optics)), hsl(var(--color-success)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            化
          </div>
          <div>
            <h2 style={{ fontSize: '0.98rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考化学抢跑营</h2>
            <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>15天初三抢跑先锋</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '24px' }}>
          <button
            className={`btn btn-secondary ${activeTab === 'study' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'study' ? '' : 'transparent' }}
            onClick={() => setActiveTab('study')}
          >
            📖 每日公式与拼音
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'test' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'test' ? '' : 'transparent' }}
            onClick={() => setActiveTab('test')}
          >
            ✍️ 20题过关小测试
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'exercise' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'exercise' ? '' : 'transparent' }}
            onClick={() => setActiveTab('exercise')}
          >
            📝 100题每日狂练
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'wrongbook' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'wrongbook' ? '' : 'transparent', position: 'relative' }}
            onClick={() => setActiveTab('wrongbook')}
          >
            ❌ 化学错题重温本
            {wrongList.length > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'hsl(var(--color-danger))',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '10px'
              }}>
                {wrongList.length}
              </span>
            )}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid hsla(var(--text-secondary) / 0.1)', paddingTop: '16px' }}>
          <button
            className="btn btn-secondary scale-up"
            style={{
              padding: '8px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              borderColor: 'rgba(16, 185, 129, 0.3)',
              backgroundColor: 'rgba(16, 185, 129, 0.03)',
              color: '#047857'
            }}
            onClick={() => setShowBillModal(true)}
          >
            📊 15天历史金币账单
          </button>
          <div style={{ fontSize: '0.68rem', opacity: 0.4, textAlign: 'center' }}>
            做对+1, 做错-1, 小测后核算
          </div>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {activeTab !== 'wrongbook' && (
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 两周大阶段切换 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {chemistryBlocks.map((block) => {
                const isCurrentBlock = block.days.includes(selectedDayId);
                return (
                  <button
                    key={block.id}
                    className={`btn ${isCurrentBlock ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.75rem',
                      padding: '8px 4px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      alignItems: 'center',
                      backgroundColor: isCurrentBlock ? 'hsl(var(--color-optics))' : '',
                      borderColor: isCurrentBlock ? 'hsl(var(--color-optics))' : ''
                    }}
                    onClick={() => setSelectedDayId(block.days[0])}
                  >
                    <span style={{ fontWeight: 'bold' }}>{block.name.split('：')[0]}</span>
                    <span style={{ fontSize: '0.64rem', opacity: 0.85 }}>{block.name.split('：')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* 天数徽章导航 */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(() => {
                const currentBlock = chemistryBlocks.find(b => b.days.includes(selectedDayId)) || chemistryBlocks[0];
                return currentBlock.days.map((dayId) => {
                  const dayData = chemistryDays[dayId];
                  const isSelected = selectedDayId === dayId;
                  
                  return (
                    <button
                      key={dayId}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '5px 12px',
                        fontSize: '0.74rem',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: isSelected ? 'hsl(var(--color-optics))' : '',
                        borderColor: isSelected ? 'hsl(var(--color-optics))' : ''
                      }}
                      onClick={() => setSelectedDayId(dayId)}
                    >
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#fff' : 'hsl(var(--color-optics))'
                      }}></span>
                      Day {dayId.replace('day', '')}：{dayData?.name.split('：')[1]}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Tab 1: 讲义与化学图解 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', height: '520px', alignItems: 'stretch' }}>
              
              {/* 左栏 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📖 课程讲义 ({currentDayData?.name})</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>抢跑课: 1.0小时/天</span>
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {parseSummary(currentDayData?.summary)}
                </div>
              </div>

              {/* 右栏 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-success))', borderBottom: '2px solid rgba(16,185,129,0.06)', paddingBottom: '10px' }}>
                  📐 经典母题与实验图解
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                  
                  <div style={{ padding: '16px', border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.02), rgba(59,130,246,0.02))', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#047857' }}>📝 经典母题精讲：</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 'bold', padding: '10px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      {currentDayData?.example.question}
                    </div>
                    <div style={{ fontSize: '0.82rem', lineHeight: '1.65', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                      {currentDayData?.example.answer}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'hsl(var(--color-danger))', borderTop: '1px dashed rgba(16,185,129,0.2)', paddingTop: '8px', lineHeight: '1.5' }}>
                      ⚠️ <b>名师避坑指点：</b>{currentDayData?.example.tip}
                    </div>
                  </div>

                  {renderChemistryIllustrations(selectedDayId)}
                </div>
              </div>
            </div>

            {/* 今日小测引导 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>
                  🧪 今天的化学抢跑知识听懂了吗？
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  做对一个<b>加1金币</b>，做错扣1金币，今日小测完可查询总金币。
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }}
                onClick={() => {
                  setActiveTab('test');
                  handleStartTest();
                }}
              >
                开启今日过关小测
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 20题测试大厅 */}
        {activeTab === 'test' && (
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '500px' }}>
            {!testSubmitted ? (
              <div style={{ textAlign: 'center', padding: '50px 0', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-success))' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    🧪 开启：Day {selectedDayId.replace('day', '')} 化学小测
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                    测验包含 20 道当天抢跑知识。答题过程中，做对一道<b>+1金币</b>，做错一道<b>-1金币</b>，防止分心小测后统一结算。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }} onClick={handleStartTest}>
                  开始小测
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>当前进度：<b>{currentTestIndex + 1}</b> / 20 题</span>
                  <span>今日小测中...</span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${((currentTestIndex + 1) / 20) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-optics))', transition: 'width 0.3s ease' }}></div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                  Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testQuestions[currentTestIndex]?.options.map((opt, oIdx) => {
                    let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                    if (selectedTestOpt === oIdx) {
                      btnStyle = { border: '1px solid hsl(var(--color-optics))', backgroundColor: 'hsla(var(--color-optics)/0.08)', color: 'hsl(var(--color-optics))' };
                    }
                    if (testChecked) {
                      const isCorrectOpt = oIdx === testQuestions[currentTestIndex].answer;
                      if (isCorrectOpt) {
                        btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.08)', color: 'hsl(var(--color-success))' };
                      } else if (selectedTestOpt === oIdx) {
                        btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'hsla(var(--color-danger)/0.08)', color: 'hsl(var(--color-danger))' };
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        className="btn btn-secondary"
                        style={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          padding: '10px 16px',
                          fontSize: '0.85rem',
                          ...btnStyle
                        }}
                        disabled={testChecked}
                        onClick={() => setSelectedTestOpt(oIdx)}
                      >
                        <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {testChecked && (
                  <div className="fade-in" style={{
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderLeft: `4px solid ${selectedTestOpt === testQuestions[currentTestIndex].answer ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{ fontWeight: 'bold', color: selectedTestOpt === testQuestions[currentTestIndex].answer ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '4px' }}>
                      {selectedTestOpt === testQuestions[currentTestIndex].answer ? '✅ 算对了！ +1 金币' : '❌ 算错了。 扣减 1 金币。请看解析：'}
                    </div>
                    {testQuestions[currentTestIndex].explanation}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  {!testChecked ? (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }} disabled={selectedTestOpt === null} onClick={handleTestSubmit}>
                      提交答案
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }} onClick={handleNextTest}>
                      {currentTestIndex < 19 ? '下一题' : '完成测验并结算'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* 成绩报告 */
              <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: testScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: testScore >= 80 ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  {testScore}%
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                    {testScore >= 80 ? '🎉 抢跑先锋！太棒了！' : '💪 还没达到 80 分，继续加油！'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                    今日测试正确率 <b>{testScore}%</b>。
                  </p>
                </div>

                {/* 🪙 今日结算金币高亮展示卡 */}
                <div style={{
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                  border: '1px solid #f59e0b',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.1)'
                }}>
                  <span style={{ fontSize: '1.8rem' }}>🪙</span>
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 'bold' }}>本日特训结算累积金币</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#92400e' }}>
                      {todayGoldCoin >= 0 ? `+${todayGoldCoin}` : todayGoldCoin} 个
                    </span>
                  </div>
                </div>

                {/* 💡 100 题特训金币奖励提示卡 */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'hsl(var(--text-primary))',
                  lineHeight: '1.6',
                  maxWidth: '440px',
                  textAlign: 'left'
                }}>
                  💡 <b>提分秘籍提示：</b> 恭喜你完成了今天的过关测试！别忘了，每天还有 <b>100 道专项化学题库</b> 供你狂练。挑战它们不仅能帮你稳固薄弱环节，还能<b>获得更多金币</b>哦！
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.74rem',
                        fontWeight: 'bold',
                        backgroundColor: 'hsl(var(--color-optics))',
                        borderColor: 'hsl(var(--color-optics))'
                      }}
                      onClick={() => {
                        setActiveTab('exercise');
                        setTestSubmitted(false);
                      }}
                    >
                      🚀 立即挑战 100 题狂练
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.82rem' }} onClick={() => setTestSubmitted(false)}>
                    返回大厅
                  </button>
                  <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }} onClick={handleStartTest}>
                    重新小测
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 100题特训狂练 */}
        {activeTab === 'exercise' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', flex: 1, minHeight: '500px' }}>
              
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#047857', fontWeight: 'bold' }}>
                          Day {selectedDayId.replace('day', '')} 特训 · 第 {currentExerciseIndex + 1} / 100 题
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          累计金币：{todayGoldCoin >= 0 ? `+${todayGoldCoin}` : todayGoldCoin}
                        </span>
                      </div>

                      <div style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontSize: '0.96rem', fontWeight: 'bold' }}>
                        {exerciseQuestions[currentExerciseIndex].question}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {exerciseQuestions[currentExerciseIndex].options.map((opt, oIdx) => {
                          const qId = exerciseQuestions[currentExerciseIndex].id;
                          const ansState = exerciseAnswers[qId];
                          const isAns = !!ansState;

                          let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                          if (isAns) {
                            const isCorrectOpt = oIdx === exerciseQuestions[currentExerciseIndex].answer;
                            const isUserSelected = oIdx === ansState.userOpt;
                            if (isCorrectOpt) {
                              btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.08)', color: 'hsl(var(--color-success))' };
                            } else if (isUserSelected) {
                              btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'hsla(var(--color-danger)/0.08)', color: 'hsl(var(--color-danger))' };
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              className="btn btn-secondary"
                              style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 14px', fontSize: '0.82rem', ...btnStyle }}
                              disabled={isAns}
                              onClick={() => handleExerciseOptionClick(oIdx)}
                            >
                              <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id] && (
                        <div className="fade-in" style={{
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderLeft: `4px solid ${exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          <div style={{ fontWeight: 'bold', color: exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '4px' }}>
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 算对了！今日金币 +1 个' : '❌ 算错了。今日金币 -1 个，已自动计错。'}
                          </div>
                          {exerciseQuestions[currentExerciseIndex].explanation}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        disabled={currentExerciseIndex === 0}
                        onClick={() => setCurrentExerciseIndex(prev => prev - 1)}
                      >
                        上一题
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }}
                        disabled={currentExerciseIndex === 99}
                        onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成今日 100 题化学特训库...</div>
                )}
              </div>

              {/* 右栏：100题进度网格 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 100题化学特训卡</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    已完成：{Object.keys(exerciseAnswers).length} / 100
                  </span>
                </h4>

                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '380px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: '6px',
                  padding: '4px'
                }}>
                  {Array.from({ length: 100 }).map((_, idx) => {
                    const q = exerciseQuestions[idx];
                    let bgColor = 'rgba(0,0,0,0.04)';
                    let textColor = 'hsl(var(--text-secondary))';
                    let borderStyle = 'none';

                    if (q && exerciseAnswers[q.id]) {
                      bgColor = exerciseAnswers[q.id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                      textColor = '#ffffff';
                    }
                    if (idx === currentExerciseIndex) {
                      borderStyle = '2px solid hsl(var(--color-optics))';
                    }

                    return (
                      <button
                        key={idx}
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: bgColor,
                          color: textColor,
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          border: borderStyle,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => setCurrentExerciseIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)' }}></span>未答
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))' }}></span>算对
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-danger))' }}></span>算错
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 化学错题本 */}
        {activeTab === 'wrongbook' && (
          <WrongBook
            wrongList={wrongList}
            onRemoveWrong={handleRemoveWrong}
            onClearAll={handleClearAllWrongs}
            subject="chemistry"
          />
        )}
      </div>

      {/* 📊 15天积分兑奖荣誉账单 Modal */}
      {showBillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card scale-up" style={{
            width: '90%',
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            maxHeight: '85vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#047857' }}>🪙 15天化学抢跑荣誉账单</h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                onClick={() => setShowBillModal(false)}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              提示：每天金币分值等于<b>【做对题目数 &times; 1 + 做错题目数 &times; -1】</b>。家长可在此随时核对 15 天的成绩，兑换奖励。
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '6px'
            }}>
              {Array.from({ length: 15 }).map((_, idx) => {
                const dayId = `day${idx + 1}`;
                const score = dayScores[dayId] !== undefined ? dayScores[dayId] : 0;
                const isSelected = selectedDayId === dayId;

                let scoreColor = '#718096';
                let cellBg = '#f8fafc';
                let border = '1px solid #e2e8f0';

                if (score > 0) {
                  scoreColor = '#047857';
                  cellBg = '#ecfdf5';
                  border = '1px solid #a7f3d0';
                } else if (score < 0) {
                  scoreColor = 'hsl(var(--color-danger))';
                  cellBg = 'hsla(var(--color-danger)/0.02)';
                  border = '1px solid hsla(var(--color-danger)/0.1)';
                }

                if (isSelected) {
                  border = '2px solid hsl(var(--color-optics))';
                }

                return (
                  <div
                    key={dayId}
                    style={{
                      padding: '8px 4px',
                      backgroundColor: cellBg,
                      border: border,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onClick={() => {
                      setSelectedDayId(dayId);
                      setShowBillModal(false);
                    }}
                  >
                    <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>Day {idx + 1}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: scoreColor }}>
                      {score > 0 ? `+${score}` : score}
                    </span>
                    
                    {score !== 0 && (
                      <button
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.15)',
                          color: '#fff',
                          fontSize: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="清空此日分值"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResetDayScore(dayId);
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.8rem', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }}
                onClick={() => setShowBillModal(false)}
              >
                确认关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
