// src/app/ThemeButton.tsx

"use client";

import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";

import { DEFAULT_THEME, getOtherTheme } from "./theme";

const ThemeButton = () => {
  const { theme: themeState, setTheme } = useTheme();
  const [themeName, setThemeName] = useState(DEFAULT_THEME);

  useEffect(() => setThemeName(getOtherTheme(themeState)), [themeState]);

  return (
    <button type="button" onClick={() => setTheme(getOtherTheme(themeState))}>
      {`Activate ${themeName} Theme`}
    </button>
  );
};

export default ThemeButton;
