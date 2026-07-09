import React, { useState } from 'react';

export default function LeverSimulator() {
  // 左侧状态 (动力端)
  const [leftGrid, setLeftGrid] = useState(3); // 距离支点几格 (1 ~ 5)
  const [leftWeights, setLeftWeights] = useState(4); // 钩码个数 (0 ~ 6)

  // 右侧状态 (阻力端)
  const [rightGrid, setRightGrid] = useState(4); // 距离支点几格 (1 ~ 5)
  const [rightWeights, setRightWeights] = useState(3); // 钩码个数 (0 ~ 6)

  const weightForce = 0.5; // 每个钩码 0.5 N
  const gridLength = 0.1; // 每格代表 0.1 m (10 cm)

  // 计算动力/阻力以及力臂
  const F1 = leftWeights * weightForce; // N
  const L1 = leftGrid * gridLength;     // m
  const torqueLeft = F1 * L1;           // N·m

  const F2 = rightWeights * weightForce; // N
  const L2 = rightGrid * gridLength;     // m
  const torqueRight = F2 * L2;           // N·m

  let rotateAngle = 0;
  let statusText = '';
  let statusColor = '';

  const torqueDiff = torqueLeft - torqueRight;

  if (Math.abs(torqueDiff) < 0.001) {
    rotateAngle = 0;
    statusText = '⚖️ 达到平衡 (F₁L₁ = F₂L₂)';
    statusColor = 'hsl(var(--color-success))';
  } else if (torqueDiff > 0) {
    rotateAngle = -10; // 左倾
    statusText = '⬅️ 向左倾斜 (F₁L₁ > F₂L₂)';
    statusColor = 'hsl(var(--color-danger))';
  } else {
    rotateAngle = 10; // 右倾
    statusText = '➡️ 向右倾斜 (F₁L₁ < F₂L₂)';
    statusColor = 'hsl(var(--color-warning))';
  }

  // SVG 参数
  const cx = 250; 
  const cy = 180; 
  const gridWidth = 35; 

  // 绘制单侧钩码
  const renderWeights = (isLeft, gridIndex, count) => {
    if (count <= 0) return null;
    const xPos = isLeft ? cx - gridIndex * gridWidth : cx + gridIndex * gridWidth;
    
    const elements = [];
    const weightHeight = 12;
    const weightWidth = 16;
    
    // 画吊线 (深色以求高可读性)
    elements.push(
      <line
        key="hang-line"
        x1={xPos}
        y1="0"
        x2={xPos}
        y2="15"
        stroke="#4a5568"
        strokeWidth="1.5"
      />
    );

    // 堆叠绘制钩码 (银灰色金属质感配深色轮廓)
    for (let i = 0; i < count; i++) {
      const yOffset = 15 + i * (weightHeight + 2);
      elements.push(
        <g key={`w-${i}`} transform={`translate(${xPos - weightWidth/2}, ${yOffset})`}>
          <rect
            width={weightWidth}
            height={weightHeight}
            fill="#e2e8f0"
            stroke="#4a5568"
            strokeWidth="1.2"
            rx="1"
          />
          <path d="M 5 0 Q 8 -3.5 11 0" fill="none" stroke="#4a5568" strokeWidth="1.2" />
          <path d="M 8 12 Q 8 14.5 11 14.5" fill="none" stroke="#4a5568" strokeWidth="1.2" />
        </g>
      );
    }

    return <g>{elements}</g>;
  };

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 头部 */}
      <div>
        <span className="badge badge-work" style={{ marginBottom: '6px' }}>交互实验</span>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>杠杆平衡条件实验室</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          设置左侧和右侧的**挂钩格数**与**钩码数量**。观察杠杆在两端力矩不等时的物理倾斜，并寻找让杠杆重新恢复**水平平衡**的数字组合！
        </p>
      </div>

      {/* 控制台 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.9rem' }}>
        {/* 左侧调节 */}
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsla(var(--color-mech) / 0.05)', border: '1px solid hsla(var(--color-mech) / 0.1)' }}>
          <div style={{ fontWeight: 'bold', color: 'hsl(var(--color-mech))', marginBottom: '10px' }}>动力端 (左侧)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>动力臂 L₁ (距离):</span>
              <select className="input-field" style={{ width: '90px', padding: '4px', border: '1px solid hsl(var(--border))' }} value={leftGrid} onChange={(e) => setLeftGrid(parseInt(e.target.value))}>
                <option value="1">1 格 (10cm)</option>
                <option value="2">2 格 (20cm)</option>
                <option value="3">3 格 (30cm)</option>
                <option value="4">4 格 (40cm)</option>
                <option value="5">5 格 (50cm)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>动力 F₁ (挂码数):</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: leftWeights === num ? 'hsl(var(--color-mech))' : '', color: leftWeights === num ? 'white' : '' }}
                    onClick={() => setLeftWeights(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧调节 */}
        <div style={{ padding: '12px', borderRadius: 'var(--radius-md)', backgroundColor: 'hsla(var(--color-work) / 0.05)', border: '1px solid hsla(var(--color-work) / 0.1)' }}>
          <div style={{ fontWeight: 'bold', color: 'hsl(var(--color-work))', marginBottom: '10px' }}>阻力端 (右侧)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>阻力臂 L₂ (距离):</span>
              <select className="input-field" style={{ width: '90px', padding: '4px', border: '1px solid hsl(var(--border))' }} value={rightGrid} onChange={(e) => setRightGrid(parseInt(e.target.value))}>
                <option value="1">1 格 (10cm)</option>
                <option value="2">2 格 (20cm)</option>
                <option value="3">3 格 (30cm)</option>
                <option value="4">4 格 (40cm)</option>
                <option value="5">5 格 (50cm)</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>阻力 F₂ (挂码数):</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: rightWeights === num ? 'hsl(var(--color-work))' : '', color: rightWeights === num ? 'white' : '' }}
                    onClick={() => setRightWeights(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG 动画视窗 (亮色版) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', padding: '16px', color: 'hsl(var(--text-primary))', position: 'relative' }}>
        
        {/* 顶部状态提示栏 */}
        <div style={{
          textAlign: 'center',
          fontWeight: 'bold',
          color: statusColor,
          fontSize: '0.92rem',
          padding: '4px 14px',
          borderRadius: '20px',
          backgroundColor: '#f7fafc',
          border: '1px solid #edf2f7',
          alignSelf: 'center',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          {statusText}
        </div>

        {/* 杠杆主 SVG */}
        <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <svg width="500" height="230" viewBox="0 0 500 230" style={{ maxWidth: '500px' }}>
            {/* 支点 (固定三角形) */}
            <polygon points={`${cx},${cy} ${cx-14},${cy+32} ${cx+14},${cy+32}`} fill="#cbd5e0" stroke="#718096" strokeWidth="1.5" />
            <circle cx={cx} cy={cy} r="4" fill="hsl(var(--color-mech))" />
            <text x={cx} y={cy + 45} fill="#718096" fontSize="10.5" fontWeight="bold" textAnchor="middle">支点 O</text>

            {/* 随动旋转部分 */}
            <g transform={`rotate(${rotateAngle}, ${cx}, ${cy})`}>
              {/* 杠杆尺体 */}
              <rect x="35" y={cy - 6} width="430" height="12" fill="#ecc94b" stroke="#d69e2e" strokeWidth="1.5" rx="3" />
              
              {/* 中央插销孔 */}
              <circle cx={cx} cy={cy} r="3" fill="#2d3748" />

              {/* 左侧刻度 (1 ~ 5) */}
              {[1, 2, 3, 4, 5].map((i) => {
                const x = cx - i * gridWidth;
                return (
                  <g key={`l-grid-${i}`}>
                    <line x1={x} y1={cy - 6} x2={x} y2={cy + 6} stroke="#5c3a21" strokeWidth="1.2" />
                    <text x={x} y={cy - 10} fill="#5c3a21" fontSize="9.5" fontWeight="bold" textAnchor="middle">{i}</text>
                    <circle cx={x} cy={cy + 6} r="2" fill="#5c3a21" />
                  </g>
                );
              })}

              {/* 右侧刻度 (1 ~ 5) */}
              {[1, 2, 3, 4, 5].map((i) => {
                const x = cx + i * gridWidth;
                return (
                  <g key={`r-grid-${i}`}>
                    <line x1={x} y1={cy - 6} x2={x} y2={cy + 6} stroke="#5c3a21" strokeWidth="1.2" />
                    <text x={x} y={cy - 10} fill="#5c3a21" fontSize="9.5" fontWeight="bold" textAnchor="middle">{i}</text>
                    <circle cx={x} cy={cy + 6} r="2" fill="#5c3a21" />
                  </g>
                );
              })}

              {/* 渲染吊在杠杆上的钩码 */}
              <g transform={`translate(0, ${cy + 6})`}>
                {renderWeights(true, leftGrid, leftWeights)}
                {renderWeights(false, rightGrid, rightWeights)}
              </g>
            </g>
          </svg>
        </div>

        {/* 物理算式拆解 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #edf2f7',
          paddingTop: '12px',
          fontSize: '0.82rem',
          fontFamily: 'monospace',
          paddingLeft: '10px',
          paddingRight: '10px'
        }}>
          {/* 左侧计算 */}
          <div style={{ textAlign: 'left', color: 'hsl(var(--color-mech))', flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>左侧力矩 (F₁ × L₁)：</div>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '2px' }}>
              {F1.toFixed(1)} N × {L1.toFixed(1)} m = {torqueLeft.toFixed(2)} N·m
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
              ({leftWeights}个码 × {leftGrid}格距离)
            </div>
          </div>

          {/* 两者比较符号 */}
          <div style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            padding: '3px 12px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            color: Math.abs(torqueDiff) < 0.001 ? 'hsl(var(--color-success))' : '#4a5568',
            margin: '0 20px',
            textAlign: 'center'
          }}>
            {Math.abs(torqueDiff) < 0.001 ? '=' : torqueDiff > 0 ? '>' : '<'}
          </div>

          {/* 右侧计算 */}
          <div style={{ textAlign: 'right', color: 'hsl(var(--color-work))', flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>右侧力矩 (F₂ × L₂)：</div>
            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '2px' }}>
              {F2.toFixed(1)} N × {L2.toFixed(1)} m = {torqueRight.toFixed(2)} N·m
            </div>
            <div style={{ opacity: 0.7, fontSize: '0.75rem' }}>
              ({rightWeights}个码 × {rightGrid}格距离)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
