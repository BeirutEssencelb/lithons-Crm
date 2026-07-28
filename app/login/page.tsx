"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, LogIn, Mail, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/logo";
import { DEV_PREVIEW_COOKIE } from "@/lib/supabase/config";

const supabaseReady =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder") &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project") &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes("placeholder");

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function enterPreview() {
    document.cookie = `${DEV_PREVIEW_COOKIE}=1; path=/; max-age=604800; samesite=lax`;
    router.push("/");
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);

    if (!supabaseReady) {
      setError(
        "Supabase is not configured. Use Preview mode below, or add real keys to .env.local."
      );
      setSubmitting(false);
      return;
    }

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message);
        } else {
          setInfo(
            "Account created. Check your email to confirm, then sign in."
          );
          setIsSignUp(false);
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          setError(loginError.message);
        } else {
          router.push("/");
          router.refresh();
        }
      }
    } catch {
      setError(
        "Could not reach Supabase. Check your internet connection and .env.local keys."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-dvh items-center justify-center bg-slate-950 px-4 py-8 sm:py-10"
      style={{
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-sm">
        <Logo size="lg" className="mb-6 sm:mb-8" />

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-xl sm:p-6">
          {!supabaseReady ? (
            <div className="mb-4 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-300">
              Auth is not connected yet (placeholder Supabase keys). You can
              still preview the app.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-400">
                {info}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required={supabaseReady}
                  type="email"
                  autoComplete="email"
                  disabled={!supabaseReady}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pr-3 pl-10 text-sm placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 focus:outline-none disabled:opacity-50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  required={supabaseReady}
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  minLength={6}
                  disabled={!supabaseReady}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-2.5 pr-10 pl-10 text-sm placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 focus:outline-none disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {supabaseReady ? (
              <>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-400 disabled:opacity-60"
                >
                  {isSignUp ? (
                    <UserPlus className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {submitting
                    ? "Please wait..."
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setInfo("");
                  }}
                  className="w-full text-sm text-slate-400 transition-colors hover:text-brand-400"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Need an account? Create one"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={enterPreview}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-colors hover:bg-brand-400"
              >
                <LogIn className="h-4 w-4" />
                Enter app (preview)
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
