import { useMemo, useState, useEffect } from "react";
import { motion } from "motion/react";
import { LibraryQuizCard } from '../components/LibraryQuizCard';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import api from '../api/axiosConfig';

const ITEMS_PER_PAGE = 9;

interface Category {
  id: string;
  name: string;
  slug?: string;
}

function FilterOption({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center justify-between overflow-hidden rounded-xl px-3.5 py-3 text-left text-sm transition-colors ${
        active ? "text-[#1e40af]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
      }`}
    >
      {active && (
        <motion.span
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 rounded-xl bg-blue-50 ring-1 ring-inset ring-blue-100"
          transition={{ duration: 0.18 }}
        />
      )}
      <span className="relative flex items-center gap-2.5 font-semibold">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${active ? "border-[#1e40af] bg-[#1e40af] text-white" : "border-slate-300 bg-white"}`}>
          {active && <Check className="h-3 w-3" />}
        </span>
        {label}
      </span>
      <span className={`relative text-xs ${active ? "text-[#1e40af]" : "text-slate-400"}`}>{count}</span>
    </button>
  );
}

export function AllQuizzes() {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDifficulty, setFilterDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch Categories and Quizzes concurrently
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [categoriesRes, quizzesRes] = await Promise.all([
          api.get('/categories').catch(() => ({ data: [] })),
          api.get('/quizzes?page=0&size=100&sort=createdAt')
        ]);

        const fetchedCategories = categoriesRes.data.content || categoriesRes.data || [];
        setCategoriesList(fetchedCategories);

        const rawData = quizzesRes.data.content || quizzesRes.data.data || quizzesRes.data;
        const formattedQuizzes = rawData.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.categoryName || q.category || 'General',
          categorySlug: q.categorySlug || q.category,
          categoryId: q.categoryId,
          difficulty: (q.difficulty || 'medium').toLowerCase(),
          totalQuestions: q.questionCount || q.totalQuestions || 0,
          durationMinutes: q.durationMinutes || 10,
          passingPercentage: q.passingPercentage || 70,
          imageUrl: q.imageUrl || q.coverImageUrl,
        }));

        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryCounts = useMemo(() => {
    return quizzes.reduce<Record<string, number>>((counts, quiz) => {
      const id = quiz.category.name;
      counts[id] = (counts[id] ?? 0) + 1;
      return counts;
    }, {});
  }, [quizzes]);

  const difficultyCounts = useMemo(() => {
    return quizzes.reduce<Record<string, number>>((counts, quiz) => {
      counts[quiz.difficulty] = (counts[quiz.difficulty] ?? 0) + 1;
      return counts;
    }, {});
  }, [quizzes]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return quizzes
      .filter(quiz => {
        if (filterCategory === "all") return true;
        // 🚀 Safely extract string values for category check
        const catValue = quiz.category.name;
        const catStr = typeof catValue === 'object' ? (catValue.slug || catValue.name || '') : String(catValue || '');
        const catId = String(quiz.categoryId || "");
        
        return catStr.toLowerCase() === filterCategory.toLowerCase() || catId === filterCategory;
      })
      .filter(quiz => filterDifficulty === "all" || quiz.difficulty === filterDifficulty)
      .filter(quiz => {
        if (!query) return true;
        
        // 🚀 Safely convert all fields to strings before calling .toLowerCase()
        const title = typeof quiz.title === 'string' ? quiz.title : String(quiz.title || '');
        
        const catValue = quiz.category;
        const cat = typeof catValue === 'object' ? (catValue.name || catValue.slug || '') : String(catValue || '');
        
        const descValue = quiz.description;
        const desc = typeof descValue === 'string' ? descValue : String(descValue || '');

        return (
          title.toLowerCase().includes(query) ||
          cat.toLowerCase().includes(query) ||
          desc.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
  }, [filterCategory, filterDifficulty, quizzes, searchQuery]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageQuizzes = filtered.slice(start, start + ITEMS_PER_PAGE);
  const hasActiveFilters = filterCategory !== "all" || filterDifficulty !== "all" || searchQuery.trim() !== "";

  const chooseCategory = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const chooseDifficulty = (value: string) => {
    setFilterDifficulty(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilterCategory("all");
    setFilterDifficulty("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 220, behavior: "smooth" });
  };

  const sidebar = (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Category</h2>
          <span className="text-[10px] font-semibold text-slate-400">{categoriesList.length} tracks</span>
        </div>
        <div className="space-y-1">
          <FilterOption
            label="All categories"
            count={quizzes.length}
            active={filterCategory === "all"}
            onClick={() => chooseCategory("all")}
          />
          {categoriesList.map(category => {
            const idKey = category.name;
            return (
              <FilterOption
                key={category.id}
                label={category.name}
                count={categoryCounts[idKey] ?? categoryCounts[category.id] ?? 0}
                active={filterCategory === idKey || filterCategory === category.id}
                onClick={() => chooseCategory(idKey)}
              />
            );
          })}
        </div>
      </div>

      <div className="h-px bg-slate-100" />

      <div>
        <h2 className="mb-3 px-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Level</h2>
        <div className="space-y-1">
          {[
            { value: "all", label: "Any level", count: quizzes.length },
            { value: "beginner", label: "Beginner", count: (difficultyCounts.beginner ?? 0) + (difficultyCounts.easy ?? 0) },
            { value: "intermediate", label: "Intermediate", count: (difficultyCounts.intermediate ?? 0) + (difficultyCounts.medium ?? 0) },
            { value: "advanced", label: "Advanced", count: (difficultyCounts.advanced ?? 0) + (difficultyCounts.hard ?? 0) },
          ].map(level => (
            <FilterOption
              key={level.value}
              label={level.label}
              count={level.count}
              active={filterDifficulty === level.value}
              onClick={() => chooseDifficulty(level.value)}
            />
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-[#1e40af]"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e40af]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1e40af]">
                <Sparkles className="h-4 w-4 text-[#10b981]" />
                Certification library
              </div>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500">
                Focus your practice by certification and difficulty, then choose the test that matches your next milestone.
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(current => !current)}
          className="mb-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-[#1e40af]" />
            Filter quizzes
          </span>
          <span className="text-xs font-semibold text-slate-400">{filtered.length} results</span>
        </button>

        {mobileFiltersOpen && (
          <motion.aside
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 lg:hidden"
          >
            {sidebar}
          </motion.aside>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.55)]">
              <div className="mb-6 flex items-center gap-2 border-b border-slate-100 px-1 pb-4">
                <Filter className="h-4 w-4 text-[#1e40af]" />
                <span className="text-sm font-bold text-slate-900">Refine library</span>
              </div>
              {sidebar}
            </div>
          </aside>

          <section>
            <div className="mb-6 grid items-end gap-8 lg:grid-cols-[1fr_0.72fr]">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Showing <span className="font-bold text-slate-950">{filtered.length}</span> quiz{filtered.length === 1 ? "" : "zes"}
                </p>
                <p className="mt-1 text-xs text-slate-400">Sorted alphabetically</p>
              </div>
              <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={event => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title, topic or provider"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#1e40af]/40 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              </div>
              
            </div>

            <motion.div
              key={`${filterCategory}-${filterDifficulty}-${currentPage}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {pageQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {pageQuizzes.map((quiz, index) => (
                    <LibraryQuizCard key={quiz.id} quiz={quiz} index={index} />
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">⌕</span>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">No matching quizzes</h2>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Try another certification track, choose a different level, or clear your search.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 rounded-xl bg-[#1e40af] px-5 py-3 text-sm font-bold text-white hover:bg-[#17358f]"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </motion.div>

            {totalPages > 1 && (
              <nav aria-label="Quiz pagination" className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => goToPage(currentPage - 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-blue-200 hover:text-[#1e40af] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`h-10 min-w-10 rounded-xl px-3 text-sm font-bold transition-colors ${
                      page === currentPage
                        ? "bg-[#1e40af] text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#1e40af]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => goToPage(currentPage + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-blue-200 hover:text-[#1e40af] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}