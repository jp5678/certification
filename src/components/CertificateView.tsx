import React from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress } from '../types';
import { STUDY_MODULES } from '../data';

interface CertificateViewProps {
  progress: UserProgress;
  setCurrentTab: (tab: string) => void;
  onIssueCertificate: () => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  progress,
  setCurrentTab,
  onIssueCertificate,
}) => {
  const totalCount = STUDY_MODULES.length;
  const completedCount = progress.completedModules.length;
  const passedQuizCount = STUDY_MODULES.filter(
    m => (progress.quizScores[m.id] || 0) >= 80
  ).length;

  const condition1 = completedCount === totalCount;
  const condition2 = passedQuizCount === totalCount;
  const isEligible = condition1 && condition2;

  const handlePrint = () => {
    if (!isEligible) return;

    // 만약 발급일자가 설정되지 않았다면 실시간 발급 처리
    if (!progress.certifiedAt) {
      onIssueCertificate();
    }

    // 프린트 구동 (CSS @media print 에 정의된 최적화로 인쇄됨)
    window.print();
  };

  const getFormattedDate = () => {
    const dateStr = progress.certifiedAt || new Date().toISOString();
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
  };



  return (
    <div className="max-w-5xl px-4 md:px-6 fade-in pb-16">
      
      {/* 잠금(Lock) 상태 - 수료 조건 만족 안 됨 */}
      {!isEligible ? (
        <div className="flex flex-col gap-8 fade-in">
          
          <div className="cert-locked-alert-box no-print">
            
            <div className="lock-icon-bg">
              <Icons.Lock size={44} />
            </div>

            <h3 className="text-xl font-black text-slate-800 mb-2" style={{ margin: 0 }}>🔒 수료증이 아직 잠겨 있습니다</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-8 max-w-md mx-auto" style={{ margin: '8px auto 24px auto' }}>
              수료증을 발급받기 위해서는 전체 27개 자가학습 모듈을 모두 이수하고, 모든 퀴즈에서 각각 80점 이상의 합격 성적을 달성하셔야 합니다.
            </p>

            {/* 현재 조건 충족 현황 */}
            <div className="grid gap-4 max-w-md mx-auto mb-8 text-left text-xs" 
                 style={{ 
                   gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                   backgroundColor: 'var(--slate-50)',
                   padding: '20px',
                   borderRadius: '16px',
                   border: '1px solid var(--slate-200)'
                 }}>
              <div>
                <span className="text-slate-400 font-bold block mb-1" style={{ fontSize: '9px' }}>조건 1: 자가학습 이수 ({completedCount}/{totalCount})</span>
                <div className="flex items-center gap-1-5 font-bold">
                  {condition1 ? (
                    <span className="text-emerald-600 flex items-center gap-0-5"><Icons.CheckCircle2 size={14} /> 만족</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-0-5"><Icons.XCircle size={14} /> 미완료 ({(totalCount - completedCount)}개 남음)</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-bold block mb-1" style={{ fontSize: '9px' }}>조건 2: 퀴즈 80점 통과 ({passedQuizCount}/{totalCount})</span>
                <div className="flex items-center gap-1-5 font-bold">
                  {condition2 ? (
                    <span className="text-emerald-600 flex items-center gap-0-5"><Icons.CheckCircle2 size={14} /> 만족</span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-0-5"><Icons.XCircle size={14} /> 미달성 ({(totalCount - passedQuizCount)}개 남음)</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className="print-action-btn"
              style={{ margin: '0 auto', padding: '12px 32px', borderRadius: '16px', backgroundColor: 'var(--blue-600)' }}
            >
              <Icons.BookOpen size={16} /> 계속 자가학습 하러가기
            </button>

          </div>

          {/* 수료증 예시 미리보기 섹션 */}
          <div className="no-print text-center pt-8" style={{ borderTop: '2px dashed var(--slate-200)' }}>
            <h4 className="text-sm font-black text-slate-800 mb-2 flex items-center justify-center gap-1-5">
              <Icons.Award size={18} className="text-amber-500" />
              수료 요건 충족 시 해금되는 수료증 디자인 예시
            </h4>
            <p className="text-xs text-slate-400 mb-6" style={{ margin: 0 }}>
              본 예시는 미리보기(Preview) 화면이며, 학습을 완수하면 실제 본인 이름 찍힌 고화질 원본 수료증이 자동 잠금 해제되어 인쇄 및 PDF 저장이 가능해집니다.
            </p>

            {/* 예시 수료증 렌더링 (축소 및 연한 워터마크 효과) */}
            <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              
              {/* 실제 디자인과 완전히 동일하지만 예시 정보가 들어간 프레임 */}
              <div className="print-container bg-white border-[12px] border-double border-blue-900 rounded-xl p-6 shadow-premium relative mx-auto overflow-hidden opacity-75"
                   style={{ 
                     width: '50%',
                     minWidth: '320px',
                     aspectRatio: '1.414 / 1', 
                     backgroundImage: 'radial-gradient(circle, rgba(238, 242, 255, 0.2) 0%, rgba(255, 255, 255, 1) 100%)',
                     boxSizing: 'border-box',
                     border: '12px double var(--blue-900)',
                     borderRadius: '12px',
                     filter: 'grayscale(15%)'
                   }}>

                {/* 워터마크 오버레이가 수료증 예시 영역 내부에만 얹히도록 프레임 내부로 이동 */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backgroundColor: 'rgba(15, 23, 42, 0.02)', 
                  zIndex: 20, 
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ 
                    fontSize: '3rem', 
                    fontWeight: 900, 
                    color: 'rgba(239, 68, 68, 0.08)', 
                    transform: 'rotate(-25deg)', 
                    letterSpacing: '0.3em',
                    border: '6px solid rgba(239, 68, 68, 0.08)',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    textTransform: 'uppercase'
                  }}>
                    예시 (PREVIEW)
                  </span>
                </div>

                <div className="border border-amber-400/80 w-full h-full p-6 flex flex-col justify-between items-center text-center relative z-10"
                     style={{ border: '1px solid rgba(245, 158, 11, 0.8)', height: '100%' }}>
                  
                  {/* 타이틀 */}
                  <div className="mt-4" style={{ marginTop: '16px' }}>
                    <div className="w-10 h-0.5 bg-amber-400 mx-auto mb-2" style={{ width: '40px', height: '2px', backgroundColor: 'var(--gold-400)', margin: '0 auto 8px auto' }}></div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-blue-900 uppercase mb-1" style={{ margin: 0, letterSpacing: '0.2em' }}>
                      수 료 증
                    </h1>
                    <span className="text-[8px] font-bold text-amber-500 uppercase tracking-[0.35em] block" style={{ fontSize: '8px', letterSpacing: '0.35em', color: 'var(--gold-500)' }}>
                      Certificate of Completion
                    </span>
                  </div>

                  {/* 인적 사항 */}
                  <div className="my-3" style={{ margin: '16px 0' }}>
                    <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-1-5 justify-center mb-1" style={{ margin: 0 }}>
                      성 명: <span className="underline px-2" style={{ textDecoration: 'underline', textDecorationColor: 'var(--gold-400)', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>{progress.userName || '홍 길 동 (예시)'}</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold" style={{ margin: '4px 0 0 0' }}>소속: 청암대학교 간호학과</p>
                  </div>

                  {/* 본문 */}
                  <div className="max-w-xl px-4" style={{ maxWidth: '576px' }}>
                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed text-justify font-medium" style={{ textIndent: '10px', margin: 0 }}>
                      위 사람은 Google Workspace for Education & Google Spreadsheet 간호 실무 융합형 디지털 리터러시 자가학습 과정을 성실히 이수하고 수료 기준 평가 과정을 우수하게 통과하였으므로 이 수료증을 발급해 드립니다.
                    </p>
                  </div>

                  {/* 엠블럼 */}
                  <div className="my-1 select-none relative w-20 h-20 flex items-center justify-center" style={{ position: 'relative', width: '80px', height: '80px', margin: '4px 0' }}>
                    <div className="absolute w-16 h-16 rounded-full border-2 border-double border-amber-400 bg-amber-500/10 flex items-center justify-center"
                         style={{ position: 'absolute', width: '64px', height: '64px', borderRadius: '9999px', border: '2px double var(--gold-400)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                      <div className="text-[6px] font-black text-amber-600 uppercase tracking-widest text-center leading-none" style={{ fontSize: '6px' }}>
                        JEFFREY<br />PROF<br /><span style={{ fontSize: '5px' }}>APPROVED</span>
                      </div>
                    </div>
                    <div className="absolute bottom-0-5 w-10 h-5 bg-amber-400/20 rotate-[35deg] -z-10 rounded-sm" style={{ position: 'absolute', transform: 'rotate(35deg)', zIndex: -10, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}></div>
                    <div className="absolute bottom-0-5 w-10 h-5 bg-amber-400/20 -rotate-[35deg] -z-10 rounded-sm" style={{ position: 'absolute', transform: 'rotate(-35deg)', zIndex: -10, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}></div>
                  </div>

                  {/* 하단 서명 */}
                  <div className="w-full flex justify-between items-end px-4 mb-1" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 36px' }}>
                    <div className="text-left" style={{ textAlign: 'left' }}>
                      <span className="text-[9px] text-slate-400 block font-semibold" style={{ fontSize: '9px' }}>발급일자</span>
                      <span className="text-xs font-bold text-slate-600">2026년 05월 29일</span>
                    </div>

                    <div className="text-right flex items-center gap-3 relative" style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                      <div className="text-right" style={{ textAlign: 'right' }}>
                        <span className="text-sm font-black text-blue-900 tracking-wider">
                          담당교수 : 제프리 교수
                        </span>
                      </div>
                      {/* 교수 인장(직인) 첨부 이미지 렌더링 */}
                      <img src={`${import.meta.env.BASE_URL}jeffrey_stamp.png`} 
                           alt="제프리 교수 직인" 
                           className="w-10 h-10 object-contain transform rotate-12 select-none"
                           style={{ 
                             width: '40px',
                             height: '40px',
                             transform: 'rotate(12deg)',
                             position: 'relative',
                             top: '-2px'
                           }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        
        /* 잠금 해제(Unlock) 상태 - 수료 가능 및 럭셔리 수료증 렌더링 */
        <div className="fade-in">
          
          {/* 상단 제어 바 */}
          <div className="cert-unlocked-banner mb-8 no-print">
            <div className="flex items-center gap-3">
              <div className="cert-banner-icon-bg animate-bounce">
                <Icons.PartyPopper size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-emerald-950" style={{ margin: 0 }}>축하합니다! 자가학습 수료증이 잠금 해제되었습니다.</h3>
                <p className="text-[11px] text-emerald-800" style={{ margin: 0 }}>
                  아래의 완성된 수료증을 확인하고 [인쇄 및 PDF 저장] 버튼을 눌러 소장 및 제출용 문서로 출력하세요.
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="print-action-btn w-full sm:w-auto"
              style={{ padding: '12px 24px', borderRadius: '12px' }}
            >
              <Icons.Printer size={16} /> 수료증 인쇄 및 PDF 저장
            </button>
          </div>

          {/* ========================================================
             🎓 인쇄/표출용 프리미엄 수료증 양식 (A4 Landscape aspect ratio)
             ======================================================== */}
          <div className="print-container bg-white border-[16px] border-double border-blue-900 rounded-xl p-8 md:p-12 shadow-premium relative mx-auto overflow-hidden max-w-4xl"
               style={{ 
                 aspectRatio: '1.414 / 1', 
                 backgroundImage: 'radial-gradient(circle, rgba(238, 242, 255, 0.2) 0%, rgba(255, 255, 255, 1) 100%)',
                 boxSizing: 'border-box',
                 border: '16px double var(--blue-900)',
                 borderRadius: '12px'
               }}>
            
            {/* 수료증 내부 럭셔리 골드 얇은 테두리 */}
            <div className="border border-amber-400/80 w-full h-full p-6 md:p-8 flex flex-col justify-between items-center text-center relative z-10"
                 style={{ border: '1px solid rgba(245, 158, 11, 0.8)', height: '100%' }}>
              
              {/* 상단 장식 및 타이틀 */}
              <div className="mt-8" style={{ marginTop: '32px' }}>
                <div className="w-12 h-1 bg-amber-400 mx-auto mb-3" style={{ width: '48px', height: '4px', backgroundColor: 'var(--gold-400)', margin: '0 auto 12px auto' }}></div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-blue-900 uppercase mb-1" style={{ margin: 0, letterSpacing: '0.2em' }}>
                  수 료 증
                </h1>
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.4em] block" style={{ fontSize: '9px', letterSpacing: '0.4em', color: 'var(--gold-500)' }}>
                  Certificate of Completion
                </span>
              </div>

              {/* 인적 사항 */}
              <div className="my-6" style={{ margin: '24px 0' }}>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-1-5 justify-center mb-1" style={{ margin: 0 }}>
                  성 명: <span className="underline px-2" style={{ textDecoration: 'underline', textDecorationColor: 'var(--gold-400)', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}>{progress.userName}</span>
                </h2>
                <p className="text-xs text-slate-500 font-semibold" style={{ margin: '4px 0 0 0' }}>소속: 청암대학교 간호학과</p>
              </div>

              {/* 수료 본문 */}
              <div className="max-w-2xl px-6 md:px-8" style={{ maxWidth: '672px' }}>
                <p className="text-xs md:text-sm text-slate-700 leading-loose text-justify font-medium" style={{ textIndent: '10px', margin: 0, fontSize: '0.85rem' }}>
                  위 사람은 Google Workspace for Education & Google Spreadsheet 간호 실무 융합형 디지털 리터러시 자가학습 과정을 성실히 이수하고 수료 기준 평가 과정을 우수하게 통과하였으므로 이 수료증을 발급해 드립니다.
                </p>
              </div>

              {/* 황금빛 인증 엠블럼 마크 */}
              <div className="my-2 select-none relative w-24 h-24 flex items-center justify-center" style={{ position: 'relative', width: '96px', height: '96px', margin: '8px 0' }}>
                <div className="absolute w-20 h-20 rounded-full border-4 border-double border-amber-400 bg-amber-500/10 flex items-center justify-center"
                     style={{ position: 'absolute', width: '80px', height: '80px', borderRadius: '9999px', border: '4px double var(--gold-400)', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                  <div className="text-[7px] font-black text-amber-600 uppercase tracking-widest text-center leading-none" style={{ fontSize: '7px' }}>
                    JEFFREY<br />PROF<br /><span style={{ fontSize: '6px' }}>APPROVED</span>
                  </div>
                </div>
                {/* 톱니바퀴 리본 리터럴 느낌 장식 */}
                <div className="absolute bottom-1 w-12 h-6 bg-amber-400/20 rotate-[35deg] -z-10 rounded-sm" style={{ position: 'absolute', transform: 'rotate(35deg)', zIndex: -10, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}></div>
                <div className="absolute bottom-1 w-12 h-6 bg-amber-400/20 -rotate-[35deg] -z-10 rounded-sm" style={{ position: 'absolute', transform: 'rotate(-35deg)', zIndex: -10, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}></div>
              </div>

              {/* 하단 날짜 및 서명 */}
              <div className="w-full flex justify-between items-end px-6 md:px-12 mb-2" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 48px' }}>
                <div className="text-left" style={{ textAlign: 'left' }}>
                  <span className="text-[10px] text-slate-400 block font-semibold" style={{ fontSize: '10px' }}>발급일자</span>
                  <span className="text-xs font-bold text-slate-700">{getFormattedDate()}</span>
                </div>

                <div className="text-right flex items-center gap-4 relative" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="text-sm font-black text-blue-900 tracking-wider">
                      담당교수 : 제프리 교수
                    </span>
                  </div>
                  {/* 교수 인장(직인) 첨부 이미지 렌더링 */}
                  <img src={`${import.meta.env.BASE_URL}jeffrey_stamp.png`} 
                       alt="제프리 교수 직인" 
                       className="w-14 h-14 object-contain transform rotate-12 select-none"
                       style={{ 
                         width: '56px',
                         height: '56px',
                         transform: 'rotate(12deg)',
                         position: 'relative',
                         top: '-4px'
                       }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
