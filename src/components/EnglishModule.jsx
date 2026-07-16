import React, { useState, useEffect, useRef } from 'react';
import { englishBlocks, englishDays, englishVocabList } from '../data/englishData';
import { generateEnglishQuestions } from '../utils/questionGenerator';
import WrongBook from './WrongBook';
import { addStudyLog } from '../utils/syncService';

export default function EnglishModule() {
  const [activeTab, setActiveTab] = useState('study'); // study | test | exercise | wrongbook
  const [selectedDayId, setSelectedDayId] = useState('day1');

  // 30天每日金币积分状态 { [dayId]: score }
  const [dayScores, setDayScores] = useState({});
  const [showBillModal, setShowBillModal] = useState(false);

  // 单词自动跟读状态
  const [isAutoReading, setIsAutoReading] = useState(false);
  const [currentReadIndex, setCurrentReadIndex] = useState(-1);
  const isAutoReadingRef = useRef(false);
  const audioRef = useRef(null);

  // 10题测试状态
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers] = useState({}); // { [qId]: selectedOpt }
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [selectedTestOpt, setSelectedTestOpt] = useState(null);
  const [testChecked, setTestChecked] = useState(false);
  const [testScore, setTestScore] = useState(null);
  const [testSubmitted, setTestSubmitted] = useState(false);

  // 连线匹配题的专属交互状态
  const [selectedLeft, setSelectedLeft] = useState(null); // 被选中的英文 id (例如 "through")
  const [selectedRight, setSelectedRight] = useState(null); // 被选中的中文 id
  const [matchedPairs, setMatchedPairs] = useState({}); // { [word]: translation }
  const [matchLines, setMatchLines] = useState([]); // 连线坐标数组 [{ id, x1, y1, x2, y2, isCorrect }]
  const [hasErrorThisQuestion, setHasErrorThisQuestion] = useState(false); // 当前连线题是否发生过配对错误
  const [matchFlashError, setMatchFlashError] = useState(false); // 用于触发闪红震动效的状态

  // iPad 竖屏与移动端高灵敏自适应响应式状态
  const [isPortraitTablet, setIsPortraitTablet] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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
    for (let i = 1; i <= 31; i++) {
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

  // 连线坐标动态计算效应
  useEffect(() => {
    const updateLines = () => {
      const container = document.getElementById('match-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
      if (!currentQ) return;

      const newLines = [];
      Object.keys(matchedPairs).forEach(engWord => {
        const cnTrans = matchedPairs[engWord];
        
        const leftBtn = document.getElementById(`btn-left-${engWord}`);
        const rightBtn = document.getElementById(`btn-right-${encodeURIComponent(cnTrans)}`);

        if (leftBtn && rightBtn) {
          const leftRect = leftBtn.getBoundingClientRect();
          const rightRect = rightBtn.getBoundingClientRect();

          const x1 = leftRect.right - containerRect.left;
          const y1 = leftRect.top - containerRect.top + leftRect.height / 2;

          const x2 = rightRect.left - containerRect.left;
          const y2 = rightRect.top - containerRect.top + rightRect.height / 2;

          const correctTranslation = currentQ.correctPairs[engWord];
          const isCorrect = cnTrans === correctTranslation;

          newLines.push({
            id: engWord,
            x1, y1, x2, y2,
            isCorrect
          });
        }
      });
      setMatchLines(newLines);
    };

    const timer = setTimeout(updateLines, 50);
    window.addEventListener('resize', updateLines);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLines);
    };
  }, [matchedPairs, activeTab, currentTestIndex, currentExerciseIndex, testChecked, exerciseQuestions, testQuestions]);

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
    // 重置连线匹配专属状态
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs({});
    setHasErrorThisQuestion(false);
    setMatchFlashError(false);
  };

  // 英语测试与练习词库自动载入
  useEffect(() => {
    const dayData = englishDays[selectedDayId] || englishDays['day1'];
    
    // 自动载入 20 题测试
    const testGen = generateEnglishQuestions(dayData.topicId, 20);
    setTestQuestions(testGen);
    setTestAnswers({});
    setCurrentTestIndex(0);
    setSelectedTestOpt(null);
    setTestChecked(false);
    setTestScore(null);
    setTestSubmitted(true); // 默认直接显示题目答题
    
    // 自动载入 200 题特训
    const exGen = generateEnglishQuestions(dayData.topicId, 200);
    setExerciseQuestions(exGen);
    setExerciseAnswers({});
    setCurrentExerciseIndex(0);

    // 重置连线相关的全局状态
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs({});
    setHasErrorThisQuestion(false);
    setMatchFlashError(false);
  }, [selectedDayId]);

  // 当题目切换、Tab 切换或天数切换时，高智能同步与恢复连线状态
  useEffect(() => {
    const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
    if (!currentQ || currentQ.type !== 'match') {
      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs({});
      setHasErrorThisQuestion(false);
      setMatchFlashError(false);
      return;
    }

    // 检查这道题是否已经答过
    if (activeTab === 'test') {
      const saved = testAnswers[currentQ.id];
      if (saved && saved.matchedPairs) {
        setMatchedPairs(saved.matchedPairs);
      } else {
        setMatchedPairs({});
      }
    } else {
      const saved = exerciseAnswers[currentQ.id];
      if (saved && saved.matchedPairs) {
        setMatchedPairs(saved.matchedPairs);
      } else {
        setMatchedPairs({});
      }
    }
    
    // 重置临时选择的高亮状态与连线抖动状态
    setSelectedLeft(null);
    setSelectedRight(null);
    setHasErrorThisQuestion(false);
    setMatchFlashError(false);
  }, [currentTestIndex, currentExerciseIndex, activeTab, testQuestions, exerciseQuestions, testAnswers, exerciseAnswers]);

  // 高品质美音真人发音 (有道公开 TTS + 原生 Web Speech 完美兜底)
  const speakText = (text) => {
    if (!text) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // 停止当前所有合成播放
      }
      
      const voiceUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
      const audio = new Audio(voiceUrl);
      
      audio.play().catch(err => {
        console.warn('有道 TTS 真人读音播放受阻，已降级为浏览器原生语音合成。', err);
        fallbackSpeak(text);
      });
    } catch (e) {
      fallbackSpeak(text);
    }
  };

  // 原生语音合成兜底函数
  const fallbackSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.82;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ----------------------------------------------------
  // 单词自动“三遍循环跟读”引擎开发
  // ----------------------------------------------------

  // 异步播放英文，优先使用有道真人 TTS，降级为原生美音语音合成并返回 Promise (附带3秒超时安全保护)
  const playEnglishAudio = (text) => {
    return new Promise((resolve) => {
      if (!isAutoReadingRef.current) {
        resolve();
        return;
      }

      // 严格防护：非空和类型校验
      if (!text || typeof text !== 'string') {
        resolve();
        return;
      }

      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      // 3000ms 强行超时解锁
      const timeoutId = setTimeout(() => {
        console.warn('English audio play timeout, fallback/resolve forced');
        safeResolve();
      }, 3000);

      try {
        const voiceUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=2`;
        const audio = new Audio(voiceUrl);
        audio.volume = 0.78; // 稍微下调过响的美音英文音量，以平衡整体听感，烘托中文音量
        audioRef.current = audio;
        
        audio.onended = () => {
          safeResolve();
        };
        audio.onerror = () => {
          clearTimeout(timeoutId);
          resolved = true;
          fallbackEnglishSpeech(text).then(resolve);
        };
        audio.play().catch(() => {
          clearTimeout(timeoutId);
          resolved = true;
          fallbackEnglishSpeech(text).then(resolve);
        });
      } catch (e) {
        clearTimeout(timeoutId);
        resolved = true;
        fallbackEnglishSpeech(text).then(resolve);
      }
    });
  };

  // 原生英文合成发音 Promise (带3秒超时安全保护)
  const fallbackEnglishSpeech = (text) => {
    return new Promise((resolve) => {
      if (!isAutoReadingRef.current || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      const timeoutId = setTimeout(() => {
        safeResolve();
      }, 3000);

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.82;
        utterance.onend = () => {
          safeResolve();
        };
        utterance.onerror = () => {
          safeResolve();
        };
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        safeResolve();
      }
    });
  };

  // 异步朗读中文意思 Promise (有道中文 TTS 真人发音 ➔ 百度中文 TTS ➔ 原生 Web Speech 三重安全兜底)
  const playChineseSpeech = (text) => {
    return new Promise((resolve) => {
      if (!isAutoReadingRef.current) {
        resolve();
        return;
      }

      // 严格防护：非空和类型校验
      if (!text || typeof text !== 'string') {
        resolve();
        return;
      }

      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      // 3000ms 强行超时解锁
      const timeoutId = setTimeout(() => {
        console.warn('Chinese speech timeout, force resolve');
        safeResolve();
      }, 3000);

      let cleanText = '';

      try {
        // 去掉所有的中英文括号及括号内的修饰词 (比如 "pron. 他 (主格)" -> "pron. 他 ")
        const noBrackets = text.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '');
        // 匹配提取出其中的中文汉字
        const chineseChars = noBrackets.match(/[\u4e00-\u9fa5]+/g);
        cleanText = chineseChars ? chineseChars.join('') : '';

        if (!cleanText) {
          cleanText = text.replace(/^[a-zA-Z\.\s\/、，\d\(\)]+/, '').trim();
        }
        if (!cleanText) cleanText = text;

        // 第一层：有道中文真人发音 (显式指定 le=zh 中文引擎)
        const voiceUrl = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=zh`;
        const audio = new Audio(voiceUrl);
        audio.volume = 1.0; // 显式设置为最大音量，保障发声清晰洪亮
        audioRef.current = audio;

        audio.onended = () => {
          safeResolve();
        };
        audio.onerror = () => {
          clearTimeout(timeoutId);
          resolved = true;
          tryBaiduChineseSpeech(cleanText).then(resolve);
        };
        audio.play().catch(() => {
          clearTimeout(timeoutId);
          resolved = true;
          tryBaiduChineseSpeech(cleanText).then(resolve);
        });
      } catch (e) {
        console.error('Chinese TTS catch error:', e);
        clearTimeout(timeoutId);
        resolved = true;
        tryBaiduChineseSpeech(cleanText || text).then(resolve);
      }
    });
  };

  // 第二层：百度普通话真人发音
  const tryBaiduChineseSpeech = (cleanText) => {
    return new Promise((resolve) => {
      if (!isAutoReadingRef.current) {
        resolve();
        return;
      }

      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      const timeoutId = setTimeout(() => {
        safeResolve();
      }, 3000);

      try {
        const voiceUrl = `https://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(cleanText)}`;
        const audio = new Audio(voiceUrl);
        audio.volume = 1.0; // 显式设置为最大音量，保障发声清晰洪亮
        audioRef.current = audio;

        audio.onended = () => {
          safeResolve();
        };
        audio.onerror = () => {
          clearTimeout(timeoutId);
          resolved = true;
          fallbackChineseSpeech(cleanText).then(resolve);
        };
        audio.play().catch(() => {
          clearTimeout(timeoutId);
          resolved = true;
          fallbackChineseSpeech(cleanText).then(resolve);
        });
      } catch (e) {
        clearTimeout(timeoutId);
        resolved = true;
        fallbackChineseSpeech(cleanText).then(resolve);
      }
    });
  };

  // 原生中文 SpeechSynthesis 兜底 (带3秒超时安全保护)
  const fallbackChineseSpeech = (text) => {
    return new Promise((resolve) => {
      if (!isAutoReadingRef.current || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      let resolved = false;
      const safeResolve = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve();
        }
      };

      const timeoutId = setTimeout(() => {
        safeResolve();
      }, 3000);

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.onend = () => {
          safeResolve();
        };
        utterance.onerror = () => {
          safeResolve();
        };
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        safeResolve();
      }
    });
  };

  // 开始三遍循环自动跟读
  const startAutoReading = async () => {
    if (currentDayWords.length === 0) return;
    setIsAutoReading(true);
    isAutoReadingRef.current = true;
    
    // 记录背词行为日志
    addStudyLog(
      'english',
      'vocab_read',
      `背诵学习英语 Day ${selectedDayId.replace('day', '')} 单词表 (40个/三遍朗读中)`
    );
    
    for (let i = 0; i < currentDayWords.length; i++) {
      if (!isAutoReadingRef.current) break;
      setCurrentReadIndex(i);
      
      // 自动滚屏到当前正在背诵的卡片位置以增强体验
      const wordCardElement = document.getElementById(`word-card-${i}`);
      if (wordCardElement) {
        wordCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      const item = currentDayWords[i];
      for (let loop = 1; loop <= 3; loop++) {
        if (!isAutoReadingRef.current) break;
        
        await playEnglishAudio(item.word);
        if (!isAutoReadingRef.current) break;
        await new Promise(r => setTimeout(r, 150)); // 英中衔接微顿（150ms），合为“英文+中文”发音单元
        
        await playChineseSpeech(item.translation);
        if (!isAutoReadingRef.current) break;
        await new Promise(r => setTimeout(r, 450)); // 一遍朗读后的适度切换微顿（450ms）
      }
    }
    stopAutoReading();
  };

  // 停止跟读并清空状态
  const stopAutoReading = () => {
    isAutoReadingRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAutoReading(false);
    setCurrentReadIndex(-1);
  };

  // 监听天数与Tab变化，自动断开跟读，防止泄漏
  useEffect(() => {
    stopAutoReading();
    return () => {
      stopAutoReading();
    };
  }, [selectedDayId, activeTab]);

  // 更新金币分值：支持自定义金币变动 delta
  const updateGoldCoin = (isCorrect, weight = 1) => {
    const currentScore = dayScores[selectedDayId] || 0;
    if (currentScore > 0) return; // 重复学习不加分/扣分，分值锁定
    const delta = isCorrect ? weight : -weight;
    const newScore = Number((currentScore + delta).toFixed(2)); // 防止 JS 浮点数精度问题
    
    const nextScores = { ...dayScores, [selectedDayId]: newScore };
    setDayScores(nextScores);
    localStorage.setItem(`english-score-${selectedDayId}`, newScore.toString());
  };

  // 处理中英文单词连线点击事件
  const handleMatchClick = (side, textId) => {
    // 适配 test 与 exercise
    const currentQ = activeTab === 'test' ? testQuestions[currentTestIndex] : exerciseQuestions[currentExerciseIndex];
    if (!currentQ || (activeTab === 'test' ? testChecked : !!exerciseAnswers[currentQ.id])) return;

    let nextLeft = selectedLeft;
    let nextRight = selectedRight;
    let newMatched = { ...matchedPairs };

    if (side === 'left') {
      // 如果这个英文单词已经被连过了，用户重新点击它代表想重新连，我们需要拆除它原有的连线
      if (newMatched[textId]) {
        delete newMatched[textId];
        setMatchedPairs(newMatched);
      }
      
      if (selectedLeft === textId) {
        setSelectedLeft(null); // 反选
        return;
      }
      setSelectedLeft(textId);
      nextLeft = textId;
    } else {
      // 点击右边中文
      // 如果这个中文解释已经被连过了，我们需要找到和它相连的英文单词并拆除连线
      const linkedEngKey = Object.keys(newMatched).find(key => newMatched[key] === textId);
      if (linkedEngKey) {
        delete newMatched[linkedEngKey];
        setMatchedPairs(newMatched);
      }

      if (selectedRight === textId) {
        setSelectedRight(null); // 反选
        return;
      }
      setSelectedRight(textId);
      nextRight = textId;
    }

    // 开始匹配判定 (两边都选中时，直接连起来)
    if (nextLeft && nextRight) {
      newMatched = { ...newMatched, [nextLeft]: nextRight };
      setMatchedPairs(newMatched);
      setSelectedLeft(null);
      setSelectedRight(null);

      // 检查是否 4 对全部连满消除完毕了！
      if (Object.keys(newMatched).length === 4) {
        // 一次性检验这 4 对是否全部正确
        let isAllCorrect = true;
        Object.keys(newMatched).forEach(engKey => {
          const userTranslation = newMatched[engKey];
          const correctTranslation = currentQ.correctPairs[engKey];
          if (userTranslation !== correctTranslation) {
            isAllCorrect = false;
          }
        });

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
          // 练习模式
          const nextAnswers = {
            ...exerciseAnswers,
            [currentQ.id]: {
              isCorrect: isAllCorrect,
              userOpt: 'matched',
              matchedPairs: newMatched
            }
          };
          setExerciseAnswers(nextAnswers);
          updateGoldCoin(isAllCorrect, 0.5); // 练习每题 0.5 分
        }

        // 连错了一次或多次，记录到英语错题本
        if (!isAllCorrect) {
          const alreadyIn = wrongList.some(w => w.id === currentQ.id);
          if (!alreadyIn) {
            const wrongQ = {
              id: currentQ.id,
              question: `词汇连线题：${Object.keys(currentQ.correctPairs).join('，')}`,
              options: Object.entries(currentQ.correctPairs).map(([k, v]) => `${k} ➔ ${v}`),
              answer: '4对单词全部正确消除配对',
              userAnswer: '一次性检测中有连线错误',
              explanation: currentQ.explanation,
              chapterId: selectedDayId
            };
            const nextWrongs = [...wrongList, wrongQ];
            setWrongList(nextWrongs);
            localStorage.setItem('english-wrongs', JSON.stringify(nextWrongs));
          }
        }
      }
    }
  };

  // 英语小测统一交卷结算逻辑
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
          Object.keys(q.correctPairs).forEach(engKey => {
            if (saved.matchedPairs[engKey] !== q.correctPairs[engKey]) {
              isCorrect = false;
            }
          });
        }
      } else {
        isCorrect = saved === q.answer || (saved && saved.userOpt === q.answer);
      }

      // 标记该题的对错状态
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

      // 增减分值：做对加 0.5 分，做错扣 0.5 分 (锁分控制：如果当天已经有过积分，则不加减分)
      updateGoldCoin(isCorrect, 1.0);

      if (isCorrect) {
        correctCount++;
      } else {
        weaknesses.push(q.knowledgePoint || q.question.substring(0, 15) + '...');
        
        // 自动加入错题本
        const alreadyIn = wrongList.some(w => w.id === q.id);
        if (!alreadyIn) {
          let wrongQ;
          if (q.type === 'match') {
            wrongQ = {
              id: q.id,
              question: `词汇连线题：${Object.keys(q.correctPairs).join('，')}`,
              options: Object.entries(q.correctPairs).map(([k, v]) => `${k} ➔ ${v}`),
              answer: '4对单词全部正确消除配对',
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
    localStorage.setItem('english-wrongs', JSON.stringify(wrongList));

    const finalScore = Math.round((correctCount / testQuestions.length) * 100);
    setTestScore(finalScore);
    setTestChecked(true); // 此时展现解析

    const dayNum = selectedDayId.replace('day', '');
    addStudyLog(
      'english',
      'quiz_complete',
      `完成英语 Day ${dayNum} 20题测试`,
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

    updateGoldCoin(isCorrect, 1.0);

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
    <div className="app-container fade-in" style={{
      display: 'flex',
      flexDirection: isPortraitTablet ? 'column' : 'row',
      alignItems: 'stretch',
      gap: isPortraitTablet ? '12px' : '20px',
      height: isPortraitTablet ? 'auto' : 'calc(100vh - 120px)'
    }}>
      {/* 🌲 左侧二级与三级手风琴大纲树状目录 */}
      <div className="sidebar" style={{
        minWidth: isPortraitTablet ? '100%' : '280px',
        maxWidth: isPortraitTablet ? '100%' : '280px',
        display: 'flex',
        flexDirection: 'column',
        padding: isPortraitTablet ? '12px' : '16px',
        gap: '12px',
        overflowY: isPortraitTablet ? 'visible' : 'auto',
        backgroundColor: '#ffffff',
        borderBottom: isPortraitTablet ? '1px solid rgba(0,0,0,0.06)' : 'none',
        borderRadius: 'var(--radius-md)',
        boxShadow: isPortraitTablet ? '0 2px 8px rgba(0,0,0,0.03)' : 'none'
      }}>
        
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
            <span style={{ fontSize: '0.68rem', opacity: 0.6 }}>30+天自学与课外扩展特训</span>
          </div>
        </div>

        {/* iPad/手机竖屏自适应天数选择快捷条 */}
        {isPortraitTablet && (
          <button
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="btn btn-secondary scale-up"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              padding: '10px 14px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              backgroundColor: 'rgba(168, 85, 247, 0.05)',
              border: '1.5px solid rgba(168, 85, 247, 0.2)',
              color: '#7e22ce',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <span>📅 当前进度：<b>Day {selectedDayId.replace('day', '')}</b> ({currentDayData?.name.split('：')[1]})</span>
            <span>{showMobileSidebar ? '收起天数大纲 🔼' : '切换其他天数 🔽'}</span>
          </button>
        )}

        {/* 二级与三级学习目录树 (在竖屏下可折叠收起) */}
        {(!isPortraitTablet || showMobileSidebar) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', paddingRight: '4px' }}>
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
                      } else if (isPassed) {
                        itemBg = 'rgba(168, 85, 247, 0.12)'; // 已学过标注特殊色（淡紫色背景）
                        itemColor = '#7c3aed'; // 紫色字
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
                            if (isPortraitTablet) {
                              setShowMobileSidebar(false);
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
        )}

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
                ✍️ 20题单词连线测验
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
                📝 200题每周合并特训
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '12px', height: '520px', alignItems: 'stretch' }}>
              
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
                  
                  {isAutoReading ? (
                    <button
                      onClick={stopAutoReading}
                      className="scale-up"
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        backgroundColor: '#ef4444',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                      }}
                    >
                      ⏹️ 停止跟读 ({currentReadIndex + 1}/40)
                    </button>
                  ) : (
                    <button
                      onClick={startAutoReading}
                      className="scale-up"
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        backgroundColor: '#a855f7',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)'
                      }}
                    >
                      🔁 三遍跟读词表
                    </button>
                  )}
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

                    if (isAutoReading && currentReadIndex === idx) {
                      cardBg = 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)';
                      cardBorder = '1.8px solid #a855f7';
                      cardGlow = '0 4px 16px rgba(168, 85, 247, 0.25)';
                      cardOpacity = 1;
                    } else if (isMastered) {
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
                        id={`word-card-${idx}`}
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

        {/* Tab 2: 10题测试大厅 */}
        {activeTab === 'test' && (
          <div className="glass-card" style={{ flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '500px', overflowY: 'auto' }}>
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
                    测验包含 20 道当天词汇连线配对题。做对一道<b>+0.5金币</b>，做错一道<b>-0.5金币</b>，防止分心小测后结算。
                  </p>
                </div>
                <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 'bold', backgroundColor: '#a855f7', borderColor: '#a855f7' }} onClick={handleStartTest}>
                  开始小测
                </button>
              </div>
            ) : testScore === null ? (
              /* 答题中 (20题小测双栏自适应卡片) */
              <div style={{ display: 'grid', gridTemplateColumns: isPortraitTablet ? '1fr' : '1.25fr 1fr', gap: '20px', flex: 1 }}>
                {testQuestions.length > 0 && testQuestions[currentTestIndex] ? (
                  <>
                    {/* 左栏：核心答题面板 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
                      <span>当前第 <b>{currentTestIndex + 1}</b> / {testQuestions.length} 题</span>
                      <span>今日测验中...</span>
                    </div>

                    <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${((currentTestIndex + 1) / testQuestions.length) * 100}%`, height: '100%', backgroundColor: '#a855f7', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #edf2f7', fontSize: '0.98rem', fontWeight: 'bold' }}>
                      Q{currentTestIndex + 1}: {testQuestions[currentTestIndex]?.question}
                    </div>

                    {/* 分流渲染：连线题 (type === 'match') vs 选择题 (type === 'choice') */}
                    {testQuestions[currentTestIndex]?.type === 'match' ? (
                      /* 连线匹配题 UI */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '10px 0' }}>
                        <div
                          id="match-container"
                          style={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: '1.5fr 1fr 1.5fr',
                            gap: isPortraitTablet ? '10px' : '20px',
                            padding: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed #e2e8f0',
                            animation: matchFlashError ? 'shake 0.4s ease' : 'none'
                          }}
                        >
                          {/* 左侧英文单词列表 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#a855f7', textAlign: 'center', marginBottom: '4px' }}>🇬🇧 英文单词/短语</div>
                            {testQuestions[currentTestIndex]?.leftOptions.map((opt) => {
                              const isMatched = !!matchedPairs[opt.id];
                              const isSelected = selectedLeft === opt.id;
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
                                  const userTranslation = matchedPairs[opt.id];
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
                                  id={`btn-left-${opt.id}`}
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
                                  onClick={() => handleMatchClick('left', opt.id)}
                                >
                                  {opt.text}
                                  {hasSubmitted && isMatched && (
                                    matchedPairs[opt.id] === testQuestions[currentTestIndex]?.correctPairs[opt.id] ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* 中间留白 */}
                          <div></div>

                          {/* 右侧中文翻译列表 */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#0ea5e9', textAlign: 'center', marginBottom: '4px' }}>🇨🇳 中文翻译解释</div>
                            {testQuestions[currentTestIndex]?.rightOptions.map((opt) => {
                              const isMatched = Object.values(matchedPairs).includes(opt.text);
                              const isSelected = selectedRight === opt.text;
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
                                  const linkedEng = Object.keys(matchedPairs).find(key => matchedPairs[key] === opt.text);
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
                                  id={`btn-right-${encodeURIComponent(opt.text)}`}
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
                                  onClick={() => handleMatchClick('right', opt.text)}
                                >
                                  {opt.text}
                                  {hasSubmitted && isMatched && (() => {
                                    const linkedEng = Object.keys(matchedPairs).find(key => matchedPairs[key] === opt.text);
                                    const isPairCorrect = linkedEng && testQuestions[currentTestIndex]?.correctPairs[linkedEng] === opt.text;
                                    return isPairCorrect ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>;
                                  })()}
                                </button>
                              );
                            })}
                          </div>

                          {/* SVG 划线 */}
                          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5 }}>
                            {matchLines.map((line) => {
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
                        <style>{`
                          @keyframes shake {
                            0%, 100% { transform: translateX(0); }
                            20%, 60% { transform: translateX(-6px); }
                            40%, 80% { transform: translateX(6px); }
                          }
                        `}</style>
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
                                btnStyle = { border: '1px solid #a855f7', backgroundColor: 'rgba(168,85,247,0.08)', color: '#a855f7' };
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

                  {/* 解析 */}
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
                          ? ((testAnswers[testQuestions[currentTestIndex]?.id]?.state === 'correct' || testAnswers[testQuestions[currentTestIndex]?.id] === 'correct') ? '✅ 连线消除全对！今日金币 +1 个' : '❌ 配对中有错误。今日金币 -1 个。')
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
                        style={{ backgroundColor: '#a855f7', borderColor: '#a855f7', fontWeight: 'bold' }}
                        onClick={handleTestSubmitAll}
                      >
                        交卷并结算小测
                      </button>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                      disabled={currentTestIndex === testQuestions.length - 1}
                      onClick={() => setCurrentTestIndex(prev => prev + 1)}
                    >
                      下一题
                    </button>
                  </div>
                </div>

                {/* 右栏：20题小测网格大答题卡 */}
                <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', height: 'fit-content' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
                    <span>🎯 20题英语测验卡</span>
                    {testChecked && <span style={{ color: '#a855f7' }}>得分：{testScore}分</span>}
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
                          bgColor = 'rgba(168, 85, 247, 0.12)';
                          textColor = '#7e22ce';
                        }
                      }
                      
                      if (idx === currentTestIndex) {
                        borderStyle = '2px solid #a855f7';
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
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.12)' }}></span>已答
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
                  <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: '#a0aec0', width: '100%' }}>正在生成今日英语小测题库...</div>
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
                  💡 <b>提分秘籍提示：</b> 恭喜你完成了今天的过关测试！别忘了，本周还有 <b>200 道合并特训题库（连线与句子填空）</b> 供你狂练。挑战它们不仅能帮你稳固薄弱环节，还能<b>获得更多金币</b>哦！
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
                          Day {selectedDayId.replace('day', '')} 本周合并特训 · 第 {currentExerciseIndex + 1} / 200 题
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                          累计金币：{todayGoldCoin >= 0 ? `+${todayGoldCoin}` : todayGoldCoin}
                        </span>
                      </div>

                      <div style={{ padding: '14px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', fontSize: '0.96rem', fontWeight: 'bold' }}>
                        {exerciseQuestions[currentExerciseIndex].question}
                      </div>

                      {/* 分流渲染：连线题 (type === 'match') vs 选择题 (type === 'choice') */}
                      {exerciseQuestions[currentExerciseIndex]?.type === 'match' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '10px 0' }}>
                          <div
                            id="match-container"
                            style={{
                              position: 'relative',
                              display: 'grid',
                              gridTemplateColumns: '1.5fr 1fr 1.5fr',
                              gap: isPortraitTablet ? '10px' : '20px',
                              padding: '16px',
                              backgroundColor: 'rgba(255, 255, 255, 0.4)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px dashed #e2e8f0',
                              animation: matchFlashError ? 'shake 0.4s ease' : 'none'
                            }}
                          >
                            {/* 左侧英文单词列表 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#a855f7', textAlign: 'center', marginBottom: '4px' }}>🇬🇧 英文单词/短语</div>
                              {exerciseQuestions[currentExerciseIndex]?.leftOptions.map((opt) => {
                                const isMatched = !!matchedPairs[opt.id];
                                const isSelected = selectedLeft === opt.id;
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
                                    const userTranslation = matchedPairs[opt.id];
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
                                    id={`btn-left-${opt.id}`}
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
                                      justifyContent: 'center'
                                    }}
                                    disabled={hasSubmitted}
                                    onClick={() => handleMatchClick('left', opt.id)}
                                  >
                                    {opt.text}
                                    {hasSubmitted && isMatched && (() => {
                                      const currentQ = exerciseQuestions[currentExerciseIndex];
                                      const isPairCorrect = matchedPairs[opt.id] === currentQ?.correctPairs[opt.id];
                                      return isPairCorrect ? <span style={{ marginLeft: '6px' }}>✅</span> : <span style={{ marginLeft: '6px' }}>❌</span>;
                                    })()}
                                  </button>
                                );
                              })}
                            </div>

                            {/* 中间留白，为连线腾出足够空间 */}
                            <div></div>

                            {/* 右侧中文翻译列表 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#0ea5e9', textAlign: 'center', marginBottom: '4px' }}>🇨🇳 中文翻译解释</div>
                              {exerciseQuestions[currentExerciseIndex]?.rightOptions.map((opt) => {
                                const isMatched = Object.values(matchedPairs).includes(opt.text);
                                const isSelected = selectedRight === opt.text;
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
                                    const linkedEng = Object.keys(matchedPairs).find(key => matchedPairs[key] === opt.text);
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
                                    id={`btn-right-${encodeURIComponent(opt.text)}`}
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
                                      justifyContent: 'center',
                                      display: 'block',
                                      width: '100%'
                                    }}
                                    disabled={hasSubmitted}
                                    onClick={() => handleMatchClick('right', opt.text)}
                                  >
                                    {opt.text}
                                    {hasSubmitted && isMatched && (() => {
                                      const currentQ = exerciseQuestions[currentExerciseIndex];
                                      const linkedEng = Object.keys(matchedPairs).find(key => matchedPairs[key] === opt.text);
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
                              {matchLines.map((line) => {
                                const hasSubmitted = !!exerciseAnswers[exerciseQuestions[currentExerciseIndex].id];
                                let strokeColor = '#a855f7'; // 答题中：紫色连线
                                if (hasSubmitted) {
                                  strokeColor = line.isCorrect ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'; // 提交后：红绿连线
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
                            {exerciseAnswers[exerciseQuestions[currentExerciseIndex].id].isCorrect ? '✅ 答对了！今日金币 +0.5 个' : '❌ 答错了。今日金币 -0.5 个，已自动计错。'}
                          </div>
                          {exerciseQuestions[currentExerciseIndex].explanation}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        disabled={currentExerciseIndex === 0}
                        onClick={() => {
                          setSelectedLeft(null);
                          setSelectedRight(null);
                          setMatchedPairs({});
                          setHasErrorThisQuestion(false);
                          setMatchFlashError(false);
                          setCurrentExerciseIndex(prev => prev - 1);
                        }}
                      >
                        上一题
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ backgroundColor: '#a855f7', borderColor: '#a855f7' }}
                        disabled={currentExerciseIndex === 199}
                        onClick={() => {
                          setSelectedLeft(null);
                          setSelectedRight(null);
                          setMatchedPairs({});
                          setHasErrorThisQuestion(false);
                          setMatchFlashError(false);
                          setCurrentExerciseIndex(prev => prev + 1);
                        }}
                      >
                        下一题
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#a0aec0' }}>正在生成本周 200 题英语特训库...</div>
                )}
              </div>

              {/* 右栏：200题进度网格 */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🎯 200题英语特训卡</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                    已完成：{Object.keys(exerciseAnswers).length} / 200
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
                  {Array.from({ length: 200 }).map((_, idx) => {
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
                        onClick={() => {
                          setSelectedLeft(null);
                          setSelectedRight(null);
                          setMatchedPairs({});
                          setHasErrorThisQuestion(false);
                          setMatchFlashError(false);
                          setCurrentExerciseIndex(idx);
                        }}
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
              提示：每天金币分值等于<b>【做对题目数 &times; 1 + 做错题目数 &times; -1】</b>。家长可在此随时核对 31 天的打卡成绩。
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
              padding: '6px'
            }}>
              {Array.from({ length: 31 }).map((_, idx) => {
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
