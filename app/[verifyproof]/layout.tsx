// VerifyProofLayout component

import { Grid } from "@mui/material";
import Providers from "../Providers";

// This component represents the layout for the verify proof page
export default function VerifyProofLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: "100vh" }}>
        <Grid item xs={8} sx={{ margin: "10px" }}>
          {children}
        </Grid>
      </Grid>
    </Providers>
  );
}
