import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    History,
    Send,
    Plus,
    User,
    Search,
    MessageSquare,
    Globe,
    FileText,
} from "lucide-react";

import logo from '../../public/logo.png'
import { Sidebar } from "../components/Sidebar";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import LoginPage from "../components/Login";
import { useAuth } from "../context/AuthContext";

export default function CluezyChat() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Credit System
    const [guestCredits, setGuestCredits] = useState(() => {
        const saved = localStorage.getItem('guest_credits');
        return saved !== null ? parseInt(saved) : 10;
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
    const scrollRef = useRef(null);

    const ChatURL = `${import.meta.env.VITE_BASE_URL}/api/generate`;
    const SearchURL = `${import.meta.env.VITE_BASE_URL}/api/smart-search`;

    // Save chats to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('lumexa_chats', JSON.stringify(chats));
    }, [chats]);

    const modes = [
        { id: "chat", label: "Chat", icon: MessageSquare },
        { id: "search", label: "Web", icon: Search },
        { id: "PDF", label: "PDF Finder", icon: FileText },
    ];

    // 🧠 Create New Chat
    const handleNewChat = () => {
        if (messages.length > 0) {
            // Save current chat before creating new one
            const chatExists = chats.some(chat => chat.id === currentChatId);
            if (!chatExists) {
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

    // 📁 Load Chat
    const loadChat = (chat) => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        setShowHistory(false);
    };

    // 💬 Handle Send
    const handleSend = async () => {
        if (!query.trim()) return;

        // Check credits if not logged in
        if (!user) {
            if (guestCredits <= 0) {
                // Determine logic: do we block here?
                // The UI will likely show the login modal, so this might not be reached if we block input.
                // But as a safeguard:
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
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/pdf-search`, {
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
            case "PDF Finder": return "Find PDFs...";
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
    }, [messages]);

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
                <header className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-md border-b border-white/5 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 cursor-pointer hover:bg-zinc-800 rounded-lg transition-colors md:hidden"
                        >
                            <History size={20} />
                        </button>
                        <button
                            onClick={handleNewChat}
                            className="p-2 cursor-pointer hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                        <h1 className="text-lg font-semibold tracking-tight">Lumexa</h1>
                        {!user && (
                            <div className="ml-2 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 text-xs text-zinc-400">
                                {guestCredits} credits
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
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
                            </button>
                        ) : (
                            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                <User size={20} />
                            </button>
                        )}
                    </div>
                </header>

                {/* Login Overlay */}
                {showLoginModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md">
                            <LoginPage />
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-hidden relative flex flex-col">
                    <div ref={scrollRef} className="flex-1 overflow-y-auto w-full">
                        {messages.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center min-h-full text-center space-y-6 px-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                                        Ask anything
                                    </h1>
                                    <p className="text-zinc-400 text-lg max-w-xl mx-auto">
                                        Lumexa helps you think, search, and create faster and smarter.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-8">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-4 group"
                                        >
                                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center mt-1">
                                                {msg.role === "assistant" ? (
                                                    <div className="w-full h-full rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                                                        <img src={logo} alt="AI" className="w-5 h-5" />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
                                                        {user?.user_metadata?.avatar_url ? (
                                                            <img
                                                                src={user.user_metadata.avatar_url}
                                                                alt="Avatar"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            user?.email?.[0]?.toUpperCase() || "U"
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 space-y-1  ">
                                                <div className="text-sm font-medium text-zinc-400">
                                                    {msg.role === "assistant" ? "Lumexa" : (user?.user_metadata?.full_name || "You")}
                                                </div>
                                                <div className="text-white">
                                                    {msg.role === "assistant" ? (
                                                        <MarkdownRenderer
                                                            content={msg.content}
                                                            sources={msg.sources}
                                                            images={msg.images}
                                                        />
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {loading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-1">
                                            <img src={logo} alt="AI" className="w-5 h-5 animate-pulse" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="text-sm font-medium text-zinc-400">Lumexa</div>
                                            <div className="text-zinc-500 text-sm">Thinking...</div>
                                        </div>
                                    </div>
                                )}
                                <div className="h-4" /> {/* Spacer */}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Footer */}
                <div className="p-4 bg-gradient-to-t from-black via-black to-transparent z-40">
                    <div className="max-w-3xl mx-auto relative group">
                        <div className={`
                            absolute -inset-1 rounded-3xl opacity-20
                            ${showLoginModal ? 'opacity-0' : ''}
                        `}></div>

                        <div className="relative bg-[#0d0d0d] border border-zinc-800 rounded-3xl flex items-end p-2 shadow-xl">
                            {/* Mode Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => !showLoginModal && setShowModeMenu(!showModeMenu)}
                                    className="p-2 mb-1 cursor-pointer hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
                                    disabled={showLoginModal}
                                >
                                    <Globe size={20} className={activeMode !== "chat" ? "text-blue-400 " : ""} />
                                </button>
                                {showModeMenu && (
                                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                                        {modes.map(m => (
                                            <button
                                                key={m.id}
                                                onClick={() => { setActiveMode(m.id); setShowModeMenu(false); }}
                                                className={`flex items-center cursor-pointer gap-3 w-full px-4 py-4 text-sm hover:bg-white/5 ${activeMode === m.id ? "text-blue-400" : "text-zinc-400"}`}
                                            >
                                                <m.icon size={16} />
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder={getPlaceholder()}
                                disabled={loading || showLoginModal}
                                rows={1}
                                className="flex-1 bg-transparent border-0 focus:ring-0 border-blue-600 resize-none py-3 px-3 min-h-[44px] max-h-32 text-white placeholder-zinc-500 leading-relaxed scrollbar-hide text-[15px]"
                            />

                            <button
                                onClick={handleSend}
                                disabled={!query.trim() || loading || showLoginModal}
                                className="p-2 m-1 mb-1.5 cursor-pointer bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-900/20"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-zinc-600">
                                LLMs can make mistakes. Verify important info.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
