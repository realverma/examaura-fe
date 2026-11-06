import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { formatDuration } from '../components/ui/utils';
import { AttemptSummary, QuestionDetail, FormattedResult } from '../types/attempt';

export function useQuizResultsData(quizId?: string, attemptId?: string | null) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [summary, setSummary] = useState<AttemptSummary | null>(null);
  const [results, setResults] = useState<FormattedResult | null>(null);

  useEffect(() => {
    if (!attemptId || !quizId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // 🔥 Reduced to only 2 calls running in parallel
        const [summaryRes, questionsRes] = await Promise.all([
          api.get<AttemptSummary>(`/attempts/${attemptId}/summary`),
          api.get<{ data: QuestionDetail[] }>(`/quizzes/${quizId}/questions?size=100`),
        ]);

        const sumData = summaryRes.data;
        const qList = questionsRes.data.data || [];

        setSummary(sumData);
        setQuestions(qList);

        setResults({
          score: Math.round(sumData.score),
          passedScore: Math.round(sumData.passedScore),
          correctAnswers: sumData.correctAnswers,
          totalQuestions: sumData.totalQuestions || qList.length,
          timeTaken: formatDuration(sumData.timeTakenSeconds) || '0 min',
          mode: sumData.mode?.toLowerCase() || 'exam',
          isPassed: sumData.isPassed, // Provided directly by backend
        });
      } catch (err) {
        console.error('Failed to load quiz results:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [quizId, attemptId]);

  return { loading, questions, summary, results };
}