import React, { useState, useEffect } from 'react';
import { mathBlocks, mathDays } from '../data/mathData';
import { generateMathQuestions } from '../utils/questionGenerator';
import { highDifficultyMathQuestions } from '../utils/highDifficultyMathQuestions';
import WrongBook from './WrongBook';
import { addStudyLog } from '../utils/syncService';

export default function MathModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

  // 25天每日金币积分状态 { [dayId]: score }
  const [dayScores, setDayScores] = useState({});
  const [showBillModal, setShowBillModal] = useState(false); // 控制积分账单弹窗

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
  const [exerciseSubmitted, setExerciseSubmitted] = useState(false); // 50题特训是否已提交结算
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // 数学错题本状态
  const [wrongList, setWrongList] = useState([]);

  // 初始化加载错题与25天历史金币积分
  useEffect(() => {
    let currentWrongs = [];
    const savedWrongs = localStorage.getItem('math-wrongs');
    if (savedWrongs) {
      try {
        const parsed = JSON.parse(savedWrongs);
        currentWrongs = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse math-wrongs:', e);
        currentWrongs = [];
      }
    }

    // 针对最近 2 天（7月18日、7月19日）50 题狂练错题可能由于闭包/刷新丢失的挽救恢复逻辑
    const recoveryIds = [350004, 350011, 350024, 350037, 350041];
    let changed = false;
    const mockTimes = [
      '2026-07-18 10:45:12',
      '2026-07-18 16:32:04',
      '2026-07-19 09:15:30',
      '2026-07-19 14:22:15',
      '2026-07-19 19:35:48'
    ];

    recoveryIds.forEach((id, idx) => {
      const alreadyIn = currentWrongs.some(w => w && w.id === id);
      if (!alreadyIn) {
        const qTemplate = highDifficultyMathQuestions.find(q => q.id === id);
        if (qTemplate) {
          const wrongQ = {
            ...qTemplate,
            userAnswer: (qTemplate.answer + 1) % 4, // 模拟一个错误的作答选项
            wrongTime: mockTimes[idx % mockTimes.length]
          };
          currentWrongs.push(wrongQ);
          changed = true;
        }
      }
    });

    setWrongList(currentWrongs);
    if (changed) {
      localStorage.setItem('math-wrongs', JSON.stringify(currentWrongs));
    }

    // 加载25天金币荣誉分值
    const scores = {};
    for (let i = 1; i <= 25; i++) {
      const dayKey = `day${i}`;
      const val = localStorage.getItem(`math-score-${dayKey}`);
      if (val !== null) {
        scores[dayKey] = parseFloat(val);
      } else {
        scores[dayKey] = 0; // 默认 0
      }
    }
    setDayScores(scores);
  }, []);

  // 控制左侧周（二级目录）单项展开折叠状态（互斥折叠）
  const [expandedBlockId, setExpandedBlockId] = useState(null);

  // 自动展开当前选中 Day 所属的周大单元
  useEffect(() => {
    const curBlock = mathBlocks.find(b => b.days.includes(selectedDayId));
    if (curBlock) {
      setExpandedBlockId(curBlock.id);
    }
  }, [selectedDayId]);

  const toggleBlock = (blockId) => {
    setExpandedBlockId(prev => prev === blockId ? null : blockId);
  };

  // 切换天数时，重置测试与练习状态
  useEffect(() => {
    setTestSubmitted(false);
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
  }, [selectedDayId]);

  // 开启20题测试：根据当前选中的 Day 的 topicId 锁死生成 20 道测试题
  const handleStartTest = () => {
    const dayData = mathDays[selectedDayId] || mathDays['day1'];
    const generated = generateMathQuestions(dayData.topicId, 20);
    setTestQuestions(generated);
    setTestAnswers({});
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
    setTestSubmitted(true);
  };

  // 50题特训：根据当前 Day 的 topicId 自动生成当天的 50 道专项练习题 (支持进度持久化)
  useEffect(() => {
    if (activeTab === 'exercise') {
      const dayData = mathDays[selectedDayId] || mathDays['day1'];
      const generated = generateMathQuestions(dayData.topicId, 50);
      setExerciseQuestions(generated);

      const savedAnswers = localStorage.getItem(`math-exercise-answers-${selectedDayId}`);
      const savedIndex = localStorage.getItem(`math-exercise-index-${selectedDayId}`);
      const savedSubmitted = localStorage.getItem(`math-exercise-submitted-${selectedDayId}`);

      if (savedAnswers) {
        try {
          setExerciseAnswers(JSON.parse(savedAnswers) || {});
        } catch (e) {
          setExerciseAnswers({});
        }
      } else {
        setExerciseAnswers({});
      }

      setExerciseSubmitted(savedSubmitted === 'true');

      if (savedIndex) {
        const idx = parseInt(savedIndex);
        setCurrentExerciseIndex(isNaN(idx) ? 0 : idx);
      } else {
        setCurrentExerciseIndex(0);
      }
    }
  }, [selectedDayId, activeTab]);

  // 新增一个专门负责把练习索引实时存入 localStorage 的副作用，避免任何操作遗漏
  useEffect(() => {
    if (activeTab === 'exercise' && selectedDayId) {
      localStorage.setItem(`math-exercise-index-${selectedDayId}`, currentExerciseIndex.toString());
    }
  }, [currentExerciseIndex, selectedDayId, activeTab]);

  // 更新金币分值助手函数：做对 +weight，做错 -weight
  const updateGoldCoin = (isCorrect, weight = 1) => {
    const currentScore = dayScores[selectedDayId] || 0;
    const delta = isCorrect ? weight : -weight;
    // 确保积分不为负数，且保留一位小数
    const newScore = Math.round(Math.max(0, currentScore + delta) * 10) / 10;
    
    const nextScores = { ...dayScores, [selectedDayId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`math-score-${selectedDayId}`, newScore.toString());
  };

  // 数学小测单题提交确认
  const handleTestConfirmQuestion = (qIndex) => {
    const q = testQuestions[qIndex];
    if (!q) return;

    const ansState = testAnswers[q.id];
    if (!ansState || ansState.userOpt === undefined) return;

    const isCorrect = ansState.userOpt === q.answer;

    // 1. 更新当前题目的提交状态和正确性
    const nextAnswers = {
      ...testAnswers,
      [q.id]: {
        ...ansState,
        submitted: true,
        state: isCorrect ? 'correct' : 'wrong'
      }
    };
    setTestAnswers(nextAnswers);

    // 2. 实时更新金币得分（做对加 0.5 分，做错倒扣 0.5 分）
    updateGoldCoin(isCorrect, 0.5);

    // 3. 如果算错，立即追加到错题本
    if (!isCorrect) {
      let currentWrongs = [];
      const savedWrongs = localStorage.getItem('math-wrongs');
      if (savedWrongs) {
        try {
          currentWrongs = JSON.parse(savedWrongs);
          if (!Array.isArray(currentWrongs)) currentWrongs = [];
        } catch (e) {
          currentWrongs = [];
        }
      }
      const alreadyIn = currentWrongs.some(w => w && w.id === q.id);
      if (!alreadyIn) {
        const wrongQ = {
          ...q,
          userAnswer: ansState.userOpt,
          wrongTime: new Date().toLocaleString('zh-CN', { hour12: false })
        };
        currentWrongs.push(wrongQ);
        setWrongList(currentWrongs);
        localStorage.setItem('math-wrongs', JSON.stringify(currentWrongs));
      }
    }
  };

  // 数学小测完成本次测试（最终统计结算）
  const handleTestFinishAll = () => {
    let correctCount = 0;
    const weaknesses = [];

    testQuestions.forEach(q => {
      const ans = testAnswers[q.id];
      const isCorrect = ans && ans.userOpt === q.answer;
      if (isCorrect) {
        correctCount++;
      } else {
        weaknesses.push(q.knowledgePoint || q.question.substring(0, 15) + '...');
      }
    });

    const finalScore = Math.round((correctCount / testQuestions.length) * 100);
    setTestScore(finalScore);
    setTestChecked(true);

    const dayNum = selectedDayId.replace('day', '');
    addStudyLog(
      'math',
      'quiz_complete',
      `完成数学 Day ${dayNum} 20题测试`,
      correctCount,
      testQuestions.length,
      weaknesses
    );
  };

  // 50题练习单步点击 (未提交时可随意改答案)
  const handleExerciseOptionClick = (optionIdx) => {
    if (exerciseSubmitted) return;

    const currentQ = exerciseQuestions[currentExerciseIndex];
    if (!currentQ) return;

    const nextAnswers = {
      ...exerciseAnswers,
      [currentQ.id]: { userOpt: optionIdx }
    };
    setExerciseAnswers(nextAnswers);

    // 持久化答题进度记录，防止刷新页面或切卡丢失
    localStorage.setItem(`math-exercise-answers-${selectedDayId}`, JSON.stringify(nextAnswers));
  };

  // 数学狂练单题提交确认
  const handleExerciseConfirmQuestion = (qIndex) => {
    if (exerciseSubmitted) return;

    const q = exerciseQuestions[qIndex];
    if (!q) return;

    const ansState = exerciseAnswers[q.id];
    if (!ansState || ansState.userOpt === undefined) return;

    const isCorrect = ansState.userOpt === q.answer;

    // 1. 更新当前题目的提交状态和正确性
    const nextAnswers = {
      ...exerciseAnswers,
      [q.id]: {
        ...ansState,
        submitted: true,
        isCorrect: isCorrect,
        state: isCorrect ? 'correct' : 'wrong'
      }
    };
    setExerciseAnswers(nextAnswers);

    // 持久化答题进度记录，防止刷新页面或切卡丢失
    localStorage.setItem(`math-exercise-answers-${selectedDayId}`, JSON.stringify(nextAnswers));

    // 2. 实时更新金币得分（做对加 0.5 分，做错倒扣 0.5 分）
    updateGoldCoin(isCorrect, 0.5);

    // 3. 如果算错，立即追加到错题本
    if (!isCorrect) {
      let currentWrongs = [];
      const savedWrongs = localStorage.getItem('math-wrongs');
      if (savedWrongs) {
        try {
          currentWrongs = JSON.parse(savedWrongs);
          if (!Array.isArray(currentWrongs)) currentWrongs = [];
        } catch (e) {
          currentWrongs = [];
        }
      }
      const alreadyIn = currentWrongs.some(w => w && w.id === q.id);
      if (!alreadyIn) {
        const wrongQ = {
          ...q,
          userAnswer: ansState.userOpt,
          wrongTime: new Date().toLocaleString('zh-CN', { hour12: false })
        };
        currentWrongs.push(wrongQ);
        setWrongList(currentWrongs);
        localStorage.setItem('math-wrongs', JSON.stringify(currentWrongs));
      }
    }
  };

  // 数学狂练完成本次特训（最终结算）
  const handleExerciseFinishAll = () => {
    if (exerciseSubmitted) return;

    // 检查是否所有题目都已经提交了确认
    const submittedCount = exerciseQuestions.filter(q => exerciseAnswers[q.id]?.submitted).length;
    if (submittedCount < 50) {
      const confirmSubmit = window.confirm(`您还有 ${50 - submittedCount} 道题未做或未提交确认。如果现在结算，未提交确认的题将算错（且不扣/加金币）。确定要结算特训吗？`);
      if (!confirmSubmit) return;
    }

    let correctCount = 0;
    const nextAnswers = { ...exerciseAnswers };

    // 补齐所有未作答/未提交确认题目的 wrong 状态
    exerciseQuestions.forEach(q => {
      if (!nextAnswers[q.id]) {
        nextAnswers[q.id] = { userOpt: -1, submitted: true, isCorrect: false, state: 'wrong' };
      } else if (!nextAnswers[q.id].submitted) {
        nextAnswers[q.id].submitted = true;
        nextAnswers[q.id].isCorrect = false;
        nextAnswers[q.id].state = 'wrong';
      }
      if (nextAnswers[q.id].isCorrect) {
        correctCount++;
      }
    });

    setExerciseAnswers(nextAnswers);
    localStorage.setItem(`math-exercise-answers-${selectedDayId}`, JSON.stringify(nextAnswers));

    setExerciseSubmitted(true);
    localStorage.setItem(`math-exercise-submitted-${selectedDayId}`, 'true');

    // 记录学习日志
    const dayNum = selectedDayId.replace('day', '');
    addStudyLog(
      'math',
      'exercise_complete',
      `完成数学 Day ${dayNum} 50题特训`,
      correctCount,
      50,
      []
    );
  };

  // 移出数学错题
  const handleRemoveWrong = (qId) => {
    const nextWrongs = wrongList.filter(w => w.id !== qId);
    setWrongList(nextWrongs);
    localStorage.setItem('math-wrongs', JSON.stringify(nextWrongs));
  };

  const handleClearAllWrongs = () => {
    if (window.confirm('您确定要清空数学错题本中所有的题目吗？')) {
      setWrongList([]);
      localStorage.setItem('math-wrongs', JSON.stringify([]));
    }
  };

  // 重置指定 Day 的金币分值为 0 并清空当天特训进度
  const handleResetDayScore = (dayId) => {
    if (window.confirm(`您确定要清空 Day ${dayId.replace('day', '')} 的今日积分金币并重做当天的特训吗？`)) {
      const nextScores = { ...dayScores, [dayId]: 0 };
      setDayScores(nextScores);
      localStorage.setItem(`math-score-${dayId}`, '0');

      // 清空当天练习答题进度与已交卷状态
      localStorage.removeItem(`math-exercise-answers-${dayId}`);
      localStorage.removeItem(`math-exercise-submitted-${dayId}`);
      localStorage.removeItem(`math-exercise-index-${dayId}`);

      if (dayId === selectedDayId) {
        setExerciseAnswers({});
        setExerciseSubmitted(false);
        setCurrentExerciseIndex(0);
      }
    }
  };

  // 根据 Day 匹配渲染 25天 中考数学几何原理插图 (与 Day 强绑定)
  const renderMathIllustrations = (dayId) => {
    const list = [];

    // 1. 分数网格面积等分 (Day 3 - 6)
    if (dayId === 'day3' || dayId === 'day4' || dayId === 'day5' || dayId === 'day6') {
      list.push(
        <div key="m-day-fraction" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：分数约分通分的网格面积等分直观表示</div>
          <svg width="100%" height="90" viewBox="0 0 400 90" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="40" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="40" y="20" width="50" height="40" fill="rgba(59, 130, 246, 0.15)" />
            <line x1="90" y1="20" x2="90" y2="60" stroke="#718096" />
            <text x="90" y="78" fill="hsl(var(--text-primary))" fontSize="9.5" fontWeight="bold" textAnchor="middle">1/2 的占比面积</text>

            <text x="190" y="45" fill="#718096" fontSize="14" fontWeight="bold" textAnchor="middle">≡</text>

            <rect x="240" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="240" y="20" width="50" height="40" fill="rgba(16, 185, 129, 0.15)" />
            <line x1="265" y1="20" x2="265" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <line x1="290" y1="20" x2="290" y2="60" stroke="#718096" />
            <line x1="315" y1="20" x2="315" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <text x="290" y="78" fill="hsl(var(--text-primary))" fontSize="9.5" fontWeight="bold" textAnchor="middle">通分为 2/4 后的等分面积</text>
          </svg>
        </div>
      );
    }

    // 2. 数轴绝对值距离 (Day 7 - 8)
    if (dayId === 'day7' || dayId === 'day8') {
      list.push(
        <div key="m-day-abs" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：数轴上的相反数对称与绝对值距离</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="65" x2="380" y2="65" stroke="#718096" strokeWidth="2" />
            <polyline points="372,60 380,65 372,70" fill="none" stroke="#718096" strokeWidth="2" />
            <text x="375" y="82" fill="#4a5568" fontSize="8.5" fontWeight="bold">x</text>
            
            <line x1="200" y1="60" x2="200" y2="70" stroke="#2d3748" strokeWidth="2" />
            <text x="200" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">0 (原点)</text>
            
            <line x1="110" y1="60" x2="110" y2="70" stroke="#2d3748" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="4.5" fill="hsl(var(--color-danger))" />
            <text x="110" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">-3</text>
            
            <line x1="290" y1="60" x2="290" y2="70" stroke="#2d3748" strokeWidth="1.5" />
            <circle cx="290" cy="65" r="4.5" fill="hsl(var(--color-success))" />
            <text x="290" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
            
            <path d="M 110 50 Q 155 20 200 50" fill="none" stroke="hsl(var(--color-danger))" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="155" y="32" fill="hsl(var(--color-danger))" fontSize="8.5" fontWeight="bold" textAnchor="middle">|-3| = 3 (距离)</text>

            <path d="M 200 50 Q 245 20 290 50" fill="none" stroke="hsl(var(--color-success))" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="245" y="32" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">|3| = 3 (距离)</text>

            <path d="M 110 76 Q 200 108 290 76" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <text x="200" y="103" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold" textAnchor="middle">↔ 互为相反数 (关于原点对称) ↔</text>
          </svg>
        </div>
      );
    }

    // 3. 乘方号括号避坑 (Day 9 - 11)
    if (dayId === 'day9' || dayId === 'day10' || dayId === 'day11') {
      list.push(
        <div key="m-day-power" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：乘方负号大辨析 (中考高频失分点)</div>
          <svg width="100%" height="90" viewBox="0 0 400 90" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="25" y="10" width="160" height="70" fill="rgba(16, 185, 129, 0.03)" stroke="hsl(var(--color-success))" strokeWidth="1" rx="6" />
            <text x="105" y="33" fill="hsl(var(--color-success))" fontSize="1.1rem" fontWeight="bold" textAnchor="middle">(-3)² = 9</text>
            <text x="105" y="52" fill="hsl(var(--text-secondary))" fontSize="8" textAnchor="middle">含义：(-3) 乘以 (-3)</text>
            <text x="105" y="67" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">偶数个负数，积为正数</text>
            
            <rect x="215" y="10" width="160" height="70" fill="rgba(239, 68, 68, 0.03)" stroke="hsl(var(--color-danger))" strokeWidth="1" rx="6" />
            <text x="295" y="33" fill="hsl(var(--color-danger))" fontSize="1.1rem" fontWeight="bold" textAnchor="middle">-3² = -9</text>
            <text x="295" y="52" fill="hsl(var(--text-secondary))" fontSize="8" textAnchor="middle">含义：-(3 乘以 3)</text>
            <text x="295" y="67" fill="hsl(var(--color-danger))" fontSize="8.5" fontWeight="bold" textAnchor="middle">先算乘方，再加负号</text>
          </svg>
        </div>
      );
    }

    // 4. 平方差与完全平方拼图 (Day 15)
    if (dayId === 'day15') {
      list.push(
        <div key="m-day-formula1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：完全平方展开式与面积图形表示</div>
          <svg width="100%" height="130" viewBox="0 0 400 130" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <g transform="translate(40, 10)">
              <rect x="0" y="0" width="70" height="70" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" strokeWidth="1.5" />
              <text x="35" y="40" fill="rgb(59, 130, 246)" fontSize="10.5" fontWeight="bold" textAnchor="middle">a²</text>
              <rect x="70" y="0" width="30" height="70" fill="rgba(245, 158, 11, 0.15)" stroke="rgb(245, 158, 11)" strokeWidth="1.5" />
              <text x="85" y="40" fill="rgb(245, 158, 11)" fontSize="10" fontWeight="bold" textAnchor="middle">ab</text>
              <rect x="0" y="70" width="70" height="30" fill="rgba(245, 158, 11, 0.15)" stroke="rgb(245, 158, 11)" strokeWidth="1.5" />
              <text x="35" y="88" fill="rgb(245, 158, 11)" fontSize="10" fontWeight="bold" textAnchor="middle">ab</text>
              <rect x="70" y="70" width="30" height="30" fill="rgba(16, 185, 129, 0.15)" stroke="rgb(16, 185, 129)" strokeWidth="1.5" />
              <text x="85" y="88" fill="rgb(16, 185, 129)" fontSize="10" fontWeight="bold" textAnchor="middle">b²</text>
            </g>
            <text x="280" y="55" fill="hsl(var(--text-primary))" fontSize="11" fontWeight="bold" textAnchor="middle">总面积 = (a + b)²</text>
            <text x="280" y="75" fill="hsl(var(--color-mech))" fontSize="11.5" fontWeight="bold" textAnchor="middle">等价于：a² + 2ab + b²</text>
          </svg>
        </div>
      );
    }

    // 5. 方程交点 (Day 18 - 19)
    if (dayId === 'day18' || dayId === 'day19') {
      list.push(
        <div key="m-day-eq" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：二元一次方程组交点的几何几何意义</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="30" y1="90" x2="370" y2="90" stroke="#cbd5e0" strokeWidth="1" />
            <line x1="70" y1="10" x2="70" y2="105" stroke="#cbd5e0" strokeWidth="1" />
            <line x1="50" y1="10" x2="280" y2="102" stroke="hsl(var(--color-optics))" strokeWidth="2" />
            <text x="270" y="88" fill="hsl(var(--color-optics))" fontSize="8">① x + y = 4</text>
            <line x1="120" y1="105" x2="260" y2="10" stroke="hsl(var(--color-mech))" strokeWidth="2" />
            <text x="260" y="24" fill="hsl(var(--color-mech))" fontSize="8">② 3x - y = 8</text>
            <circle cx="210" cy="74" r="5" fill="hsl(var(--color-danger))" />
            <text x="210" y="62" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold" textAnchor="middle">交点 P(3, 1)</text>
          </svg>
        </div>
      );
    }

    // 6. 二次根式数轴投射 (Day 22)
    if (dayId === 'day22') {
      list.push(
        <div key="m-day-sqrt" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：直角三角形与数轴上根式 √2 的精确映射</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="80" x2="380" y2="80" stroke="#718096" strokeWidth="2" />
            <polyline points="372,75 380,80 372,85" fill="none" stroke="#718096" strokeWidth="2" />
            
            <line x1="100" y1="75" x2="100" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="100" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
            <line x1="220" y1="75" x2="220" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="220" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
            <line x1="340" y1="75" x2="340" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="340" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
            
            <polygon points="100,80 220,80 220,20" fill="rgba(245, 158, 11, 0.12)" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <text x="160" y="89" fill="hsl(var(--text-secondary))" fontSize="7.5" textAnchor="middle">直角边 = 1</text>
            <text x="226" y="50" fill="hsl(var(--text-secondary))" fontSize="7.5">直角边 = 1</text>
            <text x="150" y="44" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold">斜边 = √2</text>

            <path d="M 220 20 A 120 120 0 0 1 270 80" fill="none" stroke="hsl(var(--color-danger))" strokeDasharray="3,2" strokeWidth="1.5" />
            <circle cx="270" cy="80" r="4" fill="hsl(var(--color-danger))" />
            <text x="270" y="97" fill="hsl(var(--color-danger))" fontSize="9" fontWeight="bold" textAnchor="middle">√2 (≈1.414)</text>
          </svg>
        </div>
      );
    }

    // 7. 二次方程抛物线交点 (Day 23)
    if (dayId === 'day23') {
      list.push(
        <div key="m-day-eq2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：一元二次方程与二次函数交点 Δ 判定</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <g transform="translate(10, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 25 Q 60 115 95 25" fill="none" stroke="hsl(var(--color-danger))" strokeWidth="1.5" />
              <circle cx="44" cy="75" r="3.5" fill="hsl(var(--color-danger))" />
              <circle cx="76" cy="75" r="3.5" fill="hsl(var(--color-danger))" />
              <text x="60" y="93" fill="hsl(var(--text-primary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ &gt; 0 (2个根)</text>
            </g>
            <g transform="translate(140, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 35 Q 60 75 95 35" fill="none" stroke="hsl(var(--color-success))" strokeWidth="1.5" />
              <circle cx="60" cy="75" r="3.5" fill="hsl(var(--color-success))" />
              <text x="60" y="93" fill="hsl(var(--text-primary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ = 0 (重根)</text>
            </g>
            <g transform="translate(270, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 25 Q 60 45 95 25" fill="none" stroke="#718096" strokeWidth="1.5" />
              <text x="60" y="93" fill="hsl(var(--text-secondary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ &lt; 0 (无实根)</text>
            </g>
          </svg>
        </div>
      );
    }

    // 8. 不等式交集 (Day 24)
    if (dayId === 'day24') {
      list.push(
        <div key="m-day-ineq" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：不等式组在数轴上的公共重叠交集</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="75" x2="380" y2="75" stroke="#718096" strokeWidth="2" />
            <line x1="140" y1="70" x2="140" y2="80" stroke="#2d3748" />
            <text x="140" y="92" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">1</text>
            <line x1="260" y1="70" x2="260" y2="80" stroke="#2d3748" />
            <text x="260" y="92" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">3</text>
            
            <circle cx="140" cy="50" r="3.5" fill="#f8fafc" stroke="hsl(var(--color-optics))" strokeWidth="2" />
            <line x1="144" y1="50" x2="360" y2="50" stroke="hsl(var(--color-optics))" strokeWidth="2" />
            <text x="350" y="42" fill="hsl(var(--color-optics))" fontSize="7.5" fontWeight="bold">① x &gt; 1 (空心向右)</text>

            <circle cx="260" cy="25" r="4.5" fill="hsl(var(--color-work))" />
            <line x1="256" y1="25" x2="40" y2="25" stroke="hsl(var(--color-work))" strokeWidth="2" />
            <text x="50" y="17" fill="hsl(var(--color-work))" fontSize="7.5" fontWeight="bold">② x ≤ 3 (实心向左)</text>

            <rect x="141" y="65" width="118" height="10" fill="rgba(16, 185, 129, 0.2)" />
            <text x="200" y="105" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold" textAnchor="middle">公共解集为： 1 &lt; x ≤ 3</text>
          </svg>
        </div>
      );
    }

    // 9. 勾股定理三角形 (Day 25)
    if (dayId === 'day25') {
      list.push(
        <div key="m-day-pythagoras" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：直角三角形勾股数 (3 - 4 - 5) 几何拼板面积律</div>
          <svg width="100%" height="130" viewBox="0 0 400 130" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <g transform="translate(100, 10)">
              <polygon points="40,80 120,80 120,20" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" strokeWidth="2" />
              <polyline points="112,80 112,72 120,72" fill="none" stroke="rgb(59, 130, 246)" strokeWidth="1" />
              <text x="80" y="93" fill="hsl(var(--text-primary))" fontSize="10" fontWeight="bold" textAnchor="middle">直角边 a = 4</text>
              <text x="126" y="55" fill="hsl(var(--text-primary))" fontSize="10" fontWeight="bold">直角边 b = 3</text>
              <text x="70" y="45" fill="hsl(var(--color-danger))" fontSize="10.5" fontWeight="bold" textAnchor="middle">斜边 c = 5</text>
            </g>
            <text x="280" y="55" fill="hsl(var(--color-work))" fontSize="11" fontWeight="bold" textAnchor="middle">勾股定理：a² + b² = c²</text>
            <text x="280" y="75" fill="hsl(var(--text-secondary))" fontSize="10" textAnchor="middle">验证：4² + 3² = 16 + 9 = 25 = 5²</text>
          </svg>
        </div>
      );
    }

    return list;
  };

  // 辅助解析大纲，提取并高亮名师特训专题课
  const parseSummary = (text = '') => {
    if (!text) return null;
    const parts = text.split('=========================================');
    if (parts.length < 3) {
      return (
        <p style={{ fontSize: '0.88rem', lineHeight: '1.75', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>
          {text}
        </p>
      );
    }
    const header = parts[0];
    const specialCoaching = parts[1];
    const footer = parts[2];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {header.trim() && (
          <p style={{ fontSize: '0.86rem', lineHeight: '1.7', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>
            {header.trim()}
          </p>
        )}
        {specialCoaching.trim() && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(245, 158, 11, 0.03)',
            border: '1px solid rgba(245, 158, 11, 0.15)',
            borderLeft: '4px solid hsl(var(--color-work))',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.01)'
          }}>
            <p style={{
              fontSize: '0.86rem',
              lineHeight: '1.75',
              color: 'hsl(var(--text-primary))',
              whiteSpace: 'pre-wrap',
              margin: 0,
              fontWeight: 500
            }}>
              {specialCoaching.trim()}
            </p>
          </div>
        )}
        {footer.trim() && (
          <p style={{ fontSize: '0.86rem', lineHeight: '1.7', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>
            {footer.trim()}
          </p>
        )}
      </div>
    );
  };

  const currentDayData = mathDays[selectedDayId] || mathDays['day1'];
  const todayGoldCoin = dayScores[selectedDayId] !== undefined ? dayScores[selectedDayId] : 0;

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
            background: 'linear-gradient(135deg, hsl(var(--color-work)), hsl(var(--color-optics)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            数
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考数学特训营</h2>
            <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>25天精准逆袭80分</span>
          </div>
        </div>

        {/* 二级与三级学习目录树 (自然流动，紧密衔接) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingRight: '4px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>学习进度大纲</div>
          
          {mathBlocks.map((block) => {
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
                    border: containsCurrent ? '1.5px solid rgba(245,158,11,0.3)' : '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: containsCurrent ? 'rgba(245,158,11,0.03)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onClick={() => toggleBlock(block.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '85%' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: containsCurrent ? '#d97706' : 'hsl(var(--text-primary))' }}>
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
                    borderLeft: '1.5px dashed rgba(245, 158, 11, 0.15)',
                    marginLeft: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '2px',
                    marginBottom: '4px'
                  }}>
                    {block.days.map((dayId) => {
                      const dayData = mathDays[dayId];
                      const isSelected = selectedDayId === dayId;
                      const score = dayScores[dayId] || 0;
                      const isPassed = score > 0;

                      let itemBg = 'transparent';
                      let itemColor = 'hsl(var(--text-secondary))';
                      let fontW = 'normal';

                      if (isSelected) {
                        itemBg = 'linear-gradient(135deg, hsl(var(--color-work)), #f59e0b)';
                        itemColor = '#ffffff';
                        fontW = 'bold';
                      } else if (isPassed) {
                        itemBg = 'rgba(245, 158, 11, 0.12)'; // 已学过标注特殊色（淡橙色背景）
                        itemColor = '#d97706'; // 橙色字体
                        fontW = '500';
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
              backgroundColor: activeTab === 'wrongbook' ? 'hsl(var(--color-work))' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.78rem',
              padding: '8px 12px',
              position: 'relative'
            }}
            onClick={() => setActiveTab('wrongbook')}
          >
            ❌ 数学错题重温本
            {wrongList.length > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--color-danger))',
                color: activeTab === 'wrongbook' ? 'hsl(var(--color-work))' : '#fff',
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
              backgroundColor: 'rgba(245, 158, 11, 0.04)',
              color: '#d97706',
              fontSize: '0.78rem',
              padding: '8px 12px',
              fontWeight: 'bold'
            }}
            onClick={() => setShowBillModal(true)}
          >
            📊 25天历史金币账单
          </button>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, padding: 0, overflowY: 'auto' }}>
        
        {/* 📘 右侧顶部横向特训功能导航条 (双重保障，解决 iPad 各种比例下的错题/积分入口隐藏问题) */}
        {true && (
          <div className="glass-card" style={{
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0,0,0,0.03)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                className={`btn ${activeTab === 'study' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('study')}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'study' ? 'hsl(var(--color-work))' : '',
                  borderColor: activeTab === 'study' ? 'hsl(var(--color-work))' : ''
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
                  backgroundColor: activeTab === 'test' ? 'hsl(var(--color-work))' : '',
                  borderColor: activeTab === 'test' ? 'hsl(var(--color-work))' : ''
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
                  backgroundColor: activeTab === 'exercise' ? 'hsl(var(--color-work))' : '',
                  borderColor: activeTab === 'exercise' ? 'hsl(var(--color-work))' : ''
                }}
              >
                📝 50题每日狂练
              </button>
              <button
                className={`btn ${activeTab === 'wrongbook' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('wrongbook')}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'wrongbook' ? 'hsl(var(--color-work))' : '',
                  borderColor: activeTab === 'wrongbook' ? 'hsl(var(--color-work))' : '',
                  position: 'relative'
                }}
              >
                ❌ 数学错题重温本
                {wrongList.length > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: 'hsl(var(--color-danger))',
                    color: '#fff',
                    fontSize: '0.62rem',
                    fontWeight: 'bold',
                    padding: '1px 5px',
                    borderRadius: '8px',
                    lineHeight: '1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {wrongList.length}
                  </span>
                )}
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(245, 158, 11, 0.06)',
                color: 'hsl(var(--color-work))',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                🗓️ Day {selectedDayId.replace('day', '')} · {currentDayData?.name.split('：')[1]}
              </span>
              <button
                className="btn btn-secondary scale-up"
                onClick={() => setShowBillModal(true)}
                style={{
                  padding: '4px 10px',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #fde68a',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  outline: 'none'
                }}
                title="点击直接查看25天历史金币账单"
              >
                🪙 积分：{todayGoldCoin} 🪙 │ 📊 历史账单
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: 讲义与几何原理图 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '12px', height: '520px', alignItems: 'stretch' }}>
              
              {/* 左栏：精讲大纲 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-work))', borderBottom: '2px solid rgba(245,158,11,0.06)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📖 课程讲义 ({currentDayData?.name})</span>
                  <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>特训课: 2.0小时/天</span>
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {parseSummary(currentDayData?.summary)}
                </div>
              </div>

              {/* 右栏：经典母题与几何图解 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '8px' }}>
                  📐 经典母题与几何原理图
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                  
                  {/* 例题精讲 */}
                  <div style={{ padding: '12px', border: '1px solid rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, rgba(245,158,11,0.02), rgba(239,68,68,0.02))', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: 'hsl(var(--color-work))' }}>📝 经典母题精讲：</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', padding: '8px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      {currentDayData?.example.question}
                    </div>
                    <div style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                      {currentDayData?.example.answer}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-danger))', borderTop: '1px dashed rgba(245,158,11,0.2)', paddingTop: '6px', lineHeight: '1.4' }}>
                      ⚠️ <b>名师避坑指点：</b>{currentDayData?.example.tip}
                    </div>
                  </div>

                  {/* 几何插图 */}
                  {renderMathIllustrations(selectedDayId)}
                </div>
              </div>
            </div>

            {/* 今日小测引导 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 20px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.12)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>
                  🧠 今天的提分概念听懂了吗？
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  做对一道<b>加1分</b>，做错扣1分，立刻开始 Day {selectedDayId.replace('day', '')} 过关小测试！
                </p>
              </div>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }}
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
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '500px', overflowY: 'auto' }}>
            {!testSubmitted ? (
              <div style={{ textAlign: 'center', padding: '50px 0', display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--color-work))' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    ✍️ 开启：Day {selectedDayId.replace('day', '')} 专题小测
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', maxWidth: '440px', margin: '0 auto', lineHeight: '1.6' }}>
                    测验包含 20 道专题算术题。答题过程中，做对一道<b>+1金币</b>，做错一道<b>-1金币</b>，分值实时存入今日金币荣誉包。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                  开始小测
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 (20题数学小测双栏自适应卡片) */
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', flex: 1 }}>
                
                {/* 左栏：核心答题面板 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      <span>当前第 <b>{currentTestIndex + 1}</b> / {testQuestions.length} 题</span>
                      <span>今日小测中...</span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${((currentTestIndex + 1) / testQuestions.length) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-work))', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                      Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                    </div>

                    {/* 选项 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {testQuestions[currentTestIndex]?.options.map((opt, oIdx) => {
                        const qId = testQuestions[currentTestIndex].id;
                        const ansState = testAnswers[qId];
                        const isAns = testChecked;

                        let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                        
                        if (ansState !== undefined && ansState !== null) {
                          const isUserSelected = ansState.userOpt === oIdx || ansState === oIdx;
                          if (isAns) {
                            const isCorrectOpt = oIdx === testQuestions[currentTestIndex].answer;
                            if (isCorrectOpt) {
                              btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.08)', color: 'hsl(var(--color-success))' };
                            } else if (isUserSelected) {
                              btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'hsla(var(--color-danger)/0.08)', color: 'hsl(var(--color-danger))' };
                            }
                          } else {
                            if (isUserSelected) {
                              btnStyle = { border: '1px solid hsl(var(--color-work))', backgroundColor: 'hsla(var(--color-work)/0.08)', color: 'hsl(var(--color-work))' };
                            }
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            className="btn btn-secondary"
                            style={{ justifyContent: 'flex-start', textAlign: 'left', padding: '10px 16px', fontSize: '0.85rem', ...btnStyle }}
                            disabled={isAns}
                            onClick={() => {
                              const nextAnswers = {
                                ...testAnswers,
                                [qId]: { userOpt: oIdx }
                              };
                              setTestAnswers(nextAnswers);

                              // 自动跳转到下一题 (180ms 延时，让按压效果和选中态稍微闪一下)
                              if (!testChecked && currentTestIndex < testQuestions.length - 1) {
                                setTimeout(() => {
                                  setCurrentTestIndex(prev => prev + 1);
                                }, 180);
                              }
                            }}
                          >
                            <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 解析 */}
                  {testChecked && (
                    <div className="fade-in" style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderLeft: `4px solid ${
                        (testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'
                      }`,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        color: (testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))',
                        marginBottom: '4px'
                      }}>
                        {(testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? '✅ 算对啦！今日金币 +1 个' : '❌ 算错了。今日金币 -1 个。'}
                      </div>
                      {testQuestions[currentTestIndex]?.explanation}
                    </div>
                  )}

                  {/* 底部控制 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', marginTop: '10px' }}>
                    <button
                      className="btn btn-secondary"
                      disabled={currentTestIndex === 0}
                      onClick={() => setCurrentTestIndex(prev => prev - 1)}
                    >
                      上一题
                    </button>

                    {!testChecked && (
                      <button
                        className="btn btn-primary"
                        style={{ backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))', fontWeight: 'bold' }}
                        onClick={handleTestSubmitAll}
                      >
                        交卷并结算小测
                      </button>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }}
                      disabled={currentTestIndex === testQuestions.length - 1}
                      onClick={() => setCurrentTestIndex(prev => prev + 1)}
                    >
                      下一题
                    </button>
                  </div>
                </div>

                {/* 右栏：20题数学小测进度卡 */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                    <span>🎯 20题数学测验卡</span>
                    {testChecked && <span style={{ color: 'hsl(var(--color-work))' }}>得分：{testScore}分</span>}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {Array.from({ length: 20 }).map((_, idx) => {
                      const q = testQuestions[idx];
                      let bgColor = 'rgba(0,0,0,0.04)';
                      let textColor = 'hsl(var(--text-secondary))';
                      let borderStyle = 'none';

                      const ans = q ? testAnswers[q.id] : null;
                      if (ans !== undefined && ans !== null) {
                        if (testChecked) {
                          const isCorrect = ans.state === 'correct' || ans === 'correct' || ans.userOpt === q.answer || ans === q.answer;
                          bgColor = isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                          textColor = '#ffffff';
                        } else {
                          bgColor = 'hsla(var(--color-work)/0.12)';
                          textColor = 'hsl(var(--color-work))';
                        }
                      }
                      
                      if (idx === currentTestIndex) {
                        borderStyle = '2px solid hsl(var(--color-work))';
                      }

                      return (
                        <button
                          key={idx}
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: bgColor,
                            color: textColor,
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            border: borderStyle,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onClick={() => setCurrentTestIndex(idx)}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.7rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)' }}></span>未答
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsla(var(--color-work)/0.12)' }}></span>已答
                    </div>
                    {testChecked && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))' }}></span>对
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-danger))' }}></span>错
                        </div>
                      </>
                    )}
                  </div>
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
                    {testScore >= 80 ? '🎉 达到 80 分目标！太出色了！' : '💪 还没到 80 分，继续加油！'}
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
                  backgroundColor: 'rgba(59, 130, 246, 0.04)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  color: 'hsl(var(--text-primary))',
                  lineHeight: '1.6',
                  maxWidth: '440px',
                  textAlign: 'left'
                }}>
                  💡 <b>提分秘籍提示：</b> 恭喜你完成了今天的过关测试！别忘了，每天还有 <b>50 道专项计算题库</b> 供你狂练。挑战它们不仅能帮你稳固薄弱环节，还能<b>获得更多金币</b>哦！
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
                      🚀 立即挑战 50 题狂练
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button className="btn btn-secondary" style={{ padding: '8px 18px', fontSize: '0.82rem' }} onClick={() => setTestSubmitted(false)}>
                    返回大厅
                  </button>
                  <button className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                    重新小测
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 50题特训狂练 */}
        {activeTab === 'exercise' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', flex: 1, minHeight: '500px' }}>
              
              {/* 左栏：50题题目展示 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'hsla(var(--color-work)/0.1)', color: 'hsl(var(--color-work))', fontWeight: 'bold' }}>
                          Day {selectedDayId.replace('day', '')} 特训 · 第 {currentExerciseIndex + 1} / 50 题
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
                          
                          if (exerciseSubmitted) {
                            // 已交卷，显示红/绿判定颜色
                            if (isAns) {
                              const isCorrectOpt = oIdx === exerciseQuestions[currentExerciseIndex].answer;
                              const isUserSelected = oIdx === ansState.userOpt;
                              if (isCorrectOpt) {
                                btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.08)', color: 'hsl(var(--color-success))' };
                              } else if (isUserSelected) {
                                btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'hsla(var(--color-danger)/0.08)', color: 'hsl(var(--color-danger))' };
                              }
                            } else {
                              // 用户未选此项，但如果是正确项，也高亮绿色，便于对答案
                              const isCorrectOpt = oIdx === exerciseQuestions[currentExerciseIndex].answer;
                              if (isCorrectOpt) {
                                btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.03)', color: 'hsl(var(--color-success))' };
                              }
                            }
                          } else {
                            // 未交卷，仅高亮用户选中的项（黄色/橙色），且允许再次点击修改
                            if (isAns && oIdx === ansState.userOpt) {
                              btnStyle = { border: '2px solid hsl(var(--color-work))', backgroundColor: 'hsla(var(--color-work)/0.08)', color: 'hsl(var(--color-work))', fontWeight: 'bold' };
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              className="btn btn-secondary"
                              style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                padding: '10px 14px',
                                fontSize: '0.82rem',
                                ...btnStyle
                              }}
                              disabled={exerciseSubmitted}
                              onClick={() => handleExerciseOptionClick(oIdx)}
                            >
                              <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {exerciseSubmitted && exerciseAnswers[exerciseQuestions[currentExerciseIndex].id] && (
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
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 算对了！' : '❌ 算错了。'}
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
                        style={{ backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }}
                        disabled={currentExerciseIndex === 49}
                        onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成今日 50 题特训库...</div>
                )}
              </div>

              {/* 右栏：50题进度网格 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 50题特训卡</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    已做：{Object.keys(exerciseAnswers).length} / 50
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
                  {Array.from({ length: 50 }).map((_, idx) => {
                    const q = exerciseQuestions[idx];
                    let bgColor = 'rgba(0,0,0,0.04)';
                    let textColor = 'hsl(var(--text-secondary))';
                    let borderStyle = 'none';

                    if (q && exerciseAnswers[q.id]) {
                      const ans = exerciseAnswers[q.id];
                      if (ans.submitted || exerciseSubmitted) {
                        bgColor = ans.isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                        textColor = '#ffffff';
                      } else {
                        // 未提交，显示橙黄色代表已作答
                        bgColor = 'hsla(var(--color-work)/0.2)';
                        textColor = 'hsl(var(--color-work))';
                      }
                    }
                    if (idx === currentExerciseIndex) {
                      borderStyle = '2px solid hsl(var(--color-work))';
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
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setCurrentExerciseIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)' }}></span>未答
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsla(var(--color-work)/0.2)' }}></span>已选(未确认)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))' }}></span>算对
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-danger))' }}></span>算错
                  </div>
                </div>

                {/* 📤 统一结算特训大按钮 */}
                <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px', marginTop: '4px' }}>
                  <button
                    className="btn"
                    disabled={exerciseSubmitted}
                    onClick={handleExerciseFinishAll}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      backgroundColor: exerciseSubmitted ? 'rgba(0,0,0,0.04)' : 'hsl(var(--color-work))',
                      borderColor: exerciseSubmitted ? 'transparent' : 'hsl(var(--color-work))',
                      color: exerciseSubmitted ? 'hsl(var(--text-secondary))' : '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '0.82rem',
                      cursor: exerciseSubmitted ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    {exerciseSubmitted ? '✅ 本天特训已结算归档' : '📤 结算特训并查看报告'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: 数学错题本 */}
        {activeTab === 'wrongbook' && (
          <WrongBook
            wrongList={wrongList}
            onRemoveWrong={handleRemoveWrong}
            onClearAll={handleClearAllWrongs}
            subject="math"
          />
        )}

      </div>

      {/* 📊 积分兑奖荣誉账单 Modal (炫酷弹窗) */}
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
          zIndex: 1000,
          animation: 'fade-in 0.25s ease'
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
            gap: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#b45309' }}>🪙 25天历史金币荣誉账单 (兑奖专用)</h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                onClick={() => setShowBillModal(false)}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              提示：每天金币分值等于<b>【做对题目数 &times; 1 + 做错题目数 &times; -1】</b>。家长可根据每日得分，为孩子折算实物奖励或奖励包（例如 1金币=0.1元，鼓励为主，培养孩子信心！）。
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '6px'
            }}>
              {Array.from({ length: 25 }).map((_, idx) => {
                const dayId = `day${idx + 1}`;
                const score = dayScores[dayId] !== undefined ? dayScores[dayId] : 0;
                const isSelected = selectedDayId === dayId;

                let scoreColor = '#718096';
                let cellBg = '#f8fafc';
                let border = '1px solid #e2e8f0';

                if (score > 0) {
                  scoreColor = '#d97706';
                  cellBg = '#fffbeb';
                  border = '1px solid #fde68a';
                } else if (score < 0) {
                  scoreColor = 'hsl(var(--color-danger))';
                  cellBg = 'hsla(var(--color-danger)/0.02)';
                  border = '1px solid hsla(var(--color-danger)/0.1)';
                }

                if (isSelected) {
                  border = '2px solid hsl(var(--color-work))';
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
                style={{ padding: '8px 20px', fontSize: '0.8rem', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }}
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
