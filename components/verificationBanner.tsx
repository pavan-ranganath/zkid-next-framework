import { Fade, Paper, Typography, Button } from "@mui/material";
import { Stack, Box } from "@mui/system";
import * as React from "react";
import TrapFocus from '@mui/material/Unstable_TrapFocus';


export default function VerificationBanner() {
  const [bannerOpen, setBannerOpen] = React.useState(true);

  const closeBanner = () => {
    setBannerOpen(false);
  };

  return (
    <React.Fragment>
      {/* <CssBaseline /> */}
      <TrapFocus open disableAutoFocus disableEnforceFocus>
        <Fade appear={false} in={bannerOpen}>
          <Paper
            role="dialog"
            aria-modal="false"
            aria-label="Cookie banner"
            square
            variant="outlined"
            tabIndex={-1}
            sx={{
              // position: 'fixed',
              // top: 0,
              // left: 0,
              // right: 0,
              m: 0,
              p: 2,
              borderWidth: 0,
              borderTopWidth: 1,
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
              <Box
                sx={{
                  flexShrink: 1,
                  alignSelf: { xs: "flex-start", sm: "center" },
                  color: "red",
                }}
              >
                <Typography fontWeight="bold">Profile not yet verified</Typography>
                <Typography variant="body2">
                  Please verify your profile to continue using the application features.
                </Typography>
              </Box>
              <Stack
                gap={2}
                direction={{
                  xs: "row-reverse",
                  sm: "row",
                }}
                sx={{
                  flexShrink: 0,
                  alignSelf: { xs: "flex-end", sm: "center" },
                }}
              >
                <Button size="small" onClick={closeBanner} variant="contained">
                  Verify Profile
                </Button>
                {/* <Button size="small" onClick={closeBanner}>
                                    Reject all
                                </Button> */}
              </Stack>
            </Stack>
          </Paper>
        </Fade>
      </TrapFocus>
    </React.Fragment>
  );
}
