import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 


const TextDisplay = ({ content, isUserMessage = false }) => {
  const textColorClass = isUserMessage ? 'text-white' : 'text-gray-800 dark:text-gray-200';
  const headingColorClass = isUserMessage ? 'text-white' : 'text-gray-900 dark:text-white';
  
  return (
    <div className="prose prose-sm max-w-none overflow-hidden break-words whitespace-pre-wrap overflow-wrap-anywhere">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Override paragraph styling
          p: ({ children }) => (
            <p className={`mb-4 ${textColorClass} leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere`}>
              {children}
            </p>
          ),
          // Override heading styling
          h1: ({ children }) => (
            <h1 className={`text-2xl font-bold ${headingColorClass} mb-4 break-words`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-xl font-bold ${headingColorClass} mb-3 break-words`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-lg font-bold ${headingColorClass} mb-2 break-words`}>
              {children}
            </h3>
          ),
          // Override list styling
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 break-words">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 break-words">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`${textColorClass} leading-relaxed break-words`}>
              {children}
            </li>
          ),
          // Override code styling
          code: ({ children }) => (
            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono break-all text-gray-800 dark:text-gray-200">
              {children}
            </code>
          ),
          // Override blockquote styling
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 ${isUserMessage ? 'border-white' : 'border-gray-300 dark:border-gray-600'} pl-4 italic ${isUserMessage ? 'text-white' : 'text-gray-700 dark:text-gray-300'} mb-4 break-words`}>
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default TextDisplay;
