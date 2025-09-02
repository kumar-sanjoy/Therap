import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test console logging at app level
console.log('🚨 TEST: App component is loading!');
console.warn('⚠️ TEST: App warning message');
console.error('❌ TEST: App error message');

// Lazy load all route components
const Login = lazy(() => import('./components/Login/Login'));
const MainPage = lazy(() => import('./components/MainPage/MainPage'));
const SelectSubject = lazy(() => {
  console.log('🔍 [APP DEBUG] Loading SelectSubject component...');
  return import('./components/Forms/SelectSubject').then(module => {
    console.log('🔍 [APP DEBUG] SelectSubject component loaded successfully');
    return module;
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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  console.log('🔍 [APP DEBUG] App component rendering');
  console.log('🔍 [APP DEBUG] Current window location:', window.location.pathname);
  
  return (
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
  );
}

export default App;
