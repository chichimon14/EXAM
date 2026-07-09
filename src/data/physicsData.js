// 八年级物理人教版 核心数据与240题大题库文件

export const blocks = [
  { id: 'block1', name: '声与光', chapters: ['chapter2', 'chapter4', 'chapter5'], color: 'var(--color-optics)', badgeClass: 'badge-optics' },
  { id: 'block2', name: '物态与热学', chapters: ['chapter3'], color: 'var(--color-heat)', badgeClass: 'badge-heat' },
  { id: 'block3', name: '运动与密度', chapters: ['chapter1', 'chapter6'], color: 'var(--color-mech)', badgeClass: 'badge-mech' },
  { id: 'block4', name: '力与压强浮力', chapters: ['chapter7', 'chapter8', 'chapter9', 'chapter10'], color: 'var(--color-mech)', badgeClass: 'badge-mech' },
  { id: 'block5', name: '功与简单机械', chapters: ['chapter11', 'chapter12'], color: 'var(--color-work)', badgeClass: 'badge-work' }
];

export const chapters = {
  chapter1: {
    id: 'chapter1',
    blockId: 'block3',
    name: '第一章 机械运动',
    summary: '★【中考分值】约2-4分。考查长度估测、刻度尺读数、参照物与简单速度计算。\n' +
             '1. **长度估测常识**：中学生身高约 1.6 m，手指宽约 1 cm，手掌宽约 10 cm (1 dm)，铅笔长约 18 cm。\n' +
             '2. **刻度尺的读数规范**：三看（看零刻度线是否磨损、看量程、看分度值）。**必须估读到分度值的下一位**！例如分度值是 1 mm = 0.1 cm，读数必须精确到 cm 的小数点后第二位（如 2.50 cm，不能漏掉最后的 0）。\n' +
             '3. **参照物的判定**：运动是绝对的，静止是相对的。判断物体是运动还是静止，看它相对于参照物的位置是否改变。**不能选择被研究物体本身作为参照物**。\n' +
             '4. **速度公式与计算**：v = s / t。**中考警示**：平均速度是“总路程除以总时间”，绝非速度的平均值！已知前半程速度 v₁ 和后半程速度 v₂，平均速度不是 (v₁+v₂)/2！\n' +
             '5. **单位换算**：1 m/s = 3.6 km/h。人步行速度约 1.1 m/s，骑自行车约 5 m/s，高速公路小车约 30 m/s。',
    formulaIds: ['v_s_t']
  },
  chapter2: {
    id: 'chapter2',
    blockId: 'block1',
    name: '第二章 声现象',
    summary: '★【中考分值】约2分。核心考点是声音产生传播和三要素辨析，送分必拿！\n' +
             '1. **产生与传播**：声音由发声体**振动**产生，振动停止，发声也停止。声音传播需要**介质**（固体/液体/气体）。**真空不能传声**（月球/太空必须用电磁波无线电交流）。\n' +
             '2. **声速**：在固体中最快，液体中次之，气体中最慢。15℃ 空气中声速为 **340 m/s**。\n' +
             '3. **声音三要素辨析（极易混淆）**：\n' +
             '   - **音调**：声音的**高低**（细、尖锐，还是低沉粗犷），由**频率**（振动快慢）决定。弦乐器越短越细越紧，音调越高。\n' +
             '   - **响度**：声音的**强弱/大小**（震耳欲聋、轻声细语），由**振幅**和距离发声体远近决定。敲鼓力越大，响度越大。\n' +
             '   - **音色**：声音的**品质/特色**，由发声体的**材料和结构**决定。“闻其声知其人”、“分辨乐器”全靠音色。\n' +
             '4. **声音的利用**：传递**信息**（B超、声呐回声定位、听诊器）；传递**能量**（超声波清洗牙齿/钟表、震碎结石）。\n' +
             '5. **噪声控制三途径**：1. 在声源处减弱（消声器、禁止鸣笛）；2. 在传播过程中减弱（隔音墙、绿化带）；3. 在人耳处减弱（戴耳罩、塞棉花）。',
    formulaIds: []
  },
  chapter3: {
    id: 'chapter3',
    blockId: 'block2',
    name: '第三章 物态变化',
    summary: '★【中考分值】约3-4分。考查温度计使用、六种物态变化吸放热判定及晶体熔化图像。\n' +
             '1. **温度计使用规范**：玻璃泡要全部浸入液体，不能接触杯底和杯壁；读数时视线要与液面相平（凹面底部或凸面顶部），绝对**不能离开液体读数**（体温计除外）。\n' +
             '2. **六种物态变化吸放热判定**：\n' +
             '   - **吸热过程**：**熔化**（固→液）、**汽化**（液→气，含蒸发和沸腾）、**升华**（固→气）。\n' +
             '   - **放热过程**：**凝固**（液→固）、**液化**（气→液）、**凝华**（气→固）。\n' +
             '3. **中考核心高频白气液化陷阱**：凡是“白气”、“白雾”、“露水”、“出汗”，都是**水蒸气液化形成的小水滴**，气态变液态，属于放热液化。冰棒冒白气是“空气中”的水蒸气遇冷液化，不是冰棒汽化！\n' +
             '4. **晶体与非晶体熔化**：晶体熔化时**持续吸热，但温度保持在熔点不变**（固液共存态）。非晶体熔化时吸热温度不断上升，没有固定熔点。常考晶体：冰、海波、各种金属。',
    formulaIds: []
  },
  chapter4: {
    id: 'chapter4',
    blockId: 'block1',
    name: '第四章 光现象',
    summary: '★【中考分值】约3-5分。核心考点为三光（直线传播、反射、折射）辨析、平面镜成像规律。\n' +
             '1. **光的直线传播**：光在**同种均匀介质**中沿直线传播。影子的形成、小孔成像（倒立实像，像的大小由物到孔和光屏到孔的距离决定）、日食月食。\n' +
             '2. **光的反射定律**：三线共面，法线居中，**反射角等于入射角**（入射角是指入射光线与法线的夹角，反射角同理，千万别用光线与镜面的夹角算！）。\n' +
             '3. **平面镜成像特点**：成**等大、正立的虚像**。像到镜的距离等于物到镜的距离（等距）。像与物连线垂直于镜面。**常考陷阱**：人向镜子走近，镜中的像**大小不变**，只是视角变大感觉变大！\n' +
             '4. **光的折射规律**：光从空气斜射入水/玻璃中时，折射光线向法线偏折，**折射角小于入射角**。反之折射角大于入射角。**折射现象**：池水变浅、水中筷子“折断”、海市蜃楼、彩虹。',
    formulaIds: []
  },
  chapter5: {
    id: 'chapter5',
    blockId: 'block1',
    name: '第五章 透镜及其应用',
    summary: '★【中考分值】约4-6分。透镜成像规律及动态变化是中考光学绝对的压轴必考考点。\n' +
             '1. **透镜对光作用**：凸透镜对光起**会聚**作用，凹透镜对光起**发散**作用（发散指折射光线相对于入射光线更偏离主光轴）。\n' +
             '2. **凸透镜成像规律大字背诵**（焦距为 f）：\n' +
             '   - **物距 u > 2f**：成**倒立、缩小、实像**（像距 f < v < 2f）。应用：**照相机**。\n' +
             '   - **物距 f < u < 2f**：成**倒立、放大、实像**（像距 v > 2f）。应用：**投影仪/投影幻灯片**。\n' +
             '   - **物距 u < f**：成**正立、放大、虚像**（像物同侧）。应用：**放大镜**。\n' +
             '3. **动态规律“物近像远像变大”**：物体靠近透镜（u变小，但大过f），像会远离透镜（v变大），光屏上的实像也会随之变大！照相机拍照想让半身像变全身像，人要远离相机（物远），同时镜头向后缩（像近像变小）。\n' +
             '4. **眼睛与眼镜**：近视眼晶状体太厚，折光太强，像落在视网膜**前方**，佩戴**凹透镜**矫正。远视眼（老花眼）戴**凸透镜**。',
    formulaIds: []
  },
  chapter6: {
    id: 'chapter6',
    blockId: 'block3',
    name: '第六章 质量与密度',
    summary: '★【中考分值】约4-6分。考查质量物理属性、天平与量筒测密度实验、密度公式基础计算。\n' +
             '1. **质量的理解**：质量是物体本身的一种属性。不随物体的**状态、温度、形状、位置**的改变而改变。例如，把 1kg 的冰带到月球熔化成水，质量依然是 1kg。\n' +
             '2. **天平调节与使用**：放水平、游码归零、调螺母（平衡指针）。测质量时“左物右码”。增减砝码从大到小，最后调游码。测量读数 = 砝码总质量 + 游码示数。测量过程中**绝不能动平衡螺母**！\n' +
             '3. **密度特性**：密度是物质的一种**特性**。同种物质在相同状态下，密度不随质量或体积改变。把一铁块切掉一半，剩下半块铁的密度保持不变！\n' +
             '4. **密度计算公式**：ρ = m / V。换算关系：1 g/cm³ = 1000 kg/m³。水的密度必须记住：1.0 * 10³ kg/m³，表示每立方米水的质量是 1000 kg。',
    formulaIds: ['rho_m_v']
  },
  chapter7: {
    id: 'chapter7',
    blockId: 'block4',
    name: '第七章 力',
    summary: '★【中考分值】约2-4分。考查力的概念、力的三要素与重力公式 G=mg。\n' +
             '1. **力的本质**：力是物体对物体的作用。有力必须有两个物体（施力物体与受力物体）。物体间力的作用是**相互的**（作用力与反作用力大小相等、方向相反，同时产生，同时消失，作用在不同物体上）。\n' +
             '2. **力的作用效果**：1. 改变物体的**形状**（形变）；2. 改变物体的**运动状态**（速度大小或运动方向发生改变）。\n' +
             '3. **力的三要素**：大小、方向、作用点。它们都会影响力的作用效果。\n' +
             '4. **重力 G = mg**：重力是由于**地球吸引**而使物体受到的力。重力的方向永远是**竖直向下**（垂直于水平面向下，而不是垂直于斜面向下）。g 取 10 N/kg 意味着质量为 1 kg 的物体在地球上受到的重力是 10 N。',
    formulaIds: ['G_m_g']
  },
  chapter8: {
    id: 'chapter8',
    blockId: 'block4',
    name: '第八章 运动和力',
    summary: '★【中考分值】约4-6分。中考力学基础核心！考查牛一、惯性、二力平衡和摩擦力判定。\n' +
             '1. **牛顿第一定律**：一切物体在没有受到力的作用时，总保持静止状态或匀速直线运动状态。**物理观念**：力**不是**维持物体运动的原因，力是**改变**物体运动状态的原因！\n' +
             '2. **惯性常识**：物体保持原来运动状态不变的性质。一切物体在任何时候、任何状态下都**具有惯性**。惯性不是力，不能说“在惯性作用下”，只能说“由于惯性”或“具有惯性”。**惯性大小只由质量决定**，速度快慢不影响惯性大小！\n' +
             '3. **二力平衡 vs 相互作用力**：平衡力作用在**同一物体**上（同体、等大、反向、共线）。相互作用力作用在**两个不同物体**上。\n' +
             '4. **摩擦力决定因素**：滑动摩擦力大小只跟**压力大小**和**接触面粗糙程度**有关。与物体运动速度快慢、接触面积大小完全无关。静止和匀速状态下的物体利用二力平衡求摩擦力。',
    formulaIds: []
  },
  chapter9: {
    id: 'chapter9',
    blockId: 'block4',
    name: '第九章 压强',
    summary: '★【中考分值】约5-8分。考查固体压强改变与计算、液体压强深度判定及大气压性质。\n' +
             '1. **固体压强**：p = F / S。中考代入数据时，受力面积 S 必须是**接触挤压的实际面积**。单位必须换算成标准单位 m²！\n' +
             '2. **液体压强**：p = ρ * g * h。**核心死穴**：深度 h 是指**所求点到液体自由液面的垂直高度**！千万不能看成到杯底的距离。液体压强只跟液体密度和深度有关，与液体质量、容器形状无直接关系。\n' +
             '3. **连通器原理**：上端开口、底部连通。静止装同种液体时，各容器液面总保持相平。茶壶、船闸、锅炉水位计都是典型应用。\n' +
             '4. **大气压与沸点**：标准大气压 ≈ 1.013*10⁵ Pa (约 760mm 水银柱)。气压随高度增加而减小。**液体沸点随气压减小而降低**（高山上压强低，水不到100℃就沸腾，所以饭煮不熟）。',
    formulaIds: ['p_F_S', 'p_rho_g_h']
  },
  chapter10: {
    id: 'chapter10',
    blockId: 'block4',
    name: '第十章 浮力',
    summary: '★【中考分值】约6-8分。常考浮力计算方法辨析（称重法、阿基米德、浮沉状态）。\n' +
             '1. **称重法**：F_浮 = G - F_示。物体浸入水中，测力计示数变小，减小的值就是受到的浮力。\n' +
             '2. **阿基米德原理**：F_浮 = G_排 = ρ_液 * g * V_排。**考点避坑**：只要物体全部没入水下，排开体积 V_排 就达到最大值，不管深度怎么增加，它受到的**浮力保持不变**！\n' +
             '3. **浮沉状态判别式**：\n   - **上浮**：F_浮 > G (ρ_液 > ρ_物)；最终**漂浮**在水面时，F_浮 = G (受力平衡)。\n   - **悬浮**：F_浮 = G (ρ_液 = ρ_物)；物体可以停在液体内部的任何深度。\n   - **下沉**：F_浮 < G (ρ_液 < ρ_物)；物体沉入底部受支持力，F_浮 + F_支 = G。',
    formulaIds: ['F_G_F', 'F_rho_g_V']
  },
  chapter11: {
    id: 'chapter11',
    blockId: 'block5',
    name: '第十一章 功和机械能',
    summary: '★【中考分值】约4-6分。考查功的判定、功与功率计算、机械能守恒概念。\n' +
             '1. **做功判定“三不做功”**：1. 劳而无功：推石未动（有力无距离，s=0）；2. 不劳无功：惯性滑行（有距离无力，F=0）；3. 垂直不做功：提着水桶在水平路面走（力向上，运动向水平，力与距离方向垂直）。\n' +
             '2. **功与功率计算**：W = Fs (求做功，重力做功要代入重力和高度h)。P = W / t = Fv (求功率，反映做功快慢，与做功多少无关)。\n' +
             '3. **动能与势能决定因素**：\n   - **动能**：质量、速度。速度对动能影响更大。\n   - **重力势能**：质量、被提升的高度。\n   - **弹性势能**：物体的弹性形变程度。\n4. **机械能转化**：不计阻力和摩擦时，动能与势能相互转化，机械能总量**守恒**；若存在摩擦阻力，机械能转化为内能，机械能总量减少。',
    formulaIds: ['W_F_s', 'P_W_t']
  },
  chapter12: {
    id: 'chapter12',
    blockId: 'block5',
    name: '第十二章 简单机械',
    summary: '★【中考分值】约6-8分。考查杠杆力臂判定、滑轮组省力及机械效率计算。\n' +
             '1. **杠杆五要素与力臂**：支点到**力的作用线**的垂直距离才是力臂！绝对不能误认为是从支点到力的作用点的距离。\n' +
             '2. **杠杆平衡条件**：F₁L₁ = F₂L₂。省力杠杆（L₁ > L₂，省力费距离，如撬棒、指甲刀）；费力杠杆（L₁ < L₂，费力省距离，如筷子、钓鱼竿）。省力又省距离的机械**不存在**！\n' +
             '3. **滑轮组计算常备公式**（不计绳重及摩擦）：\n   - 绳子自由端拉力：F = (G_物 + G_动) / n （n 是承担物重的绳子段数，看绕在动滑轮上的绳子段数）。\n   - 绳子端移动距离：s = n * h （h 是物体上升高度）。\n4. **机械效率**：eta = W_有 / W_总 * 100%。有用功 W_有 = G_物 * h；总功 W_总 = F_拉 * s。滑轮组提升物体时，由于动滑轮重和摩擦，机械效率 η 恒小于 100%。',
    formulaIds: ['F1_L1_F2_L2', 'eta_W_W']
  }
};

