import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  ArrowRight, Award, BookOpen, CheckCircle2, Clock, Home,
  Lightbulb, Loader2, Minus, RotateCcw, Target, XCircle
} from 'lucide-react';
import { useQuizResultsData } from '../hooks/useQuizResultsData';
import { AnswerDetails } from '../components/AnswerDetails';
import { ReviewFilter, ReviewStatus } from '../types/attempt';

export function QuizResults() {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attemptId = searchParams.get('attemptId');

  const { loading, questions, summary, results } = useQuizResultsData(quizId, attemptId);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const confettiTriggered = useRef(false);

  useEffect(() => {
    if (!loading && (!results || !summary)) navigate('/');
  }, [loading, results, summary, navigate]);

  useEffect(() => {
    if (!results || confettiTriggered.current) return;
    if (results.isPassed) {
      confettiTriggered.current = true;
      confetti({ particleCount: 90, spread: 68, origin: { y: 0.55 }, colors: ['#1e40af', '#10b981', '#fbbf24'] });
    }
  }, [results]);

  const reviewItems = useMemo(() => {
    if (!questions.length || !summary) return [];
    return questions.map((question, index) => {
      const answerEntry = summary.questionAnswers?.find((qa) => qa.questionId === question.id);
      const isUnanswered = answerEntry?.userAnswer === undefined || answerEntry?.userAnswer === null;
      const status: ReviewStatus = isUnanswered ? 'unanswered' : answerEntry?.isCorrect ? 'correct' : 'incorrect';
      return { question, index, userAnswer: answerEntry?.userAnswer, status };
    });
  }, [questions, summary]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-[#1e40af]" />
        <p className="mt-4 text-lg font-semibold text-slate-800">Compiling Scorecards & Performance Analytics...</p>
      </div>
    );
  }

  if (!results || !summary) return null;

  const passed = results.isPassed;
  const passingScore = summary.passingPercentage ?? 70;
  const filteredReview = reviewFilter === 'all' ? reviewItems : reviewItems.filter((i) => i.status === reviewFilter);
  const counts = {
    all: reviewItems.length,
    correct: reviewItems.filter((i) => i.status === 'correct').length,
    incorrect: reviewItems.filter((i) => i.status === 'incorrect').length,
    unanswered: reviewItems.filter((i) => i.status === 'unanswered').length,
  };

   const statusMeta = {
                correct: {
                  badgeClass: "bg-emerald-50 text-emerald-700"
                },
                incorrect: {
                  badgeClass: "bg-red-50 text-red-700"
                },
                unanswered: {
                  badgeClass: "bg-slate-100 text-slate-600"
                },
              }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Header */}
      <section className={`border-b ${passed ? 'border-emerald-100 bg-[#f0faf7]' : 'border-red-100 bg-[#fff5f5]'}`}>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <div className={`mb-5 inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-xs font-bold ${passed ? 'border-emerald-200 text-emerald-700' : 'border-red-200 text-red-700'}`}>
                {passed ? <Award className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                {passed ? 'Certification benchmark reached' : `${Math.max(0, passingScore - results.passedScore)}% from benchmark`}
              </div>

              {/* Directly rendered string from backend */}
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{summary.quizCategory}</p>
              
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {passed ? 'You passed with confidence.' : 'A strong attempt. Keep building.'}
              </h1>
              
              <p className="mt-4 max-w-2xl text-slate-600">
                Your result for <span className="font-semibold text-slate-900">{summary.quizName}</span> is ready.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to={`/quiz/${quizId}/instructions?mode=${results.mode}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1e40af] px-5 text-sm font-bold text-white hover:bg-[#17358f]">
                  <RotateCcw className="h-4 w-4" /> Retake quiz
                </Link>
                {/* Category URL parameter formatted to lowercase */}
                <Link to={`/category/${summary.quizCategory.toLowerCase()}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:text-[#1e40af]">
                  Explore {summary.quizCategory} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Score Radial */}
            <div className="flex items-center gap-6 rounded-3xl border border-white/80 bg-white p-6 shadow-sm">
              <div
                className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-2.5"
                style={{ background: `conic-gradient(${passed ? '#10b981' : '#dc2626'} 0 ${results.passedScore}%, #e2e8f0 ${results.passedScore}% 100%)` }}
              >
                <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-4xl font-bold text-slate-950">{results.passedScore}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-bold ${passed ? 'text-emerald-700' : 'text-red-700'}`}>
                  {passed ? 'Passed' : 'Needs Practice'}
                </p>
                <p className="mt-1 text-sm text-slate-500">Benchmark: <span className="font-bold text-slate-800">{passingScore}%</span></p>
                <p className="text-sm text-slate-500">Points: <span className="font-bold text-slate-800">{results.score} pts</span></p>
                <p className="text-sm text-slate-500">Time: <span className="font-bold text-slate-800">{results.timeTaken}</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold text-slate-950">Detailed Review</h2>
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'correct', 'incorrect', 'unanswered'] as ReviewFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setReviewFilter(filter)}
                className={`rounded-full px-4 py-2 text-xs font-bold capitalize transition-all ${
                  reviewFilter === filter ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:text-[#1e40af]'
                }`}
              >
                {filter} · {counts[filter]}
              </button>
            ))}
          </div>
        </div>

        {/* Question Cards */}
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
                <article key={question.id} className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                  <div className={`absolute bottom-0 left-0 top-0 w-1 ${statusMeta.line}`} />
                  <div className="p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${statusMeta.iconClass}`}>
                        <StatusIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">Question {index + 1}</span>
                          {/* <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
                          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#1e40af]">{question.questionType.replace(/_/g, ' ')}</span> */}
                        </div>
                        <h3 className="mt-3 text-lg font-bold leading-7 text-slate-950 sm:text-xl">{question.questionText}</h3>
                      </div>
                    </div>

                    <div className="mt-6 sm:ml-14">
                      <AnswerDetails question={question} userAnswer={userAnswer} />
                      <div className="mt-4 rounded-xl border border-blue-100 bg-[#f3f7ff] p-4">
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#1e40af] shadow-sm">
                            <Lightbulb className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#1e40af]">Why this is correct</p>
                            <p className="mt-2 text-sm leading-6 text-slate-700">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
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
      </div>

      <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-4 rounded-2xl bg-[#0d245c] p-5 text-white sm:flex-row sm:p-6">
          <div>
            <p className="font-bold">Ready for your next step?</p>
            <p className="mt-1 text-sm text-blue-200">Retake this set or continue building your certification path.</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link to="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-bold hover:bg-white/10">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link to={`/quiz/${quizId}/instructions?mode=${results.mode}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#1e40af] hover:bg-blue-50">
              <RotateCcw className="h-4 w-4" />
              Retake quiz
            </Link>
          </div>
        </div>
    </div>
  );
}