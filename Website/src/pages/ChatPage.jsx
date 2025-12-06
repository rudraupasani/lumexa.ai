import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../utils/supabaseClient";
import {
    History,
    Send,
    Plus,
    User,
    Menu,
    Search,
    MessageSquare,
    Image,
    Copy,
    ChevronDown,
    ThumbsUp,
    ThumbsDown,
    X,
} from "lucide-react";

import logo from '../../public/logo.png'
import Weather from "../components/Weather";

export default function CluezyChat() {
    const generateId = useCallback(
        () => Date.now().toString(36) + Math.random().toString(36).substr(2),
        []
    );

    const [activeMode, setActiveMode] = useState("chat");
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState([]);
    const [currentChatId, setCurrentChatId] = useState(generateId());
    const [showHistory, setShowHistory] = useState(false);
    const [showModeMenu, setShowModeMenu] = useState(false);
    const scrollRef = useRef(null);

    const ChatURL = "http://localhost:5000/api/generate";
    const SearchURL = "http://localhost:5000/api/smart-search";

    const modes = [
        { id: "chat", label: "Chat", icon: MessageSquare },
        { id: "search", label: "Web", icon: Search },
        { id: "image", label: "Image", icon: Image },
    ];

    // 🧠 Create New Chat
    const handleNewChat = () => {
        if (messages.length > 0) {
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
        setMessages([]);
        setQuery("");
        setCurrentChatId(generateId());
        setShowHistory(false);
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
                    model: "gemini-2.0-flash",
                });
                const text =
                    res.data?.response ||
                    res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "⚠️ No response from Gemini";

                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: text, liked: false, disliked: false },
                ]);
            } else if (activeMode === "search") {
                res = await axios.post(SearchURL, { query: currentQuery });
                const { aiResponse, topResults } = res.data;
                console.log("Search API Response:", res.data);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: aiResponse || "⚠️ No meaningful result found.",
                        liked: false,
                        disliked: false,
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
            } else if (activeMode === "image") {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "🖼️ Image generation API not yet connected.",
                        liked: false,
                        disliked: false,
                    },
                ]);
            }
        } catch (error) {
            console.error("API Error:", error.response?.data || error.message);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "❌ Error: " +
                        (error.response?.data?.error ||
                            error.message ||
                            "Something went wrong."),
                    liked: false,
                    disliked: false,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // 👍 / 👎 Reactions
    const handleLike = (index) => {
        setMessages((prev) =>
            prev.map((msg, i) =>
                i === index
                    ? { ...msg, liked: !msg.liked, disliked: msg.liked ? msg.disliked : false }
                    : msg
            )
        );
    };

    const handleDislike = (index) => {
        setMessages((prev) =>
            prev.map((msg, i) =>
                i === index
                    ? { ...msg, disliked: !msg.disliked, liked: msg.disliked ? msg.liked : false }
                    : msg
            )
        );
    };

    const handleCopy = (text) => navigator.clipboard.writeText(text);

    const getPlaceholder = () => {
        switch (activeMode) {
            case "chat":
                return "Ask anything...";
            case "search":
                return "Search the web...";
            case "image":
                return "Describe an image to generate...";
            default:
                return "Type something...";
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    const ActiveModeIcon =
        modes.find((m) => m.id === activeMode)?.icon || MessageSquare;

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0a0a] border-r border-gray-800 transform transition-transform duration-300 ${showHistory ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                    <h2 className="text-lg font-semibold">Chat History</h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="p-1 hover:bg-gray-800 rounded"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-64px)]">
                    {chats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No previous chats</div>
                    ) : (
                        <div className="p-2">
                            {chats.map((chat) => (
                                <button
                                    key={chat.id}
                                    onClick={() => loadChat(chat)}
                                    className="w-full text-left p-3 mb-2 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <MessageSquare
                                            size={16}
                                            className="mt-1 text-gray-400 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate">{chat.title}</p>
                                            <p className="text-xs text-gray-500 mt-1">{chat.date}</p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Section */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex items-center justify-between px-4 py-1   bg-black backdrop-blur-lg">

                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 rounded-full  bg-gradient-to-br from-blue-500 to-purple-600  flex items-center justify-center font-bold">
                            <img
                                className="h-12 w-12 object-contain"
                                src={logo}
                                alt="Cluezy logo"
                            />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Lumexa</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <History size={20} />
                        </button>
                        <button
                            onClick={handleNewChat}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                        <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                            <User size={20} />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
                    {messages.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
                            {/* Logo */}
                            <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-2xl">
                                <img
                                    className="h-16 w-16 rounded-xl object-contain"
                                    src={logo}
                                    alt="Cluezy logo"
                                />
                            </div>

                            {/* Title */}
                            <div className="space-y-3">
                                <h2 className="text-3xl font-semibold text-white tracking-tight">
                                    Welcome to <span className="text-blue-500">Cluezy</span>
                                </h2>
                                <p className="text-zinc-400 text-base max-w-lg mx-auto leading-relaxed">
                                    Your intelligent research assistant. Search the web, generate insights, and create images with AI.
                                </p>
                            </div>

                            {/* Suggested Prompts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 w-full max-w-2xl">
                                {[
                                    { icon: "🌐", text: "Search latest AI market trends" },
                                    { icon: "🧠", text: "Generate startup ideas" },
                                    { icon: "☁️", text: "What's the weather in Tokyo?" },
                                    { icon: "🖼️", text: "Create a futuristic logo design" },
                                ].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleQuickPrompt(suggestion.icon + " " + suggestion.text)}
                                        className="group px-5 py-4 bg-zinc-900 hover:bg-zinc-800 text-left rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex items-start gap-3"
                                    >
                                        <span className="text-xl mt-0.5">{suggestion.icon}</span>
                                        <span className="text-zinc-300 group-hover:text-white text-sm font-medium transition-colors">
                                            {suggestion.text}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>


                        //             {/* Footer Note */}
                            // {/* <div className="absolute bottom-1 text-[7px] text-gray-500">
                            //             Powered by <span className="text-blue-400 font-medium"><a href="https://www.cluezy.site">Cluezy Engine</a></span> ⚡
                            //         </div> */}
                        // </div>


                    ) : (
                        <div className="max-w-4xl mx-auto space-y-4 px-4">
                            <AnimatePresence>
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                                    >
                                        {msg.role === "assistant" && (
                                            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                                                <img
                                                    className="w-7 h-7 rounded-lg object-contain"
                                                    src={logo}
                                                    alt="Cluezy"
                                                />
                                            </div>
                                        )}

                                        <div className={`flex-1 ${msg.role === "user" ? "max-w-[75%]" : "max-w-[90%]"}`}>
                                            <div
                                                className={`rounded-2xl px-5 py-2 ${msg.role === "user"
                                                    ? "bg-zinc-900 border border-zinc-800 ml-auto"
                                                    : "bg-transparent border-zinc-900"
                                                    }`}
                                            >
                                                {msg.role === "assistant" ? (
                                                    <>
                                                        <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-zinc-300">
                                                            <ReactMarkdown
                                                                components={{

                                                                    body: ({ children }) => (<div>{children}</div>),
                                                                    // Headings
                                                                    h1: ({ children }) => (
                                                                        <h1 className="text-3xl font-bold text-white mt-8 mb-4 pb-2 border-b border-zinc-800 tracking-tight">
                                                                            {children}
                                                                        </h1>
                                                                    ),
                                                                    h2: ({ children }) => (
                                                                        <h2 className="text-2xl font-semibold text-white mt-6 mb-3 tracking-tight">
                                                                            {children}
                                                                        </h2>
                                                                    ),
                                                                    h3: ({ children }) => (
                                                                        <h3 className="text-xl font-semibold text-white mt-5 mb-2 tracking-tight">
                                                                            {children}
                                                                        </h3>
                                                                    ),

                                                                    // Paragraph
                                                                    p: ({ children }) => (
                                                                        <p className="mb-4 leading-7 text-zinc-300">{children}</p>
                                                                    ),

                                                                    // Links
                                                                    a: ({ href, children }) => (
                                                                            <div className="w-[150px] h-20 bg-gray-900 rounded-2xl border border-gray-800 p-4 flex flex-col items-center justify-between hover:bg-gray-800 transition-all duration-200">
                                                                                <a
                                                                                    href={href}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex flex-col items-center text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300 transition-colors duration-200"
                                                                                >
                                                                                    {/* 🖼️ Optional Image Preview */}
                                                                                    <img
                                                                                        src={`https://www.google.com/s2/favicons?domain=${href}&sz=128`}
                                                                                        alt="favicon"
                                                                                        className="w-5 h-5 mb-2 rounded"
                                                                                    />

                                                                                    {/* 🔗 Link Text */}
                                                                                    <span className="text-center text-sm font-medium">{children}</span>
                                                                                </a>
                                                                            </div>
                                                                    )
                                                                    ,

                                                                    // Code & Inline Code
                                                                    code({ inline, className, children, ...props }) {
                                                                        const match = /language-(\w+)/.exec(className || "");
                                                                        return !inline && match ? (
                                                                            <div className="my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/70 shadow-md">
                                                                                <SyntaxHighlighter
                                                                                    language={match[1]}
                                                                                    style={oneDark}
                                                                                    PreTag="div"
                                                                                    className="bg-black !p-4 text-sm"
                                                                                    showLineNumbers
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, "")}
                                                                                </SyntaxHighlighter>
                                                                            </div>
                                                                        ) : (
                                                                            <code className="bg-zinc-900/80 border border-zinc-800 px-1.5 py-0.5 rounded-md text-blue-400 text-sm font-mono">
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },

                                                                    // Blockquote
                                                                    blockquote: ({ children }) => (
                                                                        <blockquote className="border-l-4 border-blue-500 pl-4 py-3 my-4 bg-zinc-900/60 rounded-r-lg text-zinc-400 italic backdrop-blur-sm">
                                                                            {children}
                                                                        </blockquote>
                                                                    ),

                                                                    // Lists
                                                                    ul: ({ children }) => (
                                                                        <ul className="list-disc list-outside ml-6 space-y-2 text-zinc-300 mb-4">
                                                                            {children}
                                                                        </ul>
                                                                    ),
                                                                    ol: ({ children }) => (
                                                                        <ol className="list-decimal list-outside ml-6 space-y-2 text-zinc-300 mb-4">
                                                                            {children}
                                                                        </ol>
                                                                    ),
                                                                    li: ({ children }) => <li className="leading-7">{children}</li>,

                                                                    // Divider
                                                                    hr: () => <hr className="my-8 border-zinc-800" />,

                                                                    // Tables
                                                                    table: ({ children }) => (
                                                                        <div className="overflow-x-auto my-6 rounded-lg border border-zinc-800 shadow-sm">
                                                                            <table className="min-w-full text-sm text-left">{children}</table>
                                                                        </div>
                                                                    ),
                                                                    thead: ({ children }) => (
                                                                        <thead className="bg-zinc-900/80 border-b border-zinc-800">
                                                                            {children}
                                                                        </thead>
                                                                    ),
                                                                    th: ({ children }) => (
                                                                        <th className="px-4 py-3 text-zinc-200 font-semibold">{children}</th>
                                                                    ),
                                                                    td: ({ children }) => (
                                                                        <td className="px-4 py-3 text-zinc-400 border-t border-zinc-900">
                                                                            {children}
                                                                        </td>
                                                                    ),

                                                                    // Strong / Italic / Delete
                                                                    strong: ({ children }) => (
                                                                        <strong className="text-white font-semibold">{children}</strong>
                                                                    ),
                                                                    em: ({ children }) => (
                                                                        <em className="text-zinc-400 italic">{children}</em>
                                                                    ),
                                                                    del: ({ children }) => (
                                                                        <del className="text-zinc-500 line-through">{children}</del>
                                                                    ),

                                                                    // // 🖼️ Image
                                                                    // img: ({ src, alt }) => (
                                                                    //     <div className="flex justify-center my-6">
                                                                    //         <img
                                                                    //             src={src}
                                                                    //             alt={alt || "Image"}
                                                                    //             className="rounded-xl border border-zinc-800 shadow-md max-w-full max-h-[450px] object-contain hover:scale-[1.02] transition-transform duration-300"
                                                                    //         />
                                                                    //     </div>
                                                                    // ),

                                                                    // 🎥 Video
                                                                    // video: ({ src, controls = true }) => (
                                                                    //     <div className="flex justify-center my-6">
                                                                    //         <video
                                                                    //             src={src}
                                                                    //             controls={controls}
                                                                    //             className="rounded-xl border border-zinc-800 shadow-md max-w-full max-h-[500px] object-cover"
                                                                    //         />
                                                                    //     </div>
                                                                    // ),
                                                                }}
                                                            >
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-[15px] leading-7 text-zinc-200 whitespace-pre-wrap">
                                                        {msg.content}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {msg.role === "user" && (
                                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 text-white font-semibold">
                                                U
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {loading && (
                                <div className="flex justify-start gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                                        <span className="text-sm font-bold">C</span>
                                    </div>
                                    <div className="text-gray-400 text-sm animate-pulse">
                                        Thinking...
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div> {/* 👈 close messages wrapper properly */}

                {/* Input */}
                <footer className="px-4 py-5">
                    <div className="max-w-3xl mx-auto flex items-end gap-3 bg-[#0d0d0d]/80 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 focus-within:border-blue-500/70">

                        {/* Mode Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setShowModeMenu(!showModeMenu)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#161616] border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all duration-200 text-sm text-zinc-300"
                            >

                                <ActiveModeIcon size={16} />
                                <ChevronDown size={14} className={`transition-transform ${showModeMenu ? "rotate-180" : ""}`} />
                            </button>

                            {showModeMenu && (
                                <div className="absolute bottom-full mb-2 left-0 bg-[#0d0d0d]/95 border border-zinc-800 rounded-xl w-44 overflow-hidden shadow-xl backdrop-blur-md animate-fadeIn">
                                    {modes.map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => {
                                                setActiveMode(m.id);
                                                setShowModeMenu(false);
                                            }}
                                            className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${activeMode === m.id
                                                ? "bg-zinc-800 text-white"
                                                : "hover:bg-zinc-900 text-zinc-300"
                                                }`}
                                        >
                                            <m.icon size={16} />
                                            <span>{m.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="flex-1 relative">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={getPlaceholder()}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())
                                }
                                rows={1}
                                className="w-full bg-transparent resize-none outline-none text-[15px] text-zinc-100 placeholder-zinc-500 px-2 py-0 max-h-40 overflow-y-auto leading-6"
                            />

                            {/* Thinking shimmer while loading */}
                            {loading && (
                                <div className="absolute inset-y-0 right-3 flex items-center">
                                    <div className="flex items-center gap-2 text-sm text-zinc-400 animate-pulse">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                                        <span>Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSend}
                            disabled={loading || !query.trim()}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition-all duration-200 disabled:opacity-40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </footer>
            </div>
        </div >
    );
}