export const formulas = {
  v_s_t: {
    id: 'v_s_t',
    name: '速度计算公式',
    expression: 'v = s / t',
    vars: [
      { symbol: 'v', name: '速度', unit: 'm/s', desc: '物体在单位时间内通过的路程', conversion: '1 m/s = 3.6 km/h' },
      { symbol: 's', name: '路程', unit: 'm', desc: '物体运动轨迹的长度' },
      { symbol: 't', name: '时间', unit: 's', desc: '物体运动所经历的时间' }
    ],
    calculations: [
      { target: 'v', inputs: ['s', 't'], formula: 'v = s / t', calc: (s, t) => s / t },
      { target: 's', inputs: ['v', 't'], formula: 's = v * t', calc: (v, t) => v * t },
      { target: 't', inputs: ['s', 'v'], formula: 't = s / v', calc: (s, v) => v === 0 ? 0 : s / v }
    ]
  },
  rho_m_v: {
    id: 'rho_m_v',
    name: '密度计算公式',
    expression: 'rho = m / V',
    vars: [
      { symbol: 'rho', name: '密度', unit: 'kg/m³', desc: '单位体积某种物质的质量', conversion: '1 g/cm³ = 1000 kg/m³' },
      { symbol: 'm', name: '质量', unit: 'kg', desc: '物体所含物质的多少' },
      { symbol: 'V', name: '体积', unit: 'm³', desc: '物体所占空间的大小' }
    ],
    calculations: [
      { target: 'rho', inputs: ['m', 'V'], formula: 'rho = m / V', calc: (m, V) => V === 0 ? 0 : m / V },
      { target: 'm', inputs: ['rho', 'V'], formula: 'm = rho * V', calc: (rho, V) => rho * V },
      { target: 'V', inputs: ['m', 'rho'], formula: 'V = m / rho', calc: (m, rho) => rho === 0 ? 0 : m / rho }
    ]
  },
  G_m_g: {
    id: 'G_m_g',
    name: '重力计算公式',
    expression: 'G = m * g',
    vars: [
      { symbol: 'G', name: '重力', unit: 'N', desc: '由于地球吸引而受到的力，方向竖直向下' },
      { symbol: 'm', name: '质量', unit: 'kg', desc: '物体的质量' },
      { symbol: 'g', name: '常数', unit: 'N/kg', desc: '重力加速度（中考通常取 10 N/kg 或 9.8 N/kg）', defaultValue: 10 }
    ],
    calculations: [
      { target: 'G', inputs: ['m', 'g'], formula: 'G = m * g', calc: (m, g) => m * g },
      { target: 'm', inputs: ['G', 'g'], formula: 'm = G / g', calc: (G, g) => g === 0 ? 0 : G / g }
    ]
  },
  p_F_S: {
    id: 'p_F_S',
    name: '固体压强公式',
    expression: 'p = F / S',
    vars: [
      { symbol: 'p', name: '压强', unit: 'Pa', desc: '物体单位面积上受到的压力' },
      { symbol: 'F', name: '压力', unit: 'N', desc: '垂直作用在物体表面上的力' },
      { symbol: 'S', name: '受力面积', unit: 'm²', desc: '两个物体相互接触并挤压的面积' }
    ],
    calculations: [
      { target: 'p', inputs: ['F', 'S'], formula: 'p = F / S', calc: (F, S) => S === 0 ? 0 : F / S },
      { target: 'F', inputs: ['p', 'S'], formula: 'F = p * S', calc: (p, S) => p * S },
      { target: 'S', inputs: ['F', 'p'], formula: 'S = F / p', calc: (F, p) => p === 0 ? 0 : F / p }
    ]
  },
  p_rho_g_h: {
    id: 'p_rho_g_h',
    name: '液体压强公式',
    expression: 'p = rho * g * h',
    vars: [
      { symbol: 'p', name: '液体压强', unit: 'Pa', desc: '液体内部由于自身重力产生的压强' },
      { symbol: 'rho', name: '液体密度', unit: 'kg/m³', desc: '液体的密度（水为 1000 kg/m³）' },
      { symbol: 'g', name: '常数', unit: 'N/kg', desc: '重力常数（一般取10 N/kg）', defaultValue: 10 },
      { symbol: 'h', name: '深度', unit: 'm', desc: '所求点到液体自由液面的垂直距离' }
    ],
    calculations: [
      { target: 'p', inputs: ['rho', 'g', 'h'], formula: 'p = rho * g * h', calc: (rho, g, h) => rho * g * h },
      { target: 'h', inputs: ['p', 'rho', 'g'], formula: 'h = p / (rho * g)', calc: (p, rho, g) => (rho * g) === 0 ? 0 : p / (rho * g) }
    ]
  },
  F_G_F: {
    id: 'F_G_F',
    name: '称重法浮力公式',
    expression: 'F_浮 = G - F_示',
    vars: [
      { symbol: 'F_fu', name: '浮力', unit: 'N', desc: '液体对浸入物体向上的力' },
      { symbol: 'G', name: '物重', unit: 'N', desc: '物体在空气中称量时的重力' },
      { symbol: 'F_shi', name: '拉力', unit: 'N', desc: '物体浸在液体中时弹簧测力计的示数' }
    ],
    calculations: [
      { target: 'F_fu', inputs: ['G', 'F_shi'], formula: 'F_浮 = G - F_示', calc: (G, F_shi) => G - F_shi },
      { target: 'G', inputs: ['F_fu', 'F_shi'], formula: 'G = F_浮 + F_示', calc: (F_fu, F_shi) => F_fu + F_shi },
      { target: 'F_shi', inputs: ['G', 'F_fu'], formula: 'F_示 = G - F_浮', calc: (G, F_fu) => G - F_fu }
    ]
  },
  F_rho_g_V: {
    id: 'F_rho_g_V',
    name: '阿基米德原理公式',
    expression: 'F_浮 = rho_液 * g * V_排',
    vars: [
      { symbol: 'F_fu', name: '浮力', unit: 'N', desc: '物体所受的浮力' },
      { symbol: 'rho_liq', name: '液体密度', unit: 'kg/m³', desc: '液体的密度' },
      { symbol: 'g', name: '常数', unit: 'N/kg', desc: '重力常数，默认10 N/kg', defaultValue: 10 },
      { symbol: 'V_pai', name: '排开体积', unit: 'm³', desc: '物体排开液体的体积（注意：物体没入液体后，V排等于物体体积；部分浸入时，V排小于物体体积）' }
    ],
    calculations: [
      { target: 'F_fu', inputs: ['rho_liq', 'g', 'V_pai'], formula: 'F_浮 = rho_液 * g * V_排', calc: (rho_liq, g, V_pai) => rho_liq * g * V_pai },
      { target: 'V_pai', inputs: ['F_fu', 'rho_liq', 'g'], formula: 'V_排 = F_浮 / (rho_liq * g)', calc: (F_fu, rho_liq, g) => (rho_liq * g) === 0 ? 0 : F_fu / (rho_liq * g) }
    ]
  },
  W_F_s: {
    id: 'W_F_s',
    name: '做功计算公式',
    expression: 'W = F * s',
    vars: [
      { symbol: 'W', name: '功', unit: 'J', desc: '力对物体所做的功' },
      { symbol: 'F', name: '拉力/推力', unit: 'N', desc: '作用在物体上的恒定拉力或推力' },
      { symbol: 's', name: '距离', unit: 'm', desc: '物体在力的方向上移动的距离' }
    ],
    calculations: [
      { target: 'W', inputs: ['F', 's'], formula: 'W = F * s', calc: (F, s) => F * s },
      { target: 'F', inputs: ['W', 's'], formula: 'F = W / s', calc: (W, s) => s === 0 ? 0 : W / s },
      { target: 's', inputs: ['W', 'F'], formula: 's = W / F', calc: (W, F) => F === 0 ? 0 : W / F }
    ]
  },
  P_W_t: {
    id: 'P_W_t',
    name: '功率计算公式',
    expression: 'P = W / t',
    vars: [
      { symbol: 'P', name: '功率', unit: 'W', desc: '物体做功的快慢' },
      { symbol: 'W', name: '总功', unit: 'J', desc: '在时间t内所做的功' },
      { symbol: 't', name: '时间', unit: 's', desc: '做功所消耗的时间' }
    ],
    calculations: [
      { target: 'P', inputs: ['W', 't'], formula: 'P = W / t', calc: (W, t) => t === 0 ? 0 : W / t },
      { target: 'W', inputs: ['P', 't'], formula: 'W = P * t', calc: (P, t) => P * t },
      { target: 't', inputs: ['W', 'P'], formula: 't = W / P', calc: (W, P) => P === 0 ? 0 : W / P }
    ]
  },
  F1_L1_F2_L2: {
    id: 'F1_L1_F2_L2',
    name: '杠杆平衡条件',
    expression: 'F_1 * L_1 = F_2 * L_2',
    vars: [
      { symbol: 'F1', name: '动力', unit: 'N', desc: '使杠杆转动的力' },
      { symbol: 'L1', name: '动力臂', unit: 'm', desc: '支点到动力作用线的垂直距离' },
      { symbol: 'F2', name: '阻力', unit: 'N', desc: '阻碍杠杆转动的力' },
      { symbol: 'L2', name: '阻力臂', unit: 'm', desc: '支点到阻力作用线的垂直距离' }
    ],
    calculations: [
      { target: 'F1', inputs: ['L1', 'F2', 'L2'], formula: 'F_1 = (F_2 * L_2) / L_1', calc: (L1, F2, L2) => L1 === 0 ? 0 : (F2 * L2) / L1 },
      { target: 'L1', inputs: ['F1', 'F2', 'L2'], formula: 'L_1 = (F_2 * L_2) / F_1', calc: (F1, F2, L2) => F1 === 0 ? 0 : (F2 * L2) / F1 },
      { target: 'F2', inputs: ['F1', 'L1', 'L2'], formula: 'F_2 = (F_1 * L_1) / L_2', calc: (F1, L1, L2) => L2 === 0 ? 0 : (F1 * L1) / L2 },
      { target: 'L2', inputs: ['F1', 'L1', 'F2'], formula: 'L_2 = (F_1 * L_1) / F_2', calc: (F1, L1, F2) => F2 === 0 ? 0 : (F1 * L1) / F2 }
    ]
  },
  eta_W_W: {
    id: 'eta_W_W',
    name: '机械效率公式',
    expression: 'eta = W_有 / W_总 * 100%',
    vars: [
      { symbol: 'eta', name: '机械效率', unit: '%', desc: '有用功跟总功的比值，恒小于 100%' },
      { symbol: 'W_you', name: '有用功', unit: 'J', desc: '对人们有利用价值的功（如提升重物所做的功 G*h）' },
      { symbol: 'W_zong', name: '总功', unit: 'J', desc: '动力所做的功（如拉力做的功 F*s）' }
    ],
    calculations: [
      { target: 'eta', inputs: ['W_you', 'W_zong'], formula: 'eta = (W_有 / W_总) * 100', calc: (W_you, W_zong) => W_zong === 0 ? 0 : (W_you / W_zong) * 100 },
      { target: 'W_you', inputs: ['eta', 'W_zong'], formula: 'W_有 = W_总 * eta', calc: (eta, W_zong) => W_zong * (eta / 100) }
    ]
  }
};

// 声明 240 道物理基础多维考点题库
export const questions = [];

// 1. 机械运动 (1 - 20)
questions.push(
  { id: 1, chapterId: 'chapter1', blockId: 'block3', category: '长度估测', question: '下列估测数据中最接近生活实际的是：', options: ['中学生身高约 1.6 dm', '中学生手掌宽约 10 cm', '普通中性笔长约 1.8 m', '普通教室黑板长约 15 m'], answer: 1, explanation: '名师指点：10 cm 刚好等于 1 dm，符合人手掌宽度。A选项1.6 dm只有16厘米；C选项1.8 m是成人的身高；D选项15 m比三辆小轿车连起来还长。' },
  { id: 2, chapterId: 'chapter1', blockId: 'block3', category: '时间估测', question: '正常人心脏跳动 1 次的时间最接近下列哪个数值？', options: ['0.8 s', '8 s', '80 s', '8 min'], answer: 0, explanation: '名师指点：正常人每分钟心跳约 60~80 次。跳动一次大约就是 0.8~1.0 秒。8秒跳一次心率就只有每分钟7次，属于生命危险状态。' },
  { id: 3, chapterId: 'chapter1', blockId: 'block3', category: '刻度尺量程', question: '在测量物理课本的宽度时，关于刻度尺的选择，下列说法正确的是：', options: ['量程越大越好，分度值越小越好', '量程够用即可，分度值越小越好', '必须选择分度值为 1 mm 的尺子', '根据测量要求选择量程和分度值合适的尺子'], answer: 3, explanation: '名师指点：物理学中，刻度尺的选择不是越精确越好，而是要“根据测量要求和实际需要”。测课本宽度选用毫米刻度尺即可，测操场长度用皮尺。' },
  { id: 4, chapterId: 'chapter1', blockId: 'block3', category: '长度估读', question: '用分度值为 1 mm 的直尺测物块长度，读数规范的是：', options: ['2.5 cm', '2.50 cm', '25.02 mm', '0.25 m'], answer: 1, explanation: '名师指点：1 mm = 0.1 cm。读数必须估读到分度值下一位，即在 cm 单位下保留两位小数。2.50 cm 表示准确值是 2.5 cm，估读值是 0.00 cm。' },
  { id: 5, chapterId: 'chapter1', blockId: 'block3', category: '测量误差', question: '关于误差，下列说法中正确的是：', options: ['测量时出现的错误就是误差', '误差是由于测量方法不正确造成的', '选用精密的测量仪器可以避免误差', '多次测量求平均值可以减小误差'], answer: 3, explanation: '名师指点：误差不是错误。错误可以避免，误差**无法避免**，只能尽量减小。通过选用精密仪器、改进方法、多次测量求平均值可以减小误差，但绝不能消除。' },
  { id: 6, chapterId: 'chapter1', blockId: 'block3', category: '参照物选择', question: '唐代诗人李白在《望天门山》中写道：“两岸青山相对出，孤帆一片日边来”。其中“青山相对出”选择的参照物是：', options: ['青山', '两岸', '孤帆/行船', '日/太阳'], answer: 2, explanation: '名师指点：青山看起来在“运动”（相对出），是因为人坐在船上，青山与船（孤帆）的位置在发生改变。' },
  { id: 7, chapterId: 'chapter1', blockId: 'block3', category: '参照物判定', question: '小明与小华并肩同行在人行道上，如果说小明是静止的，所选的参照物是：', options: ['路边的树木', '迎面走来的行人', '小华', '人行道上的地砖'], options: ['路边的树木', '迎面走来的行人', '小华', '地砖'], answer: 2, explanation: '名师指点：静止说明位置没有改变。小明与小华并肩同行，他们之间的相对位置保持不变，所以以小华为参照物，小明是静止的。' },
  { id: 8, chapterId: 'chapter1', blockId: 'block3', category: '运动相对性', question: '同步通信卫星“静止”在地球赤道上空，这里说的“静止”是以下列哪个物体为参照物的？', options: ['太阳', '地球', '月球', '其他行星'], answer: 1, explanation: '名师指点：同步卫星绕地球转动一周的时间与地球自转一周的时间（24小时）完全相同，所以从地球上看，卫星是静止不动的。它以地球为参照物。' },
  { id: 9, chapterId: 'chapter1', blockId: 'block3', category: '速度单位换算', question: '小车以 72 km/h 的速度在公路上行驶，短跑运动员速度是 10 m/s，则：', options: ['小车的速度大', '运动员的速度大', '两者速度一样大', '无法比较'], answer: 0, explanation: '名师指点：统一单位再比较！72 km/h = 72 / 3.6 m/s = 20 m/s。20 m/s 大于 10 m/s，所以小车的速度大。' },
  { id: 10, chapterId: 'chapter1', blockId: 'block3', category: '平均速度计算', question: '小明百米赛跑，前 50 m 用时 6 s，后 50 m 用时 4 s。则他全程的平均速度是：', options: ['8.3 m/s', '12.5 m/s', '10 m/s', '10.4 m/s'], answer: 2, explanation: '名师指点：平均速度 v = 总路程 s / 总时间 t。总路程 s = 100 m，总时间 t = 6 s + 4 s = 10 s。则 v = 100 / 10 = 10 m/s。' },
  { id: 11, chapterId: 'chapter1', blockId: 'block3', category: '平均速度易错', question: '一物体做变速直线运动，前一半路程的速度是 4 m/s，后一半路程的速度是 6 m/s。则全程的平均速度是：', options: ['5 m/s', '4.8 m/s', '5.2 m/s', '4.5 m/s'], answer: 1, explanation: '名师指点：经典中考大坑题！设半程路程为 s。总时间 t = s/4 + s/6 = 5s/12。全程平均速度 v = 2s / (5s/12) = 24/5 = 4.8 m/s。绝不是(4+6)/2=5 m/s！' },
  { id: 12, chapterId: 'chapter1', blockId: 'block3', category: '匀速直线运动', question: '关于匀速直线运动，下列说法中正确的是：', options: ['物体运动的路程越长，速度越大', '物体运动的时间越短，速度越大', '速度的大小等于路程与时间的比值，但速度与路程、时间无关', '物体在任意相同时间内，通过的路程不一定相等'], answer: 2, explanation: '名师指点：匀速直线运动的物体，速度是一个恒定的常量。它不随路程 s 的变长或时间 t 的变短而改变。v = s/t 只是其数学计算方法。' },
  { id: 13, chapterId: 'chapter1', blockId: 'block3', category: '运动图像识别', question: '在 s-t（路程-时间）图像中，如果图线是一条过原点的倾斜直线，这代表物体的运动状态是：', options: ['静止', '匀速直线运动', '加速运动', '减速运动'], answer: 1, explanation: '名师指点：在 s-t 图像中，斜率代表速度。过原点的倾斜直线表示路程与时间成正比，即速度大小保持恒定，是匀速直线运动。' },
  { id: 14, chapterId: 'chapter1', blockId: 'block3', category: 'v-t图像识别', question: '在 v-t（速度-时间）图像中，一条平行于时间轴的水平直线表示：', options: ['物体静止不动', '物体做匀速直线运动', '物体做匀加速运动', '物体做匀减速运动'], answer: 1, explanation: '名师指点：注意看清纵坐标！在 v-t 图像中，纵轴是速度。水平直线表示速度不随时间改变，即速度恒定，代表匀速直线运动。' },
  { id: 15, chapterId: 'chapter1', blockId: 'block3', category: '声纳测距', question: '利用超声波向海底垂直发射信号，经 4 s 接收到回声。已知超声波在海水中的传播速度为 1500 m/s，则海底深度为：', options: ['6000 m', '3000 m', '1500 m', '12000 m'], answer: 1, explanation: '名师指点：声音从发射到海底，再折返到接收器，一共用时 4 s。因此单程（海底深度）时间只需一半，即 2 s。海底深度 h = vt = 1500 m/s * 2 s = 3000 m。' },
  { id: 16, chapterId: 'chapter1', blockId: 'block3', category: '参照物多项判断', question: '有甲、乙两列高铁在平行轨道上同向行驶。甲车上的乘客看到乙车在向后退，这说明：', options: ['甲、乙两车都静止', '甲车速度大于乙车', '乙车速度大于甲车', '乙车正在倒车'], answer: 1, explanation: '名师指点：两车同向行驶，以甲车为参照物，乙车向后退，说明甲车越开越快，逐渐拉开与乙车的距离，因此甲车速度大于乙车速度。' },
  { id: 17, chapterId: 'chapter1', blockId: 'block3', category: '速度常识估测', question: '下列物体的运动速度，最接近 5 m/s 的是：', options: ['人步行的速度', '中学生骑自行车的速度', '高速公路上的汽车速度', '飞行的民航客机'], answer: 1, explanation: '名师指点：5 m/s = 5 * 3.6 = 18 km/h，这正是中学生骑自行车在路上的平均速度。人步行约 1.1 m/s (4 km/h)；汽车约 30 m/s (108 km/h)；飞机可达 250 m/s。' },
  { id: 18, chapterId: 'chapter1', blockId: 'block3', category: '累积法测微小量', question: '为了测量一张纸的厚度，下列方法中最可行的是：', options: ['用刻度尺直接测量一张纸的厚度', '测出 100 张相同纸的总厚度，再除以 100', '测出 10 张纸的厚度，再除以 10', '用刻度尺测出课本除封面外的厚度，再除以总页数'], answer: 1, explanation: '名师指点：一张纸太薄，低于刻度尺分度值 (1mm)，无法直接测准。可以通过测量 100 张纸的总厚度，再求平均值，这种方法在物理上叫“累积法”或“以多测少”。' },
  { id: 19, chapterId: 'chapter1', blockId: 'block3', category: '特殊测量法', question: '为了测出细铜丝的直径，常采用的方法是：', options: ['用刻度尺直接测量细铜丝的直径', '把细铜丝紧密排绕在铅笔上，测出线圈总长度，除以圈数', '把铜丝剪成多段并排测总宽除以段数', '用分度值为 1 mm 的尺子多测几次求平均值'], answer: 1, explanation: '名师指点：铜丝直径微小。将其在铅笔上“紧密排绕”N圈，测量出这一段线圈的总宽度 L，则单根铜丝直径 d = L / N。这是累积法在测量微小直径时的经典应用。' },
  { id: 20, chapterId: 'chapter1', blockId: 'block3', category: '运动相对性分析', question: '卡车和联合收割机以同样快慢、向同一方向前进，在收割麦子的过程中，下列说法正确的是：', options: ['以收割机为参照物，卡车是运动的', '以卡车为参照物，收割机是静止的', '以地面为参照物，卡车和收割机都是静止的', '它们之间位置不断变化'], answer: 1, explanation: '名师指点：卡车和收割机速度大小和方向完全相同，这叫“相对静止”。所以以卡车为参照物，收割机位置没有发生改变，是静止的。' }
);

