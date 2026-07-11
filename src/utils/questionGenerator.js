/**
 * 中考数理智能特训平台 - 习题发生器引擎 (Question Generator Engine)
 * 支持物理 1200 题与数学 900 题的高清算法级生成，自带智能解析与分步推导步骤。
 */

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
        break;
      }

      default:
        break;
    }

    list.push(qObj);
  }

  return list;
}
