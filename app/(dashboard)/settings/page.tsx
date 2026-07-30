import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/features/settings/components/change-password-form";
import { PwaNotificationsCard } from "@/features/settings/components/pwa-notifications-card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-lg space-y-6 lg:mx-0 lg:max-w-xl">
      <div className="mb-1 sm:mb-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-400 sm:text-base">
          {user?.email ? (
            <>
              <span className="text-slate-500">Signed in as </span>
              <span className="break-all text-slate-300">{user.email}</span>
            </>
          ) : (
            "Account settings"
          )}
        </p>
      </div>

      <PwaNotificationsCard />

      <section aria-labelledby="password-heading">
        <h2 id="password-heading" className="sr-only">
          Reset password
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
