import { useParams, useNavigate, Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { categories } from '../data/mockData';
import {
  ArrowLeft,
  Trophy,
  Clock,
  LogIn,
  BookOpen,
  Target,
  TrendingUp,
  ChevronRight,
  BarChart3,
  CheckCircle2,
  XCircle,
  Play,
  Star,
} from 'lucide-react';
import { useQuizzes } from '../context/QuizContext';
import { useUser } from '../context/UserContext';
import { Quiz } from '../data/mockData';

const categoryMeta: Record<string, { gradient: string; lightBg: string; accent: string; tagline: string; logo: string }> = {
  azure: {
    gradient: 'from-[#0078D4] via-[#1a8cff] to-[#50b3ff]',
    lightBg: 'from-blue-50 to-sky-50',
    accent: '#0078D4',
    tagline: 'Master Microsoft Azure cloud fundamentals',
    logo: '☁️',
  },
  aws: {
    gradient: 'from-[#FF9900] via-[#FFB347] to-[#FFCC70]',
    lightBg: 'from-orange-50 to-amber-50',
    accent: '#FF9900',
    tagline: 'Ace the AWS Cloud Practitioner exam',
    logo: '🌩️',
  },
  salesforce: {
    gradient: 'from-[#00A1E0] via-[#00BFFF] to-[#66D9FF]',
    lightBg: 'from-cyan-50 to-sky-50',
    accent: '#00A1E0',
    tagline: 'Become a certified Salesforce Administrator',
    logo: '⚡',
  },
  mulesoft: {
    gradient: 'from-[#00A0DF] via-[#00BEFF] to-[#66D9FF]',
    lightBg: 'from-sky-50 to-cyan-50',
    accent: '#00A0DF',
    tagline: 'Earn your MuleSoft Developer certification',
    logo: '🔗',
  },
  gcp: {
    gradient: 'from-[#4285F4] via-[#5C9EFF] to-[#A0C4FF]',
    lightBg: 'from-blue-50 to-indigo-50',
    accent: '#4285F4',
    tagline: 'Lead with Google Cloud Digital expertise',
    logo: '🌐',
  },
  comptia: {
    gradient: 'from-[#E4022D] via-[#FF2D55] to-[#FF6B6B]',
    lightBg: 'from-red-50 to-rose-50',
    accent: '#E4022D',
    tagline: 'Build your CompTIA A+ foundation',
    logo: '💻',
  },
};

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  intermediate: { label: 'Intermediate', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  advanced: { label: 'Advanced', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
};

function ModernQuizCard({ quiz, accent }: { quiz: Quiz; accent: string }) {
  const diff = difficultyConfig[quiz.difficulty] ?? difficultyConfig.beginner;
  const passing = quiz.passingScore ?? 70;

  return (
    <Link to={`/quiz/${quiz.id}/instructions`} className="group block">
      <div className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: accent }} />

        <div className="pl-6 pr-5 py-5 flex flex-col gap-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 text-base leading-snug group-hover:text-[#1e40af] transition-colors line-clamp-2">
                {quiz.title}
              </h3>
              {quiz.description && (
                <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed">{quiz.description}</p>
              )}
            </div>
            <div
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: `${accent}15` }}
            >
              <Play className="w-4 h-4" style={{ color: accent }} />
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {quiz.questionCount} questions
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {quiz.duration} min
            </span>
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Pass: {passing}%
            </span>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${diff.bg} ${diff.color}`}>
              <Star className="w-3 h-3" />
              {diff.label}
            </span>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1 group-hover:text-slate-600 transition-colors">
              Start quiz <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { getQuizzesByCategory, userHistory } = useQuizzes();
  const { isLoggedIn } = useUser();

  const category = categories.find(c => c.id === categoryId);
  const meta = categoryId ? (categoryMeta[categoryId] ?? null) : null;
  const categoryQuizzes = categoryId ? getQuizzesByCategory(categoryId) : [];

  const categoryAttempts = userHistory
    .filter(h => h.category === categoryId || h.category.toLowerCase().includes(categoryId || ''))
    .slice(0, 5);

  const avgScore = categoryAttempts.length > 0
    ? Math.round(categoryAttempts.reduce((sum, a) => sum + a.score, 0) / categoryAttempts.length)
    : 0;

  const bestScore = categoryAttempts.length > 0
    ? Math.max(...categoryAttempts.map(a => a.score))
    : 0;

  const accent = meta?.accent ?? '#1e40af';

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Category not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Banner */}
      <div className={`relative bg-gradient-to-br ${meta?.gradient ?? 'from-[#1e40af] to-[#3b82f6]'} overflow-hidden`}>
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'white', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-2xl" style={{ background: 'white', transform: 'translate(-20%, 30%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-2 gap-1.5 h-8"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Button>
            <span>/</span>
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white font-medium">{category.name}</span>
          </div>

          {/* Category Identity */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-4xl shadow-lg flex-shrink-0">
              {meta?.logo ?? category.icon}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2 border border-white/30">
                <BookOpen className="w-3 h-3" />
                Certification Track
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{category.name}</h1>
              <p className="text-white/80 mt-1 text-base">{meta?.tagline ?? category.description}</p>
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-white/80" />
              <div>
                <p className="text-white/70 text-xs">Available tests</p>
                <p className="text-white font-bold text-lg leading-none mt-0.5">{categoryQuizzes.length}</p>
              </div>
            </div>
            {isLoggedIn && categoryAttempts.length > 0 && (
              <>
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-white/70 text-xs">Avg. score</p>
                    <p className="text-white font-bold text-lg leading-none mt-0.5">{avgScore}%</p>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-white/70 text-xs">Best score</p>
                    <p className="text-white font-bold text-lg leading-none mt-0.5">{bestScore}%</p>
                  </div>
                </div>
                <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-white/80" />
                  <div>
                    <p className="text-white/70 text-xs">Attempts</p>
                    <p className="text-white font-bold text-lg leading-none mt-0.5">{categoryAttempts.length}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Quiz list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5" style={{ color: accent }} />
                Practice Tests
                <span className="text-sm font-normal text-slate-500 ml-1">({categoryQuizzes.length})</span>
              </h2>
            </div>

            {categoryQuizzes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">No tests available yet</p>
                <p className="text-sm text-slate-400 mb-5">Be the first to create a quiz for this category</p>
                <Link to="/create-quiz">
                  <Button className="text-white" style={{ backgroundColor: accent }}>
                    Create a Quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {categoryQuizzes.map(quiz => (
                  <ModernQuizCard key={quiz.id} quiz={quiz} accent={accent} />
                ))}
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-5">
            {/* My History — auth-gated */}
            {isLoggedIn && categoryAttempts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm">
                    <Trophy className="w-4 h-4" style={{ color: accent }} />
                    My Recent Attempts
                  </h3>
                  <Badge className="text-xs" style={{ backgroundColor: `${accent}15`, color: accent }}>
                    {categoryAttempts.length} total
                  </Badge>
                </div>
                <div className="divide-y divide-slate-50">
                  {categoryAttempts.map((entry, idx) => {
                    const passed = entry.score >= 70;
                    return (
                      <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-start gap-2.5 min-w-0">
                          {passed
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            : <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-700 truncate">{entry.quizName}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {entry.date}
                            </p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                          {entry.score}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Guest prompt */}
            {!isLoggedIn && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                  <Trophy className="w-6 h-6" style={{ color: accent }} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">Track your progress</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">Sign in to see your score history, average performance, and improvement over time.</p>
                <Button
                  className="w-full gap-2 text-white text-sm"
                  style={{ backgroundColor: accent }}
                  onClick={() => window.dispatchEvent(new CustomEvent('open-signin'))}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In to Track
                </Button>
              </div>
            )}

            {/* Tips card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: accent }} />
                Study Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  'Use Practice mode to learn with instant feedback',
                  'Aim for 80%+ before attempting Real Exam mode',
                  'Review explanations for every wrong answer',
                  'Repeat tests until you score consistently',
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <span className="w-4 h-4 rounded-full text-white flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ backgroundColor: accent }}>
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
