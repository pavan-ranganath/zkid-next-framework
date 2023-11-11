import { Dialog, DialogContent, Typography, Box } from "@mui/material";


export const dialogContentOnLogoClick = {
  title: "nZKid",
  content: (<Box sx={{ padding: 2 }}>
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
  </Box>)
};

export const dialogContentRegistrationPage = {
  title: "Registration",
  content: (
    <Box sx={{ padding: 2 }}>
      <Typography variant="body1">
        To initiate your journey with nZKid, kindly fill out the registration form, create a unique passkey, and complete the registration process. Ensure the accuracy of the information provided, as it will undergo verification through a trusted domain.
      </Typography>
    </Box>
  ),
};

export const dialogContentSignInPage = {
  title: "Signing In",
  content: (
    <Box sx={{ padding: 2 }}>
      <Typography variant="body1">
        Once registered, you can easily sign in by entering email and using the passkey you created
      </Typography>
    </Box>
  ),
};