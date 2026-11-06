export type QuestionType =
  | 'OBJECTIVE'
  | 'MULTIPLE_CHOICE'
  | 'YES_NO_GRID'
  | 'DRAG_CLASSIFY'
  | 'MATCHING_DROPDOWN'
  | 'DRAG_MATCH'
  | 'INLINE_DROPDOWN';

export interface QuestionDetail {
  id: string;
  questionType: QuestionType;
  questionText: string;
  explanation: string;
  position: number;
  options?: string[];
  correctAnswer?: {
    answer?: number;
    answers?: number[];
  };
  categories?: Array<{ id: string; name: string }>;
  classifyItems?: Array<{ id: string; text: string; correctCategoryId: string }>;
  dropdownRows?: Array<{ id: string; label: string; options: string[]; correctAnswer: number }>;
  matchPairs?: Array<{ id: string; term: string; definition: string; correctAnswer: any }>;
  inlineDropdowns?: Array<{ id: string; options: string[]; correctAnswer: number }>;
  sentenceTemplate?: string;
  statements?: Array<{ id: string; text: string; correctAnswer: string }>;
}

export interface QuestionAnswer {
  questionId: string;
  userAnswer: any;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface AttemptSummary {
  id: string;
  quizId: string;
  userId: string;
  mode: string;
  score: number;
  passedScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTakenSeconds: number;
  isPassed: boolean;
  quizName: string;       // 👈 Added from your backend
  quizCategory: string;   // 👈 Added from your backend
  passingPercentage?: number;
  durationMinutes?: number;
  questionAnswers: QuestionAnswer[];
}

export interface FormattedResult {
  score: number;
  passedScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: string;
  mode: string;
  isPassed: boolean;
}

export type ReviewStatus = 'correct' | 'incorrect' | 'unanswered';
export type ReviewFilter = 'all' | ReviewStatus;