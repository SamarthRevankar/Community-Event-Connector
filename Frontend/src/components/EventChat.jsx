import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Send, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function EventChat({ eventId }) {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);

  // Load and poll chat history (Vercel Serverless Fallback)
  useEffect(() => {
    if (!open) return;
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/events/${eventId}/chat`);
        setMessages(prev => {
          // Merge fetched data, keeping optimistic messages that haven't been replaced
          const existingIds = new Set(data.map(m => m._id));
          const optimistics = prev.filter(m => m._optimistic && !existingIds.has(m._id));
          return [...data, ...optimistics].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
      } catch (e) {
        console.error('Failed to load chat', e);
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchMessages();
    
    // Poll every 5 seconds for Vercel
    const intervalId = setInterval(fetchMessages, 5000);
    return () => clearInterval(intervalId);
  }, [eventId, open]);

  // Real-time new messages
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      if (msg.eventId === eventId) {
        setMessages(prev => {
          // Replace optimistic message if it matches, otherwise append
          const optimisticIdx = prev.findIndex(
            (m) => m._optimistic && m.userId === msg.userId && m.message === msg.message
          );
          if (optimisticIdx !== -1) {
            const updated = [...prev];
            updated[optimisticIdx] = msg;
            return updated;
          }
          // Don't duplicate if already present
          if (prev.find((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [socket, eventId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const text = input.trim();
    setInput('');

    // Optimistic UI — add message immediately with a temporary marker
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      eventId,
      userId: user._id,
      displayName: user.name,
      message: text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
      _sending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await axios.post(
        `${API_URL}/api/events/${eventId}/chat`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Mark optimistic message as sent (socket handler will replace it with real data)
      setMessages((prev) =>
        prev.map((m) =>
          m._id === optimisticMsg._id ? { ...m, _sending: false } : m
        )
      );
    } catch (err) {
      console.error('Failed to send message', err);
      // Mark as failed
      setMessages((prev) =>
        prev.map((m) =>
          m._id === optimisticMsg._id ? { ...m, _sending: false, _failed: true } : m
        )
      );
    }
  };

  const retryMessage = async (failedMsg) => {
    setMessages((prev) =>
      prev.map((m) =>
        m._id === failedMsg._id ? { ...m, _sending: true, _failed: false } : m
      )
    );
    try {
      await axios.post(
        `${API_URL}/api/events/${eventId}/chat`,
        { message: failedMsg.message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((m) =>
          m._id === failedMsg._id ? { ...m, _sending: false } : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === failedMsg._id ? { ...m, _sending: false, _failed: true } : m
        )
      );
    }
  };

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-6">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MessageCircle className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-slate-900">Event Discussion</span>
          {messages.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">{messages.length}</span>
          )}
        </div>
        <span className="text-sm text-slate-400">{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden animate-scale-in">
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 w-20 rounded skeleton-shimmer mb-1.5" />
                      <div className="h-8 w-48 rounded-2xl skeleton-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                <MessageCircle className="w-8 h-8 opacity-40" />
                <p className="text-sm">No messages yet. Start the discussion!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className={`flex gap-2 ${msg.userId === user?._id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {msg.displayName?.[0]?.toUpperCase()}
                  </div>
                  <div className={`max-w-[75%] ${msg.userId === user?._id ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    <span className="text-xs text-slate-400">{msg.displayName} · {formatTime(msg.createdAt)}</span>
                    <div className={`px-3 py-2 rounded-2xl text-sm ${
                      msg.userId === user?._id
                        ? `bg-indigo-600 text-white rounded-tr-sm ${msg._sending ? 'opacity-60' : ''} ${msg._failed ? 'bg-red-500' : ''}`
                        : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                    }`}>
                      {msg.message}
                    </div>
                    {msg._sending && (
                      <span className="text-[10px] text-slate-400 italic">Sending…</span>
                    )}
                    {msg._failed && (
                      <button
                        onClick={() => retryMessage(msg)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-medium"
                      >
                        Failed — tap to retry
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3">
            {user ? (
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Say something…"
                  maxLength={500}
                  className="flex-1 px-4 py-2 rounded-full border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <p className="text-center text-sm text-slate-500 py-1">
                <a href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</a> to join the discussion
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
