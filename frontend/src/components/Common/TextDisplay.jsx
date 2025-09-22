import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

const TextDisplay = ({ content, isUserMessage = false, forceBlackText = false, fontSize = 16 }) => {
  const textColorClass = isUserMessage ? 'text-white' : forceBlackText ? 'text-black' : 'text-gray-800 dark:text-gray-200';
  const headingColorClass = isUserMessage ? 'text-white' : forceBlackText ? 'text-black' : 'text-gray-900 dark:text-white';
  
  // Simplified preprocessing for better compatibility
  const preprocessContent = (text) => {
    if (!text) return '';
    
    return text
      // Handle standalone <br> tags
      .replace(/<br\s*\/?>/gi, '\n')
      // Clean up excessive whitespace while preserving intentional breaks
      .replace(/\n{3,}/g, '\n\n')
      // Ensure blockquotes have proper spacing
      .replace(/\n>\s*/g, '\n\n> ')
      .trim();
  };
  
  const processedContent = preprocessContent(content);
  
  // More comprehensive check for markdown content
  const hasMarkdown = /[*_`>#\[\]\\]|<\/?[a-z][\s\S]*>/i.test(content);
  
  const markdownComponents = {
    // Paragraph with compact Bengali text support
    p: ({ children }) => (
      <p className={`mb-2 ${textColorClass} leading-relaxed break-words whitespace-pre-wrap w-full max-w-full bengali-text`} 
         style={{ 
           minWidth: 0, 
           maxWidth: '100%', 
           wordBreak: 'break-word', 
           overflowWrap: 'anywhere',
           fontSize: `${fontSize}px`
         }}>
        {children}
      </p>
    ),
    
    // Compact Headings
    h1: ({ children }) => (
      <h1 className={`text-lg font-bold ${headingColorClass} mb-2 break-words bengali-text leading-tight`}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className={`text-base font-bold ${headingColorClass} mb-2 break-words bengali-text leading-tight`}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className={`text-sm font-bold ${headingColorClass} mb-1 break-words bengali-text leading-tight`}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={`text-sm font-bold ${headingColorClass} mb-1 break-words bengali-text leading-tight`}>
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className={`text-xs font-bold ${headingColorClass} mb-1 break-words bengali-text leading-tight`}>
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className={`text-xs font-bold ${headingColorClass} mb-1 break-words bengali-text leading-tight`}>
        {children}
      </h6>
    ),
    
    // Compact Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside mb-2 space-y-0.5 break-words pl-3 bengali-text">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside mb-2 space-y-0.5 break-words pl-3 bengali-text">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className={`${textColorClass} leading-relaxed break-words bengali-text`}
          style={{ fontSize: `${fontSize}px` }}>
        {children}
      </li>
    ),
    
    // Text formatting
    strong: ({ children }) => (
      <strong className={`font-bold ${isUserMessage ? 'text-white' : forceBlackText ? 'text-black' : 'text-gray-900 dark:text-white'} bengali-text break-words`} 
              style={{ wordBreak: 'break-word', fontWeight: '700' }}>
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${isUserMessage ? 'text-white' : forceBlackText ? 'text-black' : 'text-gray-700 dark:text-gray-300'} bengali-text break-words`} 
          style={{ wordBreak: 'break-word', fontStyle: 'italic' }}>
        {children}
      </em>
    ),
    
    // Code
    code: ({ children, className }) => {
      const isInline = !className || !className.includes('language-');
      return isInline ? (
        <code className={`bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono break-all ${forceBlackText ? 'text-black' : 'text-gray-800 dark:text-gray-200'} max-w-full`} 
              style={{ wordBreak: 'break-all', maxWidth: '100%' }}>
          {children}
        </code>
      ) : (
        <code className={`block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto ${forceBlackText ? 'text-black' : 'text-gray-800 dark:text-gray-200'}`}>
          {children}
        </code>
      );
    },
    
    // Pre-formatted text
    pre: ({ children }) => (
      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 overflow-x-auto text-xs font-mono">
        {children}
      </pre>
    ),
    
    // Compact Blockquotes
    blockquote: ({ children }) => (
      <blockquote className={`border-l-2 ${isUserMessage ? 'border-white' : 'border-gray-300 dark:border-gray-600'} pl-2 ${isUserMessage ? 'text-white' : forceBlackText ? 'text-black' : 'text-gray-700 dark:text-gray-300'} mb-2 break-words bengali-text text-sm bg-gray-50 dark:bg-gray-800/50 py-1 rounded-r w-full max-w-full`} 
                  style={{ minWidth: 0, maxWidth: '100%', wordBreak: 'break-word' }}>
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a href={href} 
         className={`underline ${isUserMessage ? 'text-blue-200 hover:text-blue-100' : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'} break-words`}
         target="_blank" 
         rel="noopener noreferrer"
         style={{ wordBreak: 'break-word' }}>
        {children}
      </a>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto mb-2">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className={`border border-gray-300 dark:border-gray-600 px-2 py-1 bg-gray-100 dark:bg-gray-800 font-bold ${headingColorClass} text-left bengali-text text-xs`}>
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className={`border border-gray-300 dark:border-gray-600 px-2 py-1 ${textColorClass} bengali-text text-xs`}>
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="border-t border-gray-300 dark:border-gray-600 my-3" />
    ),
    
    // Line breaks - explicitly handle br tags
    br: () => <br className="block leading-4" />
  };

  // Create a custom sanitize schema that allows br tags
  const sanitizeSchema = {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'id', 'style']
    },
    allowedSchemes: ['http', 'https', 'mailto']
  };
  
  return (
    <div className={`prose prose-sm w-full max-w-full overflow-hidden break-words whitespace-pre-wrap markdown-content ${forceBlackText ? 'text-black' : 'text-gray-800 dark:text-gray-200'}`} 
         style={{ minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
      {hasMarkdown ? (
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            [rehypeSanitize, sanitizeSchema]
          ]}
          components={markdownComponents}
        >
          {processedContent}
        </ReactMarkdown>
      ) : (
        <div className={`${textColorClass} leading-relaxed break-words whitespace-pre-wrap bengali-text text-base w-full max-w-full`} 
             style={{ minWidth: 0, maxWidth: '100%', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          {content}
        </div>
      )}
    </div>
  );
};

export default TextDisplay;
