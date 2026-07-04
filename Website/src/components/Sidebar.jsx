import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, ChevronDown, Star, Layout, Settings, Bot, Plus, ChevronRight, Pencil, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ showHistory, setShowHistory, chats, loadChat, deleteChat, onNewChat }) => {
  const [activeNav, setActiveNav] = useState('chats');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && showHistory) setShowHistory(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showHistory, setShowHistory]);

  const navItems = [
    { id: 'search', label: 'Search chats', icon: Search, shortcut: 'Ctrl + O' },
    { id: 'library', label: 'Library', icon: Layout },
  ];

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now - d;
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH}h ago`;
      const diffD = Math.floor(diffH / 24);
      if (diffD === 1) return 'Yesterday';
      if (diffD < 7) return `${diffD} days ago`;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const displayedChats = chats.slice(0, 5);

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowHistory(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            style={{ backdropFilter: 'blur(2px)' }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: showHistory ? 240 : 0,
          opacity: showHistory ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        className="sidebar"
        style={{
          width: showHistory ? 240 : 0,
          minWidth: 0,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Sparkles size={18} color="white" />
          </div>
          <span className="sidebar-logo-text">Lumexa AI</span>
          <button
            onClick={() => setShowHistory(false)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-white-opacity-40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: 7,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--recent-item-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <X size={15} />
          </button>
        </div>

        {/* New Chat Button */}
        <button className="sidebar-new-chat" onClick={onNewChat} id="sidebar-new-chat" style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-white-opacity-90)', padding: '10px 12px', margin: '4px 8px 16px', fontWeight: 500 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '8px' }}>
            <Plus size={12} color="white" />
          </div>
          New chat
        </button>


        {/* Recent Chats */}
        {chats.length > 0 && (
          <>
            <p className="sidebar-section-label">Recent Chats</p>
            <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-hide">
              {displayedChats.map((chat, i) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="sidebar-recent-item"
                  onClick={() => { loadChat(chat); setShowHistory(false); }}
                >
                  <div className="sidebar-recent-item-icon">
                    <MessageSquare size={12} color="var(--text-white-opacity-55)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sidebar-recent-title">{chat.title}</div>
                  </div>
                  <span className="sidebar-recent-time">{formatTime(chat.date)}</span>
                  <button
                    className="sidebar-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </motion.div>
              ))}
            </div>

            {chats.length > 5 && (
              <button className="sidebar-view-all">
                <Star size={12} />
                View all
              </button>
            )}
          </>
        )}

        <div className="sidebar-spacer" />

        {/* User Area */}
        <div className="sidebar-user-area">
          <button
            className="sidebar-user-row"
            onClick={() => navigate('/profile')}
          >
            <div className="sidebar-avatar">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" />
              ) : (
                <span>{user?.email?.[0]?.toUpperCase() || 'J'}</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <div className="sidebar-user-name">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'John Doe'}
              </div>
              <div className="sidebar-user-email">
                {user?.email || 'john.doe@email.com'}
              </div>
            </div>
            <ChevronDown size={14} className="sidebar-user-chevron" />
          </button>

          {!user && (
            <button className="sidebar-upgrade-btn" onClick={() => navigate('/login')}>
              <Star size={14} />
              Upgrade to Pro
              <ChevronRight size={14} style={{ marginLeft: 'auto' }} />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};
