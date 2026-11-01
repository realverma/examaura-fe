import { Link } from 'react-router';
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Clock,
} from 'lucide-react';

const categoryMeta: Record<string, {
  label: string;
  short: string;
  icon: string;
  accent: string;
  soft: string;
  border: string;
}> = {
  azure: {
    label: "Microsoft Azure",
    short: "AZ",
    icon: "☁️",
    accent: "text-[#0078d4]",
    soft: "bg-[#edf7ff]",
    border: "border-[#0078d4]/20",
  },
  aws: {
    label: "AWS Cloud",
    short: "AWS",
    icon: "◈",
    accent: "text-[#b86400]",
    soft: "bg-[#fff7e8]",
    border: "border-[#ff9900]/25",
  },
  salesforce: {
    label: "Salesforce",
    short: "SF",
    icon: "⚡",
    accent: "text-[#0089bd]",
    soft: "bg-[#eaf9ff]",
    border: "border-[#00a1e0]/20",
  },
  mulesoft: {
    label: "MuleSoft",
    short: "MS",
    icon: "↔",
    accent: "text-[#007fac]",
    soft: "bg-[#eaf9fd]",
    border: "border-[#00a0df]/20",
  },
  gcp: {
    label: "Google Cloud",
    short: "GC",
    icon: "G",
    accent: "text-[#1967d2]",
    soft: "bg-[#eef4ff]",
    border: "border-[#4285f4]/20",
  },
  comptia: {
    label: "CompTIA",
    short: "A+",
    icon: "+",
    accent: "text-[#c40027]",
    soft: "bg-[#fff0f2]",
    border: "border-[#e4022d]/20",
  },
};

const difficultyMeta: Record<string, { label: string; classes: string; bar: string }> = {
  beginner: {
    label: "Beginner",
    classes: "bg-emerald-50 text-emerald-700",
    bar: "w-1/3 bg-emerald-500",
  },
  intermediate: {
    label: "Intermediate",
    classes: "bg-amber-50 text-amber-700",
    bar: "w-2/3 bg-amber-500",
  },
  advanced: {
    label: "Advanced",
    classes: "bg-red-50 text-red-700",
    bar: "w-full bg-red-500",
  }
};

function getCategoryId(value: any) {
  if (!value) return "general";
  // 🚀 If value is somehow an object (e.g. a nested category entity), grab its name or slug
  const valStr = typeof value === 'object' ? (value.slug || value.name || '') : String(value);
  const normalized = valStr.toLowerCase();
  
  if (normalized.includes("azure")) return "azure";
  if (normalized.includes("aws")) return "aws";
  if (normalized.includes("salesforce")) return "salesforce";
  if (normalized.includes("mule")) return "mulesoft";
  if (normalized.includes("google") || normalized.includes("gcp")) return "gcp";
  if (normalized.includes("comptia")) return "comptia";
  return normalized;
}
export function LibraryQuizCard({ quiz, index }: { quiz: any; index: number }) {
  const categoryId = getCategoryId(quiz.categorySlug || quiz.category);
  const category = categoryMeta[categoryId] ?? {
    label: quiz.category || "General",
    short: (quiz.category || "QZ").substring(0, 2).toUpperCase(),
    icon: "•",
    accent: "text-[#1e40af]",
    soft: "bg-blue-50",
    border: "border-blue-100",
  };
  
  const diffKey = (quiz.difficulty || "intermediate").toLowerCase();
  const difficulty = difficultyMeta[diffKey] ?? difficultyMeta.intermediate;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.045, 0.28) }}
      className="h-full"
    >
      <Link to={`/quiz/${quiz.id}/instructions`} className="group block h-full">
        <article className="flex h-full min-h-[330px] flex-col overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_42px_-26px_rgba(30,64,175,0.35)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className={`flex h-12 min-w-12 items-center justify-center rounded-2xl border text-sm font-black ${category.soft} ${category.accent} ${category.border}`}>
              {category.short}
            </div>
            <span className={`rounded-full px-2.5 py-1.5 text-[10px] font-bold ${difficulty.classes}`}>
              {difficulty.label}
            </span>
          </div>

          <div className="mt-7 flex-1">
            <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${category.accent}`}>
              {category.label}
            </p>
            <h2 className="mt-2 line-clamp-2 text-xl font-bold leading-[1.2] tracking-[-0.025em] text-slate-950 transition-colors group-hover:text-[#1e40af]">
              {quiz.title}
            </h2>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
              {quiz.description || "Focused certification practice with realistic questions and detailed explanations."}
            </p>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold text-slate-400">
              <span>Challenge level</span>
              <span>{quiz.passingPercentage ?? 70}% to pass</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${difficulty.bar}`} />
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                {quiz.totalQuestions} questions
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {quiz.durationMinutes} min
              </span>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white transition-all group-hover:bg-[#1e40af]">
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}