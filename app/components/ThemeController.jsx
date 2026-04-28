"use client";
import { useEffect } from "react";

/**
 * Gère le thème automatique jour/nuit basé sur l'heure locale.
 * Jour   6h → 20h  : data-theme="light"  (ESPN/Goal.com)
 * Nuit  20h → 6h   : data-theme="dark"   (Dark glassmorphism)
 * L'attribut est aussi mis à jour toutes les minutes.
 */
function getTheme() {
  const h = new Date().getHours();
  return h >= 6 && h < 20 ? "light" : "dark";
}

export default function ThemeController() {
  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute("data-theme", getTheme());
    };
    apply();
    const id = setInterval(apply, 60_000);
    return () => clearInterval(id);
  }, []);

  return null;
}
