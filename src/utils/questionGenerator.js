/**
 * 中考数理智能特训平台 - 习题发生器引擎 (Question Generator Engine)
 * 支持物理 1200 题与数学 900 题的高清算法级生成，自带智能解析与分步推导步骤。
 */

import { staticQuestions, elementPools } from '../data/chemistryQuestions.js';
import { englishVocabList } from '../data/englishData.js';

// 辅助函数：生成范围内的随机整数 (包含两端)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 辅助函数：求最大公约数 (用于分数通分与化简)
function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// 辅助函数：化简分数形式字符串
function simplifyFraction(num, den) {
  if (den === 0) return '无意义';
  const g = gcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
}

/**
 * 1. 物理 100 题动态变式发生器
 * @param {string} chapterId 章节ID (chapter1 - chapter12)
 * @param {object} baseQuestions 数据层中已录入的 20 道基础测试题
 * @param {number} count 需要生成的题目数 (如 100)
 */
export function generatePhysicsQuestions(chapterId, baseQuestions, count = 100) {
  // 获取本章的基础测试题 (通常有20道)
  const seedQs = baseQuestions.filter(q => q.chapterId === chapterId);
  if (seedQs.length === 0) return [];

  const results = [];
  
  // 核心循环：通过复制、扰动数值及变换问法生成 100 道题
  for (let i = 0; i < count; i++) {
    // 轮流选取种子题目进行变式
    const seed = seedQs[i % seedQs.length];
    
    // 如果是概念判断题，我们采用选项乱序或者主谓语微调
    if (seed.category.includes('概念') || seed.category.includes('特性') || seed.category.includes('规律') || seed.category.includes('应用') || seed.category.includes('性质')) {
      // 随机微调题干，例如在“下列说法中...”中随机更换干扰项位置
      const shuffledOptions = [...seed.options];
      const correctText = seed.options[seed.answer];
      
      // 随机洗牌选项
      for (let j = shuffledOptions.length - 1; j > 0; j--) {
        const r = Math.floor(Math.random() * (j + 1));
        [shuffledOptions[j], shuffledOptions[r]] = [shuffledOptions[r], shuffledOptions[j]];
      }
      
      const newAnswer = shuffledOptions.indexOf(correctText);
      
      results.push({
        id: parseInt(`1000${seed.id}${i}`),
        chapterId: seed.chapterId,
        blockId: seed.blockId,
        category: seed.category,
        question: `【练习题 ${i + 1}】${seed.question.replace('某', '有一个')}`,
        options: shuffledOptions,
        answer: newAnswer,
        explanation: `${seed.explanation} (选项顺序已重组，请仔细辨析)`
      });
      continue;
    }

    // 如果是计算类题目，我们执行“数值随机扰动”与“解析公式动态代入”
    if (seed.category.includes('计算') || seed.category.includes('读数') || seed.category.includes('公式') || seed.category.includes('求') || seed.category.includes('算')) {
      
      // 针对不同考点的计算式生成
      if (chapterId === 'chapter1' && seed.category.includes('速度')) {
        // 变式 1. 前半程后半程求平均速度
        const s1 = randomInt(4, 15);
        const t1 = randomInt(1, 3);
        const s2 = randomInt(6, 20);
        const t2 = randomInt(2, 5);
        
        const s_total = s1 + s2;
        const t_total = t1 + t2;
        const v_avg = (s_total / t_total).toFixed(2);
        
        const correct = `${v_avg} m/s`;
        const wrong1 = `${((s1/t1 + s2/t2)/2).toFixed(2)} m/s`;
        const wrong2 = `${(s_total / (t1 + t2 + 2)).toFixed(2)} m/s`;
        const wrong3 = `${(s1 + s2).toFixed(1)} m/s`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`1100${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】一物体在水平面上做变速运动，前半程路程为 ${s1} m，用时 ${t1} s；后半程路程为 ${s2} m，用时 ${t2} s。该物体在全程的平均速度是：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：平均速度不是速度的平均值！必须用【总路程 / 总时间】。总路程 s = ${s1}m + ${s2}m = ${s_total}m，总时间 t = ${t1}s + ${t2}s = ${t_total}s。平均速度 v = s/t = ${s_total}m / ${t_total}s ≈ ${v_avg} m/s。`
        });
        
      } else if (chapterId === 'chapter6' && seed.category.includes('密度')) {
        // 变式 2. 密度计算 m/V
        const m = randomInt(10, 150); // 质量克
        const v = randomInt(5, 50);   // 体积cm³
        const rho = (m / v).toFixed(2);
        
        const correct = `${rho} g/cm³`;
        const wrong1 = `${(v / m).toFixed(2)} g/cm³`;
        const wrong2 = `${(m * v).toFixed(0)} g/cm³`;
        const wrong3 = `${(m / (v + 3)).toFixed(2)} g/cm³`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`1600${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】测得某一实心金属块的质量为 ${m} g，体积为 ${v} cm³，则该金属块的密度为：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：利用密度计算公式：ρ = m / V = ${m} g / ${v} cm³ = ${rho} g/cm³。常考密度单位换算：1 g/cm³ = 10³ kg/m³。`
        });

      } else if (chapterId === 'chapter7' && seed.category.includes('重力')) {
        // 变式 3. 重力 G = mg
        const mass = randomInt(2, 80); // 质量 kg
        const gravity = mass * 10;
        
        const correct = `${gravity} N`;
        const wrong1 = `${mass} N`;
        const wrong2 = `${(mass / 10).toFixed(1)} N`;
        const wrong3 = `${gravity + 10} N`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`1700${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】一物体放在月球车上运回地球，其在地球上的质量为 ${mass} kg，则它受到的重力是 (g取10 N/kg)：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：质量是物体的基本属性，不随位置改变而改变。在地球上它的重力 G = mg = ${mass} kg × 10 N/kg = ${gravity} N。重力方向竖直向下。`
        });

      } else if (chapterId === 'chapter9' && seed.category.includes('压强')) {
        // 变式 4. 液体压强 p = ρgh
        const h = randomInt(5, 80); // 深度 cm
        const h_m = h / 100;
        const p = Math.round(1000 * 10 * h_m);
        
        const correct = `${p} Pa`;
        const wrong1 = `${p * 10} Pa`;
        const wrong2 = `${p / 10} Pa`;
        const wrong3 = `${h * 10} Pa`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`1900${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】装有清水的圆柱形水杯中，水面到某测点处的垂直深度为 ${h} cm，则该点受到的液体压强为 (ρ_水=1.0×10³kg/m³, g取10 N/kg)：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：求液体压强必须使用公式 p = ρgh。首先把深度 h = ${h} cm 换算成标准单位 m，即 h = ${h_m} m。代入计算：p = 1.0×10³ kg/m³ × 10 N/kg × ${h_m} m = ${p} Pa。`
        });

      } else if (chapterId === 'chapter10' && seed.category.includes('浮力')) {
        // 变式 5. 称重法测浮力 F_浮 = G - F
        const G = randomInt(8, 50); 
        const F_shi = randomInt(3, G - 2);
        const F_fu = G - F_shi;
        
        const correct = `${F_fu} N`;
        const wrong1 = `${G + F_shi} N`;
        const wrong2 = `${F_shi} N`;
        const wrong3 = `${(G / 2).toFixed(1)} N`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`2000${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】一金属块在空气中用弹簧测力计称得重力为 ${G} N，当把它完全浸没在水中时，弹簧测力计的示数变为 ${F_shi} N，则该金属块在水中受到的浮力为：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：利用浮力“称重法”公式计算。F_浮 = G - F_示。弹簧测力计示数减小的值就是浮力的大小。所以 F_浮 = ${G} N - ${F_shi} N = ${F_fu} N。完全浸没后，深度改变时浮力保持不变。`
        });

      } else if (chapterId === 'chapter11' && (seed.category.includes('功') || seed.category.includes('功率'))) {
        // 变式 6. 功 W = Fs，功率 P = W/t
        const F = randomInt(15, 200); // 拉力 N
        const s = randomInt(2, 25);   // 距离 m
        const t = randomInt(4, 20);   // 时间 s
        const W = F * s;
        const P = (W / t).toFixed(1);
        
        const correct = `${W} J，${P} W`;
        const wrong1 = `${W + 10} J，${(W/t + 2).toFixed(1)} W`;
        const wrong2 = `${F * t} J，${(W * t).toFixed(0)} W`;
        const wrong3 = `${F} J，${(F / t).toFixed(1)} W`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);
        
        results.push({
          id: parseInt(`2100${seed.id}${i}`),
          chapterId,
          blockId: seed.blockId,
          category: seed.category,
          question: `【练习题 ${i + 1}】用 ${F} N 的水平拉力，拉着重 500 N 的货箱在水平地面上匀速前进了 ${s} m，用时 ${t} s。拉力做的功和拉力做功的功率分别是：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师提分攻略：1. 求拉力做的功，必须代入拉力 F = ${F} N 和沿力方向移动的距离 s = ${s} m。W = Fs = ${F} N × ${s} m = ${W} J（箱子重力方向竖直向下，在水平移动时重力不做功）。2. 拉力做功功率 P = W / t = ${W} J / ${t} s = ${P} W。`
        });

      } else {
        // 其他常规计算题直接复制种子但变换题干数字
        const seedCopy = { ...seed };
        seedCopy.id = parseInt(`2200${seed.id}${i}`);
        seedCopy.question = `【练习题 ${i + 1}】${seed.question}`;
        results.push(seedCopy);
      }
    }
  }

  return results.slice(0, count);
}

