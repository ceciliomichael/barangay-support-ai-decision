import { useEffect, useRef } from 'react';
import { Message, User } from '../types';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  otherUser: User;
}

const MessageList = ({ messages, currentUserId, isTyping, otherUser }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messages.map((message) => {
        const isCurrentUser = message.sender === currentUserId;
        return (
          <div 
            key={message.id}
            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} animate-slide-in`}
          >
            {!isCurrentUser && (
              <div className="flex-shrink-0 mr-3">
                <img 
                  src={otherUser.avatar} 
                  alt={otherUser.name} 
                  className="w-8 h-8 rounded-full"
                />
              </div>
            )}
            <div className={`max-w-[70%]`}>
              <div 
                className={`p-3 rounded-lg mb-1 ${
                  isCurrentUser 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white shadow-md rounded-bl-none'
                }`}
              >
                {message.text}
              </div>
              <div 
                className={`text-xs text-gray-500 ${
                  isCurrentUser ? 'text-right' : 'text-left'
                }`}
              >
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isTyping && (
        <div className="flex justify-start animate-fade-in">
          <div className="flex-shrink-0 mr-3">
            <img 
              src={otherUser.avatar} 
              alt={otherUser.name} 
              className="w-8 h-8 rounded-full"
            />
          </div>
          <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-md inline-block">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Invisible element for scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 