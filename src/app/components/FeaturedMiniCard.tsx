import { Link } from 'react-router';
import type { Quiz } from '../types/quiz';
import {
  ArrowRight,
} from 'lucide-react';


export function FeaturedMiniCard({ quiz, index }: { quiz: Quiz; index: number }) {
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
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold capitalize bg-[aliceblue]`}>
            {quiz.difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}