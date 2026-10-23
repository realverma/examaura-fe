import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { QuizCard } from '../components/QuizCard';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { categories } from '../data/mockData';
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig'; // 🚀 Use your configured api instance

const ITEMS_PER_PAGE = 12;

export function AllQuizzes() {
  const navigate = useNavigate();
  
  // 🚀 Real Backend Data States
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Fetch quizzes from backend on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        // Assuming your backend endpoint is GET /quizzes (or /quizzes?size=100)
        const response = await api.get('/quizzes?page=0&size=20&sort=createdAt&order=ASC');
        
        // Handle Spring Boot pageable response (.content) or plain arrays
        const rawData = response.data.content || response.data.data || response.data;

        // Map backend properties to match your frontend QuizCard expectations
        const formattedQuizzes = rawData.map((q: any) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          category: q.categoryName || q.category || 'General',
          difficulty: (q.difficulty || 'medium').toLowerCase(),
          totalQuestions: q.questionCount || q.totalQuestions || 0,
          durationMinutes: q.durationMinutes || 10,
          imageUrl: q.imageUrl || q.coverImageUrl,
        }));

        setQuizzes(formattedQuizzes);
      } catch (error) {
        console.error('Failed to fetch quizzes from backend:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Filter quizzes
  let filteredQuizzes = quizzes;
  if (filterCategory !== 'all') {
    filteredQuizzes = filteredQuizzes.filter(q => q.category.toLowerCase() === filterCategory.toLowerCase());
  }
  if (filterDifficulty !== 'all') {
    filteredQuizzes = filteredQuizzes.filter(q => q.difficulty === filterDifficulty);
  }
  
  // Sort quizzes
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id - a.id; // Assuming higher/newer IDs come last or first depending on generation
      case 'oldest':
        return a.id - b.id;
      case 'category-az':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });
  
  const totalPages = Math.ceil(sortedQuizzes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentQuizzes = sortedQuizzes.slice(startIndex, endIndex);
  console.log('Current====> :', currentQuizzes); // Debugging log
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e40af]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6 -ml-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Quizzes</h1>
        <p className="text-slate-600">
          Browse our complete collection of practice tests
        </p>
      </div>
      
      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex-1 min-w-[200px]">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="category-az">Category (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {currentQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>

      
      
      {/* No results message */}
      {currentQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-600">No quizzes found with the selected filters.</p>
        </div>
      )}
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => goToPage(page)}
              className={currentPage === page ? 'bg-[#1e40af] hover:bg-[#1e3a8a]' : ''}
            >
              {page}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}