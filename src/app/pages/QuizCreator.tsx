import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Plus, Trash2, Check, ArrowLeft, GripVertical, Eye, X, Upload, FileJson, Download, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { categories } from '../data/mockData';
import { toast } from 'sonner';
import api from '../api/axiosConfig'; // 🚀 Connected to real backend Axios instance

type QuestionType = 'objective' | 'multiple-choice' | 'yes-no-grid' | 'drag-match' | 'drag-classify' | 'inline-dropdown' | 'matching-dropdown';

interface BaseQuestionForm {
  id: string;
  text: string;
  type: QuestionType;
  explanation: string;
}

interface ObjectiveQuestion extends BaseQuestionForm {
  type: 'objective';
  options: string[];
  correctAnswer: number | null;
  questionImage?: string;
}

interface MultipleChoiceQuestion extends BaseQuestionForm {
  type: 'multiple-choice';
  options: string[];
  correctAnswers: number[];
  questionImage?: string;
}

interface YesNoGridQuestion extends BaseQuestionForm {
  type: 'yes-no-grid';
  statements: {
    id: string;
    text: string;
    correctAnswer: 'yes' | 'no' | null;
  }[];
}

interface DragMatchQuestion extends BaseQuestionForm {
  type: 'drag-match';
  matchPairs: {
    id: string;
    term: string;
    definition: string;
  }[];
}

interface DragClassifyQuestion extends BaseQuestionForm {
  type: 'drag-classify';
  categories: {
    id: string;
    name: string;
  }[];
  classifyItems: {
    id: string;
    text: string;
    correctCategoryId: string | null;
  }[];
}

interface InlineDropdownQuestion extends BaseQuestionForm {
  type: 'inline-dropdown';
  sentenceTemplate: string;
  inlineDropdowns: {
    id: string;
    options: string[];
    correctAnswer: number | null;
  }[];
}

interface MatchingDropdownQuestion extends BaseQuestionForm {
  type: 'matching-dropdown';
  dropdownRows: {
    id: string;
    label: string;
    options: string[];
    correctAnswer: number | null;
  }[];
}

type QuestionForm = ObjectiveQuestion | MultipleChoiceQuestion | YesNoGridQuestion | DragMatchQuestion | DragClassifyQuestion | InlineDropdownQuestion | MatchingDropdownQuestion;

// ---------- JSON Import helpers ----------

const SAMPLE_JSON = {
  title: "Sample Quiz Title",
  category: "azure",
  durationMinutes: 60,
  description: "A short description of what this quiz covers.",
  passingScore: 75,
  questions: [
    {
      id: "q1",
      type: "objective",
      text: "Which cloud model provides the highest flexibility?",
      options: ["Public cloud", "Private cloud", "Hybrid cloud", "On-premises"],
      correctAnswer: 2,
      explanation: "Hybrid cloud combines public and private clouds, offering maximum flexibility."
    }
  ]
};

