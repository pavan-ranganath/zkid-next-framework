import { Dialog, DialogContent, Typography, Box, Link } from "@mui/material";
import VerifiedIcon from '@mui/icons-material/Verified';


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
          <VerifiedIcon color="success" />
          Your information has been authenticated and verified by the authoritative domain. Clicking on the icon allows you to access the verification details.
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
export const dialogContentnZKpCertificates = {
  title: "nZKP Certificates",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          nZKP Certificates are digitally signed XML certificates containing zero-knowledge proofs.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          The application allows you to generate various types of nZKP certificates. Currently, age verification is supported. Moreover, other verification options, such as address and membership, are also feasible using the same technology.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Once generated, sharing your certificate is effortless. Copy the link, send it as a message, or email it to those who need to verify your information.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Deleting your certificate is possible by clicking the delete button.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Downloading your certificate involves clicking the download button. The downloaded signed XML certificate is secure and tamper-evident, providing proof. The digital signature ensures the information's authenticity and integrity.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          To generate proof, click the "Generate Proof" button. You'll be prompted to input the date and age you want to claim. Follow the steps, and nZKid will create a proof for you.
        </Typography>
      </Box>
    </>
  ),
};

export const dialogContentVerifyProof = {
  title: "Verify Proof",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          The "Verify Proof" button allows you to verify the proof within the nZKP XML signed certificate. You will be prompted to input the date and age for verification. Follow the steps, and nZKid will validate the proof for you.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          The "Verify Signature" button enables you to confirm the signature of the nZKP XML signed certificate.
          This verification ensures the certificate's authenticity and integrity.
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          After verifying the signature, clicking on "Signature" provides additional information about the signature.
        </Typography>
      </Box>
    </>
  ),
};

export const dialogContentContactUs = {
  title: "Contact Us",
  content: (
    <>
      <Box sx={{ padding: 2 }}>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          If you have any questions or concerns, feel free to reach out to us:
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Email: <Link href="mailto:support@egstech.org">support@egstech.org</Link>
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          Phone: <Link href="tel:+1-408-799-1807">+1-408-799-1807</Link>
        </Typography>
        <Typography variant="body1">
          We are here to assist you and address any inquiries you may have.
        </Typography>
      </Box>
    </>
  ),
};