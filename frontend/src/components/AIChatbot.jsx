import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Bot, User, Trash2, HelpCircle, Loader2, Sparkles } from 'lucide-react';

export default function AIChatbot({ weatherContext }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const presetQuestions = [
    'Will it rain tomorrow?',
    'What should I wear today?',
    'Is it a good day for cycling?',
    'Is the air quality safe today?'
  ];

  // Load chat history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Auto-scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get('/api/chat/history');
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    if (!textToSend) setInput('');
    setLoading(true);

    // Add user message optimistically to the UI
    const tempUserMsg = { role: 'user', content: messageText, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await axios.post('/api/chat', {
        message: messageText,
        weatherContext
      });
      // Replace or append bot reply
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Chat bot response failed:', err);
      // Append warning message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an issue connection error. Make sure the backend server is running!'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all conversation history?')) return;
    try {
      await axios.delete('/api/chat/clear');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear chat history:', err);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-[500px]">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-1.5">
              Weather Assistant
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            </h3>
            <p className="text-3xs text-gray-400">Ask about outfits, forecasts, or sports</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button 
            onClick={handleClearHistory} 
            title="Clear Chat Logs"
            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-gray-400 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages Log */}
      <div className="grow overflow-y-auto py-4 space-y-4 px-1 scrollbar">
        {historyLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <Bot className="w-10 h-10 text-indigo-400/50 mb-2 animate-bounce" />
            <p className="text-xs font-semibold">How can I assist you today?</p>
            <p className="text-3xs text-gray-400 max-w-xs mt-1">
              Select one of the quick suggestions below or write your own custom prompt!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div 
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                    isUser ? 'bg-indigo-600' : 'bg-purple-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    isUser 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100 rounded-tr-none' 
                      : 'bg-white/5 border-white/5 text-gray-100 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line font-medium">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        
        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white bg-purple-600">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl text-xs bg-white/5 border border-white/5 text-gray-400 rounded-tl-none flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Suggestions */}
      {messages.length === 0 && (
        <div className="py-2 flex flex-wrap gap-2 shrink-0 border-t border-white/5">
          {presetQuestions.map((q, idx) => (
            <button 
              key={idx} 
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-white/5 text-3xs font-semibold text-gray-300 hover:text-indigo-200 transition-all flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-indigo-400" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="flex gap-2 shrink-0 pt-3 border-t border-white/10"
      >
        <input 
          type="text" 
          placeholder="Ask something..." 
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          className="grow px-4 py-2 rounded-2xl glass-input text-xs"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
