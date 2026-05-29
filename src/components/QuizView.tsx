import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import type { StudyModule, WrongQuizLog } from '../types';

interface QuizViewProps {
  module: StudyModule;
  onBackToStudy: () => void;
  onQuizFinished: (score: number, wrongQuizzes: Omit<WrongQuizLog, 'solvedAt'>[]) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  module,
  onBackToStudy,
  onQuizFinished,
}) => {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongLogs, setWrongLogs] = useState<Omit<WrongQuizLog, 'solvedAt'>[]>([]);

  const quizList = module.quizzes;
  const currentQuiz = quizList[currentQuizIndex];

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === currentQuiz.answer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    } else {
      // 오답 목록에 보관
      const newWrongLog: Omit<WrongQuizLog, 'solvedAt'> = {
        moduleId: module.id,
        quizId: currentQuiz.id,
        question: currentQuiz.question,
        options: currentQuiz.options,
        selectedAnswer: optionIdx,
        correctAnswer: currentQuiz.answer,
        explanation: currentQuiz.explanation
      };
      setWrongLogs(prev => [...prev, newWrongLog]);
    }
  };

  const handleNext = () => {
    const nextIdx = currentQuizIndex + 1;
    if (nextIdx < quizList.length) {
      setCurrentQuizIndex(nextIdx);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // 퀴즈 종료 처리
      const finalScorePercent = Math.round((score / quizList.length) * 100);
      onQuizFinished(finalScorePercent, wrongLogs);
    }
  };

  if (!currentQuiz) {
    return (
      <div className="max-w-md text-center py-16 no-print">
        <Icons.AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">등록된 퀴즈가 없습니다.</h3>
        <button onClick={onBackToStudy} className="mt-4 print-action-btn" style={{ margin: '16px auto 0 auto' }}>
          돌아가기
        </button>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuiz.answer;

  return (
    <div className="max-w-2xl px-4 fade-in pb-16 no-print">
      
      {/* 1. 상단 타이틀 */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBackToStudy}
          className="flex items-center gap-1-5 text-slate-500 hover:text-slate-800 font-bold text-xs"
          style={{ padding: 0 }}
        >
          <Icons.ChevronLeft size={16} /> 퀴즈 중단하고 학습으로
        </button>
        <span className="text-xs font-bold text-slate-400">
          문항 {currentQuizIndex + 1} / {quizList.length}
        </span>
      </div>

      {/* 2. 퀴즈 박스 */}
      <div className="quiz-container-box">
        
        {/* 과목 표시 */}
        <span className="welcome-badge bg-blue-badge mb-4">
          🩺 간호 실무 적용형 문제
        </span>

        {/* 질문 텍스트 */}
        <h3 className="text-base md:text-lg font-black text-slate-800 mb-6 leading-relaxed" style={{ margin: '12px 0 24px 0' }}>
          {currentQuiz.question}
        </h3>

        {/* 사지선다 보기 */}
        <div className="grid gap-3 mb-6">
          {currentQuiz.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            let btnClass = '';

            if (isAnswered) {
              if (idx === currentQuiz.answer) {
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
              >
                <div className="option-number-badge">
                  {idx + 1}
                </div>
                <span className="flex-1 leading-relaxed">{option}</span>
              </button>
            );
          })}
        </div>

        {/* 채점 및 해설 제출 영역 */}
        {isAnswered ? (
          <div className="feedback-panel mb-6 fade-in">
            
            {/* 정답 여부 뱃지 */}
            <div className="flex items-center gap-2 mb-3">
              {isCorrect ? (
                <span className="card-badge-completed" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  <Icons.CheckCircle size={12} /> 정답입니다!
                </span>
              ) : (
                <span className="card-badge-score score-fail" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>
                  <Icons.XCircle size={12} /> 오답입니다
                </span>
              )}
            </div>

            {/* 해설 텍스트 */}
            <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1" style={{ margin: 0 }}>
              <Icons.BookOpen size={14} className="text-teal-600" />
              피드백 및 해설
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed" style={{ margin: '4px 0 0 0' }}>
              {currentQuiz.explanation}
            </p>

          </div>
        ) : null}

        {/* 동작 버튼 */}
        <div className="flex justify-end pt-4" style={{ borderTop: '1px solid var(--slate-100)', minHeight: '60px' }}>
          {isAnswered && (
            <button
              onClick={handleNext}
              className="print-action-btn"
              style={{ backgroundColor: 'var(--blue-600)' }}
            >
              {currentQuizIndex + 1 < quizList.length ? (
                <>
                  다음 문제 풀기 <Icons.ChevronRight size={18} />
                </>
              ) : (
                <>
                  퀴즈 완료 및 채점 <Icons.Award size={18} />
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
