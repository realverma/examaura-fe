import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Home,
  Lightbulb,
  Loader2,
  Minus,
  RotateCcw,
  Target,
  X,
  XCircle,
} from "lucide-react";
import api from "../api/axiosConfig";
import { formatDuration } from "../components/ui/utils";

export interface Question {
  id: string | number;
  text: string;
  questionText?: string;
  type:
    | "objective"
    | "multiple-choice"
    | "yes-no-grid"
    | "drag-match"
    | "drag-classify"
    | "inline-dropdown"
    | "matching-dropdown"
    | string;
  explanation?: string;
  questionImage?: string;
  options?: string[];
  correctAnswer?: any;
  statements?: Array<{ id: string | number; text: string; correctAnswer: string }>;
  matchPairs?: Array<{ id: string; definition: string; term: string }>;
  categories?: Array<{ id: string; name: string }>;
  classifyItems?: Array<{ id: string; text: string; correctCategoryId: string }>;
  dropdownRows?: Array<{ id: string | number; label: string; options: string[]; correctAnswer: number }>;
  inlineDropdowns?: Array<{ options: string[]; correctAnswer: number }>;
}

interface QuizData {
  id: string;
  title: string;
  category: string | { id: string | number; name: string; slug?: string };
  passingScore?: number;
  duration?: number;
  durationMinutes?: number;
  questions: Question[];
}

interface ResultsData {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: string;
  mode: string;
  answers: Record<number, any>;
}

type ReviewStatus = "correct" | "incorrect" | "unanswered";
type ReviewFilter = "all" | ReviewStatus;

// Helper to normalize correct answer indices for single/multiple choice
function parseCorrectAnswers(question: Question): number[] {
  if (question.correctAnswer === undefined || question.correctAnswer === null) return [];
  if (Array.isArray(question.correctAnswer)) return question.correctAnswer;
  if (typeof question.correctAnswer === "object") {
    if (Array.isArray(question.correctAnswer.answers)) return question.correctAnswer.answers;
    if (question.correctAnswer.answer !== undefined) return [question.correctAnswer.answer];
  }
  if (typeof question.correctAnswer === "number") return [question.correctAnswer];
  return [];
}

// Fallback client-side verification if server does not provide isCorrect flag
function isAnswerCorrect(question: Question, userAnswer: any): boolean {
  if (userAnswer === undefined || userAnswer === null) return false;

  switch (question.type) {
    case "objective": {
      const correctList = parseCorrectAnswers(question);
      return correctList.length > 0 && userAnswer === correctList[0];
    }
    case "multiple-choice": {
      const correctAnswers = parseCorrectAnswers(question);
      if (!Array.isArray(userAnswer)) return false;
      return (
        userAnswer.length === correctAnswers.length &&
        userAnswer.every((answer: number) => correctAnswers.includes(answer))
      );
    }
    case "yes-no-grid":
      return (
        question.statements?.every(
          (statement) =>
            userAnswer[statement.id]?.toString().toLowerCase() ===
            statement.correctAnswer?.toString().toLowerCase()
        ) || false
      );
    case "drag-match":
      return question.matchPairs?.every((pair) => userAnswer[pair.id] === pair.id) || false;
    case "drag-classify":
      return (
        question.classifyItems?.every((item) => {
          const category = Object.entries(userAnswer).find(([, items]) =>
            Array.isArray(items) && (items as string[]).includes(item.id)
          );
          return category?.[0] === item.correctCategoryId;
        }) || false
      );
    case "inline-dropdown":
      return (
        question.inlineDropdowns?.every(
          (dropdown, index) => userAnswer[index] === dropdown.correctAnswer
        ) || false
      );
    case "matching-dropdown":
      return (
        question.dropdownRows?.every(
          (row) => userAnswer[row.id] === row.correctAnswer
        ) || false
      );
    default:
      return false;
  }
}

