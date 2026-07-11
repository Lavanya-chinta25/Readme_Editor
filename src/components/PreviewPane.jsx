import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

export default function PreviewPane({ content }) {
  return (
    <div className="h-full w-full flex flex-col bg-[#0d1117] border-l border-github-border overflow-hidden">
      <div className="flex items-center px-4 py-2 border-b border-github-border bg-[#161b22] h-[45px]">
        <span className="text-sm font-semibold text-github-text">Preview</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-[#0d1117]">
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-8 w-full">
          <div className="markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeHighlight]}
            >
              {content || '*No content provided*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
