import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Mail, Calendar } from 'lucide-react';

export default function Profile() {
    const { user, signOut } = useAuth();
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
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="text-zinc-400 hover:text-white transition-colors text-sm mb-4"
                    >
                        ← Back to Chat
                    </button>
                    <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
                    <p className="text-zinc-400 mt-2">Manage your account settings</p>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-zinc-800">
                        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600">
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
                            <h2 className="text-xl font-semibold">{user.user_metadata?.full_name || 'User'}</h2>
                            <p className="text-zinc-400 text-sm mt-1">Lumexa User</p>
                        </div>
                    </div>

                    {/* Account Details */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                <Mail size={20} className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-zinc-400">Email Address</p>
                                <p className="text-white mt-1">{user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                <User size={20} className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-zinc-400">User ID</p>
                                <p className="text-white mt-1 font-mono text-sm">{user.id.slice(0, 20)}...</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                <Calendar size={20} className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-zinc-400">Member Since</p>
                                <p className="text-white mt-1">
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
                    <div className="mt-8 pt-8 border-t border-zinc-800">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center cursor-pointer gap-3 w-full px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-zinc-600">
                        Lumexa Smart Web Intelligence • Version 1.0
                    </p>
                </div>
            </div>
        </div>
    );
}
