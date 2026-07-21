import React, { useState, useEffect } from 'react';
import { blocks, chapters, formulas, questions } from '../data/physicsData';
import { generatePhysicsQuestions } from '../utils/questionGenerator';
import FormulaCalculator from './FormulaCalculator';
import RadarChart from './RadarChart';
import WrongBook from './WrongBook';
import { addStudyLog } from '../utils/syncService';

// 导入大实验组件
import LightReflectRefract from './experiments/LightReflectRefract';
import LensImaging from './experiments/LensImaging';
import BuoyancySimulator from './experiments/BuoyancySimulator';
import LeverSimulator from './experiments/LeverSimulator';

export default function PhysicsModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | exercise | formulas | diagnosis | wrongbook
  const [chapterStep, setChapterStep] = useState('study'); // study | quiz
  const [selectedBlockId, setSelectedBlockId] = useState(blocks[0].id);
  const [selectedChapterId, setSelectedChapterId] = useState(blocks[0].chapters[0]);
  
  // 20题过关测试状态
  const [userAnswers, setUserAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [wrongList, setWrongList] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  // 100题专项练习状态
  const [exerciseQuestions, setExerciseQuestions] = useState([]);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // 诊断特训状态
  const [isSpecialTraining, setIsSpecialTraining] = useState(false);
  const [specialTrainBlockId, setSpecialTrainBlockId] = useState(null);
  const [specialTrainQuestions, setSpecialTrainQuestions] = useState([]);
  const [specialTrainIndex, setSpecialTrainIndex] = useState(0);
  const [specialTrainSelectedOpt, setSpecialTrainSelectedOpt] = useState(null);
  const [specialTrainChecked, setSpecialTrainChecked] = useState(false);
  const [specialTrainScore, setSpecialTrainScore] = useState(0);

  // 物理插图微交互状态
  const [waveMode, setWaveMode] = useState('normal');
  const [activeStateChange, setActiveStateChange] = useState(null);
  const [pendulumPos, setPendulumPos] = useState('mid');

  const [dayScores, setDayScores] = useState({});
  const [showBillModal, setShowBillModal] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState(null);

  // 计算当前章节/Day的今日金币积分
  const todayGoldCoin = dayScores[selectedChapterId] !== undefined ? dayScores[selectedChapterId] : 0;

  // iPad 竖屏与移动端高灵敏自适应响应式状态
  const [isPortraitTablet, setIsPortraitTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTabletWidth = window.innerWidth <= 900; // ipad竖屏最宽为 834px，900px 能完美精准涵盖
      setIsPortraitTablet(isPortrait && isTabletWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 自动展开当前选中 Day 所属的物理单元
  useEffect(() => {
    const curBlock = blocks.find(b => b.chapters.includes(selectedChapterId));
    if (curBlock) {
      setExpandedBlockId(curBlock.id);
      setSelectedBlockId(curBlock.id);
    }
  }, [selectedChapterId]);

  const toggleBlock = (blockId) => {
    setExpandedBlockId(prev => prev === blockId ? null : blockId);
  };

  // 初始化加载
  useEffect(() => {
    const savedAnswers = localStorage.getItem('physics-answers');
    if (savedAnswers) {
      try {
        setUserAnswers(JSON.parse(savedAnswers));
      } catch (e) {
        console.error('Failed to parse physics-answers:', e);
        setUserAnswers({});
      }
    }

    const savedSubmissions = localStorage.getItem('physics-submissions');
    if (savedSubmissions) {
      try {
        setSubmittedAnswers(JSON.parse(savedSubmissions));
      } catch (e) {
        console.error('Failed to parse physics-submissions:', e);
        setSubmittedAnswers({});
      }
    }

    const savedWrongs = localStorage.getItem('physics-wrongs');
    if (savedWrongs) {
      try {
        const parsed = JSON.parse(savedWrongs);
        setWrongList(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error('Failed to parse physics-wrongs:', e);
        setWrongList([]);
      }
    }

    // 加载25天金币荣誉分值
    const scores = {};
    for (let i = 1; i <= 25; i++) {
      const dayKey = `day${i}`;
      const val = localStorage.getItem(`physics-score-${dayKey}`);
      if (val !== null) {
        scores[dayKey] = parseFloat(val);
      } else {
        scores[dayKey] = 0;
      }
    }
    setDayScores(scores);
  }, []);

  // 更新金币分值：做对 +weight，做错 -weight
  const updateGoldCoin = (isCorrect, weight = 1) => {
    const currentScore = dayScores[selectedChapterId] || 0;
    const delta = isCorrect ? weight : -weight;
    // 确保分数不为负数，且保留一位小数
    const newScore = Math.round(Math.max(0, currentScore + delta) * 10) / 10;
    
    const nextScores = { ...dayScores, [selectedChapterId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`physics-score-${selectedChapterId}`, newScore.toString());
  };

  // 获取当前章节题目列表 (20道测试题)
  const currentChapterQuestions = questions.filter(q => q.chapterId === selectedChapterId);

  // 切换章节时重置测试与练习
  useEffect(() => {
    setChapterStep('study');
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizChecked(false);
    setQuizScore(null);
  }, [selectedChapterId]);

  // 当切换到练习 Tab 或章节时，动态初始化 50 道专项练习题
  useEffect(() => {
    if (activeTab === 'exercise') {
      const generated = generatePhysicsQuestions(selectedChapterId, questions, 50);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedChapterId, activeTab]);

  // 清空答题特训状态
  useEffect(() => {
    if (activeTab !== 'study' && activeTab !== 'diagnosis') {
      setIsSpecialTraining(false);
    }
  }, [activeTab]);

  // 物理小测统一交卷结算逻辑
  const handleQuizSubmitAll = () => {
    // 检查是否有未作答题目
    const unattemptedCount = currentChapterQuestions.filter(q => userAnswers[q.id] === undefined || userAnswers[q.id] === null).length;
    if (unattemptedCount > 0) {
      const confirmSubmit = window.confirm(`您还有 ${unattemptedCount} 道题未做，确定要交卷并结算小测吗？(未做题目将直接计为算错)`);
      if (!confirmSubmit) return;
    }

    let correctCount = 0;
    const weaknesses = [];
    const nextAnswers = { ...userAnswers };
    const nextSubmissions = { ...submittedAnswers };

    // 从 localStorage 同步读取最新的错题，避免闭包状态覆盖
    let currentWrongs = [];
    const savedWrongs = localStorage.getItem('physics-wrongs');
    if (savedWrongs) {
      try {
        currentWrongs = JSON.parse(savedWrongs);
        if (!Array.isArray(currentWrongs)) currentWrongs = [];
      } catch (e) {
        currentWrongs = [];
      }
    }

    currentChapterQuestions.forEach(q => {
      const saved = nextAnswers[q.id];
      const isCorrect = saved === q.answer || (saved && saved.userOpt === q.answer);

      // 标记该题对错状态
      if (saved) {
        nextAnswers[q.id] = {
          ...saved,
          state: isCorrect ? 'correct' : 'wrong'
        };
      } else {
        nextAnswers[q.id] = {
          state: 'wrong'
        };
      }
      nextSubmissions[q.id] = isCorrect;

      // 物理小测（20题小测卡）每道题做对加 0.5 分，做错倒扣 0.5 分
      updateGoldCoin(isCorrect, 0.5);

      if (isCorrect) {
        correctCount++;
      } else {
        weaknesses.push(q.knowledgePoint || q.question.substring(0, 15) + '...');
        
        const alreadyIn = currentWrongs.some(w => w && w.id === q.id);
        if (!alreadyIn) {
          const wrongQ = {
            ...q,
            userAnswer: saved?.userOpt !== undefined ? saved.userOpt : saved,
            wrongTime: new Date().toLocaleString('zh-CN', { hour12: false }) // 注明错题时间！
          };
          currentWrongs.push(wrongQ);
        }
      }
    });

    setUserAnswers(nextAnswers);
    setSubmittedAnswers(nextSubmissions);
    setWrongList(currentWrongs);
    localStorage.setItem('physics-answers', JSON.stringify(nextAnswers));
    localStorage.setItem('physics-submissions', JSON.stringify(nextSubmissions));
    localStorage.setItem('physics-wrongs', JSON.stringify(currentWrongs));

    setQuizScore(correctCount);
    setQuizChecked(true);

    const dayNum = selectedChapterId.replace('day', '');
    addStudyLog(
      'physics',
      'quiz_complete',
      `完成物理 Day ${dayNum} 20题测试`,
      correctCount,
      currentChapterQuestions.length,
      weaknesses
    );
  };

  // 重新开始测试本章
  const handleRestartQuiz = () => {
    const nextAnswers = { ...userAnswers };
    const nextSubmissions = { ...submittedAnswers };

    currentChapterQuestions.forEach(q => {
      delete nextAnswers[q.id];
      delete nextSubmissions[q.id];
    });

    setUserAnswers(nextAnswers);
    setSubmittedAnswers(nextSubmissions);
    localStorage.setItem('physics-answers', JSON.stringify(nextAnswers));
    localStorage.setItem('physics-submissions', JSON.stringify(nextSubmissions));

    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizChecked(false);
    setQuizScore(null);
    setChapterStep('quiz');
  };

  // 100题专项练习单步提交
  const handleExerciseOptionClick = (optionIdx) => {
    const currentQ = exerciseQuestions[currentExerciseIndex];
    if (!currentQ || exerciseAnswers[currentQ.id]) return; // 已答不可重复选

    const isCorrect = optionIdx === currentQ.answer;
    const nextAnswers = {
      ...exerciseAnswers,
      [currentQ.id]: { isCorrect, userOpt: optionIdx }
    };
    setExerciseAnswers(nextAnswers);

    // 金币扣减与累加 (+0.5 / -0.5)
    updateGoldCoin(isCorrect, 0.5);

    // 如果做错了，自动收录物理错题本 (同步读写本地，彻底根治闭包覆盖丢失 Bug)
    if (!isCorrect) {
      let currentWrongs = [];
      const savedWrongs = localStorage.getItem('physics-wrongs');
      if (savedWrongs) {
        try {
          currentWrongs = JSON.parse(savedWrongs);
          if (!Array.isArray(currentWrongs)) currentWrongs = [];
        } catch (e) {
          currentWrongs = [];
        }
      }

      const alreadyIn = currentWrongs.some(w => w && w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = {
          ...currentQ,
          userAnswer: optionIdx,
          wrongTime: new Date().toLocaleString('zh-CN', { hour12: false }) // 注明错题时间！
        };
        const nextWrongs = [...currentWrongs, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('physics-wrongs', JSON.stringify(nextWrongs));
      }
    }
  };

  // 错题本重挑战移出
  const handleRemoveWrong = (qId) => {
    const nextWrongs = wrongList.filter(w => w.id !== qId);
    setWrongList(nextWrongs);
    localStorage.setItem('physics-wrongs', JSON.stringify(nextWrongs));

    const nextSubmissions = { ...submittedAnswers, [qId]: true };
    setSubmittedAnswers(nextSubmissions);
    localStorage.setItem('physics-submissions', JSON.stringify(nextSubmissions));
  };

  const handleClearAllWrongs = () => {
    if (window.confirm('您确定要清空物理错题本中所有的题目吗？')) {
      setWrongList([]);
      localStorage.setItem('physics-wrongs', JSON.stringify([]));
    }
  };

  // 诊断诊断分数算得
  const blockScores = {};
  blocks.forEach(b => {
    const blockQIds = questions.filter(q => q.blockId === b.id).map(q => q.id);
    const attemptedQs = blockQIds.filter(qId => userAnswers[qId] !== undefined);
    if (attemptedQs.length === 0) {
      blockScores[b.id] = 0;
    } else {
      const correctQs = attemptedQs.filter(qId => submittedAnswers[qId] === true);
      const correctRate = correctQs.length / attemptedQs.length;
      const coverageRate = Math.min(1.0, attemptedQs.length / 20);
      blockScores[b.id] = Math.round((correctRate * 80 + coverageRate * 20));
    }
  });

  // 弱点特训开启
  const startSpecialTraining = (blockId) => {
    const blockQuestions = questions.filter(q => q.blockId === blockId);
    let pool = blockQuestions.filter(q => submittedAnswers[q.id] === false || userAnswers[q.id] === undefined);
    if (pool.length < 5) {
      const extra = blockQuestions.filter(q => !pool.some(p => p.id === q.id));
      pool = [...pool, ...extra].slice(0, 5);
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);
    setSpecialTrainBlockId(blockId);
    setSpecialTrainQuestions(shuffled);
    setSpecialTrainIndex(0);
    setSpecialTrainSelectedOpt(null);
    setSpecialTrainChecked(false);
    setSpecialTrainScore(0);
    setIsSpecialTraining(true);
    setActiveTab('diagnosis');
  };

  const handleSpecialTrainSubmit = () => {
    if (specialTrainSelectedOpt === null) return;
    const currentQ = specialTrainQuestions[specialTrainIndex];
    const isCorrect = specialTrainSelectedOpt === currentQ.answer;

    if (isCorrect) {
      setSpecialTrainScore(prev => prev + 1);
    }

    const nextAnswers = { ...userAnswers, [currentQ.id]: specialTrainSelectedOpt };
    const nextSubmissions = { ...submittedAnswers, [currentQ.id]: isCorrect };
    setUserAnswers(nextAnswers);
    setSubmittedAnswers(nextSubmissions);
    localStorage.setItem('physics-answers', JSON.stringify(nextAnswers));
    localStorage.setItem('physics-submissions', JSON.stringify(nextSubmissions));

    if (!isCorrect) {
      const alreadyIn = wrongList.some(w => w.id === currentQ.id);
      if (!alreadyIn) {
        const wrongQ = { ...currentQ, userAnswer: specialTrainSelectedOpt };
        const nextWrongs = [...wrongList, wrongQ];
        setWrongList(nextWrongs);
        localStorage.setItem('physics-wrongs', JSON.stringify(nextWrongs));
      }
    }
    setSpecialTrainChecked(true);
  };

  const handleSpecialTrainNext = () => {
    setSpecialTrainSelectedOpt(null);
    setSpecialTrainChecked(false);
    if (specialTrainIndex < 4) {
      setSpecialTrainIndex(specialTrainIndex + 1);
    } else {
      setIsSpecialTraining(false);
    }
  };

  // 大型实验室渲染
  const renderChapterLargeExperiment = () => {
    if (selectedChapterId === 'chapter4') return <LightReflectRefract />;
    if (selectedChapterId === 'chapter5') return <LensImaging />;
    if (selectedChapterId === 'chapter10') return <BuoyancySimulator />;
    if (selectedChapterId === 'chapter12') return <LeverSimulator />;
    return null;
  };

  // 公式解析卡片生成
  const renderChapterFormulaGuide = () => {
    const formulasMap = {
      chapter1: {
        title: '📐 本章中考重点公式：速度公式',
        derivatives: ['s = v t (计算路程)', 't = s / v (计算时间)'],
        variables: [
          { symbol: 'v', name: '速度', unit: 'm/s 或 km/h (换算：1m/s = 3.6km/h)' },
          { symbol: 's', name: '路程', unit: 'm (米) 或 km (千米)' },
          { symbol: 't', name: '时间', unit: 's (秒) 或 h (小时)' }
        ],
        warning: '平均速度是【总路程除以总时间】，绝对不能把两个分段速度直接加起来除以2！'
      },
      chapter2: {
        title: '💡 本章中考核心规律：声速与回声判定',
        derivatives: ['人耳区分回声和原声的最小时间间隔：0.1 s', '人与障碍物的最小安全距离：s = 17 m'],
        variables: [
          { symbol: 'v', name: '声速', unit: '受介质种类和温度影响 (固体 > 液体 > 气体)' },
          { symbol: 's', name: '声传播路程', unit: '若计算回声定位，声波来回传播距离 = 2 × 障碍物距离' }
        ],
        warning: '声音的传播必须依赖介质。真空【不能】传声（如太空、月球上），但电磁波可以在真空中传播！'
      },
      chapter3: {
        title: '💡 本章中考核心规律：晶体熔化与液体沸腾条件',
        derivatives: ['晶体熔化条件：达到熔点 + 继续吸热', '液体沸腾条件：达到沸点 + 继续吸热'],
        variables: [
          { symbol: '吸热不升温', name: '最核心特征', unit: '晶体在熔化过程中，以及液体在沸腾过程中，持续吸热但温度【保持不变】' }
        ],
        warning: '“白气”、“白雾”或水杯外壁的小水珠并不是水蒸气（水蒸气是看不见的气体），而是水蒸气遇冷【液化】形成的液态微小水滴，液化需要【放热】！'
      },
      chapter4: {
        title: '💡 本章中考核心规律：光现象两大定律',
        derivatives: ['光在同种均匀介质中沿直线传播', '光发生反射/折射时，光路都是【可逆】的'],
        variables: [
          { symbol: '∠i', name: '入射角', unit: '入射光线与【法线】的夹角，绝不是与镜面的夹角！' },
          { symbol: '∠r', name: '反射角', unit: '反射光线与【法线】的夹角，反射角随入射角增大而增大' }
        ],
        warning: '光斜射入玻璃或水中时，折射角【小于】入射角（折射光线向法线偏折）；光从水或玻璃斜射入空气时，折射角【大于】入射角！'
      },
      chapter5: {
        title: '💡 本章中考核心规律：凸透镜成像规律顺口溜',
        derivatives: ['一倍焦距分虚实；二倍焦距分大小', '实像总是倒立的（左右上下皆反）；虚像总是正立的', '物近像远像变大：物向透镜靠近时，像远离透镜且体积变大'],
        variables: [
          { symbol: 'u', name: '物距', unit: '物体到透镜光心的距离' },
          { symbol: 'v', name: '像距', unit: '像（或光屏）到透镜光心的距离' }
        ],
        warning: '实像是实际光线会聚而成的，【能】呈在光屏上；虚像是折射光线反向延长线会聚而成的，【不能】在光屏上承接，只能用眼睛透过透镜观察！'
      },
      chapter6: {
        title: '📐 本章中考重点公式：密度公式',
        derivatives: ['m = ρ V (计算质量)', 'V = m / ρ (计算体积)'],
        variables: [
          { symbol: 'ρ', name: '密度', unit: 'kg/m³ 或 g/cm³ (换算：1 g/cm³ = 1.0×10³ kg/m³)' },
          { symbol: 'm', name: '质量', unit: 'kg (千克) 或 g (克)' },
          { symbol: 'V', name: '体积', unit: 'm³ (立方米) 或 cm³ (立方厘米)' }
        ],
        warning: '密度是物质本身的一种固有属性。对于同一种物质，其密度值不随质量 m 的增多或体积 V 的改变而改变，且 ρ = m/V 仅用于计算，不决定密度大小！'
      },
      chapter7: {
        title: '📐 本章中考重点公式：重力与质量关系',
        derivatives: ['m = G / g (由重力推导质量)', '物体受到的重力与其质量成【正比】'],
        variables: [
          { symbol: 'G', name: '重力', unit: 'N (牛顿)，力的大小的基本单位' },
          { symbol: 'm', name: '质量', unit: 'kg (千克)，必须统一为千克才能代入公式计算' },
          { symbol: 'g', name: '重力常数', unit: '一般取 10 N/kg (或 9.8 N/kg)，表示 1kg 物体受到的重力是 10N' }
        ],
        warning: '重力的方向永远是【竖直向下】的（指向地心），斜面上的物体受到的重力也是竖直向下，而不是垂直斜面向下！'
      },
      chapter8: {
        title: '📐 本章中考重点公式：同一直线二力合成',
        derivatives: ['同方向：F_合 = F₁ + F₂ (方向与分力相同)', '反方向：F_合 = F₁ - F₂ (大力减小力，方向与大力相同)'],
        variables: [
          { symbol: '平衡力', name: '合力为 0', unit: '处于静止或匀速直线运动状态，受平衡力作用' },
          { symbol: 'f_滑动', name: '滑动摩擦力', unit: '只跟【压力大小】和【接触面粗糙程度】有关，与速度和面积无关' }
        ],
        warning: '只要物体做【匀速直线运动】或处于【静止状态】，它所受的力就一定是平衡力，合力为0！此时摩擦力大小必定等于拉力大小！'
      },
      chapter9: {
        title: '📐 本章中考重点公式：固体压强与液体压强',
        derivatives: ['F = p S (求固体压力)', '固体压强适用于一切情况；液体压强公式常用于容器内部液体'],
        variables: [
          { symbol: 'F', name: '压力', unit: '垂直作用在物体表面的力 (N)。静止在水平面时 F = G' },
          { symbol: 'S', name: '受力面积', unit: '物体间【实际接触】的面积 (m²)，绝不是底下大物体的总面积！' },
          { symbol: 'h', name: '液体深度', unit: '所求点到【自由液面】的垂直高度 (m)，千万不能从杯底算！' }
        ],
        warning: '计算压强时，必须先认准是固体还是液体。固体一般先找压力 F 再用 p=F/S 计算；液体必须先求深度 h，用 p=ρgh 计算压强，再用 F=pS 求压力！'
      },
      chapter10: {
        title: '📐 本章中考重点公式：浮力计算公式全套',
        derivatives: ['称重法：F_浮 = G - F_示 (测力计减小的示数)', '平衡法：F_浮 = G_物 (适用于漂浮、悬浮状态)'],
        variables: [
          { symbol: 'V_排', name: '排开液体体积', unit: '浸没时 V_排 = V_物；部分浸入时 V_排 < V_物' },
          { symbol: 'ρ_液', name: '液体密度', unit: 'kg/m³，注意盐水、清水、酒精的密度差异' }
        ],
        warning: '完全浸没后（V_排不变），物体受到的浮力与浸入液体的【深度无关】！即使继续往下沉，浮力也绝对不会再增加！'
      },
      chapter11: {
        title: '📐 本章中考重点公式：功与功率计算',
        derivatives: ['功的必要因素：有作用在物体上的力 + 沿力的方向移动了距离', '机械效率：η = W_有 / W_总 (有用功除以总功，η 永远小于 100%)'],
        variables: [
          { symbol: 'W', name: '功', unit: '焦耳 (J)，1 J = 1 N·m' },
          { symbol: 'P', name: '功率', unit: '瓦特 (W)，表示做功的快慢。1 W = 1 J/s' },
          { symbol: 's', name: '力的距离', unit: '物体在力 F 的【作用方向】上移动的距离，若方向垂直则力不做功！' }
        ],
        warning: '有三种情况不做功：① 有力无距离（推而不动）；② 有距离无力（因惯性滑行）；③ 力的方向与运动方向垂直（提着水桶水平向前走，提力不做功）！'
      },
      chapter12: {
        title: '📐 本章中考重点公式：杠杆平衡与滑轮组省力',
        derivatives: ['杠杆省力条件：动力臂 L₁ > 阻力臂 L₂ (省力但费距离)', '绳子自由端移动距离：s = n h (n 为承重绳子股数)'],
        variables: [
          { symbol: 'L', name: '力臂', unit: '支点到力作用线的【垂直距离】，绝不是支点到力作用点的距离！' },
          { symbol: 'n', name: '绳子段数', unit: '直接与动滑轮相连的绳子股数。看拉力方向是否从动滑轮引出' }
        ],
        warning: '任何机械都【不能省功】（功的原理）！省力的机械必然费距离（比如动滑轮省一半力，但必须费一倍距离 $s=2h$）；省距离的机械必然费力！'
      }
    };

    const guide = formulasMap[selectedChapterId];
    if (!guide) return null;

    return (
      <div style={{
        padding: '16px',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(59, 130, 246, 0.03))',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        borderRadius: 'var(--radius-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-work" style={{ backgroundColor: 'hsl(var(--color-work))', color: '#fff' }}>
            {guide.title.split('：')[0]}
          </span>
          <strong style={{ fontSize: '0.9rem', color: 'hsl(var(--text-primary))' }}>
            {guide.title.split('：')[1]}
          </strong>
        </div>

        {/* 核心公式展示 */}
        <div style={{
          padding: '10px 14px',
          backgroundColor: '#fff',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center',
          fontFamily: '"Times New Roman", Times, serif, "Cambria Math"',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'hsl(var(--color-work))'
        }}>
          <div>
            {selectedChapterId === 'chapter1' && <span>v = <sup>s</sup>&frasl;<sub>t</sub></span>}
            {selectedChapterId === 'chapter2' && <span style={{ fontSize: '1.2rem' }}>v<sub>声</sub> = 340 m/s (15℃)</span>}
            {selectedChapterId === 'chapter3' && <span style={{ fontSize: '1.1rem' }}>达到熔点/沸点 + 持续吸热</span>}
            {selectedChapterId === 'chapter4' && <span>∠r = ∠i</span>}
            {selectedChapterId === 'chapter5' && <span style={{ fontSize: '1.05rem' }}>u &gt; f (实像) / u &lt; f (虚像)</span>}
            {selectedChapterId === 'chapter6' && <span>ρ = <sup>m</sup>&frasl;<sub>V</sub></span>}
            {selectedChapterId === 'chapter7' && <span>G = m g</span>}
            {selectedChapterId === 'chapter8' && <span>F<sub>合</sub> = F₁ ± F₂</span>}
            {selectedChapterId === 'chapter9' && <span>p = <sup>F</sup>&frasl;<sub>S</sub> &nbsp;,&nbsp; p = ρ g h</span>}
            {selectedChapterId === 'chapter10' && <span style={{ fontSize: '1.3rem' }}>F<sub>浮</sub> = ρ<sub>液</sub> g V<sub>排</sub></span>}
            {selectedChapterId === 'chapter11' && <span>W = F s &nbsp;,&nbsp; P = <sup>W</sup>&frasl;<sub>t</sub> = Fv</span>}
            {selectedChapterId === 'chapter12' && <span style={{ fontSize: '1.2rem' }}>F₁L₁ = F₂L₂ &nbsp;,&nbsp; F = <sup>1</sup>&frasl;<sub>n</sub>(G<sub>物</sub>+G<sub>动</sub>)</span>}
          </div>
        </div>

        {/* 变量说明 */}
        <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '5px', borderTop: '1px dashed rgba(139, 92, 246, 0.15)', paddingTop: '8px' }}>
          <div style={{ fontWeight: 'bold', color: 'hsl(var(--text-secondary))', marginBottom: '2px' }}>📋 物理量含义及单位：</div>
          {guide.variables.map((v, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', lineHeight: '1.35' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'hsl(var(--color-mech))', minWidth: '35px' }}>{v.symbol}</span>
              <span style={{ color: 'hsl(var(--text-primary))', flex: 1 }}>
                <b>{v.name}</b> —— {v.unit}
              </span>
            </div>
          ))}
        </div>

        {/* 变形公式 */}
        <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '3px', borderTop: '1px dashed rgba(139, 92, 246, 0.15)', paddingTop: '8px' }}>
          <div style={{ fontWeight: 'bold', color: 'hsl(var(--text-secondary))', marginBottom: '2px' }}>🔄 常考规律与变形：</div>
          {guide.derivatives.map((d, i) => (
            <div key={i} style={{ color: 'hsl(var(--text-primary))', paddingLeft: '8px', position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, color: 'hsl(var(--color-work))' }}>•</span>
              {d}
            </div>
          ))}
        </div>

        {/* 警示 */}
        <div style={{
          fontSize: '0.76rem',
          color: 'hsl(var(--color-danger))',
          backgroundColor: 'rgba(229, 62, 62, 0.03)',
          border: '1px solid rgba(229, 62, 62, 0.1)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          lineHeight: '1.45',
          marginTop: '2px'
        }}>
          ⚠️ <b>名师避坑警示：</b>{guide.warning}
        </div>
      </div>
    );
  };

  // 生成 12 章节 SVG 插图
  const renderChapterIllustrations = () => {
    const list = [];

    // 第一章：机械运动 (刻度尺读数规范 + 平均速度跑道)
    if (selectedChapterId === 'chapter1') {
      list.push(
        <div key="c1-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 1.1：刻度尺的规范读数与估读要求</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="10" y="45" width="380" height="25" fill="#ffffff" stroke="#cbd5e0" strokeWidth="1.5" />
            {[0, 1, 2, 3, 4, 5].map((val) => (
              <g key={val}>
                <line x1={40 + val * 64} y1="45" x2={40 + val * 64} y2="60" stroke="#2d3748" strokeWidth="1.5" />
                <text x={40 + val * 64} y="40" fill="#2d3748" fontSize="10" fontWeight="bold" textAnchor="middle">{val} cm</text>
                {val < 5 && [1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
                  <line key={m} x1={40 + val * 64 + m * 6.4} y1="45" x2={40 + val * 64 + m * 6.4} y2={m === 5 ? '55' : '50'} stroke="#4a5568" strokeWidth="0.8" />
                ))}
              </g>
            ))}
            <rect x="104" y="70" width="157" height="16" fill="rgba(49, 130, 206, 0.15)" stroke="hsl(var(--color-mech))" strokeWidth="1.5" rx="1" />
            <text x="182.5" y="82" fill="hsl(var(--color-mech))" fontSize="9.5" fontWeight="bold" textAnchor="middle">被测木块</text>
            <line x1="104" y1="70" x2="104" y2="45" stroke="hsl(var(--color-danger))" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="261" y1="70" x2="261" y2="45" stroke="hsl(var(--color-danger))" strokeWidth="1" strokeDasharray="2,2" />
            <text x="20" y="102" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold">
              分度值：1mm ； 读数：2.45cm (末位5是估读值，木块长度 = 3.45cm - 1.00cm)
            </text>
          </svg>
        </div>
      );
      list.push(
        <div key="c1-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 1.2：平均速度计算 (v = s_总 / t_总)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="70" x2="380" y2="70" stroke="#718096" strokeWidth="2.5" />
            <circle cx="20" cy="70" r="4" fill="#2d3748" /><text x="20" y="85" fontSize="8" textAnchor="middle">起点</text>
            <circle cx="180" cy="70" r="4" fill="#2d3748" /><text x="180" y="85" fontSize="8" textAnchor="middle">中点</text>
            <circle cx="380" cy="70" r="4" fill="#2d3748" /><text x="380" y="85" fontSize="8" textAnchor="middle">终点</text>
            <path d="M 20 35 L 180 35" fill="none" stroke="hsl(var(--color-optics))" strokeWidth="2" markerEnd="url(#ill-arrow)" />
            <text x="100" y="27" fill="hsl(var(--color-optics))" fontSize="9" fontWeight="bold" textAnchor="middle">前半程 s₁ = 4m (t₁ = 1s)</text>
            <path d="M 180 35 L 380 35" fill="none" stroke="hsl(var(--color-mech))" strokeWidth="2" markerEnd="url(#ill-arrow)" />
            <text x="280" y="27" fill="hsl(var(--color-mech))" fontSize="9" fontWeight="bold" textAnchor="middle">后半程 s₂ = 6m (t₂ = 2s)</text>
            <text x="20" y="102" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold">
              🚫 避坑：平均速度 v ≠ (v₁ + v₂)/2 ！ 应计算：v = s_总 / t_总 = 10m / 3s = 3.33 m/s
            </text>
          </svg>
        </div>
      );
    }

    // 第二章：声现象 (音叉振动产生声音 + 响度与音调波形)
    if (selectedChapterId === 'chapter2') {
      list.push(
        <div key="c2-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 2.1：声音的产生原理 (音叉振动激起水花)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <path d="M 160 50 L 170 100 L 230 100 L 240 50 Z" fill="rgba(49, 130, 206, 0.15)" stroke="#718096" strokeWidth="2" />
            <line x1="168" y1="60" x2="232" y2="60" stroke="#3182ce" strokeWidth="1.5" />
            <path d="M 190 20 L 190 65 M 210 20 L 210 65 M 190 65 Q 200 75 210 65 M 200 70 L 200 90" fill="none" stroke="#4a5568" strokeWidth="3" strokeLinecap="round" />
            <path d="M 183 60 Q 185 53 180 55 M 217 60 Q 215 53 220 55" fill="none" stroke="#3182ce" strokeWidth="1.5" />
            <path d="M 175 60 Q 170 52 178 48 M 225 60 Q 230 52 222 48" fill="none" stroke="#3182ce" strokeWidth="1" />
            <text x="50" y="55" fill="hsl(var(--color-optics))" fontSize="10" fontWeight="bold">敲击发声</text>
            <text x="350" y="55" fill="hsl(var(--color-mech))" fontSize="10" fontWeight="bold" textAnchor="end">激起水花</text>
            <text x="200" y="108" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold" textAnchor="middle">
              核心要点：一切发声的物体都在振动，振动停止，发声停止
            </text>
          </svg>
        </div>
      );
      
      const drawWave = (mode) => {
        let amp = 18; 
        let freq = 0.05; 
        if (mode === 'high-pitch') { freq = 0.12; amp = 18; }
        if (mode === 'loud') { freq = 0.05; amp = 32; }
        const pts = [];
        for (let x = 10; x <= 390; x++) {
          const y = 50 + amp * Math.sin((x - 10) * freq);
          pts.push(`${x},${y}`);
        }
        return pts.join(' ');
      };
      list.push(
        <div key="c2-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', fontWeight: 'bold' }}>🖼️ 图解 2.2：音调、响度与波形关系</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: waveMode === 'normal' ? 'hsl(var(--color-mech))' : '', color: waveMode === 'normal' ? '#fff' : '' }} onClick={() => setWaveMode('normal')}>标准声</button>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: waveMode === 'high-pitch' ? 'hsl(var(--color-optics))' : '', color: waveMode === 'high-pitch' ? '#fff' : '' }} onClick={() => setWaveMode('high-pitch')}>高音调</button>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: waveMode === 'loud' ? 'hsl(var(--color-heat))' : '', color: waveMode === 'loud' ? '#fff' : '' }} onClick={() => setWaveMode('loud')}>大响度</button>
            </div>
          </div>
          <svg width="100%" height="95" viewBox="0 0 400 95" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="10" y1="50" x2="390" y2="50" stroke="#cbd5e0" strokeDasharray="3,3" />
            <polyline points={drawWave(waveMode)} fill="none" stroke={waveMode === 'high-pitch' ? 'hsl(var(--color-optics))' : waveMode === 'loud' ? 'hsl(var(--color-heat))' : 'hsl(var(--color-mech))'} strokeWidth="2.2" style={{ transition: 'all 0.3s ease' }} />
            <text x="15" y="18" fill="#2d3748" fontSize="9.5" fontWeight="bold">
              {waveMode === 'normal' && '正常音叉声波波形'}
              {waveMode === 'high-pitch' && '🔊 波形密集：频率高 → 音调尖锐'}
              {waveMode === 'loud' && '🔊 波形振幅大：能量强 → 响度宏亮'}
            </text>
          </svg>
        </div>
      );
    }

    // 第三章：物态变化 (温度计读数视线 + 物态轮回图)
    if (selectedChapterId === 'chapter3') {
      list.push(
        <div key="c3-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 3.1：液体温度计的正确读数视线规范</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="185" y="10" width="30" height="90" fill="#ffffff" stroke="#a0aec0" strokeWidth="2" rx="3" />
            {[20, 30, 40].map((t, idx) => (
              <g key={t}>
                <line x1="185" y1={80 - idx * 30} x2="195" y2={80 - idx * 30} stroke="#2d3748" strokeWidth="1.5" />
                <text x="200" y={84 - idx * 30} fill="#2d3748" fontSize="9" fontWeight="bold">{t}℃</text>
              </g>
            ))}
            <rect x="194" y="35" width="12" height="65" fill="#e53e3e" rx="1" />
            <circle cx="200" cy="100" r="10" fill="#e53e3e" />
            <line x1="300" y1="15" x2="206" y2="35" stroke="hsl(var(--color-danger))" strokeWidth="1.2" strokeDasharray="3,3" markerEnd="url(#ill-arrow)" />
            <text x="310" y="18" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold">A 俯视：读数偏大 (❌)</text>
            <line x1="300" y1="35" x2="208" y2="35" stroke="hsl(var(--color-success))" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#ill-arrow)" />
            <text x="310" y="38" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold">B 平视：视线齐平 (✅ 35℃)</text>
            <line x1="300" y1="55" x2="206" y2="35" stroke="hsl(var(--color-warning))" strokeWidth="1.2" strokeDasharray="3,3" markerEnd="url(#ill-arrow)" />
            <text x="310" y="58" fill="hsl(var(--color-warning))" fontSize="9.5" fontWeight="bold">C 仰视：读数偏小 (❌)</text>
          </svg>
        </div>
      );
      
      const getLineColor = (state) => activeStateChange === state ? 'hsl(var(--color-mech))' : '#cbd5e0';
      const statesInfo = {
        melt: { name: '熔化 (固态 → 液态)', heat: '吸热 🌡️', eg: '例: 冰化成水' },
        solid: { name: '凝固 (液态 → 固态)', heat: '放热 ❄️', eg: '例: 水结冰' },
        vap: { name: '汽化 (液态 → 气态)', heat: '吸热 🌡️', eg: '例: 湿衣服变干' },
        liq: { name: '液化 (气态 → 液态)', heat: '放热 ❄️', eg: '例: 雾与露、“白气”' },
        sub: { name: '升华 (固态 → 气态)', heat: '吸热 🌡️', eg: '例: 樟脑丸变小' },
        dep: { name: '凝华 (气态 → 固态)', heat: '放热 ❄️', eg: '例: 霜与雾凇的形成' }
      };
      list.push(
        <div key="c3-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 3.2：物态变化六角循环与吸放热图</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', alignItems: 'center' }}>
            <svg width="100%" height="130" viewBox="0 0 220 130" style={{ maxWidth: '220px' }}>
              <circle cx="35" cy="100" r="19" fill="#ffffff" stroke="hsl(var(--color-optics))" strokeWidth="2" />
              <text x="35" y="104" fill="#2d3748" fontSize="10" fontWeight="bold" textAnchor="middle">固态</text>
              <circle cx="185" cy="100" r="19" fill="#ffffff" stroke="hsl(var(--color-mech))" strokeWidth="2" />
              <text x="185" y="104" fill="#2d3748" fontSize="10" fontWeight="bold" textAnchor="middle">液态</text>
              <circle cx="110" cy="28" r="19" fill="#ffffff" stroke="#718096" strokeWidth="2" />
              <text x="110" y="32" fill="#2d3748" fontSize="10" fontWeight="bold" textAnchor="middle">气态</text>
              
              <path d="M 55 92 L 165 92" fill="none" stroke={getLineColor('melt')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('melt')} style={{ cursor: 'pointer' }} />
              <path d="M 165 108 L 55 108" fill="none" stroke={getLineColor('solid')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('solid')} style={{ cursor: 'pointer' }} />
              <path d="M 174 82 L 125 38" fill="none" stroke={getLineColor('liq')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('liq')} style={{ cursor: 'pointer' }} />
              <path d="M 125 28 L 179 73" fill="none" stroke={getLineColor('vap')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('vap')} style={{ cursor: 'pointer' }} />
              <path d="M 46 82 L 95 38" fill="none" stroke={getLineColor('sub')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('sub')} style={{ cursor: 'pointer' }} />
              <path d="M 95 28 L 41 73" fill="none" stroke={getLineColor('dep')} strokeWidth="2.5" markerEnd="url(#ill-arrow)" onClick={() => setActiveStateChange('dep')} style={{ cursor: 'pointer' }} />
            </svg>
            <div style={{ fontSize: '0.75rem', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', minHeight: '80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid #edf2f7' }}>
              {activeStateChange ? (
                <div>
                  <div style={{ fontWeight: 'bold', color: 'hsl(var(--color-mech))', fontSize: '0.78rem' }}>{statesInfo[activeStateChange].name}</div>
                  <div style={{ color: statesInfo[activeStateChange].heat.includes('吸热') ? 'hsl(var(--color-heat))' : 'hsl(var(--color-success))', margin: '2px 0', fontWeight: 'bold' }}>{statesInfo[activeStateChange].heat}</div>
                  <div style={{ opacity: 0.8, fontSize: '0.68rem' }}>{statesInfo[activeStateChange].eg}</div>
                </div>
              ) : (
                <div style={{ opacity: 0.6, textAlign: 'center', fontSize: '0.68rem' }}>点击左侧剪头查看性质详情</div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 第四章：光现象 (小孔成像 + 折射图)
    if (selectedChapterId === 'chapter4') {
      list.push(
        <div key="c4-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 4.1：小孔成像原理 (光沿直线传播成倒立实像)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="30" y="45" width="5" height="40" fill="#e53e3e" rx="1.5" />
            <path d="M 32.5 45 Q 28 35 32.5 25 Q 37 35 32.5 45" fill="none" stroke="hsl(var(--color-heat))" />
            <text x="32.5" y="100" fill="#e53e3e" fontSize="9.5" fontWeight="bold" textAnchor="middle">物 (蜡烛)</text>
            <line x1="200" y1="10" x2="200" y2="48" stroke="#4a5568" strokeWidth="3.5" />
            <circle cx="200" cy="52" r="2" fill="none" stroke="#2d3748" strokeWidth="1" />
            <line x1="200" y1="56" x2="200" y2="100" stroke="#4a5568" strokeWidth="3.5" />
            <text x="200" y="108" fill="#4a5568" fontSize="8" fontWeight="bold" textAnchor="middle">小孔板</text>
            <line x1="330" y1="10" x2="330" y2="100" stroke="#cbd5e0" strokeWidth="2" strokeDasharray="3,3" />
            <rect x="328" y="65" width="4" height="30" fill="rgba(229, 62, 62, 0.5)" rx="1" />
            <text x="330" y="108" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">倒立实像</text>
            <line x1="32.5" y1="25" x2="330" y2="78" stroke="hsl(var(--color-optics))" strokeWidth="1.2" strokeDasharray="4,2" />
            <line x1="32.5" y1="85" x2="330" y2="20" stroke="hsl(var(--color-mech))" strokeWidth="1.2" strokeDasharray="4,2" />
          </svg>
        </div>
      );
    }

    // 第五章：透镜应用 (凸会聚与凹发散 + 凸透镜大实验)
    if (selectedChapterId === 'chapter5') {
      list.push(
        <div key="c5-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 5.1：凸透镜对光会聚 vs 凹透镜对光发散</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <path d="M 90 20 Q 98 55 90 90 Q 82 55 90 90 Z" fill="rgba(49, 130, 206, 0.12)" stroke="#3182ce" strokeWidth="1.5" />
            <line x1="20" y1="55" x2="160" y2="55" stroke="#718096" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M 30 35 L 90 35 L 140 55" fill="none" stroke="hsl(var(--color-optics))" strokeWidth="1.5" />
            <path d="M 30 75 L 90 75 L 140 55" fill="none" stroke="hsl(var(--color-optics))" strokeWidth="1.5" />
            <circle cx="140" cy="55" r="3" fill="hsl(var(--color-danger))" />
            <text x="140" y="68" fill="hsl(var(--color-danger))" fontSize="9" fontWeight="bold" textAnchor="middle">焦点 F</text>
            <text x="80" y="103" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">凸透镜 (会聚)</text>

            <path d="M 290 20 L 306 20 Q 298 55 306 90 L 290 90 Q 298 55 290 20 Z" fill="rgba(49, 130, 206, 0.12)" stroke="#3182ce" strokeWidth="1.5" />
            <line x1="220" y1="55" x2="380" y2="55" stroke="#718096" strokeWidth="1" strokeDasharray="4,4" />
            <path d="M 230 35 L 298 35 L 350 20" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <path d="M 230 75 L 298 75 L 350 90" fill="none" stroke="hsl(var(--color-work))" strokeWidth="1.5" />
            <line x1="298" y1="35" x2="260" y2="55" stroke="hsl(var(--color-work))" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="298" y1="75" x2="260" y2="55" stroke="hsl(var(--color-work))" strokeWidth="1" strokeDasharray="2,2" />
            <circle cx="260" cy="55" r="3" fill="#e53e3e" />
            <text x="260" y="68" fill="#e53e3e" fontSize="9" fontWeight="bold" textAnchor="middle">虚焦点 F</text>
            <text x="300" y="103" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">凹透镜 (发散)</text>
          </svg>
        </div>
      );
    }

    // 第六章：质量与密度 (天平秤盘 + m-V 图像)
    if (selectedChapterId === 'chapter6') {
      list.push(
        <div key="c6-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 6.1：托盘天平测量与读取标尺游码</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="80" y1="100" x2="320" y2="100" stroke="#718096" strokeWidth="3" />
            <polygon points="200,55 191,95 209,95" fill="#a0aec0" />
            <line x1="110" y1="55" x2="290" y2="55" stroke="#d69e2e" strokeWidth="3" />
            <line x1="110" y1="55" x2="110" y2="80" stroke="#d69e2e" strokeWidth="1.5" />
            <ellipse cx="110" cy="80" rx="30" ry="4" fill="#cbd5e0" />
            <rect x="95" y="62" width="30" height="17" fill="rgba(66,153,225,0.2)" stroke="hsl(var(--color-mech))" rx="2" />
            <text x="110" y="73" fill="hsl(var(--color-mech))" fontSize="8" fontWeight="bold" textAnchor="middle">木块</text>
            <line x1="290" y1="55" x2="290" y2="80" stroke="#d69e2e" strokeWidth="1.5" />
            <ellipse cx="290" cy="80" rx="30" ry="4" fill="#cbd5e0" />
            <rect x="270" y="68" width="18" height="11" fill="#e2e8f0" stroke="#4a5568" rx="1" />
            <text x="279" y="76" fill="#2d3748" fontSize="7" fontWeight="bold" textAnchor="middle">50g</text>
            <rect x="291" y="70" width="15" height="9" fill="#e2e8f0" stroke="#4a5568" rx="1" />
            <text x="298.5" y="77" fill="#2d3748" fontSize="6.5" fontWeight="bold" textAnchor="middle">20g</text>
            <line x1="200" y1="55" x2="200" y2="28" stroke="#e53e3e" strokeWidth="2" />
            <rect x="140" y="8" width="120" height="8" fill="#ffffff" stroke="#a0aec0" />
            <rect x="175" y="6" width="8" height="12" fill="hsl(var(--color-optics))" rx="1" />
            <text x="200" y="3" fill="#2d3748" fontSize="7.5" fontWeight="bold" textAnchor="middle">标尺游码读数: 2.4g</text>
            <text x="20" y="98" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold">木块质量 m = 50g + 20g + 2.4g = 72.4g (左物右码)</text>
          </svg>
        </div>
      );
      list.push(
        <div key="c6-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 6.2：质量-体积图像 (m-V) 斜率即密度</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="40" y1="95" x2="380" y2="95" stroke="#718096" strokeWidth="1.5" />
            <text x="375" y="105" fill="#4a5568" fontSize="9" fontWeight="bold">体积 V/cm³</text>
            <line x1="40" y1="95" x2="40" y2="10" stroke="#718096" strokeWidth="1.5" />
            <text x="15" y="18" fill="#4a5568" fontSize="9" fontWeight="bold">质量 m/g</text>
            <line x1="40" y1="95" x2="300" y2="30" stroke="hsl(var(--color-mech))" strokeWidth="2.5" />
            <text x="280" y="24" fill="hsl(var(--color-mech))" fontSize="9.5" fontWeight="bold">水 (ρ = 1.0 g/cm³)</text>
            <line x1="40" y1="95" x2="330" y2="50" stroke="hsl(var(--color-optics))" strokeWidth="2.5" />
            <text x="320" y="65" fill="hsl(var(--color-optics))" fontSize="9.5" fontWeight="bold">酒精 (ρ = 0.8 g/cm³)</text>
            <text x="60" y="85" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold">
              同种物质：m与V成正比；不同物质：图线斜率越大，说明密度ρ越大 (ρ = m / V)
            </text>
          </svg>
        </div>
      );
    }

    // 第七章：力 (弹簧测力计原理 + 重力分析)
    if (selectedChapterId === 'chapter7') {
      list.push(
        <div key="c7-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 7.1：弹簧测力计原理及拉力作用效果</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="60" y="40" width="280" height="30" fill="#ffffff" stroke="#a0aec0" strokeWidth="2" rx="3" />
            <circle cx="45" cy="55" r="10" fill="none" stroke="#718096" strokeWidth="2" />
            <path d="M 60 55 L 75 55 Q 80 45 85 55 Q 90 65 95 55 Q 100 45 105 55 Q 110 65 115 55 Q 120 45 125 55 Q 130 65 135 55 L 180 55" fill="none" stroke="#718096" strokeWidth="2.2" />
            <rect x="180" y="35" width="4" height="40" fill="#e53e3e" />
            <text x="365" y="70" fill="hsl(var(--color-success))" fontSize="10.5" fontWeight="bold">F = 3.0 N</text>
            {[0, 1, 2, 3, 4, 5].map((t) => (
              <g key={t}>
                <line x1={100 + t * 40} y1="40" x2={100 + t * 40} y2="48" stroke="#2d3748" strokeWidth="1" />
                <text x={100 + t * 40} y="33" fill="#2d3748" fontSize="8.5" fontWeight="bold" textAnchor="middle">{t}N</text>
              </g>
            ))}
            <text x="200" y="98" fill="hsl(var(--color-mech))" fontSize="9.5" fontWeight="bold" textAnchor="middle">
              物理原理：在弹性限度内，弹簧的伸长量与受到的拉力成正比
            </text>
          </svg>
        </div>
      );
      list.push(
        <div key="c7-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 7.2：重力分析 (总是竖直向下，非垂直斜面)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="10" y1="100" x2="390" y2="100" stroke="#718096" strokeWidth="2.5" />
            <polygon points="40,100 300,30 300,100" fill="#ffffff" stroke="#cbd5e0" strokeWidth="1" />
            <text x="240" y="92" fill="#718096" fontSize="9" fontWeight="bold">水平面</text>
            <g transform="translate(170, 68) rotate(-16)">
              <rect x="-18" y="-26" width="36" height="26" fill="rgba(100, 200, 255, 0.15)" stroke="hsl(var(--color-mech))" strokeWidth="1.5" />
            </g>
            <line x1="172" y1="60" x2="172" y2="96" stroke="hsl(var(--color-danger))" strokeWidth="3" markerEnd="url(#ill-arrow)" />
            <text x="175" y="80" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold">G 重力 (竖直向下)</text>
            <line x1="172" y1="60" x2="163" y2="96" stroke="#cbd5e0" strokeWidth="1.2" strokeDasharray="3,2" markerEnd="url(#ill-arrow)" />
            <text x="110" y="86" fill="#718096" fontSize="8">❌ 错误：垂直斜面向下</text>
          </svg>
        </div>
      );
    }

    // 第八章：运动和力 (阻力对运动影响 + 摩擦力二力平衡)
    if (selectedChapterId === 'chapter8') {
      list.push(
        <div key="c8-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 8.1：探究阻力对小车运动的影响 (牛一基础)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="10" y1="30" x2="390" y2="30" stroke="#718096" strokeWidth="1.5" />
            <line x1="40" y1="30" x2="140" y2="30" stroke="hsl(var(--color-heat))" strokeWidth="3" />
            <rect x="35" y="18" width="16" height="10" fill="hsl(var(--color-optics))" rx="1" />
            <circle cx="120" cy="30" r="3" fill="#cbd5e0" />
            <text x="145" y="25" fill="#2d3748" fontSize="8.5" fontWeight="bold">① 毛巾表面：阻力最大，滑得最近</text>

            <line x1="10" y1="60" x2="390" y2="60" stroke="#718096" strokeWidth="1.5" />
            <line x1="40" y1="60" x2="220" y2="60" stroke="hsl(var(--color-optics))" strokeWidth="3" />
            <rect x="35" y="48" width="16" height="10" fill="hsl(var(--color-optics))" rx="1" />
            <circle cx="190" cy="60" r="3" fill="#cbd5e0" />
            <text x="225" y="55" fill="#2d3748" fontSize="8.5" fontWeight="bold">② 棉布表面：阻力中等，滑行较远</text>

            <line x1="10" y1="90" x2="390" y2="90" stroke="#718096" strokeWidth="1.5" />
            <line x1="40" y1="90" x2="350" y2="90" stroke="hsl(var(--color-mech))" strokeWidth="3" />
            <rect x="35" y="78" width="16" height="10" fill="hsl(var(--color-optics))" rx="1" />
            <circle cx="310" cy="90" r="3" fill="#cbd5e0" />
            <text x="325" y="85" fill="#2d3748" fontSize="8.5" fontWeight="bold">③ 木板：阻力最小，滑行最远</text>
          </svg>
        </div>
      );
      list.push(
        <div key="c8-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 8.2：滑动摩擦力判定与二力平衡条件</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="80" x2="380" y2="80" stroke="#718096" strokeWidth="2" />
            <line x1="20" y1="82" x2="380" y2="82" stroke="#cbd5e0" strokeWidth="1" strokeDasharray="3,2" />
            <rect x="160" y="38" width="80" height="42" fill="rgba(245, 158, 11, 0.08)" stroke="hsl(var(--color-optics))" strokeWidth="2" rx="3" />
            <text x="200" y="62" fill="hsl(var(--color-optics))" fontSize="9" fontWeight="bold" textAnchor="middle">匀速直线运动</text>
            <line x1="240" y1="58" x2="320" y2="58" stroke="hsl(var(--color-success))" strokeWidth="3" markerEnd="url(#ill-arrow)" />
            <text x="310" y="47" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold">拉力 F = 15 N</text>
            <line x1="160" y1="58" x2="80" y2="58" stroke="hsl(var(--color-danger))" strokeWidth="3" markerEnd="url(#ill-arrow)" />
            <text x="90" y="47" fill="hsl(var(--color-danger))" fontSize="9" fontWeight="bold" textAnchor="end">摩擦力 f = 15 N</text>
            <text x="20" y="20" fill="hsl(var(--color-mech))" fontSize="10" fontWeight="bold">平衡时拉力与摩擦力：大小相等、方向相反 (f = F)</text>
          </svg>
        </div>
      );
    }

    // 第九章：压强 (海绵小桌 + 液体深度)
    if (selectedChapterId === 'chapter9') {
      list.push(
        <div key="c9-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 9.1：探究压力作用效果影响因素 (海绵小桌实验)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="20" y="75" width="360" height="25" fill="#ffffff" stroke="#cbd5e0" />
            <text x="200" y="92" fill="#718096" fontSize="9" textAnchor="middle">海绵垫</text>
            <path d="M 50 78 L 110 78" stroke="#4a5568" strokeWidth="2" />
            <line x1="55" y1="78" x2="55" y2="55" stroke="#4a5568" strokeWidth="2.5" />
            <line x1="105" y1="78" x2="105" y2="55" stroke="#4a5568" strokeWidth="2.5" />
            <rect x="52" y="50" width="56" height="5" fill="#2d3748" />
            <circle cx="80" cy="40" r="10" fill="#cbd5e0" stroke="#718096" />
            <text x="80" y="43" fontSize="8" textAnchor="middle">砝码</text>
            <text x="80" y="10" fill="hsl(var(--color-danger))" fontSize="8.5" fontWeight="bold" textAnchor="middle">A: 压强面陷得深</text>

            <rect x="175" y="75" width="50" height="5" fill="#2d3748" />
            <line x1="180" y1="75" x2="180" y2="52" stroke="#4a5568" strokeWidth="2.5" />
            <line x1="220" y1="75" x2="220" y2="52" stroke="#4a5568" strokeWidth="2.5" />
            <line x1="170" y1="52" x2="230" y2="52" stroke="#4a5568" strokeWidth="2" />
            <circle cx="200" cy="42" r="10" fill="#cbd5e0" stroke="#718096" />
            <text x="200" y="45" fontSize="8" textAnchor="middle">砝码</text>
            <text x="200" y="10" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">B: 面积大，陷得浅</text>

            <path d="M 290 75 L 350 75" stroke="#4a5568" strokeWidth="2" />
            <line x1="295" y1="75" x2="295" y2="55" stroke="#4a5568" strokeWidth="2.5" />
            <line x1="345" y1="75" x2="345" y2="55" stroke="#4a5568" strokeWidth="2.5" />
            <rect x="292" y="50" width="56" height="5" fill="#2d3748" />
            <text x="320" y="10" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">C: 压力小，陷得浅</text>
          </svg>
        </div>
      );
      list.push(
        <div key="c9-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 9.2：液体深度 h 的常考辨析 (h 是距自由液面的高度)</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <path d="M 120 15 L 120 45 L 80 100 L 320 100 L 280 45 L 280 15 Z" fill="none" stroke="#718096" strokeWidth="2" />
            <rect x="122" y="30" width="156" height="70" fill="rgba(66, 153, 225, 0.15)" />
            <path d="M 122 30 L 278 30" stroke="hsl(var(--color-mech))" strokeWidth="2" />
            <circle cx="180" cy="78" r="4.5" fill="hsl(var(--color-danger))" />
            <text x="188" y="82" fill="hsl(var(--color-danger))" fontSize="9.5" fontWeight="bold">测点 A</text>
            <line x1="165" y1="30" x2="165" y2="78" stroke="hsl(var(--color-success))" strokeWidth="2" />
            <line x1="160" y1="30" x2="170" y2="30" stroke="hsl(var(--color-success))" strokeWidth="1.2" />
            <line x1="160" y1="78" x2="170" y2="78" stroke="hsl(var(--color-success))" strokeWidth="1.2" />
            <text x="156" y="58" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold" textAnchor="end">✅ 深度 h (面起)</text>
            <line x1="210" y1="78" x2="210" y2="99" stroke="#cbd5e0" strokeWidth="1" strokeDasharray="3,3" />
            <text x="214" y="93" fill="#718096" fontSize="8">❌ 错误：到容器底的距离</text>
          </svg>
        </div>
      );
    }

    // 第十章：浮力 (阿基米德溢水杯)
    if (selectedChapterId === 'chapter10') {
      list.push(
        <div key="c10-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 10.1：阿基米德原理与溢水杯实验流程</div>
          <svg width="100%" height="120" viewBox="0 0 400 120" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <rect x="50" y="10" width="30" height="40" fill="#ffffff" stroke="#a0aec0" />
            <text x="65" y="32" fontSize="9" fontWeight="bold" textAnchor="middle">G=4N</text>
            <line x1="65" y1="50" x2="65" y2="70" stroke="#2d3748" />
            <rect x="55" y="70" width="20" height="20" fill="rgba(245, 158, 11, 0.3)" stroke="hsl(var(--color-optics))" />
            <text x="65" y="105" fontSize="8.5" fontWeight="bold" textAnchor="middle">① 空气中测重力 G</text>

            <rect x="230" y="10" width="30" height="40" fill="#ffffff" stroke="#a0aec0" />
            <text x="245" y="32" fontSize="9" fontWeight="bold" textAnchor="middle">F\'=3N</text>
            <line x1="245" y1="50" x2="245" y2="70" stroke="#2d3748" />
            <rect x="235" y="70" width="20" height="20" fill="rgba(245, 158, 11, 0.3)" stroke="hsl(var(--color-optics))" />
            <path d="M 215 80 L 265 80 L 265 115 L 215 115 Z" fill="rgba(66, 153, 225, 0.15)" stroke="#718096" strokeWidth="1.5" />
            <path d="M 265 85 L 285 92" stroke="#3182ce" strokeWidth="2" />
            <path d="M 285 95 L 305 95 L 305 115 L 285 115 Z" fill="rgba(66, 153, 225, 0.3)" stroke="#718096" strokeWidth="1.2" />
            <text x="295" y="108" fill="hsl(var(--color-success))" fontSize="8.5" fontWeight="bold" textAnchor="middle">G排=1N</text>
            <text x="260" y="118" fontSize="8.5" fontWeight="bold" textAnchor="middle">② 排水 F_浮 = G_排 = 1N</text>
          </svg>
        </div>
      );
    }

    // 第十一章：功和能 (功原理 + 单摆动能势能)
    if (selectedChapterId === 'chapter11') {
      list.push(
        <div key="c11-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 11.1：功的原理与动滑轮省力费距离验证</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="20" y1="15" x2="160" y2="15" stroke="#a0aec0" strokeWidth="2.5" />
            <rect x="70" y="60" width="30" height="20" fill="rgba(49, 130, 206, 0.2)" stroke="hsl(var(--color-mech))" />
            <text x="85" y="73" fill="hsl(var(--color-mech))" fontSize="9" fontWeight="bold" textAnchor="middle">G = 10 N</text>
            <path d="M 85 60 L 85 25" fill="none" stroke="#2d3748" markerEnd="url(#ill-arrow)" />
            <text x="85" y="98" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">A: 直接提 h=0.2m (W=2J)</text>

            <line x1="200" y1="15" x2="380" y2="15" stroke="#a0aec0" strokeWidth="2.5" />
            <circle cx="280" cy="55" r="14" fill="#ffffff" stroke="#4a5568" strokeWidth="2" />
            <rect x="268" y="78" width="24" height="16" fill="rgba(49, 130, 206, 0.2)" stroke="hsl(var(--color-mech))" />
            <text x="280" y="90" fill="hsl(var(--color-mech))" fontSize="8" fontWeight="bold" textAnchor="middle">10 N</text>
            <line x1="280" y1="69" x2="280" y2="78" stroke="#4a5568" />
            <path d="M 266 15 L 266 55 A 14 14 0 0 0 294 55 L 294 25" fill="none" stroke="#2d3748" strokeWidth="1.5" />
            <path d="M 294 25 L 320 15" fill="none" stroke="#2d3748" strokeWidth="1.5" markerEnd="url(#ill-arrow)" />
            <text x="325" y="27" fill="hsl(var(--color-success))" fontSize="9" fontWeight="bold">F = 5 N (s=0.4m)</text>
            <text x="290" y="103" fill="#2d3748" fontSize="9.5" fontWeight="bold" textAnchor="middle">B: 动滑轮提 (W = Fs = 2J)</text>
          </svg>
        </div>
      );
      
      const getEnergyRatio = (pos) => {
        if (pos === 'top') return { ke: 0, pe: 100 };
        if (pos === 'mid') return { ke: 60, pe: 40 };
        return { ke: 100, pe: 0 }; 
      };
      const ratios = getEnergyRatio(pendulumPos);
      list.push(
        <div key="c11-2" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', fontWeight: 'bold' }}>🖼️ 图解 11.2：单摆动能与势能相互转化及守恒</span>
            <div style={{ display: 'flex', gap: '3px' }}>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: pendulumPos === 'top' ? 'hsl(var(--color-heat))' : '', color: pendulumPos === 'top' ? '#fff' : '' }} onClick={() => setPendulumPos('top')}>最高点</button>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: pendulumPos === 'mid' ? 'hsl(var(--color-optics))' : '', color: pendulumPos === 'mid' ? '#fff' : '' }} onClick={() => setPendulumPos('mid')}>过渡态</button>
              <button className="btn btn-secondary" style={{ padding: '2px 5px', fontSize: '0.65rem', backgroundColor: pendulumPos === 'bottom' ? 'hsl(var(--color-mech))' : '', color: pendulumPos === 'bottom' ? '#fff' : '' }} onClick={() => setPendulumPos('bottom')}>最低点</button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', alignItems: 'center' }}>
            <svg width="100%" height="90" viewBox="0 0 200 90" style={{ maxWidth: '200px' }}>
              <line x1="20" y1="10" x2="180" y2="10" stroke="#718096" strokeWidth="2" />
              {pendulumPos === 'top' && (
                <>
                  <line x1="100" y1="10" x2="40" y2="65" stroke="#4a5568" strokeWidth="1.5" />
                  <circle cx="40" cy="65" r="8" fill="rgba(239, 68, 68, 0.2)" stroke="hsl(var(--color-heat))" strokeWidth="1.5" />
                  <text x="32" y="85" fill="hsl(var(--color-heat))" fontSize="8" fontWeight="bold">最高点 A</text>
                </>
              )}
              {pendulumPos === 'mid' && (
                <>
                  <line x1="100" y1="10" x2="70" y2="78" stroke="#4a5568" strokeWidth="1.5" />
                  <circle cx="70" cy="78" r="8" fill="rgba(59, 130, 246, 0.2)" stroke="hsl(var(--color-optics))" strokeWidth="1.5" />
                  <text x="70" y="93" fill="hsl(var(--color-optics))" fontSize="8" fontWeight="bold">B点</text>
                </>
              )}
              {pendulumPos === 'bottom' && (
                <>
                  <line x1="100" y1="10" x2="100" y2="83" stroke="#4a5568" strokeWidth="1.5" />
                  <circle cx="100" cy="83" r="8" fill="rgba(16, 185, 129, 0.2)" stroke="hsl(var(--color-mech))" strokeWidth="1.5" />
                  <text x="100" y="98" fill="hsl(var(--color-mech))" fontSize="8" fontWeight="bold" textAnchor="middle">最低点 C</text>
                </>
              )}
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--color-heat))', fontWeight: 'bold' }}>
                  <span>重力势能 Ep:</span><span>{ratios.pe}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ratios.pe}%`, height: '100%', backgroundColor: 'hsl(var(--color-heat))', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--color-success))', fontWeight: 'bold' }}>
                  <span>动能 Ek:</span><span>{ratios.ke}%</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ratios.ke}%`, height: '100%', backgroundColor: 'hsl(var(--color-success))', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 第十二章：简单机械 (滑轮组省力费距离)
    if (selectedChapterId === 'chapter12') {
      list.push(
        <div key="c12-1" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解 12.1：滑轮组省力与绳子股数 n 判定</div>
          <svg width="100%" height="120" viewBox="0 0 400 120" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            <line x1="40" y1="10" x2="360" y2="10" stroke="#718096" strokeWidth="2.5" />
            <circle cx="100" cy="35" r="10" fill="#ffffff" stroke="#4a5568" strokeWidth="1.5" />
            <circle cx="100" cy="75" r="10" fill="#ffffff" stroke="#4a5568" strokeWidth="1.5" />
            <rect x="90" y="93" width="20" height="15" fill="rgba(49,130,206,0.15)" stroke="hsl(var(--color-mech))" />
            <text x="100" y="104" fontSize="7" fontWeight="bold" textAnchor="middle">G=12N</text>
            <path d="M 90 35 L 90 75 A 10 10 0 0 0 110 75 L 110 15" fill="none" stroke="#2d3748" strokeWidth="1.2" />
            <path d="M 110 15 L 125 5" fill="none" stroke="#2d3748" strokeWidth="1.2" markerEnd="url(#ill-arrow)" />
            <text x="135" y="15" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold">F = G/2 = 6 N</text>
            <text x="100" y="118" fill="#2d3748" fontSize="8.5" fontWeight="bold" textAnchor="middle">A: n = 2 股绳承重 (s = 2h)</text>

            <circle cx="280" cy="35" r="10" fill="#ffffff" stroke="#4a5568" strokeWidth="1.5" />
            <circle cx="280" cy="75" r="10" fill="#ffffff" stroke="#4a5568" strokeWidth="1.5" />
            <rect x="270" y="93" width="20" height="15" fill="rgba(49,130,206,0.15)" stroke="hsl(var(--color-mech))" />
            <text x="280" y="104" fontSize="7" fontWeight="bold" textAnchor="middle">G=12N</text>
            <path d="M 280 65 L 280 35 A 10 10 0 0 0 270 35 L 270 75 A 10 10 0 0 0 290 75 L 290 20" fill="none" stroke="#2d3748" strokeWidth="1.2" />
            <path d="M 290 20 L 305 10" fill="none" stroke="#2d3748" strokeWidth="1.2" markerEnd="url(#ill-arrow)" />
            <text x="312" y="20" fill="hsl(var(--color-success))" fontSize="9.5" fontWeight="bold">F = G/3 = 4 N</text>
            <text x="280" y="118" fill="#2d3748" fontSize="8.5" fontWeight="bold" textAnchor="middle">B: n = 3 股绳承重 (s = 3h)</text>
          </svg>
        </div>
      );
    }

    return list;
  };

  // 物理专项诊断薄弱板块一键特训分
  const weakestBlock = (() => {
    let weakest = null;
    let minScore = 101;
    blocks.forEach(b => {
      const score = blockScores[b.id];
      if (score < minScore) {
        minScore = score;
        weakest = b;
      }
    });
    return weakest;
  })();

  return (
    <div className="app-container fade-in" style={{ display: 'flex', alignItems: 'stretch', gap: '20px', height: '100%', minHeight: 'unset' }}>
      {/* 🌲 左侧二级与三级手风琴大纲树状目录 */}
      <div className="sidebar" style={{ minWidth: '280px', maxWidth: '280px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflowY: 'auto' }}>
        
        {/* 学科名片 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, hsl(var(--color-mech)), hsl(var(--color-work)))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            物
          </div>
          <div>
            <h2 style={{ fontSize: '0.92rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考物理宝典</h2>
            <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>八年级上下册中考复习</span>
          </div>
        </div>

        {/* 二级与三级学习目录树 (自然流动，紧密衔接) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', paddingRight: '4px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>学习进度大纲</div>
          
          {blocks.map((block) => {
            const isExpanded = expandedBlockId === block.id;
            const containsCurrent = block.chapters.includes(selectedChapterId);
            
            return (
              <div key={block.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {/* 二级菜单：单元卡片 */}
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: containsCurrent ? '1.5px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: containsCurrent ? 'rgba(139, 92, 246, 0.03)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onClick={() => toggleBlock(block.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '85%' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: containsCurrent ? 'hsl(var(--color-mech))' : 'hsl(var(--text-primary))' }}>
                      {block.name.split(' ')[0]} {block.name.split(' ')[1]}
                    </span>
                    <span style={{ fontSize: '0.64rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {block.name.split(' ').slice(2).join(' ')}
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
                    borderLeft: '1.5px dashed rgba(139, 92, 246, 0.15)',
                    marginLeft: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '2px',
                    marginBottom: '4px'
                  }}>
                    {block.chapters.map((chId) => {
                      const chData = chapters[chId];
                      const isSelected = selectedChapterId === chId;
                      const score = dayScores[chId] || 0;
                      const isPassed = score > 0;

                      let itemBg = 'transparent';
                      let itemColor = 'hsl(var(--text-secondary))';
                      let fontW = 'normal';

                      if (isSelected) {
                        itemBg = 'linear-gradient(135deg, hsl(var(--color-mech)), #8b5cf6)';
                        itemColor = '#ffffff';
                        fontW = 'bold';
                      } else if (isPassed) {
                        itemBg = 'rgba(59, 130, 246, 0.12)'; // 已学过标注特殊色（淡蓝色背景）
                        itemColor = '#2563eb'; // 蓝色字体
                        fontW = '500';
                      }

                      return (
                        <button
                          key={chId}
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
                            setSelectedChapterId(chId);
                            if (activeTab === 'wrongbook' || activeTab === 'diagnosis' || activeTab === 'formulas') {
                              setActiveTab('study');
                            }
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '80%' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                              {isPassed ? '✅' : '⚪'} Day {chId.replace('day', '')}
                            </span>
                            <span style={{ fontSize: '0.64rem', opacity: isSelected ? 0.95 : 0.6, paddingLeft: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {chData?.name.split(' ').slice(1).join(' ')}
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

        {/* 全局学科工具 (错题本、诊断、公式与账单) 挪到下方固定 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '10px', marginTop: '2px' }}>
          <button
            className={`btn btn-secondary ${activeTab === 'wrongbook' ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: activeTab === 'wrongbook' ? 'hsl(var(--color-mech))' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.74rem',
              padding: '6px 10px',
              position: 'relative'
            }}
            onClick={() => setActiveTab('wrongbook')}
          >
            ❌ 物理错题重温本
            {wrongList.length > 0 && (
              <span style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--color-danger))',
                color: activeTab === 'wrongbook' ? 'hsl(var(--color-mech))' : '#fff',
                fontSize: '0.64rem',
                fontWeight: 'bold',
                padding: '1px 4px',
                borderRadius: '6px'
              }}>
                {wrongList.length}
              </span>
            )}
          </button>

          <button
            className={`btn btn-secondary ${activeTab === 'diagnosis' ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: activeTab === 'diagnosis' ? 'hsl(var(--color-mech))' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'diagnosis' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.74rem',
              padding: '6px 10px'
            }}
            onClick={() => setActiveTab('diagnosis')}
          >
            📊 智能雷达弱点评估
          </button>

          <button
            className={`btn btn-secondary ${activeTab === 'formulas' ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: activeTab === 'formulas' ? 'hsl(var(--color-mech))' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'formulas' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.74rem',
              padding: '6px 10px'
            }}
            onClick={() => setActiveTab('formulas')}
          >
            📐 中考金牌公式计算
          </button>

          <button
            className="btn btn-secondary scale-up"
            style={{
              justifyContent: 'flex-start',
              border: 'none',
              backgroundColor: 'rgba(139, 92, 246, 0.04)',
              color: 'hsl(var(--color-mech))',
              fontSize: '0.74rem',
              padding: '6px 10px',
              fontWeight: 'bold'
            }}
            onClick={() => setShowBillModal(true)}
          >
            🪙 25天历史金币账单
          </button>
        </div>
      </div>

      {/* 主面板内容 */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, padding: 0, overflowY: 'auto' }}>
        
        {/* 📘 右侧顶部横向三合一特训功能卡 */}
        {activeTab !== 'wrongbook' && activeTab !== 'diagnosis' && activeTab !== 'formulas' && (
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
                className={`btn ${activeTab === 'study' && chapterStep === 'study' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('study');
                  setChapterStep('study');
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'study' && chapterStep === 'study' ? 'hsl(var(--color-mech))' : '',
                  borderColor: activeTab === 'study' && chapterStep === 'study' ? 'hsl(var(--color-mech))' : ''
                }}
              >
                📖 今日名师讲义
              </button>
              <button
                className={`btn ${activeTab === 'study' && chapterStep === 'quiz' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setActiveTab('study');
                  setChapterStep('quiz');
                }}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'study' && chapterStep === 'quiz' ? 'hsl(var(--color-mech))' : '',
                  borderColor: activeTab === 'study' && chapterStep === 'quiz' ? 'hsl(var(--color-mech))' : ''
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
                  backgroundColor: activeTab === 'exercise' ? 'hsl(var(--color-mech))' : '',
                  borderColor: activeTab === 'exercise' ? 'hsl(var(--color-mech))' : ''
                }}
              >
                📝 50题每日狂练
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                color: 'hsl(var(--color-mech))',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                🗓️ Day {selectedChapterId.replace('day', '')} · {chapters[selectedChapterId]?.name.split(' ')[1]}
              </span>
              {(activeTab !== 'study' || (chapterStep === 'quiz' && quizScore !== null)) && (
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

        {/* Tab 1: 基础知识精讲与20题测试 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {chapterStep === 'study' ? (
              <>
                {/* 物理工作台双栏等高独立滚动布局 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr',
                  gap: '12px',
                  height: '520px',
                  alignItems: 'stretch'
                }}>
                  {/* 左侧大卡片：重点知识干货精讲 */}
                  <div className="glass-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.015)'
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-mech))', borderBottom: '2px solid rgba(139,92,246,0.06)', paddingBottom: '8px' }}>
                      📖 重点知识干货精讲 ({chapters[selectedChapterId]?.name})
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                      <p style={{
                        fontSize: '0.86rem',
                        lineHeight: '1.75',
                        color: 'hsl(var(--text-primary))',
                        whiteSpace: 'pre-wrap',
                        margin: 0
                      }}>
                        {chapters[selectedChapterId]?.summary}
                      </p>
                    </div>
                  </div>

                  {/* 右侧大卡片：金牌公式 + 图解画廊/大型实验室 */}
                  <div className="glass-card" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.015)'
                  }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-work))', borderBottom: '2px solid rgba(245,158,11,0.06)', paddingBottom: '8px' }}>
                      🖼️ 中考原理可视化
                    </h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                      {/* 重点公式精讲作为龙头 */}
                      {renderChapterFormulaGuide()}

                      {/* 大型交互式实验室 */}
                      {renderChapterLargeExperiment()}

                      {/* 手绘物理图解画廊 */}
                      {renderChapterIllustrations()}
                    </div>
                  </div>
                </div>

                {/* 闯关挑战启动栏 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
                  border: '1px solid rgba(139, 92, 246, 0.12)',
                  borderRadius: 'var(--radius-md)',
                  marginTop: '4px'
                }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>
                      💪 基础知识背熟了？马上开始过关挑战！
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                      本章配备 20 道中考高频选择题，答错的题目将自动加入提分错题本，帮您扫除所有基础盲点。
                    </p>
                  </div>
                  <button className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold' }} onClick={handleRestartQuiz}>
                    开始基础闯关 (20题)
                  </button>
                </div>
              </>
            ) : (
              /* 20题测试过关界面 */
              <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>
                    🏆 重点考点基础闯关 (20题测试) —— {chapters[selectedChapterId]?.name}
                  </h3>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setChapterStep('study')}>
                    退出测试
                  </button>
                </div>

                {quizScore === null ? (
                  /* 答题中 (20题物理小测双栏自适应卡片) */
                  <div style={{ display: 'grid', gridTemplateColumns: isPortraitTablet ? '1fr' : '1.25fr 1fr', gap: '20px', flex: 1 }}>
                    
                    {/* 左栏：核心答题面板 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                          <span>当前第 <b>{currentQuizIndex + 1}</b> / {currentChapterQuestions.length} 题</span>
                          <span>今日小测中...</span>
                        </div>

                        <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${((currentQuizIndex + 1) / currentChapterQuestions.length) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-mech))', transition: 'width 0.3s ease' }}></div>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                          Q{currentQuizIndex + 1}: {currentChapterQuestions[currentQuizIndex]?.question}
                        </div>

                        {/* 选项 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {currentChapterQuestions[currentQuizIndex]?.options.map((opt, oIdx) => {
                            const qId = currentChapterQuestions[currentQuizIndex].id;
                            const ansState = userAnswers[qId];
                            const isAns = quizChecked;

                            let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                            
                            if (ansState !== undefined && ansState !== null) {
                              const isUserSelected = ansState.userOpt === oIdx || ansState === oIdx;
                              if (isAns) {
                                const isCorrectOpt = oIdx === currentChapterQuestions[currentQuizIndex].answer;
                                if (isCorrectOpt) {
                                  btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'hsla(var(--color-success)/0.08)', color: 'hsl(var(--color-success))' };
                                } else if (isUserSelected) {
                                  btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'hsla(var(--color-danger)/0.08)', color: 'hsl(var(--color-danger))' };
                                }
                              } else {
                                if (isUserSelected) {
                                  btnStyle = { border: '1px solid hsl(var(--color-mech))', backgroundColor: 'hsla(var(--color-mech)/0.08)', color: 'hsl(var(--color-mech))' };
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
                                    ...userAnswers,
                                    [qId]: { userOpt: oIdx }
                                  };
                                  setUserAnswers(nextAnswers);

                                  // 自动跳转到下一题 (180ms 延时，让按压效果和选中态稍微闪一下)
                                  if (!quizChecked && currentQuizIndex < currentChapterQuestions.length - 1) {
                                    setTimeout(() => {
                                      setCurrentQuizIndex(prev => prev + 1);
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
                      {quizChecked && (
                        <div className="fade-in" style={{
                          padding: '12px',
                          backgroundColor: '#f8fafc',
                          borderLeft: `4px solid ${
                            (userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.state === 'correct' || userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.userOpt === currentChapterQuestions[currentQuizIndex]?.answer || userAnswers[currentChapterQuestions[currentQuizIndex]?.id] === currentChapterQuestions[currentQuizIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'
                          }`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          lineHeight: '1.6',
                          whiteSpace: 'pre-wrap'
                        }}>
                          <div style={{
                            fontWeight: 'bold',
                            color: (userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.state === 'correct' || userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.userOpt === currentChapterQuestions[currentQuizIndex]?.answer || userAnswers[currentChapterQuestions[currentQuizIndex]?.id] === currentChapterQuestions[currentQuizIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))',
                            marginBottom: '4px'
                          }}>
                            {(userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.state === 'correct' || userAnswers[currentChapterQuestions[currentQuizIndex]?.id]?.userOpt === currentChapterQuestions[currentQuizIndex]?.answer || userAnswers[currentChapterQuestions[currentQuizIndex]?.id] === currentChapterQuestions[currentQuizIndex]?.answer) ? '✅ 算对啦！今日金币 +1 个' : '❌ 算错了。今日金币 -1 个。'}
                          </div>
                          💡 <b>名师点拨：</b>{currentChapterQuestions[currentQuizIndex]?.explanation}
                        </div>
                      )}

                      {/* 底部控制 */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px', marginTop: '10px' }}>
                        <button
                          className="btn btn-secondary"
                          disabled={currentQuizIndex === 0}
                          onClick={() => setCurrentQuizIndex(prev => prev - 1)}
                        >
                          上一题
                        </button>

                        {!quizChecked && (
                          <button
                            className="btn btn-primary"
                            style={{ backgroundColor: 'hsl(var(--color-mech))', borderColor: 'hsl(var(--color-mech))', fontWeight: 'bold' }}
                            onClick={handleQuizSubmitAll}
                          >
                            交卷并结算小测
                          </button>
                        )}

                        <button
                          className="btn btn-primary"
                          style={{ backgroundColor: 'hsl(var(--color-mech))', borderColor: 'hsl(var(--color-mech))' }}
                          disabled={currentQuizIndex === currentChapterQuestions.length - 1}
                          onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                        >
                          下一题
                        </button>
                      </div>
                    </div>

                    {/* 右栏：20题物理小测进度卡 */}
                    <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                      <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                        <span>🎯 20题物理测验卡</span>
                        {quizChecked && <span style={{ color: 'hsl(var(--color-mech))' }}>得分：{quizScore}分</span>}
                      </h4>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                        {Array.from({ length: 20 }).map((_, idx) => {
                          const q = currentChapterQuestions[idx];
                          let bgColor = 'rgba(0,0,0,0.04)';
                          let textColor = 'hsl(var(--text-secondary))';
                          let borderStyle = 'none';

                          const ans = q ? userAnswers[q.id] : null;
                          if (ans !== undefined && ans !== null) {
                            if (quizChecked) {
                              const isCorrect = ans.state === 'correct' || ans === 'correct' || ans.userOpt === q.answer || ans === q.answer;
                              bgColor = isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                              textColor = '#ffffff';
                            } else {
                              bgColor = 'hsla(var(--color-mech)/0.12)';
                              textColor = 'hsl(var(--color-mech))';
                            }
                          }
                          
                          if (idx === currentQuizIndex) {
                            borderStyle = '2px solid hsl(var(--color-mech))';
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
                              onClick={() => setCurrentQuizIndex(idx)}
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
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsla(var(--color-mech)/0.12)' }}></span>已答
                        </div>
                        {quizChecked && (
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

                  </div>                ) : (
                  /* 答题成绩报告 */
                  <div style={{ textAlign: 'center', padding: '30px 0', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: quizScore === 20 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: quizScore === 20 ? 'hsl(var(--color-success))' : 'hsl(var(--color-work))',
                      fontSize: '2.5rem',
                      fontWeight: 'bold'
                    }}>
                      {Math.round((quizScore / 20) * 100)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 6px 0' }}>
                        {quizScore === 20 ? '🎉 恭喜！本章全部满分过关！' : '👍 闯关完成！仍需继续努力！'}
                      </h4>
                      <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                        本章 20 道基础题中，您答对了 <b>{quizScore}</b> 道。
                        {quizScore < 20 && ' 答错的题目已被归入【提分错题重温本】，请去消灭它们。'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                      <button className="btn btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setChapterStep('study')}>
                        返回章节首页
                      </button>
                      <button className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold' }} onClick={handleRestartQuiz}>
                        重新挑战本章
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 50题专项刷题集面板 (新增) */}
        {activeTab === 'exercise' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 章节切换条 */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  className={`btn ${selectedChapterId === ch.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', padding: '6px 12px' }}
                  onClick={() => setSelectedChapterId(ch.id)}
                >
                  {ch.name.split(' ')[0]} {ch.name.split(' ')[1]}
                </button>
              ))}
            </div>

            {/* 50题练习双栏布局 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', flex: 1, minHeight: '560px' }}>
              {/* 左栏：刷题卡片与即时反馈 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge badge-mech" style={{ backgroundColor: 'hsla(var(--color-mech)/0.1)', color: 'hsl(var(--color-mech))', fontWeight: 'bold' }}>
                          第 {currentExerciseIndex + 1} / 50 题
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                          考点：{exerciseQuestions[currentExerciseIndex].category}
                        </span>
                      </div>

                      <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontSize: '0.98rem', fontWeight: 'bold', lineHeight: '1.6' }}>
                        {exerciseQuestions[currentExerciseIndex].question}
                      </div>

                      {/* 选项按钮 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {exerciseQuestions[currentExerciseIndex].options.map((opt, oIdx) => {
                          const qId = exerciseQuestions[currentExerciseIndex].id;
                          const answerState = exerciseAnswers[qId];
                          const isAnswered = !!answerState;

                          let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                          if (isAnswered) {
                            const isCorrectOpt = oIdx === exerciseQuestions[currentExerciseIndex].answer;
                            const isUserSelected = oIdx === answerState.userOpt;
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
                              disabled={isAnswered}
                              onClick={() => handleExerciseOptionClick(oIdx)}
                            >
                              <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {/* 解析显示 */}
                      {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id] && (
                        <div className="fade-in" style={{
                          padding: '14px',
                          backgroundColor: '#f8fafc',
                          borderLeft: `4px solid ${exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'}`,
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.82rem',
                          lineHeight: '1.6'
                        }}>
                          <div style={{ fontWeight: 'bold', color: exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '4px' }}>
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 回答正确！' : '❌ 回答错误！错题已收录。'}
                          </div>
                          <b>名师点拨：</b>{exerciseQuestions[currentExerciseIndex].explanation}
                        </div>
                      )}
                    </div>

                    {/* 底部导航 */}
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
                        disabled={currentExerciseIndex === 49}
                        onClick={() => setCurrentExerciseIndex(prev => prev + 1)}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成 50 道练习题...</div>
                )}
              </div>

              {/* 右栏：50题答题卡面板 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 专项 50 题答题进度</span>
                  <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>
                    已答：{Object.keys(exerciseAnswers).length} / 50
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
                  {Array.from({ length: 50 }).map((_, idx) => {
                    const q = exerciseQuestions[idx];
                    let bgColor = 'rgba(0,0,0,0.04)';
                    let textColor = 'hsl(var(--text-secondary))';
                    let borderStyle = 'none';

                    if (q && exerciseAnswers[q.id]) {
                      bgColor = exerciseAnswers[q.id].isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                      textColor = '#ffffff';
                    }
                    if (idx === currentExerciseIndex) {
                      borderStyle = '2px solid hsl(var(--color-mech))';
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

                {/* 图例说明 */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.04)' }}></span>未做
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-success))' }}></span>做对
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-danger))' }}></span>做错
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 公式计算器 */}
        {activeTab === 'formulas' && (
          <FormulaCalculator />
        )}

        {/* Tab 4: 诊断大盘与特训 */}
        {activeTab === 'diagnosis' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isSpecialTraining ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', height: '100%' }}>
                {/* 智能诊断雷达图 */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', alignSelf: 'flex-start', margin: 0, color: 'hsl(var(--text-primary))' }}>
                    📊 重点考点掌握率智能诊断
                  </h3>
                  <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center' }}>
                    <RadarChart scores={blockScores} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', textAlign: 'center' }}>
                    💡 提示：系统将根据您在【基础过关测试】和【专项练习】中的答题情况，动态评估五大核心力学与电学板块的掌握度。
                  </div>
                </div>

                {/* 弱点推荐与一键特训 */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--text-primary))' }}>
                      ⚡ 中考名师弱点特训推荐
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      以下是根据学情算法分析出的考点诊断结果：
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {blocks.map(b => {
                        const score = blockScores[b.id];
                        let statusColor = 'hsl(var(--color-success))';
                        let label = '优秀';
                        if (score < 60) { statusColor = 'hsl(var(--color-danger))'; label = '薄弱'; }
                        else if (score < 85) { statusColor = 'hsl(var(--color-work))'; label = '中等'; }

                        return (
                          <div key={b.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'hsl(var(--text-primary))' }}>{b.name}</span>
                              <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>分值系数：常考 4-8 分</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: statusColor }}>{label} ({score}分)</span>
                              <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.72rem' }} onClick={() => startSpecialTraining(b.id)}>
                                特训
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {weakestBlock && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: 'rgba(229, 62, 62, 0.03)',
                      border: '1px solid rgba(229, 62, 62, 0.1)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ flex: 1, paddingRight: '12px' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'hsl(var(--color-danger))', marginBottom: '2px' }}>🎯 诊断结论：当前最薄弱为【{weakestBlock.name}】</div>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>一键为孩子生成包含 5 道薄弱真题的微型专攻测试，冲刺提分！</p>
                      </div>
                      <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.78rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-danger))' }} onClick={() => startSpecialTraining(weakestBlock.id)}>
                        弱点突破
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* 特训答题页 */
              <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, color: 'hsl(var(--color-danger))' }}>
                    ⚡ 正在进行：【{blocks.find(b=>b.id===specialTrainBlockId)?.name}】提分弱点特训 (5题)
                  </h3>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => setIsSpecialTraining(false)}>
                    中断特训
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                    特训进度：第 <b>{specialTrainIndex + 1}</b> / 5 题
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}>
                    {specialTrainQuestions[specialTrainIndex]?.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {specialTrainQuestions[specialTrainIndex]?.options.map((opt, oIdx) => {
                      let btnStyle = { border: '1px solid #e2e8f0', backgroundColor: '#fff', color: 'hsl(var(--text-primary))' };
                      if (specialTrainSelectedOpt === oIdx) {
                        btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'rgba(229, 62, 62, 0.05)', color: 'hsl(var(--color-danger))' };
                      }
                      if (specialTrainChecked) {
                        const isCorrect = oIdx === specialTrainQuestions[specialTrainIndex].answer;
                        if (isCorrect) {
                          btnStyle = { border: '1px solid hsl(var(--color-success))', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: 'hsl(var(--color-success))' };
                        } else if (specialTrainSelectedOpt === oIdx) {
                          btnStyle = { border: '1px solid hsl(var(--color-danger))', backgroundColor: 'rgba(229, 62, 62, 0.08)', color: 'hsl(var(--color-danger))' };
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
                            fontSize: '0.86rem',
                            ...btnStyle
                          }}
                          disabled={specialTrainChecked}
                          onClick={() => setSpecialTrainSelectedOpt(oIdx)}
                        >
                          <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {specialTrainChecked && (
                    <div style={{
                      padding: '12px 16px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #edf2f7',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ fontWeight: 'bold', color: specialTrainSelectedOpt === specialTrainQuestions[specialTrainIndex].answer ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))', marginBottom: '2px' }}>
                        {specialTrainSelectedOpt === specialTrainQuestions[specialTrainIndex].answer ? '✅ 答对了！' : '❌ 答错了，错题已归档入错题本。'}
                      </div>
                      <b>解析：</b>{specialTrainQuestions[specialTrainIndex]?.explanation}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  {!specialTrainChecked ? (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }} disabled={specialTrainSelectedOpt === null} onClick={handleSpecialTrainSubmit}>
                      提交本题
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontWeight: 'bold' }} onClick={handleSpecialTrainNext}>
                      {specialTrainIndex < 4 ? '下一题' : '完成特训'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: 物理错题本 */}
        {activeTab === 'wrongbook' && (
          <WrongBook
            wrongList={wrongList}
            onRemoveWrong={handleRemoveWrong}
            onClearAll={handleClearAllWrongs}
            subject="physics"
          />
        )}
      </div>

      {/* 📊 历史金币积分荣誉账单 Modal */}
      {showBillModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass-card fade-in" style={{
            width: '90%',
            maxWidth: '560px',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'hsl(var(--color-mech))' }}>
                📊 物理 25天历史金币荣誉账单
              </h3>
              <button
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '15px' }}
                onClick={() => setShowBillModal(false)}
              >
                ✕ 关闭
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '4px'
            }}>
              {Array.from({ length: 25 }).map((_, idx) => {
                const dayKey = `day${idx + 1}`;
                const score = dayScores[dayKey] || 0;
                const isPassed = score > 0;
                
                return (
                  <div key={dayKey} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 4px',
                    borderRadius: '8px',
                    border: '1.5px solid rgba(0,0,0,0.03)',
                    backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.03)' : 'rgba(0,0,0,0.01)',
                    transition: 'transform 0.15s ease'
                  }}>
                    <span style={{ fontSize: '0.66rem', opacity: 0.6 }}>Day {idx + 1}</span>
                    <span style={{ fontSize: '1.2rem' }}>{isPassed ? '🪙' : '⚪'}</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: score > 0 ? '#10b981' : score < 0 ? '#ef4444' : 'hsl(var(--text-secondary))' }}>
                      {score > 0 ? `+${score}` : score}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(139, 92, 246, 0.03)',
              border: '1px solid rgba(139, 92, 246, 0.08)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'hsl(var(--text-secondary))'
            }}>
              <div>
                🏆 物理累计总币：
                <b style={{ fontSize: '1.1rem', color: 'hsl(var(--color-mech))' }}>
                  {Object.values(dayScores).reduce((a, b) => a + b, 0)} 个金币
                </b>
              </div>
              <button
                className="btn btn-secondary"
                style={{
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  color: 'hsl(var(--color-danger))',
                  borderColor: 'rgba(239, 68, 68, 0.15)'
                }}
                onClick={() => {
                  if (window.confirm('确定要清空这25天的物理荣誉金币账单吗？此操作不可逆！')) {
                    const nextScores = {};
                    for (let i = 1; i <= 25; i++) {
                      const dayKey = `day${i}`;
                      localStorage.removeItem(`physics-score-${dayKey}`);
                      nextScores[dayKey] = 0;
                    }
                    setDayScores(nextScores);
                  }
                }}
              >
                🗑️ 清空重置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
