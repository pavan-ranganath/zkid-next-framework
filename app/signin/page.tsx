/*
  The code provides a sign-in page
 */

"use client";

// Importing the 'yupResolver' function from the '@hookform/resolvers/yup' package
// It is used to integrate Yup schema validation with React Hook Form
import { yupResolver } from "@hookform/resolvers/yup";

// Importing specific components from the '@mui/material' package
// These components are part of the Material-UI library, which provides pre-designed UI components for React applications
import { Backdrop, Button, CircularProgress, Typography, TextField } from "@mui/material";

// Importing the 'signIn' and 'useSession' functions from the 'next-auth/react' package
// These functions are used for authentication and session management in Next.js applications using NextAuth.js
import { signIn, useSession } from "next-auth/react";

// Importing the 'useForm' function from the 'react-hook-form' package
// It is a library for building forms in React with easy form validation and handling
import { useForm } from "react-hook-form";

// Importing the 'toast' function from the 'react-hot-toast' package
// It provides a simple and customizable toast notification system for React applications
import toast from "react-hot-toast";

// Importing the 'yup' object from the 'yup' package
// Yup is a library for schema validation in JavaScript and TypeScript
import * as yup from "yup";

// Importing the 'PublicKeyCredentialRequestOptionsJSON' type from the '@simplewebauthn/typescript-types' package
// This type is used for specifying options when requesting a public key credential for WebAuthn (Web Authentication)
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";

// Importing the 'startAuthentication' function from the '@simplewebauthn/browser' package
// It provides a convenient way to start WebAuthn authentication flows in the browser
import { startAuthentication } from "@simplewebauthn/browser";

// Importing the 'RedirectType' type from the 'next/dist/client/components/redirect' package
// This type is used for specifying the type of redirect in Next.js applications
import { RedirectType } from "next/dist/client/components/redirect";

// Importing the 'redirect' function from the 'next/navigation' package
// It provides a way to programmatically navigate to different pages in Next.js applications
import { redirect } from "next/navigation";

// Importing the 'useEffect' function from the 'react' package
// It is a React Hook used to perform side effects in functional components
import { useEffect } from "react";

// Importing the 'Link' component from the 'next/link' package
// It is used for client-side navigation between pages in Next.js applications
import Link from "next/link";

/*
  - The code provides a sign-in feature for users using WebAuthn authentication.
  - Users can enter their email address and submit the form to sign in.
  - The code validates the email address to ensure it is in the correct format.
  - If the email is valid, it initiates the WebAuthn authentication process.
  - The authentication process verifies the user's identity using a registered security key or biometric device.
  - If the authentication is successful, the user is considered authorized and redirected to the dashboard page.
  - If the user is not authorized or the authentication process is still loading, a loading spinner is displayed.
  - Error handling is included to display error messages for authentication issues or invalid email addresses.
  - Overall, the code aims to provide a secure and user-friendly sign-in experience using WebAuthn authentication.
 */
