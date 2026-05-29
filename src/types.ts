export interface Quiz {
  id: string;
  question: string;
  options: string[];
  answer: number; // 0-indexed index of options
  explanation: string;
}

export interface StudyModule {
  id: string;
  title: string;
  category: 'workspace' | 'sheets';
  description: string;
  iconName: string; // Lucide icon name mapping
  scenario: string; // Nursing practice scenario
  content: string; // Rich markdown-like detailed guide
  steps: string[]; // Detailed action steps for students
  quizzes: Quiz[];
}

export interface WrongQuizLog {
  moduleId: string;
  quizId: string;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  explanation: string;
  solvedAt: string;
}

export interface UserProgress {
  userName: string;
  completedModules: string[]; // List of completed module IDs
  quizScores: Record<string, number>; // Module ID -> score (%)
  wrongQuizzes: WrongQuizLog[]; // List of logged incorrect answers
  certifiedAt: string | null;
}
