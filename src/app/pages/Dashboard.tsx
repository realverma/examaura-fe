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
  CheckCircle2,
  LogIn,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';

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
      {/* <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e40af] via-blue-700 to-indigo-800 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 mb-12 text-white shadow-xl">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-indigo-300/20 blur-2xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm font-medium text-blue-50">
            Free certification practice exams
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Get ready for your next certification
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
            Build confidence with practice exams for AWS, Azure, and more. Learn at your own pace and take your next step toward certification—for free.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/quizzes">
              <Button className="w-full gap-2 bg-white text-[#1e40af] hover:bg-blue-50 sm:w-auto">
                Explore practice exams
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-blue-100 sm:ml-2">
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">AWS</span>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">Microsoft Azure</span>
              <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5">And more</span>
            </div>
          </div>
        </div>
      </section> */}


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

          <div className="relative flex items-center justify-center bg-[#173a91] px-6 py-10 sm:px-12 lg:px-10">
            <div className="relative w-full max-w-md">
              <div className="absolute -left-5 top-10 hidden h-24 w-1 rounded-full bg-[#10b981] lg:block" />
              <div className="rounded-[1.5rem] border border-white/15 bg-[#f8fafc] p-3 text-slate-900 shadow-[0_30px_70px_-24px_rgba(2,6,23,0.65)]">
                <div className="rounded-[1.15rem] bg-white p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-[#1e40af]">
                        <Target className="h-4 w-4" />
                        Today&apos;s plan
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                        Azure Fundamentals
                      </h2>
                    </div>
                    <div className="rounded-xl bg-blue-50 p-2.5 text-[#1e40af]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Weekly readiness</span>
                      <span className="text-[#059669]">72%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-[72%] rounded-full bg-[#10b981]" />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <BookOpenCheck className="mb-3 h-5 w-5 text-[#1e40af]" />
                      <p className="text-lg font-bold text-slate-950">24</p>
                      <p className="mt-0.5 text-xs text-slate-500">Questions today</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <Trophy className="mb-3 h-5 w-5 text-amber-500" />
                      <p className="text-lg font-bold text-slate-950">8 day</p>
                      <p className="mt-0.5 text-xs text-slate-500">Study streak</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-[#102b78] p-4 text-white">
                    <div>
                      <p className="text-sm font-semibold">Practice set 04</p>
                      <p className="mt-1 text-xs text-blue-200">15 questions · 18 min</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10b981] shadow-lg shadow-emerald-950/20">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
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

      {/* Featured Quizzes */}
      {displayFeatured.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Featured Quizzes
            </h2>

            <Link to="/quizzes">
              <Button variant="outline" className="gap-2">
                View All Quizzes
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayFeatured.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>
      )}

      {/* Azure */}
      {azureQuizzes.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Latest in Azure
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {azureQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>
      )}

      {/* AWS */}
      {awsQuizzes.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              Latest in AWS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awsQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}