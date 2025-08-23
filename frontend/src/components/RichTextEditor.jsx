import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, Type, Link } from 'lucide-react';
import { processRichTextContent } from '../utils/htmlCleaner';

const RichTextEditor = ({ value, onChange, placeholder, onAddPlaceholder }) => {
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkText, setLinkText] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value || '';
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle content changes
  const handleInput = () => {
    if (editorRef.current && onChange) {
      const rawContent = editorRef.current.innerHTML;
      const cleanedContent = processRichTextContent(rawContent);
      onChange(cleanedContent);
    }
  };

  // Format text commands
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  // Insert placeholder
  const insertPlaceholder = () => {
    if (onAddPlaceholder) {
      // Store current cursor position
      const selection = window.getSelection();
      let range = null;
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0).cloneRange();
      }
      
      // Call the modal with a callback that inserts the placeholder
      onAddPlaceholder((placeholderName) => {
        if (placeholderName && placeholderName.trim()) {
          const placeholderText = `{{${placeholderName.trim()}}}`;
          
          // Focus back on the editor
          editorRef.current.focus();
          
          // Restore cursor position if we had one
          if (range) {
            const newSelection = window.getSelection();
            newSelection.removeAllRanges();
            newSelection.addRange(range);
            
            // Insert at the restored cursor position
            range.deleteContents();
            const textNode = document.createTextNode(placeholderText);
            range.insertNode(textNode);
            
            // Move cursor after the inserted text
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            newSelection.removeAllRanges();
            newSelection.addRange(range);
          } else {
            // Fallback: append to end
            editorRef.current.innerHTML += placeholderText;
          }
          
          handleInput();
        }
      });
    }
  };

  // Format heading
  const formatHeading = (tag) => {
    formatText('formatBlock', tag);
  };

  // Handle link insertion
  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      setSelectedRange(range.cloneRange());
      setLinkText(selectedText || '');
      setLinkUrl('');
      setShowLinkModal(true);
    }
  };

  // Insert link
  const insertLink = () => {
    if (selectedRange && linkUrl && linkText) {
      // Ensure URL has protocol
      let finalUrl = linkUrl.trim();
      if (!finalUrl.match(/^https?:\/\//)) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // Create clean link HTML with Gmail-compatible attributes
      const linkHtml = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #1a73e8; text-decoration: underline;">${linkText.trim()}</a>`;
      
      // Insert using execCommand for better compatibility
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectedRange);
      
      // Use insertHTML for cleaner insertion
      document.execCommand('insertHTML', false, linkHtml);
      
      handleInput();
    }
    
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    setSelectedRange(null);
  };

  // Cancel link insertion
  const cancelLink = () => {
    setShowLinkModal(false);
    setLinkText('');
    setLinkUrl('');
    setSelectedRange(null);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 lg:p-3 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="p-1.5 lg:p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="p-1.5 lg:p-2 rounded hover:bg-gray-200 transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="p-1.5 lg:p-2 rounded hover:bg-gray-200 transition-colors"
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <button
          type="button"
          onClick={handleLinkClick}
          className="p-1.5 lg:p-2 rounded hover:bg-gray-200 transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300" />

        <select
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              formatHeading(value);
            }
          }}
          className="px-2 py-1 text-xs lg:text-sm border border-gray-300 rounded"
          defaultValue=""
        >
          <option value="">Format</option>
          <option value="p">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>

        <div className="w-px h-6 bg-gray-300" />

        <button
          type="button"
          onClick={insertPlaceholder}
          className="px-3 py-1 text-xs font-mono bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
          title="Add Placeholder"
        >
          {'{{}}'}
        </button>
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[200px] p-4 outline-none focus:ring-0"
          style={{
            minHeight: '200px',
            maxHeight: '400px',
            overflowY: 'auto'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder */}
        {(!value || value.trim() === '') && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
            {placeholder || 'Enter your email content here...'}
          </div>
        )}
      </div>
      
      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter text to display"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={cancelLink}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertLink}
                disabled={!linkText.trim() || !linkUrl.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;