function parseJsonToQuestions(rawQuestions: any[]): QuestionForm[] {
  return rawQuestions.map((q: any, idx: number) => {
    const id = q.id || `imported-${Date.now()}-${idx}`;
    const base = { id, text: q.text || '', explanation: q.explanation || '' };

    switch (q.type) {
      case 'objective':
        return {
          ...base,
          type: 'objective' as const,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : null,
          questionImage: q.questionImage,
        };
      case 'multiple-choice':
        return {
          ...base,
          type: 'multiple-choice' as const,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswers: Array.isArray(q.correctAnswer) ? q.correctAnswer : [],
          questionImage: q.questionImage,
        };
      case 'yes-no-grid':
        return {
          ...base,
          type: 'yes-no-grid' as const,
          statements: Array.isArray(q.statements)
            ? q.statements.map((s: any) => ({ id: s.id || Date.now().toString(), text: s.text || '', correctAnswer: s.correctAnswer ?? null }))
            : [],
        };
      case 'drag-match':
        return {
          ...base,
          type: 'drag-match' as const,
          matchPairs: Array.isArray(q.matchPairs)
            ? q.matchPairs.map((p: any) => ({ id: p.id || Date.now().toString(), term: p.term || '', definition: p.definition || '' }))
            : [],
        };
      case 'drag-classify':
        return {
          ...base,
          type: 'drag-classify' as const,
          categories: Array.isArray(q.categories)
            ? q.categories.map((c: any) => ({ id: c.id || Date.now().toString(), name: c.name || '' }))
            : [],
          classifyItems: Array.isArray(q.classifyItems)
            ? q.classifyItems.map((i: any) => ({ id: i.id || Date.now().toString(), text: i.text || '', correctCategoryId: i.correctCategoryId ?? null }))
            : [],
        };
      case 'inline-dropdown':
        return {
          ...base,
          type: 'inline-dropdown' as const,
          sentenceTemplate: q.sentenceTemplate || '',
          inlineDropdowns: Array.isArray(q.inlineDropdowns)
            ? q.inlineDropdowns.map((d: any) => ({ id: d.id || Date.now().toString(), options: Array.isArray(d.options) ? d.options : [], correctAnswer: typeof d.correctAnswer === 'number' ? d.correctAnswer : null }))
            : [],
        };
      case 'matching-dropdown':
        return {
          ...base,
          type: 'matching-dropdown' as const,
          dropdownRows: Array.isArray(q.dropdownRows)
            ? q.dropdownRows.map((r: any) => ({ id: r.id || Date.now().toString(), label: r.label || '', options: Array.isArray(r.options) ? r.options : [], correctAnswer: typeof r.correctAnswer === 'number' ? r.correctAnswer : null }))
            : [],
        };
      default:
        return {
          ...base,
          type: 'objective' as const,
          options: Array.isArray(q.options) ? q.options : ['', ''],
          correctAnswer: null,
        };
    }
  });
}

interface ImportResult {
  title?: string;
  category?: string;
  duration?: number;
  description?: string;
  questionCount: number;
  fileName: string;
}