export default function SignInComponent() {
  // Retrieve the session status and data using the useSession hook from next-auth/react.
  const { status } = useSession();

  // Determine the user's authorization status based on the session status.
  const authorized = status === "authenticated";
  const unAuthorized = status === "unauthenticated";

  // Determine if the session is still loading.
  const loading = status === "loading";

  // Define the validation schema for the sign-in form using yup.
  const signInForm = {
    email: yup.string().required("Email is required").email("Invalid email format"),
  };

  // Use react-hook-form to handle the form state, validation, and form submission.
  const {
    register, // Register form inputs with react-hook-form.
    control, // Provides control over the form inputs.
    handleSubmit, // Handle form submission.
    formState: { errors, touchedFields }, // Access the form state, including errors and touched fields.
  } = useForm({
    resolver: yupResolver(yup.object().shape(signInForm)), // Apply the yup validation resolver.
  });

  // Handle form submission.
  const onSubmit = async (data: { email: string }) => {
    await signInWithWebauthn(data.email); // Call the signInWithWebauthn function to initiate WebAuthn authentication.
  };

  // Perform side effects after the component is rendered.
  useEffect(() => {
    // Check if the session is loading or the router is not ready.
    if (loading) return;

    // If the user is authorized, redirect to the dashboard page.
    if (authorized) {
      redirect("/dashboard", RedirectType.push);
    }
  }, [loading, unAuthorized, status, authorized]);

  // If the user refreshed the page or somehow navigated to the protected page,
  // show a loading spinner.
  if (loading) {
    return (
      <>
        {/* Display a backdrop with a loading spinner */}
        <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }

  // Dismiss any active toasts (notifications).
  // toast.dismiss();

  return (
    <>
      {/* Display the sign-in form */}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Sign In
      </Typography>
      <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {/* Email input field */}
        <TextField
          label="Email"
          {...register("email")} // Register the "email" field with react-hook-form.
          variant="outlined"
          color="primary"
          sx={{ mb: 3 }}
          fullWidth
          error={!!(touchedFields.email && errors.email)} // Check if the "email" field has an error.
          helperText={touchedFields.email ? errors.email?.message : ""} // Display the error message, if any.
        />

        {/* Submit button */}
        <Button variant="contained" color="primary" type="submit">
          Sign In
        </Button>
      </form>
      {/* Link to register */}
      <small>
        Do not have an account? <Link href="/register/webauthn">Register Here</Link>
      </small>
    </>
  );
}
/**
 * The signInWithWebauthn function is responsible for handling the sign-in process with WebAuthn authentication.
 * It takes an email as input and performs the following steps:
 *
 * 1. Construct the URL to fetch authentication options from the server based on the provided email.
 * 2. Send a request to the server to fetch the authentication options.
 * 3. Check if the response status is 200 (indicating a successful response).
 * 4. Parse the response JSON into the PublicKeyCredentialRequestOptionsJSON type, which contains the necessary options for WebAuthn authentication.
 * 5. Check if there are any registered credentials available for the user.
 * 6. If there are no registered credentials, display an error toast message.
 * 7. If there are registered credentials, call the startAuthentication function from the '@simplewebauthn/browser' package to initiate the WebAuthn authentication process in the browser.
 * 8. The startAuthentication function returns a credential object with the necessary information for the authentication process.
 * 9. Call the signIn function from the 'next-auth/react' package to sign in the user using the 'webauthn' provider.
 * 10. Pass the credential details (response, id, rawId, type) to the signIn function along with the callbackUrl where the user should be redirected after successful authentication.
 * 11. Await the signIn function to complete the sign-in process.
 *
 * This function handles error cases by displaying appropriate toast messages when there are issues with fetching authentication options or when there are no registered credentials for the user.
 * It utilizes the 'toast' function from the 'react-hot-toast' package to show error messages.
 * Overall, the signInWithWebauthn function provides a seamless integration with WebAuthn authentication for the sign-in process.
 */
async function signInWithWebauthn(email: any) {
  // Create the URL to fetch authentication options from the server.
  const url = new URL("/api/auth/authenticate", window.location.origin);
  url.search = new URLSearchParams({ email }).toString();

  // Fetch authentication options from the server.
  const optionsResponse = await fetch(url.toString());

  // Check if fetching authentication options was successful.
  if (optionsResponse.status !== 200) {
    console.error(optionsResponse);
    toast.error("Could not get authentication options from the server");
    throw new Error("Could not get authentication options from the server");
    // return;
  }

  // Parse the response JSON into PublicKeyCredentialRequestOptionsJSON type.
  /**
   * The PublicKeyCredentialRequestOptionsJSON object contains various properties that define the requirements and constraints for the authentication process.
   *
   * The properties of the PublicKeyCredentialRequestOptionsJSON object include:
   *
   * - challenge: A random challenge generated by the server. It serves as a unique identifier for the authentication request and helps prevent replay attacks.
   * - allowCredentials: An array of public key credentials that the server is willing to accept for authentication. These credentials are typically associated with the user's registered security keys or biometric devices.
   * - userVerification: Specifies the required user verification level for the authentication. It can have values like 'required', 'preferred', or 'discouraged'. This determines whether the user needs to perform a user verification step during authentication.
   * - extensions: Additional custom options or extensions specific to the application or server.
   *
   * It provides the necessary information for the browser to prompt the user for authentication using their registered security key or biometric device.
   * The server will generate the PublicKeyCredentialRequestOptionsJSON object and send it to the client as part of the authentication request.
   * The client (browser) uses these options to construct a PublicKeyCredentialRequestOptions object and initiate the WebAuthn authentication flow.
   * The options define the criteria for successful authentication, including the challenge, acceptable credentials, and user verification requirements.
   */
  const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

  // Check if there are any registered credentials available for the user.
  if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
    toast.error("There is no registered credential.");
    throw new Error("There is no registered credential.");
    // return;
  }

  /**
   * The startAuthentication function is provided by the '@simplewebauthn/browser' package and is used to initiate the WebAuthn authentication process in the browser.
   * It takes the PublicKeyCredentialRequestOptionsJSON object as input, which contains the necessary options for the authentication process.
   * The function performs the following steps:
   *
   * 1. It internally constructs a PublicKeyCredentialRequestOptions object based on the provided options.
   * 2. It calls the navigator.credentials.get() method with the constructed request options to trigger the WebAuthn authentication flow.
   * 3. The browser prompts the user to perform the authentication using their registered security key or biometric device.
   * 4. If the user successfully completes the authentication process, the browser returns a PublicKeyCredential object containing the authentication response.
   * 5. The startAuthentication function captures the response and returns it as a Promise that resolves to a credential object.
   *
   * The returned credential object contains the following properties:
   * - response: The authentication response data, including clientDataJSON, authenticatorData, signature, and userHandle.
   * - id: The credential ID associated with the authentication response.
   * - rawId: The raw credential ID associated with the authentication response.
   * - type: The type of the credential, usually 'public-key'.
   */
  const credential = await startAuthentication(opt);

  // Sign in using next-auth's signIn function, passing the WebAuthn credential details.
  await signIn("webauthn", {
    ...credential.response,
    id: credential.id,
    rawId: credential.rawId,
    type: credential.type,
    callbackUrl: "/dashboard",
  });
}
