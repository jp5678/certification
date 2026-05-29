import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress } from '../types';
import { STUDY_MODULES } from '../data';

interface DashboardViewProps {
  progress: UserProgress;
  onSelectModule: (moduleId: string) => void;
  setCurrentTab: (tab: string) => void;
}

// Circular Progress 게이지 렌더러 헬퍼
const renderCircularProgress = (percent: number, color: string, icon: React.ReactNode) => {
  const r = 18;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(percent, 100) / 100) * circ;

  return (
    <div className="relative flex items-center justify-center" style={{ width: '52px', height: '52px', flexShrink: 0 }}>
      <svg className="transform -rotate-90" style={{ width: '52px', height: '52px', transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle 
          cx="26" 
          cy="26" 
          r={r} 
          fill="transparent" 
          stroke="var(--slate-100)" 
          strokeWidth="3.5" 
        />
        <circle 
          cx="26" 
          cy="26" 
          r={r} 
          fill="transparent" 
          stroke={color} 
          strokeWidth="4.5" 
          strokeDasharray={circ} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          style={{ 
            transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 3px ${color})`
          }}
        />
      </svg>
      <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {icon}
      </div>
    </div>
  );
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onSelectModule,
  setCurrentTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'workspace' | 'sheets'>('all');

  // 통계 계산
  const totalModules = STUDY_MODULES.length;
  const workspaceModules = STUDY_MODULES.filter(m => m.category === 'workspace');
  const sheetsModules = STUDY_MODULES.filter(m => m.category === 'sheets');

  const completedWorkspaceCount = workspaceModules.filter(m => progress.completedModules.includes(m.id)).length;
  const completedSheetsCount = sheetsModules.filter(m => progress.completedModules.includes(m.id)).length;
  const totalCompletedCount = progress.completedModules.length;

  const workspaceProgressPercent = Math.round((completedWorkspaceCount / workspaceModules.length) * 100) || 0;
  const sheetsProgressPercent = Math.round((completedSheetsCount / sheetsModules.length) * 100) || 0;
  const totalProgressPercent = Math.round((totalCompletedCount / totalModules) * 100) || 0;

  // 퀴즈 평균 점수 계산
  const quizScores = Object.values(progress.quizScores);
  const quizAverage = quizScores.length > 0 
    ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
    : 0;

  // 수료증 획득 여부
  const isCertified = progress.completedModules.length === totalModules && 
    STUDY_MODULES.every(m => (progress.quizScores[m.id] || 0) >= 80);

  // 선택된 카테고리별 모듈 필터링
  const filteredModules = STUDY_MODULES.filter(
    (m) => activeCategory === 'all' || m.category === activeCategory
  );

  return (
    <div className="max-w-7xl px-4 md:px-6 fade-in pb-16 no-print">
      
      {/* 1. 웰컴 및 개인 배너 */}
      <div className="glass shadow-premium welcome-banner p-5 md:p-6 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: 'var(--blue-900)' }}>
            안녕하세요, {progress.userName}님! 🩺👋
          </h2>
          <p className="text-slate-500 text-sm md:text-base" style={{ maxWidth: '640px', margin: '16px 0 0 0' }}>
            간호학과 학생들의 디지털 리터러시 역량 강화를 위한 Google Workspace for Education & Google Spreadsheet 자가학습 플랫폼에 오신 것을 환영합니다.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="welcome-badge bg-blue-badge">
              <Icons.BookOpen size={12} /> 자가학습 플랫폼
            </span>
            <span className="welcome-badge bg-teal-badge">
              <Icons.Target size={12} /> 평균 80점 이상 수료 조건
            </span>
          </div>
        </div>

        <div className="cert-widget-card w-full md:w-auto">
          <div className="cert-widget-icon-bg">
            <Icons.Award size={28} className={isCertified ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">자가학습 수료증</h4>
            {isCertified ? (
              <button 
                onClick={() => setCurrentTab('certificate')}
                className="font-extrabold text-sm flex items-center gap-1-5"
                style={{ color: 'var(--teal-600)', padding: 0 }}
              >
                발급 완료! 확인하기 <Icons.ArrowRight size={14} />
              </button>
            ) : (
              <p className="font-bold text-sm text-slate-700" style={{ margin: 0 }}>
                학습 완료 시 자동 잠금 해제
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. 핵심 학습 통계 카드 (서큘러 게이지 형태로 전면 고도화) */}
      <div className="summary-grid mb-8">
        
        {/* 카드 1: 전체 진도율 */}
        <div className="summary-card shadow-premium hover-card justify-between items-center" onClick={() => setCurrentTab('stats')} style={{ padding: '16px 20px' }}>
          <div className="flex-1">
            <p className="text-sm text-slate-400 font-semibold mb-1">전체 학습 진도율</p>
            <h3 className="text-2xl font-black text-slate-800" style={{ margin: 0 }}>{totalProgressPercent}%</h3>
            <p className="text-xs text-slate-400" style={{ fontSize: '10px', marginTop: '4px', margin: 0 }}>
              전체 코스 대비 이수 완료율
            </p>
          </div>
          {renderCircularProgress(totalProgressPercent, 'var(--blue-600)', <Icons.Percent size={20} />)}
        </div>

        {/* 카드 2: 구글 Workspace 진도 */}
        <div className="summary-card shadow-premium hover-card justify-between items-center" onClick={() => setCurrentTab('stats')} style={{ padding: '16px 20px' }}>
          <div className="flex-1">
            <p className="text-sm text-slate-400 font-semibold mb-1">Workspace 에듀케이션</p>
            <h3 className="text-2xl font-black text-slate-800" style={{ margin: 0 }}>{completedWorkspaceCount} / {workspaceModules.length} 완료</h3>
            <p className="text-xs text-slate-400" style={{ fontSize: '10px', marginTop: '4px', margin: 0 }}>
              진행 상태 ({workspaceProgressPercent}% 완료)
            </p>
          </div>
          {renderCircularProgress(workspaceProgressPercent, '#6366f1', <Icons.Laptop size={20} />)}
        </div>

        {/* 카드 3: 구글 스프레드시트 진도 */}
        <div className="summary-card shadow-premium hover-card justify-between items-center" onClick={() => setCurrentTab('stats')} style={{ padding: '16px 20px' }}>
          <div className="flex-1">
            <p className="text-sm text-slate-400 font-semibold mb-1">스프레드시트 기능 마스터</p>
            <h3 className="text-2xl font-black text-slate-800" style={{ margin: 0 }}>{completedSheetsCount} / {sheetsModules.length} 완료</h3>
            <p className="text-xs text-slate-400" style={{ fontSize: '10px', marginTop: '4px', margin: 0 }}>
              진행 상태 ({sheetsProgressPercent}% 완료)
            </p>
          </div>
          {renderCircularProgress(sheetsProgressPercent, 'var(--teal-500)', <Icons.FileSpreadsheet size={20} />)}
        </div>

        {/* 카드 4: 퀴즈 평균 점수 */}
        <div className="summary-card shadow-premium hover-card justify-between items-center" onClick={() => setCurrentTab('stats')} style={{ padding: '16px 20px' }}>
          <div className="flex-1">
            <p className="text-sm text-slate-400 font-semibold mb-1">평균 퀴즈 성적</p>
            <h3 className="text-2xl font-black text-slate-800" style={{ margin: 0 }}>{quizAverage}점</h3>
            <p className="text-xs text-slate-400" style={{ fontSize: '10px', marginTop: '4px', margin: 0 }}>
              응시한 퀴즈 {quizScores.length}개 기준
            </p>
          </div>
          {renderCircularProgress(quizAverage, 'var(--emerald-500)', <Icons.HelpCircle size={20} />)}
        </div>

      </div>

      {/* 3. 과목 카테고리 필터 헤더 */}
      <div className="filter-bar mb-6">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800" style={{ margin: 0 }}>
            📚 과목 선택
          </h3>
          <p className="text-xs text-slate-400" style={{ margin: 0 }}>자가학습을 진행할 구글 서비스 및 시트 기능을 선택해 주세요.</p>
        </div>
        <div className="filter-group">
          {[
            { id: 'all', label: '전체 과목' },
            { id: 'workspace', label: 'Workspace' },
            { id: 'sheets', label: '스프레드시트 핵심' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. 과목 카드 격자 그리드 */}
      <div className="cards-grid">
        {filteredModules.map((m) => {
          const IconComponent = (Icons as any)[m.iconName] || Icons.Book;
          const isCompleted = progress.completedModules.includes(m.id);
          const score = progress.quizScores[m.id];
          const hasScore = score !== undefined;
          
          return (
            <div
              key={m.id}
              className="module-card shadow-premium hover-card"
              style={{ minHeight: '340px' }}
            >
              <div>
                
                {/* 상단 뱃지 & 완수 체크 */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`card-header-icon ${
                    m.category === 'workspace' ? 'icon-bg-indigo' : 'icon-bg-teal'
                  }`}>
                    {IconComponent && <IconComponent size={24} />}
                  </div>
                  <div className="flex items-center gap-1-5">
                    {isCompleted && (
                      <span className="card-badge-completed">
                        <Icons.CheckCircle2 size={10} /> 학습 완료
                      </span>
                    )}
                    {hasScore && (
                      <span className={`card-badge-score ${score >= 80 ? 'score-pass' : 'score-fail'}`}>
                        퀴즈: {score}점
                      </span>
                    )}
                  </div>
                </div>

                {/* 타이틀 및 요약 */}
                <h4 className="text-lg font-bold text-slate-800 mb-1-5" style={{ margin: 0 }}>{m.title}</h4>
                <p className="text-sm text-slate-500 mb-3-5 leading-relaxed" style={{ minHeight: '36px' }}>{m.description}</p>
                
                {/* 간호 실무 시나리오 매핑 박스 */}
                <div className="scenario-box mb-4">
                  <span className="text-slate-400 font-bold block mb-0-5" style={{ fontSize: '11px', textTransform: 'uppercase' }}>실무 시나리오</span>
                  <p className="text-sm text-slate-700 font-semibold flex items-center gap-1" style={{ margin: 0 }}>
                    🩺 {m.scenario}
                  </p>
                </div>

              </div>

              {/* 하단 제어 버튼 */}
              <button
                onClick={() => onSelectModule(m.id)}
                className={isCompleted ? 'action-btn-secondary' : 'action-btn-primary'}
              >
                {isCompleted ? (
                  <>
                    <Icons.RotateCw size={14} /> 복습 및 재시험
                  </>
                ) : (
                  <>
                    <Icons.Play size={14} /> 학습 시작
                  </>
                )}
              </button>

            </div>
          );
        })}
      </div>

      {/* 5. 간호 임상 실무 로드맵 (Clinical Journey Roadmap) */}
      <div className="roadmap-section mb-12">
        <div className="roadmap-header">
          <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800" style={{ margin: 0 }}>
            🩺 간호 임상 실무 자가학습 로드맵
          </h3>
          <p className="text-xs text-slate-400" style={{ margin: 0 }}>
            환자 입원 수속부터 퇴원 및 외래 교육까지 이어지는 7단계 간호 임상 실무 흐름에 기반한 직관적인 학습 노선도입니다. (단계를 눌러 바로 학습할 수 있습니다)
          </p>
        </div>

        <div className="roadmap-timeline-container">
          {/* 타임라인 연결 선 */}
          <div className="roadmap-line-bg"></div>
          <div 
            className="roadmap-line-progress" 
            style={{ 
              width: `${
                progress.completedModules.length > 0 
                  ? Math.min(((progress.completedModules.length - 1) / (STUDY_MODULES.length - 1)) * 100, 100) 
                  : 0
              }%` 
            }}
          ></div>

          {STUDY_MODULES.map((m, idx) => {
            const isCompleted = progress.completedModules.includes(m.id);
            // 현재 학습해야 할 모듈: 아직 완료하지 않은 첫 번째 모듈이거나, 이전 모듈들이 완료된 상태
            const isPrevCompleted = idx === 0 || progress.completedModules.includes(STUDY_MODULES[idx - 1].id);
            const isActive = !isCompleted && isPrevCompleted;
            const isLocked = !isCompleted && !isPrevCompleted;

            let stepClass = 'roadmap-step-item';
            if (isCompleted) stepClass += ' completed';
            else if (isActive) stepClass += ' active';
            else if (isLocked) stepClass += ' locked';

            return (
              <div 
                key={m.id} 
                className={stepClass}
                onClick={() => onSelectModule(m.id)}
                title={`${m.title}: ${m.scenario}`}
              >
                <div className="roadmap-node-circle">
                  {isCompleted ? (
                    <Icons.Check size={20} />
                  ) : isLocked ? (
                    <Icons.Lock size={16} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                  {isActive && <div className="roadmap-pulse-ring"></div>}
                </div>
                <div className="roadmap-node-title">
                  {m.title.replace(/^\d+\.\s*/, '')}
                </div>
                <span className="text-[10px] text-slate-400 block mt-0-5" style={{ fontSize: '9px' }}>
                  {m.id === 'gmail' && '인계 의뢰'}
                  {m.id === 'calendar' && '교대 조율'}
                  {m.id === 'drive' && 'CPR 지침'}
                  {m.id === 'docs' && '사례 연구'}
                  {m.id === 'sheets_basic' && '입원 관리'}
                  {m.id === 'slides' && '퇴원 교육'}
                  {m.id === 'classroom' && '평가 관리'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
