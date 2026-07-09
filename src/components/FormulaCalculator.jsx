import React, { useState, useEffect } from 'react';
import { formulas } from '../data/physicsData';

export default function FormulaCalculator({ activeFormulaId = null }) {
  const [selectedFormulaId, setSelectedFormulaId] = useState(
    activeFormulaId || Object.keys(formulas)[0]
  );
  
  // 当外部传入的公式ID改变时，同步更新
  useEffect(() => {
    if (activeFormulaId) {
      setSelectedFormulaId(activeFormulaId);
    }
  }, [activeFormulaId]);

  const formula = formulas[selectedFormulaId];

  // 计算状态
  const [targetVar, setTargetVar] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [stepResult, setStepResult] = useState(null);

  // 当公式或目标求解变量改变时，重置输入框
  useEffect(() => {
    if (formula) {
      const defaultTarget = formula.calculations[0].target;
      setTargetVar(defaultTarget);
      setInputValues({});
      setStepResult(null);
    }
  }, [selectedFormulaId]);

  // 当目标求解变量改变时，重置输入值
  useEffect(() => {
    setInputValues({});
    setStepResult(null);
  }, [targetVar]);

  if (!formula) return <div className="glass-card padding">未找到公式数据</div>;

  const currentCalc = formula.calculations.find(c => c.target === targetVar) || formula.calculations[0];
  const requiredInputs = currentCalc.inputs;

  const handleInputChange = (symbol, val) => {
    const nextVals = { ...inputValues, [symbol]: val };
    setInputValues(nextVals);

    // 检查是否所有必填输入都有合法数值
    const allFilled = requiredInputs.every(
      key => nextVals[key] !== undefined && nextVals[key] !== '' && !isNaN(parseFloat(nextVals[key]))
    );

    if (allFilled) {
      const args = requiredInputs.map(key => parseFloat(nextVals[key]));
      try {
        const result = currentCalc.calc(...args);
        
        // 生成详细的中考标准代入计算步骤
        const targetMeta = formula.vars.find(v => v.symbol === targetVar);
        const steps = [];
        
        // 1. 已知物理量
        const knownStr = requiredInputs.map(key => {
          const vMeta = formula.vars.find(v => v.symbol === key);
          return `${vMeta.name} ${vMeta.symbol} = ${nextVals[key]} ${vMeta.unit}`;
        }).join(', ');
        steps.push(`已知条件：${knownStr}`);

        // 2. 公式变形
        steps.push(`计算公式：${currentCalc.formula}`);

        // 3. 代入计算
        const valuesStr = requiredInputs.map(key => `${nextVals[key]}`).join(' / ');
        // 简单处理代入格式渲染
        let subStep = '';
        if (selectedFormulaId === 'v_s_t') {
          if (targetVar === 'v') subStep = `v = s / t = ${nextVals['s']} m / ${nextVals['t']} s`;
          if (targetVar === 's') subStep = `s = v * t = ${nextVals['v']} m/s * ${nextVals['t']} s`;
          if (targetVar === 't') subStep = `t = s / v = ${nextVals['s']} m / ${nextVals['v']} m/s`;
        } else if (selectedFormulaId === 'rho_m_v') {
          if (targetVar === 'rho') subStep = `ρ = m / V = ${nextVals['m']} kg / ${nextVals['V']} m³`;
          if (targetVar === 'm') subStep = `m = ρ * V = ${nextVals['rho']} kg/m³ * ${nextVals['V']} m³`;
          if (targetVar === 'V') subStep = `V = m / ρ = ${nextVals['m']} kg / ${nextVals['rho']} kg/m³`;
        } else if (selectedFormulaId === 'G_m_g') {
          if (targetVar === 'G') subStep = `G = m * g = ${nextVals['m']} kg * ${nextVals['g']} N/kg`;
          if (targetVar === 'm') subStep = `m = G / g = ${nextVals['G']} N / ${nextVals['g']} N/kg`;
        } else if (selectedFormulaId === 'p_F_S') {
          if (targetVar === 'p') subStep = `p = F / S = ${nextVals['F']} N / ${nextVals['S']} m²`;
          if (targetVar === 'F') subStep = `F = p * S = ${nextVals['p']} Pa * ${nextVals['S']} m²`;
          if (targetVar === 'S') subStep = `S = F / p = ${nextVals['F']} N / ${nextVals['p']} Pa`;
        } else if (selectedFormulaId === 'p_rho_g_h') {
          if (targetVar === 'p') subStep = `p = ρ * g * h = ${nextVals['rho']} kg/m³ * ${nextVals['g']} N/kg * ${nextVals['h']} m`;
          if (targetVar === 'h') subStep = `h = p / (ρ * g) = ${nextVals['p']} Pa / (${nextVals['rho']} kg/m³ * ${nextVals['g']} N/kg)`;
        } else if (selectedFormulaId === 'F_G_F') {
          if (targetVar === 'F_fu') subStep = `F_浮 = G - F_示 = ${nextVals['G']} N - ${nextVals['F_shi']} N`;
          if (targetVar === 'G') subStep = `G = F_浮 + F_示 = ${nextVals['F_fu']} N + ${nextVals['F_shi']} N`;
          if (targetVar === 'F_shi') subStep = `F_示 = G - F_浮 = ${nextVals['G']} N - ${nextVals['F_fu']} N`;
        } else if (selectedFormulaId === 'F_rho_g_V') {
          if (targetVar === 'F_fu') subStep = `F_浮 = ρ_液 * g * V_排 = ${nextVals['rho_liq']} kg/m³ * ${nextVals['g']} N/kg * ${nextVals['V_pai']} m³`;
          if (targetVar === 'V_pai') subStep = `V_排 = F_浮 / (ρ_液 * g) = ${nextVals['F_fu']} N / (${nextVals['rho_liq']} kg/m³ * ${nextVals['g']} N/kg)`;
        } else if (selectedFormulaId === 'W_F_s') {
          if (targetVar === 'W') subStep = `W = F * s = ${nextVals['F']} N * ${nextVals['s']} m`;
          if (targetVar === 'F') subStep = `F = W / s = ${nextVals['W']} J / ${nextVals['s']} m`;
          if (targetVar === 's') subStep = `s = W / F = ${nextVals['W']} J / ${nextVals['F']} N`;
        } else if (selectedFormulaId === 'P_W_t') {
          if (targetVar === 'P') subStep = `P = W / t = ${nextVals['W']} J / ${nextVals['t']} s`;
          if (targetVar === 'W') subStep = `W = P * t = ${nextVals['P']} W * ${nextVals['t']} s`;
          if (targetVar === 't') subStep = `t = W / P = ${nextVals['W']} J / ${nextVals['P']} W`;
        } else if (selectedFormulaId === 'F1_L1_F2_L2') {
          if (targetVar === 'F1') subStep = `F_1 = (F_2 * L_2) / L_1 = (${nextVals['F2']} N * ${nextVals['L2']} m) / ${nextVals['L1']} m`;
          if (targetVar === 'L1') subStep = `L_1 = (F_2 * L_2) / F_1 = (${nextVals['F2']} N * ${nextVals['L2']} m) / ${nextVals['F1']} N`;
          if (targetVar === 'F2') subStep = `F_2 = (F_1 * L_1) / L_2 = (${nextVals['F1']} N * ${nextVals['L1']} m) / ${nextVals['L2']} m`;
          if (targetVar === 'L2') subStep = `L_2 = (F_1 * L_1) / F_2 = (${nextVals['F1']} N * ${nextVals['L1']} m) / ${nextVals['F2']} N`;
        } else if (selectedFormulaId === 'eta_W_W') {
          if (targetVar === 'eta') subStep = `η = W_有 / W_总 * 100% = ${nextVals['W_you']} J / ${nextVals['W_zong']} J * 100%`;
          if (targetVar === 'W_you') subStep = `W_有 = W_总 * η = ${nextVals['W_zong']} J * ${nextVals['eta']}%`;
        } else {
          subStep = `代入数据：${currentCalc.formula.replace(/[a-zA-Z]+/g, (match) => nextVals[match] || match)}`;
        }
        
        steps.push(`代入数据：${subStep}`);
        
        // 精度保留 2 位小数
        const formattedResult = Number(result.toFixed(2));
        steps.push(`最终得数：${targetMeta.name} ${targetMeta.symbol} = ${formattedResult} ${targetMeta.unit}`);

        setStepResult({
          value: formattedResult,
          unit: targetMeta.unit,
          symbol: targetMeta.symbol,
          name: targetMeta.name,
          steps: steps
        });
      } catch (err) {
        setStepResult({ error: '计算发生错误，请检查输入是否合理。' });
      }
    } else {
      setStepResult(null);
    }
  };

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      {/* 头部选择公式 */}
      {!activeFormulaId && (
        <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.8 }}>选择物理公式：</span>
          <select
            className="input-field"
            style={{ width: 'auto', minWidth: '200px' }}
            value={selectedFormulaId}
            onChange={(e) => setSelectedFormulaId(e.target.value)}
          >
            {Object.values(formulas).map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({f.expression})</option>
            ))}
          </select>
        </div>
      )}

      {/* 公式主卡片 */}
      <div className="glass-card" style={{ padding: '24px', borderTop: '4px solid var(--color-mech)', display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* 公式看板 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-mech" style={{ marginBottom: '8px' }}>公式精讲</span>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{formula.name}</h3>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>掌握物理公式是中考计算题拿满分的第一步</p>
          </div>
          <div style={{
            fontSize: '2rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, hsl(var(--color-mech)), hsl(var(--color-work)))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '1px',
            padding: '4px 16px',
            borderRadius: '10px',
            backgroundColor: 'hsla(var(--text-secondary) / 0.05)'
          }}>
            {formula.expression}
          </div>
        </div>

        {/* 变量说明表格 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid hsla(var(--text-secondary) / 0.1)', textAlign: 'left' }}>
                <th style={{ padding: '8px 12px', opacity: 0.6 }}>物理量符号</th>
                <th style={{ padding: '8px 12px', opacity: 0.6 }}>物理意义</th>
                <th style={{ padding: '8px 12px', opacity: 0.6 }}>主单位 (符号)</th>
                <th style={{ padding: '8px 12px', opacity: 0.6 }}>中考常考/换算备注</th>
              </tr>
            </thead>
            <tbody>
              {formula.vars.map((v) => (
                <tr key={v.symbol} style={{ borderBottom: '1px solid hsla(var(--text-secondary) / 0.05)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 'bold', color: 'hsl(var(--color-mech))' }}>{v.symbol === 'rho' || v.symbol === 'rho_liq' ? 'ρ' : v.symbol === 'eta' ? 'η' : v.symbol}</td>
                  <td style={{ padding: '10px 12px' }}>{v.name} ({v.desc})</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{v.unit}</td>
                  <td style={{ padding: '10px 12px', opacity: 0.8, color: 'hsl(var(--color-optics))' }}>{v.conversion || '标准国际单位'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 互动计算器部分 */}
        <div className="glass-card" style={{ padding: '20px', backgroundColor: 'hsla(var(--text-secondary) / 0.02)', border: '1px dashed hsla(var(--text-secondary) / 0.1)' }}>
          <h4 style={{ fontSize: '1.05rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--color-work))' }}></span>
            公式互动计算器（中考规范模拟）
          </h4>

          {/* 求解目标选择 */}
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>我要求解：</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {formula.calculations.map((calc) => {
                const vMeta = formula.vars.find(v => v.symbol === calc.target);
                return (
                  <button
                    key={calc.target}
                    className={`btn ${targetVar === calc.target ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={() => setTargetVar(calc.target)}
                  >
                    {vMeta ? `${vMeta.name} (${vMeta.symbol})` : calc.target}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 输入已知量 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {requiredInputs.map((symbol) => {
              const vMeta = formula.vars.find(v => v.symbol === symbol);
              const val = inputValues[symbol] !== undefined ? inputValues[symbol] : '';
              return (
                <div key={symbol} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
                    输入 {vMeta.name} ({vMeta.symbol}) {vMeta.defaultValue !== undefined && ' (默认值建议)'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder={`请输入数值，如 ${vMeta.defaultValue || '10'}`}
                      className="input-field"
                      style={{ paddingRight: '50px' }}
                      value={val}
                      onChange={(e) => handleInputChange(symbol, e.target.value)}
                    />
                    <span style={{ position: 'absolute', right: '12px', fontSize: '0.85rem', opacity: 0.6, pointerEvents: 'none' }}>
                      {vMeta.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 计算步骤输出区 */}
          {stepResult && (
            <div className="scale-up" style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'hsla(var(--color-success) / 0.05)',
              border: '1px solid hsla(var(--color-success) / 0.2)',
              marginTop: '16px'
            }}>
              <h5 style={{ color: 'hsl(var(--color-success))', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem' }}>
                🎉 计算成功！中考解题规范步骤演示：
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                {stepResult.steps.map((step, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ opacity: 0.4 }}>[{idx + 1}]</span>
                    <span style={{ color: idx === stepResult.steps.length - 1 ? 'hsl(var(--color-success))' : 'inherit', fontWeight: idx === stepResult.steps.length - 1 ? 'bold' : 'normal' }}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!stepResult && requiredInputs.length > 0 && (
            <div style={{ fontSize: '0.85rem', opacity: 0.5, textAlign: 'center', padding: '12px 0' }}>
              💡 请在上方输入框填入所有已知物理量的数值，系统将自动生成规范的解题和代入步骤。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
