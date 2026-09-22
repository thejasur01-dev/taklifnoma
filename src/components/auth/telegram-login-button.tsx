"use client";

import { useEffect, useRef } from "react";

type Props = {
  botUsername: string;
  /** Absolute URL Telegram redirects to with signed user data. */
  authUrl: string;
};

/**
 * Official Telegram Login Widget. It needs the site domain to be linked to
 * the bot via BotFather `/setdomain` — it does not work on localhost.
 * `request-access=write` lets the bot send notifications to the customer.
 */
export function TelegramLoginButton({ botUsername, authUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "10");
    script.setAttribute("data-auth-url", authUrl);
    script.setAttribute("data-request-access", "write");
    container.replaceChildren(script);

    return () => container.replaceChildren();
  }, [botUsername, authUrl]);

  return <div ref={containerRef} className="flex min-h-10 justify-center" />;
}
