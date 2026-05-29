import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { UserProgress, WrongQuizLog } from '../types';
import { STUDY_MODULES } from '../data';

interface ReviewNoteViewProps {
  progress: UserProgress;
  onRemoveWrongQuiz: (moduleId: string, quizId: string) => void;
}

export const ReviewNoteView: React.FC<ReviewNoteViewProps> = ({
  progress,
  onRemoveWrongQuiz,
}) => {
  const [retakeQuiz, setRetakeQuiz] = useState<WrongQuizLog | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const getModuleName = (moduleId: string) => {
    return STUDY_MODULES.find(m => m.id === moduleId)?.title || '알 수 없는 과목';
  };

  const getOriginalQuiz = (moduleId: string, quizId: string) => {
    const mod = STUDY_MODULES.find(m => m.id === moduleId);
    return mod?.quizzes.find(q => q.id === quizId);
  };

  const activeQuiz = retakeQuiz ? (() => {
    const orig = getOriginalQuiz(retakeQuiz.moduleId, retakeQuiz.quizId);
    return orig ? {
      ...retakeQuiz,
      question: orig.question,
      options: orig.options,
      correctAnswer: orig.answer,
      explanation: orig.explanation
    } : retakeQuiz;
  })() : null;

  const handleStartRetake = (log: WrongQuizLog) => {
    setRetakeQuiz(log);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const handleOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
  };

  const handleCloseRetake = () => {
    if (retakeQuiz && activeQuiz) {
      if (selectedOption === activeQuiz.correctAnswer && isAnswered) {
        // 정답을 맞춘 경우 오답노트에서 영구 제외
        onRemoveWrongQuiz(retakeQuiz.moduleId, retakeQuiz.quizId);
      }
    }
    setRetakeQuiz(null);
  };

  const wrongLogs = progress.wrongQuizzes || [];

  return (
    <div className="max-w-4xl px-4 md:px-6 fade-in pb-16 no-print">
      
      {/* 1. 인트로 헤더 */}
      <div className="mb-8">
        <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2 mb-1-5" style={{ margin: 0 }}>
          <Icons.BookOpenCheck className="text-teal-600" />
          오답노트 보관함
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed" style={{ margin: 0 }}>
          자가학습 퀴즈 도중 틀렸던 문제들이 자동으로 저장되는 개인 맞춤형 오답 관리함입니다. 복습 후 문제를 다시 풀어서 완벽히 마스터하면 오답노트에서 자동으로 제외됩니다.
        </p>
      </div>

      {/* 2. 오답 목록 렌더링 */}
      {wrongLogs.length === 0 ? (
        
        /* 오답 제로 (클리어 상태) */
        <div className="glass shadow-premium p-12 text-center max-w-xl mx-auto mt-8"
             style={{ 
               borderRadius: '24px',
               border: '1px solid white',
               background: 'linear-gradient(135deg, rgba(240, 253, 250, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)' 
             }}>
          <div className="bg-teal-500 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-5 pulse-accent">
            <Icons.CheckCircle2 size={36} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2" style={{ margin: 0 }}>오답이 0개입니다!</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            모든 실무 퀴즈를 완벽하게 정복했거나 아직 퀴즈를 틀린 기록이 없습니다. 대시보드로 이동해 계속해서 새로운 도구를 정복해 보세요.
          </p>
        </div>

      ) : (
        
        /* 오답이 존재하는 경우 리스트 표출 */
        <div className="grid gap-6">
          <div className="alert-banner-red">
            <Icons.AlertCircle className="flex-shrink-0" size={20} />
            <span>
              현재 총 {wrongLogs.length}개의 틀린 문제가 보관되어 있습니다. 다시 풀기(Retake)를 클릭해 복습을 끝마쳐 보세요.
            </span>
          </div>

          <div className="grid gap-6">
            {wrongLogs.map((log, idx) => (
              <div
                key={`${log.moduleId}-${log.quizId}-${idx}`}
                className="review-card-item"
              >
                <div className="flex-1">
                  
                  {/* 소속 카테고리 & 챕터명 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="card-badge-completed" style={{ backgroundColor: 'var(--slate-100)', color: 'var(--slate-700)', borderColor: 'var(--slate-200)' }}>
                      📍 {getModuleName(log.moduleId)}
                    </span>
                    <span className="text-slate-400 font-semibold" style={{ fontSize: '10px' }}>
                      기록일: {new Date(log.solvedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 질문 본문 */}
                  <h4 className="text-sm font-bold text-slate-800 mb-4 leading-relaxed" style={{ margin: '8px 0 16px 0' }}>
                    Q. {log.question}
                  </h4>

                  {/* 틀린 오답 & 정답 요약 피드백 */}
                  <div className="summary-logs-grid">
                    <div>
                      <span className="text-red-500 font-extrabold block mb-0-5" style={{ fontSize: '9px' }}>내가 선택했던 오답</span>
                      <p className="text-red-900 font-medium" style={{ margin: 0 }}>
                        ✗ {log.options[log.selectedAnswer]}
                      </p>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-extrabold block mb-0-5" style={{ fontSize: '9px' }}>실제 올바른 정답</span>
                      <p className="text-emerald-900 font-bold" style={{ margin: 0 }}>
                        ✓ {log.options[log.correctAnswer]}
                      </p>
                    </div>
                  </div>

                </div>

                {/* 동작 컨트롤 */}
                <div className="flex md:flex-col justify-end items-end gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleStartRetake(log)}
                    className="print-action-btn w-full md:w-auto"
                    style={{ fontSize: '0.75rem', padding: '10px 20px', borderRadius: '12px' }}
                  >
                    <Icons.RotateCw size={14} /> 다시 풀기 (Retake)
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      )}

      {/* 3. 다시 풀기 팝업/모달 레이어 */}
      {retakeQuiz && activeQuiz ? (
        <div className="modal-backdrop">
          <div className="modal-content-card fade-in">
            
            {/* 닫기 단추 */}
            <button
              onClick={() => setRetakeQuiz(null)}
              className="modal-close-btn"
            >
              <Icons.X size={20} />
            </button>

            {/* 헤더 */}
            <div className="mb-4">
              <span className="welcome-badge bg-teal-badge mb-2">
                ✍️ 오답 재훈련 코스
              </span>
              <h3 className="text-sm text-slate-400 font-bold" style={{ margin: 0 }}>{getModuleName(activeQuiz.moduleId)}</h3>
            </div>

            {/* 문제 발문 */}
            <h4 className="text-xs md:text-sm font-black text-slate-800 mb-6 leading-relaxed" style={{ margin: '12px 0 24px 0' }}>
              Q. {activeQuiz.question}
            </h4>

            {/* 보기 */}
            <div className="grid gap-3 mb-6">
              {activeQuiz.options && Array.isArray(activeQuiz.options) ? activeQuiz.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let btnClass = '';

                if (isAnswered) {
                  if (idx === activeQuiz.correctAnswer) {
                    btnClass = 'correct';
                  } else if (isSelected) {
                    btnClass = 'incorrect';
                  } else {
                    btnClass = 'disabled-fade';
                  }
                } else if (isSelected) {
                  btnClass = 'selected';
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleOptionSelect(idx)}
                    className={`option-btn ${btnClass}`}
                    style={{ padding: '12px' }}
                  >
                    <div className="option-number-badge" style={{ width: '18px', height: '18px', fontSize: '9px' }}>
                      {idx + 1}
                    </div>
                    <span className="flex-1 leading-relaxed">{option}</span>
                  </button>
                );
              }) : null}
            </div>

            {/* 채점 결과 피드백 및 해설 */}
            {isAnswered ? (
              <div className="feedback-panel mb-6 fade-in text-xs" style={{ padding: '16px' }}>
                <div className="flex items-center gap-2 mb-2">
                  {selectedOption === activeQuiz.correctAnswer ? (
                    <span className="card-badge-completed">
                      ✓ 훌륭합니다! 정답입니다.
                    </span>
                  ) : (
                    <span className="card-badge-score score-fail">
                      ✗ 아쉽게도 또 틀렸습니다. 다시 복습해 보죠.
                    </span>
                  )}
                </div>
                <h5 className="font-bold text-slate-800 mb-0-5" style={{ margin: 0 }}>해설 및 근거</h5>
                <p className="text-slate-600 leading-relaxed" style={{ margin: 0 }}>{activeQuiz.explanation}</p>
              </div>
            ) : null}

            {/* 하단 제어 */}
            <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--slate-100)', minHeight: '44px' }}>
              {isAnswered && (
                <button
                  onClick={handleCloseRetake}
                  className="print-action-btn"
                  style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '8px', backgroundColor: 'var(--blue-600)' }}
                >
                  {selectedOption === activeQuiz.correctAnswer 
                    ? '정답 확인 & 오답노트에서 제외하기' 
                    : '이해했습니다 (창 닫기)'}
                </button>
              )}
            </div>

          </div>
        </div>
      ) : null}

    </div>
  );
};