// 2. 声现象 (21 - 40)
questions.push(
  { id: 21, chapterId: 'chapter2', blockId: 'block1', category: '声音的产生', question: '关于声音的产生，下列说法中正确的是：', options: ['只要物体振动，我们就能听到声音', '振动停止，发声也停止', '不振动的物体也能发出声音', '声音是由物体的重力产生的'], answer: 1, explanation: '名师指点：振动停止，发声即停止。但是声音如果已经发出来了，它在介质中传播是不会立刻消失的。A错误是因为振动如果低于 20 Hz 或高于 20000 Hz，或者没有传声介质，人耳也听不见。' },
  { id: 22, chapterId: 'chapter2', blockId: 'block1', category: '传声介质', question: '岸上的人说话声，能把水中的鱼吓跑。这说明：', options: ['空气能传声，水不能传声', '水（液体）能够传声', '空气和水都不能传声', '鱼的听觉比人敏锐'], answer: 1, explanation: '名师指点：岸上的人说话，声音通过空气传到水面，再通过水（液体）传入鱼耳。这证明了液体能够传播声音。' },
  { id: 23, chapterId: 'chapter2', blockId: 'block1', category: '声速影响因素', question: '关于声速，下列说法中正确的是：', options: ['声音在真空中传播速度最大', '声速只由传播声音的介质种类决定', '同种介质中，温度越高，声速越慢', '声速与介质的种类和介质的温度都有关'], answer: 3, explanation: '名师指点：声速受介质种类和温度共同影响。通常在同种介质中，温度越高，声速越快（15℃空气声速 340m/s，30℃时大约 349m/s）。真空无法传声，速度为 0。' },
  { id: 24, chapterId: 'chapter2', blockId: 'block1', category: '回声测距', question: '人向山崖大喊一声，经过 1.2 s 听到回声，则人距离山崖大约：(15℃空气中)', options: ['408 m', '204 m', '340 m', '680 m'], answer: 1, explanation: '名师指点：回声是折返路径。单程时间 t = 1.2 / 2 = 0.6 s。距离 s = vt = 340 m/s * 0.6 s = 204 m。' },
  { id: 25, chapterId: 'chapter2', blockId: 'block1', category: '音调与响度', question: '收音机里传出“轻声细语”的歌声，这里的“轻声细语”是指声音的：', options: ['音调低', '响度小', '音色好', '频率低'], answer: 1, explanation: '名师指点：“轻”和“响”形容的是声音的强弱大小，对应物理学中的**响度**。而“高”和“低”形容声音尖细还是低沉，对应**音调**。' },
  { id: 26, chapterId: 'chapter2', blockId: 'block1', category: '音调影响因素', question: '女高音歌唱家和男低音歌唱家同台演出，这里的“高”和“低”是指声音的：', options: ['响度', '音调', '音色', '振幅'], answer: 1, explanation: '名师指点：女声一般声带振动快，频率高，音调高；男声声带振动慢，频率低，音调低。所以“高音”和“低音”指音调。' },
  { id: 27, chapterId: 'chapter2', blockId: 'block1', category: '音色判定', question: '“隔墙须辨语，听声便知人”主要是根据声音的哪个要素来辨别的？', options: ['音调', '响度', '音色', '频率'], answer: 2, explanation: '名师指点：不同的人声带结构和嗓音材料不同，发声的音色是独一无二的。听声识人、分辨不同乐器声音，全部靠音色。' },
  { id: 28, chapterId: 'chapter2', blockId: 'block1', category: '吉他音调改变', question: '弹吉他时，用手指去按压不同的弦，或者在同一根弦的不同位置按压，这主要是为了改变：', options: ['声音的响度', '声音的音色', '声音的音调', '声波的速度'], answer: 2, explanation: '名师指点：手指按压琴弦，改变了振动琴弦的有效长度。弦越短，振动越快，频率越高，音调就越高。这是为了改变音调。' },
  { id: 29, chapterId: 'chapter2', blockId: 'block1', category: '振幅与响度', question: '用力敲击鼓面，不仅能听到更大的声音，还能看到鼓面上的纸屑跳得更高。这说明：', options: ['振动频率越高，音调越高', '振幅越大，响度越大', '声音传播需要介质', '声音可以传递能量'], answer: 1, explanation: '名师指点：敲鼓力量越大，鼓面纸屑跳得越高，说明鼓面振动的幅度（振幅）越大。同时声音更响（响度大）。这证明了响度由振幅决定。' },
  { id: 30, chapterId: 'chapter2', blockId: 'block1', category: '次声波危害', question: '关于次声波，下列说法中错误的是：', options: ['次声波的频率低于 20 Hz', '次声波可以传播得很远，且不容易被阻挡', '部分地震、台风等自然灾害常伴有次声波', '人耳能听见次声波'], answer: 3, explanation: '名师指点：人耳能听到的范围是 20~20000 Hz。次声波低于 20 Hz，所以人耳**绝对听不见**。但它产生的共振可能会对人体内脏造成伤害。' },
  { id: 31, chapterId: 'chapter2', blockId: 'block1', category: '超声波应用', question: '下列实例中，利用声波传递“能量”的是：', options: ['利用声呐探测鱼群位置', '医生用听诊器为病人检查身体', '利用超声波震碎体内的胆结石', '敲击铁轨检查铁轨是否有裂缝'], answer: 2, explanation: '名师指点：超声波震碎结石是利用声波的高频振动去击碎固体，属于利用声波传递**能量**。另外三个实例都是利用声波获取信息（传递信息）。' },
  { id: 32, chapterId: 'chapter2', blockId: 'block1', category: '超声波防噪', question: '蝙蝠在夜间飞行时能躲避障碍物，这是利用了什么原理？', options: ['次声波定位', '回声定位（超声波）', '红外线夜视', '光的反射'], answer: 1, explanation: '名师指点：蝙蝠在飞行时会发出超声波，声波碰到障碍物折返，蝙蝠接收回声来确定障碍物位置和大小，这叫回声定位。' },
  { id: 33, chapterId: 'chapter2', blockId: 'block1', category: '控制噪声声源', question: '摩托车排气管上安装消声器，属于在哪个环节减弱噪声？', options: ['在声源处减弱', '在传播过程中减弱', '在人耳处减弱', '在反射环节减弱'], answer: 0, explanation: '名师指点：消声器是阻止噪声的产生，直接在发出声音的源头上采取措施，属于在声源处减弱。' },
  { id: 34, chapterId: 'chapter2', blockId: 'block1', category: '控制噪声传播', question: '高架路两旁安装高高的隔音防护墙，这属于在哪个环节减弱噪声？', options: ['声源处', '传播过程中', '人耳处', '吸收源'], answer: 1, explanation: '名师指点：隔音墙是阻断声音向四周传播，使噪声在空气传播时被阻挡、反射或吸收，属于在传播过程中减弱。' },
  { id: 35, chapterId: 'chapter2', blockId: 'block1', category: '防噪人耳处', question: '直升机驾驶员在工作时需要佩戴厚厚的防噪声耳罩，这属于在哪个环节减弱噪声？', options: ['声源处', '传播过程中', '人耳处', '发射源'], answer: 2, explanation: '名师指点：耳罩套在耳朵上，阻止声波进入外耳道，属于在人耳处减弱噪声。' },
  { id: 36, chapterId: 'chapter2', blockId: 'block1', category: '声音共鸣', question: '把两个音叉并排放在桌上，敲击其中一个，另一个也振动并发声。这说明：', options: ['声音传播不需要介质', '空气能够传播声音并传递能量', '两个音叉音色不同', '声速非常快'], answer: 1, explanation: '名师指点：空气把第一个音叉的振动能量传递给了第二个音叉，使其共鸣振动。这证明空气可以传声，同时声音具有能量。' },
  { id: 37, chapterId: 'chapter2', blockId: 'block1', category: '水银温度计声', question: '水里的海豚能通过声波进行交流，它们发出的声波有些超出了人耳听觉上限，这叫：', options: ['超声波', '次声波', '微波', '电磁波'], answer: 0, explanation: '名师指点：高于 20000 Hz 的声波叫做超声波，人耳听不见，但海豚、蝙蝠等动物可以使用。' },
  { id: 38, chapterId: 'chapter2', blockId: 'block1', category: '骨传导', question: '贝多芬耳聋后，用牙齿咬住木棒的一端，另一端顶在钢琴上听弹琴声，这是利用了：', options: ['空气传声', '骨传导（固体传声）', '双耳效应', '半规管共振'], answer: 1, explanation: '名师指点：琴声通过木棒、牙齿、颌骨传到听觉神经，这种不通过鼓膜、直接由头骨传导声音的方式叫骨传导，证明固体传声效果非常好。' },
  { id: 39, chapterId: 'chapter2', blockId: 'block1', category: '声呐', question: '现代军用潜艇常用“声呐”系统来寻找敌方船只。声呐利用的是：', options: ['超声波的反射', '次声波的衍射', '电磁波的折射', '可见光的直线传播'], answer: 0, explanation: '名师指点：声呐即声学定位仪器，通过向水中发射超声波并接收反射回声来测距和定位。' },
  { id: 40, chapterId: 'chapter2', blockId: 'block1', category: '防噪常识', question: '下列声音中，不属于噪声的是：', options: ['上课时，突然传来建筑工地刺耳的电钻声', '深夜睡觉时，邻居家传来的大分贝卡拉OK声', '音乐课上，同学们优美动听的合唱声', '图书馆里，小明大声喧哗说话的声音'], answer: 2, explanation: '名师指点：从环保角度看，凡是干扰人们正常休息、学习和工作的声音，都属于噪声。音乐课上的合唱是教学活动，不干扰他人，不属于噪声。' }
);

// 3. 物态变化 (41 - 60)
questions.push(
  { id: 41, chapterId: 'chapter3', blockId: 'block2', category: '温度计读数', question: '读取液体温度计时，下列视线方向正确的是：', options: ['仰视液面', '俯视液面', '视线与液柱上表面相平', '斜着看液柱'], answer: 2, explanation: '名师指点：读数时视线必须与温度计中液柱的弯月面凹面底部（或凸面顶部）相平。仰视读数会偏低，俯视读数会偏高。' },
  { id: 42, chapterId: 'chapter3', blockId: 'block2', category: '体温计特殊性', question: '体温计的测量范围通常是 35℃ ~ 42℃。关于体温计，下列说法正确的是：', options: ['测量前不需要甩', '读数时不能离开人体', '体温计可以离开人体读数，因为有缩口结构', '可以用沸水消毒'], answer: 2, explanation: '名师指点：体温计玻璃泡上方有一段非常细的缩口。离开人体时水银遇冷收缩，在缩口处断开，直管内的液面不回落，因此可以离开人体读数。使用前必须用力甩。由于量程最大 42℃，绝对不能用沸水消毒！' },
  { id: 43, chapterId: 'chapter3', blockId: 'block2', category: '物态变化熔化', question: '春暖花开，河里的冰雪化成水，这属于哪种物态变化？', options: ['熔化', '凝固', '汽化', '液化'], answer: 0, explanation: '名师指点：物质从固态（冰）变成液态（水）的过程叫熔化，熔化需要吸收热量。' },
  { id: 44, chapterId: 'chapter3', blockId: 'block2', category: '熔化图像晶体', question: '海波的熔化图像中，有一段与时间轴平行的水平线段。这段线段表示：', options: ['海波不吸收热量', '海波温度不断上升', '海波正在熔化，温度保持不变', '海波已经完全熔化'], answer: 2, explanation: '名师指点：海波是晶体，在熔化阶段持续吸热但温度维持在熔点 48℃ 不变，图像表现为水平直线。此时处于固液共存状态。' },
  { id: 45, chapterId: 'chapter3', blockId: 'block2', category: '物态变化凝固', question: '冬天，把水泼到室外，水结成了冰。这属于哪种物态变化？', options: ['熔化', '凝固', '液化', '凝华'], answer: 1, explanation: '名师指点：物质从液态（水）变成固态（冰）的过程叫做凝固。凝固是一个向外放出热量的过程。' },
  { id: 46, chapterId: 'chapter3', blockId: 'block2', category: '影响蒸发快慢', question: '农夫把收割的小麦摊开晒在阳光充足的地上，这是为了：', options: ['升高温度，减慢蒸发', '增大表面积和升高温度，加快蒸发', '增大表面积，减慢蒸发', '加快空气流动，减慢蒸发'], answer: 1, explanation: '名师指点：把小麦摊开增大了液体的表面积，晒在阳光下升高了液体的温度，这两项措施都加快了水分的蒸发（汽化）。' },
  { id: 47, chapterId: 'chapter3', blockId: 'block2', category: '沸腾特点', question: '关于水的沸腾实验，下列说法中正确的是：', options: ['水沸腾时，继续吸热，温度不断升高', '水沸腾时，停止吸热，沸腾依然继续', '水沸腾时，继续吸热，温度保持在沸点不变', '气压越高，水的沸点越低'], answer: 2, explanation: '名师指点：液体沸腾的两个必要条件：1. 达到沸点；2. 继续吸热。沸腾过程中虽然不断吸热，但温度维持在沸点保持不变。' },
  { id: 48, chapterId: 'chapter3', blockId: 'block2', category: '液化现象', question: '戴眼镜的人从寒冷的室外进入温暖的室内，镜片上会蒙上一层“水汽”。这是因为：', options: ['镜片上的冰熔化了', '室内的水蒸气遇冷液化成小水滴附着在镜片上', '室外的冷空气液化了', '镜片汽化了'], answer: 1, explanation: '名师指点：室内的热的水蒸气遇到冰冷的眼镜片，温度骤降，从气态直接液化成了液态的小水滴。液化放热。' },
  { id: 49, chapterId: 'chapter3', blockId: 'block2', category: '升华现象', question: '放在衣柜里的樟脑丸，时间久了会变小甚至消失。这属于什么物态变化？', options: ['汽化', '熔化', '升华', '凝华'], answer: 2, explanation: '名师指点：樟脑丸（固体）没有经过熔化成液体，直接变成了樟脑蒸气（气体）散发出去。这种固态直接变成气态的过程叫升华，升华吸热。' },
  { id: 50, chapterId: 'chapter3', blockId: 'block2', category: '凝华现象', question: '深秋的早晨，草叶上常会出现一层白霜。霜的形成属于哪种物态变化？', options: ['凝固', '液化', '凝华', '升华'], answer: 2, explanation: '名师指点：霜是空气中的水蒸气（气态）遇到温度极低的草叶，直接凝固成小冰晶（固态）附着在上面。这属于凝华现象，凝华放热。' },
  { id: 51, chapterId: 'chapter3', blockId: 'block2', category: '液化放热应用', question: '被 100℃ 的水蒸气烫伤往往比被 100℃ 的沸水烫伤更严重，这是因为：', options: ['水蒸气的温度比沸水高', '水蒸气在皮肤上液化时会释放大量的热量', '水蒸气的导热性更好', '水蒸气分子运动更快'], answer: 1, explanation: '名师指点：100℃ 的水蒸气接触皮肤会液化成 100℃ 的沸水，此液化过程需要向皮肤**释放出大量的液化热**，所以烫伤更深、更痛。' },
  { id: 52, chapterId: 'chapter3', blockId: 'block2', category: '人工降雨原理', question: '人工降雨时，飞机在云层中撒干冰（固态二氧化碳），干冰在空气中迅速变为气体，同时周围产生大量白雾并下雨。这里干冰发生的物态变化是：', options: ['熔化', '汽化', '升华', '液化'], answer: 2, explanation: '名师指点：干冰是固态二氧化碳，在常温下极易直接**升华**为气态二氧化碳，升华过程中要从周围吸收大量的热，使空气温度骤降，水蒸气遇冷液化成白雾。' },
  { id: 53, chapterId: 'chapter3', blockId: 'block2', category: '液体沸点与气压', question: '在西藏等高海拔地区，用普通锅煮饭容易夹生，这是因为高山上：', options: ['大气压低，水沸点高', '大气压高，水沸点低', '大气压低，水沸点低', '空气稀薄导致火不旺'], answer: 2, explanation: '名师指点：气压与高度关系：海拔越高，气压越低。沸点与气压关系：气压越低，沸点越低。在西藏由于沸点低于 100℃ (大约 85~90℃ 水就开了)，水温不够高，饭就煮不熟。' },
  { id: 54, chapterId: 'chapter3', blockId: 'block2', category: '电冰箱制冷', question: '电冰箱制冷系统内流动的物质（氟利昂/环保制冷剂）在冷冻室内发生什么物态变化吸热？', options: ['液化', '汽化', '凝固', '升华'], answer: 1, explanation: '名师指点：制冷剂在冰箱内部冷冻室的蒸发器中快速**汽化**（由液态变成气态），汽化吸热，带走冰箱内的热量；然后流到冰箱外部压缩机内被压缩**液化**（气态变液态），液化放热，将热量排到空气中。' },
  { id: 55, chapterId: 'chapter3', blockId: 'block2', category: '干湿温度计', question: '干湿温度计中，湿温度计包裹着湿棉纱。在相同环境下，湿温度计的读数通常比干温度计低，这是因为：', options: ['水凝固放热', '棉纱隔热', '湿棉纱上的水蒸发吸热', '酒精膨胀系数不同'], answer: 2, explanation: '名师指点：棉纱上的水分蒸发（汽化）时，会从温度计的玻璃泡上**吸收热量**，导致湿温度计的示数降低。周围空气越干燥，蒸发越快，两支温度计示数差值越大。' },
  { id: 56, chapterId: 'chapter3', blockId: 'block2', category: '冰熔化实验', question: '在冰的熔化实验中，烧杯里的冰全部熔化成水后，继续加热，水的温度：', options: ['保持在 0℃ 不变', '立刻快速下降', '持续上升直至沸腾', '先升高后降低'], answer: 2, explanation: '名师指点：冰是晶体，熔点是 0℃。全部熔化成水后，它不再受熔点限制，继续吸热，水的温度将持续上升，直到达到沸点 100℃ 开始沸腾。' },
  { id: 57, chapterId: 'chapter3', blockId: 'block2', category: '水沸腾条件', question: '将装有水的试管放入装有水的烧杯中，用酒精灯对烧杯加热，烧杯中的水沸腾后，试管中的水：', options: ['也会沸腾', '达到沸点，但不会沸腾', '不会达到沸点', '无法确定'], answer: 1, explanation: '名师指点：经典中考实验大坑题！烧杯水沸腾后温度保持在 100℃。试管中的水通过热传递达到 100℃（达到沸点），但由于试管内外温度相同，它**无法继续从烧杯吸收热量**，因此试管里的水无法沸腾！' },
  { id: 58, chapterId: 'chapter3', blockId: 'block2', category: '发烧物理退烧', question: '医生常用酒精棉球擦拭发高烧病人的额头和手心来为病人退烧，这是利用了：', options: ['酒精熔化吸热', '酒精汽化（蒸发）吸热', '酒精液化放热', '酒精升华吸热'], answer: 1, explanation: '名师指点：酒精极易挥发，擦在皮肤上会迅速发生汽化（蒸发）现象，蒸发是一个吸热的过程，能带走病人体表的大量热量，起到物理降温退烧的作用。' },
  { id: 59, chapterId: 'chapter3', blockId: 'block2', category: '雾凇形成', question: '寒冬的早晨，松花江畔会出现美丽的吉林“雾凇”。雾凇的形成属于什么物态变化？', options: ['液化', '凝华', '凝固', '升华'], answer: 1, explanation: '名师指点：雾凇俗称树挂。它是江面上蒸发出的温暖水蒸气（气态）遇到冷空气，直接在树枝上凝结成细小的冰晶（固态）。这属于凝华现象，凝华放热。' },
  { id: 60, chapterId: 'chapter3', blockId: 'block2', category: '水循环物态', question: '大自然中的雨、雪、雹、雾等天气现象，其本质都是水的物态变化。下列说法错误的是：', options: ['雨是水蒸气液化形成的', '雪是水蒸气凝华形成的', '雹是雨滴凝固形成的', '雾是水汽化形成的'], answer: 3, explanation: '名师指点：雾是悬浮在空气中的小水滴，属于气态水蒸气遇冷**液化**而成的，绝不是汽化（汽化产生的水蒸气是肉眼看不见的）。' }
);

