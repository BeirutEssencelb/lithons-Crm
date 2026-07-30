"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Download, Loader2, Smartphone } from "lucide-react";
import {
  getExistingPushSubscription,
  isPushSupported,
  serializeSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push/client";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaNotificationsCard() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    setStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
        ("standalone" in navigator &&
          Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
    );

    getExistingPushSubscription()
      .then((sub) => setEnabled(Boolean(sub)))
      .catch(() => setEnabled(false));

    function onBip(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  async function enableNotifications() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new Error(
          "Push is not configured yet (missing NEXT_PUBLIC_VAPID_PUBLIC_KEY)."
        );
      }
      const sub = await subscribeToPush();
      const body = serializeSubscription(sub);
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save subscription");
      setEnabled(true);
      setMessage(
        "Notifications enabled. You’ll get follow-up and low-stock alerts."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable");
    } finally {
      setLoading(false);
    }
  }

  async function disableNotifications() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const sub = await getExistingPushSubscription();
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub?.endpoint }),
      });
      await unsubscribeFromPush();
      setEnabled(false);
      setMessage("Notifications disabled on this device.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable");
    } finally {
      setLoading(false);
    }
  }

  async function installApp() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setMessage("App installed. Open it from your home screen.");
      setInstallEvent(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-slate-100">Mobile app</h2>
        <p className="mt-1 text-sm text-slate-400">
          Install LITHOS on your phone and enable push alerts for follow-ups
          and low stock.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-start gap-3">
          <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200">Install app</p>
            {standalone ? (
              <p className="mt-1 text-xs text-emerald-400">
                Running as an installed app.
              </p>
            ) : installEvent ? (
              <Button
                type="button"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => void installApp()}
              >
                <Download className="h-3.5 w-3.5" />
                Install LITHOS
              </Button>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                On iPhone: Share → Add to Home Screen. On Android Chrome: menu →
                Install app / Add to Home screen.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-start gap-3">
          {enabled ? (
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
          ) : (
            <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-200">
              Push notifications
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Follow-up reminders and inventory stock alerts.
              {!supported
                ? " Not supported in this browser."
                : " iOS needs the installed home-screen app (16.4+)."}
            </p>
            {supported ? (
              <Button
                type="button"
                size="sm"
                variant={enabled ? "outline" : "default"}
                className="mt-2 gap-1.5"
                disabled={loading}
                onClick={() =>
                  void (enabled ? disableNotifications() : enableNotifications())
                }
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : enabled ? (
                  <BellOff className="h-3.5 w-3.5" />
                ) : (
                  <Bell className="h-3.5 w-3.5" />
                )}
                {enabled ? "Disable notifications" : "Enable notifications"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {message ? (
        <p className="text-xs text-emerald-400">{message}</p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </section>
  );
}
