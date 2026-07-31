import React, { use, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) console.error("Google Login Error:", error);
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        minHeight: '100vh',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        background: 'linear-gradient(to top right, #000, #18181b, rgba(0,0,0,0.8))',
      }}
    >
      {/* Ambient Glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>

      {/* Login Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '28rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(24px)',
          padding: '3rem 2.5rem',
          background: '#000',
          boxShadow: '0 0 40px rgba(0,0,0,0.6)',
        }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: 600, color: '#fff', letterSpacing: '-0.025em' }}>
          Welcome to <span style={{ color: '#60a5fa' }}>Lumexa</span>
        </h1>

        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#a1a1aa', lineHeight: 1.6 }}>
          Sign in to access{" "}
          <span style={{ color: '#60a5fa', fontWeight: 500 }}>
            Lumexa Smart Web Intelligence
          </span>
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          style={{
            marginTop: '2rem',
            display: 'flex',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#fff',
            transition: 'all 0.3s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            style={{ height: '1.25rem', width: '1.25rem' }}
          />
          Continue with Google
        </button>

        {/* Footer */}
        <p style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#71717a' }}>
          By continuing, you agree to our{" "}
          <span style={{ color: '#60a5fa', cursor: 'pointer' }}>
            Terms
          </span>{" "}
          &{" "}
          <span style={{ color: '#60a5fa', cursor: 'pointer' }}>
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