// 4. 光现象 (61 - 80)
questions.push(
  { id: 61, chapterId: 'chapter4', blockId: 'block1', category: '光速', question: '光在真空中的传播速度大约是：', options: ['340 m/s', '3.6 × 10⁵ km/h', '3 × 10⁸ m/s', '3 × 10⁵ m/s'], answer: 2, explanation: '名师指点：光速是宇宙中最快的速度。真空中的光速约为 c = 3 × 10⁸ m/s = 3 × 10⁵ km/s（每秒30万公里）。340 m/s 是声音在空气中的速度。' },
  { id: 62, chapterId: 'chapter4', blockId: 'block1', category: '小孔成像像性', question: '关于小孔成像，下列说法正确的是：', options: ['成倒立的虚像', '成倒立的实像', '小孔必须是圆形的', '像的大小永远等于物体大小'], answer: 1, explanation: '名师指点：小孔成像由光的直线传播形成，成的是**倒立的实像**。像的形状与小孔的形状无关，只跟物体的形状有关。像的大小由物距和像距决定。' },
  { id: 63, chapterId: 'chapter4', blockId: 'block1', category: '直线传播应用', question: '下列现象中，由于光的直线传播形成的是：', options: ['平面镜中的像', '雨后天空的彩虹', '阳光下树木的影子', '通过放大镜看报纸'], answer: 2, explanation: '名师指点：影子的形成是因为光在同种均匀介质中沿直线传播，碰到不透明的树木后在后方留下了光线射不到的黑暗区域。' },
  { id: 64, chapterId: 'chapter4', blockId: 'block1', category: '光反射分类', question: '黑板有时候会“反光”让坐在边上的同学看不清字，这是因为黑板表面发生了：', options: ['镜面反射', '漫反射', '光的折射', '光的色散'], answer: 0, explanation: '名师指点：反光是因为黑板太光滑，光线射在黑板上发生了**镜面反射**，反射光线集中射向某一个方向，导致该方向的同学觉得刺眼且看不清字。平时我们能从各个方向看清黑板上的字，是因为发生了**漫反射**。' },
  { id: 65, chapterId: 'chapter4', blockId: 'block1', category: '反射角计算', question: '一束光斜射到平面镜上，入射光线与镜面的夹角是 40°，则反射角为：', options: ['40°', '50°', '90°', '80°'], answer: 1, explanation: '名师指点：入射角是光线与**法线**的夹角。法线垂直于镜面。所以入射角为 90° - 40° = 50°。根据反射定律，反射角等于入射角，所以反射角是 50°。' },
  { id: 66, chapterId: 'chapter4', blockId: 'block1', category: '反射规律探究', question: '在光的反射实验中，将纸板 F 绕法线 ON 向后折，在纸板 F 上将看不到反射光线。这说明：', options: ['反射光线不存在', '反射光线、入射光线和法线在同一平面内', '反射角不等于入射角', '光发生了漫反射'], answer: 1, explanation: '名师指点：折转纸板后看不到反射光，但反射光其实还在原处。这证明了反射光线、入射光线与法线**在同一平面内**（三线共面）。' },
  { id: 67, chapterId: 'chapter4', blockId: 'block1', category: '平面镜成像像性', question: '关于平面镜成像，下列说法正确的是：', options: ['物体离镜子越近，成的像越大', '平面镜成的像是倒立等大的实像', '平面镜成的像是正立等大的虚像', '如果镜前放一块挡光板，镜后将看不到像'], answer: 2, explanation: '名师指点：平面镜成像“正立、等大、虚像”。虚像是由反射光线的反向延长线相交而成的，不是实际光线会聚的，所以镜子后面放不放挡光板完全不影响成像。' },
  { id: 68, chapterId: 'chapter4', blockId: 'block1', category: '平面镜虚像距离', question: '小明站在穿衣镜前 2 m 处，他在镜中的像到他的距离是：', options: ['2 m', '4 m', '1 m', '0 m'], answer: 1, explanation: '名师指点：平面镜成像等距。小明到镜面 2 m，则镜中像到镜面也是 2 m。因此，小明与他镜中像之间的总距离是 2 m + 2 m = 4 m。' },
  { id: 69, chapterId: 'chapter4', blockId: 'block1', category: '平面镜高度变动', question: '一竖直挂在墙上的平面镜高 1 m，身高 1.6 m 的小明从镜前 3 m 处走近到 1 m 处，他在镜中像的高度：', options: ['变大', '变小', '始终为 1.6 m', '始终为 1 m'], answer: 2, explanation: '名师指点：中考经典陷阱！平面镜成像大小与物等大。小明身高 1.6 m，他的像高就永远是 1.6 m，与他距离镜子多远、以及镜子本身多高没有任何关系！' },
  { id: 70, chapterId: 'chapter4', blockId: 'block1', category: '水中倒影', question: '平静的湖面上可以看到岸边大树和白云的“倒影”。这本质上是：', options: ['光的折射现象', '光的直线传播', '光的反射（平面镜成像）', '光的色散'], answer: 2, explanation: '名师指点：平静的水面相当于一面“平面镜”。湖面上的倒影，属于光的反射现象，成的是大树和白云等大、对称的虚像。' },
  { id: 71, chapterId: 'chapter4', blockId: 'block1', category: '折射规律方向', question: '一束光从空气斜射入水中，折射光线：', options: ['向远离法线的方向偏折', '向法线方向偏折，折射角小于入射角', '不改变传播方向', '折射角大于入射角'], answer: 1, explanation: '名师指点：光从空气（较稀疏介质）斜射入水/玻璃（较致密介质）时，“空气中的角总是大的”。所以空气中入射角大，水中的折射角小（偏向法线）。' },
  { id: 72, chapterId: 'chapter4', blockId: 'block1', category: '折射虚像深度', question: '从水面上方看水中的鱼，看到的鱼的位置比实际位置：', options: ['深一些的实像', '浅一些的虚像', '深一些的虚像', '一样深'], answer: 1, explanation: '名师指点：鱼反射的光从水斜射入空气时，发生折射，折射角大于入射角。折射光线进入人眼，人逆着折射光线看去，看到的鱼是实际鱼位置上方的虚像（即看起来变浅了）。所以中考必记：“池水变浅、鱼变浅”都是光的折射形成的**虚像**。' },
  { id: 73, chapterId: 'chapter4', blockId: 'block1', category: '叉鱼技巧', question: '经验丰富的渔民用鱼叉叉水中的鱼时，为了能叉到鱼，鱼叉应当对准：', options: ['看到的鱼的下方', '看到的鱼的上方', '看到的鱼的身体', '任意位置'], answer: 0, explanation: '名师指点：由于折射使人看到的鱼是实际鱼位置**上方**的虚像。实际的鱼在虚像的下方，所以叉鱼时必须对准看到的鱼的**下方**叉去。' },
  { id: 74, chapterId: 'chapter4', blockId: 'block1', category: '折射现象判定', question: '下列属于光的“折射”现象的是：', options: ['手影游戏', '水杯中的铅笔好像在水面处折弯了', '皮影戏', '汽车后视镜看到后面的车'], answer: 1, explanation: '名师指点：水杯中的铅笔折弯是光从水进入空气在分界面发生偏折（折射）引起的。手影和皮影是光的直线传播；后视镜是光的反射（凸面镜）。' },
  { id: 75, chapterId: 'chapter4', blockId: 'block1', category: '三折射光线', question: '光线垂直射入水和玻璃的交界面时，入射角和折射角分别是：', options: ['90°, 90°', '0°, 0°', '90°, 0°', '0°, 90°'], answer: 1, explanation: '名师指点：垂直射入时，光线与法线重合，所以入射角为 0°。此时传播方向不改变，折射光线也与法线重合，折射角为 0°。' },
  { id: 76, chapterId: 'chapter4', blockId: 'block1', category: '光的色散本质', question: '雨后天空出现彩虹，这种光的色散现象本质上属于：', options: ['光的反射', '光的折射', '光的直线传播', '平面镜成像'], answer: 1, explanation: '名师指点：彩虹是阳光射入空气中的小水滴，经过折射发生色散，散成红橙黄绿蓝靛紫七色光。它本质上是光的折射。' },
  { id: 77, chapterId: 'chapter4', blockId: 'block1', category: '红外线性质', question: '电视机的红外线遥控器发出的红外线，下列说法正确的是：', options: ['红外线是一种红色的可见光', '红外线人眼看不见，它具有热效应', '红外线不能在真空中传播', '红外线速度比光速慢'], answer: 1, explanation: '名师指点：红外线和紫外线都是**不可见光**。红外线位于红光外侧，具有显著的**热效应**，可以在真空中传播，速度等于光速 $3\times 10^8\text{ m/s}$。' },
  { id: 78, chapterId: 'chapter4', blockId: 'block1', category: '紫外线应用', question: '下列设备中，利用“紫外线”工作的是：', options: ['电视遥控器', '夜视仪', '验钞机（检测荧光标记）', '红外取暖器'], answer: 2, explanation: '名师指点：紫外线具有荧光效应（能使荧光物质发光），所以常用于验钞机。红外线用于遥控器、夜视仪和取暖器（热效应）。' },
  { id: 79, chapterId: 'chapter4', blockId: 'block1', category: '光路可逆性', question: '小明通过平面镜看到了小华的眼睛，根据光路可逆性，小华：', options: ['一定看不见小明的眼睛', '一定也能看到小明的眼睛', '可能看不到小明的眼睛', '无法确定'], answer: 1, explanation: '名师指点：反射和折射中，光路都是**可逆的**。既然光能从小明的眼睛反射射入小华眼中，光也同样能循着原路从小华眼睛射入小明眼中。' },
  { id: 80, chapterId: 'chapter4', blockId: 'block1', category: '光的反射概念', question: '我们能从不同的方向看到教室里不发光的桌子，这是因为光在桌子上发生了：', options: ['镜面反射', '漫反射', '直线传播', '折射'], answer: 1, explanation: '名师指点：桌子表面粗糙不平，光线射上去反射向四面八方，这叫漫反射。漫反射**同样遵循光的反射定律**。' }
);

// 5. 透镜及其应用 (81 - 100)
questions.push(
  { id: 81, chapterId: 'chapter5', blockId: 'block1', category: '凸凹透镜作用', question: '凸透镜对光线有会聚作用。关于“会聚”的理解，正确的是：', options: ['通过凸透镜的光线一定会聚于焦点', '折射光线一定在主光轴上相交', '折射光线相对于入射光线更靠近主光轴', '通过凸透镜的所有光线都会聚于一点'], answer: 2, explanation: '名师指点：“会聚作用”是指折射光线相对于原传播方向，向**主光轴靠拢**。不一定真的在右侧相交（如物在焦点内发出的光折射后依然发散，只是比以前发散得慢了）。' },
  { id: 82, chapterId: 'chapter5', blockId: 'block1', category: '透镜特殊光线', question: '一束平行于主光轴的光线射向凸透镜，经折射后将：', options: ['平行射出', '通过焦点', '过二倍焦距点', '反向延长线过焦点'], answer: 1, explanation: '名师指点：凸透镜特殊光线之一：平行于主光轴的光线折射后**过焦点**。对于凹透镜，则是折射光线的反向延长线过焦点。' },
  { id: 83, chapterId: 'chapter5', blockId: 'block1', category: '透镜过光心光线', question: '无论是凸透镜还是凹透镜，有一条特殊光线通过它时传播方向不发生改变。这条光线是：', options: ['平行于主光轴的光线', '通过焦点的光线', '通过光心的光线', '斜射光线'], answer: 2, explanation: '名师指点：通过**光心 (O 点)** 的光线，其传播方向保持不变，折射后依旧沿直线传播。中考画图题必用。' },
  { id: 84, chapterId: 'chapter5', blockId: 'block1', category: '凸透镜测焦距', question: '利用太阳光测量凸透镜焦距时，小明把透镜正对太阳，在透镜另一侧移动白纸，直到白纸上出现一个最小最亮的光斑。此时：', options: ['光斑到透镜中心的距离就是焦距', '光斑到透镜中心的距离是两倍焦距', '纸上的光斑是凸透镜的虚像', '光斑是太阳的实像，光斑到纸的距离是焦距'], answer: 0, explanation: '名师指点：太阳光可以看作平行光。平行光经凸透镜折射后会聚于焦点。最小最亮的光斑就是焦点，它到凸透镜中心的距离即为焦距 f。' },
  { id: 85, chapterId: 'chapter5', blockId: 'block1', category: '凸透镜实像虚像', question: '关于实像和虚像，下列说法错误的是：', options: ['实像能呈现在光屏上，虚像不能', '实像是实际光线相交形成的，虚像不是', '实像都是倒立的，虚像都是正立的', '虚像也能用照相机拍照'], answer: 2, explanation: '名师指点：A、B、D均正确。在凸透镜成像中，实像全都是**倒立的**，虚像全都是**正立的**，C正确。但注意，平面镜成的虚像也是正立的。' },
  { id: 86, chapterId: 'chapter5', blockId: 'block1', category: '透镜成像u与2f', question: '物体到凸透镜的距离为 30 cm 时，在光屏上得到一个倒立、缩小的实像。则该凸透镜的焦距 f 可能为：', options: ['10 cm', '15 cm', '20 cm', '30 cm'], answer: 0, explanation: '名师指点：成倒立缩小实像条件：u > 2f。即 30 cm > 2f，解得 f < 15 cm。选项中只有 10 cm 符合 f < 15 cm。' },
  { id: 87, chapterId: 'chapter5', blockId: 'block1', category: '透镜成像f与2f', question: '将一物体放在焦距为 10 cm 的凸透镜前 16 cm 处，光屏上成：', options: ['倒立、缩小的实像', '倒立、放大的实像', '正立、放大的虚像', '不成像'], answer: 1, explanation: '名师指点：焦距 f = 10 cm，则 2f = 20 cm。物距 u = 16 cm。满足 f < u < 2f。根据规律，此时成**倒立、放大的实像**。' },
  { id: 88, chapterId: 'chapter5', blockId: 'block1', category: '透镜放大镜物距', question: '用凸透镜当放大镜观察邮票时，邮票到透镜的距离必须：', options: ['大于一倍焦距', '大于二倍焦距', '小于一倍焦距', '在一倍与二倍焦距之间'], answer: 2, explanation: '名师指点：放大镜的原理是成“正立放大的虚像”。物距必须小于一倍焦距 (u < f)。物和虚像在透镜同侧。' },
  { id: 89, chapterId: 'chapter5', blockId: 'block1', category: '照相机成像原理', question: '照相机的镜头相当于一个凸透镜，胶片相当于光屏。拍照时成的像是：', options: ['正立缩小的虚像', '倒立放大的实像', '倒立缩小的实像', '正立放大的虚像'], answer: 2, explanation: '名师指点：照相机的物距 u > 2f，在胶片上成**倒立、缩小、实像**。像距 f < v < 2f。' },
  { id: 90, chapterId: 'chapter5', blockId: 'block1', category: '投影仪成像', question: '多媒体教室里的投影仪，其镜头成像原理是物体在凸透镜：', options: ['一倍焦距以内', '一倍至二倍焦距之间', '二倍焦距点上', '二倍焦距以外'], answer: 1, explanation: '名师指点：投影仪要在屏幕（光屏）上得到倒立、放大的实像。因此投影片（物）必须放在镜头的一倍到二倍焦距之间 (f < u < 2f)。' },
  { id: 91, chapterId: 'chapter5', blockId: 'block1', category: '幻灯机反向', question: '使用幻灯机放映幻灯片时，为了在屏幕上看到正立的像，幻灯片应当：', options: ['正着插在架上', '倒着插在架上', '侧着插在架上', '正面朝后插'], answer: 1, explanation: '名师指点：幻灯机/投影仪镜头成的是**倒立**放大的实像。像相对于物上下颠倒、左右相反。为了让屏幕上的像是正的，投影片必须**倒着插**在机器里。' },
  { id: 92, chapterId: 'chapter5', blockId: 'block1', category: '物近像远像变大', question: '做凸透镜成像实验时，把蜡烛向凸透镜靠近一些（物距仍大于焦距），为了在光屏上重新得到清晰的像，光屏应当：', options: ['靠近透镜，像变大', '远离透镜，像变小', '远离透镜，像变大', '保持原位不动'], answer: 2, explanation: '名师指点：中考超级大招口诀：“物近像远像变大”。蜡烛靠近透镜（物近），光屏必须远离透镜（像远），屏上的像会变大（像变大）。反之，“物远像近像变小”。' },
  { id: 93, chapterId: 'chapter5', blockId: 'block1', category: '照相机变全身', question: '小明用照相机拍半身照，想改成拍全身照，他应当：', options: ['靠近人，同时拉长镜头', '远离人，同时拉长镜头', '靠近人，同时缩短镜头', '远离人，同时缩短镜头'], answer: 3, explanation: '名师指点：拍全身照意味着像要变小（像变小）。根据“物远像近像变小”，像变小需要物距变大（相机远离人），同时像距变小（镜头缩短靠近胶片）。选D。' },
  { id: 94, chapterId: 'chapter5', blockId: 'block1', category: '遮挡凸透镜', question: '在探究凸透镜成像规律时，用不透明的硬纸板遮住凸透镜的下半部分，则光屏上的像：', options: ['只剩上半部分', '只剩下半部分', '依然完整，但亮度变暗', '完全消失'], answer: 2, explanation: '名师指点：经典常考题！遮住下半部分，上半部分透镜依然在折射会聚光线。所以光屏上**依然能成完整的像**。只是通过的光线变少了，像的**亮度会变暗**。' },
  { id: 95, chapterId: 'chapter5', blockId: 'block1', category: '近视眼成因', question: '近视眼是因为晶状体折光能力太强，看远处的物体时，像呈在视网膜的：', options: ['前方', '后方', '正上方', '盲点上'], answer: 0, explanation: '名师指点：近视眼“折光太强，会聚过早”，所以像呈在视网膜的**前方**。需要用能发散光线的**凹透镜**来矫正。' },
  { id: 96, chapterId: 'chapter5', blockId: 'block1', category: '远视眼矫正', question: '老花眼（远视眼）患者看近处的物体时，像呈在视网膜的：', options: ['前方，配戴凸透镜', '后方，配戴凸透镜', '前方，配戴凹透镜', '后方，配戴凹透镜'], answer: 1, explanation: '名师指点：远视眼“折光太弱，会聚太迟”，像呈在视网膜**后方**。配戴有会聚作用的**凸透镜**，可以使光线提前会聚在视网膜上。' },
  { id: 97, chapterId: 'chapter5', blockId: 'block1', category: '水透镜实验', question: '向一个圆柱形水杯中注满水，把一根铅笔放在水杯后面紧贴杯壁，透过水杯看铅笔，会看到铅笔：', options: ['变细了', '变粗了（相当于放大镜）', '左右反向了', '没有变化'], answer: 1, explanation: '名师指点：装满水的圆柱形水杯，横截面中间厚边缘薄，相当于一个**凸透镜**。当铅笔紧贴杯壁时，物距小于一倍焦距，起放大镜作用，所以看到铅笔变粗了。' },
  { id: 98, chapterId: 'chapter5', blockId: 'block1', category: '显微镜物镜', question: '显微镜的物镜和目镜都是凸透镜。物镜成像原理相当于：', options: ['照相机', '投影仪', '放大镜', '望远镜'], answer: 1, explanation: '名师指点：显微镜物镜靠近微小物体，成倒立、放大的实像（相当于投影仪），将微小结构初次放大；目镜成正立、放大的虚像（相当于放大镜），进行二次放大。' },
  { id: 99, chapterId: 'chapter5', blockId: 'block1', category: '开普勒望远镜', question: '开普勒太空望远镜的物镜成像原理相当于：', options: ['照相机', '投影仪', '放大镜', '幻灯机'], answer: 0, explanation: '名师指点：望远镜物镜看极遥远的星球，物距远大于 2f，在焦点附近成倒立、缩小的实像（相当于照相机）。目镜再把这个实像放大（放大镜原理）。' },
  { id: 100, chapterId: 'chapter5', blockId: 'block1', category: '凸透镜成像临界', question: '在凸透镜成像实验中，物距 u 减小到刚好等于焦距 f 时，光屏上：', options: ['得到最大的实像', '得到最大的虚像', '无法呈现像，因为折射光线平行', '成等大的实像'], answer: 2, explanation: '名师指点：u = f 是凸透镜实像和虚像的分界点。此时从光源发出的光经折射后平行射出，无法相交会聚成像。' }
);

