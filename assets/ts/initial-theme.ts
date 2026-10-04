import { applyTheme, preferredTheme } from "./theme";

// Runs in the head before painting, avoiding a flash of the wrong theme
applyTheme(preferredTheme());
