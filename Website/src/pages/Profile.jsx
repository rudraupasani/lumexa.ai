import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Calendar, Sun, Moon } from 'lucide-react';

export default function Profile() {
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            await signOut();
            navigate('/');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div style={{
            height: '100%',
            width: '100%',
            background: 'var(--chat-bg)',
            color: 'var(--text-primary)',
            transition: 'color 0.3s, background 0.3s',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '48px 24px',
        }}>
            <div className="w-full max-w-6xl" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mb-4 flex items-center gap-2 cursor-pointer font-medium"
                    >
                        ← Back to Chat
                    </button>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">Profile</h1>
                    <p className="text-[var(--text-secondary)] mt-2 text-base">Manage your account settings and preference details</p>
                </div>

                {/* Profile Card */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Card Banner Background */}
                    <div className="h-48 sm:h-60 w-full bg-gradient-to-r from-blue-600/30 via-accent/25 to-purple-600/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-15" />
                    </div>

                    <div className="p-8 sm:p-12">
                        {/* Avatar & Info Section (Overlapping) */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-24 sm:-mt-28 mb-10 pb-10 border-b border-[var(--card-border)]">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden flex items-center justify-center text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-2xl border-4 border-[var(--card-bg)] flex-shrink-0">
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.email?.[0]?.toUpperCase() || "U"
                                )}
                            </div>

                            <div className="text-center sm:text-left flex-1 min-w-0">
                                <h2 className="text-3xl font-extrabold text-[var(--text-primary)] truncate">{user.user_metadata?.full_name || 'User'}</h2>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" />
                                    <p className="text-[var(--text-secondary)] text-sm font-semibold">Lumexa Account Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Appearance / Theme Switcher */}
                        <div className="mb-10 pb-10 border-b border-[var(--card-border)]">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-5">Appearance Preferences</h3>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-200 cursor-pointer ${theme === 'dark'
                                        ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/60 text-orange-400 shadow-xl shadow-orange-500/5 font-extrabold'
                                        : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)] hover:border-gray-700/50'
                                        }`}
                                >
                                    <Moon size={18} />
                                    <span className="text-sm font-semibold">Dark Theme</span>
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-200 cursor-pointer ${theme === 'light'
                                        ? 'bg-gradient-to-r from-orange-500/10 to-amber-500/5 border-orange-500/60 text-orange-400 shadow-xl shadow-orange-500/5 font-extrabold'
                                        : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)] hover:border-gray-300/30'
                                        }`}
                                >
                                    <Sun size={18} />
                                    <span className="text-sm font-semibold">Light Theme</span>
                                </button>
                            </div>
                        </div>

                        {/* Account Details in responsive grid */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Account details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Mail size={20} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-semibold">Email Address</p>
                                        <p className="text-base font-bold text-[var(--text-primary)] truncate mt-1">{user.email}</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <User size={20} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-semibold">User ID</p>
                                        <p className="text-sm font-mono font-bold text-[var(--text-primary)] truncate mt-1" title={user.id}>{user.id}</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Calendar size={20} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-semibold">Member Since</p>
                                        <p className="text-base font-bold text-[var(--text-primary)] truncate mt-1">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-2xl p-5 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Sun size={20} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-semibold">Subscription Tier</p>
                                        <p className="text-base font-bold text-[var(--text-primary)] truncate mt-1">Lumexa Free Tier</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="mt-10 pt-10 border-t border-[var(--card-border)]">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center cursor-pointer gap-3 w-full px-6 py-4 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-2xl text-red-500 hover:text-red-400 font-bold transition-all duration-200"
                            >
                                <LogOut size={20} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--text-muted)]">
                        Lumexa Smart Web Intelligence • Version 1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
