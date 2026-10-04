export type Theme = "light" | "dark" | "auto";

let preference: Theme | undefined;

export function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");

    if (stored === "light" || stored === "dark" || stored === "auto") {
      return (preference = stored);
    }
  } catch {
    // The theme still works when browser storage is unavailable
  }

  preference =
    document.documentElement.dataset.defaultTheme === "dark"
      ? "dark"
      : document.documentElement.dataset.defaultTheme === "light"
        ? "light"
        : "auto";

  return preference;
}

export function preferredTheme(): Theme {
  return preference ?? loadTheme();
}

export function applyTheme(theme: Theme): void {
  const dark =
    theme === "dark" ||
    (theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.dataset.bsTheme = dark ? "dark" : "light";
}

export function saveTheme(theme: Theme): void {
  preference = theme;

  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Keep the selected theme for this page even if it cannot be saved
  }
}
