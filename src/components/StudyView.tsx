import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { StudyModule } from '../types';

interface StudyViewProps {
  module: StudyModule;
  onBackToDashboard: () => void;
  onStartQuiz: () => void;
  isCompleted: boolean;
}

export const StudyView: React.FC<StudyViewProps> = ({
  module,
  onBackToDashboard,
  onStartQuiz,
  isCompleted,
}) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const handleStepCheck = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const IconComponent = (Icons as any)[module.iconName] || Icons.Book;

  return (
    <div className="max-w-6xl px-4 md:px-6 fade-in pb-16 no-print">
      
      {/* 1. 상단 브레드크럼 & 돌아가기 */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToDashboard}
          className="back-btn"
        >
          <Icons.ArrowLeft size={16} /> 대시보드로 돌아가기
        </button>
        <span className={`card-badge-score ${
          module.category === 'workspace' ? 'score-pass' : 'score-fail'
        }`} style={{ fontSize: '0.75rem', padding: '6px 16px' }}>
          {module.category === 'workspace' ? 'Google Workspace for Education' : '구글 스프레드시트 마스터'}
        </span>
      </div>

      {/* 2. 시나리오 헤더 배너 */}
      <div className="glass shadow-premium study-banner p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="card-header-icon text-white" style={{ 
            backgroundColor: module.category === 'workspace' ? 'var(--blue-900)' : 'var(--teal-600)',
            padding: '16px',
            borderRadius: '16px'
          }}>
            {IconComponent && <IconComponent size={32} />}
          </div>
          <div>
            <span className="text-[10px] text-teal-600 font-extrabold uppercase tracking-wider block mb-1">
              🩺 실무 융합형 임상 간호 시나리오
            </span>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 mb-1" style={{ margin: 0 }}>{module.title}</h2>
            <p className="text-sm font-semibold text-blue-900" style={{ margin: 0 }}>
              {module.scenario}
            </p>
          </div>
        </div>
      </div>

      {/* 3. 본문 2단 구성 */}
      <div className="study-layout-grid mb-8">
        
        {/* 좌측: 상세 학습 내용 매뉴얼 (2칸 차지) */}
        <div className="study-main-col study-card flex flex-col justify-between">
          <div className="prose max-w-none">
            {/* 데이터 내 마크다운 포맷 텍스트 렌더링 */}
            <div className="study-content space-y-6" style={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
              {module.content}
            </div>
          </div>

          <div className="mt-8 pt-6 flex items-center justify-center" style={{ borderTop: '1px solid var(--slate-100)' }}>
            <div className="flex items-center gap-2 text-slate-400 text-xs text-center justify-center">
              <Icons.Info size={14} className="text-teal-600 animate-pulse" />
              <span className="font-semibold">실습을 차근차근 진행하신 후 아래의 [실무 퀴즈 풀기 시작] 버튼을 눌러 평가를 완료해 주세요. (80점 이상 획득 시 이수 승인)</span>
            </div>
          </div>
        </div>

        {/* 우측: 임상 수행 단계 (체크리스트) (1칸 차지) */}
        <div className="checklist-container">
          <div>
            <h3 className="text-sm font-black text-slate-800 mb-1-5 flex items-center gap-1-5" style={{ margin: 0 }}>
              <Icons.ListChecks size={18} className="text-teal-600" />
              간호 실무 핵심 수행 절차
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed" style={{ margin: 0 }}>
              화면의 동작 과정을 상상하거나, 직접 구글 툴을 띄워 놓고 아래 체크리스트의 수행 단계를 따라 실습해 보세요.
            </p>

            <div className="grid gap-3">
              {module.steps.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <label
                    key={idx}
                    className={`checklist-label ${isChecked ? 'checked' : ''}`}
                    onClick={() => handleStepCheck(idx)}
                  >
                    <div className="mt-0-5 flex-shrink-0">
                      {isChecked ? (
                        <Icons.CheckSquare size={16} className="text-teal-600" />
                      ) : (
                        <Icons.Square size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="text-xs leading-relaxed flex-1">
                      <span className="text-slate-400 font-bold block mb-0-5" style={{ fontSize: '9px' }}>Step {idx + 1}</span>
                      {step}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--slate-200)' }}>
            <div className="tips-box">
              <span className="font-extrabold block mb-1 flex items-center gap-1">
                💡 자가학습 팁
              </span>
              모든 단계를 완료한 뒤 하단의 퀴즈를 통과하면 이 모듈이 최종 승인(평가 통과) 처리됩니다.
            </div>
          </div>

        </div>

      </div>

      {/* 4. 하단 동작 액션바 */}
      <div className="glass shadow-premium p-5 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderRadius: '24px' }}>
        <div className="flex items-center gap-3">
          <Icons.CheckCircle className={isCompleted ? 'text-emerald-500' : 'text-slate-300'} size={28} />
          <div>
            <h4 className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>
              {isCompleted ? '학습이 1회 완료된 모듈입니다.' : '자가학습을 마쳤나요?'}
            </h4>
            <p className="text-xs text-slate-500" style={{ margin: 0 }}>
              {isCompleted ? '언제든 다시 퀴즈를 풀어 점수를 올릴 수 있습니다.' : '수료 기준 획득을 위해 실무 퀴즈를 풀어봅시다.'}
            </p>
          </div>
        </div>
        <button
          onClick={onStartQuiz}
          className="print-action-btn w-full sm:w-auto"
          style={{ padding: '14px 32px', borderRadius: '16px', fontSize: '0.875rem' }}
        >
          <Icons.HelpCircle size={18} /> 실무 퀴즈 풀기 시작 <Icons.ArrowRight size={16} />
        </button>
      </div>

    </div>
  );
};
