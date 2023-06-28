
/*
  The code provides a sign-in functionality with WebAuthn (Web Authentication)
 */

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
  const { data: session, status } = useSession();

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
  }, [loading, unAuthorized, status]);

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
  toast.dismiss();

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
/*

Functionality:
- The code uses the useSession hook from next-auth/react to retrieve the user session status and data.
- It determines the user's authorization status based on the session status.
- It uses react-hook-form and yup for form validation, with validation rules defined for the email field.
- Upon form submission, the signInWithWebauthn function is called to initiate the WebAuthn authentication process.
- The signInWithWebauthn function fetches authentication options from the server and starts the WebAuthn authentication.
- If the user is authorized, they are redirected to the dashboard page.
- If the page is refreshed or the user navigates to the protected page, a loading spinner is displayed.
- The code utilizes Material-UI components and JSX elements for rendering the sign-in form, including the email input, submit button, and a link for registration.
*/
// Function to handle sign-in with WebAuthn.
async function signInWithWebauthn(email: any) {
  // Create the URL to fetch authentication options from the server.
  const url = new URL("/api/auth/authenticate", window.location.origin);
  url.search = new URLSearchParams({ email }).toString();

  // Fetch authentication options from the server.
  const optionsResponse = await fetch(url.toString());

  // Check if fetching authentication options was successful.
  if (optionsResponse.status !== 200) {
    toast.error("Could not get authentication options from the server");
    return;
  }

  // Parse the response JSON into PublicKeyCredentialRequestOptionsJSON type.
  const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

  // Check if there are any registered credentials available for the user.
  if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
    toast.error("There is no registered credential.");
    return;
  }

  // Start the WebAuthn authentication process by calling the startAuthentication function.
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
