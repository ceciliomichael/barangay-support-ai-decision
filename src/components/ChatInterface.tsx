import { useState, useEffect } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { Phone, Video, MoreVertical } from 'lucide-react';
import { mistralService } from '../services/mistralService';
import { Message, User, MistralMessage } from '../types';

// User data
const currentUser: User = {
  id: 'user1',
  name: 'You',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=user1'
};

const aiUser: User = {
  id: 'ai',
  name: 'AI Assistant',
  avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=ai'
};

// Initial welcome message
const initialMessages: Message[] = [
  { 
    id: 1, 
    text: 'Hello! I\'m your AI assistant. How can I help you today?', 
    sender: aiUser.id, 
    timestamp: new Date() 
  }
];

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  // Store conversation history for API calls
  const [conversationHistory, setConversationHistory] = useState<MistralMessage[]>([
    { role: 'assistant', content: initialMessages[0].text }
  ]);
  
  const handleSendMessage = async (text: string) => {
    if (text.trim()) {
      // Add user message to UI
      const userMessage: Message = {
        id: messages.length + 1,
        text: text.trim(),
        sender: currentUser.id,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Add user message to conversation history
      const userMistralMessage: MistralMessage = {
        role: 'user',
        content: text.trim()
      };
      
      const updatedHistory = [...conversationHistory, userMistralMessage];
      setConversationHistory(updatedHistory);
      
      // Show typing indicator
      setIsTyping(true);
      
      try {
        // Send message to Mistral AI API
        const response = await mistralService.sendMessage(updatedHistory);
        
        // Hide typing indicator
        setIsTyping(false);
        
        // Add AI response to UI
        const aiMessage: Message = {
          id: messages.length + 2,
          text: response,
          sender: aiUser.id,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, aiMessage]);
        
        // Add AI response to conversation history
        const aiMistralMessage: MistralMessage = {
          role: 'assistant',
          content: response
        };
        
        setConversationHistory(prevHistory => [...prevHistory, aiMistralMessage]);
      } catch (error) {
        console.error('Failed to get response:', error);
        setIsTyping(false);
        
        // Add error message
        const errorMessage: Message = {
          id: messages.length + 2,
          text: 'Sorry, I encountered an error while processing your request. Please check your API key and try again.',
          sender: aiUser.id,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img src={aiUser.avatar} alt={aiUser.name} className="w-10 h-10 rounded-full" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{aiUser.name}</h2>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <Phone size={20} />
          </button>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <Video size={20} />
          </button>
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <MessageList 
        messages={messages} 
        currentUserId={currentUser.id} 
        isTyping={isTyping} 
        otherUser={aiUser} 
      />
      
      {/* Chat input */}
      <ChatInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatInterface; 