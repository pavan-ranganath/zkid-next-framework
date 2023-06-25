// src/app/MuiContent.tsx
"use client";

import { Stack, Typography } from "@mui/material";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { DEFAULT_THEME } from "@/app/theme";
import Link from "next/link";

const MuiContent = () => {
  const [themeName, setThemeName] = useState(DEFAULT_THEME);

  return (
    <Stack sx={{ minHeight: "100vh", padding: "64px" }}>
      <Stack sx={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} component="main">
        <Typography variant="h5">main content with Theme: {`${themeName}`}</Typography>
        <Link className="underline" href="/signin"><Typography variant="h5">Sign In</Typography></Link>
        <Link className="underline" href="/register/webauthn"><Typography variant="h5">Register</Typography></Link>
      </Stack>
      <Stack direction="row" sx={{ justifyContent: "space-between" }} component="footer">
        <Typography>Alpha</Typography>
        <Typography>V1</Typography>
      </Stack>
    </Stack>
  );
};

export default MuiContent;
