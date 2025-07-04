import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import MainPage from './components/MainPage';
import SelectSubject from './components/SelectSubject';
import Quiz from './components/Quiz';
import Ask from './components/AskQuestion';
import Prev from './components/PrevMistake';
import Note from './components/GenerateNote'
import ShowNote from './components/ShowNotes'
import Teacher from './components/TeacherMain'
import Intro from './components/Intro/Intro'
import WrittenQuestion from './components/WrittenQuestion';
import Learn from './components/Learn';

// Theme wrapper component
const ThemeWrapper = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-[#343434] antialiased">
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeWrapper>
        <Routes>
          <Route path="/login" element={<Login />} />
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
        </Routes>
      </ThemeWrapper>
    </Router>
  );
}

export default App;
