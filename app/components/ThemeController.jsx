"use client";
import { useEffect } from "react";

/**
 * Gère le thème automatique jour/nuit.
 * Nuit  (20h → 6h)  : toujours "dark"
 * Jour  (6h → 20h)  : suit la préférence système (dark/light)
 * Se met à jour toutes les minutes + réagit aux changements système.
 */
function getTheme() {
  const h = new Date().getHours();
  const isNight = h < 6 || h >= 20;
  if (isNight) return "dark";
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export default function ThemeController() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute("data-theme", getTheme());
    };
    apply();

    // Écoute les changements de préférence système
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => apply();
    mql.addEventListener("change", onSystemChange);

    // Vérifie toutes les minutes (pour le passage jour/nuit)
    const id = setInterval(apply, 60_000);

    return () => {
      clearInterval(id);
      mql.removeEventListener("change", onSystemChange);
    };
  }, []);

  return null;
}
