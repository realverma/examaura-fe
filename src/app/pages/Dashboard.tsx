import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { QuizCard } from '../components/QuizCard';
import { useUser } from '../context/UserContext';
import api from '../api/axiosConfig';
import type { Quiz } from '../types/quiz';
import {
  ArrowRight,
  BookOpenCheck,
  BookOpen,
  Clock,
  Cloud,
  CheckCircle2,
  LogIn,
  Gauge,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

const difficultyStyles: Record<string, string> = {
  beginner: "bg-emerald-50 text-emerald-700",
  intermediate: "bg-amber-50 text-amber-700",
  advanced: "bg-red-50 text-red-700",
};

function FeaturedLeadCard({ quiz }: { quiz: Quiz }) {
  return (
    <Link
      to={`/quiz/${quiz.id}/instructions`}
      className="group relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[1.75rem] bg-[#102b78] p-7 text-white shadow-[0_24px_50px_-32px_rgba(15,39,110,0.9)] transition-transform duration-300 hover:-translate-y-1 sm:p-9"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border-[42px] border-white/[0.05]" />
      <div className="relative">
        <div className="mb-8 flex items-center justify-between">
          <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-100">
            Editor&apos;s pick
          </span>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10b981] transition-transform group-hover:rotate-[-8deg] group-hover:scale-105">
            <ArrowRight className="h-5 w-5" />
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">
          {quiz.category?.name}
        </p>
        <h3 className="mt-3 max-w-md text-3xl font-bold leading-tight tracking-[-0.035em] sm:text-4xl">
          {quiz.title}
        </h3>
        <p className="mt-4 max-w-md text-sm leading-6 text-blue-100/70">
          {quiz.description || "Build exam confidence with a focused set of realistic certification questions."}
        </p>
      </div>
      <div className="relative mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-xs font-semibold text-blue-100">
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" />{quiz.totalQuestions} questions</span>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{quiz.durationMinutes} minutes</span>
        <span className="capitalize text-emerald-300">{quiz.difficulty}</span>
      </div>
    </Link>
  );
}

function FeaturedMiniCard({ quiz, index }: { quiz: Quiz; index: number }) {
  const number = String(index + 1).padStart(2, "0");
  return (
    <Link
      to={`/quiz/${quiz.id}/instructions`}
      className="group flex min-h-40 flex-col justify-between rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.5)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_38px_-24px_rgba(30,64,175,0.35)] sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-xs font-bold tracking-[0.16em] text-slate-300">{number}</span>
        <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e40af]" />
      </div>
      <div className="mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#1e40af]">{quiz.category?.name}</p>
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug tracking-tight text-slate-900 group-hover:text-[#1e40af]">
          {quiz.title}
        </h3>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>{quiz.totalQuestions} questions · {quiz.durationMinutes} min</span>
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize ${difficultyStyles[quiz.difficulty]}`}>
            {quiz.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}


function CloudTrackSection({
  title,
  subtitle,
  quizzes,
  href,
  provider,
}: {
  title: string;
  subtitle: string;
  quizzes: Quiz[];
  href: string;
  provider: "azure" | "aws";
}) {
  const isAzure = provider === "azure";

  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white">
      <div className={`relative overflow-hidden px-6 py-7 sm:px-8 ${isAzure ? "bg-[#edf6ff]" : "bg-[#fff7e8]"}`}>
        <div className={`absolute right-0 top-0 h-full w-1.5 ${isAzure ? "bg-[#0078d4]" : "bg-[#ff9900]"}`} />
        <div className="flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Cloud className={`h-4 w-4 ${isAzure ? "text-[#0078d4]" : "text-[#c76f00]"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${isAzure ? "text-[#0078d4]" : "text-[#9a5600]"}`}>
                {provider} learning track
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.025em] text-slate-950">{title}</h2>
            <p className="mt-2 max-w-md text-sm text-slate-600">{subtitle}</p>
          </div>
          <Link
            to={href}
            aria-label={`View all ${provider} quizzes`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white text-slate-700 transition-all hover:scale-105 hover:text-[#1e40af]"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="divide-y divide-slate-100 px-6 sm:px-8">
        {quizzes.map((quiz, index) => (
          <Link
            key={quiz.id}
            to={`/quiz/${quiz.id}/instructions`}
            className="group flex items-center gap-4 py-5"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${isAzure ? "bg-blue-50 text-[#0078d4]" : "bg-orange-50 text-[#b96300]"}`}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-900 transition-colors group-hover:text-[#1e40af]">{quiz.title}</h3>
              <p className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span>{quiz.totalQuestions} questions</span>
                <span>{quiz.durationMinutes} min</span>
                <span className="capitalize">{quiz.difficulty}</span>
              </p>
            </div>
            <Play className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-[#1e40af]" />
          </Link>
        ))}
        {quizzes.length === 0 && (
          <p className="py-8 text-sm text-slate-500">New quizzes are being prepared for this track.</p>
        )}
      </div>
    </section>
  );
}