// 6. 质量与密度 (101 - 120)
questions.push(
  { id: 101, chapterId: 'chapter6', blockId: 'block3', category: '质量属性', question: '将 1 kg 的铁块打造成铁器，它的质量：', options: ['变大', '变小', '不变', '无法确定'], answer: 2, explanation: '名师指点：质量是物体的属性，不随物体的形状改变而改变。' },
  { id: 102, chapterId: 'chapter6', blockId: 'block3', category: '天平调节游码', question: '用天平称质量时，指针偏向分度盘左侧，应当：', options: ['向右移动游码或增加砝码', '向左调节平衡螺母', '向右调节平衡螺母', '减少右盘砝码'], answer: 0, explanation: '名师指点：称量过程中**不能**调节平衡螺母。指针偏左，说明左盘物体偏重，需要向右盘增添小砝码或向右移动游码。' },
  { id: 103, chapterId: 'chapter6', blockId: 'block3', category: '密度单位换算', question: '水的密度是 1.0 × 10³ kg/m³，它表示：', options: ['1 m³的水质量为 1000 g', '1 cm³的水质量为 1000 kg', '1 m³的水质量为 1000 kg', '1 kg 的水体积为 1 m³'], answer: 2, explanation: '名师指点：密度的物理意义是单位体积某种物质的质量。1.0 × 10³ kg/m³ 表示 1 立方米水的质量是 1000 kg（即 1 吨）。' },
  { id: 104, chapterId: 'chapter6', blockId: 'block3', category: '密度概念特性', question: '把一根钢管锯掉一半，剩下半根钢管的：', options: ['质量减半，密度减半', '质量减半，密度不变', '质量不变，密度不变', '体积减半，密度加倍'], answer: 1, explanation: '名师指点：钢管锯掉一半，物质总量少了一半（质量减半，体积减半）。但密度是钢这种物质的特性，与钢管的大小无关，密度保持不变。' },
  { id: 105, chapterId: 'chapter6', blockId: 'block3', category: '天平螺母调节', question: '调节天平横梁平衡时，发现指针偏向分度盘中线的右侧，此时应当：', options: ['向左移动游码', '向左调节平衡螺母', '向右调节平衡螺母', '往右盘加砝码'], answer: 1, explanation: '名师指点：这是在“称量前”调节平衡。游码必须归零。指针偏右，说明右侧偏重，螺母应往相反方向调，即向左调节平衡螺母（两端螺母都向左）。' },
  { id: 106, chapterId: 'chapter6', blockId: 'block3', category: '天平读数', question: '天平平衡时，右盘砝码为 50g、20g、5g 各一个，游码示数如图为 2.4g，则物体的质量为：', options: ['75 g', '77.4 g', '72.4 g', '75.4 g'], answer: 1, explanation: '名师指点：读数公式：物体质量 = 砝码总质量 + 游码刻度值。砝码总重 50+20+5=75g。加游码 2.4g，得 77.4g。' },
  { id: 107, chapterId: 'chapter6', blockId: 'block3', category: '质量特殊性', question: '一壶冷水烧开，水热胀冷缩使体积变大，则在此过程中水的质量：', options: ['变大', '变小', '不变', '先变大后变小'], answer: 2, explanation: '名师指点：水受热体积变大（水密度会变小），但壶中水所含物质的多少没有改变，所以水的质量保持不变。' },
  { id: 108, chapterId: 'chapter6', blockId: 'block3', category: '密度计算m-V', question: '某金属块质量为 54 g，体积为 20 cm³，则该金属的密度为：', options: ['2.7 × 10³ kg/m³', '2.7 g/cm³', '两者都是', '0.37 g/cm³'], answer: 2, explanation: '名师指点：密度 ρ = m/V = 54g / 20cm³ = 2.7 g/cm³。换算成国际单位为 2.7 × 10³ kg/m³。所以A和B的数值都对。选C。' },
  { id: 109, chapterId: 'chapter6', blockId: 'block3', category: '天平潮湿物', question: '用天平测量潮湿物体或化学药品的质量时，规范的操作是：', options: ['直接放在托盘上称量', '在两个托盘上各垫一张相同的干净纸张或用烧杯盛装', '只能估测，不能使用天平', '在右盘放纸，左盘直接放'], answer: 1, explanation: '名师指点：潮湿物体和化学药品具有腐蚀性或易粘连，绝对不能直接放在托盘上。必须使用相同的纸张或玻璃器皿（如烧杯）承载称量。' },
  { id: 110, chapterId: 'chapter6', blockId: 'block3', category: '密度的应用', question: '航空航天器选用钛合金和碳纤维材料制造，这主要是因为这些材料具有：', options: ['硬度大，密度大', '硬度大，密度小', '熔点低，密度小', '导电性好'], answer: 1, explanation: '名师指点：飞机和飞船要求在保证结构强度的前提下，质量尽可能轻。由 m = ρ * V 可知，相同体积下，选用密度小的材料可以大大减轻质量。' },
  { id: 111, chapterId: 'chapter6', blockId: 'block3', category: '密度比例题', question: '甲、乙两个同种物质组成的实心物体，体积之比为 2:1，则它们的密度之比为：', options: ['2:1', '1:2', '1:1', '4:1'], answer: 2, explanation: '名师指点：同种物质在相同状态下，密度是恒定不变的特性。不管它们的体积之比是多少，密度之比永远是 1:1。中考送分陷阱题！' },
  { id: 112, chapterId: 'chapter6', blockId: 'block3', category: '密度算质量', question: '一辆运油车装了 10 m³ 的汽油，汽油密度为 0.71 × 10³ kg/m³。这车汽油的质量是：', options: ['7.1 kg', '7100 kg', '71 kg', '0.71 t'], answer: 1, explanation: '名师指点：由 ρ = m/V 变形得 m = ρ * V = 0.71 × 10³ kg/m³ * 10 m³ = 7100 kg (7.1 吨)。' },
  { id: 113, chapterId: 'chapter6', blockId: 'block3', category: '密度瓶计算', question: '一个瓶子最多能装 1 kg 的水，用这个瓶子去装酒精，最多能装多少 kg？(酒精密度为 0.8 × 10³ kg/m³)', options: ['1 kg', '0.8 kg', '1.25 kg', '0.6 kg'], answer: 1, explanation: '名师指点：最多能装水的体积就是瓶子的容积 V = m_水 / ρ_水 = 1 kg / 1000 kg/m³ = 0.001 m³。装酒精的最大质量 m_酒 = ρ_酒 * V = 800 kg/m³ * 0.001 m³ = 0.8 kg。' },
  { id: 114, chapterId: 'chapter6', blockId: 'block3', category: '冰化成水密度', question: '一块冰熔化成水，在此过程中，它的：', options: ['质量不变，体积变小，密度变大', '质量变小，体积变大，密度变小', '质量不变，体积变大，密度变小', '全部不变'], answer: 0, explanation: '名师指点：冰的密度是 0.9 × 10³ kg/m³，水的密度是 1.0 × 10³ kg/m³。冰熔化成水，质量 m 不变，密度 ρ 变大。由 V = m/ρ 可知，体积 V 会变小。这就是冰熔化体积收缩、水结冰体积膨胀的物理原因。' },
  { id: 115, chapterId: 'chapter6', blockId: 'block3', category: '量筒读数误差', question: '用量筒测水体积，读数时如果仰视液面，读得的数据比真实值：', options: ['偏大', '偏小', '一样大', '无法确定'], answer: 1, explanation: '名师指点：仰视时，视线斜向上穿过刻度线，读出的数值会在真实液面的下方，所以读数**偏小**。俯视读数则会**偏大**。中考顺口溜：“仰小俯大”。' },
  { id: 116, chapterId: 'chapter6', blockId: 'block3', category: '水异常膨胀', question: '水在 4℃ 时密度最大。当水温从 0℃ 上升到 4℃ 的过程中，水的体积：', options: ['膨胀变大', '收缩变小', '保持不变', '先变大后变小'], answer: 1, explanation: '名师指点：水具有“反常膨胀”特性：在 0℃~4℃ 之间热缩冷胀。温度升高体积反而缩小。超过 4℃ 以后才是正常的热胀冷缩。' },
  { id: 117, chapterId: 'chapter6', blockId: 'block3', category: '天平砝码磨损', question: '如果天平的砝码由于磨损导致自身质量变轻，用它去测量物体质量，读出的数值将比真实值：', options: ['偏小', '偏大', '没有影响', '无法确定'], answer: 1, explanation: '名师指点：高频思考题。砝码磨损变轻（比如标有50g的砝码实际只有48g）。要平衡左盘50g的物体，需要放入这只砝码外加其他砝码，读数时按标记算，读出的结果就是52g，所以测量结果**偏大**。' },
  { id: 118, chapterId: 'chapter6', blockId: 'block3', category: '密度计算体积', question: '某人测得一金属块质量为 156 g，查表可知该金属密度为 7.8 g/cm³，则该金属块体积为：', options: ['20 cm³', '1216 cm³', '0.05 cm³', '20 m³'], answer: 0, explanation: '名师指点：由密度公式变形得：V = m / ρ = 156 g / 7.8 g/cm³ = 20 cm³。' },
  { id: 119, chapterId: 'chapter6', blockId: 'block3', category: '盐水密度实验', question: '测盐水密度实验中，最规范的步骤顺序是：', options: ['①测空烧杯重，②倒入盐水测总重，③倒量筒测体积', '①测烧杯盐水总重，②倒一部分进量筒测体积，③测剩余烧杯盐水重', '①测空烧杯重，②量筒测盐水体积，③倒烧杯测总重', '无所谓'], answer: 1, explanation: '名师指点：如果先测空杯再倒盐水，烧杯壁上会有盐水残留倒不干净，导致体积测量偏小，产生较大误差。先测总重，再倒出一部分测体积，称量剩余重力，可以完全消除残留水滴的误差。这叫“剩余法”。' },
  { id: 120, chapterId: 'chapter6', blockId: 'block3', category: '气体密度性质', question: '把一个装满氧气的钢瓶里的氧气用掉一半，剩下的氧气：', options: ['质量减半，密度不变', '质量减半，体积减半，密度不变', '质量减半，体积不变，密度减半', '全部减半'], answer: 2, explanation: '名师指点：气体具有膨胀性，钢瓶体积不变，剩余氧气依然充满整个钢瓶，所以体积 V 不变。由于消耗了一半氧气，质量 m 减半。根据 rho = m/V，密度 rho 减半。这是气体与固体、液体的最大区别！' }
);

// 7. 力 (121 - 140)
questions.push(
  { id: 121, chapterId: 'chapter7', blockId: 'block4', category: '力定义', question: '关于力，下列说法中正确的是：', options: ['单独一个物体也能产生力', '必须相互接触的物体间才能产生力', '不接触的物体间也能产生力的作用', '施力物体同时不可能是受力物体'], answer: 2, explanation: '名师指点：力是物体对物体的作用，单独一个物体不能产生力。磁铁吸引铁钉、重力下落，它们不接触也能产生力，所以接触不是力的必要条件。力的作用是相互的，施力物体同时也是受力物体。' },
  { id: 122, chapterId: 'chapter7', blockId: 'block4', category: '作用力反作用力', question: '人站在地面上，人对地面的压力和地面对人的支持力，它们：', options: ['是一对平衡力', '大小相等，方向相反，是一对相互作用力', '压力大于支持力', '支持力大于压力'], answer: 1, explanation: '名师指点：压力是人作用在地面上（受力物是地面），支持力是地面作用在人上（受力物是人）。两个力作用在不同物体上，大小相等方向相反，属于一对相互作用力。' },
  { id: 123, chapterId: 'chapter7', blockId: 'block4', category: '力的作用效果', question: '下列现象中，说明力可以改变物体“运动状态”的是：', options: ['用力拉弹簧，弹簧被拉长', '人坐沙发，沙发凹陷', '汽车刹车，车速变慢', '用力捏橡皮泥，橡皮泥变形'], answer: 2, explanation: '名师指点：运动状态改变包括：速度大小改变（如刹车变慢、加速）和运动方向改变。拉长弹簧、沙发凹陷、橡皮泥变形都属于形状改变（形变）。' },
  { id: 124, chapterId: 'chapter7', blockId: 'block4', category: '力三要素', question: '推门时，推离门轴较远的门把手比推离门轴近的地方更容易把门推开。这说明力的作用效果与：', options: ['力的大小有关', '力的方向有关', '力的作用点有关', '施力物体有关'], answer: 2, explanation: '名师指点：推门的位置不同，就是力的**作用点**不同，从而导致了推门的难易程度（作用效果）不同。' },
  { id: 125, chapterId: 'chapter7', blockId: 'block4', category: '力的单位', question: '在物理学中，力的国际单位是：', options: ['千克 (kg)', '牛顿 (N)', '帕斯卡 (Pa)', '焦耳 (J)'], answer: 1, explanation: '名师指点：力的单位是牛顿，简称牛，符号是 N。拿着两个鸡蛋的力大约是 1 N。' },
  { id: 126, chapterId: 'chapter7', blockId: 'block4', category: '重力概念成因', question: '关于重力，下列说法中正确的是：', options: ['重力就是地球对物体的吸引力', '重力方向永远垂直于接触面向下', '重力的施力物体是地球', '空中上升的氢气球不受重力'], answer: 2, explanation: '名师指点：重力是由于地球吸引而产生的，但不能说重力就是吸引力（重力只是吸引力的一个分力）。重力方向永远是竖直向下。地球上的一切物体（包括气球）都受重力。施力物体是地球。' },
  { id: 127, chapterId: 'chapter7', blockId: 'block4', category: '重力与质量关系', question: '质量为 0.5 kg 的小球，受到的重力为：(g = 10 N/kg)', options: ['5 N', '0.5 N', '50 N', '0.05 N'], answer: 0, explanation: '名师指点：利用重力计算公式：G = mg = 0.5 kg * 10 N/kg = 5 N。注意单位必须用 kg。' },
  { id: 128, chapterId: 'chapter7', blockId: 'block4', category: '弹力性质', question: '关于弹力，下列说法正确的是：', options: ['只要物体发生形变，就一定会产生弹力', '必须发生弹性形变的物体才会产生弹力', '弹簧产生的拉力不属于弹力', '塑料袋被捏扁产生的力是弹力'], answer: 1, explanation: '名师指点：弹力产生的条件是物体发生**弹性形变**（撤去外力后能恢复原状）。橡皮泥、塑料袋被捏扁不能自动恢复，发生的不是弹性形变，不产生弹力。' },
  { id: 129, chapterId: 'chapter7', blockId: 'block4', category: '测力计使用', question: '使用弹簧测力计测量力的大小时，下列步骤中错误的是：', options: ['使用前指针要对准零刻度线，并拉动挂钩几次防止卡壳', '读数时视线要与刻度面板垂直', '测力计时可以超过测力计的最大量程', '测量时弹簧的轴线方向要与受力方向一致'], answer: 2, explanation: '名师指点：弹簧测力计测量时绝不能超过它的**最大量程**，否则会损坏弹簧，且读数不准。' },
  { id: 130, chapterId: 'chapter7', blockId: 'block4', category: '力的图示方向', question: '一个木块静止在斜面上，它受到的重力方向为：', options: ['沿斜面向下', '垂直斜面向下', '竖直向下', '垂直水平面向左'], answer: 2, explanation: '名师指点：不管物体在斜面上、空中还是运动中，重力的方向在任何情况下都是**竖直向下**（指向地球中心），绝非垂直斜面向下！' },
  { id: 131, chapterId: 'chapter7', blockId: 'block4', category: '重力常数g意义', question: '关于 g = 9.8 N/kg 的物理意义，下列说法正确的是：', options: ['质量为 1 kg 的物体受到的重力是 9.8 N', '1 kg = 9.8 N', '重力是质量的 9.8 倍', '质量为 9.8 kg 的物体受到的重力是 1 N'], answer: 0, explanation: '名师指点：g = 9.8 N/kg 表示质量为 1 kg 的物体在地球表面受到的重力是 9.8 N。它是一个比例常数，kg 和 N 是不同的物理量单位，绝不能写成“1 kg = 9.8 N”。' },
  { id: 132, chapterId: 'chapter7', blockId: 'block4', category: '力的作用相互', question: '滑冰运动员用力推墙，自己反而向后退。这说明了：', options: ['力能改变物体的运动状态', '物体间力的作用是相互的', '运动员受到的推力比墙大', '人推墙的力先产生'], answer: 1, explanation: '名师指点：运动员推墙，墙受到力；同时墙也给运动员施加了反作用力，导致运动员向后退。证明力的作用是相互的，相互作用力是**同时产生、大小相等**的。' },
  { id: 133, chapterId: 'chapter7', blockId: 'block4', category: '重力与重心', question: '关于物体的重心，下列说法正确的是：', options: ['重心必须在物体内部', '形状规则的物体，重心一定在其几何中心', '重力在物体上的等效作用点叫重心', '重心是没有重力的点'], answer: 2, explanation: '名师指点：重心是重力的等效作用点。重心不一定在物体内部，比如圆环、空心杯子的重心在空气中。只有“形状规则且质量分布均匀”的物体，重心才在几何中心上。' },
  { id: 134, chapterId: 'chapter7', blockId: 'block4', category: '弹簧伸长量', question: '弹簧测力计的工作原理是：在弹性限度内，弹簧的：', options: ['长度与拉力成正比', '伸长量与拉力成正比', '长度与拉力成反比', '伸长量与拉力平方成正比'], answer: 1, explanation: '名师指点：是在弹性限度内，弹簧的**伸长量（即变化量 ΔL = L - L₀）**与拉力成正比，而不是弹簧的总长度成正比。' },
  { id: 135, chapterId: 'chapter7', blockId: 'block4', category: '重力大小因素', question: '下列因素中，会影响物体所受重力大小的是：', options: ['物体的形状', '物体的质量', '物体运动的速度', '物体所处的海拔高度'], answer: 1, explanation: '名师指点：根据 G = mg，重力大小直接由物体质量 m 决定。海拔高度有微小影响（g会变小），但最决定性的、课本公式体现的因素是**质量**。' },
  { id: 136, chapterId: 'chapter7', blockId: 'block4', category: '相互作用力大小', question: '鸡蛋碰石头，鸡蛋碎了而石头完好无损。在此过程中，鸡蛋对石头的力：', options: ['小于石头对鸡蛋的力', '大于石头对鸡蛋的力', '等于石头对鸡蛋的力', '无法比较'], answer: 2, explanation: '名师指点：中考高频易错题！鸡蛋碰石头是相互作用力。根据牛顿第三定律，鸡蛋给石头多大的力，石头就给鸡蛋多大的力，两个力**绝对相等**！鸡蛋碎了是因为鸡蛋的硬度承受不住这个力，并不是它受力更大。' },
  { id: 137, chapterId: 'chapter7', blockId: 'block4', category: '天平重力', question: '用托盘天平测量物体的质量，在月球上测量和在地球上测量，得到的结果：', options: ['一样大', '地球上大', '月球上大', '无法测量'], answer: 0, explanation: '名师指点：天平工作利用的是等臂杠杆平衡。虽然月球重力加速度 g 变小，但两侧物体受月球引力同时等比例变小，天平横梁依旧能在物块与砝码质量相等时平衡，所以测量质量结果是一样的。' },
  { id: 138, chapterId: 'chapter7', blockId: 'block4', category: '力的示意图', question: '画力的示意图时，线段的起点通常表示力的：', options: ['大小', '方向', '作用点', '施力物体'], answer: 2, explanation: '名师指点：力的示意图用一根带箭头的线段表示力。线段的起点（或终点）表示力的**作用点**，箭头的指向表示力的**方向**，线段的长短大致表示力的**大小**。' },
  { id: 139, chapterId: 'chapter7', blockId: 'block4', category: '力的合成基础', question: '同一直线上两个方向相反的力，大小分别为 10 N 和 6 N，则它们的合力大小和方向为：', options: ['16 N，同大力方向', '4 N，同小力方向', '4 N，同大力方向', '16 N，同小力方向'], answer: 2, explanation: '名师指点：同一直线上方向相反的两个力合成，合力大小等于两力之差：F_合 = F₁ - F₂ = 10 N - 6 N = 4 N，方向与较大的那个力相同。' },
  { id: 140, chapterId: 'chapter7', blockId: 'block4', category: '质量重力辨析', question: '关于质量和重力，下列说法中错误的是：', options: ['质量是物体所含物质的多少，重力是地球吸引产生的力', '质量的单位是 kg，重力的单位是 N', '质量不随位置改变，重力随位置改变而改变', '质量就是重力，两者只是称呼不同'], answer: 3, explanation: '名师指点：质量和重力是两个完全不同的物理量。质量是属性，重力是力；它们的定义、单位、测量工具都完全不同，绝对不能混为一谈。' }
);

