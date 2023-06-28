"use client";

// Importing the Grid component from the MUI (Material-UI) library
import { Grid } from "@mui/material";

// Importing the Providers component from a local file or module
import Providers from "../Providers";

// Defining the SignInLayout component which receives a children prop
export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Wrapping the content with Providers component */}
      <Providers>
        {/* Creating a Grid container */}
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "100vh" }}
        >
          {/* Adding a Grid item */}
          <Grid item xs={3}>
            {/* Rendering the children component */}
            {children}
          </Grid>
        </Grid>
      </Providers>
    </>
  );
}
