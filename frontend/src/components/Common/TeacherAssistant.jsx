import React, { useState, useEffect } from 'react';
import { useDarkTheme } from './DarkThemeProvider';
import { MessageCircle, X, Lightbulb, BookOpen, Target, HelpCircle, TrendingUp } from 'lucide-react';
import { FaLightbulb } from 'react-icons/fa';
import { GrNotes } from 'react-icons/gr';
import TeacherAvatar from './TeacherAvatar';
import teacherImage from '../../assets/teacher.jpg';
import { AnimatedEntrance, FloatingParticles } from './AnimatedComponents';

const TeacherAssistant = ({ 
  context = 'quiz', // 'quiz' or 'learn'
  currentQuestion = null,
  currentSection = null,
  onClose = null,
  // New props for dynamic status updates
  studentAnswer = null,
  isCorrect = null,
  isQuestionAsked = false,
  isLearning = false,
  progress = 0,
  notificationCount = 0,
  showHint = false,
  showExplanation = false,
  // New props for interactive teacher
  questionData = null,
  onShowHint = null,
  onShowExplanation = null,
  isQuestionAnswered = false,
  onShowAdvice = null,
  showAdvice = false,
  isIncorrectAnswer = false,
  // New prop to control floating avatar visibility
  showFloatingAvatar = false
}) => {
  const { isDarkMode } = useDarkTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null);
  
  // Avatar state management
  const [avatarStatus, setAvatarStatus] = useState('online');
  const [avatarMood, setAvatarMood] = useState('friendly');
  const [showNotification, setShowNotification] = useState(false);

  // Randomized messages for different scenarios - moved before getRandomMessage function
  const messages = {
    main: [
      "Welcome back! Ready to continue your learning journey? 🚀",
      "Great to see you! What would you like to work on today? 💡",
      "Hello! I'm here to help you succeed! 🌟",
      "Welcome! Let's make today a productive learning day! 📚",
      "Hi there! Ready to tackle some challenges? 💪",
      "Welcome back! Your learning adventure awaits! 🗺️",
      "Hello! I'm excited to help you grow! 🌱",
      "Welcome! Let's unlock your full potential today! 🔓",
      "Hi! I believe in your ability to succeed! ⭐",
      "Welcome back! Together we can achieve great things! 🤝"
    ],
    correct: [
      "Excellent work! 🎉",
      "Perfect! You're on fire! 🔥",
      "Brilliant answer! 🌟",
      "Outstanding! Keep it up! 💪",
      "Fantastic! You're learning so well! 🚀",
      "Amazing! You've got this! ⭐",
      "Superb! You're making great progress! 🎯",
      "Wonderful! Your hard work is paying off! 🌈",
      "Incredible! You're absolutely crushing it! 🏆",
      "Bravo! That's the spirit! 🎊"
    ],
    incorrect: [
      "Don't worry, mistakes help us learn! 💡",
      "That's okay! Let's try again together! 🤝",
      "Great effort! Every attempt brings you closer! 🌱",
      "No problem! Learning is a journey! 🛤️",
      "Keep going! You're getting better each time! 📈",
      "That's part of learning! You've got this! 💪",
      "Don't give up! You're doing great! 🌟",
      "Mistakes are stepping stones to success! 🧱",
      "You're on the right track! Let's figure this out! 🔍",
      "Stay positive! You're learning valuable lessons! 📚"
    ],
    questionAsked: [
      "Great question! Let me help you! 🤔",
      "Excellent thinking! I love your curiosity! 💭",
      "That's a smart question! Let's explore it! 🔍",
      "Wonderful! Asking questions shows you're engaged! 🎯",
      "Perfect! That's exactly what we need to discuss! 💡",
      "Brilliant! Your question shows deep thinking! 🧠",
      "Amazing! Let's dive into this together! 🌊",
      "Fantastic question! You're really thinking critically! 🎪",
      "Outstanding! That's the kind of question that leads to learning! 🚀",
      "Superb! Your curiosity is inspiring! ✨"
    ],
    learning: [
      "You're doing amazing! Keep going! 🌟",
      "Fantastic progress! You're on fire! 🔥",
      "Wonderful! Your dedication is inspiring! 💪",
      "Excellent! You're mastering this! 🎯",
      "Brilliant! Keep up the great work! ⭐",
      "Outstanding! You're learning so well! 🚀",
      "Amazing! Your hard work is paying off! 🏆",
      "Superb! You're making incredible progress! 🌈",
      "Incredible! You're absolutely crushing it! 💎",
      "Bravo! Your learning journey is inspiring! 🎊"
    ],
    completed: [
      "Congratulations! You've completed this section! 🎉",
      "Fantastic! You've mastered this content! 🏆",
      "Amazing! You've reached a new milestone! 🌟",
      "Outstanding! You've conquered this challenge! 💪",
      "Brilliant! You've successfully completed this! ⭐",
      "Wonderful! You've achieved another goal! 🎯",
      "Superb! You've finished this section with flying colors! 🚀",
      "Incredible! You've completed this successfully! 🌈",
      "Bravo! You've mastered this material! 💎",
      "Excellent! You've reached the finish line! 🎊"
    ],
    hintUsed: [
      "Great! You used a hint - that's smart thinking! 💡",
      "Perfect! Hints are there to help you learn! 🎯",
      "Excellent! You're using your resources wisely! 🧠",
      "Brilliant! That's exactly how to use hints effectively! ⭐",
      "Wonderful! You're learning the right way! 🌟",
      "Amazing! Using hints shows good problem-solving! 🚀",
      "Outstanding! You're making the most of your learning tools! 💪",
      "Superb! That's the kind of strategic thinking I love! 🎊",
      "Incredible! You're mastering the art of learning! 🏆",
      "Bravo! You're using hints like a pro! 🌈"
    ],
    explanationUsed: [
      "Perfect! You're seeking deeper understanding! 🧠",
      "Excellent! Explanations help build strong foundations! 🏗️",
      "Brilliant! You're going beyond just the answer! 💡",
      "Wonderful! Understanding the 'why' is crucial! 🎯",
      "Amazing! You're building lasting knowledge! 🌟",
      "Outstanding! That's how you truly master concepts! 💪",
      "Superb! You're developing critical thinking skills! 🚀",
      "Incredible! You're becoming a deep learner! 🎊",
      "Fantastic! You're building a strong knowledge base! 🏆",
      "Bravo! You're learning the right way! 🌈"
    ],
    adviceGiven: [
      "Let me give you some helpful advice! 💡",
      "Here's some advice to help you improve! 🎯",
      "I have some advice that might help! 🧠",
      "Let me share some advice with you! 🌟",
      "Here's some advice to guide you! 💪",
      "I want to give you some helpful advice! 🚀",
      "Let me offer you some advice! 🎊",
      "Here's some advice to support your learning! 🌈",
      "I have some advice that could help! 💎",
      "Let me provide you with some advice! 🏆"
    ],
    askingForHint: [
      "Do you need a hint to help you with this question? 🤔",
      "Would you like me to give you a little hint? 💡",
      "Are you stuck? I can provide a helpful hint! 🎯",
      "Need some guidance? I'm here to help with a hint! 🧠",
      "Would a hint help you figure this out? 🌟",
      "Let me know if you'd like a hint to get started! 💪",
      "Are you finding this challenging? I can offer a hint! 🚀",
      "Need a little push in the right direction? 💡",
      "Would you like me to give you a helpful hint? 🎊",
      "I'm here to help! Would you like a hint? 🌈"
    ],
    askingForExplanation: [
      "Would you like me to explain the answer? 🧠",
      "Should I show you why this is the correct answer? 💡",
      "Would you like me to explain the reasoning? 🎯",
      "Let me know if you want to understand why this is correct! 🌟",
      "Would you like me to walk you through the explanation? 💪",
      "Should I explain the logic behind this answer? 🚀",
      "Would you like me to break down why this is right? 🎊",
      "Let me know if you want the full explanation! 🌈",
      "Would you like me to explain the concept? 💎",
      "Should I show you the detailed explanation? 🏆"
    ],
    default: [
      "Ready to help you succeed! 💪",
      "I'm here to guide your learning journey! 🌟",
      "Let's make learning fun and effective! 🎯",
      "Your success is my priority! 🚀",
      "Together we can achieve great things! 🤝",
      "I believe in your potential! ⭐",
      "Let's unlock your full potential! 🔓",
      "Your learning adventure awaits! 🗺️",
      "I'm excited to help you grow! 🌱",
      "Let's make today a learning breakthrough! 💡"
    ],
    motivational: [
      "Focus on the question, you've got this! 🎯",
      "Take a deep breath and think clearly! 🌬️",
      "Every question is an opportunity to learn! 📚",
      "Trust your knowledge, you're prepared! 💪",
      "Stay calm and read carefully! 🧘‍♀️",
      "You have the power to solve this! ⚡",
      "Think step by step, you'll find the answer! 🧠",
      "Your brain is amazing - use it! 🌟",
      "This is your moment to shine! ✨",
      "Believe in yourself, you can do this! 🚀",
      "Take your time, accuracy matters! ⏰",
      "You're smarter than you think! 🎓",
      "Every challenge makes you stronger! 💎",
      "Focus on what you know! 🎯",
      "You're on the right track! 🛤️",
      "Keep your mind sharp and alert! 🔥",
      "This is where learning happens! 📖",
      "You have the tools to succeed! 🛠️",
      "Stay positive, stay focused! 🌈",
      "Your potential is limitless! 🌌"
    ],
    quiz: [
      "💡 Tip: Read each question carefully and look for keywords that might give you clues about the answer.",
      "🎯 Tip: If you're unsure, try eliminating the obviously wrong answers first. This increases your chances of getting it right.",
      "🧠 Tip: Don't hesitate to use hints when you're stuck. They're there to help you learn, not just to get the answer.",
      "📝 Tip: Before submitting, take a moment to review your answers. Trust your instincts but double-check your reasoning.",
      "🔍 Tip: Take your time to read each question thoroughly. Look for keywords that might give you clues about the answer.",
      "⚡ Tip: Process of elimination is your friend - cross out obviously wrong answers first!",
      "🎪 Tip: Stay focused and don't rush. Accuracy is more important than speed.",
      "🌟 Tip: Every question is a learning opportunity, even if you get it wrong.",
      "💪 Tip: Trust your knowledge and instincts. You've prepared for this!",
      "🚀 Tip: Use the hints wisely - they're designed to guide your thinking, not just give you the answer."
    ]
  };

  // Function to get random message - moved before useState to avoid temporal dead zone
  const getRandomMessage = (messageType) => {
    let messageArray = messages[messageType];
    
    // For quiz context, use learning tips as default instead of regular default messages
    if (!messageArray && context === 'quiz') {
      messageArray = messages.quiz;
    }
    
    // For main context, use main messages as default
    if (!messageArray && context === 'main') {
      messageArray = messages.main;
    }
    
    // Fallback to default messages if no specific type or not in quiz/main context
    if (!messageArray) {
      messageArray = messages.default;
    }
    
    return messageArray[Math.floor(Math.random() * messageArray.length)];
  };

  const [currentMessage, setCurrentMessage] = useState(() => {
    // Initialize with appropriate message based on context
    if (context === 'quiz') {
      const learningTips = [
        "💡 Tip: Read each question carefully and look for keywords that might give you clues about the answer.",
        "🎯 Tip: If you're unsure, try eliminating the obviously wrong answers first. This increases your chances of getting it right.",
        "🧠 Tip: Don't hesitate to use hints when you're stuck. They're there to help you learn, not just to get the answer.",
        "📝 Tip: Before submitting, take a moment to review your answers. Trust your instincts but double-check your reasoning.",
        "🔍 Tip: Take your time to read each question thoroughly. Look for keywords that might give you clues about the answer."
      ];
      return learningTips[Math.floor(Math.random() * learningTips.length)];
    } else if (context === 'main') {
      return getRandomMessage('main');
    }
    return 'AI Teacher';
  });

  // Interactive teacher state
  const [showTeacherQuestion, setShowTeacherQuestion] = useState(false);
  const [teacherQuestion, setTeacherQuestion] = useState('');
  const [showTeacherResponse, setShowTeacherResponse] = useState(false);
  const [teacherResponse, setTeacherResponse] = useState('');
  const [questionTimer, setQuestionTimer] = useState(null);
  const [hasAskedForHint, setHasAskedForHint] = useState(false);
  const [hasAskedForExplanation, setHasAskedForExplanation] = useState(false);





  // Update avatar status based on props and events
  useEffect(() => {
    if (isQuestionAsked) {
      setAvatarStatus('thinking');
      setAvatarMood('excited');
      setCurrentMessage(getRandomMessage('questionAsked'));
      // Reset after 3 seconds
      setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 3000);
    }
  }, [isQuestionAsked]);

  // Handle correct/incorrect answers
  useEffect(() => {
    if (isCorrect !== null) {
      if (isCorrect) {
        setAvatarStatus('speaking');
        setAvatarMood('excited');
        setShowNotification(true);
        setCurrentMessage(getRandomMessage('correct'));
        // Reset after 4 seconds
        setTimeout(() => {
          setAvatarStatus('online');
          setAvatarMood('friendly');
          setShowNotification(false);
          setCurrentMessage(getRandomMessage('default'));
        }, 4000);
      } else {
        setAvatarStatus('thinking');
        setAvatarMood('encouraging');
        setCurrentMessage(getRandomMessage('incorrect'));
        // Reset after 3 seconds
        setTimeout(() => {
          setAvatarStatus('online');
          setAvatarMood('friendly');
          setCurrentMessage(getRandomMessage('default'));
        }, 3000);
      }
    }
  }, [isCorrect]);

  // Handle learning progress
  useEffect(() => {
    if (isLearning) {
      setAvatarStatus('thinking');
      setAvatarMood('encouraging');
      setCurrentMessage(getRandomMessage('learning'));
    } else if (progress > 0 && progress < 100) {
      setAvatarStatus('online');
      setAvatarMood('friendly');
      setCurrentMessage(getRandomMessage('default'));
    } else if (progress >= 100) {
      setAvatarStatus('speaking');
      setAvatarMood('excited');
      setShowNotification(true);
      setCurrentMessage(getRandomMessage('completed'));
      // Reset after 5 seconds
      setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setShowNotification(false);
        setCurrentMessage(getRandomMessage('default'));
      }, 5000);
    }
  }, [isLearning, progress]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      setAvatarStatus('speaking');
      setAvatarMood('friendly');
      setCurrentMessage("Let me help you with some tips! 💡");
    } else {
      setAvatarStatus('online');
      setAvatarMood('friendly');
      setCurrentMessage(getRandomMessage('default'));
    }
  }, [isOpen]);

  // Handle hint usage
  useEffect(() => {
    if (showHint) {
      setAvatarStatus('thinking');
      setAvatarMood('encouraging');
      setCurrentMessage(getRandomMessage('hintUsed'));
      // Reset after 3 seconds
      setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 3000);
    }
  }, [showHint]);

  // Handle explanation usage
  useEffect(() => {
    if (showExplanation) {
      setAvatarStatus('speaking');
      setAvatarMood('friendly');
      setCurrentMessage(getRandomMessage('explanationUsed'));
      // Reset after 4 seconds
      setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 4000);
    }
  }, [showExplanation]);

  // Handle advice usage
  useEffect(() => {
    if (showAdvice) {
      setAvatarStatus('speaking');
      setAvatarMood('encouraging');
      setCurrentMessage(getRandomMessage('adviceGiven'));
      // Reset after 5 seconds
      setTimeout(() => {
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 5000);
    }
  }, [showAdvice]);

  // Handle incorrect answers in prev mistake section
  useEffect(() => {
    if (context === 'quiz' && isIncorrectAnswer && questionData?.advice) {
      // Show advice automatically after 2 seconds for incorrect answers
      const timer = setTimeout(() => {
        setAvatarStatus('speaking');
        setAvatarMood('encouraging');
        setCurrentMessage("Let me give you some advice to help you improve! 💡");
        
        // Call the advice function if provided
        if (onShowAdvice) {
          onShowAdvice();
        }

        // Reset after 6 seconds
        setTimeout(() => {
          setAvatarStatus('online');
          setAvatarMood('friendly');
          setCurrentMessage(getRandomMessage('default'));
        }, 6000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [context, isIncorrectAnswer, questionData?.advice, onShowAdvice]);

  // Interactive teacher logic - ask for hint after 17 seconds
  useEffect(() => {
    if (context === 'quiz' && questionData && !hasAskedForHint && !isQuestionAnswered) {
      // Clear any existing timer
      if (questionTimer) {
        clearTimeout(questionTimer);
      }

      // Set timer to ask for hint after 17 seconds
      const timer = setTimeout(() => {
        setShowTeacherQuestion(true);
        setTeacherQuestion(getRandomMessage('askingForHint'));
        setAvatarStatus('thinking');
        setAvatarMood('encouraging');
        setCurrentMessage(getRandomMessage('askingForHint'));
      }, 17000); // 17 seconds

      setQuestionTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [context, questionData, hasAskedForHint, isQuestionAnswered]);

  // Interactive teacher logic - ask for explanation after question is answered
  useEffect(() => {
    if (context === 'quiz' && isQuestionAnswered && !hasAskedForExplanation) {
      // Clear any existing timer
      if (questionTimer) {
        clearTimeout(questionTimer);
      }

      // Ask for explanation after 3 seconds
      const timer = setTimeout(() => {
        setShowTeacherQuestion(true);
        setTeacherQuestion(getRandomMessage('askingForExplanation'));
        setAvatarStatus('speaking');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('askingForExplanation'));
      }, 3000); // 3 seconds

      setQuestionTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [context, isQuestionAnswered, hasAskedForExplanation]);

  // Reset teacher state when question changes
  useEffect(() => {
    if (questionData) {
      setHasAskedForHint(false);
      setHasAskedForExplanation(false);
      setShowTeacherQuestion(false);
      setShowTeacherResponse(false);
      if (questionTimer) {
        clearTimeout(questionTimer);
        setQuestionTimer(null);
      }
    }
  }, [questionData]);

  // Handle teacher question responses
  const handleTeacherQuestionResponse = (response) => {
    setShowTeacherQuestion(false);
    
    if (response === 'hint') {
      setHasAskedForHint(true);
      setShowTeacherResponse(true);
      setTeacherResponse(questionData?.hint || "Here's a helpful hint to guide you!");
      setAvatarStatus('speaking');
      setAvatarMood('encouraging');
      setCurrentMessage("Here's your hint! 💡");
      
      // Call the hint function if provided
      if (onShowHint) {
        onShowHint();
      }

      // Hide response after 5 seconds
      setTimeout(() => {
        setShowTeacherResponse(false);
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 5000);
    } else if (response === 'explanation') {
      setHasAskedForExplanation(true);
      setShowTeacherResponse(true);
      setTeacherResponse(questionData?.explanation || "Let me explain why this is the correct answer!");
      setAvatarStatus('speaking');
      setAvatarMood('friendly');
      setCurrentMessage("Here's the explanation! 🧠");
      
      // Call the explanation function if provided
      if (onShowExplanation) {
        onShowExplanation();
      }

      // Hide response after 6 seconds
      setTimeout(() => {
        setShowTeacherResponse(false);
        setAvatarStatus('online');
        setAvatarMood('friendly');
        setCurrentMessage(getRandomMessage('default'));
      }, 6000);
    } else if (response === 'no') {
      setAvatarStatus('online');
      setAvatarMood('friendly');
      setCurrentMessage("No problem! I'm here if you need me! 💪");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setCurrentMessage(getRandomMessage('default'));
      }, 3000);
    }
  };

  const tips = {
    main: [
      {
        icon: <Target className="w-5 h-5" />,
        title: "Set Daily Goals",
        content: "Start each day by setting small, achievable learning goals. This helps you stay focused and motivated."
      },
      {
        icon: <BookOpen className="w-5 h-5" />,
        title: "Mix Your Subjects",
        content: "Try to work on different subjects each day. This keeps your learning fresh and prevents burnout."
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Track Your Progress",
        content: "Regularly review your stats and progress. Celebrate your improvements and identify areas to focus on."
      },
      {
        icon: <Lightbulb className="w-5 h-5" />,
        title: "Take Breaks",
        content: "Don't forget to take short breaks between study sessions. Your brain needs time to process and retain information."
      }
    ],
    quiz: [
      {
        icon: <Target className="w-5 h-5" />,
        title: "Read Carefully",
        content: "Take your time to read each question thoroughly. Look for keywords that might give you clues about the answer."
      },
      {
        icon: <Lightbulb className="w-5 h-5" />,
        title: "Process of Elimination",
        content: "If you're unsure, try eliminating the obviously wrong answers first. This increases your chances of getting it right."
      },
      {
        icon: <HelpCircle className="w-5 h-5" />,
        title: "Use Hints Wisely",
        content: "Don't hesitate to use hints when you're stuck. They're there to help you learn, not just to get the answer."
      },
      {
        icon: <BookOpen className="w-5 h-5" />,
        title: "Review Your Work",
        content: "Before submitting, take a moment to review your answers. Trust your instincts but double-check your reasoning."
      }
    ],
    learn: [
      {
        icon: <BookOpen className="w-5 h-5" />,
        title: "Active Reading",
        content: "Don't just read passively. Try to summarize each section in your own words to better understand the material."
      },
      {
        icon: <MessageCircle className="w-5 h-5" />,
        title: "Ask Questions",
        content: "If something isn't clear, use the question feature. Asking questions helps solidify your understanding."
      },
      {
        icon: <Target className="w-5 h-5" />,
        title: "Take Notes",
        content: "Jot down key points as you read. This helps with retention and makes review easier later."
      },
      {
        icon: <Lightbulb className="w-5 h-5" />,
        title: "Connect Concepts",
        content: "Try to relate new information to what you already know. Making connections helps with long-term memory."
      }
    ]
  };

  const currentTips = tips[context];

  const handleTeacherClick = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTip(null);
    if (onClose) onClose();
  };

  const getContextualMessage = () => {
    if (context === 'quiz' && currentQuestion) {
      return `Working on question ${currentQuestion}? Let me help you with some strategies!`;
    } else if (context === 'learn' && currentSection) {
      return `Reading section ${currentSection}? Here are some tips to make the most of your learning!`;
    } else if (context === 'main') {
      return "Welcome to your learning dashboard! Here are some tips to make the most of your study time!";
    }
    return "Need some guidance? I'm here to help you succeed!";
  };

  // Get notification count based on various events
  const getNotificationCount = () => {
    if (showNotification) return 1;
    if (notificationCount > 0) return notificationCount;
    return 0;
  };

  return (
    <>
      {/* Enhanced Teacher Avatar with dynamic status and messages - only show if showFloatingAvatar is true */}
      {showFloatingAvatar && (
        <TeacherAvatar 
          size="large"
          position="bottom-right"
          showName={true}
          isInteractive={true}
          onClick={handleTeacherClick}
          status={avatarStatus}
          mood={avatarMood}
          notificationCount={getNotificationCount()}
          showTooltip={true}
          customMessage={currentMessage}
        />
      )}

      {/* Teacher Avatar for QuizInfo area - always show when not floating */}
      {!showFloatingAvatar && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <TeacherAvatar 
            size="small"
            showName={false}
            isInteractive={true}
            onClick={handleTeacherClick}
            status={avatarStatus}
            mood={avatarMood}
            notificationCount={getNotificationCount()}
            showTooltip={true}
            customMessage={currentMessage}
          />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {currentMessage}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Teacher Question Modal */}
      {showTeacherQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-md mx-auto rounded-2xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            {/* Header */}
            <div className={`flex items-center gap-4 p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                <img 
                  src={teacherImage} 
                  alt="AI Teacher" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold">Your AI Teacher</h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {teacherQuestion}
                </p>
              </div>
            </div>

            {/* Response Buttons */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => handleTeacherQuestionResponse('hint')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                }`}
              >
                <FaLightbulb className="text-yellow-500" />
                Yes, I need a hint! 💡
              </button>
              
              {isQuestionAnswered && (
                <button
                  onClick={() => handleTeacherQuestionResponse('explanation')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    isDarkMode 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  <GrNotes className="text-blue-500" />
                  Yes, explain the answer! 🧠
                </button>
              )}
              
              <button
                onClick={() => handleTeacherQuestionResponse('no')}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  isDarkMode 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                No, I'm good! 💪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Teacher Response Modal */}
      {showTeacherResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative w-full max-w-lg mx-auto rounded-2xl shadow-2xl ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            {/* Header */}
            <div className={`flex items-center gap-4 p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                <img 
                  src={teacherImage} 
                  alt="AI Teacher" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold">Your AI Teacher</h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Here to help you learn! 🌟
                </p>
              </div>
            </div>

            {/* Response Content */}
            <div className="p-6">
              <div className={`p-4 rounded-xl ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <p className="text-sm leading-relaxed">
                  {teacherResponse}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Assistant Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <FloatingParticles count={8} color="indigo" />
          <AnimatedEntrance direction="up" delay={100}>
            <div className={`relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                  <img 
                    src={teacherImage} 
                    alt="AI Teacher" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Your AI Teacher</h2>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {getContextualMessage()}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {selectedTip ? (
                // Show selected tip detail
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedTip(null)}
                    className={`flex items-center gap-2 text-sm font-medium ${
                      isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                    }`}
                  >
                    ← Back to all tips
                  </button>
                  <div className={`p-6 rounded-xl ${
                    isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'
                  }`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-indigo-600' : 'bg-indigo-100'
                      }`}>
                        {selectedTip.icon}
                      </div>
                      <h3 className="text-lg font-semibold">{selectedTip.title}</h3>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {selectedTip.content}
                    </p>
                  </div>
                </div>
              ) : (
                // Show all tips
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Learning Tips</h3>
                  <div className="grid gap-4">
                    {currentTips.map((tip, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTip(tip)}
                        className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                          isDarkMode 
                            ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            isDarkMode ? 'bg-indigo-600' : 'bg-indigo-100'
                          }`}>
                            {tip.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold">{tip.title}</h4>
                            <p className={`text-sm mt-1 ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {tip.content.substring(0, 80)}...
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className={`text-center text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Remember: Learning is a journey, not a destination. Keep going! 💪
              </div>
            </div>
          </div>
            </AnimatedEntrance>
        </div>
      )}
    </>
  );
};

export default TeacherAssistant;
