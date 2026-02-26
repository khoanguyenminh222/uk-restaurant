'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css'; // Use react-quill-new if possible or react-quill

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
});

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list',
    'link'
];

export default function RichTextEditor({ value, onChange, placeholder }) {
    const handleChange = (content, delta, source) => {
        if (source === 'user') {
            onChange(content);
        }
    };

    return (
        <div className="rich-text-editor">
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="bg-input rounded-lg overflow-hidden border border-border"
            />
            <style jsx global>{`
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background: var(--muted);
          border-color: var(--border) !important;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          min-height: 250px;
          font-family: inherit;
          border-color: var(--border) !important;
        }
        .rich-text-editor .ql-editor {
          min-height: 250px;
          font-size: 0.875rem;
          color: var(--foreground);
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: var(--muted-foreground);
          font-style: normal;
        }
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: var(--foreground);
        }
        .rich-text-editor .ql-snow .ql-fill {
          fill: var(--foreground);
        }
        .rich-text-editor .ql-snow .ql-picker {
          color: var(--foreground);
        }
        .rich-text-editor .ql-snow .ql-picker-options {
          background-color: var(--card);
          border-color: var(--border);
        }
      `}</style>
        </div>
    );
}
