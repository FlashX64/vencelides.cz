/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

(() => {
  "use strict";

  console.log("Dark mode toggle script loaded");

  const getStoredTheme = () => localStorage.getItem("theme");
  const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

  const getPreferredTheme = () => {
    const storedTheme = getStoredTheme();
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  function setTheme(theme) {
    // Apply a transition class before changing theme
    document.documentElement.classList.add("theme-transition");

    // Set the new theme
    if (theme === "auto") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute(
        "data-bs-theme",
        isDark ? "dark" : "light",
      );
      // Store the actual value for smoother transitions
      document.documentElement.setAttribute("data-theme-auto", "true");
    } else {
      document.documentElement.setAttribute("data-bs-theme", theme);
      document.documentElement.removeAttribute("data-theme-auto");
    }

    // Remove the transition class after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 300);
  }

  const updateThemeToggleButtons = (theme) => {
    const effectiveTheme =
      theme === "auto"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    document.querySelectorAll('[id^="theme-toggle-"]').forEach((button) => {
      const placement = button.id.replace("theme-toggle-", "");

      const moonIcon = document.getElementById(`icon-moon-${placement}`);
      const sunIcon = document.getElementById(`icon-sun-${placement}`);

      const nextTheme = effectiveTheme === "dark" ? "light" : "dark";

      button.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
      button.setAttribute(
        "aria-pressed",
        effectiveTheme === "dark" ? "true" : "false",
      );

      if (moonIcon && sunIcon) {
        moonIcon.style.display = effectiveTheme === "dark" ? "none" : "";
        sunIcon.style.display = effectiveTheme === "dark" ? "" : "none";
      }
    });
  };

  // Apply theme immediately to prevent flash
  setTheme(getPreferredTheme());

  // Listen for system preference changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      const storedTheme = getStoredTheme();
      if (
        storedTheme === "auto" ||
        (!storedTheme &&
          document.documentElement.getAttribute("data-theme-auto") === "true")
      ) {
        setTheme("auto");
        updateThemeToggleButtons("auto");
      }
    });

  window.addEventListener("DOMContentLoaded", () => {
    updateThemeToggleButtons(getPreferredTheme());

    document.querySelectorAll('button[id^="theme-toggle-"]').forEach((button) => {
      button.addEventListener("click", () => {
        const currentTheme =
          document.documentElement.getAttribute("data-bs-theme");
        const nextTheme = currentTheme === "dark" ? "light" : "dark";

        setStoredTheme(nextTheme);
        setTheme(nextTheme);
        updateThemeToggleButtons(nextTheme);
      });
    });
  });
})();