function getReviewStatus(question: Question, userAnswer: any, backendIsCorrect?: boolean): ReviewStatus {
  if (userAnswer === undefined || userAnswer === null) return "unanswered";
  if (Array.isArray(userAnswer) && userAnswer.length === 0) return "unanswered";
  if (typeof userAnswer === "object" && Object.keys(userAnswer).length === 0) return "unanswered";

  if (typeof backendIsCorrect === "boolean") {
    return backendIsCorrect ? "correct" : "incorrect";
  }

  return isAnswerCorrect(question, userAnswer) ? "correct" : "incorrect";
}

function questionTypeLabel(type: Question["type"]) {
  const labels: Record<string, string> = {
    objective: "Single choice",
    "multiple-choice": "Multiple choice",
    "yes-no-grid": "Yes / No grid",
    "drag-match": "Matching",
    "drag-classify": "Classification",
    "inline-dropdown": "Inline dropdown",
    "matching-dropdown": "Dropdown matching",
  };
  return labels[type] || "Question";
}

function AnswerPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "correct" | "incorrect" | "neutral";
}) {
  const classes = {
    correct: "border-emerald-200 bg-emerald-50 text-emerald-800",
    incorrect: "border-red-200 bg-red-50 text-red-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${classes[tone]}`}>
      {children}
    </span>
  );
}

