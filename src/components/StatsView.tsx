import React from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress } from '../types';
import { STUDY_MODULES } from '../data';

interface StatsViewProps {
  progress: UserProgress;
  setCurrentTab: (tab: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  progress,
  setCurrentTab,
}) => {
  const totalCount = STUDY_MODULES.length;
  const completedCount = progress.completedModules.length;
  const completedPercent = Math.round((completedCount / totalCount) * 100) || 0;

  const workspaceModules = STUDY_MODULES.filter(m => m.category === 'workspace');
  const sheetsModules = STUDY_MODULES.filter(m => m.category === 'sheets');

  const workspaceCompleted = workspaceModules.filter(m => progress.completedModules.includes(m.id)).length;
  const sheetsCompleted = sheetsModules.filter(m => progress.completedModules.includes(m.id)).length;

  const workspacePercent = Math.round((workspaceCompleted / workspaceModules.length) * 100) || 0;
  const sheetsPercent = Math.round((sheetsCompleted / sheetsModules.length) * 100) || 0;

  // 퀴즈 평균 점수
  const scores = Object.values(progress.quizScores);
  const quizAverage = scores.length > 0
    ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
    : 0;

  // 통과한 퀴즈 수 (80점 이상)
  const passedQuizCount = STUDY_MODULES.filter(
    m => (progress.quizScores[m.id] || 0) >= 80
  ).length;

  // 수료 요건 체크
  const condition1 = completedCount === totalCount; // 전체 이수 완료
  const condition2 = passedQuizCount === totalCount; // 전 과목 80점 이상 통과
  const isEligibleForCert = condition1 && condition2;

  // SVG 도넛 차트 파라미터 계산 (반지름=50, 둘레=2 * PI * 50 = 314.159)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completedPercent / 100) * circumference;

  return (
    <div className="max-w-5xl px-4 md:px-6 fade-in pb-16 no-print">
      
      {/* 1. 상단 인트로 */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 mb-1-5" style={{ margin: 0 }}>
          <Icons.BarChart3 className="text-teal-600" />
          나의 학습 통계 대시보드
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed" style={{ margin: 0 }}>
          구글 협업 도구 및 스프레드시트 학습의 누적 진도와 퀴즈 최고 성적, 수료 조건 만족 여부를 종합적으로 확인하는 공간입니다.
        </p>
      </div>

      {/* 2. 대시보드 2단 레이아웃 */}
      <div className="study-layout-grid mb-8">
        
        {/* 좌측 1칸: SVG 도넛 진도 차트 */}
        <div className="stats-donut-box">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5" style={{ margin: '0 0 20px 0' }}>전체 이수 진도율</h3>
          
          <div className="donut-svg-wrapper">
            <svg className="w-full h-full transform -rotate-90" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* 배경 원 */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-100 fill-transparent"
                strokeWidth="10"
                style={{ stroke: 'var(--slate-100)', fill: 'transparent' }}
              />
              {/* 게이지 원 */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-teal-500 fill-transparent transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ stroke: 'var(--teal-500)', fill: 'transparent', transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute text-center" style={{ position: 'absolute' }}>
              <span className="text-2xl font-black text-slate-800 block">{completedPercent}%</span>
              <p className="text-[10px] text-slate-400 font-bold block" style={{ margin: 0 }}>이수 완료</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold leading-relaxed" style={{ margin: 0 }}>
            전체 {totalCount}개 학습 모듈 중 <span className="text-teal-600 font-bold">{completedCount}개</span> 이수
          </p>
        </div>

        {/* 우측 2칸: 세부 진도율 바 그래프 및 퀴즈 요약 */}
        <div className="study-main-col stats-detail-card">
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5" style={{ margin: '0 0 20px 0' }}>카테고리별 이수 세부현황</h3>
            
            {/* 워크스페이스 게이지 바 */}
            <div className="mb-6">
              <div className="gauge-bar-label">
                <span className="font-bold text-slate-700">📚 Google Workspace for Education</span>
                <span className="text-slate-500 font-semibold">{workspaceCompleted} / {workspaceModules.length} 완료 ({workspacePercent}%)</span>
              </div>
              <div className="gauge-bar-track">
                <div className="gauge-bar-fill-indigo" style={{ width: `${workspacePercent}%` }}></div>
              </div>
            </div>

            {/* 스프레드시트 게이지 바 */}
            <div className="mb-6">
              <div className="gauge-bar-label">
                <span className="font-bold text-slate-700">📊 구글 스프레드시트 기능 마스터</span>
                <span className="text-slate-500 font-semibold">{sheetsCompleted} / {sheetsModules.length} 완료 ({sheetsPercent}%)</span>
              </div>
              <div className="gauge-bar-track">
                <div className="gauge-bar-fill-teal" style={{ width: `${sheetsPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* 퀴즈 정답률 요약 그리드 */}
          <div className="stats-grid-2col pt-6" style={{ borderTop: '1px solid var(--slate-100)' }}>
            <div className="stat-inner-card">
              <span className="text-slate-400 font-bold block mb-0-5" style={{ fontSize: '9px', textTransform: 'uppercase' }}>평균 퀴즈 점수</span>
              <p className="text-lg font-black text-slate-800" style={{ margin: 0 }}>{quizAverage}점</p>
            </div>
            <div className="stat-inner-card">
              <span className="text-slate-400 font-bold block mb-0-5" style={{ fontSize: '9px', textTransform: 'uppercase' }}>퀴즈 80점 이상 통과 모듈</span>
              <p className="text-lg font-black text-teal-600" style={{ margin: 0 }}>
                {passedQuizCount} / {totalCount}개
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. 자동 수료 발급 요건 체크리스트 보드 */}
      <div className="stats-detail-card">
        <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-1-5" style={{ margin: 0 }}>
          <Icons.CheckSquare size={18} className="text-teal-600" />
          학습 수료 및 자동 수료증 발급 요건
        </h3>
        <p className="text-xs text-slate-500 mb-6" style={{ margin: 0 }}>
          두 가지 핵심 조건을 모두 충족하는 즉시, 골드 인장이 달린 프리미엄 수료증이 자동 활성화되며 실시간 인쇄가 가능해집니다.
        </p>

        <div className="study-layout-grid mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          
          {/* 요건 1 */}
          <div className={`condition-card-item ${condition1 ? 'satisfied' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 font-bold tracking-wider uppercase block" style={{ fontSize: '9px' }}>요건 01</span>
              {condition1 ? (
                <Icons.CheckCircle2 className="text-emerald-600" size={24} />
              ) : (
                <Icons.CircleDot className="text-slate-400" size={24} />
              )}
            </div>
            <h4 className="text-xs font-black mb-1" style={{ margin: '4px 0' }}>모든 자가학습 코스 이수 완료</h4>
            <p className="text-[11px] leading-relaxed" style={{ opacity: 0.85, margin: 0 }}>
              전체 25개 학습 모듈의 설명과 핵심 실무 단계를 모두 정독하고 학습 완료를 클릭해야 합니다.
            </p>
            <div className="mt-3 text-xs font-bold">
              진행 상태: {completedCount} / {totalCount}개 완료 ({completedPercent}%)
            </div>
          </div>

          {/* 요건 2 */}
          <div className={`condition-card-item ${condition2 ? 'satisfied' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 font-bold tracking-wider uppercase block" style={{ fontSize: '9px' }}>요건 02</span>
              {condition2 ? (
                <Icons.CheckCircle2 className="text-emerald-600" size={24} />
              ) : (
                <Icons.CircleDot className="text-slate-400" size={24} />
              )}
            </div>
            <h4 className="text-xs font-black mb-1" style={{ margin: '4px 0' }}>전 과목 실무 퀴즈 통과 (평균 80점 이상)</h4>
            <p className="text-[11px] leading-relaxed" style={{ opacity: 0.85, margin: 0 }}>
              각 모듈별로 제공되는 간호 실무 적용형 퀴즈를 모두 풀어 각각 80점 이상을 달성해야 합니다.
            </p>
            <div className="mt-3 text-xs font-bold">
              진행 상태: {passedQuizCount} / {totalCount}개 통과
            </div>
          </div>

        </div>

        {/* 조건 충족에 따른 가이드 바 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 rounded-2xl border" style={{ backgroundColor: 'var(--slate-50)', borderColor: 'var(--slate-200)' }}>
          <div>
            <h4 className="text-xs font-bold text-slate-800" style={{ margin: 0 }}>
              {isEligibleForCert ? '🎉 수료 조건이 모두 만족되었습니다!' : '아직 수료 조건을 충족하지 못하셨습니다.'}
            </h4>
            <p className="text-[11px] text-slate-500" style={{ margin: 0 }}>
              {isEligibleForCert 
                ? '수료증 탭으로 이동해 본인 명의의 고품질 인증서를 확인하고 인쇄해 보세요.' 
                : '대시보드에서 파란색 카드를 클릭해 미진한 코스 학습 및 퀴즈를 끝마치십시오.'}
            </p>
          </div>
          {isEligibleForCert ? (
            <button
              onClick={() => setCurrentTab('certificate')}
              className="print-action-btn w-full sm:w-auto"
              style={{ fontSize: '0.75rem', padding: '10px 20px', borderRadius: '12px' }}
            >
              <Icons.Award size={16} /> 수료증 발급하러 가기 <Icons.ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="print-action-btn w-full sm:w-auto"
              style={{ fontSize: '0.75rem', padding: '10px 20px', borderRadius: '12px', backgroundColor: 'var(--blue-600)' }}
            >
              <Icons.Play size={16} /> 학습 계속하기 <Icons.ArrowRight size={14} />
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
