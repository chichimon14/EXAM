import React, { useState } from 'react';

export default function BuoyancySimulator() {
  const [submergeY, setSubmergeY] = useState(0); // 浸入深度 (0 ~ 100 像素)
  const [liquid, setLiquid] = useState('water'); // water, salt, alcohol

  // 物理常量设置
  const g = 10;
  const objectWeight = 4.0; // 物体在空气中的重力 G = 4.0 N
  const objectVolume = 0.0003; // 物体体积 300 cm³

  // 液体密度 (kg/m³)
  let rho = 1000;
  let liquidName = '水';
  if (liquid === 'salt') {
    rho = 1200;
    liquidName = '浓盐水';
  } else if (liquid === 'alcohol') {
    rho = 800;
    liquidName = '酒精';
  }

  // 浸入比例 (0.0 ~ 1.0)
  const maxSubmergePixel = 80;
  const submergeRatio = Math.min(1.0, submergeY / maxSubmergePixel);

  // 计算排开液体的体积 V_排 (m³)
  const vPai = objectVolume * submergeRatio;

  // 阿基米德原理计算浮力: F_浮 = rho_液 * g * V_排
  const buoyancy = rho * g * vPai; // N

  // 测力计拉力示数: F_示 = G - F_浮
  const springForce = Math.max(0, objectWeight - buoyancy);

  // SVG 相关位置
  const cupWaterTop = 180; // 杯子静止水面高度
  const blockHeight = 60; // 物块高度
  const blockWidth = 60;

  // 随着物块浸入，水面稍微抬高 (最多抬高 10 像素)
  const waterLevelElevation = 10 * submergeRatio;
  const currentWaterY = cupWaterTop - waterLevelElevation;

  // 物块中心 y 坐标计算
  const blockTop = 90 + submergeY;
  const blockCenterY = blockTop + blockHeight / 2;
  const blockCenterX = 180;

  // 力的箭头缩放因子 (1 N 代表 35 像素)
  const scale = 35;

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 头部标题 */}
      <div>
        <span className="badge badge-mech" style={{ marginBottom: '6px' }}>交互实验</span>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>浸入式浮力受力分析仪</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          拖动下方滑块让物块**浸入液体**。注意观察：浸没前，浮力如何变化；**完全浸没后**，深度增加时，浮力和测力计示数是否改变。
        </p>
      </div>

      {/* 控制台 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center', fontSize: '0.9rem' }}>
        <div>
          <label style={{ marginRight: '8px', fontWeight: 600 }}>选择液体种类：</label>
          <select
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', border: '1px solid hsl(var(--border))' }}
            value={liquid}
            onChange={(e) => setLiquid(e.target.value)}
          >
            <option value="water">清水 (ρ = 1.0 × 10³ kg/m³)</option>
            <option value="salt">浓盐水 (ρ = 1.2 × 10³ kg/m³)</option>
            <option value="alcohol">酒精 (ρ = 0.8 × 10³ kg/m³)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>调整浸入深度：</span>
          <input
            type="range"
            min="0"
            max="120"
            style={{ flex: 1, accentColor: 'hsl(var(--color-mech))' }}
            value={submergeY}
            onChange={(e) => setSubmergeY(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* 实验演示图 (亮色化) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', backgroundColor: '#ffffff', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', padding: '16px', color: 'hsl(var(--text-primary))' }}>
        
        {/* SVG 受力动画 */}
        <div style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
          <svg width="280" height="340" viewBox="0 0 280 340" style={{ maxWidth: '280px' }}>
            {/* 烧杯 */}
            <rect x="110" y="160" width="140" height="150" fill="none" stroke="#718096" strokeWidth="2.5" rx="4" />

            {/* 烧杯内的水 (受浸入挤压动态上涨，亮色淡蓝) */}
            <rect x="112" y={currentWaterY} width="136" height={310 - currentWaterY} fill="rgba(49, 130, 206, 0.16)" />
            {/* 动态水面线 */}
            <line x1="112" y1={currentWaterY} x2="248" y2={currentWaterY} stroke="#3182ce" strokeWidth="2" />

            {/* 弹簧测力计外壳 (金属亮灰色) */}
            <rect x="160" y="10" width="40" height="70" fill="#f7fafc" stroke="#a0aec0" strokeWidth="2" rx="2" />
            {/* 弹簧吊线 */}
            <line x1="180" y1="80" x2="180" y2={blockTop} stroke="#4a5568" strokeWidth="1.5" />

            {/* 弹簧测力计刻度线与示数 */}
            <line x1="170" y1="15" x2="170" y2="65" stroke="#718096" strokeWidth="1" />
            {[0, 1, 2, 3, 4].map(tick => (
              <line key={tick} x1="168" y1={15 + tick * 12.5} x2="172" y2={15 + tick * 12.5} stroke="#718096" strokeWidth="1" />
            ))}
            {/* 指针 */}
            {(() => {
              const indicatorY = 15 + (springForce / 4.0) * 50;
              return (
                <>
                  <line x1="165" y1={indicatorY} x2="175" y2={indicatorY} stroke="#e53e3e" strokeWidth="2.5" />
                  <text x="180" y="46" fill="#2d3748" fontSize="12" fontWeight="bold" textAnchor="middle">
                    {springForce.toFixed(2)} N
                  </text>
                </>
              );
            })()}

            {/* 物块 */}
            <rect
              x={blockCenterX - blockWidth / 2}
              y={blockTop}
              width={blockWidth}
              height={blockHeight}
              fill="rgba(217, 119, 6, 0.12)"
              stroke="hsl(var(--color-optics))"
              strokeWidth="2.5"
              rx="2"
            />
            {/* 物块挂钩 */}
            <path d={`M ${blockCenterX - 5} ${blockTop} Q ${blockCenterX} ${blockTop - 8} ${blockCenterX + 5} ${blockTop}`} fill="none" stroke="hsl(var(--color-optics))" strokeWidth="2" />

            {/* 力的受力分析箭头 (高对比度着色) */}
            {/* 1. 重力 G：向下，深红 */}
            <line
              x1={blockCenterX}
              y1={blockCenterY}
              x2={blockCenterX}
              y2={blockCenterY + objectWeight * scale}
              stroke="#e53e3e"
              strokeWidth="3.5"
              markerEnd="url(#arrow-down-light)"
            />
            <text x={blockCenterX + 12} y={blockCenterY + objectWeight * scale - 4} fill="#e53e3e" fontSize="10.5" fontWeight="bold">
              G = {objectWeight.toFixed(1)}N
            </text>

            {/* 2. 浮力 F_浮：向上，深蓝 */}
            {buoyancy > 0.05 && (
              <>
                <line
                  x1={blockCenterX - 5}
                  y1={blockCenterY}
                  x2={blockCenterX - 5}
                  y2={blockCenterY - buoyancy * scale}
                  stroke="#2b6cb0"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow-up-light)"
                />
                <text x={blockCenterX - 18} y={blockCenterY - buoyancy * scale + 12} fill="#2b6cb0" fontSize="10.5" fontWeight="bold" textAnchor="end">
                  F浮 = {buoyancy.toFixed(2)}N
                </text>
              </>
            )}

            {/* 3. 拉力 F_拉：向上，深绿 */}
            {springForce > 0.05 && (
              <>
                <line
                  x1={blockCenterX + 5}
                  y1={blockCenterY}
                  x2={blockCenterX + 5}
                  y2={blockCenterY - springForce * scale}
                  stroke="#2f855a"
                  strokeWidth="3.5"
                  markerEnd="url(#arrow-up-light2)"
                />
                <text x={blockCenterX + 16} y={blockCenterY - springForce * scale + 12} fill="#2f855a" fontSize="10.5" fontWeight="bold" textAnchor="start">
                  F拉 = {springForce.toFixed(2)}N
                </text>
              </>
            )}

            {/* SVG 箭头定义 */}
            <defs>
              <marker id="arrow-down-light" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#e53e3e" />
              </marker>
              <marker id="arrow-up-light" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="270">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2b6cb0" />
              </marker>
              <marker id="arrow-up-light2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="270">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2f855a" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* 物理过程推导与数据看板 */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', fontSize: '0.85rem' }}>
          <div>
            <div style={{ color: '#4a5568', marginBottom: '2px', fontWeight: 'bold' }}>📊 实验状态</div>
            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'hsl(var(--color-mech))' }}>
              {submergeY === 0 ? '完全悬挂于空气中' : submergeRatio < 1.0 ? '物块部分浸入液体中' : '物块完全浸没于液体'}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '10px' }}>
            <div style={{ color: '#4a5568', fontWeight: 'bold' }}>1. 称重法计算浮力</div>
            <div style={{ fontFamily: 'monospace', marginTop: '4px', fontSize: '0.82rem' }}>
              F<sub>浮</sub> = G - F<sub>示</sub> <br />
              = 4.00 N - {springForce.toFixed(2)} N <br />
              = <span style={{ color: 'hsl(var(--color-success))', fontWeight: 'bold' }}>{buoyancy.toFixed(2)} N</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '10px' }}>
            <div style={{ color: '#4a5568', fontWeight: 'bold' }}>2. 阿基米德原理计算</div>
            <div style={{ fontFamily: 'monospace', marginTop: '4px', fontSize: '0.82rem' }}>
              F<sub>浮</sub> = ρ<sub>液</sub> g V<sub>排</sub> <br />
              = {rho} kg/m³ × 10 N/kg × {(vPai * 1000000).toFixed(0)} cm³ <br />
              = <span style={{ color: 'hsl(var(--color-mech))', fontWeight: 'bold' }}>{buoyancy.toFixed(2)} N</span>
            </div>
          </div>

          <div style={{
            fontSize: '0.78rem',
            color: 'hsl(var(--color-optics))',
            backgroundColor: 'rgba(217, 119, 6, 0.05)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(217, 119, 6, 0.15)'
          }}>
            💡 <b>物理名师避坑：</b><br />
            完全浸没后，排开液体的体积达到了最大值。此时即使你将物块继续向下推（增加深度），物体受到的<b>浮力也保持恒定不变</b>！
          </div>
        </div>
      </div>
    </div>
  );
}
