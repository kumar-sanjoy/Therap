import React from 'react';
import { GrNotes } from 'react-icons/gr';
import { useDarkTheme } from '../../Common/DarkThemeProvider';
import QuizInfo from './QuizInfo';
import ActionButtons from './ActionButtons';
import QuestionDisplay from './QuestionDisplay';

const QuizContent = ({
    quizInfo,
    question,
    currentIndex,
    totalQuestions,
    options,
    lock,
    onCheckAnswer,
    onShowHint,
    onShowExplanation,
    onShowAdvice,
    onHighlightAnswer,
    onNext,
    showHint,
    showExplanation,
    showAdvice,
    isCorrect,
    isIncorrectAnswer
}) => {
    const { isDarkMode } = useDarkTheme();

    return (
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-2">
            <div className={`w-full max-w-2xl mx-auto rounded-2xl shadow-xl border p-0 md:p-0 mt-8 overflow-hidden ${
                isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-100'
            }`}>
                <QuizInfo quizInfo={quizInfo} />
                <div className="p-8">
                    <ActionButtons
                        currentIndex={currentIndex}
                        totalQuestions={totalQuestions}
                        questionData={question}
                        isQuestionAnswered={lock}
                        showHint={showHint}
                        showExplanation={showExplanation}
                        showAdvice={showAdvice}
                        onShowHint={onShowHint}
                        onShowExplanation={onShowExplanation}
                        onShowAdvice={onShowAdvice}
                        isIncorrectAnswer={isIncorrectAnswer}
                    />

                    <QuestionDisplay
                        question={question}
                        currentIndex={currentIndex}
                        options={options}
                        onCheckAnswer={onCheckAnswer}
                        showHint={showHint}
                        showExplanation={showExplanation}
                        showAdvice={showAdvice}
                        isQuestionAnswered={lock}
                        isCorrect={false}
                        onShowHint={onShowHint}
                        onShowExplanation={onShowExplanation}
                        onShowAdvice={onShowAdvice}
                    />

                    <button 
                        className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode 
                                ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                : 'bg-[#343434] hover:bg-gray-800 text-white'
                        }`} 
                        onClick={onNext} 
                        disabled={!lock}
                    >
                        {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default QuizContent;
