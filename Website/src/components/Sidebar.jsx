import React from 'react';
import { X, MessageSquare, Trash2 } from 'lucide-react';

export const Sidebar = ({ showHistory, setShowHistory, chats, loadChat, deleteChat }) => {
    return (
        <div
            className={`fixed inset-y-0 left-0 z-50 w-75 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out ${showHistory ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-semibold">Chat History</h2>
                    <button
                        onClick={() => setShowHistory(false)}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {chats.length === 0 ? (
                        <div className="text-center text-zinc-500 mt-8 px-4">
                            <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm">No chat history yet</p>
                            <p className="text-xs mt-1">Start a conversation to see it here</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <div
                                key={chat.id}
                                className="group relative flex items-center gap-2 p-3 rounded-lg hover:bg-zinc-800/50 transition-all cursor-pointer border border-transparent hover:border-zinc-700"
                            >
                                <button
                                    onClick={() => loadChat(chat)}
                                    className="flex-1 text-left"
                                >
                                    <div className="flex items-start gap-2">
                                        <MessageSquare size={16} className="mt-1 shrink-0 text-zinc-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate font-medium">
                                                {chat.title}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {chat.date}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Delete this chat?')) {
                                            deleteChat(chat.id);
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-600/20 rounded-md transition-all shrink-0"
                                    title="Delete chat"
                                >
                                    <Trash2 size={14} className="text-red-400" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-600 text-center">
                        {chats.length} {chats.length === 1 ? 'conversation' : 'conversations'} saved
                    </p>
                </div>
            </div>
        </div>
    );
};
