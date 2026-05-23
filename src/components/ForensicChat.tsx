import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, MessageSquare, X } from 'lucide-react';
import { AnalysisResult } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ForensicChatProps {
  result: AnalysisResult;
}

export const ForensicChat: React.FC<ForensicChatProps> = ({ result }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  // Initialize chat session
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const normalizeAssistantText = (text: string) => {
    return text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^\s*-\s+/gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          context: result,
          language: language
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const modelResponse = normalizeAssistantText(data.text || '');

      setMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: t("chat_error") }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] md:w-[450px] h-[550px] resend-card bg-resend-canvas mb-4 shadow-2xl flex flex-col border-resend-hairline-strong overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-resend-hairline bg-resend-hairline/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-resend-ink flex items-center justify-center">
                  <Bot className="w-5 h-5 text-resend-canvas" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-resend-ink">{t("chat_title")}</h4>
                  <p className="text-[10px] text-resend-charcoal uppercase tracking-widest opacity-60">{t("chat_connected")}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-resend-hairline rounded-lg transition-colors text-resend-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-[radial-gradient(#ffffff_0.5px,transparent_0.5px)] [background-size:20px_20px] dark:bg-[radial-gradient(#111111_0.5px,transparent_0.5px)]"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <MessageSquare className="w-8 h-8 text-resend-hairline-strong" />
                  <p className="text-sm text-resend-charcoal">
                    {t("chat_welcome")}
                  </p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-resend-ink text-resend-canvas rounded-tr-none'
                    : 'bg-resend-hairline text-resend-ink rounded-tl-none border border-resend-hairline-strong'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-resend-hairline p-3 rounded-xl rounded-tl-none border border-resend-hairline-strong flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-resend-charcoal" />
                    <span className="text-xs text-resend-charcoal">{t("chat_analyzing")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-resend-hairline bg-resend-canvas">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t("chat_placeholder")}
                  className="w-full bg-resend-hairline border border-resend-hairline-strong rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-resend-ink/20 transition-all placeholder:text-resend-charcoal/40"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-resend-ink text-resend-canvas rounded-full disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-resend-ink text-resend-canvas shadow-2xl flex items-center justify-center relative group"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute right-full mr-4 px-3 py-1 rounded-lg bg-resend-ink text-resend-canvas text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Forensic Chat
          </span>
        )}
      </motion.button>
    </div>
  );
};
