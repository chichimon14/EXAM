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
      }

      default:
        break;
    }

    list.push(qObj);
  }

  return list;
}

// 导入英语和化学的数据以支持出题
import { chemistryDays } from '../data/chemistryData';
import { englishVocabList } from '../data/englishData';

/**
 * 3. 中考化学题库生成器
 */
export function generateChemistryQuestions(topicId, count = 20) {
  const list = [];
  const elementData1 = [
    { name: '氢', symbol: 'H', pinyin: 'qīng', z: 1, val: '+1' },
    { name: '氦', symbol: 'He', pinyin: 'hài', z: 2, val: '0' },
    { name: '锂', symbol: 'Li', pinyin: 'lǐ', z: 3, val: '+1' },
    { name: '铍', symbol: 'Be', pinyin: 'pí', z: 4, val: '+2' }
  ];
  const elementData2 = [
    { name: '硼', symbol: 'B', pinyin: 'péng', z: 5, val: '+3' },
    { name: '碳', symbol: 'C', pinyin: 'tàn', z: 6, val: '+4, -4' },
    { name: '氮', symbol: 'N', pinyin: 'dàn', z: 7, val: '-3, +5' },
    { name: '氧', symbol: 'O', pinyin: 'yǎng', z: 8, val: '-2' },
    { name: '氟', symbol: 'F', pinyin: 'fú', z: 9, val: '-1' },
    { name: '氖', symbol: 'Ne', pinyin: 'nǎi', z: 10, val: '0' }
  ];
  const elementData3 = [
    { name: '钠', symbol: 'Na', pinyin: 'nà', z: 11, val: '+1' },
    { name: '镁', symbol: 'Mg', pinyin: 'měi', z: 12, val: '+2' },
    { name: '铝', symbol: 'Al', pinyin: 'lǚ', z: 13, val: '+3' },
    { name: '硅', symbol: 'Si', pinyin: 'guī', z: 14, val: '+4' },
    { name: '磷', symbol: 'P', pinyin: 'lín', z: 15, val: '-3, +5' },
    { name: '硫', symbol: 'S', pinyin: 'liú', z: 16, val: '-2, +4, +6' },
    { name: '氯', symbol: 'Cl', pinyin: 'lǜ', z: 17, val: '-1' },
    { name: '氩', symbol: 'Ar', pinyin: 'yà', z: 18, val: '0' }
  ];
  const elementData4 = [
    { name: '钾', symbol: 'K', pinyin: 'jiǎ', z: 19, val: '+1' },
    { name: '钙', symbol: 'Ca', pinyin: 'gài', z: 20, val: '+2' }
  ];
  const elementData5 = [
    { name: '铁', symbol: 'Fe', pinyin: 'tiě', z: 26, val: '+2, +3' },
    { name: '铜', symbol: 'Cu', pinyin: 'tóng', z: 29, val: '+2' },
    { name: '锌', symbol: 'Zn', pinyin: 'xīn', z: 30, val: '+2' },
    { name: '锰', symbol: 'Mn', pinyin: 'měng', z: 25, val: '+2, +4, +7' },
    { name: '钡', symbol: 'Ba', pinyin: 'bèi', z: 56, val: '+2' }
  ];
  const elementData6 = [
    { name: '金', symbol: 'Au', pinyin: 'jīn', z: 79, val: '+1, +3' },
    { name: '钛', symbol: 'Ti', pinyin: 'tài', z: 22, val: '+4' },
    { name: '碘', symbol: 'I', pinyin: 'diǎn', z: 53, val: '-1' },
    { name: '锡', symbol: 'Sn', pinyin: 'xī', z: 50, val: '+2, +4' },
    { name: '汞', symbol: 'Hg', pinyin: 'gǒng', z: 80, val: '+1, +2' }
  ];

  for (let i = 0; i < count; i++) {
    let qObj = {};
    const qIdx = i + 1;

     switch (topicId) {
      // 化学先导课：通关与信心指南 (Day 0)
      case 'chem_topic_prologue': {
        const prologuePool = [
          {
            question: "化学（Chemistry）在中文里的字面意思是什么？",
            options: ["变化的科学", "发光的科学", "受力的科学", "数学的延伸科学"],
            answer: "变化的科学",
            explanation: "化学（Chemistry）在中文里就是“变化的科学”，专门研究物质是怎么变成新物质的魔法科学！"
          },
          {
            question: "初三化学计算题很多很复杂吗？学习它需要很强的代数或几何数学基础吗？",
            options: ["不需要！主要是最基础的加减乘除和比例计算", "需要，必须精通初二的函数与几何证明", "需要，要用到微积分和代数拓扑", "需要很强的受力分析和力学计算基础"],
            answer: "不需要！主要是最基础的加减乘除 and 比例计算",
            explanation: "初三化学几乎没有任何复杂的代数或几何，计算只涉及最简单的“比例式”乘除法。只要会算最基本的乘除法，化学计算分就能拿满分！"
          },
          {
            question: "物理变化和化学变化的根本区别是什么？",
            options: ["变化时是否有“新物质（新积木）”生成", "变化时是否发光发热", "变化后状态是否发生改变", "变化是否极其剧烈"],
            answer: "变化时是否有“新物质（新积木）”生成",
            explanation: "物理变化和化学变化的根本区别就是：分子（原子积木）是否拆开重组、是否有新物质诞生。冰融化成水依然是水分子（物理变化）；木柴烧成灰烬生成了二氧化碳（化学变化）。"
          },
          {
            question: "下列变化属于“化学变化”的是：",
            options: ["铁钉在潮湿空气中生锈", "把一张白纸撕得粉碎", "冰块在太阳下融化成水", "湿衣服在阳光下被晒干"],
            answer: "铁钉在潮湿空气中生锈",
            explanation: "铁钉生锈生成了新物质“铁锈”（主要成分是氧化铁），属于化学变化。撕碎纸、冰融化、衣服晒干均没有新物质生成，是物理变化。"
          },
          {
            question: "下列变化中，属于“物理变化”的是：",
            options: ["矿石被粉碎", "木柴燃烧变成灰烬", "食物在夏天变质发霉", "蜡烛燃烧发光发热"],
            answer: "矿石被粉碎",
            explanation: "矿石粉碎只是形状变了，物质本身没有改变，属于物理变化。燃烧、变质发霉都生成了新物质，是化学变化。"
          },
          {
            question: "化学老师说：初三化学更像是一门“半文半理”的学科。为了稳拿90分，我们首先要做的是：",
            options: ["跟着老师进度，背熟前20个元素符号等基础魔法积木", "刷完高中三年的高难度化学奥赛题", "苦苦钻研微积分和牛顿经典力学", "什么都不用记，只在考前一天死记硬背"],
            answer: "跟着老师进度，背熟前20个元素符号等基础魔法积木",
            explanation: "初三化学被称为“理科中的英语”，入门最关键的就是背熟基础元素符号（积木的名字），建立自信，90分保底非常轻松！"
          },
          {
            question: "水是由什么积木（原子）拼接出来的？",
            options: ["两个氢气积木和一个氧气积木", "两个铁积木和一个碳积木", "一个金积木和一个汞积木", "纯粹的水原子拼接的，没有其他成分"],
            answer: "两个氢气积木和一个氧气积木",
            explanation: "水分子（H₂O）是由两个氢原子（H）和一个氧原子（O）拼接出来的微观魔法结构！"
          },
          {
            question: "空气中占比最大（约78%）、能作为食品保鲜防腐保护气的是什么积木气体？",
            options: ["氮气 (N₂)", "氧气 (O₂)", "二氧化碳 (CO₂)", "稀有气体 (氖气)"],
            answer: "氮气 (N₂)",
            explanation: "空气中含量最多的是氮气，占总体积的78%，它化学性质很稳定，常用来作保护气、食品防腐剂。"
          },
          {
            question: "化学家通过把“原子积木”按照核内质子数大小排队，排出来的表格叫做什么？",
            options: ["元素周期表", "乘法口诀表", "物理常数表", "几何定理汇总表"],
            answer: "元素周期表",
            explanation: "排出来的表格叫做元素周期表，这是我们化学王国的核心地图！"
          },
          {
            question: "关于初三化学的学习，下面哪种心态是正确的？",
            options: ["大家都是在初三零基础起跑，只要跟着老师一步步学，稳拿90保底80！", "化学需要特别天才的数学脑子，我肯定学不会", "物理学得不好，化学也绝对学不好", "化学是女生学的，男生学不会，或者相反"],
            answer: "大家都是在初三零基础起跑，只要跟着老师一步步学，稳拿90保底80！",
            explanation: "化学是初三新增的学科，所有同学都是从零起跑！只要你有信心，掌握正确方法，优秀率几乎是手到牵来！"
          },
          {
            question: "人类发现并利用火的意义在于：",
            options: ["这是人类第一次支配了自然的化学变化，摆脱了茹毛饮血的时代", "只是觉得火很好看，能发光好玩", "火能把冰融化成水（物理变化）", "发现火只是一种物理上的摆设"],
            answer: "这是人类第一次支配了自然的化学变化，摆脱了茹毛饮血的时代",
            explanation: "人类对火的支配和使用，是人类利用化学变化的开端，它改善了人类的生存条件，是文明进步的重大里程碑！"
          },
          {
            question: "水结冰了，请问这个变化产生了新物质吗？它是化学变化还是物理变化？",
            options: ["没有产生新物质，属于物理变化", "产生了新物质“冰分子”，属于化学变化", "产生了新物质“二氧化碳”，属于化学变化", "既不是物理变化，也不是化学变化"],
            answer: "没有产生新物质，属于物理变化",
            explanation: "冰和水是同一种物质（都是水分子组成，H₂O），只是物理状态不同，因此没有新物质生成，是物理变化。"
          },
          {
            question: "下列过程涉及化学变化的是：",
            options: ["酿造小米酒", "把西瓜切成块", "食盐溶解在水里", "把黏土捏成泥人"],
            answer: "酿造小米酒",
            explanation: "酿酒过程是将粮食中的淀粉通过微生物转化为酒精（乙醇），产生了新物质，是典型的化学变化。切西瓜、盐溶解、捏泥人都是物理变化。"
          },
          {
            question: "铁在空气中生锈，变成红褐色的铁锈。关于这个变化，下列说法正确的是：",
            options: ["生锈产生了新物质，属于化学变化", "铁和铁锈是同一种物质", "铁钉生锈不需要氧气和水", "这只是铁钉形状变了，属于物理变化"],
            answer: "生锈产生了新物质，属于化学变化",
            explanation: "铁和铁锈是截然不同的物质（铁锈是水合氧化铁），有了新物质诞生，是化学变化。"
          },
          {
            question: "古代中国在化学工艺方面非常先进，以下哪项不属于中国古代四大发明中的化学工艺？",
            options: ["指南针的制造", "火药的发明", "造纸术的改进", "陶瓷的烧制（虽非四大发明，也是古代杰出化学工艺）"],
            answer: "指南针的制造",
            explanation: "指南针利用的是天然磁石的物理磁性，属于物理学应用。火药（硝石、硫磺、木炭混合燃烧）和造纸术都是复杂的化学工艺。"
          },
          {
            question: "我们每天呼吸必不可少、能支持燃烧的气体积木是什么？",
            options: ["氧气 (O₂)", "氮气 (N₂)", "二氧化碳 (CO₂)", "水蒸气 (H₂O)"],
            answer: "氧气 (O₂)",
            explanation: "氧气可以供给呼吸，并且具有助燃性，是我们生命和燃烧不可或缺的积木！"
          },
          {
            question: "下列哪一项是学习化学的“大招口诀”之一？",
            options: ["前四天把前20个元素符号通过消消乐和背诵彻底背熟！", "每天做300道复杂的二次函数大题", "记住公式，不需要理解其含义", "把整本化学书倒背如流但不做实验题"],
            answer: "前四天把前20个元素符号通过消消乐和背诵彻底背熟！",
            explanation: "熟练背出前20个元素符号，是初三化学的“敲门砖”。前四天通关消消乐，以后写化学式信手拈来！"
          },
          {
            question: "在微观世界中，原子积木最核心的部分叫做什么？",
            options: ["原子核", "外壳", "轨道", "气泡"],
            answer: "原子核",
            explanation: "原子的中心部分叫原子核，里面有质子和中子，是原子积木的“心脏”！"
          },
          {
            question: "下列行为中，最能帮助我们学好初三化学的是：",
            options: ["上课认真听，理解例题和名师避坑点，按时完成每日小测和消消乐", "只刷难题，不管基础概念", "遇到背诵就跳过，指望考试时查书", "坚信自己没有天赋，直接放弃"],
            answer: "上课认真听，理解例题和名师避坑点，按时完成每日小测和消消乐",
            explanation: "脚踏实地跟紧抢跑大纲，每天1-1.5小时，理解避坑点，配合好玩的消消乐，90分保底就是这么简单！"
          },
          {
            question: "化学的“魔力”在于能将平凡的物质变成神奇的材料。以下哪项是化学科学的贡献？",
            options: ["开发新药治愈疾病、制造塑料与化肥、研发芯片材料等", "改变地心引力大小", "让太阳从西边升起", "创造出绝对永动机"],
            answer: "开发新药治愈疾病、制造塑料与化肥、研发芯片材料等",
            explanation: "医药、化肥、新材料等都依赖化学合成，化学是造福人类的中心科学！"
          }
        ];
        
        const qData = prologuePool[i % prologuePool.length];
        qObj = {
          id: 39000 + i,
          question: `【先导课趣味小测 ${qIdx}】${qData.question}`,
          options: qData.options.slice().sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话避坑指南：\n${qData.explanation}`
        };
        qObj.answer = qObj.options.indexOf(qData.answer);
        break;
      }

      // 1-4号元素 (Day 1)
      case 'chem_topic_elements1': {
        const item = elementData1[randomInt(0, 3)];
        const askSymbol = randomInt(0, 1) === 1;
        if (askSymbol) {
          qObj = {
            id: 40000 + i,
            question: `【化学题 ${qIdx}】前20号元素中，名称为“${item.name}”的元素符号是什么？其汉语拼音是：`,
            options: [item.symbol, item.symbol.toUpperCase(), item.symbol.toLowerCase(), 'Hn'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n根据“青海里皮 (qīng hǎi lǐ pí)”口诀，第${item.z}个是${item.name}，其拼音是【${item.pinyin}】。化学元素符号的书写原则是“一大二小”，所以其符号是 ${item.symbol}。`
          };
          qObj.answer = qObj.options.indexOf(item.symbol);
        } else {
          qObj = {
            id: 40100 + i,
            question: `【化学题 ${qIdx}】元素周期表中排在第 ${item.z} 位的元素名称及汉语拼音正确的是：`,
            options: [`${item.name} (${item.pinyin})`, '氦 (hài)', '锂 (lǐ)', '氢 (qīng)'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n元素周期表中，排在第 ${item.z} 位的积木是“${item.name}”，拼音读作【${item.pinyin}】。`
          };
          qObj.answer = qObj.options.indexOf(`${item.name} (${item.pinyin})`);
        }
        break;
      }
      
      // 5-10号元素 (Day 2)
      case 'chem_topic_elements2': {
        const item = elementData2[randomInt(0, 5)];
        const askSymbol = randomInt(0, 1) === 1;
        if (askSymbol) {
          qObj = {
            id: 40200 + i,
            question: `【化学题 ${qIdx}】前20号元素中，“${item.name}”的元素符号及拼音正确的是：`,
            options: [`${item.symbol} (${item.pinyin})`, `C (${item.pinyin})`, `O (${item.pinyin})`, `N (${item.pinyin})`].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n“蓬碳蛋养拂奶”口诀中，${item.name}的拼音为【${item.pinyin}】，元素符号为 ${item.symbol}。`
          };
          qObj.answer = qObj.options.indexOf(`${item.symbol} (${item.pinyin})`);
        } else {
          qObj = {
            id: 40300 + i,
            question: `【化学题 ${qIdx}】质子数为 ${item.z} 的元素拼音及名称正确的是：`,
            options: [`${item.name} (${item.pinyin})`, '氟 (fú)', '碳 (tàn)', '氧 (yǎng)'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n质子数等于原子序号。质子数为 ${item.z} 的元素是【${item.name}】，拼音是【${item.pinyin}】。`
          };
          qObj.answer = qObj.options.indexOf(`${item.name} (${item.pinyin})`);
        }
        break;
      }

      // 新增 5 个金属/非金属 (金 钛 碘 锡 汞) (Day 4)
      case 'chem_topic_elements4': {
        const item = elementData6[randomInt(0, elementData6.length - 1)];
        const askSymbol = randomInt(0, 1) === 1;
        if (askSymbol) {
          qObj = {
            id: 40500 + i,
            question: `【化学题 ${qIdx}】关于中考必记元素“${item.name}”，其正确的化学元素符号是：`,
            options: [item.symbol, 'Ag', 'Pt', 'Pb'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n根据口诀“金钛碘锡汞 (Au Ti I Sn Hg)”，【${item.name}】的符号是 ${item.symbol}，拼音是【${item.pinyin}】。`
          };
          qObj.answer = qObj.options.indexOf(item.symbol);
        } else {
          qObj = {
            id: 40550 + i,
            question: `【化学题 ${qIdx}】关于化学符号“${item.symbol}”，其对应的中文名称及汉语拼音正确的是：`,
            options: [`${item.name} (${item.pinyin})`, '银 (yín)', '铂 (bó)', '铅 (qiān)'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n化学符号【${item.symbol}】对应的元素名称是“${item.name}”，拼音读作【${item.pinyin}】。`
          };
          qObj.answer = qObj.options.indexOf(`${item.name} (${item.pinyin})`);
        }
        break;
      }

      // 11-20号及重金属常用元素 (Day 3 & Day 4 挑战测)
      case 'chem_topic_elements3':
      case 'chem_topic_matching': {
        const allElements = [...elementData3, ...elementData4, ...elementData5];
        const item = allElements[randomInt(0, allElements.length - 1)];
        qObj = {
          id: 40400 + i,
          question: `【化学题 ${qIdx}】关于中考必考元素“${item.name}”，其对应的符号及汉语拼音正确的是：`,
          options: [`${item.symbol} (${item.pinyin})`, `Fe (${item.pinyin})`, `Cu (${item.pinyin})`, `Na (${item.pinyin})`].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n中考常用元素中，【${item.name}】的拼音读法是【${item.pinyin}】，其国际化学元素符号为 ${item.symbol}。`
        };
        qObj.answer = qObj.options.indexOf(`${item.symbol} (${item.pinyin})`);
        break;
      }

      // 物理变化 vs 化学变化 (Day 5)
      case 'chem_topic_change': {
        const physicals = ['冰雪融化成水', '瓷碗摔得粉碎', '汽油从瓶中挥发', '电灯泡通电发光放热', '西瓜榨成果汁'];
        const chemicals = ['钢铁在潮湿空气中生锈', '红磷燃烧产生白烟', '食物在夏天变质发霉', '动植物呼吸消耗氧气', '木柴在火炉中燃烧'];
        
        const isAskChemical = randomInt(0, 1) === 1;
        if (isAskChemical) {
          const correct = chemicals[randomInt(0, chemicals.length - 1)];
          const w1 = physicals[0];
          const w2 = physicals[1];
          const w3 = physicals[2];
          
          qObj = {
            id: 40500 + i,
            question: `【化学题 ${qIdx}】下列日常生活中发生的各种变化中，属于【化学变化】的是：`,
            options: [correct, w1, w2, w3].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n判断化学变化还是物理变化，关键看【有没有新分子（新物质）生成】。“${correct}”中原子重新交换舞伴组装成了全新分子，所以是化学变化。其他选项分子成分根本没变，只是形态、距离改变，属于物理变化。`
          };
          qObj.answer = qObj.options.indexOf(correct);
        } else {
          const correct = physicals[randomInt(0, physicals.length - 1)];
          const w1 = chemicals[0];
          const w2 = chemicals[1];
          const w3 = chemicals[2];
          
          qObj = {
            id: 40550 + i,
            question: `【化学题 ${qIdx}】下列日常生活中发生的各种变化中，属于【物理变化】的是：`,
            options: [correct, w1, w2, w3].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n“${correct}”只是物质的状态、位置发生物理性位移，内部的水分子或物质分子并没有打碎重组，【没有新物质生成】，属于物理变化。而其他选项都产生了全新的物质，属于化学变化。`
          };
          qObj.answer = qObj.options.indexOf(correct);
        }
        break;
      }

      // 混合物 vs 纯净物 与 单质 vs 化合物 (Day 6)
      case 'chem_topic_class': {
        const questions = [
          { q: '下列物质属于【纯净物】的是：', a: '冰水混合物', opts: ['冰水混合物', '洁净的空气', '天然矿泉水', '澄清石灰水'], exp: '冰和水是同一种物质的两个化身，微观全都是水分子(H₂O)，所以是纯净物。空气、矿泉水、石灰水里均装有多种分子，是混合物。' },
          { q: '下列物质属于【单质】的是：', a: '液态氧 (O₂)', opts: ['液态氧 (O₂)', '冰水混合物 (H₂O)', '二氧化碳 (CO₂)', '氯化钠 (NaCl)'], exp: '单质是指由【同一种元素】组成的纯净物。液氧微观全由氧原子结合，是单质。水、二氧化碳和氯化钠由不同原子组合，是化合物。' },
          { q: '下列物质中，属于【混合物】的是：', a: '澄清石灰水', opts: ['澄清石灰水', '蒸馏水', '五氧化二磷', '铁粉'], exp: '澄清石灰水是氢氧化钙固体溶于水形成的溶液，包含水分子和氢氧化钙粒子，属于混合物。蒸馏水、五氧化二磷和铁粉只有唯一的一种分子或原子，是纯净物。' }
        ];
        const item = questions[randomInt(0, questions.length - 1)];
        qObj = {
          id: 40600 + i,
          question: `【化学题 ${qIdx}】${item.q}`,
          options: item.opts.sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n${item.exp}`
        };
        qObj.answer = qObj.options.indexOf(item.a);
        break;
      }

      // 空气测定氧气实验 (Day 7)
      case 'chem_topic_air': {
        const errs = [
          { reason: '红磷量不足，无法把瓶内的氧气消耗干净', state: '偏小' },
          { reason: '集气瓶弹簧夹没夹紧，或者装置漏气，导致外部空气被吸入', state: '偏小' },
          { reason: '红磷燃烧完毕后，试管尚未完全冷却就打开止水夹读取水面', state: '偏小' }
        ];
        const errItem = errs[randomInt(0, errs.length - 1)];
        qObj = {
          id: 40700 + i,
          question: `【化学题 ${qIdx}】在红磷燃烧测定空气中氧气含量的实验中，若出现【${errItem.reason}】，测得的氧气体积含量将：`,
          options: [`比 1/5 ${errItem.state}`, '比 1/5 偏大', '刚好等于 1/5', '无法确定'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n红磷测定氧气必须确保【把氧气吃光、外面空气不许漏进来、降到室温再量体积】。如果${errItem.reason}，产生的吸力就会变小，倒吸入的水体积就会【比 1/5 ${errItem.state}】。`
        };
        qObj.answer = qObj.options.indexOf(`比 1/5 ${errItem.state}`);
        break;
      }

      // 氧气燃烧现象及防护 (Day 8)
      case 'chem_topic_oxygen': {
        const scenarios = [
          { gas: '铁丝在纯氧中燃烧', formula: '3Fe + 2O₂ ==(点燃)== Fe₃O₄', safety: '集气瓶底部放少量水或铺一层细沙，防止溅落的高温熔融物烫裂瓶底' },
          { gas: '硫粉在纯氧中燃烧', formula: 'S + O₂ ==(点燃)== SO₂', safety: '集气瓶底部放少量水，用来吸收有毒的二氧化硫气体，防止污染空气' },
          { gas: '红磷在空气中燃烧', formula: '4P + 5O₂ ==(点燃)== 2P₂O₅', safety: '红磷燃烧会产生大量具有刺激性污染的白烟(五氧化二磷颗粒)' }
        ];
        const item = scenarios[randomInt(0, scenarios.length - 1)];
        const askSafety = randomInt(0, 1) === 1;

        if (askSafety) {
          qObj = {
            id: 40800 + i,
            question: `【化学题 ${qIdx}】在中考化学实验中，做“${item.gas}”实验时，关于集气瓶底部的防护操作，描述正确的是：`,
            options: [item.safety, '瓶底不需要做任何处理', '瓶底必须装满水将火淹没', '瓶底一定要涂抹凡士林'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n做“${item.gas}”实验时：${item.safety}。这是中考常考的经典实验安全考分点！`
          };
          qObj.answer = qObj.options.indexOf(item.safety);
        } else {
          qObj = {
            id: 40850 + i,
            question: `【化学题 ${qIdx}】请选出描述“${item.gas}”反应的配平化学方程式：`,
            options: [item.formula, 'Fe + O₂ == Fe₃O₄', 'S + O₂ == SO₂↑', 'P + O₂ == P₂O₅'].sort(() => 0.5 - Math.random()),
            answer: 0,
            explanation: `白话解析：\n化学方程式配平是铁律。左右原子数在反应前后必须完全等重！其正确的方程式为：${item.formula}。`
          };
          qObj.answer = qObj.options.indexOf(item.formula);
        }
        break;
      }

      // 双氧水制氧与催化剂一变两不变 (Day 9)
      case 'chem_topic_prep1': {
        qObj = {
          id: 40900 + i,
          question: `【化学题 ${qIdx}】关于双氧水(H₂O₂)分解制氧气中，作为催化剂的二氧化锰(MnO₂)，下列说法正确的是：`,
          options: [
            '反应前后，其自身的质量和化学性质都不发生改变',
            '反应后，二氧化锰的质量会随之减少',
            '二氧化锰能使原本不能分解的双氧水强行分解',
            '反应前后，二氧化锰的物理性质和化学性质都绝对不变'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n催化剂“化学红娘”的特性是【一变两不变】。一变：改变反应速度 ； 两不变：自身的【质量】和【化学性质】在反应前后绝不改变。物理状态（如颗粒粗细）可能会发生改变。`
        };
        qObj.answer = qObj.options.indexOf('反应前后，其自身的质量和化学性质都不发生改变');
        break;
      }

      // 加热固体制氧安全与防倒吸 (Day 10)
      case 'chem_topic_prep2': {
        qObj = {
          id: 41000 + i,
          question: `【化学题 ${qIdx}】用高锰酸钾固体制取氧气并用排水法收集，实验结束时正确的停机熄灯步骤是：`,
          options: [
            '先将导管从水槽中移出，再熄灭酒精灯',
            '先熄灭酒精灯，再将导管从水槽中移出',
            '熄灭酒精灯与移出导管必须同时进行',
            '先熄灭酒精灯，然后往试管底浇冷水'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n中考提分防雷必背：如果先熄灭酒精灯，试管内温度降低气压变小，水槽中的水会顺着导管【倒吸】回滚烫的试管底部，导致试管瞬间炸裂。所以必须【先拔导管，后熄灯】！`
        };
        qObj.answer = qObj.options.indexOf('先将导管从水槽中移出，再熄灭酒精灯');
        break;
      }

      // 分子与原子特性 (Day 11)
      case 'chem_topic_molecule': {
        const examples = [
          { fact: '50mL 水与 50mL 酒精混合后，总体积小于 100mL', exp: '说明分子之间是有空隙的，大小不同的分子互相钻进了空隙中。' },
          { fact: '墙内开花墙外香，墨水滴入水中整杯水变色', exp: '说明分子是在不断地进行无规则运动的，温度越高运动越剧烈。' },
          { fact: '物质的热胀冷缩现象（如温度计液柱受热上升）', exp: '说明温度升高时，分子之间的空隙变大了，而不是分子自己变胖了！' }
        ];
        const item = examples[randomInt(0, examples.length - 1)];
        qObj = {
          id: 41100 + i,
          question: `【化学题 ${qIdx}】在微观世界中，生活物理现象“${item.fact}”可以用分子的哪种特性来合理解释？`,
          options: [item.exp, '说明分子的体积和质量在受热时变大了', '说明分子在物理状态改变时分裂成了原子', '说明分子的电荷发生了改变'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n${item.exp}`
        };
        qObj.answer = qObj.options.indexOf(item.exp);
        break;
      }

      // 原子结构与电荷守恒 (Day 12)
      case 'chem_topic_structure': {
        qObj = {
          id: 41200 + i,
          question: `【化学题 ${qIdx}】任何原子在未得失电子的情况下都呈现电中性，这说明在原子内部关系中：`,
          options: [
            '质子数 ＝ 核外电子数 ＝ 核电荷数 ＝ 原子序数',
            '质子数 ＝ 中子数 ＝ 电子数',
            '中子数和电子数电荷相反，刚好抵消',
            '原子核占据了原子全部的体积，所以不带电'
          ].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n原子的太阳系模型中，原子核内有带正电的质子，核外有带负电的电子（中子不带电）。因为核内的质子数恰好等于核外的电子数，正负电荷总数刚好抵消，所以不带电。`
        };
        qObj.answer = qObj.options.indexOf('质子数 ＝ 核外电子数 ＝ 核电荷数 ＝ 原子序数');
        break;
      }

      // 阴阳离子形成与符号书写 (Day 13)
      case 'chem_topic_ion': {
        qObj = {
          id: 41300 + i,
          question: `【化学题 ${qIdx}】已知镁原子的核内质子数为 12，其最外层有 2 个电子，当它失去最外层电子形成镁离子后，其离子符号书写正确的是：`,
          options: ['Mg²⁺', 'Mg⁺²', 'Mg²⁻', 'Mg⁻²'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `白话解析：\n镁原子最外层有2个电子，失去2个电子后显 +2 价，记作镁离子。离子符号写法原则：电荷数写在元素符号的右上角，数字在前，正负号在后，故为 Mg²⁺。`
        };
        qObj.answer = qObj.options.indexOf('Mg²⁺');
        break;
      }

      // 水的电解与气体检验 (Day 14)
      case 'chem_topic_water1': {
        qObj = {
          id: 41400 + i,
          question: `【化学题 ${qIdx}】关于电解水实验(2H₂O ==通电== 2H₂↑ + O₂↑)，下列说法或现象描述正确的是：`,
          options: [
            '负极产生氢气，正极产生氧气，它们的体积比约为 2:1',
            '正极产生的是氢气，可以用燃着的木条点燃',
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
}

/**
 * 4. 中考英语题库生成器
 */
export function generateEnglishQuestions(topicId, count = 20) {
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

  for (let i = 0; i < count; i++) {
    let qObj = {};
    const qIdx = i + 1;

    // 奇数题做词汇英汉匹配，偶数题做当天语法选择题
    if (i % 2 === 0) {
      // 词汇选择题：从今日的候选池（生词优先）中提取
      const seedItem = candidateWords[i % candidateWords.length];
      const askChinese = randomInt(0, 1) === 1;

      if (askChinese) {
        qObj = {
          id: 50000 + i,
          question: `【英语词汇题 ${qIdx}】请选择单词/短语“${seedItem.word}”对应的正确中文解释：`,
          options: [seedItem.translation, 'n. 黑板', 'prep. 在...里面', 'v. 放弃'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `中考名师记词诀窍：\n“${seedItem.word}”的音标为 ${seedItem.phonetic}，中文意思是【${seedItem.translation}】。\n💡记忆捷径：${seedItem.tip}\n📖例句：${seedItem.sentence} (${seedItem.sentence_translation})`
        };
        qObj.answer = qObj.options.indexOf(seedItem.translation);
      } else {
        qObj = {
          id: 50100 + i,
          question: `【英语词汇题 ${qIdx}】根据中文意思“${seedItem.translation.split(' ')[1] || seedItem.translation}”，选出对应的英文单词/短语：`,
          options: [seedItem.word, 'beautiful', 'student', 'classroom'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `中考名师记词诀窍：\n中文“${seedItem.translation}”对应的英文写法为【${seedItem.word}】，音标是 ${seedItem.phonetic}。\n💡记忆捷径：${seedItem.tip}\n📖例句：${seedItem.sentence} (${seedItem.sentence_translation})`
        };
        qObj.answer = qObj.options.indexOf(seedItem.word);
      }
    } else {
      // 语法/时态情景题 (根据 Day 的不同语法出题)
      if (dayNum === 1) {
        qObj = {
          id: 50200 + i,
          question: `【语法选择题 ${qIdx}】My mother bought a storybook for my sister and _______. She likes reading very much.`,
          options: ['her', 'she', 'him', 'he'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n空格位于介词 for 的后面。根据人称代词“座位表”口诀：【动介后面用宾格，动词前面用主格】。此处是介词后，必须选宾格。由于是给妹妹(my sister)，对应女性代词宾格 her。\n答案选 her。`
        };
        qObj.answer = qObj.options.indexOf('her');
      } else if (dayNum === 2) {
        qObj = {
          id: 50300 + i,
          question: `【语法选择题 ${qIdx}】We are looking forward to _______ the Great Wall during the summer holiday.`,
          options: ['visiting', 'visit', 'to visit', 'visited'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\nlook forward to (期待) 中的 to 是介词，后面接动词必须变成动名词(doing)形式。这是中考常考易错地雷！\n答案选 visiting。`
        };
        qObj.answer = qObj.options.indexOf('visiting');
      } else if (dayNum === 3) {
        qObj = {
          id: 50400 + i,
          question: `【语法选择题 ${qIdx}】How much did you _______ for the new English dictionary?`,
          options: ['pay', 'spend', 'cost', 'take'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n空格后面搭配了介词 for (pay ... for ...)。主语是 you (人)。根据花费动词“主语心法”：人做主语且介词用 for 的只有 pay！\n答案选 pay。`
        };
        qObj.answer = qObj.options.indexOf('pay');
      } else if (dayNum === 7) {
        qObj = {
          id: 50500 + i,
          question: `【语法选择题 ${qIdx}】Although he was very tired, _______ he still finished writing his homework.`,
          options: ['/', 'but', 'so', 'however'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n句首已经有连词 although (虽然)。在英语里， although 和 but 是“不共戴天”的互斥连词，绝对不能同句共存！所以后半句开端不填任何词。\n答案选 /。`
        };
        qObj.answer = qObj.options.indexOf('/');
      } else if (dayNum === 8) {
        qObj = {
          id: 50600 + i,
          question: `【语法选择题 ${qIdx}】My father always _______ to work by subway every morning.`,
          options: ['goes', 'go', 'going', 'went'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n有 always (总是) 和 every morning (每天早晨) 表示平常的习惯，用一般现在时。主语 My father 是单数第三人称(单三)，动词 go 必须变成 goes。\n答案选 goes。`
        };
        qObj.answer = qObj.options.indexOf('goes');
      } else if (dayNum === 12) {
        qObj = {
          id: 50700 + i,
          question: `【语法选择题 ${qIdx}】- Have you finished reading the book _______?\n- Yes, I have _______ finished it.`,
          options: ['yet; already', 'already; yet', 'yet; yet', 'already; already'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n第一空是疑问句句尾，询问“已经...了吗”，用 yet ；第二空是肯定句中 haven/has 和 done 中间，用 already。\n答案选 yet; already。`
        };
        qObj.answer = qObj.options.indexOf('yet; already');
      } else if (dayNum === 14) {
        qObj = {
          id: 50800 + i,
          question: `【语法选择题 ${qIdx}】- Must I write down the notes now?\n- No, you _______. You can do it after school.`,
          options: ['needn\'t', 'mustn\'t', 'can\'t', 'shouldn\'t'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n以 Must I... (我必须...)开头的疑问句，否定回答表示“不必、不需要”，固定答语用 needn\'t 或者是 don\'t have to。 mustn\'t 表示“绝对禁止”，不符合常理。\n答案选 needn\'t。`
        };
        qObj.answer = qObj.options.indexOf('needn\'t');
      } else if (dayNum === 18) {
        qObj = {
          id: 50900 + i,
          question: `【语法选择题 ${qIdx}】We will go to the Shenzhen Bay Park if it _______ sunny tomorrow.`,
          options: ['is', 'will be', 'are', 'was'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n这是一个 if 引导的条件状语从句，主句是 will go (一般将来时)。根据“主将从现”原则， if 从句必须用一般现在时。主语是 it， be 动词用 is。\n答案选 is。`
        };
        qObj.answer = qObj.options.indexOf('is');
      } else {
        // 兜底时态题
        qObj = {
          id: 51000 + i,
          question: `【语法选择题 ${qIdx}】I _______ my homework when my father came back yesterday.`,
          options: ['was doing', 'did', 'am doing', 'will do'].sort(() => 0.5 - Math.random()),
          answer: 0,
          explanation: `名师考点解析：\n时间状语为 when my father came back yesterday (昨晚爸爸回家的瞬间)，表示过去某一特定时刻正在发生的动作，使用过去进行时 (was/were + doing)。主语为 I，用 was doing。\n答案选 was doing。`
        };
        qObj.answer = qObj.options.indexOf('was doing');
      }
    }
    list.push(qObj);
  }
  return list;
}

