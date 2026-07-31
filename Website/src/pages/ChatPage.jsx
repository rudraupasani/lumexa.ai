import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Send,
    Plus,
    User,
    Search,
    MessageSquare,
    Globe,
    FileText,
    PanelLeft,
    Copy,
    Check,
    Settings,
    Sparkles,
    Trash2,
    Mic,
    Share2,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    Volume2,
    Bot,
    Pencil,
} from "lucide-react";

import { Sidebar } from "../components/Sidebar";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import LoginPage from "../components/Login";
import { useAuth } from "../context/AuthContext";
import { LoadingDots } from "../components/TypingAnimation";

// ── Utility: format timestamp ──────────────────────────────────────────────
function formatTime(date = new Date()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Welcome / Onboarding Screen ────────────────────────────────────────────
function WelcomeScreen({ onSend, onChipClick }) {
    const [val, setVal] = useState('');
    const { user } = useAuth();
    const name = user?.user_metadata?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || 'there';



    const handleSubmit = (e) => {
        e.preventDefault();
        if (val.trim()) { onSend(val); setVal(''); }
    };

    return (
        <div className="welcome-screen animate-fade-in" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="welcome-bot-icon" style={{ margin: '0 auto 16px', background: 'transparent' }}>
                    <Sparkles size={36} color="var(--accent)" />
                </div>
                <h1 className="welcome-title" style={{ fontSize: 24, fontWeight: 500, color: 'var(--text-primary)' }}>
                    What can I help with?
                </h1>
            </div>
        </div>
    );
}

// ── Main Chat Page ─────────────────────────────────────────────────────────
export default function ChatPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ── Credit System
    const [guestCredits, setGuestCredits] = useState(() => {
        const saved = localStorage.getItem('guest_credits');
        return saved !== null ? parseInt(saved) : 5;
    });

    useEffect(() => {
        localStorage.setItem('guest_credits', guestCredits);
    }, [guestCredits]);

    const generateId = useCallback(
        () => Date.now().toString(36) + Math.random().toString(36).substr(2),
        []
    );

    const [activeMode, setActiveMode] = useState("chat");
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('lumexa_chats');
        return saved ? JSON.parse(saved) : [];
    });
    const [currentChatId, setCurrentChatId] = useState(generateId());
    const [showHistory, setShowHistory] = useState(true);
    const [showModeMenu, setShowModeMenu] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const scrollRef = useRef(null);
    const textareaRef = useRef(null);
    const modeMenuRef = useRef(null);

    const ChatURL = "http://localhost:3000/api/generate";
    const SearchURL = "http://localhost:3000/api/smart-search";
    const PDFURL = "http://localhost:3000/api/pdf-search";

    // Save chats
    useEffect(() => {
        localStorage.setItem('lumexa_chats', JSON.stringify(chats));
    }, [chats]);

    // Close mode menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (modeMenuRef.current && !modeMenuRef.current.contains(e.target)) {
                setShowModeMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const modes = [
        { id: "chat", label: "Chat", icon: MessageSquare, description: "Ask anything" },
        { id: "search", label: "Web Search", icon: Globe, description: "Search the web" },
        { id: "PDF", label: "PDF Finder", icon: FileText, description: "Find PDFs" },
    ];

    // ── New Chat ────────────────────────────────────────────────────────────
    const handleNewChat = () => {
        if (messages.length > 0 && user) {
            const chatExists = chats.some(c => c.id === currentChatId);
            if (!chatExists) {
                setChats(prev => [
                    {
                        id: currentChatId,
                        title: messages[0]?.content?.slice(0, 45) || "New Chat",
                        messages,
                        date: new Date().toISOString(),
                    },
                    ...prev,
                ]);
            }
        }
        setMessages([]);
        setQuery("");
        setCurrentChatId(generateId());
    };

    const deleteChat = (chatId) => {
        setChats(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(generateId());
        }
    };

    const loadChat = (chat) => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        setShowHistory(window.innerWidth >= 768);
    };

    const copyToClipboard = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // ── Auto-resize textarea ─────────────────────────────────────────────
    const autoResize = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    };

    // ── Send Message ─────────────────────────────────────────────────────
    const handleSend = async (overrideQuery) => {
        const text = overrideQuery ?? query;
        if (!text.trim()) return;

        if (!user) {
            if (guestCredits <= 0) return;
            setGuestCredits(prev => prev - 1);
        }

        const userMsg = {
            role: "user",
            content: text,
            mode: activeMode,
            time: new Date().toISOString(),
        };
        setMessages(prev => [...prev, userMsg]);

        const currentQuery = text;
        setQuery("");
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        setLoading(true);

        try {
            let res;
            if (activeMode === "chat") {
                res = await axios.post(ChatURL, { prompt: currentQuery });
                const responseText =
                    res.data?.response ||
                    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "⚠️ No response from AI.";
                setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: responseText, liked: false, disliked: false, time: new Date().toISOString() },
                ]);
            } else if (activeMode === "search") {
                res = await axios.post(SearchURL, { query: currentQuery });
                const { aiResponse, topResults, references, images } = res.data;
                setMessages(prev => [
                    ...prev,
                    {
                        role: "assistant",
                        content: aiResponse || "⚠️ No result found.",
                        liked: false, disliked: false,
                        sources: references,
                        images,
                        time: new Date().toISOString(),
                    },
                ]);
                if (topResults?.length) {
                    const formatted = topResults
                        .slice(0, 3)
                        .map((r, i) => `${i + 1}. [${r.title}](${r.link})`)
                        .join("\n\n");
                    setMessages(prev => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "🌐 **Top Sources:**\n" + formatted,
                            liked: false, disliked: false,
                            time: new Date().toISOString(),
                        },
                    ]);
                }
            } else if (activeMode === "PDF") {
                res = await axios.post(PDFURL, { query: currentQuery });
                const { pdfs } = res.data;
                if (!pdfs || pdfs.length === 0) {
                    setMessages(prev => [
                        ...prev,
                        { role: "assistant", content: "No PDFs found for this query.", liked: false, disliked: false, time: new Date().toISOString() },
                    ]);
                } else {
                    setMessages(prev => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "Here are the most relevant PDFs I found:",
                            liked: false, disliked: false,
                            sources: pdfs, isPDF: true,
                            time: new Date().toISOString(),
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setMessages(prev => [
                ...prev,
                {
                    role: "assistant",
                    content: "❌ Error: " + (error.response?.data?.error || error.message || "Something went wrong."),
                    liked: false, disliked: false,
                    time: new Date().toISOString(),
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages, loading]);

    const showLoginModal = !user && guestCredits <= 0;

    const getPlaceholder = () => {
        if (showLoginModal) return "Please login to continue...";
        switch (activeMode) {
            case "chat": return "Type your message...";
            case "search": return "Search the web...";
            case "PDF": return "Find PDFs...";
            default: return "Type your message...";
        }
    };

    // ── Suggestion chips shown above input ───────────────────────────────


    const userName = user?.user_metadata?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || 'there';

    return (
        <div style={{ display: 'flex', height: '100vh', height: '100dvh', overflow: 'hidden', background: 'var(--chat-bg)', color: 'var(--text-primary)' }}>
            {/* Sidebar */}
            <Sidebar
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chats={chats}
                loadChat={loadChat}
                deleteChat={deleteChat}
                onNewChat={handleNewChat}
            />

            {/* Main Chat Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

                {/* ── Header ───────────────────────────────────────────────── */}
                <header className="chat-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="chat-header-left">
                        {/* Sidebar toggle */}
                        <motion.button
                            id="sidebar-toggle"
                            onClick={() => setShowHistory(!showHistory)}
                            className="icon-btn"
                            title="Toggle sidebar"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <PanelLeft size={17} />
                        </motion.button>

                        <div className="chat-header-greeting">
                            {messages.length === 0 ? (
                                <>
                                    <h2>Hello, {userName}!</h2>
                                    <p>How can I help you today?</p>
                                </>
                            ) : (
                                <h2 style={{ fontSize: 16 }}>
                                    {messages[0]?.content?.slice(0, 50) || 'Chat'}
                                    {(messages[0]?.content?.length || 0) > 50 ? '…' : ''}
                                </h2>
                            )}
                        </div>
                    </div>

                    <div className="chat-header-actions">
                        {/* Credit badge */}
                        {!user ? (
                            <motion.div
                                className={`credit-badge guest`}
                                animate={{ scale: guestCredits <= 2 ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 1, repeat: guestCredits <= 2 ? Infinity : 0 }}
                            >
                                {guestCredits} credits left
                            </motion.div>
                        ) : (
                            <div className="credit-badge unlimited">
                                Unlimited
                            </div>
                        )}

                        <button className="icon-btn" title="Share">
                            <Share2 size={16} />
                        </button>

                        <button className="icon-btn" title="Settings" onClick={() => navigate('/profile')}>
                            <Settings size={16} />
                        </button>

                        {/* User avatar */}
                        {user ? (
                            <motion.button
                                onClick={() => navigate('/profile')}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: '#6c63ff', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    overflow: 'hidden', flexShrink: 0,
                                }}
                                whileHover={{ scale: 1.05 }}
                                title="Profile"
                            >
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>
                                        {user.email?.[0]?.toUpperCase()}
                                    </span>
                                )}
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => navigate('/login')}
                                className="icon-btn"
                                whileHover={{ scale: 1.05 }}
                            >
                                <User size={16} />
                            </motion.button>
                        )}
                    </div>
                </header>

                {/* ── Login Overlay ─────────────────────────────────────────── */}
                <AnimatePresence>
                    {showLoginModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="login-overlay"
                        >
                            <motion.div
                                initial={{ scale: 0.92, y: 12 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.92 }}
                                style={{ width: '100%', maxWidth: 420 }}
                            >
                                <LoginPage />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Messages Area ─────────────────────────────────────────── */}
                <div
                    id="mass"
                    ref={scrollRef}
                    className="messages-area"
                    style={{ flex: 1, overflowY: 'auto' }}
                >
                    {messages.length === 0 && !loading ? (
                        <WelcomeScreen
                            onSend={handleSend}
                            onChipClick={(label) => setQuery(label)}
                        />
                    ) : (
                        <div style={{ maxWidth: 720, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <AnimatePresence initial={false}>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.28 }}
                                        className={`message-row ${msg.role === 'user' ? 'user' : ''}`}
                                    >
                                        {/* AI avatar */}
                                        {msg.role === 'assistant' && (
                                            <div className="msg-avatar ai">
                                                <Bot size={14} />
                                            </div>
                                        )}

                                        <div className="message-content" style={{ maxWidth: msg.role === 'assistant' ? '85%' : '65%' }}>
                                            <div className={`msg-bubble ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                                                {msg.role === 'user' ? (
                                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.6 }}>{msg.content}</p>
                                                ) : (
                                                    <MarkdownRenderer
                                                        content={msg.content}
                                                        sources={msg.sources}
                                                        images={msg.images}
                                                    />
                                                )}
                                            </div>

                                            {/* Action buttons for AI messages (now below the message) */}
                                            {msg.role === 'assistant' && (
                                                <div className="msg-actions" style={{ marginTop: '8px', opacity: 0.6 }}>
                                                    <button
                                                        className="msg-action-btn"
                                                        onClick={() => copyToClipboard(msg.content, index)}
                                                        title="Copy"
                                                        style={{ background: 'transparent', border: 'none' }}
                                                    >
                                                        {copiedIndex === index
                                                            ? <Check size={14} style={{ color: '#22c55e' }} />
                                                            : <Copy size={14} />
                                                        }
                                                    </button>
                                                    <button className="msg-action-btn" title="Like" style={{ background: 'transparent', border: 'none' }}>
                                                        <ThumbsUp size={14} />
                                                    </button>
                                                    <button className="msg-action-btn" title="Dislike" style={{ background: 'transparent', border: 'none' }}>
                                                        <ThumbsDown size={14} />
                                                    </button>
                                                    <button className="msg-action-btn" title="Share" style={{ background: 'transparent', border: 'none' }}>
                                                        <Share2 size={14} />
                                                    </button>
                                                    <button className="msg-action-btn" title="Regenerate" style={{ background: 'transparent', border: 'none' }}>
                                                        <RotateCcw size={14} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* Timestamp + tick */}
                                            {msg.role === 'user' && (
                                                <div className="msg-time" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
                                                    {msg.time ? formatTime(new Date(msg.time)) : ''}
                                                    <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                                                        <path d="M1 5l3 3 9-8" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                        <path d="M5 5l3 3 5-8" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* User avatar */}
                                        {msg.role === 'user' && (
                                            <div className="msg-avatar user">
                                                {user?.user_metadata?.avatar_url ? (
                                                    <img src={user.user_metadata.avatar_url} alt="Avatar"
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <User size={14} />
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Loading bubble */}
                            {loading && (
                                <motion.div
                                    className="message-row"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="msg-avatar ai">
                                        <Bot size={14} />

                                    </div>
                                    <div className="msg-bubble ai" style={{ display: 'inline-flex' }}>
                                        <div className="loading-dots">
                                            <div className="loading-dot" />
                                            <div className="loading-dot" />
                                            <div className="loading-dot" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Input Footer ──────────────────────────────────────────── */}
                <div className="chat-footer">
                    {/* Suggestion chips (only when chat is active) */}
                    {/* {messages.length > 0 && (
                        <div className="suggestions-row">
                            {suggestions.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <button
                                        key={i}
                                        className="suggestion-chip"
                                        onClick={() => handleSend(s.text)}
                                    >
                                        <Icon size={12} />
                                        {s.text}
                                    </button>
                                );
                            })}
                        </div>
                    )} */}

                    {/* Input row */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: '760px', margin: '0 auto' }}>
                        {/* Mode popup */}
                        <AnimatePresence>
                            {showModeMenu && (
                                <motion.div
                                    ref={modeMenuRef}
                                    className="mode-selector-popup"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    style={{ bottom: 'calc(100% + 8px)', left: 0 }}
                                >
                                    {modes.map((m, i) => {
                                        const MIcon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                className={`mode-option ${activeMode === m.id ? 'active' : ''}`}
                                                onClick={() => { setActiveMode(m.id); setShowModeMenu(false); }}
                                            >
                                                <MIcon size={15} color={activeMode === m.id ? '#6c63ff' : '#6b7280'} />
                                                <div style={{ textAlign: 'left' }}>
                                                    <div className="mode-option-label">{m.label}</div>
                                                    <div className="mode-option-desc">{m.description}</div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="input-wrap" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            <textarea
                                ref={textareaRef}
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); autoResize(); }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder={getPlaceholder()}
                                disabled={loading || showLoginModal}
                                rows={1}
                                className="chat-textarea"
                                style={{ minHeight: '44px', padding: '10px 4px', marginBottom: '8px' }}
                            />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Add attachment button */}
                                    <button
                                        className="chat-mic-btn"
                                        onClick={() => !showLoginModal && setShowModeMenu(!showModeMenu)}
                                        title="Web search"
                                        disabled={showLoginModal}
                                        style={{
                                            display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px', borderRadius: '16px', border: activeMode === 'search' ? '1px solid var(--border)' : 'none'
                                        }}
                                    >
                                        <Globe size={14} />
                                        <span style={{ fontSize: '13px' }}>Web search</span>
                                    </button>

                                    <button
                                        className="chat-mic-btn"
                                        onClick={() => { setActiveMode(activeMode === 'PDF' ? 'chat' : 'PDF') }}
                                        title="Research"
                                        disabled={showLoginModal}
                                        style={{
                                            display: 'flex', gap: '6px', alignItems: 'center', width: 'auto', padding: '0 8px', borderRadius: '16px', border: activeMode === 'PDF' ? '1px solid var(--border)' : 'none'
                                        }}
                                    >
                                        <FileText size={14} />
                                        <span style={{ fontSize: '13px' }}>Research</span>
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <motion.button
                                        onClick={() => handleSend()}
                                        disabled={!query.trim() || loading || showLoginModal}
                                        className="chat-send-btn"
                                        style={{ borderRadius: '50%', background: 'var(--accent-blue)', }}
                                        whileHover={query.trim() && !loading ? { scale: 1.08 } : {}}
                                        whileTap={query.trim() && !loading ? { scale: 0.92 } : {}}
                                        title="Send"
                                    >
                                        <Send size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>

                        <p className="chat-disclaimer">
                            ChatBot can make mistakes. Consider checking important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>

    );
}
