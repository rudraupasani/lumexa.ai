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
} from "lucide-react";

import logo from '../../public/logo.png'
import { Sidebar } from "../components/Sidebar";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import LoginPage from "../components/Login";
import { useAuth } from "../context/AuthContext";
import QuickPrompts from "../components/QuickPrompts";
import { LoadingDots } from "../components/TypingAnimation";

export default function CluezyChat() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Credit System
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
    const [showHistory, setShowHistory] = useState(false);
    const [showModeMenu, setShowModeMenu] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const scrollRef = useRef(null);

    const ChatURL = "https://lumexa-ai-2.onrender.com/api/generate";
    const SearchURL = "https://lumexa-ai-2.onrender.com/api/smart-search";
    const PDFURL = "https://lumexa-ai-2.onrender.com/api/pdf-search";

    // Save chats to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('lumexa_chats', JSON.stringify(chats));
    }, [chats]);

    const modes = [
        { id: "chat", label: "Chat", icon: MessageSquare, description: "Ask anything" },
        { id: "search", label: "Web Search", icon: Search, description: "Search the web" },
        { id: "PDF", label: "PDF Finder", icon: FileText, description: "Find PDFs" },
    ];

    // 🧠 Create New Chat
    const handleNewChat = () => {
        if (messages.length > 0) {
            const chatExists = chats.some(chat => chat.id === currentChatId);
            if (!chatExists && user) {
                setChats((prev) => [
                    {
                        id: currentChatId,
                        title: messages[0]?.content?.slice(0, 40) || "New Chat",
                        messages,
                        date: new Date().toLocaleString(),
                    },
                    ...prev,
                ]);
            }
        }
        setMessages([]);
        setQuery("");
        setCurrentChatId(generateId());
        setShowHistory(false);
    };

    // Delete Chat
    const deleteChat = (chatId) => {
        setChats((prev) => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            setMessages([]);
            setCurrentChatId(generateId());
        }
    };

    // Load Chat
    const loadChat = (chat) => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        setShowHistory(false);
    };

    // Copy Message
    const copyToClipboard = (content, index) => {
        navigator.clipboard.writeText(content);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Handle Send
    const handleSend = async () => {
        if (!query.trim()) return;

        // Check credits if not logged in
        if (!user) {
            if (guestCredits <= 0) {
                return;
            }
            setGuestCredits(prev => prev - 1);
        }

        const userMsg = { role: "user", content: query, mode: activeMode };
        setMessages((prev) => [...prev, userMsg]);

        const currentQuery = query;
        setQuery("");
        setLoading(true);

        try {
            let res;
            if (activeMode === "chat") {
                res = await axios.post(ChatURL, {
                    prompt: currentQuery,
                });
                const text =
                    res.data?.response ||
                    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "⚠️ No response from Lumexa AI.";
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: text, liked: false, disliked: false },
                ]);

            } else if (activeMode === "search") {
                res = await axios.post(SearchURL, { query: currentQuery });
                const { aiResponse, topResults, references, images } = res.data;

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: aiResponse || "⚠️ No meaningful result found.",
                        liked: false,
                        disliked: false,
                        sources: references,
                        images: images,
                    },
                ]);

                if (topResults?.length) {
                    const formatted = topResults
                        .slice(0, 3)
                        .map((r, i) => `${i + 1}. [${r.title}](${r.link})`)
                        .join("\n\n");
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "🌐 **Top Sources:**\n" + formatted,
                            liked: false,
                            disliked: false,
                        },
                    ]);
                }
            }
            else if (activeMode === "PDF") {
                const res = await axios.post(PDFURL, {
                    query: currentQuery,
                });

                const { pdfs } = res.data;
                console.log(pdfs);

                if (!pdfs || pdfs.length === 0) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "No PDFs found for this query.",
                            liked: false,
                            disliked: false,
                        },
                    ]);
                    return;
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Here are the most relevant PDFs I found:",
                        liked: false,
                        disliked: false,
                        sources: pdfs,
                        isPDF: true,
                    },
                ]);
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "❌ Error: " + (error.response?.data?.error || error.message || "Something went wrong."),
                    liked: false,
                    disliked: false,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getPlaceholder = () => {
        if (!user && guestCredits <= 0) return "Please login to continue...";
        switch (activeMode) {
            case "chat": return "Ask anything...";
            case "search": return "Search the web...";
            case "PDF": return "Find PDFs...";
            default: return "Type something...";
        }
    };

    const showLoginModal = !user && guestCredits <= 0;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, loading]);

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            <Sidebar
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chats={chats}
                loadChat={loadChat}
                deleteChat={deleteChat}
            />

            {/* Main Section */}
            <div className="flex-1 flex flex-col relative w-full">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-3 bg-black backdrop-blur-md border-b border-white/5 z-40">
                    <div className="flex items-center gap-3">
                        {/* Sidebar Toggle */}
                        <motion.button
                            id="sidebar-toggle"
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 cursor-pointer hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                            title="Toggle sidebar"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <PanelLeft size={20} />
                        </motion.button>
                        <motion.button
                            onClick={handleNewChat}
                            className="p-2 cursor-pointer bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-lg"
                            title="New chat"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Plus size={20} />
                        </motion.button>
                        <h1 className="hidden md:block text-lg font-bold text-white tracking-tight">
                            Lumexa AI
                        </h1>
                        {!user ? (
                            <motion.div className="ml-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs text-orange-300 font-semibold"
                                animate={{ scale: guestCredits <= 2 ? [1, 1.05, 1] : 1 }}
                                transition={{ duration: 1, repeat: guestCredits <= 2 ? Infinity : 0 }}
                            >
                                {guestCredits} credits
                            </motion.div>
                        ) :
                            <div className="ml-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-300 font-semibold">
                                Unlimited ✨
                            </div>
                        }
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <motion.button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 px-3 py-2 bg-zinc-800 cursor-pointer hover:bg-zinc-700 rounded-lg transition-all border border-zinc-700 hover:border-zinc-600"
                                whileHover={{ scale: 1.05 }}
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                                    {user.user_metadata.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full rounded-full object-cover"
                                        />
                                    ) : (
                                        user.email?.[0]?.toUpperCase()
                                    )}
                                </div>
                            </motion.button>
                        ) : (
                            <motion.button
                                onClick={() => navigate('/login')}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                                whileHover={{ scale: 1.05 }}
                            >
                                <User size={20} />
                            </motion.button>
                        )}
                    </div>
                </header>

                {/* Login Overlay */}
                <AnimatePresence>
                    {showLoginModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="w-full max-w-md"
                            >
                                <LoginPage />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages Area */}
                <div id="mass" className="flex-1 overflow-hidden relative flex flex-col">
                    <div id="mass" ref={scrollRef} className="flex-1 overflow-y-auto w-full">
                        {messages.length === 0 && !loading ? (
                            <motion.div className="flex flex-col items-center justify-center min-h-full text-center space-y-8 px-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >

                                {/* Heading */}
                                <div className="space-y-3">
                                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                        Welcome to Lumexa AI
                                    </h1>
                                    <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
                                        Your AI assistant for chat, web search, and document analysis. Ask anything and get intelligent responses instantly.
                                    </p>
                                </div>

                                {/* Mode Indicators */}
                                <div className="grid grid-cols-3 gap-3 md:gap-4 pt-4">
                                    {modes.map((mode, idx) => {
                                        const Icon = mode.icon;
                                        return (
                                            <motion.button
                                                key={mode.id}
                                                onClick={() => setActiveMode(mode.id)}
                                                className={`p-4 rounded-xl border transition-all ${activeMode === mode.id
                                                    ? 'border-blue-500 bg-blue-500/10'
                                                    : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600'
                                                }`}
                                                whileHover={{ scale: 1.05 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                            >
                                                <Icon size={20} className="mx-auto mb-2" />
                                                <p className="text-xs font-semibold">{mode.label}</p>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Quick Prompts */}
                                <QuickPrompts
                                    onPromptSelect={(prompt) => {
                                        setQuery(prompt);
                                    }}
                                    activeMode={activeMode}
                                />
                            </motion.div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex gap-4 group ${msg.role === "user" ? "justify-end" : ""}`}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center">
                                                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/20">
                                                       <h1 className="text-white font-bold">L</h1>
                                                    </div>
                                                </div>
                                            )}

                                            <div className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}>
                                                <div className={`text-xs font-semibold mb-2 ${msg.role === "assistant" ? "text-zinc-400" : "text-blue-400"}`}>
                                                    {msg.role === "assistant" ? "Lumexa" : "👤 You"}
                                                </div>

                                                {msg.role === "user" ? (
                                                    <motion.div
                                                        className="inline-block max-w-md bg-blue-600 px-4 py-3 rounded-2xl rounded-tr-sm text-white shadow-lg shadow-blue-900/30"
                                                        initial={{ scale: 0.95 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        className="bg-zinc-800/50 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-sm text-white"
                                                        initial={{ scale: 0.95 }}
                                                        animate={{ scale: 1 }}
                                                    >
                                                        <MarkdownRenderer
                                                            content={msg.content}
                                                            sources={msg.sources}
                                                            images={msg.images}
                                                        />
                                                    </motion.div>
                                                )}
                                            </div>

                                            {msg.role === "assistant" && (
                                                <motion.button
                                                    onClick={() => copyToClipboard(msg.content, index)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
                                                    whileHover={{ scale: 1.1 }}
                                                >
                                                    {copiedIndex === index ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                                </motion.button>
                                            )}

                                            {msg.role === "user" && (
                                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center">
                                                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shadow-lg shadow-blue-500/20">
                                                        {user?.user_metadata?.avatar_url ? (
                                                            <img
                                                                src={user.user_metadata.avatar_url}
                                                                alt="Avatar"
                                                                className="w-full h-full object-cover rounded-full"
                                                            />
                                                        ) : (
                                                            user?.email?.[0]?.toUpperCase() || "U"
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && (
                                    <motion.div
                                        className="flex gap-4"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                                            <img src={logo} alt="AI" className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-sm">
                                            <LoadingDots />
                                            <span className="text-zinc-400 text-sm">Thinking...</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div className="h-4" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Footer */}
                <div className="p-4 bg-black z-40">
                    <div className="max-w-3xl mx-auto relative group">
                        <motion.div
                            className="relative bg-zinc-900 border border-zinc-700 rounded-2xl flex items-end p-3 shadow-2xl shadow-blue-900/10 backdrop-blur-sm"
                            animate={{
                                borderColor: query.trim() && !loading ? "rgb(59, 130, 246)" : "rgb(39, 39, 42)",
                            }}
                        >
                            {/* Mode Selector */}
                            <div className="relative">
                                <motion.button
                                    onClick={() => !showLoginModal && setShowModeMenu(!showModeMenu)}
                                    className="p-2 cursor-pointer hover:bg-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
                                    disabled={showLoginModal}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {activeMode === "chat" && <MessageSquare size={20} />}
                                    {activeMode === "search" && <Search size={20} className="text-blue-400" />}
                                    {activeMode === "PDF" && <FileText size={20} className="text-purple-400" />}
                                </motion.button>
                                <AnimatePresence>
                                    {showModeMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl z-50"
                                        >
                                            {modes.map((m, idx) => (
                                                <motion.button
                                                    key={m.id}
                                                    onClick={() => { setActiveMode(m.id); setShowModeMenu(false); }}
                                                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm cursor-pointer transition-all ${activeMode === m.id
                                                        ? "text-blue-400 bg-blue-500/10"
                                                        : "text-zinc-400 hover:bg-white/5"
                                                    }`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                >
                                                    <m.icon size={16} />
                                                    <div className="text-left">
                                                        <p className="font-medium">{m.label}</p>
                                                        <p className="text-xs opacity-70">{m.description}</p>
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder={getPlaceholder()}
                                disabled={loading || showLoginModal}
                                rows={1}
                                className="flex-1 bg-transparent border-0 resize-none py-3 px-3 min-h-[44px] max-h-32 text-white placeholder-zinc-500 leading-relaxed text-[15px] focus:outline-none"
                            />

                            <motion.button
                                onClick={handleSend}
                                disabled={!query.trim() || loading || showLoginModal}
                                className="p-2 m-1 cursor-pointer bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/30 disabled:shadow-none"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Send size={18} />
                            </motion.button>
                        </motion.div>

                        {/* Tip text */}
                        <p className="text-xs text-zinc-500 mt-2 text-center">Press <span className="font-semibold">Shift + Enter</span> for new line</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
