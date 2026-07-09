import React, { useState, useRef, useEffect } from 'react';

export default function LightReflectRefract() {
  const [angleI, setAngleI] = useState(45); // 入射角 (度数, 0 - 80)
  const [medium, setMedium] = useState('water'); // water 或 glass
  const svgRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const n = medium === 'water' ? 1.33 : 1.5;

  const radI = (angleI * Math.PI) / 180;
  const angleR = angleI;
  const sinR = Math.sin(radI) / n;
  const radR = Math.asin(sinR);
  const angleRefract = (radR * 180) / Math.PI;

  const cx = 250;
  const cy = 200;
  const r = 160; 

  const ix = cx - r * Math.sin(radI);
  const iy = cy - r * Math.cos(radI);

  const rx = cx + r * Math.sin(radI);
  const ry = cy - r * Math.cos(radI);

  const rfx = cx + r * Math.sin(radR);
  const rfy = cy + r * Math.cos(radR);

  const handleSvgMove = (e) => {
    if (!isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const dx = cx - mx; 
    const dy = cy - my; 

    if (dy > 5) { 
      let angle = Math.atan2(dx, dy) * (180 / Math.PI);
      if (angle < 0) angle = 0;
      if (angle > 80) angle = 80;
      setAngleI(Math.round(angle));
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 实验标题 */}
      <div>
        <span className="badge badge-optics" style={{ marginBottom: '6px' }}>交互实验</span>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>光的反射与折射实验室</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          拖拽左上角的**黄色光源点**或使用**下方滑动条**，观察光在明亮介质面上的偏折状态。
        </p>
      </div>

      {/* 介质选择与控制面板 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem' }}>
        <div>
          <label style={{ marginRight: '8px', fontWeight: 600 }}>选择下层介质：</label>
          <select
            className="input-field"
            style={{ width: 'auto', padding: '6px 12px', border: '1px solid hsl(var(--border))' }}
            value={medium}
            onChange={(e) => setMedium(e.target.value)}
          >
            <option value="water">水 (折射率 n ≈ 1.33)</option>
            <option value="glass">玻璃 (折射率 n ≈ 1.50)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>入射角：{angleI}°</label>
          <input
            type="range"
            min="0"
            max="80"
            style={{ flex: 1, accentColor: 'hsl(var(--color-optics))' }}
            value={angleI}
            onChange={(e) => setAngleI(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* SVG 实验区 (亮色背景优化) */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', backgroundColor: '#ffffff', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', padding: '10px', overflow: 'hidden' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="380"
          viewBox="0 0 500 380"
          style={{ cursor: isDragging ? 'grabbing' : 'default', maxWidth: '500px' }}
          onMouseMove={handleSvgMove}
          onMouseDown={() => setIsDragging(true)}
        >
          {/* 上半部分：空气 (淡灰白) */}
          <rect x="0" y="0" width="500" height="200" fill="#f8fafc" />
          <text x="20" y="30" fill="#4a5568" fontSize="12" fontWeight="bold" opacity="0.8">空气</text>

          {/* 下半部分：介质 (水用淡蓝，玻璃用淡青色) */}
          <rect
            x="0"
            y="200"
            width="500"
            height="180"
            fill={medium === 'water' ? 'rgba(49, 130, 206, 0.18)' : 'rgba(44, 122, 123, 0.18)'}
          />
          <text x="20" y="230" fill={medium === 'water' ? '#2b6cb0' : '#2c7a7b'} opacity="0.9" fontSize="12" fontWeight="bold">
            {medium === 'water' ? '水 (液体)' : '玻璃 (固体)'}
          </text>

          {/* 介质分界面 */}
          <line x1="0" y1="200" x2="500" y2="200" stroke="#718096" strokeWidth="2.5" />

          {/* 法线 */}
          <line x1="250" y1="20" x2="250" y2="360" stroke="#4a5568" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x="260" y="40" fill="#4a5568" fontSize="10.5" fontWeight="bold">法线 NN'</text>

          {/* 角度标注 (亮色加深) */}
          {angleI > 5 && (
            <>
              {/* 入射角弧线 */}
              <path
                d={`M 250 ${200 - 35} A 35 35 0 0 0 ${250 - 35 * Math.sin(radI)} ${200 - 35 * Math.cos(radI)}`}
                fill="none"
                stroke="#b7791f"
                strokeWidth="1.8"
              />
              <text x={235 - 12 * Math.sin(radI)} y={170} fill="#b7791f" fontSize="11" fontWeight="bold" textAnchor="end">
                i={angleI}°
              </text>

              {/* 反射角弧线 */}
              <path
                d={`M ${250 + 35 * Math.sin(radI)} ${200 - 35 * Math.cos(radI)} A 35 35 0 0 0 250 ${200 - 35}`}
                fill="none"
                stroke="#c05621"
                strokeWidth="1.8"
              />
              <text x={265 + 12 * Math.sin(radI)} y={170} fill="#c05621" fontSize="11" fontWeight="bold" textAnchor="start">
                r={angleR}°
              </text>

              {/* 折射角弧线 */}
              <path
                d={`M 250 ${200 + 40} A 40 40 0 0 0 ${250 + 40 * Math.sin(radR)} ${200 + 40 * Math.cos(radR)}`}
                fill="none"
                stroke="#2b6cb0"
                strokeWidth="1.8"
              />
              <text x={262 + 18 * Math.sin(radR)} y={235} fill="#2b6cb0" fontSize="11" fontWeight="bold" textAnchor="start">
                r'={Math.round(angleRefract)}°
              </text>
            </>
          )}

          {/* 入射光线 (高对比度深金黄) */}
          <line x1={ix} y1={iy} x2={cx} y2={cy} stroke="#d69e2e" strokeWidth="3.5" strokeLinecap="round" />
          {/* 反射光线 (深橙) */}
          <line x1={cx} y1={cy} x2={rx} y2={ry} stroke="#e67e22" strokeWidth="3" strokeLinecap="round" />
          {/* 折射光线 (皇家蓝) */}
          <line x1={cx} y1={cy} x2={rfx} y2={rfy} stroke="#2980b9" strokeWidth="3.5" strokeLinecap="round" />

          {/* 入射点中心圆圈 */}
          <circle cx={cx} cy={cy} r="4.5" fill="#fff" stroke="#d69e2e" strokeWidth="2" />

          {/* 可拖拽的光源手柄 */}
          <g transform={`translate(${ix}, ${iy})`}>
            <circle
              cx="0"
              cy="0"
              r="10"
              fill="#fff"
              className="interactive-handle"
              style={{ stroke: '#d69e2e', strokeWidth: '3px' }}
              onMouseDown={() => setIsDragging(true)}
            />
            <circle cx="0" cy="0" r="3" fill="#d69e2e" pointerEvents="none" />
            <text x="14" y="4" fill="#b7791f" fontSize="10.5" fontWeight="bold" pointerEvents="none">光源 (可拖动)</text>
          </g>

          {/* 光线粒子动画效果 (改为在亮色下可见的深色小圆点) */}
          {angleI > 0 && (
            <>
              <circle r="3.5" fill="#b7791f">
                <animateMotion
                  path={`M ${ix} ${iy} L ${cx} ${cy}`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="3" fill="#2b6cb0">
                <animateMotion
                  path={`M ${cx} ${cy} L ${rfx} ${rfy}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </>
          )}
        </svg>

        {/* 右上角快捷结论小窗 (亮色玻璃拟态) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          color: '#2d3748',
          maxWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ fontWeight: 'bold', color: 'hsl(var(--color-optics))', marginBottom: '6px' }}>📝 中考常备结论：</div>
          <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: '1.4' }}>
            <li>反射角 <b>等于</b> 入射角。</li>
            <li>光从空气斜射入水/玻璃，折射光线<b>偏向法线</b>，折射角 <b>小于</b> 入射角。</li>
            <li>入射角增大时，反射角和折射角<b>随之增大</b>。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
