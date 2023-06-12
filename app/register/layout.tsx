"use client";
import { Container, Grid, ThemeProvider, useTheme } from "@mui/material";
import "./register.css";
import ThemeButton from "../ThemeButton";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <>
      <ThemeButton />
      <ThemeProvider theme={theme}>
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
      </ThemeProvider>
    </>
  );
}
