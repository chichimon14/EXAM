import React from 'react';
import { blocks } from '../data/physicsData';

export default function RadarChart({ scores = {} }) {
  // 5个顶点对应的板块
  // 顺时针顺序对应雷达图顶点
  const radarBlocks = blocks; // 长度为 5
  
  const cx = 150; // 中心点 x
  const cy = 140; // 中心点 y
  const R = 85;   // 最大半径
  
  // 5个方向的角度 (弧度值)，从正上方 (i=0) 开始顺时针旋转
  // 0度在最上方：angle = 0
  const getAngle = (i) => {
    return (i * 2 * Math.PI) / 5;
  };

  // 生成同心多边形网格背景 (比如 4 层，分别代表 25%, 50%, 75%, 100%)
  const renderBackgroundGrids = () => {
    const levels = [0.25, 0.5, 0.75, 1.0];
    return levels.map((lvl, index) => {
      const points = radarBlocks.map((_, i) => {
        const angle = getAngle(i);
        const r = R * lvl;
        const x = cx + r * Math.sin(angle);
        const y = cy - r * Math.cos(angle);
        return `${x},${y}`;
      }).join(' ');

      return (
        <polygon
          key={`grid-${index}`}
          points={points}
          fill="none"
          stroke="hsla(var(--text-secondary) / 0.15)"
          strokeWidth="1"
          strokeDasharray={index === 3 ? 'none' : '3,2'}
        />
      );
    });
  };

  // 绘制中心到顶点的辐条线
  const renderAxisLines = () => {
    return radarBlocks.map((_, i) => {
      const angle = getAngle(i);
      const x = cx + R * Math.sin(angle);
      const y = cy - R * Math.cos(angle);
      return (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={x}
          y2={y}
          stroke="hsla(var(--text-secondary) / 0.15)"
          strokeWidth="1"
        />
      );
    });
  };

  // 绘制得分多边形
  const renderScorePolygon = () => {
    const points = radarBlocks.map((b, i) => {
      const angle = getAngle(i);
      // 得分，没有做过题的默认为 0
      const score = scores[b.id] !== undefined ? scores[b.id] : 0;
      // 半径限制在 5% 到 100% 之间，防止 0% 点缩成中心点不好看
      const r = R * (Math.max(5, score) / 100);
      const x = cx + r * Math.sin(angle);
      const y = cy - r * Math.cos(angle);
      return `${x},${y}`;
    }).join(' ');

    return (
      <g>
        {/* 实心区域 */}
        <polygon
          points={points}
          fill="url(#radarGlow)"
          stroke="hsl(var(--color-mech))"
          strokeWidth="2"
          style={{ transition: 'all 0.5s ease' }}
        />
        {/* 数据圆点 */}
        {radarBlocks.map((b, i) => {
          const angle = getAngle(i);
          const score = scores[b.id] !== undefined ? scores[b.id] : 0;
          const r = R * (Math.max(5, score) / 100);
          const x = cx + r * Math.sin(angle);
          const y = cy - r * Math.cos(angle);
          return (
            <circle
              key={`dot-${b.id}`}
              cx={x}
              cy={y}
              r="4"
              fill="#fff"
              stroke={b.color || 'hsl(var(--color-mech))'}
              strokeWidth="2"
              style={{ transition: 'all 0.5s ease' }}
            />
          );
        })}
      </g>
    );
  };

  // 渲染文本标签 (避开图形重叠)
  const renderLabels = () => {
    return radarBlocks.map((b, i) => {
      const angle = getAngle(i);
      // 标签延伸距离
      const textDist = R + 18;
      const x = cx + textDist * Math.sin(angle);
      const y = cy - textDist * Math.cos(angle);

      // 对齐文本
      let textAnchor = 'middle';
      if (Math.sin(angle) > 0.1) textAnchor = 'start';
      else if (Math.sin(angle) < -0.1) textAnchor = 'end';

      let dy = '0.35em';
      if (Math.cos(angle) > 0.8) dy = '-0.2em'; // 最上方
      else if (Math.cos(angle) < -0.8) dy = '1em'; // 最下方

      const score = scores[b.id] !== undefined ? Math.round(scores[b.id]) : 0;
      const isUntested = scores[b.id] === undefined || scores[b.id] === 0;

      return (
        <g key={`label-${b.id}`}>
          <text
            x={x}
            y={y}
            dy={dy}
            textAnchor={textAnchor}
            fill="hsl(var(--text-primary))"
            fontSize="11"
            fontWeight="bold"
          >
            {b.name}
          </text>
          <text
            x={x}
            y={y + 12}
            dy={dy}
            textAnchor={textAnchor}
            fill={isUntested ? 'hsla(var(--text-secondary) / 0.5)' : score < 60 ? 'hsl(var(--color-danger))' : 'hsl(var(--color-success))'}
            fontSize="10"
            fontFamily="monospace"
          >
            {isUntested ? '未测' : `${score}%`}
          </text>
        </g>
      );
    });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '10px 0' }}>
      <svg width="300" height="280" viewBox="0 0 300 280" style={{ overflow: 'visible' }}>
        {/* 定义渐变发光 */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsla(var(--color-mech) / 0.1)" />
            <stop offset="70%" stopColor="hsla(var(--color-mech) / 0.4)" />
            <stop offset="100%" stopColor="hsla(var(--color-mech) / 0.6)" />
          </radialGradient>
        </defs>

        {/* 雷达网底图 */}
        {renderBackgroundGrids()}
        {renderAxisLines()}

        {/* 得分填充多边形 */}
        {renderScorePolygon()}

        {/* 标签文字 */}
        {renderLabels()}
      </svg>
    </div>
  );
}