export function Dashboard() {
  const { isLoggedIn } = useUser();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);


  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get(
          '/quizzes?page=0&size=20&sort=createdAt&order=ASC'
        );

        const quizList = response.data.data ?? [];

        setQuizzes(Array.isArray(quizList) ? quizList : []);
      } catch (err) {
        console.error('Failed to load quizzes', err);
        setError('Failed to load quizzes from the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        const categoryList = response.data ?? [];
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    fetchCategories();
  }, []);


  const featuredQuizzes = quizzes
    .filter((quiz) => quiz.isFeatured)
    .slice(0, 6);

  const displayFeatured =
    featuredQuizzes.length > 0
      ? featuredQuizzes
      : quizzes.slice(0, 6);

  const azureQuizzes = quizzes
    .filter((quiz) =>
      quiz.category?.name?.toLowerCase().includes('azure')
    )
    .slice(0, 3);

  const awsQuizzes = quizzes
    .filter((quiz) =>
      quiz.category?.name?.toLowerCase().includes('aws')
    )
    .slice(0, 3);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e40af]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="relative mb-14 overflow-hidden rounded-[2rem] bg-[#102b78] text-white shadow-[0_28px_70px_-34px_rgba(30,64,175,0.75)]">
        <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[56px] border-white/[0.05]" />
        <div className="pointer-events-none absolute -bottom-36 left-[42%] h-72 w-72 rounded-full border-[44px] border-[#10b981]/10" />

        <div className="relative grid min-h-[520px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
            <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-50 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              "Built for your next certification"
            </div>

            <h1 className="max-w-2xl text-[2.65rem] font-bold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[3.2rem]">
              Learn the concepts.
              <span className="mt-1 block text-[#6ee7b7]">Pass with confidence.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-blue-100/80 sm:text-lg">
              Exam-realistic quizzes when you&apos;re ready to perform. Guided practice with instant explanations when you&apos;re ready to grow.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/quizzes"
                className="group inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#16388f] shadow-lg shadow-blue-950/20 transition-all hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                Explore all quizzes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/category/azure"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.07] px-6 text-sm font-semibold text-white transition-all hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play className="h-4 w-4 fill-current" />
                Start a practice session
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-blue-100/70">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                7 question formats
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Detailed explanations
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Real exam timing
              </span>
            </div>
          </div>

          <div className="relative flex items-center justify-center bg-[#0d245c] px-6 py-10 sm:px-12 lg:px-10">
            <div className="relative w-full max-w-md">
              <div className="mb-6 flex items-center justify-between text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">Readiness snapshot</p>
                  <h2 className="mt-2 text-xl font-bold">Azure Fundamentals</h2>
                </div>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="h-5 w-5 text-blue-100" />
                </span>
              </div>

              <div className="rounded-[1.6rem] bg-white p-5 shadow-[0_28px_60px_-30px_rgba(0,0,0,0.75)] sm:p-6">
                <div className="flex items-center gap-5 border-b border-slate-100 pb-6">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#10b981_0_72%,#dbeafe_72%_100%)] p-2">
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-2xl font-bold tracking-tight text-slate-950">72%</span>
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">ready</span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#10b981]" />
                      <span className="text-xs font-bold text-emerald-700">On track</span>
                    </div>
                    <p className="text-sm font-bold leading-5 text-slate-900">One more focused session could move you into exam range.</p>
                    <p className="mt-2 text-xs text-slate-500">Strongest topic: Cloud concepts</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link
                    to="/category/azure"
                    className="group rounded-2xl bg-[#eef4ff] p-4 transition-colors hover:bg-[#e3ecff]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1e40af] text-white">
                        <BookOpenCheck className="h-4 w-4" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-blue-300 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="mt-4 text-sm font-bold text-slate-900">Practice mode</p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-500">Hints and instant explanations</p>
                  </Link>

                  <Link
                    to="/quizzes"
                    className="group rounded-2xl bg-slate-950 p-4 text-white transition-colors hover:bg-[#1e40af]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                        <Target className="h-4 w-4" />
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-all group-hover:translate-x-1 group-hover:text-white" />
                    </div>
                    <p className="mt-4 text-sm font-bold">Real exam mode</p>
                    <p className="mt-1 text-[11px] leading-4 text-slate-400 group-hover:text-blue-100">Timed, focused and distraction-free</p>
                  </Link>
                </div>
              </div>
              
              <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3 text-slate-900 shadow-xl sm:-left-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                  <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                </span>
                <div>
                  <p className="text-xs font-bold">Answer mastered</p>
                  <p className="text-[11px] text-slate-500">Explanation saved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {!isLoggedIn && (
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#1e40af]/20 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-800">
              Track your progress
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Sign in to save your attempt history and scores
            </p>
          </div>

          <Button
            variant="outline"
            className="border-[#1e40af] text-[#1e40af] gap-2"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('open-signin')
              );
            }}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </div>
      )}

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">
          Certification Paths
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.id}`}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-border rounded-xl h-full">
                <div className="text-4xl mb-3">
                  <img src={category.icon} alt={category.name} width="64" height="64" />
                </div>

                <h3 className="font-semibold text-lg mb-2">
                  {category.name}
                </h3>

                <p className="text-sm text-slate-600">
                  {category.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      
      {/* Featured Quizzes Section */}
      {displayFeatured.length > 0 && (
        <section className="mb-16 rounded-[2rem] bg-slate-50 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e40af]">
                <Gauge className="h-4 w-4" />
                Recommended for you
              </div>
              <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">Featured quizzes</h2>
              <p className="mt-2 text-sm text-slate-500">High-impact practice sets across today&apos;s most valuable certifications.</p>
            </div>
            <Link
              to="/quizzes"
              className="group flex w-fit items-center gap-2 text-sm font-bold text-[#1e40af]"
            >
              Browse the full library
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-5 sm:grid-cols-2">
              {displayFeatured.slice(1, 5).map((quiz, index) => (
                <FeaturedMiniCard key={quiz.id} quiz={quiz} index={index + 1} />
              ))}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {displayFeatured.slice(4, 7).map((quiz, index) => (
                <FeaturedMiniCard key={quiz.id} quiz={quiz} index={index + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest cloud tracks */}
      <div className="mb-4">
        <div className="mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e40af]">Keep exploring</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-slate-950">Latest cloud practice</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <CloudTrackSection
            title="Latest in Azure"
            subtitle="Build fluency across cloud concepts, governance, pricing, and core Azure services."
            quizzes={azureQuizzes}
            href="/category/azure"
            provider="azure"
          />
          <CloudTrackSection
            title="Latest in AWS"
            subtitle="Sharpen your understanding of AWS services, security, architecture, and cloud economics."
            quizzes={awsQuizzes}
            href="/category/aws"
            provider="aws"
          />
        </div>
      </div>
    </div>
  );
}