import React from 'react';
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

    if (!user) {
        navigate('/');
        return null;
    }

    return (
        <div className="min-h-screen min-w-screen bg-[var(--chat-bg)] text-[var(--text-primary)] transition-colors duration-300 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm mb-4 flex items-center gap-2 cursor-pointer font-medium"
                    >
                        ← Back to Chat
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Profile</h1>
                    <p className="text-[var(--text-secondary)] mt-2">Manage your account settings</p>
                </div>

                {/* Profile Card */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-xl transition-all duration-300 overflow-hidden">
                    {/* Card Banner Background */}
                    <div className="h-32 w-full bg-gradient-to-r from-blue-600/30 via-accent/20 to-purple-600/30 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Avatar & Info Section (Overlapping) */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20 mb-8 pb-8 border-b border-[var(--card-border)]">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden flex items-center justify-center text-3xl sm:text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg border-4 border-[var(--card-bg)] flex-shrink-0">
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
                                <h2 className="text-2xl font-bold text-[var(--text-primary)] truncate">{user.user_metadata?.full_name || 'User'}</h2>
                                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                                    <p className="text-[var(--text-secondary)] text-sm font-medium">Lumexa Account Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Appearance / Theme Switcher */}
                        <div className="mb-8 pb-8 border-b border-[var(--card-border)]">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Appearance Preferences</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${theme === 'dark'
                                        ? 'bg-[var(--user-bubble)] border-[var(--accent)] text-[var(--accent)] shadow-md shadow-[var(--accent)]/5 font-semibold'
                                        : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Moon size={18} />
                                    <span className="text-sm">Dark Theme</span>
                                </button>
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${theme === 'light'
                                        ? 'bg-[var(--user-bubble)] border-[var(--accent)] text-[var(--accent)] shadow-md shadow-[var(--accent)]/5 font-semibold'
                                        : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Sun size={18} />
                                    <span className="text-sm">Light Theme</span>
                                </button>
                            </div>
                        </div>

                        {/* Account Details in responsive grid */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Account details</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Mail size={18} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">Email Address</p>
                                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">{user.email}</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <User size={18} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">User ID</p>
                                        <p className="text-sm font-mono text-[var(--text-primary)] truncate mt-0.5" title={user.id}>{user.id}</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Calendar size={18} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">Member Since</p>
                                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">
                                            {new Date(user.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-4 flex items-center gap-4 transition-all duration-300">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0">
                                        <Sun size={18} className="text-[var(--accent)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-[var(--text-secondary)] font-medium">Subscription Tier</p>
                                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate mt-0.5">Lumexa Free Tier</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sign Out Button */}
                        <div className="mt-8 pt-8 border-t border-[var(--card-border)]">
                            <button
                                onClick={handleSignOut}
                                className="flex items-center justify-center cursor-pointer gap-3 w-full px-6 py-3.5 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-xl text-red-500 hover:text-red-400 font-semibold transition-all duration-200"
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
