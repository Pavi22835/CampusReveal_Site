import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, Minus } from 'lucide-react';
import { sendMessage } from '../../services/geminiChatService';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: "Namaste! I'm your CampusReveal assistant. How can I help you find your dream college today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Map chat history to Gemini format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await sendMessage(userMessage, history);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: error.message, isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '80px' : '600px'
            }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`w-[400px] max-w-[90vw] bg-white rounded-[2rem] shadow-2xl shadow-indigo-200/50 border border-indigo-100 overflow-hidden flex flex-col mb-4 transition-all duration-300`}
          >
            {/* Header */}
            <div className="p-6 bg-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm tracking-tight">CampusReveal AI</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-100">Always Active</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Minus size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                  {messages.map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          m.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          {m.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                          m.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100'
                        } ${m.isError ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}`}>
                          {m.text}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 animate-pulse">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <Bot size={16} />
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl rounded-tl-none border border-slate-100 flex items-center gap-2">
                          <Loader2 size={16} className="animate-spin text-indigo-600" />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assistant is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask about colleges, fees, courses..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="w-full h-14 pl-6 pr-14 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600/20 font-medium text-slate-900 transition-all placeholder:text-slate-400"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-indigo-100"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <Sparkles size={10} className="text-indigo-400" /> Powered by CampusReveal AI Core
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] shadow-2xl shadow-indigo-400/50 flex items-center justify-center border-2 border-white ring-4 ring-indigo-50 ring-offset-0 transition-all z-10"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative"
            >
              <MessageSquare size={28} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
