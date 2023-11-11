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

export const homePageDialogContent = {
  title: "Home",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Welcome to your landing page on nZKid. On the left, you'll find a menu button for navigation (Help, Profile, and Home).
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          By clicking the profile icon on the right, you can sign out and toggle between dark and light themes.
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Here, you can view your digital identity and find a button to generate proof if you haven't done so already.
        </Typography>

        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          If your profile is not yet verified, you will see a button to initiate the verification process.
        </Typography>
      </Box>
    </>
  ),
};

export const dialogContentProfilePage = {
  title: "Profile",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Here you can view your profile information. If you haven't verified your profile yet, you will see verify profile button to initiate the verification process.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Data submitted during creating of profile, has to be validated to ensure its accuracy and ensure its authenticity. Profile verifiaction is done using authoritative domain for this POC demo we are using simulated domain.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          After verification of profile using Simulate-DL account, you'll receive an email with a link to verify your email address. Click on the link to complete the verification of account.
        </Typography>
        <Typography variant="body1" >
          You can also delete your profile information by clicking the delete button.
        </Typography>
      </Box>
    </>
  ),
};

export const dialogContentPasskey = {
  title: "Passkey",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Passkey is a unique key that you create during registration.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Add new passkey button allows you to create a new passkey. You can use this key to sign in to your account.
        </Typography>
      </Box>
    </>
  ),
};