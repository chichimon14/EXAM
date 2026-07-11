import React, { useState } from 'react';
import { chapters } from '../data/physicsData';
import { mathDays } from '../data/mathData';

export default function WrongBook({ wrongList = [], onRemoveWrong, onClearAll, subject = 'physics' }) {
  const [activeChallengeId, setActiveChallengeId] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 开启重新挑战
  const startChallenge = (qId) => {
    setActiveChallengeId(qId);
    setSelectedOption(null);
    setHasChecked(false);
    setIsCorrect(false);
  };

  // 提交挑战答案
  const handleCheckAnswer = (q) => {
    if (selectedOption === null) return;
    const correct = selectedOption === q.answer;
    setIsCorrect(correct);
    setHasChecked(true);
  };

  // 答对后移出
  const handleRemove = (qId) => {
    onRemoveWrong(qId);
    setActiveChallengeId(null);
  };

  if (wrongList.length === 0) {
    return (
      <div className="glass-card fade-in" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>错题本空空如也！</h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, maxWidth: '400px', margin: '0 auto' }}>
          这说明您的基础知识掌握得非常牢固！请继续保持，在练习中答错的题会自动被老师记录到这里哦。
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 头部工具栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>错题集 ({wrongList.length} 道)</h3>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>
            {subject === 'physics' ? '中考物理提分最快的方法，就是彻底消灭错题！' : '中考数学攻克马虎的终极法宝，就是错题彻底练熟！'}
          </p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'hsl(var(--color-danger))' }} onClick={onClearAll}>
          🗑️ 清空错题本
        </button>
      </div>

      {/* 错题列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {wrongList.map((q, idx) => {
          const ch = subject === 'physics' ? chapters[q.chapterId] : mathDays[q.chapterId];
          const isChallenging = activeChallengeId === q.id;

          return (
            <div key={q.id} className="glass-card" style={{ padding: '20px', borderLeft: '4px solid hsl(var(--color-danger))', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* 板块和章节小标识 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-mech" style={{ backgroundColor: 'hsla(var(--color-heat) / 0.1)', color: 'hsl(var(--color-heat))', border: '1px solid hsla(var(--color-heat) / 0.2)' }}>
                  {ch ? ch.name.split('：')[0] : subject === 'physics' ? '物理' : '数学'} · {q.category}
                </span>
                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>#错题 {idx + 1}</span>
              </div>

              {/* 题干 */}
              <div style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.5' }}>
                {q.question}
              </div>

              {/* 是否处于重新挑战模式 */}
              {!isChallenging ? (
                <>
                  {/* 查看解析模式 */}
                  <div style={{ fontSize: '0.88rem', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'hsla(var(--text-secondary) / 0.05)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>
                      ❌ 您的作答：
                      <span style={{ color: 'hsl(var(--color-danger))', fontWeight: 'bold' }}>
                        {q.userAnswer !== undefined && q.userAnswer !== null ? `选项 ${String.fromCharCode(65 + q.userAnswer)}. ${q.options[q.userAnswer]}` : '未作答'}
                      </span>
                    </div>
                    <div>
                      ✅ 正确答案：
                      <span style={{ color: 'hsl(var(--color-success))', fontWeight: 'bold' }}>
                        选项 {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}
                      </span>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '0.85rem',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(217, 119, 6, 0.08)',
                    border: '1px solid rgba(217, 119, 6, 0.15)',
                    color: 'hsl(var(--color-warning))'
                  }}>
                    👨‍🏫 <b>名师避坑指点：</b> {q.explanation}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => startChallenge(q.id)}>
                      🔄 重新挑战这道题
                    </button>
                  </div>
                </>
              ) : (
                // 挑战答题模式
                <div className="scale-up" style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'hsla(var(--color-mech) / 0.03)',
                  border: '1px solid hsla(var(--color-mech) / 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: 'hsl(var(--color-mech))' }}>🎯 请重新选择您的答案：</div>
                  
                  {/* 四个选项 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, oIdx) => {
                      let optionBg = '';
                      let optionBorder = '';
                      
                      if (selectedOption === oIdx) {
                        optionBg = 'hsla(var(--color-mech) / 0.15)';
                        optionBorder = '1px solid hsl(var(--color-mech))';
                      }

                      if (hasChecked) {
                        if (oIdx === q.answer) {
                          optionBg = 'hsla(var(--color-success) / 0.2)';
                          optionBorder = '1px solid hsl(var(--color-success))';
                        } else if (selectedOption === oIdx) {
                          optionBg = 'hsla(var(--color-danger) / 0.2)';
                          optionBorder = '1px solid hsl(var(--color-danger))';
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={hasChecked}
                          className="btn"
                          style={{
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                            padding: '10px 14px',
                            fontSize: '0.85rem',
                            backgroundColor: optionBg || 'hsla(var(--text-secondary) / 0.02)',
                            border: optionBorder || '1px solid hsl(var(--border))',
                            color: 'hsl(var(--text-primary))',
                            cursor: hasChecked ? 'default' : 'pointer'
                          }}
                          onClick={() => setSelectedOption(oIdx)}
                        >
                          <strong>{String.fromCharCode(65 + oIdx)}.</strong> {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* 检测和结果区 */}
                  {!hasChecked ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveChallengeId(null)}>
                        取消挑战
                      </button>
                      <button className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '0.8rem' }} disabled={selectedOption === null} onClick={() => handleCheckAnswer(q)}>
                        确认提交
                      </button>
                    </div>
                  ) : (
                    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {isCorrect ? (
                        <div style={{ color: 'hsl(var(--color-success))', fontWeight: 'bold', fontSize: '0.88rem' }}>
                          🎉 答对了！您已经攻克了此项基础弱点！
                        </div>
                      ) : (
                        <div style={{ color: 'hsl(var(--color-danger))', fontWeight: 'bold', fontSize: '0.88rem' }}>
                          😢 抱歉，还是答错了。再看一眼名师解析吧：
                        </div>
                      )}

                      {!isCorrect && (
                        <div style={{
                          fontSize: '0.8rem',
                          padding: '8px 12px',
                          backgroundColor: 'rgba(217, 119, 6, 0.08)',
                          borderRadius: '4px',
                          color: 'hsl(var(--color-warning))'
                        }}>
                          👨‍🏫 <b>解析：</b>{q.explanation}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {isCorrect ? (
                          <button className="btn btn-accent" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => handleRemove(q.id)}>
                            ✅ 移出错题本
                          </button>
                        ) : (
                          <button className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => setActiveChallengeId(null)}>
                            关闭重做
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
