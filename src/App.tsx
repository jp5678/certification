import { useState, useEffect } from 'react';
import type { UserProgress, WrongQuizLog } from './types';
import { STUDY_MODULES } from './data';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { StudyView } from './components/StudyView';
import { QuizView } from './components/QuizView';
import { ReviewNoteView } from './components/ReviewNoteView';
import { StatsView } from './components/StatsView';
import { CertificateView } from './components/CertificateView';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// 로컬 스토리지 키 정의
const LOCAL_STORAGE_KEY = 'NURSE_EDU_PLATFORM_PROGRESS_V1';

const DEFAULT_PROGRESS: UserProgress = {
  userName: '정종필',
  completedModules: [],
  quizScores: {},
  wrongQuizzes: [],
  certifiedAt: null,
};

function App() {
  // --- 상태 관리 ---
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('로컬 스토리지 파싱 실패:', e);
      }
    }
    return DEFAULT_PROGRESS;
  });

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [isQuizMode, setIsQuizMode] = useState<boolean>(false);

  const activeModule = STUDY_MODULES.find((m) => m.id === activeModuleId);

  // 진행 상태가 변경될 때마다 로컬 스토리지에 자동 저장
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  // --- 구글 애널리틱스(GA4) 가상 페이지 뷰 추적 ---
  useEffect(() => {
    if (typeof window.gtag !== 'function') return;

    let pagePath = `/${currentTab}`;
    let pageTitle = '';

    if (activeModuleId && activeModule) {
      if (isQuizMode) {
        pagePath = `/study/${activeModuleId}/quiz`;
        pageTitle = `퀴즈: ${activeModule.title}`;
      } else {
        pagePath = `/study/${activeModuleId}`;
        pageTitle = `학습: ${activeModule.title}`;
      }
    } else {
      switch (currentTab) {
        case 'dashboard':
          pageTitle = '대시보드';
          break;
        case 'review':
          pageTitle = '오답노트';
          break;
        case 'stats':
          pageTitle = '나의 통계';
          break;
        case 'certificate':
          pageTitle = '수료증 발급';
          break;
        default:
          pageTitle = '대시보드';
      }
    }

    // 가상 페이지 뷰 데이터 전송
    window.gtag('config', 'G-ELL5CEKB7J', {
      page_path: pagePath,
      page_title: pageTitle,
    });

    console.log(`[GA4] Page View Tracked: ${pagePath} - ${pageTitle}`);
  }, [currentTab, activeModuleId, isQuizMode, activeModule]);

  // --- 콜백 제어 기능 ---

  // 학생 이름 변경
  const handleUpdateName = (name: string) => {
    setProgress((prev) => ({
      ...prev,
      userName: name,
    }));
  };

  // 모듈 선택
  const handleSelectModule = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setIsQuizMode(false);
  };



  // 퀴즈 응시 완료
  const handleQuizFinished = (score: number, newWrongs: Omit<WrongQuizLog, 'solvedAt'>[]) => {
    if (!activeModuleId || !activeModule) return;

    // GA4 퀴즈 완료 이벤트 전송
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'quiz_complete', {
        module_id: activeModuleId,
        module_title: activeModule.title,
        score: score,
        pass: score >= 80 ? 'pass' : 'fail',
      });
    }

    setProgress((prev) => {
      // 최고 점수 갱신
      const prevScore = prev.quizScores[activeModuleId] || 0;
      const updatedScores = {
        ...prev.quizScores,
        [activeModuleId]: Math.max(prevScore, score),
      };

      // 80점 이상 시 이수 완료 처리
      let updatedCompleted = [...prev.completedModules];
      if (score >= 80 && !updatedCompleted.includes(activeModuleId)) {
        updatedCompleted.push(activeModuleId);
      }

      // 오답 리스트 갱신: 현재 응시한 모듈의 기존 오답을 모두 제거한 후, 이번에 새로 틀린 오답만 추가합니다.
      // 이를 통해 이번에 맞춘 문제는 오답노트에서 자동으로 제거됩니다.
      let updatedWrongs = prev.wrongQuizzes.filter((w) => w.moduleId !== activeModuleId);
      const solvedAt = new Date().toISOString();

      newWrongs.forEach((wrong) => {
        const logEntry: WrongQuizLog = { ...wrong, solvedAt };
        updatedWrongs.push(logEntry);
      });

      // 만약 수료 조건을 충족했고 아직 발급일자가 없다면 자동 세팅
      const isNowCertified = updatedCompleted.length === STUDY_MODULES.length &&
        STUDY_MODULES.every(m => (updatedScores[m.id] || 0) >= 80);

      return {
        ...prev,
        quizScores: updatedScores,
        completedModules: updatedCompleted,
        wrongQuizzes: updatedWrongs,
        certifiedAt: isNowCertified && !prev.certifiedAt ? solvedAt : prev.certifiedAt,
      };
    });

    // 퀴즈 모드 해제
    setIsQuizMode(false);
  };



  // 최종 수료증 수동/자동 발행 확정
  const handleIssueCertificate = () => {
    if (progress.certifiedAt) return;

    // GA4 수료증 발급 이벤트 전송
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'issue_certificate', {
        user_name: progress.userName,
        issued_at: new Date().toISOString(),
      });
    }

    setProgress((prev) => ({
      ...prev,
      certifiedAt: new Date().toISOString(),
    }));
  };

  // --- 현재 렌더링할 뷰 계산 ---
  const renderContent = () => {
    // 1. 퀴즈 모드 활성화 시
    if (activeModuleId && activeModule && isQuizMode) {
      return (
        <QuizView
          module={activeModule}
          onBackToStudy={() => setIsQuizMode(false)}
          onQuizFinished={handleQuizFinished}
        />
      );
    }

    // 2. 단일 과목 상세 학습 뷰 활성화 시
    if (activeModuleId && activeModule) {
      return (
        <StudyView
          module={activeModule}
          onBackToDashboard={() => setActiveModuleId(null)}
          onStartQuiz={() => setIsQuizMode(true)}
          isCompleted={progress.completedModules.includes(activeModuleId)}
        />
      );
    }

    // 3. 네비게이션 탭 라우팅
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            progress={progress}
            onSelectModule={handleSelectModule}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'review':
        return (
          <ReviewNoteView
            progress={progress}
            onNavigateToModule={(moduleId) => {
              setActiveModuleId(moduleId);
              setIsQuizMode(true);
            }}
          />
        );
      case 'stats':
        return (
          <StatsView
            progress={progress}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'certificate':
        return (
          <CertificateView
            progress={progress}
            setCurrentTab={setCurrentTab}
            onIssueCertificate={handleIssueCertificate}
          />
        );
      default:
        return (
          <DashboardView
            progress={progress}
            onSelectModule={handleSelectModule}
            setCurrentTab={setCurrentTab}
          />
        );
    }
  };

  return (
    <div className="flex flex-col justify-between" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
      <div>
        {/* 상단 통합 헤더 (네비게이션 탭 제어 포함) */}
        <Header
          currentTab={activeModuleId ? 'study-mode' : currentTab}
          setCurrentTab={(tab) => {
            setActiveModuleId(null);
            setIsQuizMode(false);
            setCurrentTab(tab);
          }}
          progress={progress}
          onUpdateName={handleUpdateName}
        />

        {/* 메인 콘텐츠 표출 영역 */}
        <main className="w-full" style={{ padding: '0 16px' }}>
          {renderContent()}
        </main>
      </div>

      {/* 하단 심플 푸터 */}
      <footer className="w-full no-print text-center text-xs" style={{ backgroundColor: 'var(--slate-100)', borderTop: '1px solid var(--slate-200)', padding: '24px 0', color: 'var(--slate-500)', marginTop: '48px' }}>
        <div className="max-w-7xl" style={{ padding: '0 16px' }}>
          <p>© 2026 제프리 교수 | All rights reserved.</p>
          <p className="mt-1 text-[10px] text-slate-400" style={{ margin: '12px 0 0 0' }}>본 플랫폼의 콘텐츠는 AI 기반으로 생성되어 배포되었으니 확인 및 검토 과정이 필요합니다.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
