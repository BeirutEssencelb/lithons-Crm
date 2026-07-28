"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, Lock, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MIN_PASSWORD_LENGTH = 8;

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-xs font-medium tracking-wide text-slate-400 uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-500 sm:left-4" />
        <Input
          id={id}
          required
          type={show ? "text" : "password"}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          className="h-12 rounded-xl pr-12 pl-11 text-base sm:h-12 sm:pl-12 md:text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function ChangePasswordForm() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("You must be signed in to change your password.");
      return;
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (updateError) throw updateError;

      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400 sm:p-6">
        Loading account…
      </div>
    );
  }

  if (!email) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-sm text-slate-400 sm:p-6">
        Sign in to change your password.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl",
        "p-4 sm:p-6 md:max-w-lg md:p-8"
      )}
    >
      <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/15 sm:h-12 sm:w-12">
          <KeyRound className="h-5 w-5 text-brand-400 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold sm:text-lg">Reset password</h2>
          <p className="mt-0.5 break-all text-xs text-slate-500 sm:truncate sm:text-sm">
            {email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-3 text-sm leading-snug text-red-400">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-3 text-sm leading-snug text-emerald-400">
            {success}
          </div>
        ) : null}

        <PasswordField
          id="new-password"
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          show={showNew}
          onToggleShow={() => setShowNew((v) => !v)}
          placeholder="At least 8 characters"
          disabled={loading}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
          placeholder="Re-enter new password"
          disabled={loading}
        />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full touch-manipulation text-base font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </form>
    </div>
  );
}
