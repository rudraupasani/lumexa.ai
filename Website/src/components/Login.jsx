import React, { useEffect, useState } from "react";
// import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    // Auth state listener (important!)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          navigate("/"); // Redirect to Home
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // optional but recommended
      },
    });

    if (error) console.error("Google Login Error:", error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-black to-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.15)_0%,transparent_60%)] blur-3xl pointer-events-none"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.4)] p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          Welcome to Cluezy 🔍
        </h1>
        <p className="text-zinc-400 mb-8 text-sm">
          Sign in to continue exploring with{" "}
          <span className="text-blue-400 font-medium">
            Lumexa Smart Web Intelligence
          </span>
        </p>

        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full py-3 px-5 bg-blue-600/80 hover:bg-blue-600 rounded-xl font-medium text-white transition-all duration-300 gap-3"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <div className="mt-10 text-xs text-zinc-500">
          <p>
            By signing in, you agree to Cluezy’s{" "}
            <span className="text-blue-400 hover:underline">Terms</span> &{" "}
            <span className="text-blue-400 hover:underline">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
