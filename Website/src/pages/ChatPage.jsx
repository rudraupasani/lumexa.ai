import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "framer-motion";
// import { supabase } from "../utils/supabaseClient";
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
    Globe,
    FileText,
} from "lucide-react";

import logo from '../../public/logo.png'
import Weather from "../components/Weather";
import LinksURL from "../components/Links";
import Images from "../components/Images";

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

    const ChatURL = "https://lumexa-ai-2.onrender.com/api/generate";
    const SearchURL = "https://lumexa-ai-2.onrender.com/api/smart-search";

    const modes = [
        { id: "chat", label: "Chat", icon: MessageSquare },
        { id: "search", label: "Web", icon: Search },
        { id: "PDF", label: "PDF Finder", icon: FileText },
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
                console.log("Search API Response:", res.data);

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
            else if (activeMode === "PDF Finder") {


                const res = await axios.post("https://lumexa-ai-2.onrender.com/api/pdf-search", {
                    query: currentQuery,
                });

                const { pdfs } = res.data;

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
                        sources: pdfs, // 👈 reuse Links component
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

    console.log("messagesss : ", messages)

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
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 items-center justify-center">
                    {messages.length === 0 && !loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl font-bold text-white">
                                    Ask anything
                                </h1>
                                <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                    Lumexa helps you think, search, and create faster and smarter.
                                </p>
                            </div>
                            <footer className="px-4 py-1 w-full">
                                <div className="max-w-3xl mx-auto flex items-end gap-3 bg-[#0d0d0d]/50 backdrop-blur-md border border-zinc-800 rounded-3xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 focus-within:border-blue-500/70">

                                    {/* Mode Selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowModeMenu(!showModeMenu)}
                                            className={`
    group relative flex items-center justify-center
    w-9 h-9 rounded-xl cursor-pointer
    backdrop-blur-md border transition-all duration-200
    ${showModeMenu
                                                    ? "bg-[#0b0b0b]/90 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                                                    : "bg-[#141414]/80 border-white/10 hover:bg-[#1a1a1a]"
                                                }
  `}
                                        >
                                            {/* Soft hover glow */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition pointer-events-none" />

                                            {/* Active Mode Icon */}
                                            <Globe
                                                size={16}
                                                className={`
      transition-colors duration-200
      ${showModeMenu
                                                        ? "text-blue-400"
                                                        : "text-zinc-400 group-hover:text-white"
                                                    }
    `}
                                            />

                                            {/* Chevron overlay */}
                                        </button>


                                        {showModeMenu && (
                                            <div className="absolute bottom-full mb-3 left-0 w-56 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#0b0b0b]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-fadeIn">

                                                {/* Header */}
                                                <div className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 border-b border-white/5">
                                                    Modes
                                                </div>

                                                {/* Mode List */}
                                                <div className="p-2 space-y-1">
                                                    {modes.map((m) => {
                                                        const active = activeMode === m.id;

                                                        return (
                                                            <button
                                                                key={m.id}
                                                                onClick={() => {
                                                                    setActiveMode(m.id);
                                                                    setShowModeMenu(false);
                                                                }}
                                                                className={`
                                                                  group w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                                                                ${active
                                                                        ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-inner"
                                                                        : "hover:bg-white/5 text-zinc-300"
                                                                    }
                                                           `}
                                                            >
                                                                {/* Icon */}
                                                                <div
                                                                    className={`
                                                                          flex items-center justify-center w-9 h-9 rounded-lg transition
                                                                          ${active
                                                                            ? "bg-blue-500/20 text-blue-400"
                                                                            : "bg-white/5 text-zinc-400 group-hover:text-white"
                                                                        }
                                                                 `}
                                                                >
                                                                    <m.icon size={16} />
                                                                </div>

                                                                {/* Label */}
                                                                <div className="flex flex-col items-start text-left">
                                                                    <span className="font-medium leading-tight">
                                                                        {m.label}
                                                                    </span>
                                                                    <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                                                        Smart {m.label.toLowerCase()} responses
                                                                    </span>
                                                                </div>

                                                                {/* Active Indicator */}
                                                                {active && (
                                                                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
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
                                        className="p-2.5 rounded-xl cursor-pointer bg-black hover:opacity-90 transition-all duration-200 disabled:opacity-40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </footer>
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
                                                    className="w-10 h-10 rounded-lg object-contain"
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

                                                            {msg.sources?.length > 0 && (
                                                                <LinksURL data={msg.sources} />
                                                            )}

                                                            {msg.images?.length > 0 && (
                                                                <Images images={msg.images} />
                                                            )}

                                                            <ReactMarkdown
                                                                components={{
                                                                    // Root
                                                                    body: ({ children }) => (
                                                                        <div className="prose prose-invert max-w-none">{children}</div>
                                                                    ),


                                                                    /* =========================
                                                                       HEADINGS
                                                                    ========================= */
                                                                    h1: ({ children }) => (
                                                                        <h1 className="text-3xl font-bold text-white mt-10 mb-5 pb-3 border-b border-zinc-800 tracking-tight">
                                                                            {children}
                                                                        </h1>
                                                                    ),
                                                                    h2: ({ children }) => (
                                                                        <h2 className="text-2xl font-semibold text-white mt-8 mb-4 tracking-tight">
                                                                            {children}
                                                                        </h2>
                                                                    ),
                                                                    h3: ({ children }) => (
                                                                        <h3 className="text-xl font-semibold text-white mt-6 mb-3 tracking-tight">
                                                                            {children}
                                                                        </h3>
                                                                    ),

                                                                    /* =========================
                                                                       PARAGRAPH
                                                                    ========================= */
                                                                    p: ({ children }) => (
                                                                        <p className="mb-4 leading-7 text-zinc-300 text-[15px]">
                                                                            {children}
                                                                        </p>
                                                                    ),
                                                                

                                                                    /* =========================
                                                                       LINKS
                                                                    ========================= */
                                                                    a: ({ href, children }) => (
                                                                        <a
                                                                            href={href}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-400/30 hover:decoration-blue-300 transition-colors duration-200"
                                                                        >
                                                                            <img
                                                                                src={`https://www.google.com/s2/favicons?domain=${href}&sz=64`}
                                                                                alt=""
                                                                                className="w-3 h-3 rounded-sm opacity-80 group-hover:opacity-100"
                                                                            />
                                                                        </a>
                                                                    ),

                                                                    /* =========================
                                                                       CODE
                                                                    ========================= */
                                                                    code({ inline, className, children, ...props }) {
                                                                        const match = /language-(\w+)/.exec(className || "");
                                                                        return !inline && match ? (
                                                                            <div className="my-6 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80 shadow-lg">
                                                                                <SyntaxHighlighter
                                                                                    language={match[1]}
                                                                                    style={oneDark}
                                                                                    PreTag="div"
                                                                                    className="!bg-black !p-4 text-sm"
                                                                                    showLineNumbers
                                                                                    {...props}
                                                                                >
                                                                                    {String(children).replace(/\n$/, "")}
                                                                                </SyntaxHighlighter>
                                                                            </div>
                                                                        ) : (
                                                                            <code className="rounded-md bg-zinc-900/80 border border-zinc-800 px-1.5 py-0.5 font-mono text-sm text-blue-400">
                                                                                {children}
                                                                            </code>
                                                                        );
                                                                    },

                                                                    /* =========================
                                                                       BLOCKQUOTE
                                                                    ========================= */
                                                                    blockquote: ({ children }) => (
                                                                        <blockquote className="my-5 border-l-4 border-blue-500 bg-zinc-900/60 pl-5 py-4 rounded-r-lg italic text-zinc-400 backdrop-blur-sm">
                                                                            {children}
                                                                        </blockquote>
                                                                    ),

                                                                    /* =========================
                                                                       LISTS
                                                                    ========================= */
                                                                    ul: ({ children }) => (
                                                                        <ul className="list-disc ml-6 mb-4 space-y-2 text-zinc-300">
                                                                            {children}
                                                                        </ul>
                                                                    ),
                                                                    ol: ({ children }) => (
                                                                        <ol className="list-decimal ml-6 mb-4 space-y-2 text-zinc-300">
                                                                            {children}
                                                                        </ol>
                                                                    ),
                                                                    li: ({ children }) => (
                                                                        <li className="leading-7 text-[15px]">{children}</li>
                                                                    ),

                                                                    /* =========================
                                                                       TABLES
                                                                    ========================= */
                                                                    // Professional, production-ready table components (MDX / React)
                                                                    // Designed for analytical, research-style outputs

                                                                    table: ({ children }) => (
                                                                        <div className="my-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                                                                            <table className="min-w-full border-collapse text-sm">
                                                                                {children}
                                                                            </table>
                                                                        </div>
                                                                    ),

                                                                    thead: ({ children }) => (
                                                                        <thead className="bg-zinc-900/90 border-b border-zinc-800">
                                                                            {children}
                                                                        </thead>
                                                                    ),

                                                                    tbody: ({ children }) => (
                                                                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                                                            {children}
                                                                        </tbody>
                                                                    ),

                                                                    tr: ({ children }) => (
                                                                        <tr className="transition-colors hover:bg-zinc-900/60">
                                                                            {children}
                                                                        </tr>
                                                                    ),

                                                                    th: ({ children }) => (
                                                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-100">
                                                                            {children}
                                                                        </th>
                                                                    ),

                                                                    td: ({ children }) => (
                                                                        <td className="px-5 py-4 align-top leading-relaxed text-zinc-300">
                                                                            {children}
                                                                        </td>
                                                                    ),


                                                                    /* =========================
                                                                       DIVIDER
                                                                    ========================= */
                                                                    hr: () => (
                                                                        <hr className="my-10 border-zinc-800" />
                                                                    ),

                                                                    /* =========================
                                                                       TEXT EMPHASIS
                                                                    ========================= */
                                                                    strong: ({ children }) => (
                                                                        <strong className="font-semibold text-white">{children}</strong>
                                                                    ),
                                                                    em: ({ children }) => (
                                                                        <em className="italic text-zinc-400">{children}</em>
                                                                    ),
                                                                    del: ({ children }) => (
                                                                        <del className="text-zinc-500 line-through">{children}</del>
                                                                    ),


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
                </div>


                {/* Input */}

                {messages.length > 1 && (
                    <footer className="px-4 py-5">
                        <div className="max-w-3xl mx-auto flex items-end gap-3 bg-[#0d0d0d]/50 backdrop-blur-md border border-zinc-800 rounded-3xl px-4 py-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-300 focus-within:border-blue-500/70">

                            {/* Mode Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowModeMenu(!showModeMenu)}
                                    className={`
    group relative flex items-center justify-center
    w-9 h-9 rounded-xl cursor-pointer
    backdrop-blur-md border transition-all duration-200
    ${showModeMenu
                                            ? "bg-[#0b0b0b]/90 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                                            : "bg-[#141414]/80 border-white/10 hover:bg-[#1a1a1a]"
                                        }
  `}
                                >
                                    {/* Soft hover glow */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition pointer-events-none" />

                                    {/* Active Mode Icon */}
                                    <Globe
                                        size={16}
                                        className={`
      transition-colors duration-200
      ${showModeMenu
                                                ? "text-blue-400"
                                                : "text-zinc-400 group-hover:text-white"
                                            }
    `}
                                    />

                                    {/* Chevron overlay */}
                                </button>


                                {showModeMenu && (
                                    <div className="absolute bottom-full mb-3 left-0 w-56 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#0b0b0b]/90 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] animate-fadeIn">

                                        {/* Header */}
                                        <div className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-500 border-b border-white/5">
                                            Modes
                                        </div>

                                        {/* Mode List */}
                                        <div className="p-2 space-y-1">
                                            {modes.map((m) => {
                                                const active = activeMode === m.id;

                                                return (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => {
                                                            setActiveMode(m.id);
                                                            setShowModeMenu(false);
                                                        }}
                                                        className={`
                                                                  group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                                                                ${active
                                                                ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-inner"
                                                                : "hover:bg-white/5 text-zinc-300"
                                                            }
                                                           `}
                                                    >
                                                        {/* Icon */}
                                                        <div
                                                            className={`
                                                                          flex items-center justify-center w-9 h-9 rounded-lg transition
                                                                          ${active
                                                                    ? "bg-blue-500/20 text-blue-400"
                                                                    : "bg-white/5 text-zinc-400 group-hover:text-white"
                                                                }
                                                                 `}
                                                        >
                                                            <m.icon size={16} />
                                                        </div>

                                                        {/* Label */}
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className="font-medium leading-tight">
                                                                {m.label}
                                                            </span>
                                                            <span className="text-xs text-zinc-500 group-hover:text-zinc-400">
                                                                Smart {m.label.toLowerCase()} responses
                                                            </span>
                                                        </div>

                                                        {/* Active Indicator */}
                                                        {active && (
                                                            <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
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
                                className="p-2.5 rounded-xl bg-black hover:opacity-90 transition-all duration-200 disabled:opacity-40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div >
    );
}
