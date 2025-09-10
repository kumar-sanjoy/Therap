import React from 'react';
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
    onHighlightAnswer,
    onNext,
    onSubmitQuiz,
    showHint,
    showExplanation,
    isSubmitting,
    isCorrect,
    hintTaken
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
                        onShowHint={onShowHint}
                        onShowExplanation={onShowExplanation}
                        isCorrect={isCorrect}
                    />

                    <QuestionDisplay
                        question={question}
                        currentIndex={currentIndex}
                        options={options}
                        onCheckAnswer={onCheckAnswer}
                        showHint={showHint}
                        showExplanation={showExplanation}
                        isQuestionAnswered={lock}
                        isCorrect={isCorrect}
                        onShowHint={onShowHint}
                        onShowExplanation={onShowExplanation}
                        hintTaken={hintTaken}
                    />

                    <button 
                        className={`px-6 py-3 font-medium rounded-lg transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDarkMode 
                                ? 'bg-white hover:bg-gray-100 text-gray-900' 
                                : 'bg-[#343434] hover:bg-gray-800 text-white'
                        }`} 
                        onClick={currentIndex === totalQuestions - 1 ? onSubmitQuiz : onNext} 
                        disabled={!lock}
                    >
                        {currentIndex === totalQuestions - 1 
                            ? 'Submit Quiz' 
                            : 'Next'
                        }
                    </button>
                </div>
            </div>
        </main>
    );
};

export default QuizContent;
