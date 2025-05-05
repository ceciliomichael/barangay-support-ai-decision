import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      <div className="flex items-center gap-2">
        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100">
          <Paperclip size={20} />
        </button>
        
        <div className="flex items-center flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-50 focus-within:border-primary">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-gray-700"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="text-gray-500 hover:text-gray-700 p-1">
            <Smile size={20} />
          </button>
        </div>
        
        {text.trim() ? (
          <button 
            className="p-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors cursor-pointer shadow-md"
            onClick={handleSend}
          >
            <Send size={18} />
          </button>
        ) : (
          <button className="p-3 bg-gray-200 text-gray-500 rounded-full hover:bg-gray-300 transition-colors cursor-pointer">
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 