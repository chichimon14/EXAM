import React, { useState, useEffect } from 'react';
import { mathBlocks, mathTopics } from '../data/mathData';
import { generateMathQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';

export default function MathModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedTopicId, setSelectedTopicId] = useState('math_topic1');

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

  // 切换章节时重置测试与练习
  useEffect(() => {
    setTestSubmitted(false);
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
  }, [selectedTopicId]);

  // 切换到 20 题测试面板或重新挑战时，锁死生成 20 道测试题
  const handleStartTest = () => {
    const generated = generateMathQuestions(selectedTopicId, 20);
    setTestQuestions(generated);
    setTestAnswers({});
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
    setTestSubmitted(true);
  };

  // 切换到 100 题特训面板时，生成 100 道专项练习题
  useEffect(() => {
    if (activeTab === 'exercise') {
      const generated = generateMathQuestions(selectedTopicId, 100);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedTopicId, activeTab]);

  // 20题测试单步提交
  const handleTestSubmit = () => {
    if (selectedTestOpt === null) return;
    const currentQ = testQuestions[currentTestIndex];
    const isCorrect = selectedTestOpt === currentQ.answer;

    const nextAnswers = { ...testAnswers, [currentQ.id]: selectedTestOpt };
    setTestAnswers(nextAnswers);

    // 如果做错了，自动收录数学错题本
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
      // 答完最后一题，结算分数
      let correctCount = 0;
      testQuestions.forEach(q => {
        if (testAnswers[q.id] === q.answer) {
          correctCount++;
        }
      });
      setTestScore(Math.round((correctCount / 20) * 100));
    }
  };

  // 100题练习单步提交
  const handleExerciseOptionClick = (optionIdx) => {
    const currentQ = exerciseQuestions[currentExerciseIndex];
    if (!currentQ || exerciseAnswers[currentQ.id]) return; // 已答不可重复选

    const isCorrect = optionIdx === currentQ.answer;
    const nextAnswers = {
      ...exerciseAnswers,
      [currentQ.id]: { isCorrect, userOpt: optionIdx }
    };
    setExerciseAnswers(nextAnswers);

    // 如果做错了，自动收录数学错题本
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

  // 错题本重挑战移出
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

  // 渲染数学 9 大章节专属几何原理图
  const renderMathIllustrations = () => {
    const list = [];

    // 第一章：小数与分数混合运算 (相反数与绝对值数轴)
    if (selectedTopicId === 'math_topic1') {
      list.push(
        <div key="m1-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 1.1：数轴、相反数与绝对值的几何定义</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 数轴 */}
            <line x1="20" y1="65" x2="380" y2="65" stroke="#718096" strokeWidth="2" />
            <polyline points="372,60 380,65 372,70" fill="none" stroke="#718096" strokeWidth="2" />
            <text x="375" y="82" fill="#4a5568" fontSize="8.5" fontWeight="bold">x</text>
            
            {/* 刻度 */}
            <line x1="200" y1="60" x2="200" y2="70" stroke="#2d3748" strokeWidth="2" />
            <text x="200" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">0 (原点)</text>
            
            <line x1="110" y1="60" x2="110" y2="70" stroke="#2d3748" strokeWidth="1.5" />
            <circle cx="110" cy="65" r="4.5" fill="hsl(var(--color-danger))" />
            <text x="110" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">-3</text>
            
            <line x1="290" y1="60" x2="290" y2="70" stroke="#2d3748" strokeWidth="1.5" />
            <circle cx="290" cy="65" r="4.5" fill="hsl(var(--color-success))" />
            <text x="290" y="82" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">3</text>
            
            {/* 绝对值表示弧线 */}
            <path d="M 110 50 Q 155 20 200 50" fill="none" stroke="hsl(var(--color-danger))" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="155" y="32" fill="hsl(var(--color-danger))" fontSize="8.5" fontWeight="bold" textAnchor="middle">|-3| = 3 (距离)</text>

            <path d="M 200 50 Q 245 20 290 50" fill="none" stroke="hsl(var(--color-success))" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="245" y="32" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">|3| = 3 (距离)</text>

            {/* 相反数对称弧 */}
            <path d="M 110 76 Q 200 108 290 76" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <text x="200" y="103" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold" textAnchor="middle">↔ 互为相反数 (关于原点对称) ↔</text>
          </svg>
        </div>
      );
    }

    // 第二章：有理数的四则混合运算 (有理数去括号变号与乘方对比)
    if (selectedTopicId === 'math_topic2') {
      list.push(
        <div key="m2-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 2.1：中考第一大雷区 —— 乘方的正负号辨析</div>
          <svg width="100%" height="100" viewBox="0 0 400 100" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 左侧 (-2)^2 */}
            <rect x="25" y="15" width="160" height="70" fill="rgba(16, 185, 129, 0.03)" stroke="hsl(var(--color-success))" strokeWidth="1" rx="6" />
            <text x="105" y="38" fill="hsl(var(--color-success))" fontSize="1.15rem" fontWeight="bold" textAnchor="middle">(-3)² = 9</text>
            <text x="105" y="60" fill="hsl(var(--text-secondary))" fontSize="8" textAnchor="middle">含义：(-3) 乘以 (-3)</text>
            <text x="105" y="75" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">负负得正，偶次方为正数</text>
            
            {/* 右侧 -2^2 */}
            <rect x="215" y="15" width="160" height="70" fill="rgba(239, 68, 68, 0.03)" stroke="hsl(var(--color-danger))" strokeWidth="1" rx="6" />
            <text x="295" y="38" fill="hsl(var(--color-danger))" fontSize="1.15rem" fontWeight="bold" textAnchor="middle">-3² = -9</text>
            <text x="295" y="60" fill="hsl(var(--text-secondary))" fontSize="8" textAnchor="middle">含义：-(3 乘以 3)</text>
            <text x="295" y="75" fill="hsl(var(--color-danger))" fontSize="8.5" fontWeight="bold" textAnchor="middle">先算乘方，再加负号</text>
          </svg>
        </div>
      );
    }

    // 第三章：整式的乘除与化简 (完全平方公式拼图)
    if (selectedTopicId === 'math_topic3') {
      list.push(
        <div key="m3-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 3.1：完全平方公式的几何面积拼图验证</div>
          <svg width="100%" height="130" viewBox="0 0 400 130" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <g transform="translate(40, 10)">
              {/* 大正方形边长 a+b */}
              {/* a*a */}
              <rect x="0" y="0" width="70" height="70" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" strokeWidth="1.5" />
              <text x="35" y="40" fill="rgb(59, 130, 246)" fontSize="10.5" fontWeight="bold" textAnchor="middle">a²</text>
              {/* a*b 矩形1 */}
              <rect x="70" y="0" width="30" height="70" fill="rgba(245, 158, 11, 0.15)" stroke="rgb(245, 158, 11)" strokeWidth="1.5" />
              <text x="85" y="40" fill="rgb(245, 158, 11)" fontSize="10" fontWeight="bold" textAnchor="middle">ab</text>
              {/* b*a 矩形2 */}
              <rect x="0" y="70" width="70" height="30" fill="rgba(245, 158, 11, 0.15)" stroke="rgb(245, 158, 11)" strokeWidth="1.5" />
              <text x="35" y="88" fill="rgb(245, 158, 11)" fontSize="10" fontWeight="bold" textAnchor="middle">ab</text>
              {/* b*b */}
              <rect x="70" y="70" width="30" height="30" fill="rgba(16, 185, 129, 0.15)" stroke="rgb(16, 185, 129)" strokeWidth="1.5" />
              <text x="85" y="88" fill="rgb(16, 185, 129)" fontSize="10" fontWeight="bold" textAnchor="middle">b²</text>

              {/* 边长说明 */}
              <text x="-8" y="35" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="end">a</text>
              <text x="-8" y="88" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="end">b</text>
              <text x="35" y="-6" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="middle">a</text>
              <text x="85" y="-6" fill="hsl(var(--text-secondary))" fontSize="9" textAnchor="middle">b</text>
            </g>
            <text x="280" y="55" fill="hsl(var(--text-primary))" fontSize="11" fontWeight="bold" textAnchor="middle">
              正方形总面积 = (a + b)²
            </text>
            <text x="280" y="75" fill="hsl(var(--color-mech))" fontSize="11.5" fontWeight="bold" textAnchor="middle">
              等价于：a² + 2ab + b²
            </text>
          </svg>
        </div>
      );
    }

    // 第四章：因式分解 (平方差公式拼图)
    if (selectedTopicId === 'math_topic4') {
      list.push(
        <div key="m4-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 4.1：平方差公式的几何面积割补拼接验证</div>
          <svg width="100%" height="130" viewBox="0 0 400 130" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 左侧：大正方形 cut 小正方形 */}
            <g transform="translate(30, 15)">
              <rect x="0" y="0" width="90" height="90" fill="rgba(59, 130, 246, 0.15)" stroke="rgb(59, 130, 246)" strokeWidth="1.5" />
              <rect x="60" y="60" width="30" height="30" fill="#f8fafc" stroke="#cbd5e0" strokeDasharray="3,3" />
              <text x="75" y="78" fill="#a0aec0" fontSize="8" textAnchor="middle">剪去 b²</text>
              <text x="35" y="45" fill="rgb(59, 130, 246)" fontSize="10.5" fontWeight="bold" textAnchor="middle">剩余面积</text>
              <text x="35" y="60" fill="rgb(59, 130, 246)" fontSize="10.5" fontWeight="bold" textAnchor="middle">a² - b²</text>
              
              <text x="-6" y="45" fill="hsl(var(--text-secondary))" fontSize="8.5" textAnchor="end">a</text>
              <text x="96" y="75" fill="hsl(var(--text-secondary))" fontSize="8.5">b</text>
            </g>

            {/* 箭头 */}
            <path d="M 145 60 L 175 60" fill="none" stroke="#718096" strokeWidth="2" markerEnd="url(#ill-arrow)" />
            
            {/* 右侧：拼接的矩形 (a+b) * (a-b) */}
            <g transform="translate(200, 30)">
              {/* 长 a+b, 宽 a-b */}
              <rect x="0" y="0" width="130" height="60" fill="rgba(16, 185, 129, 0.15)" stroke="rgb(16, 185, 129)" strokeWidth="1.5" />
              <line x1="90" y1="0" x2="90" y2="60" stroke="rgb(16, 185, 129)" strokeDasharray="2,2" />
              
              <text x="45" y="35" fill="rgb(16, 185, 129)" fontSize="9.5" fontWeight="bold" textAnchor="middle">a 块</text>
              <text x="110" y="35" fill="rgb(16, 185, 129)" fontSize="9.5" fontWeight="bold" textAnchor="middle">b 块</text>
              
              <text x="65" y="-6" fill="hsl(var(--text-secondary))" fontSize="8.5" textAnchor="middle">a + b</text>
              <text x="-6" y="35" fill="hsl(var(--text-secondary))" fontSize="8.5" textAnchor="end">a - b</text>
            </g>

            <text x="200" y="118" fill="hsl(var(--color-work))" fontSize="10.5" fontWeight="bold" textAnchor="middle">
              因此：a² - b² = (a + b)(a - b)
            </text>
          </svg>
        </div>
      );
    }

    // 第五章：分式化简求值 (分式通分网格)
    if (selectedTopicId === 'math_topic5') {
      list.push(
        <div key="m5-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 5.1：分式通分与网格等分面积占比关系</div>
          <svg width="100%" height="90" viewBox="0 0 400 90" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 左侧 1/2 */}
            <rect x="40" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="40" y="20" width="50" height="40" fill="rgba(59, 130, 246, 0.15)" />
            <line x1="90" y1="20" x2="90" y2="60" stroke="#718096" />
            <text x="90" y="80" fill="hsl(var(--text-primary))" fontSize="10" fontWeight="bold" textAnchor="middle">1/2 的占比面积</text>

            <text x="190" y="45" fill="#718096" fontSize="14" fontWeight="bold" textAnchor="middle">≡</text>

            {/* 右侧 2/4 */}
            <rect x="240" y="20" width="100" height="40" fill="none" stroke="#718096" strokeWidth="1.5" />
            <rect x="240" y="20" width="50" height="40" fill="rgba(16, 185, 129, 0.15)" />
            <line x1="265" y1="20" x2="265" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <line x1="290" y1="20" x2="290" y2="60" stroke="#718096" />
            <line x1="315" y1="20" x2="315" y2="60" stroke="#cbd5e0" strokeWidth="0.8" />
            <text x="290" y="80" fill="hsl(var(--text-primary))" fontSize="10" fontWeight="bold" textAnchor="middle">通分为 2/4 后的占比面积 (完全相同)</text>
          </svg>
        </div>
      );
    }

    // 第六章：二次根式 (数轴上根号2的位置有理化)
    if (selectedTopicId === 'math_topic6') {
      list.push(
        <div key="m6-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 6.1：数轴上无理数 √2 的具体物理几何位置</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="80" x2="380" y2="80" stroke="#718096" strokeWidth="2" />
            <polyline points="372,75 380,80 372,85" fill="none" stroke="#718096" strokeWidth="2" />
            
            {/* 原点 0 */}
            <line x1="100" y1="75" x2="100" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="100" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">0</text>
            
            {/* 1 */}
            <line x1="220" y1="75" x2="220" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="220" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>
            
            {/* 2 */}
            <line x1="340" y1="75" x2="340" y2="85" stroke="#2d3748" strokeWidth="2" />
            <text x="340" y="97" fill="#2d3748" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
            
            {/* 直角三角形求斜边为 √2 */}
            <polygon points="100,80 220,80 220,20" fill="rgba(245, 158, 11, 0.12)" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <text x="160" y="89" fill="hsl(var(--text-secondary))" fontSize="7.5" textAnchor="middle">底边 = 1</text>
            <text x="226" y="50" fill="hsl(var(--text-secondary))" fontSize="7.5">高 = 1</text>
            <text x="150" y="44" fill="hsl(var(--color-work))" fontSize="8.5" fontWeight="bold">斜边 = √2</text>

            {/* 弧线投射 */}
            <path d="M 220 20 A 120 120 0 0 1 270 80" fill="none" stroke="hsl(var(--color-danger))" strokeDasharray="3,2" strokeWidth="1.5" />
            <circle cx="270" cy="80" r="4" fill="hsl(var(--color-danger))" />
            <text x="270" y="97" fill="hsl(var(--color-danger))" fontSize="9" fontWeight="bold" textAnchor="middle">√2 (≈1.414)</text>
          </svg>
        </div>
      );
    }

    // 第七章：方程及方程组 (两直线相交交点坐标为解)
    if (selectedTopicId === 'math_topic7') {
      list.push(
        <div key="m7-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 7.1：二元一次方程组解的几何意义 (两直线交点)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="30" y1="90" x2="370" y2="90" stroke="#cbd5e0" strokeWidth="1" />
            <line x1="70" y1="10" x2="70" y2="105" stroke="#cbd5e0" strokeWidth="1" />
            
            {/* 直线 1 */}
            <line x1="50" y1="10" x2="280" y2="102" stroke="hsl(var(--color-optics))" strokeWidth="2" />
            <text x="270" y="88" fill="hsl(var(--color-optics))" fontSize="8">① x + y = 4</text>
            
            {/* 直线 2 */}
            <line x1="120" y1="105" x2="260" y2="10" stroke="hsl(var(--color-mech))" strokeWidth="2" />
            <text x="260" y="24" fill="hsl(var(--color-mech))" fontSize="8">② 3x - y = 8</text>
            
            {/* 交点 */}
            <circle cx="210" cy="74" r="5" fill="hsl(var(--color-danger))" />
            <text x="210" y="62" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold" textAnchor="middle">交点 P(3, 1)</text>
            <text x="20" y="20" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold">两直线的交点坐标就是该方程组的【唯一解】！</text>
          </svg>
        </div>
      );
    }

    // 第八章：一元二次方程 (二次函数交点根数)
    if (selectedTopicId === 'math_topic8') {
      list.push(
        <div key="m8-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 8.1：一元二次方程与二次函数交点根数 Δ 判定</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 1. Δ > 0 */}
            <g transform="translate(10, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 25 Q 60 115 95 25" fill="none" stroke="hsl(var(--color-danger))" strokeWidth="1.5" />
              <circle cx="44" cy="75" r="3.5" fill="hsl(var(--color-danger))" />
              <circle cx="76" cy="75" r="3.5" fill="hsl(var(--color-danger))" />
              <text x="60" y="93" fill="hsl(var(--text-primary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ &gt; 0 (2个交点/2根)</text>
            </g>

            {/* 2. Δ = 0 */}
            <g transform="translate(140, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 35 Q 60 75 95 35" fill="none" stroke="hsl(var(--color-success))" strokeWidth="1.5" />
              <circle cx="60" cy="75" r="3.5" fill="hsl(var(--color-success))" />
              <text x="60" y="93" fill="hsl(var(--text-primary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ = 0 (1个切点/重根)</text>
            </g>

            {/* 3. Δ < 0 */}
            <g transform="translate(270, 5)">
              <line x1="10" y1="75" x2="110" y2="75" stroke="#718096" strokeWidth="1" />
              <path d="M 25 25 Q 60 45 95 25" fill="none" stroke="#718096" strokeWidth="1.5" />
              <text x="60" y="93" fill="hsl(var(--text-secondary))" fontSize="8" fontWeight="bold" textAnchor="middle">Δ &lt; 0 (无交点/无实根)</text>
            </g>
          </svg>
        </div>
      );
    }

    // 第九章：一元一次不等式 (不等式解集覆盖数轴)
    if (selectedTopicId === 'math_topic9') {
      list.push(
        <div key="m9-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 9.1：不等式组解集在数轴上的重叠相交关系</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="75" x2="380" y2="75" stroke="#718096" strokeWidth="2" />
            
            {/* 刻度 2 (空心) */}
            <line x1="140" y1="70" x2="140" y2="80" stroke="#2d3748" />
            <text x="140" y="92" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">2</text>
            
            {/* 刻度 3 (实心) */}
            <line x1="260" y1="70" x2="260" y2="80" stroke="#2d3748" />
            <text x="260" y="92" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">3</text>
            
            {/* 不等式 1: x > 2 */}
            <circle cx="140" cy="50" r="3.5" fill="#f8fafc" stroke="hsl(var(--color-optics))" strokeWidth="2" />
            <line x1="144" y1="50" x2="360" y2="50" stroke="hsl(var(--color-optics))" strokeWidth="2" markerEnd="url(#ill-arrow)" />
            <text x="350" y="42" fill="hsl(var(--color-optics))" fontSize="7.5" fontWeight="bold">① x &gt; 2 (空心向右)</text>

            {/* 不等式 2: x <= 3 */}
            <circle cx="260" cy="25" r="4.5" fill="hsl(var(--color-work))" />
            <line x1="256" y1="25" x2="40" y2="25" stroke="hsl(var(--color-work))" strokeWidth="2" markerEnd="url(#ill-arrow)" />
            <text x="50" y="17" fill="hsl(var(--color-work))" fontSize="7.5" fontWeight="bold">② x ≤ 3 (实心向左)</text>

            {/* 高亮重合区域 2 < x <= 3 */}
            <rect x="141" y="65" width="118" height="10" fill="rgba(16, 185, 129, 0.2)" />
            <text x="200" y="105" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              ✅ 最终公共解集为： 2 &lt; x ≤ 3
            </text>
          </svg>
        </div>
      );
    }

    return list;
  };

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
            <h2 style={{ fontSize: '1.05rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考数学特训</h2>
            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>小学三年级至初二计算</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, marginTop: '20px' }}>
          <button
            className={`btn btn-secondary ${activeTab === 'study' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'study' ? '' : 'transparent' }}
            onClick={() => setActiveTab('study')}
          >
            📖 计算公式与图解
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'test' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'test' ? '' : 'transparent' }}
            onClick={() => setActiveTab('test')}
          >
            ✍️ 20题测试过关
          </button>
          <button
            className={`btn btn-secondary ${activeTab === 'exercise' ? 'btn-primary' : ''}`}
            style={{ justifyContent: 'flex-start', border: 'none', backgroundColor: activeTab === 'exercise' ? '' : 'transparent' }}
            onClick={() => setActiveTab('exercise')}
          >
            📝 100题计算狂练
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
            深圳中考计算提分专场
          </div>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content">
        
        {/* Tab 1: 知识大纲精讲与图解 */}
        {activeTab === 'study' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 章节切换 */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {Object.values(mathTopics).map((t) => (
                <button
                  key={t.id}
                  className={`btn ${selectedTopicId === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '6px 12px' }}
                  onClick={() => setSelectedTopicId(t.id)}
                >
                  {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* 双栏布局 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', height: '620px', alignItems: 'stretch' }}>
              {/* 左侧大卡片：精讲大纲 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-work))', borderBottom: '2px solid rgba(245,158,11,0.06)', paddingBottom: '10px' }}>
                  📖 知识归纳 ({mathTopics[selectedTopicId]?.name})
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                  <p style={{ fontSize: '0.88rem', lineHeight: '1.75', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {mathTopics[selectedTopicId]?.summary}
                  </p>
                </div>
              </div>

              {/* 右侧大卡片：例题与几何图解 */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '24px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 16px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '10px' }}>
                  📐 计算例题与可视化图解
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                  {/* 中考真题/母题例题 */}
                  <div style={{ padding: '16px', border: '1px solid rgba(245,158,11,0.15)', background: 'linear-gradient(135deg, rgba(245,158,11,0.02), rgba(239,68,68,0.02))', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.88rem', color: 'hsl(var(--color-work))' }}>📝 经典母题精讲：</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', padding: '10px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                      {mathTopics[selectedTopicId]?.example.question}
                    </div>
                    <div style={{ fontSize: '0.82rem', lineHeight: '1.65', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                      {mathTopics[selectedTopicId]?.example.answer}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'hsl(var(--color-danger))', borderTop: '1px dashed rgba(245,158,11,0.2)', paddingTop: '8px', lineHeight: '1.5' }}>
                      ⚠️ <b>名师提分小贴士：</b>{mathTopics[selectedTopicId]?.example.tip}
                    </div>
                  </div>

                  {/* 几何原理插图 */}
                  {renderMathIllustrations()}
                </div>
              </div>
            </div>

            {/* 测试快速入口 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(239, 68, 68, 0.05))',
              border: '1px solid rgba(245, 158, 11, 0.12)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>
                  🧠 刚才的口诀和例题懂了吗？做个小挑战！
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                  为你准备了 20 道专门强化本章计算的小测试题，看看你能拿多少分！
                </p>
              </div>
              <button className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                开启 20题 过关小测
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: 20题测试大厅 */}
        {activeTab === 'test' && (
          <div className="glass-card" style={{ height: '100%', padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '520px' }}>
            {!testSubmitted ? (
              <div style={{ textAlign: 'center', padding: '60px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyOrigin: 'center', justifyContent: 'center', color: 'hsl(var(--color-work))' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                    ✍️ 开始：{mathTopics[selectedTopicId]?.name} 测试
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', maxWidth: '460px', margin: '0 auto', lineHeight: '1.6' }}>
                    本测试包含 20 道自适应计算题。一旦开始，中途不可修改所选章节。系统将精确计算您的得分，并智能记录您的计算漏洞。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '0.95rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                  立即挑战
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 */
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                  <span>当前进度：<b>{currentTestIndex + 1}</b> / 20 题</span>
                  <span>正在挑战：{mathTopics[selectedTopicId]?.name.split(' ')[1]}</span>
                </div>

                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${((currentTestIndex + 1) / 20) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-work))', transition: 'width 0.3s ease' }}></div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '1.05rem', fontWeight: 'bold' }}>
                  Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                          padding: '12px 18px',
                          fontSize: '0.88rem',
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
                    padding: '14px',
                    backgroundColor: '#f8fafc',
                    borderLeft: `4px solid ${selectedTestOpt === testQuestions[currentTestIndex].answer ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    lineHeight: '1.65',
                    whiteSpace: 'pre-wrap'
                  }}>
                    <div style={{ fontWeight: 'bold', color: selectedTestOpt === testQuestions[currentTestIndex].answer ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '4px' }}>
                      {selectedTestOpt === testQuestions[currentTestIndex].answer ? '✅ 算对了！真棒！' : '❌ 算错了，请看下方的完整演变步骤。'}
                    </div>
                    {testQuestions[currentTestIndex].explanation}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  {!testChecked ? (
                    <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} disabled={selectedTestOpt === null} onClick={handleTestSubmit}>
                      提交答案
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleNextTest}>
                      {currentTestIndex < 19 ? '下一题' : '完成测试并打分'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* 成绩报告 */
              <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  backgroundColor: testScore >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: testScore >= 80 ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))',
                  fontSize: '2.2rem',
                  fontWeight: 'bold'
                }}>
                  {testScore}分
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                    {testScore === 100 ? '🎉 满分过关！太强了！' : testScore >= 80 ? '👍 优秀！计算功底非常扎实！' : '💪 继续加油！还有很多提升空间！'}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', margin: 0, maxWidth: '440px', lineHeight: '1.6' }}>
                    测试完成。得分 <b>{testScore}</b> 分。
                    {testScore < 100 && ' 答错的计算题已经全部收入【数学错题重温本】，建议经常挑战以形成正确肌肉记忆。'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setTestSubmitted(false)}>
                    返回大厅
                  </button>
                  <button className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-work))', borderColor: 'hsl(var(--color-work))' }} onClick={handleStartTest}>
                    重新挑战
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 100题专项狂练 */}
        {activeTab === 'exercise' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 章节切换 */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {Object.values(mathTopics).map((t) => (
                <button
                  key={t.id}
                  className={`btn ${selectedTopicId === t.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '6px 12px' }}
                  onClick={() => setSelectedTopicId(t.id)}
                >
                  {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* 双栏练习工作台 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1, minHeight: '560px' }}>
              
              {/* 左栏：刷题与草稿解析 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'hsla(var(--color-work)/0.1)', color: 'hsl(var(--color-work))', fontWeight: 'bold' }}>
                          计算练习 第 {currentExerciseIndex + 1} / 100 题
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                          类型：{exerciseQuestions[currentExerciseIndex].category}
                        </span>
                      </div>

                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontSize: '1.02rem', fontWeight: 'bold' }}>
                        {exerciseQuestions[currentExerciseIndex].question}
                      </div>

                      {/* 选项 */}
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
                                padding: '10px 16px',
                                fontSize: '0.85rem',
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

                      {/* 分步推导解析 */}
                      {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id] && (
                        <div className="fade-in" style={{
                          padding: '14px',
                          backgroundColor: '#f8fafc',
                          borderLeft: `4px solid ${exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          lineHeight: '1.65',
                          whiteSpace: 'pre-wrap'
                        }}>
                          <div style={{ fontWeight: 'bold', color: exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '4px' }}>
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 回答正确！' : '❌ 计算错误，错题已归档。'}
                          </div>
                          {exerciseQuestions[currentExerciseIndex].explanation}
                        </div>
                      )}
                    </div>

                    {/* 翻页按钮 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
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
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成数学计算大题库...</div>
                )}
              </div>

              {/* 右栏：100题答题进度表 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 狂练进度卡 (100题)</span>
                  <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                    完成度：{Object.keys(exerciseAnswers).length} / 100
                  </span>
                </h4>

                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '420px',
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

                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)' }}></span>未答
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))' }}></span>算对
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-danger))' }}></span>算错
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
