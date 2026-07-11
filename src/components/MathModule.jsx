import React, { useState, useEffect } from 'react';
import { mathBlocks, mathDays } from '../data/mathData';
import { generateMathQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';

export default function MathModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

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

  // 数学错题本状态
  const [wrongList, setWrongList] = useState([]);

  // 初始化加载错题
  useEffect(() => {
    const savedWrongs = localStorage.getItem('math-wrongs');
    if (savedWrongs) setWrongList(JSON.parse(savedWrongs));
  }, []);

  // 切换天数时，重置测试与练习状态
  useEffect(() => {
    setTestSubmitted(false);
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
  }, [selectedDayId]);

  // 开启20题测试：根据当前Day的topicId锁死生成20道题
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

  // 100题特训：切换Day时，自适应生成当天专题的100道计算题
  useEffect(() => {
    if (activeTab === 'exercise') {
      const dayData = mathDays[selectedDayId] || mathDays['day1'];
      const generated = generateMathQuestions(dayData.topicId, 100);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedDayId, activeTab]);

  // 20题测试单步提交
  const handleTestSubmit = () => {
    if (selectedTestOpt === null) return;
    const currentQ = testQuestions[currentTestIndex];
    const isCorrect = selectedTestOpt === currentQ.answer;

    const nextAnswers = { ...testAnswers, [currentQ.id]: selectedTestOpt };
    setTestAnswers(nextAnswers);

    // 做错自动收录到数学错题本
    if (!isCorrect) {
      const alreadyIn = wrongList.some(w => w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = { ...currentQ, userAnswer: selectedTestOpt };
        const nextWrongs = [...wrongList, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('math-wrongs', JSON.stringify(nextWrongs));
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
      // 答完最后一题结算分数
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

    // 做错自动收录到数学错题本
    if (!isCorrect) {
      const alreadyIn = wrongList.some(w => w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = { ...currentQ, userAnswer: optionIdx };
        const nextWrongs = [...wrongList, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('math-wrongs', JSON.stringify(nextWrongs));
      }
    }
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

  // 根据 Day 匹配渲染 9 大核心 SVG 几何原理插图 (与 Day 强绑定)
  const renderMathIllustrations = (dayId) => {
    const list = [];

    // 分数绝对值 (Day 1 - 7 关联绝对值)
    if (dayId === 'day7' || dayId === 'day6') {
      list.push(
        <div key="m-day7" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：数轴、相反数与绝对值的几何意义</div>
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
            <text x="200" y="103" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold" textAnchor="middle">↔ 互为相反数 ↔</text>
          </svg>
        </div>
      );
    }

    // 乘方雷区对比 (Day 9 - 10 关联有理数乘方)
    if (dayId === 'day9' || dayId === 'day10') {
      list.push(
        <div key="m-day9" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：中考第一大雷区 —— 乘方的正负号辨析</div>
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

    // 完全平方积木拼图 (Day 14)
    if (dayId === 'day14') {
      list.push(
        <div key="m-day14" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：完全平方公式的几何积木拼图</div>
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
              <text x="-8" y="35" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="end">a</text>
              <text x="-8" y="88" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="end">b</text>
              <text x="35" y="-6" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="middle">a</text>
              <text x="85" y="-6" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="middle">b</text>
            </g>
            <text x="280" y="55" fill="hsl(var(--text-primary))" fontSize="11" fontWeight="bold" textAnchor="middle">正方形总面积 = (a + b)²</text>
            <text x="280" y="75" fill="hsl(var(--color-mech))" fontSize="11.5" fontWeight="bold" textAnchor="middle">等价于：a² + 2ab + b²</text>
          </svg>
        </div>
      );
    }

    // 平方差割补拼图 (Day 13)
    if (dayId === 'day13') {
      list.push(
        <div key="m-day13" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：平方差公式的几何割补拼接</div>
          <svg width="100%" height="130" viewBox="0 0 400 130" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <g transform="translate(30, 15)">
              <rect x="0" y="0" width="90" height="90" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" strokeWidth="1.5" />
              <rect x="60" y="60" width="30" height="30" fill="#f8fafc" stroke="#cbd5e0" strokeDasharray="3,3" />
              <text x="75" y="78" fill="#a0aec0" fontSize="8" textAnchor="middle">剪去 b²</text>
              <text x="35" y="45" fill="rgb(59, 130, 246)" fontSize="10.5" fontWeight="bold" textAnchor="middle">面积: a² - b²</text>
            </g>
            <path d="M 145 60 L 175 60" fill="none" stroke="#718096" strokeWidth="2" />
            <g transform="translate(200, 30)">
              <rect x="0" y="0" width="130" height="60" fill="rgba(16, 185, 129, 0.15)" stroke="rgb(16, 185, 129)" strokeWidth="1.5" />
              <line x1="90" y1="0" x2="90" y2="60" stroke="rgb(16, 185, 129)" strokeDasharray="2,2" />
              <text x="45" y="35" fill="rgb(16, 185, 129)" fontSize="9.5" fontWeight="bold" textAnchor="middle">a 块</text>
              <text x="110" y="35" fill="rgb(16, 185, 129)" fontSize="9.5" fontWeight="bold" textAnchor="middle">b 块</text>
              <text x="65" y="-6" fill="hsl(var(--text-secondary))" fontSize="8.5" textAnchor="middle">a + b</text>
              <text x="-6" y="35" fill="hsl(var(--text-secondary))" fontSize="8.5" textAnchor="end">a - b</text>
            </g>
            <text x="200" y="118" fill="hsl(var(--color-work))" fontSize="10.5" fontWeight="bold" textAnchor="middle">因此：a² - b² = (a + b)(a - b)</text>
          </svg>
        </div>
      );
    }

    // 分数网格 (Day 1 - 5 均显示网格)
    if (dayId === 'day1' || dayId === 'day2' || dayId === 'day3') {
      list.push(
        <div key="m-day3" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：分数约分通分的网格等分直观表示</div>
          <svg width="100%" height="90" viewBox="0 0 400 90" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="40" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="40" y="20" width="50" height="40" fill="rgba(59, 130, 246, 0.15)" />
            <line x1="90" y1="20" x2="90" y2="60" stroke="#718096" />
            <text x="90" y="78" fill="hsl(var(--text-primary))" fontSize="9.5" fontWeight="bold" textAnchor="middle">1/2 面积</text>

            <text x="190" y="45" fill="#718096" fontSize="14" fontWeight="bold" textAnchor="middle">≡</text>

            <rect x="240" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="240" y="20" width="50" height="40" fill="rgba(16, 185, 129, 0.15)" />
            <line x1="265" y1="20" x2="265" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <line x1="290" y1="20" x2="290" y2="60" stroke="#718096" />
            <line x1="315" y1="20" x2="315" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <text x="290" y="78" fill="hsl(var(--text-primary))" fontSize="9.5" fontWeight="bold" textAnchor="middle">通分为 2/4 面积 (完全等同)</text>
          </svg>
        </div>
      );
    }

    // 方程交点 (Day 17)
    if (dayId === 'day17') {
      list.push(
        <div key="m-day17" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：二元一次方程组交点即为唯一解</div>
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

    // 二次方程与抛物线 (Day 20)
    if (dayId === 'day20') {
      list.push(
        <div key="m-day20" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：一元二次方程与二次函数交点个数的关系</div>
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

  // 根据当前 selectedDayId 得到对应的 Block 阶段
  const currentDayData = mathDays[selectedDayId] || mathDays['day1'];

  return (
    <div className="app-container fade-in">
      {/* 侧边栏 */}
      <div className="sidebar" style={{ minWidth: '240px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <h2 style={{ fontSize: '0.98rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考数学特训营</h2>
            <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>20天从50分逆袭80分</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '20px' }}>
          <button
            className={`btn btn-secondary ${activeTab === 'study' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'study' ? '' : 'transparent' }}
            onClick={() => setActiveTab('study')}
          >
            📖 每日公式与图解
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'test' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'test' ? '' : 'transparent' }}
            onClick={() => setActiveTab('test')}
          >
            ✍️ 20题每日通关测
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
            ❌ 数学错题重温本
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid hsla(var(--text-secondary) / 0.1)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.4, textAlign: 'center' }}>
            20天每日1.5小时学习计划
          </div>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* 顶部：20天日程导航大区 (除错题本外均显示) */}
        {activeTab !== 'wrongbook' && (
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 四周大阶段切换 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {mathBlocks.map((block) => {
                const isCurrentBlock = block.days.includes(selectedDayId);
                return (
                  <button
                    key={block.id}
                    className={`btn ${isCurrentBlock ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      fontSize: '0.78rem',
                      padding: '8px',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      alignItems: 'center',
                      backgroundColor: isCurrentBlock ? 'hsl(var(--color-work))' : '',
                      borderColor: isCurrentBlock ? 'hsl(var(--color-work))' : ''
                    }}
                    onClick={() => {
                      // 切换周时，默认选中这一周的第一天
                      setSelectedDayId(block.days[0]);
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>{block.name.split('：')[0]}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{block.name.split('：')[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* 当周所含 Day 徽章日程流 */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {(() => {
                const currentBlock = mathBlocks.find(b => b.days.includes(selectedDayId)) || mathBlocks[0];
                return currentBlock.days.map((dayId) => {
                  const dayData = mathDays[dayId];
                  const isSelected = selectedDayId === dayId;
                  
                  return (
                    <button
                      key={dayId}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.76rem',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      onClick={() => setSelectedDayId(dayId)}
                    >
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? '#fff' : 'hsl(var(--color-work))'
                      }}></span>
                      Day {dayId.replace('day', '')}：{dayData?.name.split('：')[1]}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Tab 1: 知识大纲精讲与图解 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* 双栏等高布局 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', height: '560px', alignItems: 'stretch' }}>
              
              {/* 左栏：精讲大纲 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-work))', borderBottom: '2px solid rgba(245,158,11,0.06)', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>📖 课程讲义 ({currentDayData?.name})</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>提分目标: 80分基础分</span>
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  {parseSummary(currentDayData?.summary)}
                </div>
              </div>

              {/* 右栏：经典母题与几何图解 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.08rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '10px' }}>
                  📐 经典母题与几何原理图
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                  
                  {/* 例题精讲 */}
                  <div style={{ padding: '16px', border: '1px solid rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, rgba(245,158,11,0.02), rgba(239,68,68,0.02))', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'hsl(var(--color-work))' }}>📝 经典母题精讲：</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 'bold', padding: '10px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      {currentDayData?.example.question}
                    </div>
                    <div style={{ fontSize: '0.82rem', lineHeight: '1.65', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                      {currentDayData?.example.answer}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'hsl(var(--color-danger))', borderTop: '1px dashed rgba(245,158,11,0.2)', paddingTop: '8px', lineHeight: '1.5' }}>
                      ⚠️ <b>名师避坑指点：</b>{currentDayData?.example.tip}
                    </div>
                  </div>

                  {/* 几何插图 */}
                  {renderMathIllustrations(selectedDayId)}
                </div>
              </div>
            </div>

            {/* 今日测试引导入口 */}
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
                  立刻进行本天 Day {selectedDayId.replace('day', '')} 专属的 20 题测试，查漏补缺！
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
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '500px' }}>
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
                    测验包含 20 道专门强化今天知识点的算术题。系统将自动收录答错的题进入错题本，供后期反复练习。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                  开始小测
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>当前进度：<b>{currentTestIndex + 1}</b> / 20 题</span>
                  <span>正在测评：{currentDayData?.name.split('：')[1]}</span>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${((currentTestIndex + 1) / 20) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-work))', transition: 'width 0.3s ease' }}></div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                  Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {testQuestions[currentTestIndex]?.options.map((opt, oIdx) => {
                    let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                    if (selectedTestOpt === oIdx) {
                      btnStyle = { border: '1px solid hsl(var(--color-work))', backgroundColor: 'hsla(var(--color-work)/0.08)', color: 'hsl(var(--color-work))' };
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
                      {selectedTestOpt === testQuestions[currentTestIndex].answer ? '✅ 算对了！孩子真棒！' : '❌ 算错了。让孩子仔细看看以下的分步推导演变步骤：'}
                    </div>
                    {testQuestions[currentTestIndex].explanation}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  {!testChecked ? (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} disabled={selectedTestOpt === null} onClick={handleTestSubmit}>
                      提交答案
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleNextTest}>
                      {currentTestIndex < 19 ? '下一题' : '完成测验并打分'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* 成绩单 */
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
                  {testScore}分
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                    {testScore === 100 ? '🎉 满分通关！计算小能手！' : testScore >= 80 ? '👍 达到80分目标！计算底子非常棒！' : '💪 还未达到80分，别灰心，对照错题解析多练几遍！'}
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                    本次测验得分 <b>{testScore}</b> 分。错题已同步归集到左下角的错题本中，可以单独把它们“消灭”掉。
                  </p>
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

        {/* Tab 3: 100题特训狂练 */}
        {activeTab === 'exercise' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', flex: 1, minHeight: '500px' }}>
              
              {/* 左栏：100题题目展示 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'hsla(var(--color-work)/0.1)', color: 'hsl(var(--color-work))', fontWeight: 'bold' }}>
                          Day {selectedDayId.replace('day', '')} 特训 · 第 {currentExerciseIndex + 1} / 100 题
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          类型：{exerciseQuestions[currentExerciseIndex].category}
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
                              style={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                padding: '10px 14px',
                                fontSize: '0.82rem',
                                ...btnStyle
                              }}
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
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 答对了！' : '❌ 计算错误，该题已加入错题本。'}
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
                        disabled={currentExerciseIndex === 99}
                        onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成今日 100 题特训库...</div>
                )}
              </div>

              {/* 右栏：100题网格状态进度卡 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 100题特训卡</span>
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
    </div>
  );
}