// 8. 运动和力 (141 - 160)
questions.push(
  { id: 141, chapterId: 'chapter8', blockId: 'block4', category: '阻力对运动影响', question: '在伽利略阻力对物体运动影响的实验中，小车在毛巾、棉布、木板表面上运动，下列说法正确的是：', options: ['小车在毛巾上受到的阻力最小，运动最远', '小车在木板上受到的阻力最小，运动最远', '小车每次可以从斜面的不同高度下滑', '实验证明了力是维持物体运动的原因'], answer: 1, explanation: '名师指点：木板最光滑，阻力最小，小车减速最慢，运动最远。实验中每次必须让小车从斜面**相同高度**静止下滑（为了保证下滑到水平面时速度相同，采用控制变量法）。' },
  { id: 142, chapterId: 'chapter8', blockId: 'block4', category: '牛顿第一定律推论', question: '牛顿第一定律是建立在：', options: ['日常生活经验基础上的', '科学家直接的实验测量结果上的', '实验研究和科学推理相结合的基础上的', '完全凭空想象出来的'], answer: 2, explanation: '名师指点：牛顿第一定律中“不受力作用”在现实中无法完全实现（现实中摩擦阻力无处不在）。所以牛第一定律不是实验直接测出来的，而是由伽利略等人的实验为基础，进一步**科学推理**得出的。' },
  { id: 143, chapterId: 'chapter8', blockId: 'block4', category: '维持运动力', question: '踢出去的足球在草地上越滚越慢，最后停下来。这说明：', options: ['足球不受力的作用', '力是维持足球运动的原因', '足球的惯性消失了', '草地的摩擦力改变了足球的运动状态'], answer: 3, explanation: '名师指点：足球越滚越慢是运动状态改变，是因为受到了阻力（草地摩擦力）。这再次证明：力**不是**维持运动的原因，而是**改变运动状态**的原因。' },
  { id: 144, chapterId: 'chapter8', blockId: 'block4', category: '惯性物理事实', question: '关于惯性，下列物理现象分析正确的是：', options: ['司机系安全带是为了增大人体的惯性', '跳远运动员助跑是为了增大惯性，跳得更远', '开车的司机要限速行驶，是因为速度越快，惯性越大', '公交车急刹车时，站立的乘客由于惯性身体会向前倾'], answer: 3, explanation: '名师指点：惯性大小只与物体的**质量**有关。安全带、助跑、限速都不能改变人的惯性大小。助跑跳远是利用惯性保持原有的水平速度，在空中飞得更远。刹车前倾是由于人脚部随车停下，而上半身具有惯性要保持前行状态。' },
  { id: 145, chapterId: 'chapter8', blockId: 'block4', category: '惯性存在性', question: '下列物体中，没有惯性的是：', options: ['太空中悬浮的飞船', '高速公路上飞驰的赛车', '操场上静止不动的铅球', '一切物体都有惯性'], answer: 3, explanation: '名师指点：惯性是物体的**固有属性**。一切物体在任何时候、任何状态下（静止、运动、受力、失重）都具有惯性。' },
  { id: 146, chapterId: 'chapter8', blockId: 'block4', category: '二力平衡受力物', question: '下列各对力中，属于平衡力的是：', options: ['苹果受到的重力和苹果对树枝的拉力', '汽车受到的牵引力和汽车受到的阻力（汽车匀速直线行驶）', '桌子受到的重力和桌面对书的支持力', '人推墙的力和墙推人的力'], answer: 1, explanation: '名师指点：二力平衡条件第一条是“同体”（作用在同一个物体上）。A中重力作用在苹果，拉力作用在树枝，非同体；C中重力在桌子，支持力在书，非同体；D是一对相互作用力，作用在不同物体。只有B，牵引力和阻力都作用在汽车上，且匀速，是一对平衡力。' },
  { id: 147, chapterId: 'chapter8', blockId: 'block4', category: '二力平衡特征', question: '放在水平桌面上的物理课本，处于静止状态。课本受到的重力和桌面对它的支持力，它们：', options: ['是一对相互作用力', '大小相等，方向相同', '是一对平衡力', '课本的重力大于桌面的支持力'], answer: 2, explanation: '名师指点：课本静止，受重力（向下）和支持力（向上）。这两个力都作用在课本上（同体），大小相等，方向相反，在同一直线上。它们是一对平衡力。' },
  { id: 148, chapterId: 'chapter8', blockId: 'block4', category: '非平衡力运动', question: '如果一个物体受到非平衡力的作用，则该物体的运动状态：', options: ['一定保持静止', '一定做匀速直线运动', '一定会发生改变', '一定做加速直线运动'], answer: 2, explanation: '名师指点：物体受平衡力（或不受力）时，运动状态不变（静止或匀速）。如果受“非平衡力”，受力不平衡，物体的运动状态**一定会发生改变**（加速、减速或拐弯）。' },
  { id: 149, chapterId: 'chapter8', blockId: 'block4', category: '摩擦力种类', question: '下列各种摩擦中，属于“滚动摩擦”的是：', options: ['用圆珠笔写字时，笔尖圆珠与纸张的摩擦', '用钢笔写字时，笔尖与纸张的摩擦', '擦黑板时，黑板擦与黑板的摩擦', '滑冰时，冰鞋冰刀与冰面的摩擦'], answer: 0, explanation: '名师指点：圆珠笔写字时，笔尖的小钢珠在纸面上滚动，产生的摩擦属于滚动摩擦。另外三个选项中，物体都在表面上发生相对滑动，属于滑动摩擦。' },
  { id: 150, chapterId: 'chapter8', blockId: 'block4', category: '增大摩擦力', question: '自行车刹车时，用力捏刹车把手，这是为了：', options: ['增大接触面的粗糙程度来增大摩擦', '增大压力来增大摩擦', '变滚动摩擦为滑动摩擦', '减小接触面积来减小摩擦'], answer: 1, explanation: '名师指点：增大摩擦力的方法：1. 增大压力；2. 增大接触面粗糙程度。捏刹车手把，加大了刹车皮对车轮钢圈的压力，从而增大了滑动摩擦力。选B。' },
  { id: 151, chapterId: 'chapter8', blockId: 'block4', category: '减小摩擦力', question: '给自行车的轴承加润滑油，这是为了：', options: ['增大压力', '使接触面分离来减小摩擦', '增大接触面粗糙程度', '变滑动摩擦为滚动摩擦'], answer: 1, explanation: '名师指点：加润滑油可以在两轴承接触面之间形成一层油膜，使接触面分离，从而大大减小摩擦力。' },
  { id: 152, chapterId: 'chapter8', blockId: 'block4', category: '摩擦力与速度', question: '木块在水平桌面上做匀速直线运动，受到 5 N 的水平拉力。当拉力增大到 8 N 时，木块在桌面上做加速运动，此时木块受到的滑动摩擦力为：', options: ['8 N', '5 N', '3 N', '大于 5 N 且小于 8 N'], answer: 1, explanation: '名师指点：中考经典高频陷阱题！1. 匀速运动时，受力平衡，滑动摩擦力等于拉力 = 5 N。2. 当拉力变成 8 N 加速运动时，因为**木块对桌面的压力大小**和**接触面的粗糙程度**都完全没有改变，所以滑动摩擦力保持不变，依然是 5 N。' },
  { id: 153, chapterId: 'chapter8', blockId: 'block4', category: '惯性安全', question: '汽车安全气囊和防抱死刹车系统(ABS)的设计，主要是为了：', options: ['消除人身体的惯性', '防止因惯性对人体造成的伤害', '减小汽车的惯性', '增大汽车的摩擦'], answer: 1, explanation: '名师指点：人体的惯性无法被“消除”或“减小”。在紧急刹车或碰撞时，人由于惯性会继续向前冲，安全气囊能起到缓冲作用，防止惯性带来的碰撞伤害。' },
  { id: 154, chapterId: 'chapter8', blockId: 'block4', category: '平衡力匀速', question: '降落伞在空中匀速竖直下落。已知伞和人的总重为 800 N，则他们受到的空气阻力为：', options: ['大于 800 N', '小于 800 N', '等于 800 N', '方向竖直向下'], answer: 2, explanation: '名师指点：只要看到“匀速竖直下落”，即处于平衡状态，受力平衡。竖直方向上受到重力（向下）和阻力（向上），两个力大小相等，所以阻力直接等于重力 = 800 N。' },
  { id: 155, chapterId: 'chapter8', blockId: 'block4', category: '静摩擦力受力', question: '人用 20 N 的水平推力推放在地上的大箱子，但箱子纹丝不动。此时箱子受到的摩擦力为：', options: ['0 N', '20 N', '大于 20 N', '100 N'], answer: 1, explanation: '名师指点：箱子没动（静止），受力平衡。在水平方向上，推力与静摩擦力是一对平衡力。所以静摩擦力大小直接等于推力 = 20 N。' },
  { id: 156, chapterId: 'chapter8', blockId: 'block4', category: '运动受力方向', question: '一物体在水平方向受到两个力：向东的 15 N 和向西的 10 N，物体向东做加速直线运动。若突然撤去向西的力，物体的运动情况是：', options: ['立即向西运动', '继续向东运动且加速变快', '立即停止运动', '向东做减速运动'], answer: 1, explanation: '名师指点：撤去向西 10 N 的阻力后，物体在水平方向只剩向东 15 N 的推力（合力从 5 N 变大到 15 N），物体受到的向东合力变大，因此继续向东加速且加速变快。' },
  { id: 157, chapterId: 'chapter8', blockId: 'block4', category: '压力与摩擦力关系', question: '用手握住一个重为 3 N 的啤酒瓶，手和瓶子都在竖直方向上保持静止。若手对瓶子的握力增大，瓶子受到的摩擦力将：', options: ['变大', '变小', '保持不变，依然为 3 N', '无法确定'], answer: 2, explanation: '名师指点：中考超经典压轴基础题！瓶子竖直静止，受平衡力。在竖直方向上，静摩擦力（向上）与瓶子重力（向下）是一对平衡力。重力是 3 N，所以静摩擦力必为 3 N。**增大握力，只是增大了瓶子的最大静摩擦力，但实际静摩擦力依旧等于重力 3 N**。选C。' },
  { id: 158, chapterId: 'chapter8', blockId: 'block4', category: '惯性大招', question: '下列利用了“物体惯性”的是：', options: ['跳远前助跑', '司机慢速转弯', '雨天路滑，车辆减速行驶', '安全带阻挡'], answer: 0, explanation: '名师指点：跳远运动员助跑，是为了利用惯性在起跳后继续保持较快的水平速度，跳得更远。B、C、D都是为了防止惯性带来的危害。' },
  { id: 159, chapterId: 'chapter8', blockId: 'block4', category: '静摩擦改变', question: '用 10 N 推力推桌子没动，摩擦力为 f₁；用 15 N 推力推桌子仍没动，摩擦力为 f₂。则：', options: ['f₁ = f₂ = 10 N', 'f₁ = 10 N, f₂ = 15 N', 'f₁ = 15 N, f₂ = 10 N', 'f₁ = f₂ = 0 N'], answer: 1, explanation: '名师指点：两次桌子都静止，属于受力平衡。摩擦力大小等于当时的水平推力。所以 f₁ = 10 N，f₂ = 15 N。静摩擦力是随推力的增大而增大的。' },
  { id: 160, chapterId: 'chapter8', blockId: 'block4', category: '摩擦力和接触面', question: '把一块长方体木块平放在水平桌面上拉动，拉力为 F₁；将它侧放在同一桌面上拉动，拉力为 F₂（两次均做匀速运动）。则：', options: ['F₁ > F₂', 'F₁ < F₂', 'F₁ = F₂', '无法确定'], answer: 2, explanation: '名师指点：滑动摩擦力大小与接触面积大小完全无关。平放和侧放时，木块对桌面的压力不变，接触面的粗糙程度不变，所以滑动摩擦力相等。因为是匀速运动，拉力等于摩擦力，因此 F₁ = F₂。' }
);

