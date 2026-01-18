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
    <div className="relative overflow-hidden w-full">
      {/* Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full bg-black max-w-md rounded-2xl border border-white/10 backdrop-blur-2xl px-10 py-12 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <h1 className="text-3xl font-semibold text-white tracking-tight">
          Welcome to <span className="text-blue-400">Lumexa</span>
        </h1>

        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
          Sign in to access{" "}
          <span className="text-blue-400 font-medium">
            Lumexa Smart Web Intelligence
          </span>
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="mt-8 flex cursor-pointer items-center justify-center gap-3 w-full rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 py-3 text-sm font-medium text-white transition-all duration-300"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5"
          />
          Continue with Google
        </button>

        {/* Footer */}
        <p className="mt-10 text-center text-xs text-zinc-500">
          By continuing, you agree to our{" "}
          <span className="text-blue-400 hover:underline cursor-pointer">
            Terms
          </span>{" "}
          &{" "}
          <span className="text-blue-400 hover:underline cursor-pointer">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
