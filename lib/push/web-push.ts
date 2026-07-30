import webpush from "web-push";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function configureVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:nico@lithosnaturalstone.com";

  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing VAPID keys. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY."
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
}

export async function sendWebPush(
  subscription: PushSubscriptionRecord,
  payload: PushPayload
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  configureVapid();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url || "/leads",
      })
    );
    return { ok: true };
  } catch (err) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err
        ? Number((err as { statusCode: number }).statusCode)
        : undefined;
    if (statusCode === 404 || statusCode === 410) {
      return { ok: false, gone: true };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Push failed",
    };
  }
}