/**
 * 2. 数学 100 题动态计算发生引擎
 * @param {string} topicId 知识点ID (math_topic1 - math_topic9)
 * @param {number} count 需要生成的题目数 (如 100)
 */
export function generateMathQuestions(topicId, count = 100) {
  const list = [];
  
  for (let i = 0; i < count; i++) {
    const qIndex = i + 1;
    let qObj = {};

    switch (topicId) {
      // 1. 小数与分数的四则混合运算
      case 'math_topic1': {
        const a = randomInt(2, 6);
        const b = randomInt(2, 5);
        const c = randomInt(1, 4);
        const d = randomInt(2, 5);
        
        // 计算 a/b + c/d
        const num = a * d + c * b;
        const den = b * d;
        const ansStr = simplifyFraction(num, den);
        
        const correct = ansStr;
        const wrong1 = simplifyFraction(a + c, b + d); // 易错：分子分母直接相加
        const wrong2 = simplifyFraction(a * d - c * b, den);
        const wrong3 = simplifyFraction(a * c, b * d);
        
        const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3]));
        while (opts.length < 4) {
          opts.push(simplifyFraction(randomInt(1, 20), randomInt(2, 15)));
        }
        opts.sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30100${qIndex}`),
          category: '分数加减混合运算',
          question: `【习题 ${qIndex}】计算：${a}/${b} + ${c}/${d} = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 通分：分母 ${b} 和 ${d} 的最小公倍数是 ${den}。\n步骤 2. 转换：${a}/${b} = ${a * d}/${den}，${c}/${d} = ${c * b}/${den}。\n步骤 3. 相加：${a * d}/${den} + ${c * b}/${den} = (${a * d} + ${c * b})/${den} = ${num}/${den}。\n步骤 4. 约分化简：最终结果为 ${ansStr}。`
        };
        break;
      }

      // 2. 有理数的四则混合运算
      case 'math_topic2': {
        // (-a) * b + c - d^2
        const a = randomInt(2, 5);
        const b = randomInt(2, 4);
        const c = randomInt(3, 10);
        const d = randomInt(2, 3);
        
        const term1 = -a * b;
        const term2 = d * d;
        const ansVal = term1 + c - term2;
        
        const correct = `${ansVal}`;
        const wrong1 = `${term1 + c + term2}`; // 乘方负号易错
        const wrong2 = `${-a * (b + c) - term2}`;
        const wrong3 = `${-a * b - c - term2}`;
        
        const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3]));
        while (opts.length < 4) {
          opts.push(`${randomInt(-50, 50)}`);
        }
        opts.sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30200${qIndex}`),
          category: '有理数四则混合运算',
          question: `【习题 ${qIndex}】计算：(-${a}) × ${b} + ${c} - ${d}² = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 计算乘方：${d}² = ${term2}，原式变为 (-${a}) × ${b} + ${c} - ${term2}。\n步骤 2. 计算乘法：(-${a}) × ${b} = ${term1}，原式变为 ${term1} + ${c} - ${term2}。\n步骤 3. 进行加减：${term1} + ${c} = ${term1 + c}，接着 ${term1 + c} - ${term2} = ${ansVal}。\n注意：-${d}² 的负号在乘方外面，应先算乘方，再加负号。`
        };
        break;
      }

      // 3. 整式的乘除与化简
      case 'math_topic3': {
        // 化简：a(x + b) - c(x - d)
        const a = randomInt(2, 4);
        const b = randomInt(1, 5);
        const c = randomInt(2, 3);
        const d = randomInt(1, 4);
        
        const coeff_x = a - c;
        const constant = a * b + c * d; // 注意去括号变号： -c * -d = +cd
        
        let correct = '';
        if (coeff_x === 1) correct = `x + ${constant}`;
        else if (coeff_x === -1) correct = `-x + ${constant}`;
        else if (coeff_x === 0) correct = `${constant}`;
        else correct = `${coeff_x}x + ${constant}`;
        
        const wrong1 = `${a + c}x + ${a * b - c * d}`; // 易错：未变号
        const wrong2 = `${coeff_x}x - ${a * b + c * d}`;
        const wrong3 = `${a - c}x + ${a * b - c * d}`;
        
        const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3]));
        while (opts.length < 4) {
          opts.push(`${randomInt(-5, 5)}x + ${randomInt(1, 30)}`);
        }
        opts.sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30300${qIndex}`),
          category: '整式的去括号与化简',
          question: `【习题 ${qIndex}】化简整式：${a}(x + ${b}) - ${c}(x - ${d}) = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 去括号展开：\n   - 第一部分：${a}(x + ${b}) = ${a}x + ${a * b}\n   - 第二部分：-${c}(x - ${d}) = -${c}x + ${c * d}（⚠️注意：负负得正，变成 +${c * d}）\n步骤 2. 合并同类项：\n   - x项：(${a}x - ${c}x) = ${coeff_x}x\n   - 常数项：${a * b} + ${c * d} = ${constant}\n综合化简结果为：${correct}。`
        };
        break;
      }

      // 4. 因式分解
      case 'math_topic4': {
        // 分解 x^2 - a^2 = (x - a)(x + a)
        const a = randomInt(2, 12);
        const a2 = a * a;
        
        const correct = `(x - ${a})(x + ${a})`;
        const wrong1 = `(x - ${a})²`;
        const wrong2 = `(x + ${a})²`;
        const wrong3 = `(x - ${a2})(x + 1)`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30400${qIndex}`),
          category: '公式法因式分解',
          question: `【习题 ${qIndex}】在实数范围内分解因式：x² - ${a2} = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 识别公式：该多项式符合平方差公式：a² - b² = (a - b)(a + b)。\n步骤 2. 转换形式：x² - ${a2} 转化为 x² - ${a}²。\n步骤 3. 套用公式分解：得到 (x - ${a})(x + ${a})。`
        };
        break;
      }

      // 5. 分式的运算与化简求值
      case 'math_topic5': {
        // 计算 a / (x-1) - a / (x+1) = 2a / (x^2 - 1)
        const a = randomInt(2, 6);
        const correct = `${2 * a} / (x² - 1)`;
        const wrong1 = `0`;
        const wrong2 = `${2 * a} / (x - 1)`;
        const wrong3 = `${a} / (x² - 1)`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30500${qIndex}`),
          category: '分式同分加减',
          question: `【习题 ${qIndex}】化简分式：${a} / (x - 1) - ${a} / (x + 1) = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 通分找公分母：公分母为 (x - 1)(x + 1) = x² - 1。\n步骤 2. 转换分子：\n   - 第一项：${a} / (x - 1) = ${a}(x + 1) / (x² - 1) = (${a}x + ${a}) / (x² - 1)\n   - 第二项：${a} / (x + 1) = ${a}(x - 1) / (x² - 1) = (${a}x - ${a}) / (x² - 1)\n步骤 3. 分子相减：(${a}x + ${a}) - (${a}x - ${a}) = ${a}x + ${a} - ${a}x + ${a} = ${2 * a}。\n最终化简结果为：${correct}。`
        };
        break;
      }

      // 6. 二次根式的化简与计算
      case 'math_topic6': {
        // 根式计算：sqrt(a) * sqrt(b) = sqrt(ab)
        const aVals = [2, 3, 5, 6];
        const a = aVals[randomInt(0, aVals.length - 1)];
        const b = 12 / a === parseInt(12/a) ? 7 : 8; // 保证不生成全整数
        
        const inside = a * b;
        // 化简 sqrt(inside)
        // 寻找 inside 的最大平方因子
        let factor = 1;
        let outer = 1;
        for (let f = 2; f * f <= inside; f++) {
          if (inside % (f * f) === 0) {
            factor = f * f;
            outer = f;
          }
        }
        const inner = inside / factor;
        
        const correct = outer > 1 ? `${outer}√${inner}` : `√${inside}`;
        const wrong1 = `${inside}`;
        const wrong2 = `${outer * 2}√${inner}`;
        const wrong3 = `√${inside + 3}`;
        
        const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3]));
        while (opts.length < 4) {
          opts.push(`${randomInt(2, 6)}√${randomInt(2, 5)}`);
        }
        opts.sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30600${qIndex}`),
          category: '二次根式化简与合并',
          question: `【习题 ${qIndex}】计算二次根式：√${a} × √${b} = ？`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 利用乘法公式：√a × √b = √ab。原式 = √(${a} × ${b}) = √${inside}。\n步骤 2. 寻找最大平方数因子：${inside} 可以分解为 ${factor} × ${inner}，其中 ${factor} 是 ${outer} 的平方。\n步骤 3. 化为最简根式：√${inside} = √(${outer}² × ${inner}) = ${correct}。`
        };
        break;
      }

      // 7. 一元一次方程及方程组的解法
      case 'math_topic7': {
        // 解方程组：
        // x + y = s
        // ax - by = t
        // 设整数根为 x_ans, y_ans
        const x_ans = randomInt(-5, 6);
        const y_ans = randomInt(-3, 8);
        const a = randomInt(2, 3);
        const b = randomInt(1, 2);
        
        const s = x_ans + y_ans;
        const t = a * x_ans - b * y_ans;
        
        const correct = `x = ${x_ans}, y = ${y_ans}`;
        const wrong1 = `x = ${x_ans + 1}, y = ${y_ans - 1}`;
        const wrong2 = `x = ${y_ans}, y = ${x_ans}`;
        const wrong3 = `x = ${x_ans - 2}, y = ${y_ans + 2}`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30700${qIndex}`),
          category: '二元一次方程组求解',
          question: `【习题 ${qIndex}】解方程组：\n   ① x + y = ${s}\n   ② ${a}x - ${b === 1 ? '' : b}y = ${t}\n求得的解是：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 由方程①变形：得 x = ${s} - y （代入法思路）。\n步骤 2. 将此代入方程②：得 ${a}(${s} - y) - ${b === 1 ? '' : b}y = ${t}。\n步骤 3. 展开去括号解一元方程：\n   - ${a * s} - ${a}y - ${b === 1 ? '' : b}y = ${t}\n   - -${a + b}y = ${t - a * s}\n   - 求得 y = ${y_ans}。\n步骤 4. 回代求解 x：x = ${s} - ${y_ans} = ${x_ans}。\n得到方程组的解为：${correct}。`
        };
        break;
      }

      // 8. 一元二次方程的解法
      case 'math_topic8': {
        // x^2 - (x1+x2)x + x1*x2 = 0
        const x1 = randomInt(-4, 3);
        const x2 = randomInt(x1 + 1, x1 + 5); // 保证两根不同且 x2 > x1
        const p = -(x1 + x2);
        const q = x1 * x2;
        
        // 算式：x^2 + px + q = 0
        const sign_p = p >= 0 ? `+ ${p}` : `- ${Math.abs(p)}`;
        const sign_q = q >= 0 ? `+ ${q}` : `- ${Math.abs(q)}`;
        
        const correct = `x₁ = ${x1}, x₂ = ${x2}`;
        const wrong1 = `x₁ = ${-x1}, x₂ = ${-x2}`; // 易错：正负号搞反
        const wrong2 = `x₁ = ${x1 - 1}, x₂ = ${x2 + 1}`;
        const wrong3 = `无解`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30800${qIndex}`),
          category: '因式分解解一元二次方程',
          question: `【习题 ${qIndex}】解方程：x² ${p === 0 ? '' : sign_p + 'x'} ${sign_q} = 0，方程的根是：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 因式分解（十字相乘法）：\n   - 常数项 ${q} 可分解为 ${x1} × ${x2}。\n   - 它们的和刚好等于一次项系数：${x1} + ${x2} = ${x1 + x2} (即 ${p} 的相反数)。\n   - 故方程可化为：(x - ${x1})(x - ${x2}) = 0。\n步骤 2. 求解：令任一括号为0，即 x - ${x1} = 0 或 x - ${x2} = 0。\n得 x₁ = ${x1}, x₂ = ${x2}。`
        };
        break;
      }

      // 9. 一元一次不等式及不等式组的解法
      case 'math_topic9': {
        // x > a
        // x <= b
        // 保证 a < b 使得解集为 a < x <= b
        const a = randomInt(-5, 2);
        const b = randomInt(a + 1, a + 4);
        
        // 构建不等式 1: x + c > a + c
        const c = randomInt(1, 5);
        // 构建不等式 2: dx <= db
        const d = randomInt(2, 3);
        
        const correct = `${a} < x ≤ ${b}`;
        const wrong1 = `x > ${a}`;
        const wrong2 = `x ≤ ${b}`;
        const wrong3 = `${a} ≤ x < ${b}`;
        
        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`30900${qIndex}`),
          category: '解一元一次不等式组',
          question: `【习题 ${qIndex}】求不等式组的解集：\n   ① x - ${c} > ${a - c}\n   ② ${d}x ≤ ${d * b}\n解集是：`,
          options: opts,
          answer: ansIdx,
          explanation: `名师分步解析：\n步骤 1. 解不等式①：\n   - 两边同加 ${c}，得 x > ${a - c} + ${c}，即 x > ${a}。\n步骤 2. 解不等式②：\n   - 两边同除以 ${d}（因为 ${d} 为正数，不等号方向不变），得 x ≤ ${b}。\n步骤 3. 取两解集的交集：\n   - 在数轴上，大于 ${a}（空心点向右）与小于等于 ${b}（实心点向左）的重叠部分为：${correct}。`
        };
        break;
      }

      // 10. 勾股定理几何计算
      case 'math_topic10': {
        const triples = [
          { a: 3, b: 4, c: 5 },
          { a: 5, b: 12, c: 13 },
          { a: 6, b: 8, c: 10 },
          { a: 8, b: 15, c: 17 },
          { a: 9, b: 12, c: 15 }
        ];
        const triple = triples[randomInt(0, triples.length - 1)];
        const askHypotenuse = randomInt(0, 1) === 1;

        let question = '';
        let correct = '';
        let wrong1 = '';
        let wrong2 = '';
        let wrong3 = '';
        let explanation = '';

        if (askHypotenuse) {
          question = `【习题 ${qIndex}】已知直角三角形的两条直角边分别为 a = ${triple.a}，b = ${triple.b}。求该直角三角形的斜边 c 的长度：`;
          correct = `${triple.c}`;
          wrong1 = `${triple.a + triple.b}`;
          wrong2 = `${triple.b + 1}`;
          wrong3 = `${triple.c + 2}`;
          explanation = `名师分步解析：\n步骤 1. 套用勾股定理公式：直角三角形两直角边的平方和，等于斜边的平方。公式为：a² + b² = c²。\n步骤 2. 代入数值计算平方：${triple.a}² + ${triple.b}² = ${triple.a * triple.a} + ${triple.b * triple.b} = ${triple.c * triple.c}。\n步骤 3. 开平方求斜边：c = √(${triple.c * triple.c}) = ${triple.c}。`;
        } else {
          question = `【习题 ${qIndex}】已知直角三角形的一条直角边 a = ${triple.a}，斜边 c = ${triple.c}。求另一条直角边 b 的长度：`;
          correct = `${triple.b}`;
          wrong1 = `${triple.c - triple.a}`;
          wrong2 = `${triple.b + 2}`;
          wrong3 = `${triple.a + 1}`;
          explanation = `名师分步解析：\n步骤 1. 套用勾股定理变形公式：已知斜边与直角边，求另一条直角边。公式为：b² = c² - a²。\n步骤 2. 代入数值计算平方差：${triple.c}² - ${triple.a}² = ${triple.c * triple.c} - ${triple.a * triple.a} = ${triple.b * triple.b}。\n步骤 3. 开平方求直角边：b = √(${triple.b * triple.b}) = ${triple.b}。`;
        }

        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`31000${qIndex}`),
          category: '勾股定理线段计算',
          question,
          options: opts,
          answer: ansIdx,
          explanation
        };
        break;
      }

      // 11. 中考数据统计计算
      case 'math_topic11': {
        const sets = [
          { data: [2, 3, 3, 5, 7], mean: 4, median: 3, mode: 3, range: 5 },
          { data: [1, 2, 2, 4, 6], mean: 3, median: 2, mode: 2, range: 5 },
          { data: [3, 4, 4, 7, 7], mean: 5, median: 4, mode: 4, range: 4 },
          { data: [2, 4, 4, 6, 9], mean: 5, median: 4, mode: 4, range: 7 }
        ];
        const selectedSet = sets[randomInt(0, sets.length - 1)];
        const askMean = randomInt(0, 1) === 1;

        let question = '';
        let correct = '';
        let wrong1 = '';
        let wrong2 = '';
        let wrong3 = '';
        let explanation = '';

        const dataStr = selectedSet.data.join(', ');

        if (askMean) {
          question = `【习题 ${qIndex}】已知一组数据为：${dataStr}。求这组数据的平均数是：`;
          correct = `${selectedSet.mean}`;
          const sum = selectedSet.data.reduce((x, y) => x + y, 0);
          wrong1 = `${selectedSet.median}`;
          wrong2 = `${selectedSet.mean + 1}`;
          wrong3 = `${selectedSet.mean - 1}`;
          explanation = `名师分步解析：\n步骤 1. 平均数等于这组数据中所有数值的总和，除以数据的个数。\n步骤 2. 求和计算：(${selectedSet.data.join(' + ')}) = ${sum}。\n步骤 3. 求平均值：${sum} ÷ 5 = ${selectedSet.mean}。`;
        } else {
          question = `【习题 ${qIndex}】已知一组已排序的数据为：${dataStr}。求这组数据的中位数是：`;
          correct = `${selectedSet.median}`;
          wrong1 = `${selectedSet.mean}`;
          wrong2 = `${selectedSet.median + 1}`;
          wrong3 = `${selectedSet.median - 1}`;
          explanation = `名师分步解析：\n步骤 1. 中位数定义：把一组数据按大小顺序排列后，处在最中间位置的一个数就是中位数。\n步骤 2. 这组数据有 5 个数，最中间的数是第 3 个数。\n步骤 3. 第 3 个位置的数是 ${selectedSet.median}，所以中位数是 ${selectedSet.median}。`;
        }

        const opts = [correct, wrong1, wrong2, wrong3].sort(() => 0.5 - Math.random());
        const ansIdx = opts.indexOf(correct);

        qObj = {
          id: parseInt(`31100${qIndex}`),
          category: '数据统计平均数中位数',
          question,
          options: opts,
          answer: ansIdx,
          explanation
        };
      }

      default:
        break;
    }

    list.push(qObj);
  }

  return list;
}

// 辅助函数：数组洗牌
function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

// 格式化题目为前端组件期望的结构
function formatQuestion(q, index, prefix = '化学题') {
  const shuffledOptions = shuffleArray(q.options);
  const ansIndex = shuffledOptions.indexOf(q.answer);
  return {
    id: `chem_q_${prefix}_${index}_${Math.random().toString(36).substr(2, 5)}`,
    question: `【${prefix} ${index + 1}】${q.question}`,
    options: shuffledOptions,
    answer: ansIndex !== -1 ? ansIndex : 0,
    explanation: q.explanation || "无解析。"
  };
}

// 动态元素题生成器
function generateDynamicElementQuestions(dayKey, count) {
  const pool = elementPools[dayKey];
  if (!pool) return [];
  const questions = [];
  pool.forEach(el => {
    // 问法 1: 中文 ➔ 符号
    {
      const otherSymbols = pool.filter(x => x.symbol !== el.symbol).map(x => x.symbol);
      const distrac = shuffleArray(otherSymbols).slice(0, 3);
      const options = shuffleArray([el.symbol, ...distrac]);
      questions.push({
        question: `化学元素“${el.name}”的元素符号是：`,
        options: options,
        answer: el.symbol,
        explanation: `元素“${el.name}”的英文/拉丁文缩写符号为 ${el.symbol}，核内质子数为 ${el.z}。`
      });
    }
    // 问法 2: 符号 ➔ 中文
    {
      const otherNames = pool.filter(x => x.name !== el.name).map(x => x.name);
      const distrac = shuffleArray(otherNames).slice(0, 3);
      const options = shuffleArray([el.name, ...distrac]);
      questions.push({
        question: `化学元素符号“${el.symbol}”对应的中文名称是：`,
        options: options,
        answer: el.name,
        explanation: `元素符号 ${el.symbol} 对应的是第 ${el.z} 号元素“${el.name}”。`
      });
    }
    // 问法 3: 质子数 ➔ 中文
    {
      const otherNames = pool.filter(x => x.name !== el.name).map(x => x.name);
      const distrac = shuffleArray(otherNames).slice(0, 3);
      const options = shuffleArray([el.name, ...distrac]);
      questions.push({
        question: `核电荷数（核内质子数）为 ${el.z} 的元素是：`,
        options: options,
        answer: el.name,
        explanation: `元素周期表中，质子数与原子序数相等。第 ${el.z} 号元素是“${el.name}”，符号为 ${el.symbol}。`
      });
    }
  });
  return shuffleArray(questions).slice(0, count);
}

export function generateChemistryQuestions(topicId, count = 20) {
  const blockDays = {
    chem_block1: ['day0', 'day1', 'day2', 'day3', 'day4', 'day5', 'day6', 'day7'],
    chem_block2: ['day8', 'day9', 'day10', 'day11', 'day12', 'day13', 'day14'],
    chem_block3: ['day15', 'day16', 'day17', 'day18', 'day19', 'day20', 'day21'],
    chem_block4: ['day22', 'day23', 'day24', 'day25']
  };

  const topicToDay = {
    chem_topic_prologue: 'day0',
    chem_topic_elements1: 'day1',
    chem_topic_elements2: 'day2',
    chem_topic_elements3: 'day3',
    chem_topic_elements4: 'day4',
    chem_topic_change: 'day5',
    chem_topic_substance: 'day6',
    chem_topic_air: 'day7',
    chem_topic_oxygen: 'day8',
    chem_topic_mno2: 'day9',
    chem_topic_kmno4: 'day10',
    chem_topic_molecule: 'day11',
    chem_topic_atom: 'day12',
    chem_topic_ion: 'day13',
    chem_topic_electrolysis: 'day14',
    chem_topic_filtration: 'day15',
    chem_topic_valency: 'day16',
    chem_topic_conservation: 'day17',
    chem_topic_equation: 'day18',
    chem_topic_co2_lab: 'day19',
    chem_topic_co2_property: 'day20',
    chem_topic_carbon_allotropes: 'day21',
    chem_topic_blast_furnace: 'day22',
    chem_topic_displacement: 'day23',
    chem_topic_solubility: 'day24',
    chem_topic_neutralization: 'day25'
  };

  let allRawQuestions = [];
  const prefix = topicId.startsWith('chem_block') ? '大单元特训' : '课后练习';

  // 1. 判断是按大单元提取还是按单天提取
  if (topicId.startsWith('chem_block')) {
    const days = blockDays[topicId] || [];
    days.forEach(dayKey => {
      if (['day1', 'day2', 'day3', 'day4'].includes(dayKey)) {
        // 动态元素题，生成最大数量以供抽取
        allRawQuestions = allRawQuestions.concat(generateDynamicElementQuestions(dayKey, 30));
      } else {
        // 静态题库
        allRawQuestions = allRawQuestions.concat(staticQuestions[dayKey] || []);
      }
    });

    // 滚动复习兜底：如果本单元总题量不足 count，就从前面学过的其他天数中抽取未重复的题目补充进来
    if (allRawQuestions.length < count) {
      const needed = count - allRawQuestions.length;
      let fallbackPool = [];
      Object.keys(staticQuestions).forEach(dayKey => {
        if (!days.includes(dayKey)) {
          fallbackPool = fallbackPool.concat(staticQuestions[dayKey] || []);
        }
      });
      ['day1', 'day2', 'day3', 'day4'].forEach(dayKey => {
        if (!days.includes(dayKey)) {
          fallbackPool = fallbackPool.concat(generateDynamicElementQuestions(dayKey, 30));
        }
      });
      const shuffledFallback = shuffleArray(fallbackPool);
      allRawQuestions = allRawQuestions.concat(shuffledFallback.slice(0, needed));
    }
  } else {
    const dayKey = topicToDay[topicId];
    if (dayKey) {
      if (['day1', 'day2', 'day3', 'day4'].includes(dayKey)) {
        allRawQuestions = generateDynamicElementQuestions(dayKey, 30);
      } else {
        allRawQuestions = staticQuestions[dayKey] || [];
      }
    }
  }

  // 2. 将原始问题做洗牌，然后截取 count 个，再转换为组件格式
  const shuffledRaw = shuffleArray(allRawQuestions);
  const selectedRaw = shuffledRaw.slice(0, count);

  return selectedRaw.map((q, index) => formatQuestion(q, index, prefix));
}

/* function generateChemistryQuestionsOld(topicId, count = 20) {
            '电解水反应生成的氢气 and 氧气的质量比约为 2:1',
            '水中加入稀硫酸是为了将水中的钙镁离子过滤除去'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n电解水“正氧负氢、氢二氧一”：负极产生氢气 (H₂)，正极产生氧气 (O₂)，两极体积比为 2:1。而它们的质量比则是 1:8。`
        };
        qObj.answer = qObj.options.indexOf('负极产生氢气，正极产生氧气，它们的体积比约为 2:1');
        break;
      }

      // 水的过滤一贴二低三靠 (Day 15)
      case 'chem_topic_water2': {
        qObj = {
          id: 41500 + i,
          question: `【化学题 ${qIdx}】在水的过滤操作中，关于玻璃棒的作用及“三靠”原则，下列说法正确的是：`,
          options: [
            '倒液体时，烧杯口要紧靠玻璃棒引流，玻璃棒下端轻靠三层滤纸处',
            '玻璃棒是用来不断搅拌漏斗内部，加快过滤流速的',
            '漏斗下端管口要悬空放在烧杯中央，防止接触烧杯壁漏气',
            '过滤可以完全除去水中的可溶性盐度，从而得到纯水'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n过滤三靠中：倒入液体的烧杯口要紧靠玻璃棒（引流防止外洒） ； 玻璃棒下端轻靠三层滤纸那一侧 ； 漏斗下端管口紧靠烧杯内壁。千万不可拿玻璃棒在漏斗里搅拌，那会戳破滤纸！`
        };
        qObj.answer = qObj.options.indexOf('倒液体时，烧杯口要紧靠玻璃棒引流，玻璃棒下端轻靠三层滤纸处');
        break;
      }

      // 化合价交叉法书写化学式 (Day 16)
      case 'chem_topic_formula': {
        qObj = {
          id: 41600 + i,
          question: `【化学题 ${qIdx}】已知铝元素(Al)在化合物中通常呈 +3 价，氧元素(O)通常呈 -2 价。利用交叉法写出氧化铝的化学式：`,
          options: ['Al₂O₃', 'Al₃O₂', 'AlO', 'Al₂O'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n交叉法三步走：1. 标价 Al⁺³ O⁻² ； 2. 交叉数字到右下角，铝得 2，氧得 3 ； 3. 约简（2和3不能再约分），最终化学式为 Al₂O₃。符合正负电荷和为 0 的原则：(+3)×2 + (-2)×3 = 0。`
        };
        qObj.answer = qObj.options.indexOf('Al₂O₃');
        break;
      }

      // 质量守恒定律微观计算 (Day 17)
      case 'chem_topic_conservation': {
        qObj = {
          id: 41700 + i,
          question: `【化学题 ${qIdx}】化学反应前后，密闭容器中必定保持守恒且不发生改变的微观量是：`,
          options: [
            '原子的种类、原子的个数、原子的质量',
            '分子的种类、原子的个数、物质的总质量',
            '元素的种类、分子的个数、分子的质量',
            '物质的体积、分子的个数、原子的种类'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n化学反应本质是原子的打散重组，原子积木本身没有丢。所以微观上：原子的【种类】绝对不变、原子的【个数】绝对不变、原子的【质量】绝对不变。分子种类一定会改变（因为生成了新物质）。`
        };
        qObj.answer = qObj.options.indexOf('原子的种类、原子的个数、原子的质量');
        break;
      }

      // 化学反应方程式配平 (Day 18)
      case 'chem_topic_balancing': {
        qObj = {
          id: 41800 + i,
          question: `【化学题 ${qIdx}】配平化学方程式： x P + y O₂ ==(点燃)== z P₂O₅，其化学计量数 x, y, z 分别为：`,
          options: ['4, 5, 2', '2, 5, 2', '4, 3, 2', '1, 5, 2'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n用最小公倍数法配平：左右两边氧原子分别为 2 和 5，最小公倍数是 10。因此 O₂ 系数 y ＝ 10÷2 ＝ 5 ； P₂O₅ 系数 z ＝ 10÷5 ＝ 2。此时右边磷原子数 2×2＝4，故左边 P 的系数 x ＝ 4。即 4, 5, 2。`
        };
        qObj.answer = qObj.options.indexOf('4, 5, 2');
        break;
      }

      // 实验室制取二氧化碳原理装置 (Day 19)
      case 'chem_topic_co2_prep': {
        qObj = {
          id: 41900 + i,
          question: `【化学题 ${qIdx}】在实验室制取二氧化碳时，选用稀盐酸与大理石反应，而不用稀硫酸的原因是：`,
          options: [
            '稀硫酸会与碳酸钙生成微溶的硫酸钙，包裹在大理石表面阻碍反应持续进行',
            '稀硫酸和碳酸钙反应速度太快，气流剧烈无法收集',
            '稀硫酸挥发性强，会导致收集到的二氧化碳气体不纯净',
            '稀硫酸不与大理石发生化学反应'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n稀硫酸(H₂SO₄)与碳酸钙(CaCO₃)反应，会生成微溶于水的硫酸钙(CaSO₄)固体。这层固体会在大理石表面覆盖一层“硬壳”，导致大理石和酸液无法接触，反应会迅速变慢并停止。`
        };
        qObj.answer = qObj.options.indexOf('稀硫酸会与碳酸钙生成微溶的硫酸钙，包裹在大理石表面阻碍反应持续进行');
        break;
      }

      // 二氧化碳性质与检验 (Day 20)
      case 'chem_topic_co2_prop': {
        qObj = {
          id: 42000 + i,
          question: `【化学题 ${qIdx}】将二氧化碳气体通入紫色石蕊试液中，试液变红色 ； 对变红的试液进行加热，颜色又变回紫色。这一过程中发生的两个反应其化学式子是：`,
          options: [
            'CO₂ + H₂O == H₂CO₃  and  H₂CO₃ ==(加热)== H₂O + CO₂↑',
            'CO₂ + Ca(OH)₂ == CaCO₃↓ + H₂O  and  CaCO₃ == CaO + CO₂↑',
            'CO₂ + H₂O == H₂CO₃  and  CO₂ + Ca(OH)₂ == CaCO₃↓ + H₂O',
            'C + O₂ == CO₂  and  CO₂ + C == 2CO'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n二氧化碳溶于水，生成酸性的碳酸使石蕊变红：CO₂ + H₂O == H₂CO₃。但碳酸极不稳定，加热后受热分解，红色的溶液又恢复中性的紫色：H₂CO₃ == H₂O + CO₂↑。`
        };
        qObj.answer = qObj.options.indexOf('CO₂ + H₂O == H₂CO₃  and  H₂CO₃ ==(加热)== H₂O + CO₂↑');
        break;
      }

      // 碳单质金刚石与石墨 (Day 21)
      case 'chem_topic_carbon': {
        qObj = {
          id: 42100 + i,
          question: `【化学题 ${qIdx}】金刚石是天然最硬的晶体，而石墨极软且具有优良导电性。它们物理性质存在巨大差异的根本原因是：`,
          options: [
            '它们的碳原子空间排列方式不同',
            '它们含有的碳原子种类不同',
            '金刚石是由碳原子构成的，而石墨是由碳分子构成的',
            '金刚石的化学性质比石墨更加活泼'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n金刚石和石墨虽然都是由【碳原子 C】组成的单质，但因为它们内部的【碳原子在空间的排列方式不同】（结构不同），所以物理性质千差万别。这就是“结构决定性质”。`
        };
        qObj.answer = qObj.options.indexOf('它们的碳原子空间排列方式不同');
        break;
      }

      // 高炉炼铁原理与尾气点燃安全 (Day 22)
      case 'chem_topic_iron_make': {
        qObj = {
          id: 42200 + i,
          question: `【化学题 ${qIdx}】在工业高炉炼铁反应(Fe₂O₃ + 3CO ==高温== 2Fe + 3CO₂)中，关于一氧化碳(CO)所扮演的角色及尾气处理描述正确的是：`,
          options: [
            'CO 是还原剂，夺取氧化铁中的氧 ； 尾气中的 CO 必须点燃或收集，防止污染及中毒',
            'CO 是氧化剂，给氧化铁提供氧 ； 尾气可以直接排放到大气中',
            'CO 是催化剂，反应前后其质量不变 ； 尾气可以直接排放',
            'CO 被还原生成了铁 ； 尾气需通入水中完全溶解'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\nCO 夺取了氧化铁里的氧，充当还原剂 ； 氧化铁被还原成铁。因为一氧化碳有剧毒，不能直接排放到空气里，必须在尾气口放一盏酒精灯点燃它，使其变成无毒的二氧化碳。`
        };
        qObj.answer = qObj.options.indexOf('CO 是还原剂，夺取氧化铁中的氧 ； 尾气中的 CO 必须点燃或收集，防止污染及中毒');
        break;
      }

      // 金属活动性置换抢亲法则 (Day 23)
      case 'chem_topic_displacement': {
        qObj = {
          id: 42300 + i,
          question: `【化学题 ${qIdx}】将铁钉放入蓝色的硫酸铜(CuSO₄)溶液中，发生置换反应。关于该反应的现象及方程式判定正确的是：`,
          options: [
            '铁钉表面覆盖一层红色固体，溶液由蓝色逐渐变浅绿色 (Fe + CuSO₄ == FeSO₄ + Cu)',
            '铁钉表面覆盖一层黑色固体，溶液由蓝色变成黄色 (Fe + CuSO₄ == Fe(SO₄)₃ + Cu)',
            '无任何明显实验现象产生',
            '铁钉溶解并放出大量氢气气泡 (Fe + CuSO₄ == FeSO₄ + H₂↑)'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n铁 Fe 排在铜 Cu 之前，活动性更强，可以发生置换。铁强行抢走硫酸根舞伴，把红色的铜单质踢出来覆盖在铁钉表面。生成的 FeSO₄ 是 +2 价的亚铁溶液，显浅绿色。`
        };
        qObj.answer = qObj.options.indexOf('铁钉表面覆盖一层红色固体，溶液由蓝色逐渐变浅绿色 (Fe + CuSO₄ == FeSO₄ + Cu)');
        break;
      }

      // 溶解度与溶解曲线 (Day 24)
      case 'chem_topic_solubility': {
        qObj = {
          id: 42400 + i,
          question: `【化学题 ${qIdx}】若硝酸钾(KNO₃)的溶解度随温度升高急剧增大（曲线陡峭），而食盐(NaCl)的溶解度随温度变化极小（曲线平缓）。要从含有少量食盐的硝酸钾饱和溶液中提纯出纯净的硝酸钾晶体，应采用的方法是：`,
          options: [
            '降温结晶法 (或冷却热饱和溶液法)',
            '蒸发结晶法 (加热把水烧干)',
            '过滤法直接除杂',
            '加入稀盐酸中和溶解'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n对于溶解度随温度变化极大的陡峭型物质（如硝酸钾），最适合用【降温结晶法】提纯（温度一低它就快速结晶析出） ； 对于溶解度变化不明显的平缓型物质（如食盐），最适合用【蒸发结晶法】把水烧干提取。`
        };
        qObj.answer = qObj.options.indexOf('降温结晶法 (或冷却热饱和溶液法)');
        break;
      }

      // 酸碱盐中和与除铁锈过度腐蚀链 (Day 25)
      default: {
        qObj = {
          id: 42500 + i,
          question: `【化学题 ${qIdx}】将生锈的铁钉（铁锈主要成分是 Fe₂O₃）放入过量的稀盐酸中，直至铁钉完全溶解。有关该过程的反应链及现象，描述正确的是：`,
          options: [
            '先是红褐色铁锈溶解溶液变黄 (Fe₂O₃ + 6HCl == 2FeCl₃ + 3H₂O)，锈除完后铁钉表面产生大量气泡溶液逐渐变浅绿 (Fe + 2HCl == FeCl₂ + H₂↑)',
            '铁锈溶解后立即发生置换反应生成 +3 价的氯化铁并释放氢气',
            '没有气体生成，整个过程溶液一直保持无色透明',
            '稀盐酸无法与铁单质发生反应，气泡是铁锈溶解放出的二氧化碳'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n稀盐酸会先和外面的铁锈(氧化铁)反应生成黄色的 FeCl₃：Fe₂O₃ + 6HCl == 2FeCl₃ + 3H₂O。铁锈除完后，盐酸会与里面的铁单质反应生成绿色的 FeCl₂ 并释放氢气气泡：Fe + 2HCl == FeCl₂ + H₂↑。`
        };
        qObj.answer = qObj.options.indexOf('先是红褐色铁锈溶解溶液变黄 (Fe₂O₃ + 6HCl == 2FeCl₃ + 3H₂O)，锈除完后铁钉表面产生大量气泡溶液逐渐变浅绿 (Fe + 2HCl == FeCl₂ + H₂↑)');
        break;
      }
    }
    list.push(qObj);
  }
  return list;
} */

/**
 * 经典中考英语语法题库（去重使用，并进行滚动温故知新）
 */
const englishChoiceQuestions = [
  {
    id: 50200,
    dayNum: 1,
    question: "My mother bought a storybook for my sister and _______. She likes reading very much.",
    options: ['her', 'she', 'him', 'he'],
    answerText: 'her',
    explanation: "名师考点解析：\n空格位于介词 for 的后面。根据人称代词“座位表”口诀：【动介后面用宾格，动词前面用主格】。此处是介词后，必须选宾格。由于是给妹妹(my sister)，对应女性代词宾格 her。\n答案选 her。",
    knowledgePoint: '代词主宾格变化'
  },
  {
    id: 50300,
    dayNum: 2,
    question: "We are looking forward to _______ the Great Wall during the summer holiday.",
    options: ['visiting', 'visit', 'to visit', 'visited'],
    answerText: 'visiting',
    explanation: "名师考点解析：\nlook forward to (期待) 中的 to 是介词，后面接动词必须变成动名词(doing)形式。这是中考常考易错地雷！\n答案选 visiting。",
    knowledgePoint: 'look 家族介词搭配'
  },
  {
    id: 50400,
    dayNum: 3,
    question: "How much did you _______ for the new English dictionary?",
    options: ['pay', 'spend', 'cost', 'take'],
    answerText: 'pay',
    explanation: "名师考点解析：\n空格后面搭配了介词 for (pay ... for ...)。主语是 you (人)。根据花费动词“主语心法”：人做主语且介词用 for 的只有 pay！\n答案选 pay。",
    knowledgePoint: '花费动词辨析'
  },
  {
    id: 51100,
    dayNum: 4,
    question: "You should give up _______ for your health. It is bad for you.",
    options: ['smoking', 'smoke', 'to smoke', 'smoked'],
    answerText: 'smoking',
    explanation: "名师考点解析：\ngive up 意为“放弃”，是动词短语。根据“中考避坑口诀”：在 give up 后面跟动词必须用动名词(doing)形式！\n答案选 smoking。",
    knowledgePoint: 'give 家族短语搭配'
  },
  {
    id: 51500,
    dayNum: 5,
    question: "Could you tell me _______ tomorrow?",
    options: ['when we will leave', 'when will we leave', 'when we left', 'when did we leave'],
    answerText: 'when we will leave',
    explanation: "名师考点解析：\n宾语从句必须使用陈述句语序（主语在前，动词在后）。B和D都是疑问语序，排除；再根据时间词 tomorrow，应该用将来时。因此选 when we will leave。\n答案选 when we will leave。",
    knowledgePoint: '宾语从句语序与时态'
  },
  {
    id: 50500,
    dayNum: 7,
    question: "Although he was very tired, _______ he still finished writing his homework.",
    options: ['/', 'but', 'so', 'however'],
    answerText: '/',
    explanation: "名师考点解析：\n句首已经有连词 although (虽然)。在英语里， although 和 but 是“不共戴天”的互斥连词，绝对不能同句共存！所以后半句开端不填任何词。\n答案选 /。",
    knowledgePoint: '连词互斥法则'
  },
  {
    id: 50600,
    dayNum: 8,
    question: "My father always _______ to work by subway every morning.",
    options: ['goes', 'go', 'going', 'went'],
    answerText: 'goes',
    explanation: "名师考点解析：\n有 always (总是) 和 every morning (每天早晨) 表示平常的习惯，用一般现在时。主语 My father 是单数第三人称(单三)，动词 go 必须变成 goes。",
    knowledgePoint: '一般现在时单三变化'
  },
  {
    id: 50700,
    dayNum: 12,
    question: "- Have you finished reading the book _______?\n- Yes, I have _______ finished it.",
    options: ['yet; already', 'already; yet', 'yet; yet', 'already; already'],
    answerText: 'yet; already',
    explanation: "名师考点解析：\n第一空是疑问句句尾，询问“已经...了吗”，用 yet ；第二空是肯定句中 haven/has 和 done 中间，用 already。\n答案选 yet; already。",
    knowledgePoint: '完成时标志词区分'
  },
  {
    id: 50800,
    dayNum: 14,
    question: "- Must I write down the notes now?\n- No, you _______. You can do it after school.",
    options: ['needn\'t', 'mustn\'t', 'can\'t', 'shouldn\'t'],
    answerText: 'needn\'t',
    explanation: "名师考点解析：\n以 Must I... (我必须...)开头的疑问句，否定回答表示“不必、不需要”，固定答语用 needn\'t 或者是 don\'t have to。 mustn\'t 表示“绝对禁止”，不符合常理。\n答案选 needn\'t。",
    knowledgePoint: '情态动词回答禁忌'
  },
  {
    id: 51200,
    dayNum: 15,
    question: "The teacher told us that the earth _______ around the sun.",
    options: ['goes', 'go', 'went', 'is going'],
    answerText: 'goes',
    explanation: "名师考点解析：\n虽然主句谓语 told 是过去式，但从句“地球绕着太阳转”是客观真理。根据“客观真理永远用一般现在时”的硬性规定，必须选单三形式 goes。\n答案选 goes。",
    knowledgePoint: '宾语从句时态例外'
  },
  {
    id: 50900,
    dayNum: 18,
    question: "We will go to the Shenzhen Bay Park if it _______ sunny tomorrow.",
    options: ['is', 'will be', 'are', 'was'],
    answerText: 'is',
    explanation: "名师考点解析：\n这是一个 if 引导的条件状语从句，主句是 will go (一般将来时)。根据“主将从现”原则， if 从句必须用一般现在时。主语是 it， be 动词用 is。\n答案选 is。",
    knowledgePoint: '主将从现时态原则'
  },
  {
    id: 51300,
    dayNum: 20,
    question: "This is the most interesting movie _______ I have ever seen.",
    options: ['that', 'which', 'who', 'whose'],
    answerText: 'that',
    explanation: "名师考点解析：\n当先行词被形容词最高级(the most interesting)修饰时，关系代词只能用 that，不能用 which！这是定语从句的“独占原则”。\n答案选 that。",
    knowledgePoint: '定语从句关系代词'
  },
  {
    id: 51400,
    dayNum: 25,
    question: "Active students _______ to answer questions in class by their teachers.",
    options: ['are encouraged', 'encourage', 'were encouraging', 'encouraged'],
    answerText: 'are encouraged',
    explanation: "名师考点解析：\n主语 students (学生) 与动词 encourage (鼓励) 之间是被动关系，需要使用被动语态 (be + done)。根据一般现在时的被动语态，用 are encouraged。\n答案选 are encouraged。",
    knowledgePoint: '被动语态判断'
  },
  {
    id: 51000,
    dayNum: 0,
    question: "I _______ my homework when my father came back yesterday.",
    options: ['was doing', 'did', 'am doing', 'will do'],
    answerText: 'was doing',
    explanation: "名师考点解析：\n时间状语为 when my father came back yesterday (昨晚爸爸回家的瞬间)，表示过去某一特定时刻正在发生的动作，使用过去进行时 (was/were + doing)。主语为 I，用 was doing。",
    knowledgePoint: '过去进行时语境'
  }
];

/**
 * 4. 中考英语题库生成器
 */
export function generateEnglishQuestions(topicId, count = 10) {
  const list = [];
  const dayNum = parseInt(topicId.replace('eng_topic_day', ''), 10) || 1;
  const startIdx = (dayNum - 1) * 40;
  const endIdx = dayNum * 40;
  
  // 1. 提取当前 Day 切片下的 40 个基础词
  const dayWords = englishVocabList.slice(startIdx, endIdx);
  const currentVocabBase = dayWords.length > 0 ? dayWords : englishVocabList.slice(0, 40);

  // 2. 从本地缓存读取已熟记（斩掉）的词与标为生词（不熟）的词
  let masteredWords = [];
  let unfamiliarWords = [];
  try {
    const masteredStr = localStorage.getItem('english-mastered-words');
    if (masteredStr) masteredWords = JSON.parse(masteredStr);
    const unfamiliarStr = localStorage.getItem('english-unfamiliar-words');
    if (unfamiliarStr) unfamiliarWords = JSON.parse(unfamiliarStr);
  } catch (e) {
    // 降级保护
  }

  // 3. 过滤掉已经掌握斩词的集合
  let filteredWords = currentVocabBase.filter(w => !masteredWords.includes(w.word));

  // 4. 提取今日所属的生词
  let todayUnfamiliar = currentVocabBase.filter(w => unfamiliarWords.includes(w.word));

  // 5. 组合候选池，将今日生词提到最前面，进行高强度针对性训练
  let candidateWords = [...todayUnfamiliar, ...filteredWords];

  // 6. 兜底保护：如果候选池空了（说明本章单词全部被斩掉），使用本章原始词兜底
  if (candidateWords.length === 0) {
    candidateWords = currentVocabBase;
  }

  // 7. 候选池扩展保护：如果候选池中不重复的单词少于 4 个，需要从 currentVocabBase 中挑选未包含的单词补齐至 4 个，以防止连线配对题内部出现重复词
  if (candidateWords.length < 4) {
    const needed = 4 - candidateWords.length;
    const additional = currentVocabBase.filter(w => !candidateWords.some(cw => cw.word === w.word));
    candidateWords = [...candidateWords, ...additional.slice(0, needed)];
  }

  // 按照 75% 比例动态计算连线题数量
  const matchCount = Math.floor(count * 0.75);

  // 8. 单词匹配连线题“无放回轮询抽样池”准备
  let matchCandidatePool = [...candidateWords];
  matchCandidatePool = shuffleArray(matchCandidatePool);
  let poolIndex = 0;

  // 9. 语法选择题去重池准备
  const currentDayChoiceQ = englishChoiceQuestions.find(q => q.dayNum === dayNum);
  const otherDayChoiceQs = englishChoiceQuestions.filter(q => q.dayNum !== dayNum);
  const shuffledOthers = shuffleArray([...otherDayChoiceQs]);
  
  const testChoiceQuestions = [];
  if (currentDayChoiceQ) {
    testChoiceQuestions.push(currentDayChoiceQ);
  }
  testChoiceQuestions.push(...shuffledOthers);

  for (let i = 0; i < count; i++) {
    let qObj = {};
    const qIdx = i + 1;

    if (i < matchCount) {
      // 匹配连线题 (Match Type)
      const matchWords = [];
      for (let j = 0; j < 4; j++) {
        if (poolIndex >= matchCandidatePool.length) {
          // 当前轮词已抽光，重新打乱备选池并重置游标
          matchCandidatePool = shuffleArray([...candidateWords]);
          poolIndex = 0;
        }
        matchWords.push(matchCandidatePool[poolIndex]);
        poolIndex++;
      }

      const leftOptions = matchWords.map(w => ({ id: w.word, text: w.word })).sort(() => 0.5 - Math.random());
      const rightOptions = matchWords.map(w => ({ id: w.word, text: w.translation })).sort(() => 0.5 - Math.random());

      const correctPairs = {};
      matchWords.forEach(w => {
        correctPairs[w.word] = w.translation;
      });

      let expText = "💡中考名师词义连线配对解析：\n";
      matchWords.forEach(w => {
        expText += `• **${w.word}** (${w.phonetic}) ➔ 【${w.translation}】\n   *记词诀敲：${w.tip}*\n`;
      });

      qObj = {
        id: 50000 + i,
        type: 'match',
        question: `【英语词汇连线题 ${qIdx}】请将以下 4 组中英文单词两两正确配对：`,
        leftOptions,
        rightOptions,
        correctPairs,
        explanation: expText,
        word: matchWords[0].word,
        translation: matchWords[0].translation,
        knowledgePoint: '词汇词义连线配对'
      };
    } else {
      // 语法选择题 (Choice Type)
      const choiceQIdx = i - matchCount;
      const rawChoiceQ = testChoiceQuestions[choiceQIdx % testChoiceQuestions.length];
      
      const shuffledOptions = shuffleArray([...rawChoiceQ.options]);
      const correctIndex = shuffledOptions.indexOf(rawChoiceQ.answerText);
      
      qObj = {
        id: rawChoiceQ.id + i,
        type: 'choice',
        question: `【语法选择题 ${qIdx}】${rawChoiceQ.question}`,
        options: shuffledOptions,
        answer: correctIndex !== -1 ? correctIndex : 0,
        explanation: rawChoiceQ.explanation,
        knowledgePoint: rawChoiceQ.knowledgePoint
      };
    }
    list.push(qObj);
  }
  return list;
}

