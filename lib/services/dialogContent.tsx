import { Dialog, DialogContent, Typography, Box } from "@mui/material";


export const dialogContentOnLogoClick = (
  <Box sx={{ padding: 2 }}>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      nZKid is an application designed for sharing profile data with a zero-knowledge approach.
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      Zero-knowledge means that by providing only the necessary data, you can substantiate the authenticity of your claims.
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      For the proof of concept (POC), the app currently supports age verification. Additionally, other verification options, such as address and membership, are also possible using the same technology.
    </Typography>
    <Typography variant="body1" sx={{ marginBottom: 2 }}>
      Developed by Entrada Solutions.
    </Typography>
    <Typography variant="body1">
      Explore the details further in this demo app for a comprehensive understanding.
    </Typography>
  </Box>
);