export function QuizCreator() {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in edit mode
  const editQuizId = location.state?.editQuizId as string | undefined;
  const isEditMode = !!editQuizId;

  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState('');
  const [quizDuration, setQuizDuration] = useState('60');
  const [quizDescription, setQuizDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState(false);

  // JSON import state
  const [importOpen, setImportOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Load Categories from backend
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories'); // Or whatever your category endpoint is
      setAvailableCategories(response.data);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };
  fetchCategories();
}, []);

  // 2. Load existing quiz data from backend 
  useEffect(() => {
    if (isEditMode && editQuizId) {
      const fetchQuizForEdit = async () => {
        try {
          setLoading(true);
          const quizRes = await api.get(`/quizzes/${editQuizId}`);
          const quiz = quizRes.data;
          setQuizTitle(quiz.title);
          setQuizDuration((quiz.durationMinutes || 60).toString());
          setQuizDescription(quiz.description || '');

          // 🚀 Now availableCategories is guaranteed to be populated!
          const rawCategory = quiz.category.id || quiz.category.name;
          if (rawCategory) {
            setQuizCategory(rawCategory); 
          }

          const questionsRes = await api.get(`/quizzes/${editQuizId}/questions?size=100`);
          const rawQuestions = questionsRes.data.content || questionsRes.data.data || questionsRes.data;

          const parseJSON = (val: any) => {
            if (typeof val === 'string') {
              try { return JSON.parse(val); } catch (e) { return null; }
            }
            return val;
          };

          const formQuestions: QuestionForm[] = rawQuestions.map((q: any) => {
            const rawType = q.questionType || q.type || 'objective';
            const mappedType = rawType.toLowerCase().replace(/_/g, '-') as QuestionType;
            const options = parseJSON(q.options) || [];
            const correctAnswer = parseJSON(q.correctAnswer);

            return {
              id: q.id,
              text: q.questionText || q.text || '',
              type: mappedType,
              explanation: q.explanation || '',
              questionImage: q.questionImageUrl,
              options: options,
              correctAnswer: typeof correctAnswer === 'number' ? correctAnswer : (correctAnswer?.answer ?? null),
              correctAnswers: Array.isArray(correctAnswer?.answers) ? correctAnswer.answers : [],
              statements: parseJSON(q.statements) || [],
              matchPairs: parseJSON(q.matchPairs) || [],
              categories: parseJSON(q.categories) || [],
              classifyItems: parseJSON(q.classifyItems) || [],
              sentenceTemplate: q.sentenceTemplate || '',
              inlineDropdowns: parseJSON(q.inlineDropdowns) || [],
              dropdownRows: parseJSON(q.dropdownRows) || [],
            } as QuestionForm;
          });

          setQuestions(formQuestions);
        } catch (error) {
          console.error('Failed to load quiz for editing:', error);
          toast.error('Quiz not found or failed to load');
          navigate('/profile');
        } finally {
          setLoading(false);
        }
      };

      fetchQuizForEdit();
    }
  }, [isEditMode, editQuizId, navigate]);

  // 3. Match Category to UUID once BOTH categories and quiz details are loaded
  useEffect(() => {
    if (quizCategory && availableCategories.length > 0) {
      const matchedCat = availableCategories.find(c => 
        c.id === quizCategory || 
        c.name.toLowerCase() === String(quizCategory).toLowerCase() ||
        c.slug?.toLowerCase() === String(quizCategory).toLowerCase()
      );

      if (matchedCat && quizCategory !== matchedCat.id) {
        setQuizCategory(matchedCat.id);
      }
    }
  }, [availableCategories]);
  
  const createNewQuestion = (type: QuestionType): QuestionForm => {
    const base = {
      id: Date.now().toString(),
      text: '',
      type,
      explanation: ''
    };

    switch (type) {
      case 'objective':
        return { ...base, type: 'objective', options: ['', ''], correctAnswer: null };
      case 'multiple-choice':
        return { ...base, type: 'multiple-choice', options: ['', ''], correctAnswers: [] };
      case 'yes-no-grid':
        return { ...base, type: 'yes-no-grid', statements: [{ id: '1', text: '', correctAnswer: null }] };
      case 'drag-match':
        return { ...base, type: 'drag-match', matchPairs: [{ id: '1', term: '', definition: '' }] };
      case 'drag-classify':
        return {
          ...base,
          type: 'drag-classify',
          categories: [{ id: '1', name: '' }],
          classifyItems: [{ id: '1', text: '', correctCategoryId: null }]
        };
      case 'inline-dropdown':
        return { ...base, type: 'inline-dropdown', sentenceTemplate: '', inlineDropdowns: [] };
      case 'matching-dropdown':
        return {
          ...base,
          type: 'matching-dropdown',
          dropdownRows: [{ id: '1', label: '', options: [''], correctAnswer: null }]
        };
      default:
        return { ...base, type: 'objective', options: ['', ''], correctAnswer: null };
    }
  };

  const addQuestion = (type: QuestionType) => {
    setQuestions([...questions, createNewQuestion(type)]);
  };

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const updateQuestion = <T extends QuestionForm>(questionId: string, updates: Partial<T>) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  const handleJsonFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a .json file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        if (!raw.questions || !Array.isArray(raw.questions)) {
          toast.error('JSON must contain a "questions" array');
          return;
        }
        const parsed = parseJsonToQuestions(raw.questions);
        setQuestions(parsed);
        if (raw.title) setQuizTitle(raw.title);
        if (raw.durationMinutes || raw.duration) setQuizDuration(String(raw.durationMinutes || raw.duration));
        if (raw.description) setQuizDescription(raw.description);
        if (raw.category) {
          const matchedCat = availableCategories.find(c => c.id === raw.category || c.name.toLowerCase() === String(raw.category).toLowerCase());
          if (matchedCat) {
            setQuizCategory(matchedCat.id);
          }
        }
        setImportResult({
          title: raw.title,
          category: raw.category,
          duration: raw.durationMinutes || raw.duration,
          description: raw.description,
          questionCount: parsed.length,
          fileName: file.name,
        });
        setImportOpen(false);
        toast.success(`Imported ${parsed.length} question${parsed.length !== 1 ? 's' : ''} from ${file.name}`);
      } catch {
        toast.error('Failed to parse JSON. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleJsonFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleJsonFile(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const blob = new Blob([JSON.stringify(SAMPLE_JSON, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    
    if (!quizCategory) {
      toast.error('Please select a category');
      return;
    }
    
    if (!quizDuration || parseInt(quizDuration) < 1) {
      toast.error('Please enter a valid duration');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // 🚀 Map questions precisely to match the working backend schema
    const formattedQuestionsForBackend = questions.map((q, index) => {
      const baseQuestion: any = {
        questionText: q.text,
        questionType: q.type.toUpperCase().replace(/-/g, '_'),
        explanation: q.explanation,
        position: index + 1,
        questionImageUrl: (q as any).questionImage || null,
      };

      // Type-specific mappings based on the working sample payload
      switch (q.type) {
        case 'objective':
          baseQuestion.options = (q as ObjectiveQuestion).options;
          baseQuestion.correctAnswer = { answer: (q as ObjectiveQuestion).correctAnswer };
          break;

        case 'multiple-choice':
          baseQuestion.options = (q as MultipleChoiceQuestion).options;
          baseQuestion.correctAnswer = { answers: (q as MultipleChoiceQuestion).correctAnswers };
          break;

        case 'yes-no-grid':
          baseQuestion.matchPairs = (q as YesNoGridQuestion).statements.map((s, sIdx) => ({
            id: s.id || `yg${sIdx + 1}`,
            text: s.text,
            correctAnswer: s.correctAnswer
          }));
          break;

        case 'drag-match':
          baseQuestion.matchPairs = (q as DragMatchQuestion).matchPairs.map((p, pIdx) => ({
            id: p.id || `dm${pIdx + 1}`,
            term: p.term,
            definition: p.definition
          }));
          break;

        case 'drag-classify':
          baseQuestion.categories = (q as DragClassifyQuestion).categories.map((c, cIdx) => ({
            id: c.id || `cat-${cIdx + 1}`,
            name: c.name
          }));
          baseQuestion.classifyItems = (q as DragClassifyQuestion).classifyItems.map((item, iIdx) => ({
            id: item.id || `item${iIdx + 1}`,
            text: item.text,
            correctCategoryId: item.correctCategoryId
          }));
          break;

        case 'inline-dropdown':
          baseQuestion.sentenceTemplate = (q as InlineDropdownQuestion).sentenceTemplate;
          baseQuestion.inlineDropdowns = (q as InlineDropdownQuestion).inlineDropdowns.map((d, dIdx) => ({
            id: d.id || `id${dIdx + 1}`,
            options: d.options,
            correctAnswer: d.correctAnswer
          }));
          break;

        case 'matching-dropdown':
          baseQuestion.dropdownRows = (q as MatchingDropdownQuestion).dropdownRows.map((r, rIdx) => ({
            id: r.id || `dr${rIdx + 1}`,
            label: r.label,
            options: r.options,
            correctAnswer: r.correctAnswer
          }));
          break;
      }

      return baseQuestion;
    });
    
    // Root Quiz Payload matching your schema
    const quizPayload = {
      title: quizTitle,
      description: quizDescription,
      categoryId: quizCategory,
      difficulty: "INTERMEDIATE", // Or map this from a state selector if you added one
      durationMinutes: parseInt(quizDuration),
      passingPercentage: 70, // Default or binded state
      questions: formattedQuestionsForBackend
    };

    try {
      setLoading(true);
      if (isEditMode && editQuizId) {
        await api.put(`/quizzes/${editQuizId}`, quizPayload);
        toast.success('Quiz updated successfully!');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        await api.post('/quizzes', quizPayload);
        toast.success('Quiz published successfully!');
        setTimeout(() => navigate('/quizzes'), 1500);
      }
    } catch (error) {
      console.error('Failed to save quiz:', error);
      toast.error('Failed to save quiz. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1e40af]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">{isEditMode ? 'Edit Quiz' : 'Create New Quiz'}</h1>
          <p className="text-slate-600">
            {isEditMode ? 'Update your quiz with various question types' : 'Build a comprehensive quiz with various question types'}
          </p>
        </div>
        
        {/* JSON Import Section */}
        {!isEditMode && (
          <div className="mb-8">
            <button
              onClick={() => setImportOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <FileJson className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">Import from JSON</p>
                  <p className="text-white/75 text-xs mt-0.5">Upload a JSON file to auto-populate the entire quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {importResult && (
                  <span className="hidden sm:flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {importResult.questionCount} questions imported
                  </span>
                )}
                {importOpen ? <ChevronUp className="w-5 h-5 opacity-80" /> : <ChevronDown className="w-5 h-5 opacity-80" />}
              </div>
            </button>

            {importOpen && (
              <div className="mt-3 border border-border rounded-2xl bg-white overflow-hidden shadow-sm">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`m-5 border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? 'border-[#1e40af] bg-blue-50' : 'border-slate-200 hover:border-[#1e40af]/60 hover:bg-slate-50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isDragging ? 'bg-[#1e40af]/10' : 'bg-slate-100'}`}>
                    <Upload className={`w-7 h-7 ${isDragging ? 'text-[#1e40af]' : 'text-slate-400'}`} />
                  </div>
                  <p className="font-semibold text-slate-700 mb-1">Drop your JSON file here</p>
                  <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                    <FileJson className="w-3.5 h-3.5" />
                    .json files only
                  </span>
                </div>

                <div className="px-5 pb-5 space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Expected JSON structure</p>
                      <p className="text-amber-700 text-xs leading-relaxed">
                        The file must include a <code className="bg-amber-100 px-1 rounded">questions</code> array.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadTemplate}
                    className="gap-2 border-[#1e40af] text-[#1e40af] hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4" />
                    Download Sample Template
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Details */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold mb-6">Quiz Details</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Azure AZ-900 Practice Test 3"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select 
                  value={quizCategory} 
                  onValueChange={(value) => setQuizCategory(value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}> {/* 🚀 Sends the true UUID to state */}
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Total Time (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                placeholder="60"
                value={quizDuration}
                onChange={(e) => setQuizDuration(e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of what this quiz covers..."
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        </Card>
        
        {/* Questions */}
        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
          </div>
          
          {questions.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-slate-600 mb-6">No questions added yet. Select a question type to get started.</p>
              <AddQuestionDropdown onAddQuestion={addQuestion} />
            </Card>
          )}
          
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <button className="mt-1 cursor-move text-slate-400 hover:text-slate-600">
                  <GripVertical className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-[#1e40af] text-white">
                        Question {qIndex + 1}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="text-slate-600">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                        className="text-[#dc2626] hover:text-[#b91c1c] hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <QuestionEditor question={question} updateQuestion={updateQuestion} />
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border ml-9">
                <AddQuestionDropdown onAddQuestion={addQuestion} />
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Fixed Publish Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border py-6 shadow-lg z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={() => navigate(-1)} size="lg">
              Cancel
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading}
              size="lg"
              className="bg-[#10b981] hover:bg-[#059669] text-white px-12 font-semibold text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Check className="w-5 h-5 mr-2" />}
              {isEditMode ? 'Update Quiz' : 'Publish Quiz'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddQuestionDropdown({ onAddQuestion }: { onAddQuestion: (type: QuestionType) => void }) {
  return (
    <Select onValueChange={(value) => onAddQuestion(value as QuestionType)}>
      <SelectTrigger className="w-full max-w-md text-[#1e40af] border-[#1e40af] hover:bg-blue-50">
        <Plus className="w-4 h-4 mr-2" />
        <SelectValue placeholder="Add Question" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="objective">Objective (Single Answer)</SelectItem>
        <SelectItem value="multiple-choice">Multiple Choice (Select All That Apply)</SelectItem>
        <SelectItem value="yes-no-grid">Yes/No Statement Grid</SelectItem>
        <SelectItem value="drag-match">Drag & Drop: Matching</SelectItem>
        <SelectItem value="drag-classify">Drag & Drop: Classification</SelectItem>
        <SelectItem value="inline-dropdown">Inline Dropdown</SelectItem>
        <SelectItem value="matching-dropdown">Matching Dropdown</SelectItem>
      </SelectContent>
    </Select>
  );
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    'objective': 'Single Answer',
    'multiple-choice': 'Multiple Answers',
    'yes-no-grid': 'Yes/No Grid',
    'drag-match': 'Drag & Match',
    'drag-classify': 'Drag & Classify',
    'inline-dropdown': 'Inline Dropdown',
    'matching-dropdown': 'Matching Dropdown'
  };
  return labels[type];
}

function QuestionEditor({ question, updateQuestion }: {
  question: QuestionForm;
  updateQuestion: <T extends QuestionForm>(questionId: string, updates: Partial<T>) => void;
}) {
  const commonFields = (
    <>
      <div className="mb-4">
        <Label>Question Text *</Label>
        <Textarea
          placeholder="Enter your question here..."
          value={question.text}
          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
          className="mt-2"
          rows={2}
        />
      </div>
    </>
  );

  const explanationField = (
    <div className="mt-4">
      <Label>Explanation *</Label>
      <Textarea
        placeholder="Explain the correct answer..."
        value={question.explanation}
        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
        className="mt-2"
        rows={3}
      />
    </div>
  );

  switch (question.type) {
    case 'objective':
      return <ObjectiveEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'multiple-choice':
      return <MultipleChoiceEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'yes-no-grid':
      return <YesNoGridEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'drag-match':
      return <DragMatchEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'drag-classify':
      return <DragClassifyEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'inline-dropdown':
      return <InlineDropdownEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    case 'matching-dropdown':
      return <MatchingDropdownEditor question={question} updateQuestion={updateQuestion} commonFields={commonFields} explanationField={explanationField} />;
    default:
      return null;
  }
}

// Sub-editors remain structured as before for handling specific input fields...
function ObjectiveEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(question.id, { questionImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateQuestion(question.id, { questionImage: undefined });
  };

  const addOption = () => {
    updateQuestion(question.id, { options: [...question.options, ''] });
  };

  const removeOption = (index: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_: string, i: number) => i !== index);
      const newCorrectAnswer = question.correctAnswer === index ? null :
        (question.correctAnswer !== null && question.correctAnswer > index ? question.correctAnswer - 1 : question.correctAnswer);
      updateQuestion(question.id, { options: newOptions, correctAnswer: newCorrectAnswer });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(question.id, { options: newOptions });
  };

  return (
    <div>
      {commonFields}
      <div className="mb-4">
        <Label>Question Image (Optional)</Label>
        {question.questionImage ? (
          <div className="mt-2">
            <div className="relative inline-block">
              <img src={question.questionImage} alt="Question" className="max-w-full h-auto rounded-lg border border-border" style={{ maxHeight: '200px' }} />
              <Button variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            <Input type="file" accept="image/*" onChange={handleImageUpload} className="cursor-pointer" />
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Answer Options *</Label>
          <Button variant="outline" size="sm" onClick={addOption}>
            <Plus className="w-3 h-3 mr-1" /> Add Option
          </Button>
        </div>
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => (
            <div key={index} className="flex gap-2">
              <button
                onClick={() => updateQuestion(question.id, { correctAnswer: index })}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  question.correctAnswer === index ? 'border-[#10b981] bg-green-50' : 'border-border'
                }`}
              >
                {question.correctAnswer === index && <div className="w-5 h-5 rounded-full bg-[#10b981]" />}
              </button>
              <Input placeholder={`Option ${index + 1}`} value={option} onChange={(e) => updateOption(index, e.target.value)} />
              {question.options.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removeOption(index)} className="flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {explanationField}
    </div>
  );
}

function MultipleChoiceEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  const addOption = () => updateQuestion(question.id, { options: [...question.options, ''] });
  const removeOption = (index: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_: string, i: number) => i !== index);
      const newCorrectAnswers = question.correctAnswers.filter((ans: number) => ans !== index).map((ans: number) => ans > index ? ans - 1 : ans);
      updateQuestion(question.id, { options: newOptions, correctAnswers: newCorrectAnswers });
    }
  };
  const updateOption = (index: number, value: string) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    updateQuestion(question.id, { options: newOptions });
  };
  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = question.correctAnswers.includes(index)
      ? question.correctAnswers.filter((ans: number) => ans !== index)
      : [...question.correctAnswers, index];
    updateQuestion(question.id, { correctAnswers: newCorrectAnswers });
  };
  return (
    <div>
      {commonFields}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Answer Options * (Select all that apply)</Label>
          <Button variant="outline" size="sm" onClick={addOption}><Plus className="w-3 h-3 mr-1" /> Add Option</Button>
        </div>
        <div className="space-y-3">
          {question.options.map((option: string, index: number) => (
            <div key={index} className="flex gap-2">
              <button
                onClick={() => toggleCorrectAnswer(index)}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  question.correctAnswers.includes(index) ? 'border-[#10b981] bg-green-50' : 'border-border'
                }`}
              >
                {question.correctAnswers.includes(index) && <Check className="w-5 h-5 text-[#10b981]" />}
              </button>
              <Input placeholder={`Option ${index + 1}`} value={option} onChange={(e) => updateOption(index, e.target.value)} />
              {question.options.length > 2 && (
                <Button variant="ghost" size="sm" onClick={() => removeOption(index)} className="flex-shrink-0">
                  <Trash2 className="w-4 h-4 text-slate-400" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
      {explanationField}
    </div>
  );
}

function YesNoGridEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  const addStatement = () => updateQuestion(question.id, { statements: [...question.statements, { id: Date.now().toString(), text: '', correctAnswer: null }] });
  const removeStatement = (id: string) => question.statements.length > 1 && updateQuestion(question.id, { statements: question.statements.filter((s: any) => s.id !== id) });
  const updateStatement = (id: string, field: string, value: any) => updateQuestion(question.id, { statements: question.statements.map((s: any) => s.id === id ? { ...s, [field]: value } : s) });
  return (
    <div>
      {commonFields}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Statements *</Label>
          <Button variant="outline" size="sm" onClick={addStatement}><Plus className="w-3 h-3 mr-1" /> Add Statement</Button>
        </div>
        <div className="space-y-3">
          {question.statements.map((statement: any) => (
            <div key={statement.id} className="p-4 border-2 border-border rounded-lg">
              <div className="flex gap-2 mb-3">
                <Textarea placeholder="Statement text" value={statement.text} onChange={(e) => updateStatement(statement.id, 'text', e.target.value)} rows={2} className="flex-1" />
                {question.statements.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeStatement(statement.id)} className="flex-shrink-0"><Trash2 className="w-4 h-4 text-slate-400" /></Button>
                )}
              </div>
              <RadioGroup value={statement.correctAnswer || ''} onValueChange={(value) => updateStatement(statement.id, 'correctAnswer', value)} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id={`${statement.id}-yes`} /><Label htmlFor={`${statement.id}-yes`}>Yes</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id={`${statement.id}-no`} /><Label htmlFor={`${statement.id}-no`}>No</Label></div>
              </RadioGroup>
            </div>
          ))}
        </div>
      </div>
      {explanationField}
    </div>
  );
}

function DragMatchEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  const addPair = () => updateQuestion(question.id, { matchPairs: [...question.matchPairs, { id: Date.now().toString(), term: '', definition: '' }] });
  const removePair = (id: string) => question.matchPairs.length > 1 && updateQuestion(question.id, { matchPairs: question.matchPairs.filter((p: any) => p.id !== id) });
  const updatePair = (id: string, field: string, value: string) => updateQuestion(question.id, { matchPairs: question.matchPairs.map((p: any) => p.id === id ? { ...p, [field]: value } : p) });
  return (
    <div>
      {commonFields}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Match Pairs *</Label>
          <Button variant="outline" size="sm" onClick={addPair}><Plus className="w-3 h-3 mr-1" /> Add Pair</Button>
        </div>
        <div className="space-y-3">
          {question.matchPairs.map((pair: any) => (
            <div key={pair.id} className="p-4 border-2 border-border rounded-lg flex gap-2">
              <Input placeholder="Term" value={pair.term} onChange={(e) => updatePair(pair.id, 'term', e.target.value)} />
              <Input placeholder="Definition" value={pair.definition} onChange={(e) => updatePair(pair.id, 'definition', e.target.value)} />
              {question.matchPairs.length > 1 && <Button variant="ghost" size="sm" onClick={() => removePair(pair.id)}><Trash2 className="w-4 h-4 text-slate-400" /></Button>}
            </div>
          ))}
        </div>
      </div>
      {explanationField}
    </div>
  );
}

function DragClassifyEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  return <div>{commonFields}{explanationField}</div>;
}
function InlineDropdownEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  return <div>{commonFields}{explanationField}</div>;
}
function MatchingDropdownEditor({ question, updateQuestion, commonFields, explanationField }: any) {
  return <div>{commonFields}{explanationField}</div>;
}