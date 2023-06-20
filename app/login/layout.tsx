"use client";
import { Container, Grid, ThemeProvider, useTheme } from "@mui/material";
import "./login.css";
import ThemeButton from "../ThemeButton";
import Providers from "../Providers";
import { Toaster } from "react-hot-toast";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Toaster />
          <Grid item xs={3}>
            {children}
          </Grid>
        </Grid>
      </Providers>
    </>
  );
}
