import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


// Lazy load all route components with proper error handling for React 19
const Login = lazy(() => import('./components/Login/Login'));
const MainPage = lazy(() => import('./components/MainPage/MainPage'));
const SelectSubject = lazy(() => {
  return import('./components/Forms/SelectSubject').then(module => {
          return { default: module.default || module };
  }).catch(error => {
    console.error('🔍 [APP DEBUG] Error loading SelectSubject component:', error);
    throw error;
  });
});
const Quiz = lazy(() => import('./components/Quiz/QuizComponent/Quiz'));
const Ask = lazy(() => import('./components/Quiz/AskQuestionComponent/AskQuestion'));
const Prev = lazy(() => import('./components/Quiz/PrevMistakeComponent/PrevMistake'));
const Note = lazy(() => import('./components/Notes/GenerateNoteComponent/GenerateNote'));
const ShowNote = lazy(() => import('./components/Notes/ShowNotesComponent/ShowNotes'));
const Teacher = lazy(() => import('./components/Teacher/TeacherMainComponent/TeacherMain'));
const FilteredStudentsPage = lazy(() => import('./components/Teacher/FilteredStudentsComponent/FilteredStudentsPage'));
const Intro = lazy(() => import('./components/Intro/Intro'));
const WrittenQuestion = lazy(() => import('./components/Quiz/WrittenQuestionComponent/WrittenQuestion'));
const Learn = lazy(() => import('./components/Learn/Learn'));
const EmailConfirmation = lazy(() => import('./components/Forms/EmailConfirmation'));

// Error Boundary Component for React 19 compatibility
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">Please refresh the page or try again later.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
          
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register/confirmToken" element={<EmailConfirmation />} />
            <Route path="/auth/register/confirmToken" element={<EmailConfirmation />} />
            <Route path="/" element={<Intro />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/select" element={<SelectSubject />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/prev" element={<Prev />} />
            <Route path="/note" element={<Note />} />
            <Route path="/shownotes" element={<ShowNote />} />
            <Route path="/written-question" element={<WrittenQuestion />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/teacher" element={<Teacher />} />
            <Route path="/teacher/students" element={<FilteredStudentsPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
