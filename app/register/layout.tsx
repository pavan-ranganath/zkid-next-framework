"use client";

import React from "react"; // Importing React from the "react" package. Required for creating React components.

import { Grid } from "@mui/material"; // Importing the Grid component from the Material-UI library. Used for grid-based layouts.

import "./register.css"; // Importing the CSS file for styling the register page.

import Providers from "../Providers"; // Importing the Providers component from the "../Providers" module. It provides context or services to its child components.

// RegisterLayout component
// This component represents the layout for the register page
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
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
