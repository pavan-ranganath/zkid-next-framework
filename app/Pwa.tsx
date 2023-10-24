"use client";

import { useEffect } from "react";
const isDev = process.env.NODE_ENV !== "production";

export default function Pwa() {
  let sw: ServiceWorkerContainer | undefined;

  if (typeof window !== "undefined") {
    sw = window?.navigator?.serviceWorker;
  }

  useEffect(() => {
    if (sw && isDev) {
      sw.register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("Service Worker registration successful with scope: ", registration.scope);
        })
        .catch((err) => {
          console.log("Service Worker registration failed: ", err);
        });
    }
  }, [sw, isDev]);

  return <></>;
}
