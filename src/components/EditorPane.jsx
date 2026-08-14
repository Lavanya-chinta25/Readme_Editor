import { useRef } from 'react';
import Editor from '@monaco-editor/react';

export default function EditorPane({ content, onChange }) {
  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-github-bg">
      <div className="flex items-center px-4 py-2 border-b border-github-border bg-github-canvas h-[45px]">
        <div className="flex gap-2">
          <span className="text-xs font-semibold text-github-muted bg-gray-100 border border-github-border px-2 py-1 rounded-md">
            Markdown
          </span>
        </div>
      </div>
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="markdown"
          theme="light"
          value={content}
          onChange={handleEditorChange}
          options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            fontSize: 14,
            lineHeight: 1.5,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'all',
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          }}
          loading={
            <div className="flex items-center justify-center h-full text-github-muted">
              Loading editor...
            </div>
          }
        />
      </div>
    </div>
  );
}