// 9. 压强 (161 - 180)
questions.push(
  { id: 161, chapterId: 'chapter9', blockId: 'block4', category: '压强概念', question: '在物理学中，压强是表示什么的物理量？', options: ['压力的大小', '受力面积的大小', '压力作用效果的强弱', '物体受到的重力'], answer: 2, explanation: '名师指点：压强在物理学中是用来定义**压力作用效果**（即压得有多深、多明显）的物理量。' },
  { id: 162, chapterId: 'chapter9', blockId: 'block4', category: '增大压强', question: '下列做法中，为了“增大压强”的是：', options: ['书包带做得宽一些', '货车装有很多轮子', '安全锤的铁锤尖端做得非常尖', '铁轨铺在枕木上'], answer: 2, explanation: '名师指点：增大压强的方法：减小受力面积。安全锤敲击端做得极尖，是为了通过极大地减小受力面积，在压力一定时产生巨大的压强击碎玻璃。A、B、D都是增大面积减小压强。' },
  { id: 163, chapterId: 'chapter9', blockId: 'block4', category: '减小压强方法', question: '推土机有宽大的履带，这是为了：', options: ['增大压力，增大压强', '减小受力面积，减小压强', '增大受力面积，减小压强', '减小压力，减小压强'], answer: 2, explanation: '名师指点：推土机自身非常重，履带很宽可以**增大与地面的受力面积**，从而**减小压强**，防止推土机陷入泥土中。' },
  { id: 164, chapterId: 'chapter9', blockId: 'block4', category: '固体压强换算', question: '一个重 10 N 的正方体木块，底面积为 100 cm²，平放在水平地面上。它对地面的压强为：', options: ['1000 Pa', '100 Pa', '10 Pa', '0.1 Pa'], answer: 0, explanation: '名师指点：受力面积 S 必须化成标准单位 m²！S = 100 cm² = 100 * 10⁻⁴ m² = 0.01 m²。F = G = 10 N。则 p = F / S = 10 / 0.01 = 1000 Pa。' },
  { id: 165, chapterId: 'chapter9', blockId: 'block4', category: '压力重力区分', question: '关于压力，下列说法中正确的是：', options: ['压力的方向总是竖直向下的', '压力的大小必定等于物体的重力', '压力是垂直作用在物体表面上的力', '斜面上的物体受到的压力等于重力'], answer: 2, explanation: '名师指点：压力的方向是**垂直于接触面**指向被压物体。只有物体平放在水平面上时，压力大小才等于重力。在斜面上，压力方向斜向下，大小小于重力。' },
  { id: 166, chapterId: 'chapter9', blockId: 'block4', category: '液体压强高度', question: '装有水的圆柱形杯中，水深 10 cm，水对杯底的压强为：(g = 10 N/kg，水密度 1.0 × 10³ kg/m³)', options: ['100 Pa', '1000 Pa', '10000 Pa', '10 Pa'], answer: 1, explanation: '名师指点：深度 h 必须换算成标准单位 m。h = 10 cm = 0.1 m。利用液体压强公式：p = ρ * g * h = 1000 * 10 * 0.1 = 1000 Pa。' },
  { id: 167, chapterId: 'chapter9', blockId: 'block4', category: '液体压强深度判定', question: '一装满水的烧杯，在侧壁不同高度扎了三个小孔，水从小孔喷出。下列关于喷射距离的说法正确的是：', options: ['三个孔喷出的距离一样远', '最上面的小孔喷得最远', '最下面的小孔喷得最远', '中间的孔喷得最远'], answer: 2, explanation: '名师指点：由 p = ρ * g * h，液体压强随深度的增加而增大。最下面的孔深度 h 最大，压强最大，水喷射得最急、最远。' },
  { id: 168, chapterId: 'chapter9', blockId: 'block4', category: '液体压强容器形状', question: '甲、乙两个形状不同的杯子，装有同高度的水，杯底面积相等。则杯底受到的液体压强：', options: ['甲杯大', '乙杯大', '一样大', '无法确定'], answer: 2, explanation: '名师指点：液体压强公式 p = ρ * g * h。因为装的都是水（密度相同），且高度相同（h相同），所以杯底受到的压强完全一样大，与杯子的形状粗细没有任何关系。' },
  { id: 169, chapterId: 'chapter9', blockId: 'block4', category: '连通器原理', question: '下列应用不属于连通器的是：', options: ['茶壶的壶嘴与壶身', '三峡大坝的船闸', '锅炉液位计', '活塞式抽水机'], answer: 3, explanation: '名师指点：茶壶、船闸、液位计都是上端开口底部连通，属于连通器。活塞式抽水机是利用**大气压强**将水抽上来的，不属于连通器。' },
  { id: 170, chapterId: 'chapter9', blockId: 'block4', category: '大气压证明', question: '历史上著名的什么实验有力地证明了“大气压强”的存在且非常巨大？', options: ['托里拆利实验', '马德堡半球实验', '伽利略针吸实验', '牛顿管实验'], answer: 1, explanation: '名师指点：1654 年德国马德堡市市长奥托·冯·格里克做的**马德堡半球实验**，用 16 匹马才拉开真空半球，有力证明了大气压的存在。' },
  { id: 171, chapterId: 'chapter9', blockId: 'block4', category: '大气压测定', question: '历史上第一个精确测出“大气压强”数值的物理实验是：', options: ['马德堡半球实验', '托里拆利实验', '帕斯卡裂桶实验', '阿基米德浮力实验'], answer: 1, explanation: '名师指点：意大利科学家**托里拆利实验**，利用水银柱产生的压强与大气压平衡，测出标准大气压支持 760 mm 高的水银柱。' },
  { id: 172, chapterId: 'chapter9', blockId: 'block4', category: '大气压与海拔', question: '关于大气压强与海拔高度的关系，下列说法正确的是：', options: ['海拔越高，大气压越高', '海拔越高，大气压越低', '大气压与海拔无关', '高山上的大气压相当于两个标准压'], answer: 1, explanation: '名师指点：越往高处走，空气越稀薄，所以大气压随海拔的升高而减小。' },
  { id: 173, chapterId: 'chapter9', blockId: 'block4', category: '大气压与沸点', question: '在高原上用普通锅很难把鸡蛋煮熟，这是因为高原上气压低，水的沸点：', options: ['升高', '降低', '保持不变', '无法确定'], answer: 1, explanation: '名师指点：液体的沸点与液面上方的气压有关。气压越低，沸点越低。高原气压低，水可能在 85℃ 就沸腾了，水温不够，鸡蛋难以煮熟。' },
  { id: 174, chapterId: 'chapter9', blockId: 'block4', category: '大气压应用', question: '下列现象中，属于利用“大气压强”的是：', options: ['用力用吸管吸果汁', '注射器向肌肉注射药液', '深海鱼在水中游动', '大坝做成上窄下宽'], answer: 0, explanation: '名师指点：用吸管吸果汁时，吸走了管内空气，管内气压减小，外界大气压将果汁压入嘴中。注射器推药液是靠活塞的推力；大坝做成上窄下宽是因为液体压强随深度增加而增大。' },
  { id: 175, chapterId: 'chapter9', blockId: 'block4', category: '托里拆利水银', question: '在托里拆利实验中，如果将水银管稍微倾斜，管内水银柱的：', options: ['高度变大', '高度变小', '高度保持不变，长度变长', '高度和长度都不变'], answer: 2, explanation: '名师指点：管内水银柱的**垂直高度**是由外界大气压决定的，只要大气压不变，垂直高度就保持 760 mm 不变。管子倾斜后，水银柱在管内的**长度**会变长。' },
  { id: 176, chapterId: 'chapter9', blockId: 'block4', category: '压强比例题', question: '甲、乙两个正方体放在水平地面上，质量之比是 1:2，底面积之比是 2:3，则它们对地面的压强之比为：', options: ['3:4', '4:3', '1:3', '3:1'], answer: 0, explanation: '名师指点：压强 p = F/S = G/S。p_甲 / p_乙 = (G_甲 / G_乙) * (S_乙 / S_甲) = (1/2) * (3/2) = 3:4。选A。' },
  { id: 177, chapterId: 'chapter9', blockId: 'block4', category: '流体压强流速', question: '火车站的站台上有一条安全黄线。火车进站时，乘客必须站在安全线外。这是因为火车进站时，车身附近的空气：', options: ['流速大，压强小，容易把人吸向火车', '流速小，压强大，容易把人推开', '流速大，压强大', '流速小，压强小'], answer: 0, explanation: '名师指点：流体压强规律：**流速越大的位置，压强越小**。火车进站速度极快，带走周围空气使车身附近流速大压强小，乘客身后大气压大，产生向火车的推力，易发生危险。' },
  { id: 178, chapterId: 'chapter9', blockId: 'block4', category: '飞机升力', question: '飞机机翼截面通常做成“上凸下平”的形状。飞机向前飞行时，机翼：', options: ['上方空气流速大压强小，产生向上的升力', '下方空气流速大压强小', '上方空气流速小压强大', '依靠空气浮力浮在空中'], answer: 0, explanation: '名师指点：上凸下平的设计使得上方空气路径长，流速大，因而压强小；下方空气流速小压强大。上下表面的压强差产生了一个向上的升力，使飞机升空。' },
  { id: 179, chapterId: 'chapter9', blockId: 'block4', category: '液体压强水坝', question: '江河水坝通常修成“上窄下宽”的形状，这主要是因为：', options: ['美观好看', '防洪排沙', '液体压强随深度的增加而增大', '节省石料'], answer: 2, explanation: '名师指点：根据 p = ρ * g * h，大坝越深的位置，受到的水压越恐怖。因此水坝下部必须造得极其宽厚，才能承受底部的巨大水压。' },
  { id: 180, chapterId: 'chapter9', blockId: 'block4', category: '吸盘挂钩', question: '把吸盘挂钩往光滑的瓷砖墙壁上一压，就能挂衣服。吸盘能粘在墙上是因为：', options: ['吸盘与墙壁之间有吸引力', '大气压强把吸盘牢牢压在墙上', '吸盘具有磁性', '重力拉住了吸盘'], answer: 1, explanation: '名师指点：一压吸盘排出了里面的空气，吸盘内部处于近似真空状态，外界强大的**大气压强**将吸盘紧紧压在墙壁上。' }
);

// 10. 浮力 (181 - 200)
questions.push(
  { id: 181, chapterId: 'chapter10', blockId: 'block4', category: '浮力方向', question: '浸在液体中的物体，受到液体对它竖直向上的托力，这个力叫浮力。浮力的方向永远是：', options: ['垂直向上', '竖直向上', '沿液体流动方向', '跟接触面垂直'], answer: 1, explanation: '名师指点：重力的方向是竖直向下，浮力的方向与重力相反，永远是**竖直向上**。' },
  { id: 182, chapterId: 'chapter10', blockId: 'block4', category: '称重法测浮力', question: '一个木块在空气中重 3 N，浸入水中后弹簧测力计示数为 1.8 N，则木块受到的浮力是：', options: ['3 N', '1.8 N', '1.2 N', '4.8 N'], answer: 2, explanation: '名师指点：直接利用称重法公式：F_浮 = G - F_示 = 3 N - 1.8 N = 1.2 N。' },
  { id: 183, chapterId: 'chapter10', blockId: 'block4', category: '浮力产生原因', question: '浮力产生的根本原因是因为液体对浸入其中的物体：', options: ['下表面受到的向上的压力大于上表面受到的向下的压力', '上下表面的压强相等', '液体密度的作用', '物体自身排开了体积'], answer: 0, explanation: '名师指点：物体在液体中，下底面深度 h_下 大于上底面深度 h_上，所以下表面向上压强 p_上 大，导致向上压力 F_上 大于向下压力 F_下。这个**压力差**（F_向上 - F_向下）就是浮力的成因。' },
  { id: 184, chapterId: 'chapter10', blockId: 'block4', category: '浮沉条件上浮', question: '把一个重为 5 N 的物体放入水中，释放后物体上浮。在上浮过程中（未露出水面），物体受到的浮力：', options: ['小于 5 N', '等于 5 N', '大于 5 N', '逐渐减小'], answer: 2, explanation: '名师指点：物体能“上浮”，说明此时受到的**浮力大于重力**。重力是 5 N，所以浮力必须大于 5 N。' },
  { id: 185, chapterId: 'chapter10', blockId: 'block4', category: '漂浮状态浮力', question: '一个重 5 N 的小球放入水中，最后静止漂浮在水面上，此时小球受到的浮力是：', options: ['大于 5 N', '等于 5 N', '小于 5 N', '无法确定'], answer: 1, explanation: '名师指点：看到“漂浮”或者“悬浮”，立马条件反射：受力平衡，**浮力等于重力**。既然漂浮，F_浮 = G = 5 N。' },
  { id: 186, chapterId: 'chapter10', blockId: 'block4', category: '浮力深度关系', question: '一金属块完全浸没在水中，当它在水中的深度继续增加时，它受到的浮力将：', options: ['变大', '变小', '保持不变', '先变大后变小'], answer: 2, explanation: '名师指点：中考高频必背！由 F_浮 = rho * g * V_排。金属块完全浸没在水下，无论深度怎么变，**排开液体的体积 V_排 都保持不变**，所以浮力保持不变。' },
  { id: 187, chapterId: 'chapter10', blockId: 'block4', category: '阿基米德浮力大小', question: '体积相同的铜块和铁块（密度：铜 > 铁 > 水），都完全浸没在水中。它们受到的浮力：', options: ['铜块大', '铁块大', '一样大', '无法确定'], answer: 2, explanation: '名师指点：体积相同且都完全浸没，说明它们的排开体积 V_排 相同。浸在同种液体（水）中，所以根据公式，它们受到的浮力完全一样大。' },
  { id: 188, chapterId: 'chapter10', blockId: 'block4', category: '浮沉密度法', question: '将一实心物体放入水中，如果物体的密度小于水的密度 (rho_物 < rho_水)，释放后物体将：', options: ['下沉', '漂浮', '悬浮', '先下沉后上浮'], answer: 1, explanation: '名师指点：密度比较法判浮沉：物密度小于液密度，物体上浮，最终**漂浮**；物密度等于液密度，物体**悬浮**；物密度大于液密度，物体**下沉**。' },
  { id: 189, chapterId: 'chapter10', blockId: 'block4', category: '悬浮状态特点', question: '一实心金属球在水里处于悬浮状态，如果把它切成大小不等的两块再放入水中，则：', options: ['大块下沉，小块上浮', '两块依然悬浮', '大块上浮，小块下沉', '两块都沉底'], answer: 1, explanation: '名师指点：实心体悬浮说明其密度等于水的密度。切开后，物体的材质没变，每一块的密度依然等于水的密度，所以重新放入水中后两块依然处于悬浮状态。' },
  { id: 190, chapterId: 'chapter10', blockId: 'block4', category: '死海漂浮', question: '人在“死海”里可以悠闲地漂浮在水面上，这主要是因为：', options: ['人自身的重力变小了', '死海的水很深', '死海盐水的密度很大，人受到的浮力等于重力，但排开更少体积', '死海没有重力'], answer: 2, explanation: '名师指点：死海盐水密度极高。人在里面漂浮时，浮力依然等于人的重力（F_浮 = G）。由于盐水密度大，根据 F_浮 = rho * g * V_排，人只需要排开较小的体积就能获得足够的浮力，所以人会露出一大部分身体漂在水面上。' },
  { id: 191, chapterId: 'chapter10', blockId: 'block4', category: '轮船吃水线', question: '一艘轮船从海里驶入长江，长江水的密度小于海水的密度。轮船受到的浮力 F 和船身浸入水中的深度的变化是：', options: ['F 变小，船身下沉一些', 'F 不变，船身下沉一些', 'F 不变，船身上浮一些', 'F 变大，船身上浮一些'], answer: 1, explanation: '名师指点：轮船在海里和长江里都是漂浮状态，所以浮力都等于重力。船重不变，浮力 F 不变。但因为长江水密度小，根据 F_浮 = rho * g * V_排，V_排 必须变大，所以船身要下沉一些。选B。' },
  { id: 192, chapterId: 'chapter10', blockId: 'block4', category: '热气球升空', question: '热气球能升空，是因为气球内热空气的密度：', options: ['大于外界空气密度，受浮力大', '小于外界空气密度，气球受到的浮力大于自重', '等于外界空气密度', '自身重力增加了'], answer: 1, explanation: '名师指点：热空气受热膨胀，密度变小。热气球在空气中受到的浮力 F_浮 = rho_空气 * g * V_排。当气球内热空气密度变小时，球内气体变轻，气球受到的空气浮力大于气球的总自重，所以热气球能够升空。' },
  { id: 193, chapterId: 'chapter10', blockId: 'block4', category: '密度计原理', question: '测定液体密度的“密度计”放入不同液体中静止时，都处于漂浮状态。它在密度大的液体中：', options: ['受到的浮力大', '露出的高度多', '浸入的深度深', '受到的浮力小'], answer: 1, explanation: '名师指点：因为密度计都漂浮，所以在任何液体中它的浮力都等于自身重力（浮力相等）。根据 F_浮 = rho_液 * g * V_排，液体密度 rho 越大，排开体积 V_排 越小。所以它浸入的体积小，露出的高度多。选B。' },
  { id: 194, chapterId: 'chapter10', blockId: 'block4', category: '潜水艇浮沉', question: '潜水艇在水中是通过改变什么来实现上浮和下沉的？', options: ['自身的体积（排开水体积）', '自身的重力（调节水舱水量）', '液体的密度', '受到的浮力'], answer: 1, explanation: '名师指点：中考高频必背！潜水艇在水面下，体积不变，受到的浮力基本固定。它是通过**往水舱内充水或排水来改变自身重力**实现浮沉的。重力大于浮力下沉，重力小于浮力上浮。' },
  { id: 195, chapterId: 'chapter10', blockId: 'block4', category: '浮沉条件沉底', question: '重 10 N，体积为 800 cm³ 的石块放入水中。石块静止时受到的浮力是：(g = 10 N/kg)', options: ['10 N', '8 N', '2 N', '0.8 N'], answer: 1, explanation: '名师指点：第一步先算完全浸没时的最大浮力：F_浮大 = ρ * g * V = 1000 * 10 * 800*10⁻⁶ m³ = 8 N。第二步比较：重力 G = 10 N，因为 F_浮大 (8N) < G (10N)，所以石块放入水中后会下沉，最终沉底。沉底时它受到的浮力就是最大浮力 = 8 N。' },
  { id: 196, chapterId: 'chapter10', blockId: 'block4', category: '浮力作图判定', question: '漂浮在水面上的木块，受到两个力的作用。这两个力是：', options: ['重力和支持力', '重力和浮力，它们是一对平衡力', '浮力和拉力', '重力和压力'], answer: 1, explanation: '名师指点：木块漂浮在水面上，处于静止状态，只受竖直向下的重力和竖直向上的浮力。这两个力大小相等方向相反，是一对平衡力。' },
  { id: 197, chapterId: 'chapter10', blockId: 'block4', category: '阿基米德原理本质', question: '阿基米德原理不仅适用于液体，也适用于：', options: ['固体', '气体', '真空', '只适用于液体'], answer: 1, explanation: '名师指点：阿基米德原理同样适用于气体。物体在空气中也会受到空气的浮力，其大小等于物体排开空气的重力。气球、飞艇升空就是利用空气浮力。' },
  { id: 198, chapterId: 'chapter10', blockId: 'block4', category: '浮力求密度', question: '一个实心物体悬浮在水中。如果水的密度为 1.0 × 10³ kg/m³，则该物体的密度为：', options: ['7.8 × 10³ kg/m³', '1.0 × 10³ kg/m³', '0.8 × 10³ kg/m³', '无法确定'], answer: 1, explanation: '名师指点：物体悬浮在水中，说明物体的密度等于液体的密度。所以该物体的密度直接等于水的密度 1.0 × 10³ kg/m³。' },
  { id: 199, chapterId: 'chapter10', blockId: 'block4', category: '水面变化浮冰', question: '一冰块漂浮在装有水的烧杯中，当冰块熔化成水后，烧杯中的水面将：', options: ['升高', '降低', '保持不变', '先升高后降低'], answer: 2, explanation: '名师指点：中考高频拓展题。冰漂浮时 F_浮 = G_冰 = ρ_水 * g * V_排，熔化成水后质量 m_水 = m_冰，所以化成的水的体积 V_化 = m_冰 / ρ_水。化成的体积刚好等于冰排开的体积，所以水面**保持不变**。' },
  { id: 200, chapterId: 'chapter10', blockId: 'block4', category: '浮力无引力', question: '在天宫课堂中，宇航员将乒乓球放入水中，乒乓球没有浮起来而是停在水中任何位置。这是因为在微重力环境下：', options: ['乒乓球变重了', '浮力消失了', '水的密度变小了', '乒乓球吸水了'], answer: 1, explanation: '名师指点：浮力的成因是液体内部的压力差，而压力差是由重力引起的液体压强差产生的。在太空中处于微重力失重状态，液体内部没有重力产生的压强，因此**浮力消失了**，乒乓球不会上浮。' }
);

