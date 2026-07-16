import React, { useState, useEffect } from 'react';
import { chemistryBlocks, chemistryDays } from '../data/chemistryData';
import { generateChemistryQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';
import { addStudyLog } from '../utils/syncService';

// Day 4 专属连线游戏核心种子（完全剔除英文，仅保留符号与中文拼音两两对应）
const GAME_SEEDS = [
  { id: 'H', symbol: 'H', pinyin: '氢 (qīng)' },
  { id: 'O', symbol: 'O', pinyin: '氧 (yǎng)' },
  { id: 'Na', symbol: 'Na', pinyin: '钠 (nà)' },
  { id: 'Fe', symbol: 'Fe', pinyin: '铁 (tiě)' },
  { id: 'Cu', symbol: 'Cu', pinyin: '铜 (tóng)' },
  { id: 'Ca', symbol: 'Ca', pinyin: '钙 (gài)' }
];

export default function ChemistryModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

  // 25天每日金币积分状态 { [dayId]: score }
  const [dayScores, setDayScores] = useState({});
  const [showBillModal, setShowBillModal] = useState(false);

  // iPad 竖屏与移动端高灵敏自适应响应式状态
  const [isPortraitTablet, setIsPortraitTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTabletWidth = window.innerWidth <= 1024; // ipad 竖屏宽度自适应
      setIsPortraitTablet(isPortrait && isTabletWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 20题测试状态
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({}); // { [qId]: selectedOpt }
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedTestOpt, setSelectedTestOpt] = useState(null);
  const [testChecked, setTestChecked] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // 连线匹配题的专属交互状态 (化学自适应)
  const [chemSelectedLeft, setChemSelectedLeft] = useState(null); // 左侧被选中符号的 id
  const [chemSelectedRight, setChemSelectedRight] = useState(null); // 右侧被选中中文的 text
  const [chemMatchedPairs, setChemMatchedPairs] = useState({}); // { [symbol]: cnName }
  const [chemMatchLines, setChemMatchLines] = useState([]); // [{ id, x1, y1, x2, y2, isCorrect }]

  // 连线坐标动态计算 Effect (化学连线题专用)
  useEffect(() => {
    const updateLines = () => {
      const container = document.getElementById('chem-match-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
      if (!currentQ) return;

      const newLines = [];
      Object.keys(chemMatchedPairs).forEach(symbol => {
        const cnTrans = chemMatchedPairs[symbol];
        
        const leftBtn = document.getElementById(`chem-btn-left-${symbol}`);
        const rightBtn = document.getElementById(`chem-btn-right-${encodeURIComponent(cnTrans)}`);

        if (leftBtn && rightBtn) {
          const leftRect = leftBtn.getBoundingClientRect();
          const rightRect = rightBtn.getBoundingClientRect();

          const x1 = leftRect.right - containerRect.left;
          const y1 = leftRect.top - containerRect.top + leftRect.height / 2;

          const x2 = rightRect.left - containerRect.left;
          const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

          const correctTranslation = currentQ.correctPairs[symbol];
          const isCorrect = cnTrans === correctTranslation;

          newLines.push({
            id: symbol,
            x1, y1, x2, y2,
            isCorrect
          });
        }
      });
      setChemMatchLines(newLines);
    };

    const timer = setTimeout(updateLines, 50);
    window.addEventListener('resize', updateLines);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [chemMatchedPairs, activeTab, currentTestIndex, currentExerciseIndex, testChecked, exerciseQuestions, testQuestions]);

  // 当题目切换、Tab 切换或天数切换时，同步与恢复化学连线状态
  useEffect(() => {
    const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
    if (!currentQ || currentQ.type !== 'match') {
      setChemSelectedLeft(null);
      setChemSelectedRight(null);
      setChemMatchedPairs({});
      return;
    }

    if (activeTab === 'test') {
      const saved = testAnswers[currentQ.id];
      if (saved && saved.matchedPairs) {
        setChemMatchedPairs(saved.matchedPairs);
      } else {
        setChemMatchedPairs({});
      }
    } else {
      const saved = exerciseAnswers[currentQ.id];
      if (saved && saved.matchedPairs) {
        setChemMatchedPairs(saved.matchedPairs);
      } else {
        setChemMatchedPairs({});
      }
    }

    setChemSelectedLeft(null);
    setChemSelectedRight(null);
  }, [currentTestIndex, currentExerciseIndex, activeTab, testQuestions, exerciseQuestions, testAnswers, exerciseAnswers]);

  // 100题练习状态
  const [exerciseQuestions, setExerciseQuestions] = useState([]);
  const [exerciseAnswers, setExerciseAnswers] = useState({}); // { [qId]: { isCorrect, userOpt } }
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // 化学错题本状态
  const [wrongList, setWrongList] = useState([]);

  // --- Day 4 专属连线配对消除游戏状态 (两两配对，12卡方阵) ---
  const [gameCards, setGameCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]); // 当前单次选中的 card 对象数组 (最多2个)
  const [matchedIds, setMatchedIds] = useState([]); // 已完美匹配成功的元素 id 数组
  const [gameWon, setGameWon] = useState(false);
  const [gameErrorActive, setGameErrorActive] = useState(false); // 匹配错误时闪红灯状态

  // 控制左侧周（二级目录）单项展开折叠状态（互斥折叠）
  const [expandedBlockId, setExpandedBlockId] = useState(null);

  // 自动展开当前选中 Day 所属的周大单元
  useEffect(() => {
    const curBlock = chemistryBlocks.find(b => b.days.includes(selectedDayId));
    if (curBlock) {
      setExpandedBlockId(curBlock.id);
    }
  }, [selectedDayId]);

  const toggleBlock = (blockId) => {
    setExpandedBlockId(prev => prev === blockId ? null : blockId);
  };

  // 初始化加载错题与25天历史积分
  useEffect(() => {
    const savedWrongs = localStorage.getItem('chemistry-wrongs');
    if (savedWrongs) {
      try {
        setWrongList(JSON.parse(savedWrongs));
      } catch (e) {
        console.error('Failed to parse chemistry-wrongs:', e);
        setWrongList([]);
      }
    }

    const scores = {};
    for (let i = 1; i <= 25; i++) {
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

    initMatchGame();
  }, [selectedDayId]);

  // 开启10题测试
  const handleStartTest = () => {
    const dayData = chemistryDays[selectedDayId] || chemistryDays['day1'];
    const generated = generateChemistryQuestions(dayData.topicId, 10);
    setTestQuestions(generated);
    setTestAnswers({});
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
    setTestSubmitted(true);
  };

  // 大单元100题练习自动载入
  useEffect(() => {
    if (activeTab === 'exercise') {
      const dayData = chemistryDays[selectedDayId] || chemistryDays['day1'];
      const generated = generateChemistryQuestions(dayData.blockId, 100);
      setExerciseQuestions(generated);
      setExerciseAnswers({});
      setCurrentExerciseIndex(0);
    }
  }, [selectedDayId, activeTab]);

  // 更新金币积分：做对加分，做错扣分 (支持自定义权重)
  const updateGoldCoin = (isCorrect, weight = 1) => {
    const currentScore = dayScores[selectedDayId] || 0;
    if (currentScore > 0) return; // 重复学习不加分/扣分，分值锁定
    const delta = isCorrect ? weight : -weight;
    const newScore = Number((currentScore + delta).toFixed(2));
    
    const nextScores = { ...dayScores, [selectedDayId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`chemistry-score-${selectedDayId}`, newScore.toString());
  };

  // 处理化学符号与中文匹配连线点击事件
  const handleChemMatchClick = (side, textId) => {
    const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
    if (!currentQ || (activeTab === 'test' ? testChecked : !!exerciseAnswers[currentQ.id])) return;

    let nextLeft = chemSelectedLeft;
    let nextRight = chemSelectedRight;
    let newMatched = { ...chemMatchedPairs };

    if (side === 'left') {
      if (newMatched[textId]) {
        delete newMatched[textId];
        setChemMatchedPairs(newMatched);
      }
      if (chemSelectedLeft === textId) {
        setChemSelectedLeft(null);
        return;
      }
      setChemSelectedLeft(textId);
      nextLeft = textId;
    } else {
      const linkedEngKey = Object.keys(newMatched).find(key => newMatched[key] === textId);
      if (linkedEngKey) {
        delete newMatched[linkedEngKey];
        setChemMatchedPairs(newMatched);
      }
      if (chemSelectedRight === textId) {
        setChemSelectedRight(null);
        return;
      }
      setChemSelectedRight(textId);
      nextRight = textId;
    }

    if (nextLeft && nextRight) {
      newMatched = { ...newMatched, [nextLeft]: nextRight };
      setChemMatchedPairs(newMatched);
      setChemSelectedLeft(null);
      setChemSelectedRight(null);

      // 检查是否 4 对全部连满
      if (Object.keys(newMatched).length === 4) {
        let isAllCorrect = true;
        Object.keys(newMatched).forEach(symKey => {
          const userCn = newMatched[symKey];
          const correctCn = currentQ.correctPairs[symKey];
          if (userCn !== correctCn) {
            isAllCorrect = false;
          }
        });

        // 化学第一大单元百题测试（练习）每道题的权重为 0.5 分，小测分值也是 0.5 分
        const isBlockTest = activeTab === 'exercise' || (activeTab === 'test' && selectedDayId.startsWith('chem_block'));
        const weight = isBlockTest ? 0.5 : 1.0; 

        if (activeTab === 'test') {
          const nextAnswers = {
            ...testAnswers,
            [currentQ.id]: {
              userOpt: 'matched',
              matchedPairs: newMatched
            }
          };
          setTestAnswers(nextAnswers);
        } else {
          const nextAnswers = {
            ...exerciseAnswers,
            [currentQ.id]: {
              isCorrect: isAllCorrect,
              userOpt: 'matched',
              matchedPairs: newMatched
            }
          };
          setExerciseAnswers(nextAnswers);
          updateGoldCoin(isAllCorrect, 0.5); // 百题测试每道题 0.5 分
        }

        if (!isAllCorrect) {
          const alreadyIn = wrongList.some(w => w.id === currentQ.id);
          if (!alreadyIn) {
            const wrongQ = {
              id: currentQ.id,
              question: `元素符号与中文连线配对：${Object.keys(currentQ.correctPairs).join('，')}`,
              options: Object.entries(currentQ.correctPairs).map(([k, v]) => `${k} ➔ ${v}`),
              answer: '4对元素全对消除配对',
              userAnswer: '配对中有错误',
              explanation: currentQ.explanation,
              chapterId: selectedDayId
            };
            const nextWrongs = [...wrongList, wrongQ];
            setWrongList(nextWrongs);
            localStorage.setItem('chemistry-wrongs', JSON.stringify(nextWrongs));
          }
        }
      }
    }
  };

  // --- Day 4 两两连线匹配消除游戏核心逻辑 ---
  const initMatchGame = () => {
    const cardList = [];
    // 动态提取当天学习的元素
    let dayElements = ALL_PERIODIC_ELEMENTS.filter(el => el.day === selectedDayId);
    
    // 如果今天这一关要记忆的元素不足 6 个（例如 Day 4 只有 5 个），或者今日不属于元素记忆天（Day 5 以后）
    if (dayElements.length < 6) {
      const remaining = ALL_PERIODIC_ELEMENTS.filter(el => !dayElements.some(d => d.symbol === el.symbol));
      const shuffledRem = [...remaining].sort(() => 0.5 - Math.random());
      dayElements = [...dayElements, ...shuffledRem.slice(0, 6 - dayElements.length)];
    } else if (dayElements.length > 6) {
      // 超过 6 个时，随机挑选当天的 6 个进行消消乐特训
      dayElements = [...dayElements].sort(() => 0.5 - Math.random()).slice(0, 6);
    }

    dayElements.forEach(el => {
      // 每个元素分出 2 个对应属性卡片 (符号 与 纯中文名称，消灭拼音)
      cardList.push({ elId: el.symbol, type: 'symbol', text: el.symbol });
      cardList.push({ elId: el.symbol, type: 'chinese', text: el.name });
    });

    // 打乱顺序，共 12 张卡片
    const shuffled = cardList
      .map((c, idx) => ({ ...c, cardId: idx }))
      .sort(() => 0.5 - Math.random());
    
    setGameCards(shuffled);
    setSelectedCards([]);
    setMatchedIds([]);
    setGameWon(false);
    setGameErrorActive(false);
  };

  const handleCardClick = (card) => {
    if (matchedIds.includes(card.elId)) return; // 已经匹配消除的不理会
    if (selectedCards.some(c => c.cardId === card.cardId)) return; // 不能重复选自己
    if (gameErrorActive) return; // 正在闪红灯时不能点

    const nextSelected = [...selectedCards, card];

    // 1. 点中第1个卡片
    if (nextSelected.length === 1) {
      setSelectedCards(nextSelected);
    }
    // 2. 点中第2个卡片 (判定两两拼图是否一致)
    else if (nextSelected.length === 2) {
      if (nextSelected[0].elId === nextSelected[1].elId) {
        // 两两匹配完美成功，亮绿灯并消除！
        const newMatched = [...matchedIds, card.elId];
        setMatchedIds(newMatched);
        setSelectedCards([]);
        
        // 配对成功一组奖励 2 金币！
        updateGoldCoin(true);
        updateGoldCoin(true);

        if (newMatched.length === 6) {
          setGameWon(true);
        }
      } else {
        // 不是同一个，闪红灯错配
        setSelectedCards(nextSelected);
        setGameErrorActive(true);
        setTimeout(() => {
          setSelectedCards([]);
          setGameErrorActive(false);
        }, 800);
      }
    }
  };

  // 渲染元素符号消消乐连线匹配小游戏 (全无拼音)
  const renderMatchGameSection = (compact = false) => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? '1fr' : '1.2fr 1.8fr',
        gap: '12px',
        width: '100%',
        alignItems: 'stretch',
        marginTop: '10px'
      }}>
        {/* 如果是非紧凑模式，显示检验规则 */}
        {!compact && (
          <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid rgba(16,185,129,0.1)' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 'bold', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.05)', paddingBottom: '6px', margin: 0 }}>
              🎯 元素消消乐特训规则
            </h3>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.5', color: 'hsl(var(--text-primary))' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>请把打乱的 12 张元素符号和中文名称两两配对消除！</p>
              <ul style={{ paddingLeft: '16px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <li>第一步：点击<b>【符号卡】</b>（如 H）</li>
                <li>第二步：点击对应的<b>【中文名卡】</b>（如 氢）</li>
              </ul>
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#fffbeb',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '4px',
                fontSize: '0.74rem',
                color: '#b45309'
              }}>
                💡 <b>配对奖励：</b> 成功配对一组得 <b>2 金币</b>！全部消除即可通关！
              </div>
            </div>
            <button className="btn btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.74rem', padding: '4px 10px', marginTop: '4px' }} onClick={initMatchGame}>
              🔄 打乱重置
            </button>
          </div>
        )}

        {/* 消除游戏大挑战盘 */}
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(16,185,129,0.1)', minHeight: compact ? '240px' : 'auto' }}>
          <h3 style={{ fontSize: '0.96rem', fontWeight: 'bold', color: 'hsl(var(--color-success))', borderBottom: '2px solid rgba(16,185,129,0.05)', paddingBottom: '6px', margin: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎴 元素消消乐 {compact && <button className="btn btn-secondary" style={{ fontSize: '0.64rem', padding: '2px 6px', marginLeft: '6px', display: 'inline-flex' }} onClick={initMatchGame}>🔄 重置</button>}</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>已匹配：{matchedIds.length} / 6 组</span>
          </h3>
          
          {gameWon ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px 0' }} className="fade-in">
              <span style={{ fontSize: '2.5rem' }}>🎉</span>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 'bold', color: '#047857', margin: 0 }}>背诵大满贯！恭喜通关！</h4>
              <p style={{ fontSize: '0.74rem', color: 'hsl(var(--text-secondary))', margin: 0 }}>
                当天元素符号与中文名称的配对已经滚瓜烂熟了！
              </p>
              <button className="btn btn-primary" style={{ backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))', fontSize: '0.72rem', padding: '4px 12px' }} onClick={initMatchGame}>
                再玩一次
              </button>
            </div>
          ) : (
            <div style={{
              flex: 1,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              padding: '10px 0'
            }}>
              {gameCards.map((card) => {
                const isSelected = selectedCards.some(c => c.cardId === card.cardId);
                const isMatched = matchedIds.includes(card.elId);
                
                let cardStyle = {
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: 'hsl(var(--text-primary))',
                  opacity: isMatched ? 0.08 : 1,
                  cursor: isMatched ? 'default' : 'pointer'
                };

                if (isSelected) {
                  cardStyle = {
                    border: gameErrorActive ? '2px solid hsl(var(--color-danger))' : '2px solid hsl(var(--color-optics))',
                    backgroundColor: gameErrorActive ? 'hsla(var(--color-danger)/0.08)' : 'hsla(var(--color-optics)/0.08)',
                    color: gameErrorActive ? 'hsl(var(--color-danger))' : 'hsl(var(--color-optics))',
                    opacity: 1,
                    cursor: 'pointer'
                  };
                }

                return (
                  <button
                    key={card.cardId}
                    style={{
                      padding: '6px 4px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      minHeight: '44px',
                      transition: 'all 0.15s ease',
                      ...cardStyle
                    }}
                    disabled={isMatched}
                    onClick={() => handleCardClick(card)}
                    className={gameErrorActive && isSelected ? 'shake' : 'scale-up'}
                  >
                    {card.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 化学小测统一交卷结算逻辑
  const handleTestSubmitAll = () => {
    let correctCount = 0;
    const weaknesses = [];
    const nextAnswers = { ...testAnswers };

    testQuestions.forEach(q => {
      const saved = nextAnswers[q.id];
      let isCorrect = false;
      
      if (q.type === 'match') {
        if (saved && saved.matchedPairs) {
          isCorrect = true;
          Object.keys(q.correctPairs).forEach(symKey => {
            if (saved.matchedPairs[symKey] !== q.correctPairs[symKey]) {
              isCorrect = false;
            }
          });
        }
      } else {
        isCorrect = saved === q.answer || (saved && saved.userOpt === q.answer);
      }

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

      // 积分权重统一为 0.5 金币
      updateGoldCoin(isCorrect, 1.0);

      if (isCorrect) {
        correctCount++;
      } else {
        weaknesses.push(q.knowledgePoint || q.question.substring(0, 15) + '...');
        
        // 自动计错
        const alreadyIn = wrongList.some(w => w.id === q.id);
        if (!alreadyIn) {
          let wrongQ;
          if (q.type === 'match') {
            wrongQ = {
              id: q.id,
              question: `元素符号与中文连线配对：${Object.keys(q.correctPairs).join('，')}`,
              options: Object.entries(q.correctPairs).map(([k, v]) => `${k} ➔ ${v}`),
              answer: '4对元素全对消除配对',
              userAnswer: '小测交卷中有连线错误',
              explanation: q.explanation,
              chapterId: selectedDayId
            };
          } else {
            wrongQ = {
              ...q,
              userAnswer: saved?.userOpt !== undefined ? saved.userOpt : saved,
              chapterId: selectedDayId
            };
          }
          wrongList.push(wrongQ);
        }
      }
    });

    setTestAnswers(nextAnswers);
    setWrongList([...wrongList]);
    localStorage.setItem('chemistry-wrongs', JSON.stringify(wrongList));

    const finalScore = Math.round((correctCount / testQuestions.length) * 100);
    setTestScore(finalScore);
    setTestChecked(true);

    const dayNum = selectedDayId.replace('day', '');
    addStudyLog(
      'chemistry',
      'quiz_complete',
      `完成化学 Day ${dayNum} 20题小测`,
      correctCount,
      testQuestions.length,
      weaknesses
    );
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

    // 检查是否刚好完成了所有 100 道大单元测试
    const answeredCount = Object.keys(nextAnswers).length;
    if (answeredCount === 100) {
      let correctCount = 0;
      const weaknesses = [];
      Object.keys(nextAnswers).forEach(qId => {
        const ans = nextAnswers[qId];
        const q = exerciseQuestions.find(ex => ex.id === qId);
        if (ans.isCorrect) {
          correctCount++;
        } else if (q) {
          weaknesses.push(q.knowledgePoint || q.question.substring(0, 15) + '...');
        }
      });
      addStudyLog(
        'chemistry',
        'quiz_complete',
        '完成化学大单元100题挑战特训！',
        correctCount,
        100,
        weaknesses
      );
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

  // 26 个中考高频与前20号元素数据库
  const ALL_PERIODIC_ELEMENTS = [
    { z: 1, symbol: 'H', name: '氢', pinyin: 'qīng', day: 'day1', group: 1 },
    { z: 2, symbol: 'He', name: '氦', pinyin: 'hài', day: 'day1', group: 1 },
    { z: 3, symbol: 'Li', name: '锂', pinyin: 'lǐ', day: 'day1', group: 1 },
    { z: 4, symbol: 'Be', name: '铍', pinyin: 'pí', day: 'day1', group: 1 },
    { z: 5, symbol: 'B', name: '硼', pinyin: 'péng', day: 'day1', group: 1 },
    { z: 6, symbol: 'C', name: '碳', pinyin: 'tàn', day: 'day1', group: 2 },
    { z: 7, symbol: 'N', name: '氮', pinyin: 'dàn', day: 'day1', group: 2 },
    { z: 8, symbol: 'O', name: '氧', pinyin: 'yǎng', day: 'day1', group: 2 },
    { z: 9, symbol: 'F', name: '氟', pinyin: 'fú', day: 'day1', group: 2 },
    { z: 10, symbol: 'Ne', name: '氖', pinyin: 'nǎi', day: 'day1', group: 2 },
    { z: 11, symbol: 'Na', name: '钠', pinyin: 'nà', day: 'day2', group: 3 },
    { z: 12, symbol: 'Mg', name: '镁', pinyin: 'měi', day: 'day2', group: 3 },
    { z: 13, symbol: 'Al', name: '铝', pinyin: 'lǚ', day: 'day2', group: 3 },
    { z: 14, symbol: 'Si', name: '硅', pinyin: 'guī', day: 'day2', group: 3 },
    { z: 15, symbol: 'P', name: '磷', pinyin: 'lín', day: 'day2', group: 3 },
    { z: 16, symbol: 'S', name: '硫', pinyin: 'liú', day: 'day2', group: 4 },
    { z: 17, symbol: 'Cl', name: '氯', pinyin: 'lǜ', day: 'day2', group: 4 },
    { z: 18, symbol: 'Ar', name: '氩', pinyin: 'yà', day: 'day2', group: 4 },
    { z: 19, symbol: 'K', name: '钾', pinyin: 'jiǎ', day: 'day2', group: 4 },
    { z: 20, symbol: 'Ca', name: '钙', pinyin: 'gài', day: 'day2', group: 4 },
    { z: 26, symbol: 'Fe', name: '铁', pinyin: 'tiě', day: 'day3', group: 5 },
    { z: 29, symbol: 'Cu', name: '铜', pinyin: 'tóng', day: 'day3', group: 5 },
    { z: 30, symbol: 'Zn', name: '锌', pinyin: 'xīn', day: 'day3', group: 5 },
    { z: 47, symbol: 'Ag', name: '银', pinyin: 'yín', day: 'day3', group: 5 },
    { z: 56, symbol: 'Ba', name: '钡', pinyin: 'bèi', day: 'day3', group: 5 },
    { z: 25, symbol: 'Mn', name: '锰', pinyin: 'měng', day: 'day3', group: 5 },
    { z: 79, symbol: 'Au', name: '金', pinyin: 'jīn', day: 'day4', group: 6 },
    { z: 22, symbol: 'Ti', name: '钛', pinyin: 'tài', day: 'day4', group: 6 },
    { z: 53, symbol: 'I', name: '碘', pinyin: 'diǎn', day: 'day4', group: 6 },
    { z: 50, symbol: 'Sn', name: '锡', pinyin: 'xī', day: 'day4', group: 6 },
    { z: 80, symbol: 'Hg', name: '汞', pinyin: 'gǒng', day: 'day4', group: 6 }
  ];

  // 渲染化学实验/原子微观原理图 (含 Day 8 氧气、Day 14 水电解、Day 15 引流过滤、Day 12 钠电子轨道)
  const renderChemistryIllustrations = (dayId) => {
    const list = [];

    if (['day0', 'day1', 'day2', 'day3', 'day4'].includes(dayId)) {
      let currentMnemonic = '';
      if (dayId === 'day0') currentMnemonic = '🗺️ 周期全景预习：初三阶段，我们只要掌握这 30 个常用化学积木元素就可以了！';
      else if (dayId === 'day1') currentMnemonic = '🔥 今日口诀组：青海里皮蓬(1-5)，碳蛋养拂奶(6-10)';
      else if (dayId === 'day2') currentMnemonic = '🔥 今日口诀组：那美驴归临(11-15)，留绿亚家盖(16-20)';
      else if (dayId === 'day3') currentMnemonic = '🔥 今日口诀组：铁铜锌银钡锰(重金属常用组)';
      else if (dayId === 'day4') currentMnemonic = '🔥 今日口诀组：金胎点细工 (新添 5 个高频核心元素)';
 
      list.push(
        <div key="c-day-periodic" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            fontSize: '0.78rem', 
            color: '#b45309', 
            fontWeight: 'bold', 
            backgroundColor: '#fffbeb', 
            padding: '8px 12px', 
            borderLeft: '4px solid #f59e0b', 
            borderRadius: '4px',
            lineHeight: '1.4'
          }}>
            {currentMnemonic}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '6px',
            backgroundColor: '#f8fafc',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #edf2f7'
          }}>
            {ALL_PERIODIC_ELEMENTS.map((el) => {
              const isTodayElement = el.day === dayId;
              
              let cellBg = '#f1f5f9';
              let border = '1px solid #e2e8f0';
              let glowStyle = {};
              let opacity = 0.35; // 其它元素淡化
 
              if (dayId === 'day0') {
                // 先导课全表均匀高亮展示
                opacity = 0.95;
                cellBg = '#ffffff';
                border = '1px solid rgba(59, 130, 246, 0.12)';
              } else if (isTodayElement) {
                opacity = 1;
                cellBg = 'linear-gradient(135deg, #fffdf5 0%, #fff9db 100%)';
                border = '2px solid #f59e0b';
                glowStyle = {
                  boxShadow: '0 0 10px rgba(245, 158, 11, 0.2)',
                };
              }
 
              return (
                <div
                  key={el.z}
                  style={{
                    padding: '8px 2px',
                    borderRadius: '8px',
                    background: cellBg,
                    border: border,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1px',
                    opacity: opacity,
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    ...glowStyle
                  }}
                >
                  <span style={{ position: 'absolute', top: '2px', left: '3px', fontSize: '0.58rem', opacity: 0.5 }}>{el.z}</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 'bold', color: isTodayElement ? '#b45309' : 'hsl(var(--text-primary))' }}>{el.symbol}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{el.name}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8, fontFamily: 'monospace' }}>{el.pinyin}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '0.68rem', opacity: 0.4, textAlign: 'center' }}>
            {dayId === 'day0' ? '提示：先导课全景预览，初三阶段只需掌握这30个高频化学积木元素。' : '提示：高亮金黄色卡片为今日必背元素，其他半透明元素为后续课时或前几课内容。'}
          </div>
        </div>
      );
    }

    // 12天和13天：保留核外电子轨道概念模型
    if (['day12', 'day13'].includes(dayId)) {
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

    // 2. 水的电解气泡比 (Day 14)
    if (dayId === 'day14') {
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

    // 3. 铁丝燃烧集气瓶水防护 (Day 8)
    if (dayId === 'day8') {
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

    // 4. 水的净化引流过滤 (Day 15)
    if (dayId === 'day15') {
      list.push(
        <div key="c-day-filter" style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px', fontWeight: 'bold' }}>🖼️ 图解：过滤一贴二低三靠引流系统</div>
          <svg width="100%" height="110" viewBox="0 0 400 110" style={{ display: 'block', margin: '0 auto', maxWidth: '400px' }}>
            {/* 铁架台与漏斗 */}
            <line x1="150" y1="10" x2="150" y2="100" stroke="#4a5568" strokeWidth="3" />
            <line x1="120" y1="100" x2="200" y2="100" stroke="#4a5568" strokeWidth="4" />
            
            {/* 烧杯与玻璃棒 */}
            <rect x="230" y="50" width="50" height="45" fill="none" stroke="#718096" strokeWidth="2" rx="2" />
            <path d="M 195 20 L 245 70" stroke="hsl(var(--color-danger))" strokeWidth="2.5" />
            <text x="228" y="32" fill="hsl(var(--color-danger))" fontSize="8" fontWeight="bold">玻璃棒(引流)</text>
            
            {/* 漏斗 */}
            <path d="M 210 30 L 250 30 L 235 60 L 235 80 L 230 80 L 230 60 Z" fill="none" stroke="#718096" strokeWidth="2" />
            <text x="270" y="80" fill="hsl(var(--color-success))" fontSize="8" fontWeight="bold">管口紧靠烧杯壁</text>
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
    <div className="app-container fade-in" style={{ display: 'flex', alignItems: 'stretch', gap: '20px', height: 'calc(100vh - 120px)' }}>
      {/* 🌲 左侧二级与三级手风琴大纲树状目录 */}
      <div className="sidebar" style={{ minWidth: '280px', maxWidth: '280px', display: 'flex', flexDirection: 'column', padding: '16px', gap: '12px', overflowY: 'auto' }}>
        
        {/* 学科名片 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
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
            <h2 style={{ fontSize: '0.92rem', border: 'none', padding: 0, margin: 0, letterSpacing: '0.5px' }}>中考化学抢跑营</h2>
            <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>25天初三提分课纲</span>
          </div>
        </div>

        {/* 二级与三级学习目录树 (自然流动，紧密衔接) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', paddingRight: '4px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>学习进度大纲</div>
          
          {chemistryBlocks.map((block) => {
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
                    border: containsCurrent ? '1.5px solid rgba(16,185,129,0.3)' : '1px solid rgba(0,0,0,0.04)',
                    backgroundColor: containsCurrent ? 'rgba(16,185,129,0.03)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onClick={() => toggleBlock(block.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', maxWidth: '85%' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 'bold', color: containsCurrent ? '#047857' : 'hsl(var(--text-primary))' }}>
                      {block.name.split('：')[0]}
                    </span>
                    <span style={{ fontSize: '0.64rem', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {block.name.split('：')[1].split('(')[0]}
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
                    borderLeft: '1.5px dashed rgba(16, 185, 129, 0.15)',
                    marginLeft: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    marginTop: '2px',
                    marginBottom: '4px'
                  }}>
                    {block.days.map((dayId) => {
                      const dayData = chemistryDays[dayId];
                      const isSelected = selectedDayId === dayId;
                      const score = dayScores[dayId] || 0;
                      const isPassed = score > 0;

                      let itemBg = 'transparent';
                      let itemColor = 'hsl(var(--text-secondary))';
                      let fontW = 'normal';

                      if (isSelected) {
                        itemBg = 'linear-gradient(135deg, hsl(var(--color-optics)), #10b981)';
                        itemColor = '#ffffff';
                        fontW = 'bold';
                      } else if (isPassed) {
                        itemBg = 'rgba(16, 185, 129, 0.12)'; // 已学过标注特殊色（淡绿色背景）
                        itemColor = '#059669'; // 绿色字体
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
              backgroundColor: activeTab === 'wrongbook' ? 'hsl(var(--color-optics))' : 'rgba(0,0,0,0.02)',
              color: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--text-primary))',
              fontSize: '0.78rem',
              padding: '8px 12px',
              position: 'relative'
            }}
            onClick={() => setActiveTab('wrongbook')}
          >
            ❌ 化学错题重温本
            {wrongList.length > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: activeTab === 'wrongbook' ? '#fff' : 'hsl(var(--color-danger))',
                color: activeTab === 'wrongbook' ? 'hsl(var(--color-optics))' : '#fff',
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
              backgroundColor: 'rgba(16, 185, 129, 0.04)',
              color: '#047857',
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
                  backgroundColor: activeTab === 'study' ? 'hsl(var(--color-optics))' : '',
                  borderColor: activeTab === 'study' ? 'hsl(var(--color-optics))' : ''
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
                  backgroundColor: activeTab === 'test' ? 'hsl(var(--color-optics))' : '',
                  borderColor: activeTab === 'test' ? 'hsl(var(--color-optics))' : ''
                }}
              >
                ✍️ 10题课后小测
              </button>
              <button
                className={`btn ${activeTab === 'exercise' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('exercise')}
                style={{
                  fontSize: '0.78rem',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  backgroundColor: activeTab === 'exercise' ? 'hsl(var(--color-optics))' : '',
                  borderColor: activeTab === 'exercise' ? 'hsl(var(--color-optics))' : ''
                }}
              >
                📝 大单元百题特训
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <span style={{
                padding: '4px 10px',
                backgroundColor: 'rgba(59, 130, 246, 0.06)',
                color: 'hsl(var(--color-optics))',
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

        {/* Tab 1: 讲义与化学图解 */}
        {activeTab === 'study' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            
              <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '12px', height: '520px', alignItems: 'stretch' }}>
                {/* 左栏 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-optics))', borderBottom: '2px solid rgba(59,130,246,0.06)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📖 课程讲义 ({currentDayData?.name})</span>
                    <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-secondary))' }}>抢跑课: 1.0-1.5小时/天</span>
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
                    {parseSummary(currentDayData?.summary)}
                  </div>
                </div>

                {/* 右栏 */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 12px 0', color: 'hsl(var(--color-success))', borderBottom: '2px solid rgba(16,185,129,0.06)', paddingBottom: '8px' }}>
                    📐 经典母题与实验图解
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '8px' }}>
                    
                    <div style={{ padding: '12px', border: '1px solid rgba(16,185,129,0.15)', background: 'linear-gradient(135deg, rgba(16,185,129,0.02), rgba(59, 130, 246, 0.02))', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.82rem', color: '#047857' }}>📝 经典母题精讲：</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', padding: '8px', backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.03)', borderRadius: '4px' }}>
                        {currentDayData?.example.question}
                      </div>
                      <div style={{ fontSize: '0.8rem', lineHeight: '1.6', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap' }}>
                        {currentDayData?.example.answer}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-danger))', borderTop: '1px dashed rgba(16,185,129,0.2)', paddingTop: '6px', lineHeight: '1.4' }}>
                        ⚠️ <b>名师避坑指点：</b>{currentDayData?.example.tip}
                      </div>
                    </div>

                    {renderChemistryIllustrations(selectedDayId)}
                    
                    {/* 前 4 天元素记忆期，周期表网格正下方常驻配对消除消消乐 */}
                    {['day1', 'day2', 'day3', 'day4'].includes(selectedDayId) && renderMatchGameSection(true)}
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
                  🧪 今天的化学知识听懂了吗？来个课后小测吧！
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                  每节课测试 10 题，做对<b>加1金币</b>，做错扣1金币。
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

        {/* Tab 2: 10题测试大厅 */}
        {activeTab === 'test' && (
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '500px', overflowY: 'auto' }}>
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
                    测验包含 10 道当天抢跑知识。答题过程中，做对一道<b>+1金币</b>，做错一道<b>-1金币</b>，防止分心小测后统一结算。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }} onClick={handleStartTest}>
                  开始小测
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 (20题化学小测双栏自适应卡片) */
              <div style={{ display: 'grid', gridTemplateColumns: isPortraitTablet ? '1fr' : '1.25fr 1fr', gap: '20px', flex: 1 }}>
                {testQuestions.length > 0 && testQuestions[currentTestIndex] ? (
                  <>
                    {/* 左栏：核心答题面板 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      <span>当前第 <b>{currentTestIndex + 1}</b> / {testQuestions.length} 题</span>
                      <span>今日小测中...</span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${((currentTestIndex + 1) / testQuestions.length) * 100}%`, height: '100%', backgroundColor: 'hsl(var(--color-optics))', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                      Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                    </div>

                    {/* 分流渲染：连线匹配题 vs 传统单选题 */}
                    {testQuestions[currentTestIndex]?.type === 'match' ? (
                      /* 连线匹配题 UI */
                      <div
                        id="chem-match-container"
                        style={{
                          position: 'relative',
                          display: 'grid',
                          gridTemplateColumns: '1.5fr 1fr 1.5fr',
                          gap: isPortraitTablet ? '10px' : '20px',
                          padding: '16px',
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed #e2e8f0'
                        }}
                      >
                        {/* 左侧元素符号列表 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#a855f7', textAlign: 'center', marginBottom: '4px' }}>🧪 元素符号</div>
                          {testQuestions[currentTestIndex]?.leftOptions.map((opt) => {
                            const isMatched = !!chemMatchedPairs[opt.id];
                            const isSelected = chemSelectedLeft === opt.id;
                            const hasSubmitted = testChecked;
                            
                            let btnBg = '#fff';
                            let btnBorder = '1px solid #e2e8f0';
                            let btnColor = 'hsl(var(--text-primary))';
                            let opacity = 1;

                            if (isSelected) {
                              btnBg = 'rgba(168,85,247,0.12)';
                              btnBorder = '2px solid #a855f7';
                              btnColor = '#a855f7';
                            } else if (isMatched) {
                              if (hasSubmitted) {
                                const correctTranslation = testQuestions[currentTestIndex]?.correctPairs[opt.id];
                                const userTranslation = chemMatchedPairs[opt.id];
                                const isPairCorrect = userTranslation === correctTranslation;
                                
                                btnBg = isPairCorrect ? 'hsla(var(--color-success)/0.08)' : 'hsla(var(--color-danger)/0.08)';
                                btnBorder = isPairCorrect ? '1px solid hsl(var(--color-success))' : '1px solid hsl(var(--color-danger))';
                                btnColor = isPairCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                                opacity = 0.6;
                              } else {
                                btnBg = 'rgba(168,85,247,0.03)';
                                btnBorder = '1px solid rgba(168,85,247,0.25)';
                                btnColor = 'hsl(var(--text-primary))';
                              }
                            }

                            return (
                              <button
                                key={opt.id}
                                id={`chem-btn-left-${opt.id}`}
                                className="btn"
                                style={{
                                  padding: isPortraitTablet ? '8px 10px' : '12px 16px',
                                  fontSize: isPortraitTablet ? '0.78rem' : '0.9rem',
                                  fontWeight: 'bold',
                                  borderRadius: '10px',
                                  backgroundColor: btnBg,
                                  border: btnBorder,
                                  color: btnColor,
                                  opacity: opacity,
                                  cursor: hasSubmitted ? 'default' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
                                  justifyContent: 'center'
                                }}
                                disabled={hasSubmitted}
                                onClick={() => handleChemMatchClick('left', opt.id)}
                              >
                                {opt.text}
                                {hasSubmitted && isMatched && (
                                  chemMatchedPairs[opt.id] === testQuestions[currentTestIndex]?.correctPairs[opt.id] ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* 中间留白 */}
                        <div></div>

                        {/* 右侧中文名称列表 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#0ea5e9', textAlign: 'center', marginBottom: '4px' }}>🇨🇳 中文名称</div>
                          {testQuestions[currentTestIndex]?.rightOptions.map((opt) => {
                            const isMatched = Object.values(chemMatchedPairs).includes(opt.text);
                            const isSelected = chemSelectedRight === opt.text;
                            const hasSubmitted = testChecked;

                            let btnBg = '#fff';
                            let btnBorder = '1px solid #e2e8f0';
                            let btnColor = 'hsl(var(--text-primary))';
                            let opacity = 1;

                            if (isSelected) {
                              btnBg = 'rgba(14,165,233,0.12)';
                              btnBorder = '2px solid #0ea5e9';
                              btnColor = '#0ea5e9';
                            } else if (isMatched) {
                              if (hasSubmitted) {
                                const linkedEng = Object.keys(chemMatchedPairs).find(key => chemMatchedPairs[key] === opt.text);
                                const isPairCorrect = linkedEng && testQuestions[currentTestIndex]?.correctPairs[linkedEng] === opt.text;

                                btnBg = isPairCorrect ? 'hsla(var(--color-success)/0.08)' : 'hsla(var(--color-danger)/0.08)';
                                btnBorder = isPairCorrect ? '1px solid hsl(var(--color-success))' : '1px solid hsl(var(--color-danger))';
                                btnColor = isPairCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                                opacity = 0.6;
                              } else {
                                btnBg = 'rgba(14,165,233,0.03)';
                                btnBorder = '1px solid rgba(14,165,233,0.25)';
                                btnColor = 'hsl(var(--text-primary))';
                              }
                            }

                            return (
                              <button
                                key={opt.text}
                                id={`chem-btn-right-${encodeURIComponent(opt.text)}`}
                                className="btn"
                                style={{
                                  padding: isPortraitTablet ? '8px 10px' : '12px 16px',
                                  fontSize: isPortraitTablet ? '0.72rem' : '0.82rem',
                                  borderRadius: '10px',
                                  backgroundColor: btnBg,
                                  border: btnBorder,
                                  color: btnColor,
                                  opacity: opacity,
                                  cursor: hasSubmitted ? 'default' : 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 0 12px rgba(14,165,233,0.3)' : 'none',
                                  justifyContent: 'center',
                                  display: 'block',
                                  width: '100%',
                                  textOverflow: 'ellipsis',
                                  overflow: 'hidden',
                                  whiteSpace: 'nowrap'
                                }}
                                disabled={hasSubmitted}
                                onClick={() => handleChemMatchClick('right', opt.text)}
                              >
                                {opt.text}
                                {hasSubmitted && isMatched && (() => {
                                  const linkedEng = Object.keys(chemMatchedPairs).find(key => chemMatchedPairs[key] === opt.text);
                                  const isPairCorrect = linkedEng && testQuestions[currentTestIndex]?.correctPairs[linkedEng] === opt.text;
                                  return isPairCorrect ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>;
                                })()}
                              </button>
                            );
                          })}
                        </div>

                        {/* SVG 画线层 */}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                          {chemMatchLines.map((line) => {
                            const hasSubmitted = testChecked;
                            let strokeColor = '#a855f7';
                            if (hasSubmitted) {
                              strokeColor = line.isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                            }
                            return (
                              <line
                                key={line.id}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke={strokeColor}
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                style={{ transition: 'stroke 0.3s ease' }}
                              />
                            );
                          })}
                        </svg>
                      </div>
                    ) : (
                      /* 传统的单选题 UI */
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
                                btnStyle = { border: '1px solid hsl(var(--color-optics))', backgroundColor: 'hsla(var(--color-optics)/0.08)', color: 'hsl(var(--color-optics))' };
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
                              }}
                            >
                              <span style={{ fontWeight: 'bold', marginRight: '6px' }}>{String.fromCharCode(65 + oIdx)}.</span>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 答题判定解析 */}
                  {testChecked && (
                    <div className="fade-in" style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderLeft: `4px solid ${
                        testQuestions[currentTestIndex]?.type === 'match'
                          ? ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id] === 'correct') ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))')
                          : ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))')
                      }`,
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.78rem',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      <div style={{
                        fontWeight: 'bold',
                        color: testQuestions[currentTestIndex]?.type === 'match'
                          ? ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id] === 'correct') ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))')
                          : ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'),
                        marginBottom: '4px'
                      }}>
                        {testQuestions[currentTestIndex]?.type === 'match'
                          ? ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id] === 'correct') ? '✅ 元素消除全对！今日金币 +1 个' : '❌ 配对中有错误。今日金币 -1 个。')
                          : ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id]?.userOpt === testQuestions[currentTestIndex]?.answer || testAnswers[testQuestions[currentTestIndex]?.id] === testQuestions[currentTestIndex]?.answer) ? '✅ 算对啦！今日金币 +1 个' : '❌ 算错了。今日金币 -1 个。')}
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
                        style={{ backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))', fontWeight: 'bold' }}
                        onClick={handleTestSubmitAll}
                      >
                        交卷并结算小测
                      </button>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ backgroundColor: 'hsl(var(--color-optics))', borderColor: 'hsl(var(--color-optics))' }}
                      disabled={currentTestIndex === testQuestions.length - 1}
                      onClick={() => setCurrentTestIndex(prev => prev + 1)}
                    >
                      下一题
                    </button>
                  </div>
                </div>

                {/* 右栏：20题化学小测答提网格 */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                    <span>🎯 20题化学小测卡</span>
                    {testChecked && <span style={{ color: 'hsl(var(--color-optics))' }}>得分：{testScore}分</span>}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                    {Array.from({ length: testQuestions.length || 20 }).map((_, idx) => {
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
                          bgColor = 'hsla(var(--color-optics)/0.12)';
                          textColor = 'hsl(var(--color-optics))';
                        }
                      }
                      
                      if (idx === currentTestIndex) {
                        borderStyle = '2px solid hsl(var(--color-optics))';
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
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsla(var(--color-optics)/0.12)' }}></span>已答
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
                  </>
                ) : (
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#a0aec0', width: '100%' }}>正在生成今日化学小测题库...</div>
                )}
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

                {/* 💡 大单元 100 题特训金币奖励提示卡 */}
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
                  💡 <b>提分秘籍提示：</b> 恭喜你完成了今天的过关测试！别忘了，本大单元还有 <b>100 道阶段性特训题</b> 供你进行周度大单元测试。挑战它们不仅能帮你在宏观上把关知识死角，还能<b>获得更多金币</b>哦！
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
                      🚀 立即挑战大单元百题特训
                    </button>
                  </div>
                </div>

                {/* 每日配对消除消消乐加餐 (做完题后展示) */}
                {renderMatchGameSection(false)}

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

        {/* Tab 3: 大单元百题特训 */}
        {activeTab === 'exercise' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '20px', flex: 1, minHeight: '500px' }}>
              
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', justifyContent: 'space-between' }}>
                {exerciseQuestions.length > 0 && exerciseQuestions[currentExerciseIndex] ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#047857', fontWeight: 'bold' }}>
                          大单元百题特训 · 第 {currentExerciseIndex + 1} / 100 题
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          累计金币：{todayGoldCoin >= 0 ? `+${todayGoldCoin}` : todayGoldCoin}
                        </span>
                      </div>

                      <div style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontSize: '0.96rem', fontWeight: 'bold' }}>
                        {exerciseQuestions[currentExerciseIndex].question}
                      </div>

                      {exerciseQuestions[currentExerciseIndex]?.type === 'match' ? (
                        <div
                          id="chem-match-container"
                          style={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1fr 1.5fr',
                            gap: isPortraitTablet ? '10px' : '20px',
                            padding: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed #e2e8f0'
                          }}
                        >
                          {/* 左侧元素符号列表 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#a855f7', textAlign: 'center', marginBottom: '4px' }}>🧪 元素符号</div>
                            {exerciseQuestions[currentExerciseIndex]?.leftOptions.map((opt) => {
                              const isMatched = !!chemMatchedPairs[opt.id];
                              const isSelected = chemSelectedLeft === opt.id;
                              const hasSubmitted = !!exerciseAnswers[exerciseQuestions[currentExerciseIndex].id];
                              
                              let btnBg = '#fff';
                              let btnBorder = '1px solid #e2e8f0';
                              let btnColor = 'hsl(var(--text-primary))';
                              let opacity = 1;

                              if (isSelected) {
                                btnBg = 'rgba(168,85,247,0.12)';
                                btnBorder = '2px solid #a855f7';
                                btnColor = '#a855f7';
                              } else if (isMatched) {
                                if (hasSubmitted) {
                                  const currentQ = exerciseQuestions[currentExerciseIndex];
                                  const correctTranslation = currentQ?.correctPairs[opt.id];
                                  const userTranslation = chemMatchedPairs[opt.id];
                                  const isPairCorrect = userTranslation === correctTranslation;
                                  
                                  btnBg = isPairCorrect ? 'hsla(var(--color-success)/0.08)' : 'hsla(var(--color-danger)/0.08)';
                                  btnBorder = isPairCorrect ? '1px solid hsl(var(--color-success))' : '1px solid hsl(var(--color-danger))';
                                  btnColor = isPairCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                                  opacity = 0.6;
                                } else {
                                  btnBg = 'rgba(168,85,247,0.03)';
                                  btnBorder = '1px solid rgba(168,85,247,0.25)';
                                  btnColor = 'hsl(var(--text-primary))';
                                }
                              }

                              return (
                                <button
                                  key={opt.id}
                                  id={`chem-btn-left-${opt.id}`}
                                  className="btn"
                                  style={{
                                    padding: isPortraitTablet ? '8px 10px' : '12px 16px',
                                    fontSize: isPortraitTablet ? '0.78rem' : '0.9rem',
                                    fontWeight: 'bold',
                                    borderRadius: '10px',
                                    backgroundColor: btnBg,
                                    border: btnBorder,
                                    color: btnColor,
                                    opacity: opacity,
                                    cursor: hasSubmitted ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
                                    justifyContent: 'center'
                                  }}
                                  disabled={hasSubmitted}
                                  onClick={() => handleChemMatchClick('left', opt.id)}
                                >
                                  {opt.text}
                                  {hasSubmitted && isMatched && (() => {
                                    const currentQ = exerciseQuestions[currentExerciseIndex];
                                    const isPairCorrect = chemMatchedPairs[opt.id] === currentQ?.correctPairs[opt.id];
                                    return isPairCorrect ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>;
                                  })()}
                                </button>
                              );
                            })}
                          </div>

                          {/* 中间留白，为连线腾出足够空间 */}
                          <div></div>

                          {/* 右侧元素中文名称列表 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#0ea5e9', textAlign: 'center', marginBottom: '4px' }}>🇨🇳 中文名称</div>
                            {exerciseQuestions[currentExerciseIndex]?.rightOptions.map((opt) => {
                              const isMatched = Object.values(chemMatchedPairs).includes(opt.text);
                              const isSelected = chemSelectedRight === opt.text;
                              const hasSubmitted = !!exerciseAnswers[exerciseQuestions[currentExerciseIndex].id];

                              let btnBg = '#fff';
                              let btnBorder = '1px solid #e2e8f0';
                              let btnColor = 'hsl(var(--text-primary))';
                              let opacity = 1;

                              if (isSelected) {
                                btnBg = 'rgba(14,165,233,0.12)';
                                btnBorder = '2px solid #0ea5e9';
                                btnColor = '#0ea5e9';
                              } else if (isMatched) {
                                if (hasSubmitted) {
                                  const currentQ = exerciseQuestions[currentExerciseIndex];
                                  const linkedEng = Object.keys(chemMatchedPairs).find(key => chemMatchedPairs[key] === opt.text);
                                  const isPairCorrect = linkedEng && currentQ?.correctPairs[linkedEng] === opt.text;

                                  btnBg = isPairCorrect ? 'hsla(var(--color-success)/0.08)' : 'hsla(var(--color-danger)/0.08)';
                                  btnBorder = isPairCorrect ? '1px solid hsl(var(--color-success))' : '1px solid hsl(var(--color-danger))';
                                  btnColor = isPairCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                                  opacity = 0.6;
                                } else {
                                  btnBg = 'rgba(14,165,233,0.03)';
                                  btnBorder = '1px solid rgba(14,165,233,0.25)';
                                  btnColor = 'hsl(var(--text-primary))';
                                }
                              }

                              return (
                                <button
                                  key={opt.text}
                                  id={`chem-btn-right-${encodeURIComponent(opt.text)}`}
                                  className="btn"
                                  style={{
                                    padding: isPortraitTablet ? '8px 10px' : '12px 16px',
                                    fontSize: isPortraitTablet ? '0.72rem' : '0.82rem',
                                    borderRadius: '10px',
                                    backgroundColor: btnBg,
                                    border: btnBorder,
                                    color: btnColor,
                                    opacity: opacity,
                                    cursor: hasSubmitted ? 'default' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected ? '0 0 12px rgba(14,165,233,0.3)' : 'none',
                                    justifyContent: 'center',
                                    display: 'block',
                                    width: '100%'
                                  }}
                                  disabled={hasSubmitted}
                                  onClick={() => handleChemMatchClick('right', opt.text)}
                                >
                                  {opt.text}
                                  {hasSubmitted && isMatched && (() => {
                                    const currentQ = exerciseQuestions[currentExerciseIndex];
                                    const linkedEng = Object.keys(chemMatchedPairs).find(key => chemMatchedPairs[key] === opt.text);
                                    const isPairCorrect = linkedEng && currentQ?.correctPairs[linkedEng] === opt.text;
                                    return isPairCorrect ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>;
                                  })()}
                                </button>
                              );
                            })}
                          </div>

                          {/* 绝对定位的 SVG 画线层 */}
                          <svg style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 5
                          }}>
                            {chemMatchLines.map((line) => {
                              const hasSubmitted = !!exerciseAnswers[exerciseQuestions[currentExerciseIndex].id];
                              let strokeColor = '#a855f7';
                              if (hasSubmitted) {
                                strokeColor = line.isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))';
                              }
                              return (
                                <line
                                  key={line.id}
                                  x1={line.x1}
                                  y1={line.y1}
                                  x2={line.x2}
                                  y2={line.y2}
                                  stroke={strokeColor}
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  style={{ transition: 'stroke 0.3s ease' }}
                                />
                              );
                            })}
                          </svg>
                        </div>
                      ) : (
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
                      )}

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
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 算对了！今日金币 +0.5 个' : '❌ 算错了。今日金币 -0.5 个，已自动计错。'}
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
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成大单元百题化学特训库...</div>
                )}
              </div>

              {/* 右栏：大单元百题特训进度网格 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 大单元百题特训卡</span>
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

      {/* 📊 25天积分兑奖荣誉账单 Modal */}
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
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#047857' }}>🪙 25天化学抢跑荣誉账单</h3>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
                onClick={() => setShowBillModal(false)}
              >
                &times;
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              提示：每天金币分值等于<b>【做对题目数 &times; 1 + 做错题目数 &times; -1】</b>。家长可在此随时核对 25 天的成绩，兑换奖励。
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
