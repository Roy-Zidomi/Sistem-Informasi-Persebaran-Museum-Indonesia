import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { askMuseumChatbot } from '../api/chatApi';
import { useLanguage } from '../context/LanguageContext';

const chatbotCopy = {
  id: {
    welcome:
      'Halo! Saya pemandu virtual MuseumNesia. Tanya apa saja tentang museum Indonesia, lokasi, kategori, jam buka, tiket, atau rekomendasi belajar.',
    title: 'Pemandu Museum',
    subtitle: 'Belajar lebih dalam tentang museum',
    quickPrompts: [
      'Museum di Bandung ada apa saja?',
      'Kategori museum apa saja?',
      'Cara mencari museum terdekat?',
    ],
    loading: 'Sedang menjawab...',
    error: 'Maaf, chatbot belum bisa menjawab sekarang. Coba lagi beberapa saat.',
    inputLabel: 'Tulis pertanyaan',
    placeholder: 'Tanya tentang museum...',
    closeLabel: 'Tutup chatbot',
    openLabel: 'Buka chatbot',
    sendLabel: 'Kirim pesan',
  },
  en: {
    welcome:
      'Hi! I am MuseumNesia virtual guide. Ask me about Indonesian museums, locations, categories, opening hours, tickets, or learning recommendations.',
    title: 'Museum Guide',
    subtitle: 'Explore Indonesian museums',
    quickPrompts: [
      'What museums are in Bandung?',
      'What museum categories are available?',
      'How do I find nearby museums?',
    ],
    loading: 'Thinking...',
    error: 'Sorry, the chatbot cannot answer right now. Please try again shortly.',
    inputLabel: 'Type your question',
    placeholder: 'Ask about museums...',
    closeLabel: 'Close chatbot',
    openLabel: 'Open chatbot',
    sendLabel: 'Send message',
  },
};

const getMuseumIdFromPath = (pathname) => {
  const match = pathname.match(/^\/museum\/(\d+)/);
  return match ? Number(match[1]) : null;
};

function ChatbotWidget() {
  const location = useLocation();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const museumId = useMemo(() => getMuseumIdFromPath(location.pathname), [location.pathname]);
  const isAdminPage = location.pathname.startsWith('/admin');
  const copy = chatbotCopy[language] || chatbotCopy.id;

  useEffect(() => {
    setMessages((currentMessages) => {
      if (currentMessages.length > 0 && currentMessages[0].id !== 'welcome') {
        return currentMessages;
      }

      const welcomeMessage = {
        id: 'welcome',
        role: 'assistant',
        text: copy.welcome,
      };

      if (currentMessages.length === 0) {
        return [welcomeMessage];
      }

      return [welcomeMessage, ...currentMessages.slice(1)];
    });
  }, [copy.welcome]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  if (isAdminPage) {
    return null;
  }

  const sendMessage = async (messageText) => {
    const trimmedMessage = messageText.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedMessage,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setError('');
    setIsLoading(true);

    try {
      const response = await askMuseumChatbot({
        message: trimmedMessage,
        museumId,
        pagePath: location.pathname,
        language,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.data.answer,
        },
      ]);
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        copy.error;

      setError(message);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: message,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          className="flex h-[min(620px,calc(100vh-104px))] w-[calc(100vw-40px)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-slate-900"
          aria-label="Chatbot MuseumApp"
        >
          <header className="flex items-center justify-between gap-3 bg-emerald-600 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">{copy.title}</h2>
                <p className="truncate text-xs text-emerald-50">
                  {copy.subtitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70"
              aria-label={copy.closeLabel}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 dark:bg-slate-950">
            {messages.map((message) => {
              const isUser = message.role === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[84%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      isUser
                        ? 'rounded-br-md bg-emerald-600 text-white'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  {copy.loading}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            {messages.length === 1 && (
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {copy.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="shrink-0 rounded-full border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950"
                    disabled={isLoading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p className="mb-2 text-xs text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <label htmlFor="museum-chatbot-input" className="sr-only">
                {copy.inputLabel}
              </label>
              <textarea
                id="museum-chatbot-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSubmit(event);
                  }
                }}
                placeholder={copy.placeholder}
                rows={1}
                maxLength={1000}
                className="max-h-28 min-h-11 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-900"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                aria-label={copy.sendLabel}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </form>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 dark:focus:ring-emerald-900"
        aria-label={isOpen ? copy.closeLabel : copy.openLabel}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default ChatbotWidget;
