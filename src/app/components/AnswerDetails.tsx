import React from 'react';
import { Check, X } from 'lucide-react';
import { QuestionDetail } from '../types/attempt';

function AnswerPill({ children, tone }: { children: React.ReactNode; tone: 'correct' | 'incorrect' | 'neutral' }) {
  const styles = {
    correct: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    incorrect: 'border-red-200 bg-red-50 text-red-800',
    neutral: 'border-slate-200 bg-slate-50 text-slate-700',
  };
  return <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}

export function AnswerDetails({ question, userAnswer }: { question: QuestionDetail; userAnswer: any }) {
  // 1. Single / Multiple Choice
  if ((question.questionType === 'OBJECTIVE' || question.questionType === 'MULTIPLE_CHOICE') && question.options) {
    const correctAnswers = question.correctAnswer?.answers ?? 
      (question.correctAnswer?.answer !== undefined ? [question.correctAnswer.answer] : []);
    
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : userAnswer !== undefined ? [userAnswer] : [];

    return (
      <div className="grid gap-2">
        {question.options.map((option, index) => {
          const isCorrect = correctAnswers.includes(index);
          const isSelected = userAnswers.includes(index);
          const tone = isCorrect ? 'border-emerald-200 bg-emerald-50/70' : isSelected ? 'border-red-200 bg-red-50/70' : 'border-slate-200 bg-white';

          return (
            <div key={index} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${tone}`}>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : isSelected ? 'border-red-500 bg-red-500 text-white' : 'border-slate-300 text-slate-400'
              }`}>
                {isCorrect ? <Check className="h-3.5 w-3.5" /> : isSelected ? <X className="h-3.5 w-3.5" /> : String.fromCharCode(65 + index)}
              </span>
              <span className={`flex-1 ${isCorrect || isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{option}</span>
              {isCorrect && <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Correct answer</span>}
              {isSelected && !isCorrect && <span className="text-[10px] font-bold uppercase tracking-wide text-red-700">Your answer</span>}
            </div>
          );
        })}
      </div>
    );
  }


  // 2. Drag Classification
  if (question.questionType === 'DRAG_CLASSIFY' && question.classifyItems && question.categories) {
    return (
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {question.classifyItems.map((item) => {
          const userCatId = Object.entries(userAnswer ?? {}).find(([, items]) => Array.isArray(items) && items.includes(item.id))?.[0];
          const userCategoryName = question.categories?.find((c) => c.id === userCatId)?.name;
          const correctCategoryName = question.categories?.find((c) => c.id === item.correctCategoryId)?.name;
          const isRight = userCatId === item.correctCategoryId;

          return (
            <div key={item.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="font-medium text-slate-700">{item.text}</span>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={userCatId ? (isRight ? 'correct' : 'incorrect') : 'neutral'}>
                  Yours: {userCategoryName ?? 'Unanswered'}
                </AnswerPill>
                {!isRight && <AnswerPill tone="correct">Correct: {correctCategoryName}</AnswerPill>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Matching Dropdown & Inline Dropdown
  const rows = question.dropdownRows || question.inlineDropdowns?.map((d, i) => ({ id: d.id || i.toString(), label: `Blank ${i + 1}`, options: d.options, correctAnswer: d.correctAnswer }));
  if (rows) {
    return (
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
        {rows.map((row) => {
          const selected = userAnswer?.[row.id];
          const isRight = selected === row.correctAnswer;
          return (
            <div key={row.id} className="grid gap-3 px-4 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
              <span className="font-medium text-slate-700">{row.label}</span>
              <div className="flex flex-wrap gap-2">
                <AnswerPill tone={selected === undefined ? 'neutral' : isRight ? 'correct' : 'incorrect'}>
                  Yours: {selected !== undefined ? row.options[selected] : 'Unanswered'}
                </AnswerPill>
                {!isRight && <AnswerPill tone="correct">Correct: {row.options[row.correctAnswer]}</AnswerPill>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 4. Drag Match
  if (question.questionType === 'DRAG_MATCH' && question.matchPairs) {
    return (
      <div className="space-y-2">
        {question.matchPairs.map((pair) => {
          const matchedTermId = userAnswer?.[pair.id];
          const matchedTerm = question.matchPairs?.find((item) => item.id === matchedTermId)?.term;
          const isRight = matchedTermId === pair.id;
          return (
            <div key={pair.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
              <p className="text-slate-600">{pair.definition}</p>
              <div>
                <p className={`font-semibold ${isRight ? 'text-emerald-700' : 'text-red-700'}`}>{matchedTerm ?? 'Not matched'}</p>
                {!isRight && <p className="mt-1 text-xs font-semibold text-emerald-700">Correct: {pair.term}</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}