import React, { useEffect } from 'react';
import { X, MessageSquare, Trash2, Clock, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = ({ showHistory, setShowHistory, chats, loadChat, deleteChat }) => {

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' && showHistory) setShowHistory(false);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [showHistory, setShowHistory]);

    return (
        <>
            {/* ── Mobile Backdrop ── */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setShowHistory(false)}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── Sidebar Panel ── */}
            <motion.div
                initial={false}
                animate={{ width: showHistory ? 260 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 35, mass: 0.8 }}
                className="relative z-40 h-screen shrink-0 overflow-hidden"
                style={{ minWidth: 0 }}
            >
                {/* Inner content — always 260px wide, slides with parent */}
                <div className="w-[260px] h-full flex flex-col bg-[#0a0a0a] border-r border-zinc-800/70">

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800/50">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/25 flex items-center justify-center">
                                <Clock size={13} className="text-indigo-400" />
                            </div>
                            <span className="text-sm font-semibold text-white tracking-tight">History</span>
                            {chats.length > 0 && (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    {chats.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setShowHistory(false)}
                            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Chat List */}
                    <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-hide">
                        {chats.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                                    <MessageSquare size={20} className="text-zinc-600" />
                                </div>
                                <p className="text-sm font-medium text-zinc-400">No chats yet</p>
                                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                                    Start a conversation to see it here
                                </p>
                            </div>
                        ) : (
                            chats.map((chat, i) => (
                                <motion.div
                                    key={chat.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group relative flex items-center gap-2 px-3 py-2.5 rounded-xl
                                               hover:bg-zinc-800/70 active:bg-zinc-800
                                               transition-all duration-150 cursor-pointer
                                               border border-transparent hover:border-zinc-700/50"
                                >
                                    {/* Icon */}
                                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0
                                                    group-hover:border-indigo-500/30 group-hover:bg-indigo-600/10 transition-all">
                                        <MessageSquare size={13} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                    </div>

                                    {/* Text */}
                                    <button
                                        onClick={() => { loadChat(chat); setShowHistory(false); }}
                                        className="flex-1 text-left min-w-0"
                                    >
                                        <p className="text-[13px] text-white font-medium truncate leading-snug">
                                            {chat.title}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                                            {chat.date}
                                        </p>
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (window.confirm('Delete this chat?')) deleteChat(chat.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/15 rounded-md transition-all shrink-0 cursor-pointer"
                                        title="Delete chat"
                                    >
                                        <Trash2 size={13} className="text-red-400" />
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 border-t border-zinc-800/50">
                        <p className="text-xs text-zinc-600 text-center">
                            {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'}
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