function AnswerDetails({ question, userAnswer }: { question: Question; userAnswer: any }) {
  if ((question.type === "objective" || question.type === "multiple-choice") && question.options) {
    const correctAnswers = parseCorrectAnswers(question);
    const userAnswers =
      userAnswer === undefined || userAnswer === null
        ? []
        : Array.isArray(userAnswer)
        ? userAnswer
        : [userAnswer];

    return (
      <div className="grid gap-2">
        {question.options.map((option, index) => {
          const isCorrect = correctAnswers.includes(index);
          const isSelected = userAnswers.includes(index);
          const tone = isCorrect ? "correct" : isSelected ? "incorrect" : "neutral";

          return (
            <div
              key={index}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                tone === "correct"
                  ? "border-emerald-200 bg-emerald-50/70"
                  : tone === "incorrect"
                  ? "border-red-200 bg-red-50/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                  isCorrect
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isSelected
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {isCorrect ? (
                  <Check className="h-3.5 w-3.5" />
                ) : isSelected ? (
                  <X className="h-3.5 w-3.5" />
                ) : (
                  String.fromCharCode(65 + index)
                )}
              </span>
              <span className={`flex-1 ${isCorrect || isSelected ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                {option}
              </span>
              {isCorrect && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Correct answer</span>
              )}
              {isSelected && !isCorrect && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-red-700">Your answer</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "yes-no-grid" && question.statements) {
    return (
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {question.statements.map((statement) => {
          const answer = userAnswer?.[statement.id];
          const correct =
            answer?.toString().toLowerCase() === statement.correctAnswer?.toString().toLowerCase();
          return (
            <div key={statement.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="text-slate-700">{statement.text}</span>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={answer === undefined ? "neutral" : correct ? "correct" : "incorrect"}>
                  Yours: {answer ? answer.toString().toUpperCase() : "Unanswered"}
                </AnswerPill>
                {!correct && (
                  <AnswerPill tone="correct">
                    Correct: {statement.correctAnswer ? statement.correctAnswer.toString().toUpperCase() : "—"}
                  </AnswerPill>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "drag-match" && question.matchPairs) {
    return (
      <div className="space-y-2">
        {question.matchPairs.map((pair) => {
          const selectedId = userAnswer?.[pair.id];
          const selected = question.matchPairs?.find((item) => item.id === selectedId)?.term;
          const correct = selectedId === pair.id;
          return (
            <div key={pair.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-[1fr_1fr]">
              <p className="text-slate-600">{pair.definition}</p>
              <div>
                <p className={`font-semibold ${correct ? "text-emerald-700" : "text-red-700"}`}>
                  {selected ?? "Not matched"}
                </p>
                {!correct && <p className="mt-1 text-xs font-semibold text-emerald-700">Correct: {pair.term}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "drag-classify" && question.classifyItems && question.categories) {
    return (
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {question.classifyItems.map((item) => {
          const selectedCategoryId = Object.entries(userAnswer ?? {}).find(([, items]) =>
            Array.isArray(items) && (items as string[]).includes(item.id)
          )?.[0];
          const selectedCategory = question.categories?.find((category) => category.id === selectedCategoryId)?.name;
          const correctCategory = question.categories?.find((category) => category.id === item.correctCategoryId)?.name;
          const correct = selectedCategoryId === item.correctCategoryId;

          return (
            <div key={item.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="font-medium text-slate-700">{item.text}</span>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={selectedCategoryId ? (correct ? "correct" : "incorrect") : "neutral"}>
                  Yours: {selectedCategory ?? "Unanswered"}
                </AnswerPill>
                {!correct && <AnswerPill tone="correct">Correct: {correctCategory}</AnswerPill>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "inline-dropdown" && question.inlineDropdowns) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {question.inlineDropdowns.map((dropdown, index) => {
          const selectedIndex = userAnswer?.[index];
          const correct = selectedIndex === dropdown.correctAnswer;
          return (
            <div key={index} className="rounded-xl border border-slate-200 bg-white p-4 text-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Blank {index + 1}</p>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={selectedIndex === undefined ? "neutral" : correct ? "correct" : "incorrect"}>
                  Yours: {selectedIndex === undefined ? "Unanswered" : dropdown.options[selectedIndex]}
                </AnswerPill>
                {!correct && (
                  <AnswerPill tone="correct">Correct: {dropdown.options[dropdown.correctAnswer]}</AnswerPill>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === "matching-dropdown" && question.dropdownRows) {
    return (
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {question.dropdownRows.map((row) => {
          const selectedIndex = userAnswer?.[row.id];
          const correct = selectedIndex === row.correctAnswer;
          return (
            <div key={row.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="font-medium text-slate-700">{row.label}</span>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={selectedIndex === undefined ? "neutral" : correct ? "correct" : "incorrect"}>
                  Yours: {selectedIndex === undefined ? "Unanswered" : row.options[selectedIndex]}
                </AnswerPill>
                {!correct && <AnswerPill tone="correct">Correct: {row.options[row.correctAnswer]}</AnswerPill>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

// Safely retrieves the category title/name to display in the UI
function getCategoryName(category: any): string {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || category.title || "";
}

// Safely retrieves the category slug or identifier for router links
function getCategoryId(category: any): string {
  if (!category) return "all";
  if (typeof category === "object") {
    return category.slug || category.id?.toString() || getCategoryId(category.name);
  }
  
  const value = String(category).toLowerCase();
  if (value.includes("azure")) return "azure";
  if (value.includes("aws")) return "aws";
  if (value.includes("salesforce")) return "salesforce";
  if (value.includes("mule")) return "mulesoft";
  if (value.includes("google") || value.includes("gcp")) return "gcp";
  if (value.includes("comptia")) return "comptia";
  return value;
}

export function QuizResults() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get("attemptId");

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");
  const confettiTriggered = useRef(false);

  // Fetch attempt results and quiz details from backend
  useEffect(() => {
    const fetchQuizResultsAndDetails = async () => {
      if (!attemptId || !quizId) {
        navigate("/");
        return;
      }

      try {
        // 1. Fetch attempt summary grading
        const summaryRes = await api.get(`/attempts/${attemptId}/summary`);
        const summary = summaryRes.data;
        setSummaryData(summary);

        // 2. Fetch quiz details and question set
        const quizRes = await api.get(`/quizzes/${quizId}`);
        const questionsRes = await api.get(`/quizzes/${quizId}/questions?size=100`);
        const rawQuestions = questionsRes.data.content || questionsRes.data.data || questionsRes.data || [];

        // Data adapter to normalize backend question formats and parse serialized JSON
        const parseJSON = (val: any) => {
          if (typeof val === "string") {
            try {
              return JSON.parse(val);
            } catch {
              return null;
            }
          }
          return val;
        };

        const formattedQuestions: Question[] = rawQuestions.map((q: any) => {
          const rawType = q.questionType || q.type || "";
          const mappedType = rawType.toLowerCase().replace(/_/g, "-");

          const mappedQ: any = {
            ...q,
            id: q.id,
            text: q.questionText || q.text,
            type: mappedType,
            explanation: q.explanation,
            questionImage: q.questionImageUrl || q.questionImage,
            options: parseJSON(q.options),
            correctAnswer: parseJSON(q.correctAnswer),
          };

          if (mappedType === "yes-no-grid") {
            mappedQ.statements = parseJSON(q.matchPairs || q.statements);
          } else if (mappedType === "drag-match") {
            mappedQ.matchPairs = parseJSON(q.matchPairs);
          } else {
            mappedQ.statements = parseJSON(q.statements);
            mappedQ.matchPairs = parseJSON(q.matchPairs);
          }

          mappedQ.categories = parseJSON(q.categories);
          mappedQ.classifyItems = parseJSON(q.classifyItems);
          mappedQ.dropdownRows = parseJSON(q.dropdownRows);
          mappedQ.inlineDropdowns = parseJSON(q.inlineDropdowns);

          return mappedQ;
        });

        setQuiz({ ...quizRes.data, questions: formattedQuestions });

        // 3. Map backend answers to the question index map
        const answersMap: Record<number, any> = {};
        const backendAnswers = summary.questionAnswers || summary.submittedAnswers || [];

        formattedQuestions.forEach((question, index) => {
          const matchingAnswer = backendAnswers.find((a: any) => a.questionId === question.id);
          if (matchingAnswer) {
            let userAnsPayload = matchingAnswer.userAnswer;
            if (typeof userAnsPayload === "string") {
              try {
                userAnsPayload = JSON.parse(userAnsPayload);
              } catch {}
            }
            answersMap[index] = userAnsPayload;
          }
        });

        // 4. Calculate score percentages
        const percentageScore =
          summary.passedScore !== undefined
            ? summary.passedScore
            : summary.percentage !== undefined
            ? Math.round(summary.percentage)
            : summary.score !== undefined
            ? Math.round(summary.score)
            : 0;

        const durationStr =
          formatDuration(summary.timeTakenSeconds) ||
          formatDuration((quizRes.data.durationMinutes || quizRes.data.duration || 0) * 60) ||
          "0m";

        setResults({
          score: percentageScore,
          correctAnswers: summary.correctAnswers !== undefined ? summary.correctAnswers : summary.scoreCount || 0,
          totalQuestions: summary.totalQuestions || formattedQuestions.length,
          timeTaken: durationStr,
          mode: summary.mode?.toLowerCase() || "exam",
          answers: answersMap,
        });
      } catch (error) {
        console.error("Failed to load quiz results:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResultsAndDetails();
  }, [attemptId, quizId, navigate]);

  // Celebrate on passing score
  useEffect(() => {
    if (!results || !quiz || confettiTriggered.current) return;
    const passingScore = quiz.passingScore || 70;
    const passed = results.score >= passingScore;
    if (passed) {
      confettiTriggered.current = true;
      confetti({
        particleCount: 90,
        spread: 68,
        origin: { y: 0.55 },
        colors: ["#1e40af", "#10b981", "#fbbf24"],
      });
    }
  }, [quiz, results]);

  // Construct item reviews merging backend isCorrect feedback
  const reviewItems = useMemo(() => {
    if (!quiz || !results) return [];
    return quiz.questions.map((question, index) => {
      const userAnswer = results.answers[index];
      const answerSummary = summaryData?.questionAnswers?.find((qa: any) => qa.questionId === question.id);
      return {
        question,
        index,
        userAnswer,
        status: getReviewStatus(question, userAnswer, answerSummary?.isCorrect),
      };
    });
  }, [quiz, results, summaryData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#1e40af]" />
        <p className="mt-4 text-lg font-semibold text-slate-800">Compiling Scorecards & Performance Analytics...</p>
        <p className="text-sm text-slate-500">Fetching grading data from server</p>
      </div>
    );
  }

  if (!results || !quiz) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-950">Quiz results not found</h1>
        <p className="mt-2 text-sm text-slate-500">We couldn't retrieve the attempt grading summary.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1e40af] hover:underline">
          <Home className="h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  const passingScore = quiz.passingScore || 70;
  const passed = results.score >= passingScore;
  const unansweredCount = reviewItems.filter((i) => i.status === "unanswered").length;
  const incorrectCount = reviewItems.filter((i) => i.status === "incorrect").length;
  const correctCount = reviewItems.filter((i) => i.status === "correct").length;

  const filteredReview =
    reviewFilter === "all" ? reviewItems : reviewItems.filter((item) => item.status === reviewFilter);

  const filterCounts: Record<ReviewFilter, number> = {
    all: reviewItems.length,
    correct: correctCount,
    incorrect: incorrectCount,
    unanswered: unansweredCount,
  };

  const completionPercentage = Math.round(
    ((results.totalQuestions - unansweredCount) / (results.totalQuestions || 1)) * 100
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Banner with Radial Progress */}
      <section className={`border-b ${passed ? "border-emerald-100 bg-[#f0faf7]" : "border-red-100 bg-[#fff5f5]"}`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
            <div>
              <div
                className={`mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-xs font-bold ${
                  passed ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"
                }`}
              >
                {passed ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                {passed ? "Certification benchmark reached" : `${Math.max(0, passingScore - results.score)} points from the benchmark`}
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
  {getCategoryName(quiz.category)}
</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.03] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
                {passed ? "You passed with confidence." : "A strong attempt. Keep building."}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Your result for <span className="font-semibold text-slate-900">{quiz.title}</span> is ready. Review
                every answer below and turn missed questions into your next advantage.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={`/quiz/${quizId}/instructions?mode=${results.mode}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(30,64,175,0.8)] transition-all hover:-translate-y-0.5 hover:bg-[#17358f]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake this quiz
                </Link>
                <Link
                  to={`/category/${getCategoryId(quiz.category)}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:border-blue-200 hover:text-[#1e40af]"
                >
                  Explore more quizzes
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/80 bg-white p-5 shadow-[0_28px_65px_-38px_rgba(15,23,42,0.45)] sm:p-7">
              <div className="flex items-center gap-6">
                <div
                  className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2.5"
                  style={{
                    background: `conic-gradient(${passed ? "#10b981" : "#dc2626"} 0 ${results.score}%, #e2e8f0 ${results.score}% 100%)`,
                  }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-4xl font-bold tracking-[-0.04em] text-slate-950">{results.score}%</span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Final score
                    </span>
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-bold ${passed ? "text-emerald-700" : "text-red-700"}`}>
                    {passed ? "Passed" : "Not passed yet"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Passing score: <span className="font-bold text-slate-800">{passingScore}%</span>
                  </p>
                  <p className="text-sm leading-6 text-slate-500">
                    Mode: <span className="font-bold capitalize text-slate-800">{results.mode}</span>
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100 pt-6">
                <div className="pr-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{correctCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Correct</p>
                </div>
                <div className="px-3 text-center">
                  <p className="text-xl font-bold text-red-600">{incorrectCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Incorrect</p>
                </div>
                <div className="pl-3 text-center">
                  <p className="text-xl font-bold text-slate-700">{unansweredCount}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Skipped</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Analytics Cards */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="mb-12 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Accuracy</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{results.score}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {correctCount} of {results.totalQuestions} questions correct
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Time spent</span>
              <Clock className="h-4 w-4 text-[#1e40af]" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{results.timeTaken}</p>
            <p className="mt-1 text-xs text-slate-500">
              Quiz allowance was {quiz.durationMinutes || quiz.duration || 0} minutes
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Completion</span>
              <BookOpen className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">{completionPercentage}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {unansweredCount === 0
                ? "Every question answered"
                : `${unansweredCount} question${unansweredCount === 1 ? "" : "s"} skipped`}
            </p>
          </div>
        </section>

        {/* Detailed Question Review Section */}
        <section>
          <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e40af]">Detailed review</p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950">Learn from every answer</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your selections, the correct answers, and explanations are shown together.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "correct", label: "Correct" },
                  { value: "incorrect", label: "Needs review" },
                  { value: "unanswered", label: "Skipped" },
                ] as { value: ReviewFilter; label: string }[]
              ).map((filter) => (
                <button
                  type="button"
                  key={filter.value}
                  onClick={() => setReviewFilter(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    reviewFilter === filter.value
                      ? "bg-slate-950 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1e40af]"
                  }`}
                >
                  {filter.label} · {filterCounts[filter.value]}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={reviewFilter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className="space-y-4"
          >
            {filteredReview.map(({ question, index, userAnswer, status }) => {
              const statusMeta = {
                correct: {
                  label: "Correct",
                  icon: CheckCircle2,
                  iconClass: "bg-emerald-100 text-emerald-700",
                  badgeClass: "bg-emerald-50 text-emerald-700",
                  line: "bg-emerald-500",
                },
                incorrect: {
                  label: "Needs review",
                  icon: XCircle,
                  iconClass: "bg-red-100 text-red-700",
                  badgeClass: "bg-red-50 text-red-700",
                  line: "bg-red-500",
                },
                unanswered: {
                  label: "Skipped",
                  icon: Minus,
                  iconClass: "bg-slate-100 text-slate-600",
                  badgeClass: "bg-slate-100 text-slate-600",
                  line: "bg-slate-300",
                },
              }[status];

              const StatusIcon = statusMeta.icon;

              return (
                <article
                  key={question.id}
                  className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                >
                  <div className={`absolute bottom-0 left-0 top-0 w-1 ${statusMeta.line}`} />
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusMeta.iconClass}`}>
                        <StatusIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
                            Question {index + 1}
                          </span>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.badgeClass}`}>
                            {statusMeta.label}
                          </span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1e40af]">
                            {questionTypeLabel(question.type)}
                          </span>
                        </div>
                        <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950 sm:text-xl">
                          {question.questionText || question.text}
                        </h3>
                        {question.questionImage && (
                          <img
                            src={question.questionImage}
                            alt={`Question ${index + 1} illustration`}
                            className="mt-3 max-h-64 rounded-xl border border-slate-200 object-contain"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-14">
                      <AnswerDetails question={question} userAnswer={userAnswer} />

                      {question.explanation && (
                        <div className="mt-4 rounded-xl border border-blue-100 bg-[#f3f7ff] p-4">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e40af] shadow-sm">
                              <Lightbulb className="h-4 w-4" />
                            </span>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1e40af]">
                                Why this is correct
                              </p>
                              <p className="mt-2 text-sm leading-6 text-slate-700">{question.explanation}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {filteredReview.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white py-16 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <h3 className="mt-3 text-lg font-bold text-slate-950">Nothing to review here</h3>
                <p className="mt-1 text-sm text-slate-500">Choose another result filter to continue.</p>
              </div>
            )}
          </motion.div>
        </section>

        {/* Footer Navigation Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#0d245c] p-5 text-white sm:flex-row sm:p-6">
          <div>
            <p className="font-bold">Ready for your next step?</p>
            <p className="mt-1 text-sm text-blue-200">Retake this set or continue building your certification path.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              to="/"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold hover:bg-white/10"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to={`/quiz/${quizId}/instructions?mode=${results.mode}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1e40af] hover:bg-blue-50"
            >
              <RotateCcw className="h-4 w-4" />
              Retake quiz
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}