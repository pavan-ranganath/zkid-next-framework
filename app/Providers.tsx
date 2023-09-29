"use client";

// Importing required modules and components

// Importing createTheme and ThemeProvider from "@mui/material"
import { createTheme as createMuiTheme } from "@mui/material/styles";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";


// Importing ThemeProvider and useTheme from "next-themes"
// These are used for managing and accessing the current theme state in Next.js applications
import { ThemeProvider, useTheme } from "next-themes";

// Importing NextAppDirEmotionCacheProvider from "tss-react/next/appDir"
// This is a provider component used for providing Emotion cache in Next.js applications
// Emotion cache is used for server-side rendering and caching of styled components
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

// Importing the DEFAULT_THEME from "./theme"
// This is a constant that represents the default theme name in the application
import { DEFAULT_THEME } from "./theme";

// MUI Provider component
// This component creates and provides the MUI theme based on the current theme state
const MuiProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the current theme from next-themes' useTheme hook
  const { theme: themeState } = useTheme();

  // Determine the theme name based on the theme state or use the default theme
  const themeName = themeState === "dark" || themeState === "light" ? themeState : DEFAULT_THEME;

  // Create the MUI theme based on the theme name
  const theme = createMuiTheme({ palette: { mode: themeName } });

  return (
    // Provide the MUI theme using MuiThemeProvider
    <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
};

// Next Theme Provider component
// This component wraps the application and provides the theme attribute for next-themes
const NextThemeProvider = ({ children }: { children: React.ReactNode }) => (
  // Separate next-themes Provider from MUI, so it does not get rerendered on theme switch
  <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
    {children}
  </ThemeProvider>
);

// Providers component
// This component wraps the application with both MUI and Next themes providers
const Providers = ({ children }: { children: React.ReactNode }) => (
  <NextThemeProvider>
    <MuiProvider>{children}</MuiProvider>
  </NextThemeProvider>
);

export default Providers;
