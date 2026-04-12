// SP3-13 — PWA install prompt
// Shows a custom "Add to Home Screen" banner when beforeinstallprompt fires.
// Chrome Android only (D2-S3-Q6). Dismissible, remembered in localStorage.

"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === "true") return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, "true");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-md p-3">
      <div className="flex items-center gap-3 rounded-xl bg-blue-800 px-4 py-3 text-white shadow-lg">
        <div className="flex-1">
          <p className="text-sm font-semibold">Install Career Accelerator</p>
          <p className="text-xs text-blue-200">
            Add to home screen for the full app experience
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 active:bg-blue-50"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 text-blue-200 hover:text-white"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
