import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 


const TextDisplay = ({ content }) => {
  return (
    <div>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default TextDisplay;
