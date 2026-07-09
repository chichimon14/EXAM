import React, { useState } from 'react';

export default function LensImaging() {
  const f = 60; // 焦距刻度常量 (像素)
  const [uVal, setUVal] = useState(130); // 拖动改变的物距 (像素, 范围 35 ~ 240)

  // 凸透镜中心 x 坐标
  const lensX = 250;
  // 主光轴 y 坐标
  const axisY = 160;
  // 蜡烛高度
  const objectHeight = 50;

  // 物距 u 最小值为 35 防止超出边界
  const u = Math.max(35, uVal);

  // 计算像的位置 v 和像高 h_image
  let v = 0;
  let isReal = true;
  let noImage = false;
  let imageX = 0;
  let imageHeight = 0;

  if (Math.abs(u - f) < 3) {
    // 焦点上，不成像
    noImage = true;
  } else if (u > f) {
    // 实像公式: 1/u + 1/v = 1/f => v = (u * f) / (u - f)
    v = (u * f) / (u - f);
    isReal = true;
    imageX = lensX + v;
    imageHeight = objectHeight * (v / u); // 放大倍率 v / u
  } else {
    // 虚像公式: v' = (u * f) / (f - u)
    v = (u * f) / (f - u);
    isReal = false;
    imageX = lensX - v;
    imageHeight = objectHeight * (v / u);
  }

  // 计算三条特殊光线
  const objTopY = axisY - objectHeight;
  const objX = lensX - u;

  // 判定成像特征和典型应用
  let resultText = '';
  let appText = '';
  if (noImage) {
    resultText = '不成像 (折射光线平行，无法会聚)';
    appText = '探照灯/强光手电筒';
  } else if (isReal) {
    const scale = u / f;
    if (scale > 2) {
      resultText = '倒立、缩小的实像';
      appText = '照相机 / 摄像机';
    } else if (Math.abs(scale - 2) < 0.05) {
      resultText = '倒立、等大的实像';
      appText = '测焦距实验';
    } else {
      resultText = '倒立、放大的实像';
      appText = '投影仪 / 幻灯机 / 电影放映机';
    }
  } else {
    resultText = '正立、放大的虚像';
    appText = '放大镜';
  }

  return (
    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* 头部标题 */}
      <div>
        <span className="badge badge-optics" style={{ marginBottom: '6px' }}>交互实验</span>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '2px' }}>凸透镜成像规律实验室</h3>
        <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>
          拖动左侧的**红色蜡烛手柄**或使用**滑动条**改变物距 u，实时探究在不同位置时光屏上的成像规律。
        </p>
      </div>

      {/* 控制条 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'center', fontSize: '0.9rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>物距 u：{Math.round(u)} cm</span>
          <input
            type="range"
            min="35"
            max="220"
            style={{ flex: 1, accentColor: 'hsl(var(--color-optics))' }}
            value={uVal}
            onChange={(e) => setUVal(parseInt(e.target.value))}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600 }}>焦距 f：{f} cm (固定)</span>
          <span style={{ opacity: 0.7, fontSize: '0.8rem', fontWeight: 'bold' }}>【 2f点 = {f * 2} cm 】</span>
        </div>
      </div>

      {/* 动画展示屏 (亮色优化) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff', border: '1px solid #edf2f7', borderRadius: 'var(--radius-md)', padding: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <svg width="600" height="300" viewBox="0 0 600 300" style={{ minWidth: '600px', display: 'block', margin: '0 auto' }}>
            {/* 主光轴 */}
            <line x1="10" y1={axisY} x2="590" y2={axisY} stroke="#718096" strokeWidth="2" />
            <text x="580" y={axisY - 8} fill="#718096" fontSize="10" fontWeight="bold">主光轴</text>

            {/* 刻度点标记 (F1, 2F1, F2, 2F2) */}
            {/* 左侧焦点 F1 */}
            <circle cx={lensX - f} cy={axisY} r="3.5" fill="#d69e2e" />
            <text x={lensX - f} y={axisY + 16} fill="#d69e2e" fontSize="10" fontWeight="bold" textAnchor="middle">F</text>
            {/* 左侧二倍焦距 2F1 */}
            <circle cx={lensX - 2 * f} cy={axisY} r="3.5" fill="#e67e22" />
            <text x={lensX - 2 * f} y={axisY + 16} fill="#e67e22" fontSize="10" fontWeight="bold" textAnchor="middle">2F</text>

            {/* 右侧焦点 F2 */}
            <circle cx={lensX + f} cy={axisY} r="3.5" fill="#d69e2e" />
            <text x={lensX + f} y={axisY + 16} fill="#d69e2e" fontSize="10" fontWeight="bold" textAnchor="middle">F</text>
            {/* 右侧二倍焦距 2F2 */}
            <circle cx={lensX + 2 * f} cy={axisY} r="3.5" fill="#e67e22" />
            <text x={lensX + 2 * f} y={axisY + 16} fill="#e67e22" fontSize="10" fontWeight="bold" textAnchor="middle">2F</text>

            {/* 凸透镜 (在 lensX) */}
            <path
              d={`M ${lensX} ${axisY - 110} Q ${lensX + 16} ${axisY} ${lensX} ${axisY + 110} Q ${lensX - 16} ${axisY} ${lensX} ${axisY - 110}`}
              fill="rgba(49, 130, 206, 0.15)"
              stroke="#3182ce"
              strokeWidth="2.5"
            />
            <text x={lensX} y={axisY - 116} fill="#2b6cb0" fontSize="11" fontWeight="bold" textAnchor="middle">凸透镜</text>

            {/* 1. 绘制物 (蜡烛) */}
            <rect x={objX - 3} y={objTopY} width="6" height={objectHeight} fill="#e53e3e" rx="2" />
            {/* 烛焰 */}
            <path
              d={`M ${objX} ${objTopY} Q ${objX - 6} ${objTopY - 12} ${objX} ${objTopY - 22} Q ${objX + 6} ${objTopY - 12} ${objX} ${objTopY}`}
              fill="url(#candleFlame)"
            />
            <text x={objX} y={axisY + 32} fill="#e53e3e" fontSize="10.5" fontWeight="bold" textAnchor="middle">物 (蜡烛)</text>
            
            {/* 拖动提示手柄 */}
            <circle
              cx={objX}
              cy={axisY}
              r="7"
              fill="#fff"
              className="interactive-handle"
              style={{ stroke: '#e53e3e', strokeWidth: '3px', cursor: 'ew-resize' }}
              onMouseDown={(e) => {
                const handleMove = (moveEvent) => {
                  const svgEl = moveEvent.target.ownerSVGElement || moveEvent.target;
                  const rect = svgEl.getBoundingClientRect();
                  const x = moveEvent.clientX - rect.left;
                  const newU = lensX - x;
                  if (newU > 35 && newU < 240) {
                    setUVal(Math.round(newU));
                  }
                };
                const handleUp = () => {
                  window.removeEventListener('mousemove', handleMove);
                  window.removeEventListener('mouseup', handleUp);
                };
                window.addEventListener('mousemove', handleMove);
                window.addEventListener('mouseup', handleUp);
              }}
            />

            {/* 2. 绘制特殊光线与成像 */}
            {!noImage && (
              <>
                {/* 像 (蜡烛的像) */}
                {isReal ? (
                  <g opacity="0.95">
                    {/* 像的杆 */}
                    <rect x={imageX - 2.5} y={axisY} width="5" height={imageHeight} fill="rgba(229, 62, 62, 0.75)" rx="1.5" />
                    {/* 像的烛焰 (倒立) */}
                    <path
                      d={`M ${imageX} ${axisY + imageHeight} Q ${imageX - 5} ${axisY + imageHeight + 10} ${imageX} ${axisY + imageHeight + 18} Q ${imageX + 5} ${axisY + imageHeight + 10} ${imageX} ${axisY + imageHeight}`}
                      fill="url(#candleFlame)"
                      transform={`rotate(180, ${imageX}, ${axisY + imageHeight})`}
                    />
                    {/* 标出光屏位置 */}
                    <line x1={imageX} y1={axisY - 95} x2={imageX} y2={axisY + 95} stroke="#38a169" strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x={imageX} y={axisY + imageHeight + 32} fill="#2f855a" fontSize="10.5" fontWeight="bold" textAnchor="middle">像 (光屏位置)</text>
                  </g>
                ) : (
                  // 虚像：正立，放大，呈在左侧 (imageX, axisY) 到 (imageX, axisY - imageHeight)，半透明虚线
                  <g opacity="0.6" strokeDasharray="4,2">
                    <rect x={imageX - 3} y={axisY - imageHeight} width="6" height={imageHeight} fill="#e53e3e" rx="2" />
                    <path
                      d={`M ${imageX} ${axisY - imageHeight} Q ${imageX - 6} ${axisY - imageHeight - 12} ${imageX} ${axisY - imageHeight - 22} Q ${imageX + 6} ${axisY - imageHeight - 12} ${imageX} ${axisY - imageHeight}`}
                      fill="url(#candleFlame)"
                    />
                    <text x={imageX} y={axisY - imageHeight - 26} fill="#4a5568" fontSize="10.5" fontWeight="bold" textAnchor="middle">正立放大虚像</text>
                  </g>
                )}

                {/* 光线一：平行于主光轴的光线，经折射后过焦点 F2 */}
                <line x1={objX} y1={objTopY} x2={lensX} y2={objTopY} stroke="#d69e2e" strokeWidth="2" />
                {isReal ? (
                  <line x1={lensX} y1={objTopY} x2={imageX} y2={axisY + imageHeight} stroke="#d69e2e" strokeWidth="2" />
                ) : (
                  <>
                    <line x1={lensX} y1={objTopY} x2={lensX + 150} y2={objTopY + (objTopY - (axisY - imageHeight)) * (150 / v)} stroke="#d69e2e" strokeWidth="2" />
                    <line x1={imageX} y1={axisY - imageHeight} x2={lensX} y2={objTopY} stroke="#d69e2e" strokeWidth="1.2" strokeDasharray="4,4" />
                  </>
                )}

                {/* 光线二：过光心的光线，方向不改变 */}
                {isReal ? (
                  <line x1={objX} y1={objTopY} x2={imageX} y2={axisY + imageHeight} stroke="#e53e3e" strokeWidth="2" />
                ) : (
                  <>
                    <line x1={lensX} y1={axisY + (axisY - objTopY) * (lensX / u)} x2={lensX + 150} y2={axisY + (axisY - objTopY) * ((lensX + 150) / u)} stroke="#e53e3e" strokeWidth="2" />
                    <line x1={objX} y1={objTopY} x2={lensX} y2={axisY} stroke="#e53e3e" strokeWidth="2" />
                    <line x1={imageX} y1={axisY - imageHeight} x2={objX} y2={objTopY} stroke="#e53e3e" strokeWidth="1.2" strokeDasharray="4,4" />
                  </>
                )}
              </>
            )}

            {/* 烛焰渐变定义 */}
            <defs>
              <radialGradient id="candleFlame" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="30%" stopColor="#ffea00" />
                <stop offset="70%" stopColor="#ff5500" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ff0000" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* 成像结论展示面板 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          borderTop: '1px solid #edf2f7',
          paddingTop: '12px',
          fontSize: '0.85rem'
        }}>
          <div>
            <span style={{ opacity: 0.6 }}>物理位置关系：</span>
            <div style={{ fontWeight: 'bold', marginTop: '2px', color: 'hsl(var(--color-optics))' }}>
              {noImage ? '物位于焦点上' : u > 2 * f ? '物在二倍焦距以外 (u > 2f)' : Math.abs(u - 2 * f) < 3 ? '物在二倍焦距点上 (u = 2f)' : u > f ? '物在一倍到二倍焦距间 (f < u < 2f)' : '物在一倍焦距以内 (u < f)'}
            </div>
          </div>
          <div>
            <span style={{ opacity: 0.6 }}>成像基本性质：</span>
            <div style={{ fontWeight: 'bold', marginTop: '2px', color: 'hsl(var(--color-success))' }}>
              {resultText}
            </div>
          </div>
          <div>
            <span style={{ opacity: 0.6 }}>中考重点应用：</span>
            <div style={{ fontWeight: 'bold', marginTop: '2px', color: 'hsl(var(--color-mech))' }}>
              {appText}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
