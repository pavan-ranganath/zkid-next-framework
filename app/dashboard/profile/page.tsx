/*
  The code provides a dashboard page
  Dashboard page that displays user information and passkeys, allows adding new passkeys through the webauthn registration process, and handles loading and error states.
 */

"use client";

// Importing UI components from Material-UI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CardActions from "@mui/material/CardActions";
import ListItem from "@mui/material/ListItem";

// Importing the startRegistration function from the "@simplewebauthn/browser" library
import { startRegistration } from "@simplewebauthn/browser";

// Importing the toast function from the "react-hot-toast" library
import toast from "react-hot-toast";

// Importing the Suspense component from React
import { Suspense, useEffect } from "react";

// Importing the useSWR hook from the "swr" library
import useSWR from "swr";

// Importing the credentailsFromTb type from the "./users/service" module
import { handleRegistrationError } from "@/lib/webauthn";
import VerifiedIcon from "@mui/icons-material/Verified";
import moment from "moment";
import { signIn } from "next-auth/react";
import { ResponseInternal } from "next-auth/core";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/services/apiService";
import { useConfirm } from "material-ui-confirm";
import PageTitle from "@/components/pageTitle";
import Alert from "@mui/material/Alert";
import { credentailsFromTb } from "../users/service";

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
  // const searchParams = useSearchParams()
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
  // get query param from url
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
      title: "Profile verification",
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

  function verifyMobile(event: any): void {
    alert("verify mobile work in progress");
  }

  // Displaying user info and passkeys
  return (
    <>
      <PageTitle title="Profile" />
      {warningDisplay && <Alert severity="error">{warningDisplay}</Alert>}

      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <CardHeader title="User info" />
            <CardContent>
              {/* Displaying user information */}
              <Typography gutterBottom variant="body1" component="div">
                Email: {userInfo.userInfo?.email.value}
                {
                  userInfo.userInfo?.email.verified ? (
                    <VerifiedIcon color="success" />
                  ) : userInfo.userInfo?.fullName.verified ? (
                    <Button size="small" onClick={verifyEmail}>
                      Verify email
                    </Button>
                  ) : null // Choose to render nothing if neither email nor fullname is verified
                }
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Name: {userInfo.userInfo?.fullName.value}
                {userInfo.userInfo?.fullName.verified ? <VerifiedIcon color="success" /> : <></>}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Date of Birth:{" "}
                {userInfo.userInfo?.dob.value ? moment(userInfo.userInfo?.dob.value).format("MMMM Do YYYY") : ""}
                {userInfo.userInfo?.dob.verified ? <VerifiedIcon color="success" /> : <></>}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Mobile:{userInfo.userInfo?.mobile.value}
                {
                  userInfo.userInfo?.mobile.verified ? (
                    <VerifiedIcon color="success" />
                  ) : userInfo.userInfo?.fullName.verified ? (
                    <Button size="small" onClick={verifyMobile}>
                      Verify mobile
                    </Button>
                  ) : null // Choose to render nothing if neither email nor fullname is verified
                }
              </Typography>
              {!userInfo.userInfo?.fullName.verified ? (
                <Button size="small" onClick={verifyProfile}>
                  Verify Profile
                </Button>
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <CardHeader title="Passkeys" />
            <CardContent>
              <List sx={{ width: "100%" }} component="nav">
                {/* Displaying passkey information */}
                {userInfo.passkeyInfo?.map((passkey: any) => (
                  <ListItemButton key={passkey.credentialId}>
                    <ListItemText
                      primary={passkey.friendlyName}
                      secondary={`Credential Backup: ${passkey.registrationInfo.registrationInfo?.credentialBackedUp}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={registerWebauthn}>
                Add new passkey
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

// Async function to fetch data from sepecified url
export const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Failed to fetch data");
  }
};

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
const _digiSignInUrlProvider = "/api/auth/digilocker";
const digiSignin = async () => {
  return fetch(_digiSignInUrlProvider, {
    method: "post",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
};

function verifyProfileWithDigiLocker() {
  return fetch("/api/verifyProfile", {
    method: "get",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

const confirmationDialogMessage = () => {
  return (
    <div>
      <List>
        <ListItem>
          <ListItemText>
            To verify your identity, click "Verify Now" to grant Digilocker access for your name and DOB and to receive a
            verification email.
          </ListItemText>
        </ListItem>
      </List>
      <Typography variant="body2">
        Your privacy is paramount to us. All verifications are done securely, and we never store unnecessary data.
      </Typography>
    </div>
  );
};
