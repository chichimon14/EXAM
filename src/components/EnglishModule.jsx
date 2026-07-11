import React, { useState, useEffect } from 'react';
import { englishBlocks, englishDays, englishVocabList } from '../data/englishData';
import { generateEnglishQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';

export default function EnglishModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

  // 30天每日金币积分状态 { [dayId]: score }
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

  // 英语错题本状态
  const [wrongList, setWrongList] = useState([]);

  // 智能英语单词斩词熟记与生词本管理
  const [masteredWords, setMasteredWords] = useState([]);
  const [unfamiliarWords, setUnfamiliarWords] = useState([]);

  // 控制左侧周（二级目录）单项展开折叠状态（互斥折叠）
  const [expandedBlockId, setExpandedBlockId] = useState(null);

  // 自动展开当前选中 Day 所属的周大单元
  useEffect(() => {
    const curBlock = englishBlocks.find(b => b.days.includes(selectedDayId));
    if (curBlock) {
      setExpandedBlockId(curBlock.id);
    }
  }, [selectedDayId]);

  const toggleBlock = (blockId) => {
    setExpandedBlockId(prev => prev === blockId ? null : blockId);
  };

  // 初始化加载错题与30天历史积分、斩词与生词库
  useEffect(() => {
    const savedWrongs = localStorage.getItem('english-wrongs');
    if (savedWrongs) setWrongList(JSON.parse(savedWrongs));

    const mastered = localStorage.getItem('english-mastered-words');
    if (mastered) setMasteredWords(JSON.parse(mastered));

    const unfamiliar = localStorage.getItem('english-unfamiliar-words');
    if (unfamiliar) setUnfamiliarWords(JSON.parse(unfamiliar));

    const scores = {};
    for (let i = 1; i <= 30; i++) {
      const dayKey = `day${i}`;
      const val = localStorage.getItem(`english-score-${dayKey}`);
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

  // 切换掌握熟记状态（斩词）
  const toggleMastered = (word) => {
    let nextMastered = [];
    const isExist = masteredWords.includes(word);
    if (isExist) {
      nextMastered = masteredWords.filter(w => w !== word);
    } else {
      nextMastered = [...masteredWords, word];
      // 熟记斩词后，自动从生词本中移出，减轻记忆负担
      if (unfamiliarWords.includes(word)) {
        const nextUnfamiliar = unfamiliarWords.filter(w => w !== word);
        setUnfamiliarWords(nextUnfamiliar);
        localStorage.setItem('english-unfamiliar-words', JSON.stringify(nextUnfamiliar));
      }
      // 孩子斩词成功，奖励 1 个荣誉金币！
      updateGoldCoin(true);
    }
    setMasteredWords(nextMastered);
    localStorage.setItem('english-mastered-words', JSON.stringify(nextMastered));
  };

  // 切换不熟悉生词状态（收藏强化训练）
  const toggleUnfamiliar = (word) => {
    let nextUnfamiliar = [];
    const isExist = unfamiliarWords.includes(word);
    if (isExist) {
      nextUnfamiliar = unfamiliarWords.filter(w => w !== word);
    } else {
      nextUnfamiliar = [...unfamiliarWords, word];
      // 标记为生词后，自动从已掌握（斩词）中剔除，回归正常训练流程
      if (masteredWords.includes(word)) {
        const nextMastered = masteredWords.filter(w => w !== word);
        setMasteredWords(nextMastered);
        localStorage.setItem('english-mastered-words', JSON.stringify(nextMastered));
      }
    }
    setUnfamiliarWords(nextUnfamiliar);
    localStorage.setItem('english-unfamiliar-words', JSON.stringify(nextUnfamiliar));
  };

  // 开启20题测试
  const handleStartTest = () => {
    const dayData = englishDays[selectedDayId] || englishDays['day1'];
    const generated = generateEnglishQuestions(dayData.topicId, 20);
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
      const dayData = englishDays[selectedDayId] || englishDays['day1'];
      const generated = generateEnglishQuestions(dayData.topicId, 100);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedDayId, activeTab]);

  // 原生 Web Speech TTS 语音朗读播放
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // 停止当前所有播放
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US'; // 美音标准
      utterance.rate = 0.82; // 0.82 倍速，发音更清晰、饱满
      window.speechSynthesis.speak(utterance);
    } else {
      alert('抱歉，当前浏览器不支持原生的语音合成朗读功能。');
    }
  };

  // 更新金币分值：做对 +1，做错 -1
  const updateGoldCoin = (isCorrect) => {
    const currentScore = dayScores[selectedDayId] || 0;
    const delta = isCorrect ? 1 : -1;
    const newScore = currentScore + delta;
    
    const nextScores = { ...dayScores, [selectedDayId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`english-score-${selectedDayId}`, newScore.toString());
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
        localStorage.setItem('english-wrongs', JSON.stringify(nextWrongs));
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
        localStorage.setItem('english-wrongs', JSON.stringify(nextWrongs));
      }
    }
  };

  // 移除错题
  const handleRemoveWrong = (qId) => {
    const nextWrongs = wrongList.filter(w => w.id !== qId);
    setWrongList(nextWrongs);
    localStorage.setItem('english-wrongs', JSON.stringify(nextWrongs));
  };

  const handleClearAllWrongs = () => {
    if (window.confirm('您确定要清空英语错题本中所有的题目吗？')) {
      setWrongList([]);
      localStorage.setItem('english-wrongs', JSON.stringify([]));
    }
  };

  const handleResetDayScore = (dayId) => {
    if (window.confirm(`您确定要清空 Day ${dayId.replace('day', '')} 的今日英语积分吗？`)) {
      const nextScores = { ...dayScores, [dayId]: 0 };
      setDayScores(nextScores);
      localStorage.setItem(`english-score-${dayId}`, '0');
    }
  };

  // 切片获取当前天数的 40 个背诵单词
  const getDayWords = (dayId) => {
    const dayNum = parseInt(dayId.replace('day', ''), 10) || 1;
    const start = (dayNum - 1) * 40;
    const end = dayNum * 40;
    return englishVocabList.slice(start, end);
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

  const currentDayData = englishDays[selectedDayId] || englishDays['day1'];
  const todayGoldCoin = dayScores[selectedDayId] !== undefined ? dayScores[selectedDayId] : 0;
  const currentDayWords = getDayWords(selectedDayId);

  return (
    <div className="app-container fade-in" style={{ display: 'flex', alignItems: 'stretch', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* 🌲 左侧二级与三级手风琴大纲树状目录 */}
      <div className="sidebar" style={{ minWidth: '280px', maxWidth: '280px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflowY: 'auto' }}>
        
        {/* 学科名片 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, hsl(var(--color-optics)), #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            英
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考英语冲刺营</h2>
            <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>30天自适应词汇特训</span>
          </div>
        </div>

        {/* 二级与三级学习目录树 (自然流动，紧密衔接) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingRight: '4px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>学习进度大纲</div>
          
          {englishBlocks.map((block) => {
            const isExpanded = expandedBlockId === block.id;
            const containsCurrent = block.days.includes(selectedDayId);
            
            return (
              <div key={block.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {/* 二级菜单：周卡片 */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: containsCurrent ? '1.5px solid rgba(168,85,247,0.3)' : '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: containsCurrent ? 'rgba(168,85,247,0.03)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onClick={() => toggleBlock(block.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '85%' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: containsCurrent ? '#7e22ce' : 'hsl(var(--text-primary))' }}>
                      {block.name.split('：')[0]}
                    </span>
                    <span style={{ fontSize: '0.64rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {block.name.split('：')[1]}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    opacity: 0.5
                  }}>
                    ▶
                  </span>
                </button>

                {/* 三级菜单：当天子天数列表 */}
                {isExpanded && (
                  <div style={{
                    paddingLeft: '10px',
                    borderLeft: '1.5px dashed rgba(168, 85, 247, 0.15)',
                    marginLeft: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '2px',
                    marginBottom: '4px'
                  }}>
                    {block.days.map((dayId) => {
                      const dayData = englishDays[dayId];
                      const isSelected = selectedDayId === dayId;
                      const score = dayScores[dayId] || 0;
                      const isPassed = score > 0;

                      let itemBg = 'transparent';
                      let itemColor = 'hsl(var(--text-secondary))';
                      let fontW = 'normal';

                      if (isSelected) {
                        itemBg = 'linear-gradient(135deg, #a855f7, #8b5cf6)';
                        itemColor = '#ffffff';
                        fontW = 'bold';
                      }

                      return (
                        <button
                          key={dayId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: 'none',
                            background: itemBg,
                            color: itemColor,
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: fontW,
                            textAlign: 'left',
                            transition: 'all 0.15s ease'
                          }}
                          onClick={() => {
                            setSelectedDayId(dayId);
                            if (activeTab === 'wrongbook') {
                              setActiveTab('study');
                            }
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '80%' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              {isPassed ? '✅' : '⚪'} Day {dayId.replace('day', '')}
                            </span>
                            <span style={{ fontSize: '0.64rem', opacity: isSelected ? 0.95 : 0.6, paddingLeft: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {dayData?.name.split('：')[1]}
                            </span>
                          </div>
                          {score !== 0 && (
                            <span style={{ fontSize: '0.64rem', opacity: isSelected ? 0.9 : 0.5, fontFamily: 'monospace' }}>
                              {score > 0 ? `+${score}🪙` : `${score}🪙`}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 全局学科工具挪到下方固定 (错题本与账单) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', marginTop: '2px' }}>
          <button
            className={`btn btn-secondary ${activeTab === 'wrongbook' ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: activeTab === 'wrongbook' ? '#a855f7' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.78rem',
              padding: '8px 12px',
              position: 'relative'
            }}
            onClick={() => setActiveTab('wrongbook')}
          >
            ❌ 英语错题重温本
            {wrongList.length > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--color-danger))',
                color: activeTab === 'wrongbook' ? '#a855f7' : '#fff',
                fontSize: '0.68rem',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '8px'
              }}>
                {wrongList.length}
              </span>
            )}
          </button>

          <button
            className="btn btn-secondary scale-up"
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: 'rgba(168, 85, 247, 0.04)',
              color: '#7e22ce',
              fontSize: '0.78rem',
              padding: '8px 12px',
              fontWeight: 'bold'
            }}
            onClick={() => setShowBillModal(true)}
          >
            📊 30天历史金币账单
          </button>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, padding: 0, overflowY: 'auto' }}>
        
        {/* 📘 右侧顶部横向三合一特训功能卡 */}
        {activeTab !== 'wrongbook' && (
          <div className="glass-card" style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${activeTab === 'study' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('study')}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'study' ? '#a855f7' : '',
                  borderColor: activeTab === 'study' ? '#a855f7' : ''
                }}
              >
                📖 今日名师讲义
              </button>
              <button
                className={`btn ${activeTab === 'test' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('test');
                  if (!testQuestions.length || testSubmitted) {
                    handleStartTest();
                  }
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'test' ? '#a855f7' : '',
                  borderColor: activeTab === 'test' ? '#a855f7' : ''
                }}
              >
                ✍️ 20题过关小测
              </button>
              <button
                className={`btn ${activeTab === 'exercise' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('exercise')}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'exercise' ? '#a855f7' : '',
                  borderColor: activeTab === 'exercise' ? '#a855f7' : ''
                }}
              >
                📝 100题每日狂练
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(168,85,247,0.06)',
                color: '#7e22ce',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                🗓️ Day {selectedDayId.replace('day', '')} · {currentDayData?.name.split('：')[1]}
              </span>
              {activeTab !== 'study' && (activeTab !== 'test' || testScore !== null) && (
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #fde68a'
                }}>
                  🪙 今日积分：{todayGoldCoin} 金币
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: 讲义与单词发音卡 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, height: '0', minHeight: '0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '12px', flex: 1, minHeight: '0', alignItems: 'stretch' }}>
              
              {/* 左栏：语法精讲 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: '#a855f7', borderBottom: '2px solid rgba(168,85,247,0.06)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📖 语法课大纲 ({currentDayData?.name})</span>
                  <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>冲刺课: 1.0小时/天</span>
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {parseSummary(currentDayData?.summary)}
                </div>
              </div>

              {/* 右栏：今日必背40词 (带发音朗读与自适应筛词) */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 4px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>🔊 今日必背词汇 (40 个 / 1200)</span>
                  <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>点击喇叭朗读发音</span>
                </h3>
                
                {/* 智能筛词天平状态条 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  border: '1px solid #edf2f7',
                  marginBottom: '10px'
                }}>
                  <span style={{ color: 'hsl(var(--color-success))', fontWeight: 'bold' }}>
                    ⚔️ 今日已熟记(已斩)：{currentDayWords.filter(w => masteredWords.includes(w.word)).length} / 40
                  </span>
                  <span style={{ color: '#ec4899', fontWeight: 'bold' }}>
                    ⭐ 今日重点生词：{currentDayWords.filter(w => unfamiliarWords.includes(w.word)).length} / 40
                  </span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                  {currentDayWords.map((item, idx) => {
                    const isMastered = masteredWords.includes(item.word);
                    const isUnfamiliar = unfamiliarWords.includes(item.word);

                    let cardBg = '#f8fafc';
                    let cardBorder = '1px solid #edf2f7';
                    let cardOpacity = 1;
                    let cardGlow = 'none';

                    if (isMastered) {
                      cardBg = '#f1f5f9';
                      cardBorder = '1px solid #e2e8f0';
                      cardOpacity = 0.55;
                    } else if (isUnfamiliar) {
                      cardBg = 'linear-gradient(135deg, #fffdfa 0%, #fff5f5 100%)';
                      cardBorder = '1.5px solid #f472b6';
                      cardGlow = '0 2px 10px rgba(244,114,182,0.1)';
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '14px',
                          border: cardBorder,
                          borderRadius: '10px',
                          backgroundColor: cardBg,
                          opacity: cardOpacity,
                          boxShadow: cardGlow,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          transition: 'all 0.22s ease',
                          position: 'relative'
                        }}
                        className="scale-up"
                      >
                        {/* 状态徽标 */}
                        {isMastered && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '110px',
                            backgroundColor: 'rgba(16,185,129,0.1)',
                            color: 'hsl(var(--color-success))',
                            fontSize: '0.64rem',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            ⚔️ 已熟记斩词
                          </span>
                        )}
                        {isUnfamiliar && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '110px',
                            backgroundColor: '#fce7f3',
                            color: '#db2777',
                            fontSize: '0.64rem',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            ⭐ 重点练习
                          </span>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.74rem', color: '#a855f7', fontWeight: 'bold' }}>#{idx + 1}</span>
                            <span style={{
                              fontSize: '1.05rem',
                              fontWeight: 'bold',
                              color: 'hsl(var(--text-primary))',
                              textDecoration: isMastered ? 'line-through' : 'none'
                            }}>
                              {item.word}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', fontFamily: 'monospace' }}>{item.phonetic}</span>
                          </div>

                          {/* 精美小按钮排组 */}
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              style={{
                                border: 'none',
                                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                                color: 'hsl(var(--color-optics))',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                              title="听发音"
                              onClick={() => speakText(item.word)}
                            >
                              🔊 读音
                            </button>
                            <button
                              style={{
                                border: 'none',
                                backgroundColor: isMastered ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.06)',
                                color: isMastered ? '#047857' : 'hsl(var(--color-success))',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                fontWeight: isMastered ? 'bold' : 'normal'
                              }}
                              title={isMastered ? "已斩此词，点击撤销" : "已掌握此词，做题时将被斩掉并奖励1金币"}
                              onClick={() => toggleMastered(item.word)}
                            >
                              ⚔️ {isMastered ? '已斩' : '熟记'}
                            </button>
                            <button
                              style={{
                                border: 'none',
                                backgroundColor: isUnfamiliar ? 'rgba(236,72,153,0.2)' : 'rgba(236,72,153,0.06)',
                                color: isUnfamiliar ? '#be185d' : '#ec4899',
                                borderRadius: '4px',
                                padding: '4px 6px',
                                fontSize: '0.74rem',
                                cursor: 'pointer',
                                fontWeight: isUnfamiliar ? 'bold' : 'normal'
                              }}
                              title={isUnfamiliar ? "已加入生词本，点击撤销" : "标记为不熟悉生词，考试时优先出此题"}
                              onClick={() => toggleUnfamiliar(item.word)}
                            >
                              ⭐ {isUnfamiliar ? '不熟' : '生词'}
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.84rem', color: 'hsl(var(--text-primary))', fontWeight: '500' }}>
                          中文：{item.translation}
                        </div>

                        <div style={{ fontSize: '0.76rem', color: '#b45309', backgroundColor: '#fffbeb', padding: '6px 10px', borderRadius: '4px', borderLeft: '3px solid #f59e0b' }}>
                          💡 <b>助记捷径：</b>{item.tip}
                        </div>

                        <div style={{
                          fontSize: '0.8rem',
                          backgroundColor: '#ffffff',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid rgba(0,0,0,0.02)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div style={{ paddingRight: '8px' }}>
                            <div style={{ fontStyle: 'italic', color: '#4a5568' }}>“ {item.sentence} ”</div>
                            <div style={{ fontSize: '0.74rem', color: '#718096', marginTop: '2px' }}>{item.sentence_translation}</div>
                          </div>
                          <button
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#718096',
                              fontSize: '0.85rem',
                              cursor: 'pointer'
                            }}
                            title="听例句发音"
                            onClick={() => speakText(item.sentence)}
                          >
                            🗣️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* 今日小测引导 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(59, 130, 246, 0.05))',
              border: '1px solid rgba(168, 85, 247, 0.12)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>
                  🇬🇧 今天的词汇与时态听懂了吗？
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  做对一个<b>加1金币</b>，做错扣1金币，今日小测完可查询总金币。
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
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
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    🇬🇧 开启：Day {selectedDayId.replace('day', '')} 英语小测
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                    测验包含 20 道当天词汇拼写与时态填空。做对一道<b>+1金币</b>，做错一道<b>-1金币</b>，防止分心小测后结算。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }} onClick={handleStartTest}>
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
                  <div style={{ width: `${((currentTestIndex + 1) / 20) * 100}%`, height: '100%', backgroundColor: '#a855f7', transition: 'width 0.3s ease' }}></div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                  Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testQuestions[currentTestIndex]?.options.map((opt, oIdx) => {
                    let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                    if (selectedTestOpt === oIdx) {
                      btnStyle = { border: '1px solid #a855f7', backgroundColor: 'rgba(168,85,247,0.08)', color: '#a855f7' };
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
                      {selectedTestOpt === testQuestions[currentTestIndex].answer ? '✅ 算对啦！ +1 金币' : '❌ 算错了。 扣减 1 金币。请看解析：'}
                    </div>
                    {testQuestions[currentTestIndex].explanation}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  {!testChecked ? (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }} disabled={selectedTestOpt === null} onClick={handleTestSubmit}>
                      提交答案
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }} onClick={handleNextTest}>
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
                    {testScore >= 80 ? '🎉 达到 80 分中考目标！太出色了！' : '💪 还没达到 80 分，继续加油！'}
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
                  backgroundColor: 'rgba(168, 85, 247, 0.04)',
                  border: '1px solid rgba(168, 85, 247, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'hsl(var(--text-primary))',
                  lineHeight: '1.6',
                  maxWidth: '440px',
                  textAlign: 'left'
                }}>
                  💡 <b>提分秘籍提示：</b> 恭喜你完成了今天的过关测试！别忘了，每天还有 <b>100 道专项英语题库</b> 供你狂练。挑战它们不仅能帮你稳固薄弱环节，还能<b>获得更多金币</b>哦！
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.74rem',
                        fontWeight: 'bold',
                        backgroundColor: '#a855f7',
                        borderColor: '#a855f7'
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
                  <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }} onClick={handleStartTest}>
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
                        <span className="badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#7e22ce', fontWeight: 'bold' }}>
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
                        style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                        disabled={currentExerciseIndex === 99}
                        onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成今日 100 题英语特训库...</div>
                )}
              </div>

              {/* 右栏：100题进度网格 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 100题英语特训卡</span>
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
                      borderStyle = '2px solid #a855f7';
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

        {/* Tab 4: 英语错题本 */}
        {activeTab === 'wrongbook' && (
          <WrongBook
            wrongList={wrongList}
            onRemoveWrong={handleRemoveWrong}
            onClearAll={handleClearAllWrongs}
            subject="english"
          />
        )}
      </div>

      {/* 📊 30天积分兑奖荣誉账单 Modal */}
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
            maxWidth: '560px',
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#7e22ce' }}>🪙 30天英语特训荣誉账单</h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                onClick={() => setShowBillModal(false)}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              提示：每天金币分值等于<b>【做对题目数 &times; 1 + 做错题目数 &times; -1】</b>。家长可在此随时核对 30 天的打卡成绩。
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '6px'
            }}>
              {Array.from({ length: 30 }).map((_, idx) => {
                const dayId = `day${idx + 1}`;
                const score = dayScores[dayId] !== undefined ? dayScores[dayId] : 0;
                const isSelected = selectedDayId === dayId;

                let scoreColor = '#718096';
                let cellBg = '#f8fafc';
                let border = '1px solid #e2e8f0';

                if (score > 0) {
                  scoreColor = '#7e22ce';
                  cellBg = '#faf5ff';
                  border = '1px solid #e9d5ff';
                } else if (score < 0) {
                  scoreColor = 'hsl(var(--color-danger))';
                  cellBg = 'hsla(var(--color-danger)/0.02)';
                  border = '1px solid hsla(var(--color-danger)/0.1)';
                }

                if (isSelected) {
                  border = '2px solid #a855f7';
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
                style={{ padding: '8px 20px', fontSize: '0.8rem', backgroundColor: '#a855f7', borderColor: '#a855f7' }}
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
