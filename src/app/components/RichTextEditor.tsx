// src/app/components/RichTextEditor.tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
// --- Import các extension cho bảng ---
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
// ------------------------------------
import { useCallback, useState } from 'react';

// --- Main Editor Component ---
export default function RichTextEditor({
  initialContent,
  onChange,
}: {
  initialContent?: string;
  onChange: (html: string) => void;
}) {
  const [, setForceRenderKey] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      // --- Thêm các extension của bảng vào đây ---
      Table.configure({
        resizable: true, // Cho phép thay đổi kích thước cột
      }),
      TableRow,
      TableHeader,
      TableCell,
      // ------------------------------------------
    ],
    content: initialContent || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none prose-sm sm:prose-base p-4 focus:outline-none min-h-[250px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: () => {
      setForceRenderKey(key => key + 1);
    },
  });

  const getButtonClass = useCallback((isActive: boolean) =>
    `px-3 py-1 border border-gray-300 rounded-md text-sm font-medium transition-colors
    ${isActive ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}
    disabled:opacity-50 disabled:cursor-not-allowed`,
  []);
  
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg shadow-sm bg-white">
      {/* --- Toolbar --- */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap items-center gap-2 bg-gray-50">
        {/* Các nút cũ */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={getButtonClass(editor.isActive('bold'))}><strong>B</strong></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={getButtonClass(editor.isActive('italic'))}><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={getButtonClass(editor.isActive('strike'))}><s>S</s></button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={getButtonClass(editor.isActive('paragraph'))}>P</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={getButtonClass(editor.isActive('heading', { level: 1 }))}>H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass(editor.isActive('heading', { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={getButtonClass(editor.isActive('heading', { level: 3 }))}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={getButtonClass(editor.isActive('bulletList'))}>Bullet List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={getButtonClass(editor.isActive('orderedList'))}>Ordered List</button>
        
        {/* --- Các nút mới cho bảng --- */}
        <button type="button" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className={getButtonClass(false)}>Insert Table</button>
        <button type="button" onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()} className={getButtonClass(false)}>Add Column Before</button>
        <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()} className={getButtonClass(false)}>Add Row After</button>
        <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()} className={getButtonClass(false)}>Delete Table</button>
        {/* Bạn có thể thêm các nút khác như: addColumnAfter, deleteRow, mergeCells, v.v. */}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}