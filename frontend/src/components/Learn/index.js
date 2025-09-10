// Main Learn component
export { default as Learn } from './Learn';

// Individual components
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as MainContent } from './MainContent';
export { default as QuestionInput } from './QuestionInput';
export { default as CompletionModal } from './CompletionModal';

// Utilities - explicit exports for React 19 compatibility
export { formatTime, calculateProgressPercentage, checkAuthAndRole, parseAIResponse } from './utils';
