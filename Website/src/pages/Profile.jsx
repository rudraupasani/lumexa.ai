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
            <div className="w-full max-w-2xl">
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
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 backdrop-blur-xl shadow-xl transition-all duration-300">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[var(--card-border)]">
                        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
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

                        <div>
                            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{user.user_metadata?.full_name || 'User'}</h2>
                            <p className="text-[var(--text-secondary)] text-sm mt-1">Lumexa User • Online</p>
                        </div>
                    </div>

                    {/* Appearance / Theme Switcher */}
                    <div className="mb-8 pb-8 border-b border-[var(--card-border)]">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-4">Appearance</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${theme === 'dark'
                                    ? 'bg-[var(--user-bubble)] border-[var(--accent)] text-[var(--accent)] shadow-md shadow-[var(--accent)]/5'
                                    : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <Moon size={18} />
                                <span className="font-semibold text-sm">Dark Theme</span>
                            </button>
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex-1 flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${theme === 'light'
                                    ? 'bg-[var(--user-bubble)] border-[var(--accent)] text-[var(--accent)] shadow-md shadow-[var(--accent)]/5'
                                    : 'bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:bg-[var(--user-bubble)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <Sun size={18} />
                                <span className="font-semibold text-sm">Light Theme</span>
                            </button>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Account details</h3>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                <Mail size={20} className="text-[var(--accent)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--text-secondary)]">Email Address</p>
                                <p className="text-[var(--text-primary)] mt-1 font-medium">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                <User size={20} className="text-[var(--accent)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--text-secondary)]">User ID</p>
                                <p className="text-[var(--text-primary)] mt-1 font-mono text-sm">{user.id}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-[var(--user-bubble)] flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                                <Calendar size={20} className="text-[var(--accent)]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-[var(--text-secondary)]">Member Since</p>
                                <p className="text-[var(--text-primary)] mt-1 font-medium">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
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
