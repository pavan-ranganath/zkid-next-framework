/*
  The code provides a dashboard page
  Dashboard page that displays user information and passkeys, allows adding new passkeys through the webauthn registration process, and handles loading and error states.
 */

"use client";

// Importing UI components from Material-UI
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  CardActions,
  ListItem,
  IconButton,
  Box,
} from "@mui/material";

// Importing the startRegistration function from the "@simplewebauthn/browser" library
import { startRegistration } from "@simplewebauthn/browser";

// Importing the toast function from the "react-hot-toast" library
import toast from "react-hot-toast";

// Importing the Suspense component from React
import { Suspense, useEffect, useState } from "react";

// Importing the useSWR hook from the "swr" library
import useSWR from "swr";

// Importing the credentailsFromTb type from the "./users/service" module
import { handleRegistrationError } from "@/lib/webauthn";
import VerifiedIcon from "@mui/icons-material/Verified";
import moment from "moment";
import { signOut } from "next-auth/react";
import { ResponseInternal } from "next-auth/core";
import { apiRequest, fetcher } from "@/lib/services/apiService";
import { useConfirm } from "material-ui-confirm";
import PageTitle from "@/components/pageTitle";
import Alert from "@mui/material/Alert";
import { epochToDate, utcTimestampToDateOfBirth } from "@/lib/services/utils";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LoadingSpinner from "@/components/Loading";
import { set } from "mongoose";
import { credentailsFromTb } from "../../../lib/services/userService";
import ReusableDialog from "@/components/ReusableDialog";
import { dialogContentOnLogoClick, dialogContentPasskey, dialogContentProfilePage, homePageDialogContent } from "@/lib/services/dialogContent";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Dashboard component
export default function Profile() {
  const {
    data: userInfoResp,
    error: errorUserInfo,
    isLoading: userInfoIsLoading,
  } = useSWR<{ data: credentailsFromTb; error: string }>("/api/passkeys", fetcher, {
    suspense: true,
    // revalidateOnFocus: false,
    // revalidateOnReconnect: false,
    // revalidateOnMount: false,
    // revalidateIfStale: false,
    // shouldRetryOnError: false,
  });
  if (!userInfoResp) {
    return <>Error</>;
  }
  const { data: userInfo, error } = userInfoResp;
  return (
    <>
      {/* Showing a loading message while fetching data */}
      <Suspense fallback={<p>Loading data...</p>}>
        <GetPasskeys data={userInfo!} isLoading={userInfoIsLoading} error={errorUserInfo} warningDisplay={error} />
      </Suspense>
    </>
  );
}

