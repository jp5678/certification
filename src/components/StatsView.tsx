import React from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress } from '../types';
import { STUDY_MODULES } from '../data';

interface StatsViewProps {
  progress: UserProgress;
  setCurrentTab: (tab: string) => void;
}

// 개별 역량 Circular Progress Card 컴포넌트
const CompetencyCard: React.FC<{
  title: string;
  desc: string;
  percent: number;
  icon: React.ComponentType<any>;
  colorClass: string;
}> = ({ title, desc, percent, icon: Icon, colorClass }) => {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <div className="competency-track-card">
      <div className="competency-svg-container">
        <svg className="w-full h-full transform -rotate-90" style={{ width: '80px', height: '80px', transform: 'rotate(-90deg)' }}>
          <circle 
            cx="40" 
            cy="40" 
            r={r} 
            fill="transparent" 
            stroke="var(--slate-200)" 
            strokeWidth="5" 
          />
          <circle 
            cx="40" 
            cy="40" 
            r={r} 
            fill="transparent" 
            stroke={`var(--${colorClass})`} 
            strokeWidth="6" 
            strokeDasharray={circ} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            style={{ 
              transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
              filter: `drop-shadow(0 0 3px var(--${colorClass}))`
            }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Icon size={18} style={{ color: `var(--${colorClass})` }} />
          <span className="text-[11px] font-black text-slate-700 mt-0-5" style={{ fontSize: '10px', marginTop: '2px' }}>{percent}%</span>
        </div>
      </div>
      <div className="competency-title mt-2">{title}</div>
      <div className="competency-desc">{desc}</div>
    </div>
  );
};

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

  // --- 간호 실무 5대 리터러시 역량 지수 연산 ---
  
  // 1. 보건 의료 데이터 분석력: 'sheets' 카테고리 모듈 이수 수
  const analysisPercent = sheetsPercent;

  // 2. 임상 일정 및 업무 조율력: 'calendar' 및 'classroom' 모듈 이수 수
  const scheduleModules = STUDY_MODULES.filter(m => m.id === 'calendar' || m.id === 'classroom');
  const scheduleCompleted = scheduleModules.filter(m => progress.completedModules.includes(m.id)).length;
  const schedulePercent = Math.round((scheduleCompleted / scheduleModules.length) * 100) || 0;

  // 3. 스마트 행정 협업력: 'gmail' 및 'docs' 모듈 이수 수
  const collabModules = STUDY_MODULES.filter(m => m.id === 'gmail' || m.id === 'docs');
  const collabCompleted = collabModules.filter(m => progress.completedModules.includes(m.id)).length;
  const collabPercent = Math.round((collabCompleted / collabModules.length) * 100) || 0;

  // 4. 환자 교육 및 정보 전달력: 'drive' 및 'slides' 모듈 이수 수
  const eduModules = STUDY_MODULES.filter(m => m.id === 'drive' || m.id === 'slides');
  const eduCompleted = eduModules.filter(m => progress.completedModules.includes(m.id)).length;
  const eduPercent = Math.round((eduCompleted / eduModules.length) * 100) || 0;

  // 5. 임상 학습 및 피드백 수행력: 퀴즈 평균 점수 연계
  const feedbackPercent = quizAverage;

  // 메달 뱃지 판정 도우미
  const getMedalComponent = (score: number | undefined) => {
    if (score === undefined) {
      return (
        <span className="medal-badge-premium medal-bronze" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-400)', borderColor: 'var(--slate-250)' }}>
          <Icons.Lock size={10} style={{ marginRight: '3px' }} /> 미응시
        </span>
      );
    }
    if (score === 100) {
      return (
        <span className="medal-badge-premium medal-gold animate-pulse">
          🏆 Gold Crown (100)
        </span>
      );
    }
    if (score >= 80) {
      return (
        <span className="medal-badge-premium medal-silver">
          🥇 우수 실무 ({score})
        </span>
      );
    }
    return (
      <span className="medal-badge-premium medal-bronze">
        🥈 이수 노력 ({score})
      </span>
    );
  };

  return (
    <div className="max-w-7xl px-4 md:px-6 fade-in pb-16 no-print">
      
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
        
        {/* 좌측 1칸: SVG 도넛 진도 차트 (그라데이션 및 입체 필터 보강) */}
        <div className="stats-donut-box shadow-premium">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5" style={{ margin: '0 0 20px 0' }}>전체 이수 진도율</h3>
          
          <div className="donut-svg-wrapper">
            <svg className="w-full h-full transform -rotate-90" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              {/* 그라데이션 정의 */}
              <defs>
                <linearGradient id="tealEmeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--teal-500)" />
                  <stop offset="100%" stopColor="var(--emerald-500)" />
                </linearGradient>
                <filter id="subtleShadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.08" />
                </filter>
              </defs>
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
                fill="transparent"
                stroke="url(#tealEmeraldGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ 
                  transition: 'stroke-dashoffset 1s ease',
                  filter: 'url(#subtleShadow)'
                }}
              />
            </svg>
            <div className="absolute text-center" style={{ position: 'absolute' }}>
              <span className="text-3xl font-black text-slate-800 block" style={{ letterSpacing: '-0.5px' }}>{completedPercent}%</span>
              <p className="text-[10px] text-slate-400 font-bold block" style={{ margin: 0, textTransform: 'uppercase' }}>이수 완료</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 font-semibold leading-relaxed" style={{ margin: 0 }}>
            전체 {totalCount}개 학습 모듈 중 <span className="text-teal-600 font-bold">{completedCount}개</span> 이수 완료
          </p>
        </div>

        {/* 우측 2칸: 세부 진도율 바 그래프 및 퀴즈 요약 */}
        <div className="study-main-col stats-detail-card shadow-premium">
          
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5" style={{ margin: '0 0 20px 0' }}>카테고리별 이수 세부현황</h3>
            
            {/* 워크스페이스 게이지 바 */}
            <div className="mb-6">
              <div className="gauge-bar-label">
                <span className="font-bold text-slate-700 flex items-center gap-1">📚 Google Workspace for Education</span>
                <span className="text-slate-500 font-semibold">{workspaceCompleted} / {workspaceModules.length} 완료 ({workspacePercent}%)</span>
              </div>
              <div className="gauge-bar-track">
                <div className="gauge-bar-fill-indigo" style={{ width: `${workspacePercent}%` }}></div>
              </div>
            </div>

            {/* 스프레드시트 게이지 바 */}
            <div className="mb-6">
              <div className="gauge-bar-label">
                <span className="font-bold text-slate-700 flex items-center gap-1">📊 구글 스프레드시트 기능 마스터</span>
                <span className="text-slate-500 font-semibold">{sheetsCompleted} / {sheetsModules.length} 완료 ({sheetsPercent}%)</span>
              </div>
              <div className="gauge-bar-track">
                <div className="gauge-bar-fill-teal" style={{ width: `${sheetsPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* 퀴즈 정답률 요약 그리드 */}
          <div className="stats-grid-2col pt-6" style={{ borderTop: '1px solid var(--slate-200)' }}>
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

      {/* 3. 간호 실무 디지털 리터러시 5대 핵심 역량 지수 (신설) */}
      <div className="stats-detail-card mb-8 shadow-premium">
        <div>
          <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-1-5" style={{ margin: 0 }}>
            <Icons.Activity size={18} className="text-teal-600" />
            🩺 나의 간호 실무 리터러시 역량 분석
          </h3>
          <p className="text-xs text-slate-500" style={{ margin: 0 }}>
            학습 완료 기록과 퀴즈 통과 현황을 간호 임상 현장에서 실시간 요구하는 5대 핵심 실무 디지털 리터러시 영역으로 맵핑 및 분석한 능력 지표입니다.
          </p>
        </div>

        <div className="competency-gauge-grid">
          <CompetencyCard 
            title="보건 의료 데이터 분석력" 
            desc="환자 Vital Sign 연산 및 입퇴원 통계 분석 (Sheets 기반)" 
            percent={analysisPercent} 
            icon={Icons.FileSpreadsheet} 
            colorClass="teal-600" 
          />
          <CompetencyCard 
            title="임상 일정 및 업무 조율력" 
            desc="3교대 간호 근무 일정 조율 및 수업 일정 관리" 
            percent={schedulePercent} 
            icon={Icons.Clock} 
            colorClass="blue-600" 
          />
          <CompetencyCard 
            title="스마트 행정 협업력" 
            desc="보안 메일 기반 인계 및 스마트 협진 공동 작업" 
            percent={collabPercent} 
            icon={Icons.Users} 
            colorClass="emerald-600" 
          />
          <CompetencyCard 
            title="환자 교육 및 정보 전달력" 
            desc="환자 퇴원/낙상 교육 자료 기획 및 슬라이드 제작" 
            percent={eduPercent} 
            icon={Icons.Presentation} 
            colorClass="gold-500" 
          />
          <CompetencyCard 
            title="임상 학습 및 피드백 수행력" 
            desc="퀴즈 응시 평균 최고 점수 및 자가 피드백 완성도" 
            percent={feedbackPercent} 
            icon={Icons.RotateCw} 
            colorClass="red-500" 
          />
        </div>
      </div>

      {/* 4. 과목별 퀴즈 프리미엄 메달 현황판 (신설) */}
      <div className="stats-detail-card mb-8 shadow-premium">
        <h3 className="text-sm font-black text-slate-800 mb-2 flex items-center gap-1-5" style={{ margin: 0 }}>
          <Icons.Award size={18} className="text-gold-500" />
          과목별 실무 퀴즈 메달 현황
        </h3>
        <p className="text-xs text-slate-500 mb-6" style={{ margin: 0 }}>
          각 과목별 퀴즈 성취도에 따라 골드 크라운(100점), 실버(80점 이상) 메달을 획득합니다. 모든 퀴즈에 응시하여 우수 실무 등급(실버 이상)을 달성해 보세요!
        </p>

        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {STUDY_MODULES.map((m) => {
            const score = progress.quizScores[m.id];
            return (
              <div 
                key={m.id} 
                className="flex items-center justify-between p-3-5 rounded-xl border" 
                style={{ 
                  backgroundColor: score !== undefined ? 'var(--color-bg-surface)' : 'var(--slate-50)',
                  borderColor: score >= 80 ? 'var(--emerald-200)' : 'var(--slate-200)' 
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{m.title.replace(/^\d+\.\s*/, '')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getMedalComponent(score)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. 자동 수료 발급 요건 체크리스트 보드 */}
      <div className="stats-detail-card shadow-premium">
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
              전체 {totalCount}개 학습 모듈의 설명과 핵심 실무 단계를 모두 정독하고 학습 완료를 클릭해야 합니다.
            </p>
            <div className="mt-3 text-xs font-bold">
              진행 상태: {completedCount} / {totalCount}개 완료 ({completedPercent}% 완료)
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
              진행 상태: {passedQuizCount} / {totalCount}개 통과 ({Math.round(passedQuizCount / totalCount * 100) || 0}% 완료)
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
