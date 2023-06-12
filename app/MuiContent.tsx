// src/app/MuiContent.tsx
"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { DEFAULT_THEME } from "@/app/theme";

const MuiContent = () => {
  const { theme } = useTheme();
  const [themeName, setThemeName] = useState(DEFAULT_THEME);
  useEffect(() => setThemeName(validThemeOrDefault(theme)), [theme]);

  return (
    <Stack sx={{ minHeight: "100vh", padding: "64px" }}>
      <Stack sx={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} component="main">
        <Typography variant="h5">main content with Theme: {`${themeName}`}</Typography>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: "space-between" }} component="footer">
        <Typography>footer</Typography>
        <Typography>stuff</Typography>
      </Stack>
    </Stack>
  );
};

export default MuiContent;

function validThemeOrDefault(theme: string | undefined): import("react").SetStateAction<"dark" | "light"> {
  return 'dark';
}
