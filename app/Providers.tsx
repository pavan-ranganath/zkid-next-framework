"use client";

import { createTheme as createMuiTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { ThemeProvider, useTheme } from "next-themes";
import { NextAppDirEmotionCacheProvider } from "tss-react/next/appDir";

import { DEFAULT_THEME } from "./theme";

const MuiProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme: themeState } = useTheme();
  const themeName = themeState === "dark" || themeState === "light" ? themeState : DEFAULT_THEME;
  const theme = createMuiTheme({ palette: { mode: themeName } });

  return (
    // CssBaseline causes the theme switch to stop working
    <NextAppDirEmotionCacheProvider options={{ key: "css" }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
};

const NextThemeProvider = ({ children }: { children: React.ReactNode }) => (
  // Separate next-themes Provider from MUI, so is does not get rerendered on theme switch
  <ThemeProvider attribute="class" defaultTheme={DEFAULT_THEME}>
    {children}
  </ThemeProvider>
);

const Providers = ({ children }: { children: React.ReactNode }) => (
  <NextThemeProvider>
    <MuiProvider>{children}</MuiProvider>
  </NextThemeProvider>
);

export default Providers;