// 11. 功和机械能 (201 - 220)
questions.push(
  { id: 201, chapterId: 'chapter11', blockId: 'block5', category: '做功判断', question: '下列实例中，人对物体“做了功”的是：', options: ['提着滑板车在水平路面上匀速前行', '背着书包站在原地等公交车', '用力将地上的石块抱起来', '冰壶脱手后在冰面上滑行'], answer: 2, explanation: '名师指点：有力且在力方向上有距离才做功。A中力的方向竖直向上，移动方向水平，不做功（垂直无功）；B静止不动（无距离）；D脱手后人没施加力了；只有C，抱起石块，人施加向上的力且石块向上移动，人做了功。' },
  { id: 202, chapterId: 'chapter11', blockId: 'block5', category: '功的单位', question: '在物理学中，功的国际单位是：', options: ['瓦特 (W)', '帕斯卡 (Pa)', '焦耳 (J)', '牛顿 (N)'], answer: 2, explanation: '名师指点：功的国际单位是焦耳，简称焦，符号是 J。1 J = 1 N·m。' },
  { id: 203, chapterId: 'chapter11', blockId: 'block5', category: '功的公式计算', question: '用 50 N 的水平拉力，拉着重 200 N 的箱子在水平地面上前进了 8 m。拉力做的功为：', options: ['1600 J', '400 J', '2000 J', '0 J'], answer: 1, explanation: '名师指点：求“拉力功”，必须代入拉力 F。W = Fs = 50 N * 8 m = 400 J。箱子受到的重力 200 N 方向竖直向下，水平运动时重力不做功，千万不要把重力代入公式。' },
  { id: 204, chapterId: 'chapter11', blockId: 'block5', category: '重力做功', question: '小明质量为 50 kg，他从 1 楼爬到 3 楼，上升高度为 6 m。在此过程中，小明克服自身重力做的功大约是：(g = 10 N/kg)', options: ['300 J', '3000 J', '30000 J', '500 J'], answer: 1, explanation: '名师指点：克服重力做功 W = Gh = mgh = 50 kg * 10 N/kg * 6 m = 3000 J。注意上到3楼其实只爬了2层楼的高度（从1楼到3楼高差为6m）。' },
  { id: 205, chapterId: 'chapter11', blockId: 'block5', category: '功率物理意义', question: '关于功率，下列说法正确的是：', options: ['做功越多的机械，功率一定越大', '功率越大的机械，做功一定越快', '省力的机械，功率一定大', '做功时间越短，功率一定大'], answer: 1, explanation: '名师指点：功率是表示**做功快慢**的物理量。功率大说明单位时间内做功多，即做功“快”。它与做功的“多少”和时间长短没有必然的单一决定关系。' },
  { id: 206, chapterId: 'chapter11', blockId: 'block5', category: '功率的单位', question: '在物理学中，功率的国际主单位是：', options: ['焦耳 (J)', '牛顿 (N)', '瓦特 (W)', '马力'], answer: 2, explanation: '名师指点：功率的国际主单位是瓦特，简称瓦，符号是 W。1 W = 1 J/s。' },
  { id: 207, chapterId: 'chapter11', blockId: 'block5', category: '功率公式计算', question: '一台机器在 10 s 内做了 5000 J 的功，这台机器的功率是：', options: ['50000 W', '500 W', '50 W', '5000 W'], answer: 1, explanation: '名师指点：利用功率计算公式：P = W / t = 5000 J / 10 s = 500 W。' },
  { id: 208, chapterId: 'chapter11', blockId: 'block5', category: '功率变形式', question: '起重机以 2 m/s 的速度将重 1000 N 的货物匀速吊起。起重机的功率是：', options: ['2000 W', '500 W', '200 W', '1000 W'], answer: 0, explanation: '名师指点：功率公式 P = W/t = Fs/t = Fv。当做匀速直线运动时，可以直接用 P = Fv 计算。P = 1000 N * 2 m/s = 2000 W。' },
  { id: 209, chapterId: 'chapter11', blockId: 'block5', category: '动能影响因素', question: '一辆洒水车正在街道上匀速洒水作业。在此过程中，洒水车的动能：', options: ['保持不变', '逐渐减小', '逐渐增大', '先增大后减小'], answer: 1, explanation: '名师指点：动能由物体的**质量**和**速度**共同决定。洒水车虽然匀速（速度不变），但在洒水过程中车的总质量 m 逐渐减小，所以动能逐渐减小。' },
  { id: 210, chapterId: 'chapter11', blockId: 'block5', category: '重力势能因素', question: '一架直升机在空中匀速爬升。在此过程中，飞机的重力势能：', options: ['保持不变', '变大', '变小', '无法确定'], options: ['保持不变', '变大', '变小', '先变大后变小'], answer: 1, explanation: '名师指点：重力势能由物体的**质量**和**高度**决定。直升机匀速爬升，质量不变，高度 h 增大，所以重力势能变大。' },
  { id: 211, chapterId: 'chapter11', blockId: 'block5', category: '机械能守恒', question: '一小球从空中自由下落（不计空气阻力）。在此过程中，小球的：', options: ['动能转化为重力势能，机械能不变', '重力势能转化为动能，机械能不变', '重力势能转化为动能，机械能减小', '动能和势能都在增大'], answer: 1, explanation: '名师指点：下落时高度减小重力势能减小，速度增大动能增大，重力势能转化为动能。因为不计阻力，没有机械能的损耗，机械能总量保持不变。' },
  { id: 212, chapterId: 'chapter11', blockId: 'block5', category: '机械能转化实际', question: '人造地球卫星沿椭圆轨道绕地球运行。当它从近地点向远地点运动时，卫星的：', options: ['动能减小，重力势能增大，动能转化为势能', '动能增大，重力势能减小', '动能和重力势能都增大', '机械能总量在变小'], answer: 0, explanation: '名师指点：卫星在太空中飞行不受空气阻力，机械能守恒。近地点速度最快动能最大；远地点高度最高势能最大。由近地点向远地点运动时，高度变大，速度变慢，动能转化为势能。选A。' },
  { id: 213, chapterId: 'chapter11', blockId: 'block5', category: '功率爬楼实验', question: '小明和小华进行爬楼比赛。他们同时从一楼出发，小明（50kg）先到达五楼，小华（40kg）后到达五楼。则：', options: ['小明做功快，功率大', '小华做功快，功率大', '他们做功快慢一样', '无法比较'], answer: 0, explanation: '名师指点：小明重力大且用时短。功 W_明 > W_华，时间 t_明 < t_华。根据 P = W/t，小明的功率大得多，他做功更快。' },
  { id: 114, chapterId: 'chapter11', blockId: 'block5', category: '动能势能判断', question: '百米冲刺的运动员，过了终点后逐渐减速停下来。在减速过程中，运动员的：', options: ['动能变小，重力势能变大', '动能变小，重力势能不变', '动能不变，重力势能变小', '机械能保持不变'], answer: 1, explanation: '名师指点：运动员在水平路面减速。速度减小，动能变小；水平高度不变，重力势能不变。所以动能变小，重力势能不变。选B。' },
  { id: 215, chapterId: 'chapter11', blockId: 'block5', category: '弹性势能', question: '撑杆跳高运动员在起跳后，撑杆被压弯。此时撑杆具有什么能？', options: ['动能', '重力势能', '弹性势能', '化学能'], answer: 2, explanation: '名师指点：撑杆发生弯曲，发生了弹性形变，因而具有弹性势能。' },
  { id: 216, chapterId: 'chapter11', blockId: 'block5', category: '功和能的关系', question: '关于功和能的关系，下列说法中正确的是：', options: ['有能量的物体必定正在做功', '只有正在做功的物体才具有能量', '物体能够做的功越多，它具有的能量就越大', '能量和功的单位不同'], answer: 2, explanation: '名师指点：能是物体“做功的本领”。具有能量的物体不一定正在做功（如挂在墙上的弓，具有势能但没做功）。本领越强（能做功越多），代表它具有的能量越大。单位都是焦耳。' },
  { id: 217, chapterId: 'chapter11', blockId: 'block5', category: '机械效率与功率', question: '关于功率和机械效率，下列说法正确的是：', options: ['功率大的机械，机械效率一定高', '做功快的机械，机械效率一定高', '机械效率高的机械，做功一定快', '功率和机械效率是两个完全无关的物理量'], answer: 3, explanation: '名师指点：中考高频概念辨析。功率反映做功“快慢”（$P=W/t$），机械效率反映有用功在总功中占的“比例”（$\eta=W_有/W_总$）。两者毫无关系。' },
  { id: 218, chapterId: 'chapter11', blockId: 'block5', category: '斜坡下滚', question: '骑自行车下坡时，即使不踩脚踏板，车的速度也会越来越快。在此过程中：', options: ['动能转化为势能', '重力势能转化为动能', '机械能总量增加', '重力不做功'], answer: 1, explanation: '名师指点：下坡时，高度变小重力势能变小；速度变快动能变大。重力势能转化为动能，因为有重力分力做功。' },
  { id: 219, chapterId: 'chapter11', blockId: 'block5', category: '拉力做功计算', question: '一物体重 100 N，在 20 N 水平拉力作用下，5 s 内沿水平地面前进了 10 m。拉力做功的功率是：', options: ['200 W', '40 W', '100 W', '20 W'], answer: 1, explanation: '名师指点：先求功 W = Fs = 20 N * 10 m = 200 J。再求功率 P = W/t = 200 J / 5 s = 40 W。' },
  { id: 220, chapterId: 'chapter11', blockId: 'block5', category: '跳水机械能', question: '跳水运动员从跳板高高跃起，在上升到最高点的过程中，不计空气阻力：', options: ['动能增大，重力势能减小', '动能减小，重力势能增大，机械能总量不变', '动能和势能都在变大', '机械能逐渐减小'], answer: 1, explanation: '名师指点：跃起上升阶段，速度越来越慢（动能减小），高度越来越高（势能增大），动能转化为势能。不计阻力，机械能守恒。' }
);

// 12. 简单机械 (221 - 240)
questions.push(
  { id: 221, chapterId: 'chapter12', blockId: 'block5', category: '杠杆省力费力', question: '筷子、钓鱼竿是我们在生活中常用的工具，它们属于：', options: ['省力杠杆', '费力杠杆，但省距离', '等臂杠杆', '既省力又省距离'], answer: 1, explanation: '名师指点：使用筷子和钓鱼竿时，手握的位置是动力作用点，支点在末端。动力臂小于阻力臂，属于费力杠杆。费力但可以省移动距离，使用更方便。' },
  { id: 222, chapterId: 'chapter12', blockId: 'block5', category: '杠杆五要素', question: '关于杠杆的力臂，下列画法或理解正确的是：', options: ['力臂就是支点到力的作用点的线段', '力臂必定在杠杆尺体上', '力臂是支点到力的作用线的垂直距离', '动力臂和阻力臂必定一样长'], answer: 2, explanation: '名师指点：中考作图题核心！力臂是支点到“力的作用线”（沿力方向画的直线）的**垂直距离**，而不是到作用点的距离。' },
  { id: 223, chapterId: 'chapter12', blockId: 'block5', category: '杠杆平衡条件计算', question: '杠杆平衡时，动力臂 L₁ 为 20 cm，阻力臂 L₂ 为 5 cm。如果阻力 F₂ 为 10 N，则动力 F₁ 为：', options: ['40 N', '2.5 N', '20 N', '5 N'], answer: 1, explanation: '名师指点：利用杠杆平衡条件：F₁L₁ = F₂L₂。F₁ * 20 = 10 * 5。解得 F₁ = 2.5 N。这是一个省力杠杆。' },
  { id: 224, chapterId: 'chapter12', blockId: 'block5', category: '定滑轮工作特点', question: '使用定滑轮提升重物，下列说法正确的是：', options: ['定滑轮可以省一半的力', '定滑轮不能省力，但可以改变力的方向', '定滑轮费距离', '定滑轮的效率是 100%'], answer: 1, explanation: '名师指点：定滑轮本质是一个等臂杠杆。动力臂等于阻力臂。所以不省力也不费力。但它可以改变拉力的方向（例如站在地面向上拉绳提升重物），非常实用。' },
  { id: 225, chapterId: 'chapter12', blockId: 'block5', category: '动滑轮力计算', question: '用一个重 20 N 的动滑轮匀速提升重 180 N 的物体（不计绳重及摩擦）。拉力 F 为：', options: ['180 N', '90 N', '100 N', '200 N'], answer: 2, explanation: '名师指点：动滑轮省一半力。考虑动滑轮自重时，拉力公式为：F = (G_物 + G_动) / 2 = (180 N + 20 N) / 2 = 100 N。' },
  { id: 226, chapterId: 'chapter12', blockId: 'block5', category: '滑轮组绳段数', question: '滑轮组用 3 段绳子吊着动滑轮。若拉力端移动了 6 m，则重物被提升的高度为：', options: ['18 m', '2 m', '3 m', '6 m'], answer: 1, explanation: '名师指点：滑轮组绳子端移动距离 s 与物体上升高度 h 的关系为 s = n * h。已知 n = 3，s = 6 m。则 h = s / n = 6 / 3 = 2 m。' },
  { id: 227, chapterId: 'chapter12', blockId: 'block5', category: '功的原理', question: '关于“功的原理”，下列说法中正确的是：', options: ['使用机械可以省力，也可以省功', '使用机械可以省距离，也可以省功', '使用任何机械都不能省功', '省力杠杆能够省功'], answer: 2, explanation: '名师指点：功的原理指出：**使用任何机械都不能省功**。省力的机械必定费距离；省距离的机械必定费力。' },
  { id: 228, chapterId: 'chapter12', blockId: 'block5', category: '机械效率比值', question: '关于机械效率 η 的值，下列说法正确的是：', options: ['η 总是小于 1', 'η 可以等于 1', 'η 可以大于 1', '省力机械效率高'], answer: 0, explanation: '名师指点：因为在使用机械时，摩擦力和动滑轮/绳子自重是不可避免的，必须做额外功。总功永远大于有用功。所以机械效率 η = W_有 / W_总 必定**恒小于 100% (小于 1)**。' },
  { id: 229, chapterId: 'chapter12', blockId: 'block5', category: '机械效率提升', question: '下列措施中，可以提高滑轮组机械效率的是：', options: ['减小提升物体的重力', '增大提升物体的重力', '加快拉动绳子的速度', '增加动滑轮的个数'], answer: 1, explanation: '名师指点：提高滑轮组效率的方法：1. 增大有用功（即**增加提升物体的重力**）；2. 减小额外功（如减小动滑轮重、加润滑油减小摩擦）。减小物重或增多动滑轮都会使效率下降。速度快慢不影响效率。选B。' },
  { id: 230, chapterId: 'chapter12', blockId: 'block5', category: '滑轮效率计算', question: '滑轮组有用功为 800 J，总功为 1000 J，则该滑轮组的机械效率为：', options: ['80%', '125%', '20%', '8%'], answer: 0, explanation: '名师指点：利用机械效率公式：η = (W_有 / W_总) * 100% = (800 / 1000) * 100% = 80%。' },
  { id: 231, chapterId: 'chapter12', blockId: 'block5', category: '省力杠杆判断', question: '下列工具中，属于“省力杠杆”的是：', options: ['理发剪刀', '用起子开啤酒瓶盖', '夹食品的镊子', '扫地用的扫帚'], answer: 1, explanation: '名师指点：起子开瓶盖时，动力臂长，阻力臂短，能省力。理发剪刀、镊子、扫帚都是费力杠杆，为了省距离方便操作。' },
  { id: 232, chapterId: 'chapter12', blockId: 'block5', category: '斜面省力', question: '盘山公路修成环绕山坡的形状，这相当于使用哪种简单机械？', options: ['杠杆', '轮轴', '斜面', '滑轮'], answer: 2, explanation: '名师指点：盘山公路延长了爬坡的距离，相当于**斜面**。斜面是一种省力的简单机械，坡度越缓越省力，但费距离。' },
  { id: 233, chapterId: 'chapter12', blockId: 'block5', category: '滑轮组力省求', question: '用如图滑轮组匀速提升重 300 N 的重物，绳子段数 n = 3。若不计摩擦和绳重，拉力 F = 120 N，则动滑轮重力为：', options: ['60 N', '20 N', '10 N', '30 N'], answer: 0, explanation: '名师指点：由 F = (G_物 + G_动) / n 变形得：G_动 = n * F - G_物 = 3 * 120 N - 300 N = 360 N - 300 N = 60 N。' },
  { id: 234, chapterId: 'chapter12', blockId: 'block5', category: '有用功总功计算', question: '用滑轮组把重 500 N 的物体匀速提高 2 m，拉力为 200 N，绳子自由端移动距离为 6 m。有用功和总功分别是：', options: ['1000 J，1200 J', '1200 J，1000 J', '1000 J，1000 J', '500 J，1200 J'], answer: 0, explanation: '名师指点：有用功（提升重物） W_有 = G_物 * h = 500 N * 2 m = 1000 J；总功（拉力做功） W_总 = F_拉 * s = 200 N * 6 m = 1200 J。选A。' },
  { id: 235, chapterId: 'chapter12', blockId: 'block5', category: '等臂杠杆', question: '实验室常用的“托盘天平”本质上属于：', options: ['省力杠杆', '费力杠杆', '等臂杠杆', '不属于杠杆'], answer: 2, explanation: '名师指点：天平两端托盘到中央轴（支点）的距离完全相等，即动力臂等于阻力臂，属于等臂杠杆，所以能准确测量等重质量。' },
  { id: 236, chapterId: 'chapter12', blockId: 'block5', category: '机械效率摩擦', question: '滑轮组的机械效率不可能达到 100% 的根本原因在于：', options: ['有用功太少', '绳子不够长', '存在摩擦阻力和动滑轮自重', '拉力不够大'], answer: 2, explanation: '名师指点：使用滑轮组时，绳子与轮之间有摩擦，且动滑轮本身有重量，提升重物时必须克服这些做额外功。故有用功永远小于总功，效率必小于 100%。' },
  { id: 237, chapterId: 'chapter12', blockId: 'block5', category: '定滑轮省力否', question: '使用定滑轮匀速提升 100 N 的物体，拉力方向分别向上、斜向上或水平。拉力大小：', options: ['向上拉力最大', '水平拉力最大', '三个方向拉力一样大', '斜向上拉力最大'], answer: 2, explanation: '名师指点：定滑轮本质是等臂杠杆。无论拉力向哪个方向倾斜，动力臂都等于滑轮的半径 R，阻力臂也等于半径 R。所以不论拉力方向如何，拉力都等于物重 = 100 N。选C。' },
  { id: 238, chapterId: 'chapter12', blockId: 'block5', category: '滑轮组绕绳', question: '在组装滑轮组时，相同的动滑轮和定滑轮。若承担物重的绳子段数 n 越多，则：', options: ['越省力，费距离越少', '越省力，越费距离', '越费力，越省距离', '省力情况不变'], answer: 1, explanation: '名师指点：根据功的原理，绳子段数 n 越多，拉力 F = G/n 越小（越省力），但自由端移动距离 s = n*h 就越大（越费距离）。' },
  { id: 239, chapterId: 'chapter12', blockId: 'block5', category: '省力费力力臂', question: '关于杠杆，下列说法正确的是：', options: ['省力杠杆的动力臂小于阻力臂', '费力杠杆虽然费力，但可以省功', '等臂杠杆既不省力也不费力，也不省距离', '费力杠杆的动力臂大于阻力臂'], answer: 2, explanation: '名师指点：省力杠杆动力臂大于阻力臂；任何机械都不省功；费力杠杆动力臂小于阻力臂。等臂杠杆动力臂等于阻力臂，不省不费。选C。' },
  { id: 240, chapterId: 'chapter12', blockId: 'block5', category: '杠杆平衡阻力方向', question: '杠杆平衡时，如果动力 F₁ 和阻力 F₂ 对杠杆的作用效果是使杠杆绕支点转动方向相反，则这两个力的方向在支点同侧时：', options: ['方向一定相同', '方向一定相反', '方向没有限制', '无法判断'], answer: 1, explanation: '名师指点：若力在支点同侧，要产生相反方向的转动效果，两个力的方向必须相反（如一个向上，另一个向下）。若在支点异侧，两个力的方向则需要相同。选B。' }
);
