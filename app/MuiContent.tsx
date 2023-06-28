"use client";

// Importing Stack and Typography from "@mui/material"
// These are components from Material-UI used for layout and typography
import { Stack, Typography } from "@mui/material";

// Importing useState hook from "react"
// This hook allows managing state in functional components
import { useState } from "react";

// Importing the DEFAULT_THEME from "@/app/theme"
// This is a constant that represents the default theme name in the application
import { DEFAULT_THEME } from "@/app/theme";

// Importing Link from "next/link"
// This is a Next.js component used for client-side navigation between pages
import Link from "next/link";

// MuiContent component
// This component represents the main content of the application
const MuiContent = () => {
  // State to track the current theme name, initialized with the default theme
  const [themeName, setThemeName] = useState(DEFAULT_THEME);

  return (
    // Stack component serves as the main container with vertical orientation and padding
    <Stack sx={{ minHeight: "100vh", padding: "64px" }}>
      {/* Stack component for the main content section */}
      <Stack sx={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} component="main">
        {/* Typography component to display the current theme name */}
        <Typography variant="h5">main content with Theme: {`${themeName}`}</Typography>

        {/* Link component for the "Sign In" page */}
        <Link className="underline" href="/signin">
          <Typography variant="h5">Sign In</Typography>
        </Link>

        {/* Link component for the "Register" page */}
        <Link className="underline" href="/register/webauthn">
          <Typography variant="h5">Register</Typography>
        </Link>
      </Stack>

      {/* Stack component for the footer */}
      <Stack direction="row" sx={{ justifyContent: "space-between" }} component="footer">
        {/* Typography component for the "Alpha" text */}
        <Typography>Alpha</Typography>

        {/* Typography component for the "V1" text */}
        <Typography>V1</Typography>
      </Stack>
    </Stack>
  );
};

export default MuiContent;