// Async function to fetch passkeys
async function GetPasskeys({
  data: userInfo,
  error,
  isLoading,
  warningDisplay,
}: {
  data: credentailsFromTb;
  error: any;
  isLoading: any;
  warningDisplay: string;
}) {
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const confirm = useConfirm();
  // Display loading message while fetching data
  if (isLoading) return <div>loading...</div>;

  // Handling error case
  if (!userInfo) {
    return <div>Error</div>;
  }

  // Handling error case for passkeyInfo
  if (!userInfo.passkeyInfo) {
    console.log(userInfo);
    return <div>Error passkeyInfo</div>;
  }

  async function verifyProfile(event: any): Promise<void> {
    confirm({
      title: "Profile verification (using Simulate-DL)",
      content: confirmationDialogMessage(),
      confirmationText: "Verify Now",
      cancellationText: "Cancel",
    })
      .then(async () => {
        /* ... */
        const authResp = await digiSignin();
        const resp: ResponseInternal = await authResp.json();
        window.location.href = resp.redirect!;
      })
      .catch(() => {
        /* ... */
      });
  }

  function verifyMobile(): void {
    alert("verify mobile work in progress");
  }

  function handleEdit(credentialId: any): void {
    alert("edit work in progress");
    // throw new Error("Function not implemented.");
  }

  function handleDelete(credentialId: any): void {
    alert("delete work in progress");
    // throw new Error("Function not implemented.");
  }
  async function sendDeleteProfileRequest() {
    const resp = await apiRequest({
      category: "ZKIDAPI",
      pathKey: "deleteProfile",
      params: {},
    });
    if (resp.status === 200) {
      toast.success("Profile deleted successfully");
      setTimeout(async () => {
        await signOut({ callbackUrl: "/signin" });
      }, 2000);
    } else {
      toast.error("Failed to delete profile");
    }
  }
  function DeleteProfile(): void {
    // Show confirm to get confirmation before deleteting profile
    // send HTTP DELETE request to /api/profile
    // if success, redirect to signin page
    // if error, display error message
    confirm({
      title: "Delete Profile",
      description:
        "Are you sure you want to delete your profile? This action is irreversible and will result in the permanent deletion of your profile and all associated data. Please note that you won't be able to recover your profile once it's deleted.",
      confirmationText: "Delete",
      cancellationText: "Cancel",
    })
      .then(async () => {
        setLoadingMessage("Deleting profile...");
        await sendDeleteProfileRequest();
        setLoadingMessage("");
      })
      .catch(() => {
        /* ... */
      });
  }
  function addNewPasskey(event: any): void {
    confirm({
      title: "Add new passkey",
      description:
        "By adding a new passkey to your account, you can access your account from different devices or locations. This means you can have multiple passkeys for the same account, offering greater flexibility while maintaining a strong level of protection.",
      confirmationText: "Add passkey",
      cancellationText: "Cancel",
    })
      .then(async () => {
        setLoadingMessage("Adding new passkey...");
        await registerWebauthn();
        setLoadingMessage("");
      })
      .catch(() => {
        /* ... */
      });
  }
  const handleVerifiedIconClick = (title: string, description: string) => {
    confirm({
      title,
      content: description,
      confirmationText: "Ok",
      hideCancelButton: true,
    })
      .then(async () => {
        /* ... */
      })
      .catch(() => {
        /* ... */
      });
  };
  const handleProfileInfoOpenDialog = (dialogContent: any) => {
    // setDialogContent(dialogContent);
    // setDialogOpen(true);
    confirm({
      title: dialogContent.title,
      content: dialogContent.content,
      confirmationText: "CLOSE",
      hideCancelButton: true,
    })
      .then(async () => {
        /* ... */
      })
      .catch(() => {
        /* ... */
      });
  };


  // Displaying user info and passkeys
  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>

        <PageTitle title="Profile" />

      </Box>
      {warningDisplay && <Alert severity="error">{warningDisplay}</Alert>}
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>

              <CardHeader title="User info" sx={{ paddingRight: 0 }} />
              <InfoOutlinedIcon onClick={() => handleProfileInfoOpenDialog(dialogContentProfilePage)} color="primary" fontSize="small" sx={{ marginLeft: 1 }} />
            </Box>
            <CardContent>
              {/* Displaying user information */}
              <Typography gutterBottom variant="body1" component="div">
                Email: {userInfo.userInfo?.email.value}
                <EmailButton
                  userInfo={userInfo}
                  _verifyEmail={verifyEmail}
                  handleVerifiedIconClick={handleVerifiedIconClick}
                />
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Name: {userInfo.userInfo?.fullName.value}
                {userInfo.userInfo?.fullName.verified ? (
                  <VerifiedIcon
                    color="success"
                    onClick={() => handleVerifiedIconClick("Name Verified", "Your name has been verified by Simulate-DL")}
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <></>
                )}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Date of Birth:{" "}
                {userInfo.userInfo?.dob.value !== undefined
                  ? moment(utcTimestampToDateOfBirth(+userInfo.userInfo.dob.value)).format("MMMM Do YYYY")
                  : ""}
                {userInfo.userInfo?.dob.verified ? (
                  <VerifiedIcon
                    color="success"
                    onClick={() =>
                      handleVerifiedIconClick("Date of Birth Verified (DOB)", "Your DOB has been verified by Simulate-DL")
                    }
                    style={{ cursor: "pointer" }}
                  />
                ) : (
                  <></>
                )}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Mobile:{userInfo.userInfo?.mobile.value}
                <VerifyMobileButton userInfo={userInfo} verifyMobile={verifyMobile} />
              </Typography>
            </CardContent>
            <CardActions>
              <Button color="error" size="small" onClick={() => DeleteProfile()}>
                Delete Profile
              </Button>
              {!userInfo.userInfo?.fullName.verified && (
                <Button size="small" onClick={verifyProfile}>
                  Verify Profile
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>

              <CardHeader title="Passkeys" sx={{ paddingRight: 0 }} />
              <InfoOutlinedIcon onClick={() => handleProfileInfoOpenDialog(dialogContentPasskey)} color="primary" fontSize="small" sx={{ marginLeft: 1 }} />
            </Box>
            <CardContent>
              <List sx={{ width: "100%" }} component="nav">
                {userInfo.passkeyInfo?.map((passkey: any) => (
                  <ListItemButton key={passkey.credentialId}>
                    <ListItemText
                      primary={passkey.friendlyName}
                      secondary={`Credential Backup: ${passkey.registrationInfo.registrationInfo?.credentialBackedUp}`}
                    />
                    <IconButton edge="end" aria-label="edit" onClick={() => handleEdit(passkey.credentialId)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(passkey.credentialId)}
                      sx={{ marginLeft: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={addNewPasskey}>
                Add new passkey
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      {loadingMessage && <LoadingSpinner message={loadingMessage} />}
    </>
  );
}

/**
 
Verify Email
 
This function sends a request to the "/api/auth/emailverifier" endpoint to initiate the email verification process.
 
It uses the fetch API to make a POST request 
 
The response is checked for success or failure, and appropriate toasts are displayed.
 
If the response status is not 201, an error toast is shown with the error message from the response.
 
If the response status is 201, a success toast is shown indicating that the email verification link has been sent.
 
@returns {Promise<void>}
*/
async function verifyEmail(): Promise<void> {
  try {
    const response = await fetch("/api/auth/emailverifier", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      credentials: "include",
    });

    if (response.status !== 201) {
      toast.error("Failed to send email verification link");
      const errorResp = await response.json();
      console.error(errorResp);
    } else {
      toast.success("Email verification link sent to registered email", { duration: 10000 });
      // router.push('/signin');
    }
  } catch (err) {
    console.log(err);
    toast.error(`Failed to send email ${(err as Error).message}`);
  }
}

// Async function to register webauthn credentials
async function registerWebauthn() {
  // Fetching registration options from the server
  const url = new URL("/api/auth/register/webauthn", window.location.origin);
  const optionsResponse = await fetch(url.toString());
  const opt = await optionsResponse.json();

  // Handling error case for registration options
  if (optionsResponse.status !== 200) {
    console.error(opt);
    toast.error(opt.error);
    return;
  }

  try {
    // Start the WebAuthn registration process
    // - The startRegistration function is responsible for initiating the WebAuthn registration flow
    //   by invoking the browser's built-in WebAuthn API with the received registration options (opt)
    // - The startRegistration function returns a credential object that represents the user's newly
    //   registered WebAuthn credential
    const credential = await startRegistration(opt);

    // Sending the registration data to the server
    const response = await fetch("/api/auth/register/webauthn", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credential),
      credentials: "include",
    });

    // Handling the response from the server
    if (response.status !== 201) {
      toast.error("Could not register webauthn credentials.");
      const errorResp = await response.json();
      console.error(errorResp);
    } else {
      toast.success("Your webauthn credentials have been registered.", { duration: 10000 });
      // router.push('/signin');
    }
  } catch (err) {
    handleRegistrationError(err);
    // toast.error(`Registration failed. ${(err as Error).message}`);
  }
}
const _digiSignInUrlProvider = "/api/auth/simulateauth";
const digiSignin = async () => {
  return fetch(_digiSignInUrlProvider, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

const confirmationDialogMessage = () => {
  return (
    <div>
      <List>
        <ListItem>
          <ListItemText>
            To verify your identity, please click &quot;Verify Now&quot; in order to grant Simulate-DL access. This will
            allow us to access your Profile information to verify your name, date of birth and send you a verification email.
          </ListItemText>
        </ListItem>
      </List>
      <Typography variant="body2">
        Your privacy is paramount to us. All verifications are done securely, and we never store unnecessary data.
      </Typography>
    </div>
  );
};

function EmailButton({
  userInfo,
  _verifyEmail,
  handleVerifiedIconClick,
}: {
  userInfo: credentailsFromTb;
  _verifyEmail: () => void;
  handleVerifiedIconClick: (title: string, description: string) => void;
}) {
  if (userInfo.userInfo?.email.verified) {
    return (
      <VerifiedIcon
        color="success"
        onClick={() =>
          handleVerifiedIconClick(
            "Email Verified",
            "Your email has been successfully verified through the process of sending and confirming the email",
          )
        }
        style={{ cursor: "pointer" }}
      />
    );
  }
  if (userInfo.userInfo?.fullName.verified) {
    return (
      <Button size="small" onClick={_verifyEmail}>
        Verify email
      </Button>
    );
  }
  return null; // Render nothing if neither email nor fullname is verified
}

function VerifyMobileButton({ userInfo, verifyMobile }: { userInfo: credentailsFromTb; verifyMobile: () => void }) {
  if (userInfo.userInfo?.mobile.verified) {
    return <VerifiedIcon color="success" />;
  }
  if (userInfo.userInfo?.fullName.verified) {
    return (
      <Button size="small" onClick={verifyMobile}>
        Verify mobile
      </Button>
    );
  }
  return null; // Render nothing if neither mobile nor fullname is verified
}
