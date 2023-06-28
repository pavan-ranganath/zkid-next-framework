"use client";

import { Grid, useTheme } from "@mui/material";
import "./register.css";
import Providers from "../Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <>
      <Providers>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          <Grid item xs={3}>
            {children}
          </Grid>
        </Grid>
      </Providers>
    </>
  );
}
