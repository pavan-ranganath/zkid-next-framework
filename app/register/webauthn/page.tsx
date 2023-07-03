/*
  The code provides a registration page
 */

"use client";

import { Stack, TextField, Button, Typography, Backdrop, CircularProgress } from "@mui/material"; // Material-UI components
import Link from "next/link"; // Link component from Next.js for navigation
import { useEffect } from "react"; // React hook for side effects
import * as yup from "yup"; // Yup library for form validation
import { yupResolver } from "@hookform/resolvers/yup"; // Resolver for Yup validation with React Hook Form
import { useForm } from "react-hook-form"; // Form management library
import { redirect, useRouter } from "next/navigation"; // Next.js functions for navigation
import { toast } from "react-hot-toast"; // Toast notification library
import { startRegistration } from "@simplewebauthn/browser"; // WebAuthn registration function
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context"; // Next.js router instance
import { useSession } from "next-auth/react"; // NextAuth session hook
import { RedirectType } from "next/dist/client/components/redirect"; // Next.js redirect type
import { handleRegistrationError } from "@/lib/webauthn";

/**
 * The Register component handles the user registration process.
 * It displays a registration form where users can enter their first name, last name, and email.
 * The form is validated using the yup library and React Hook Form.
 * Once the form is submitted, the registerWebauthn function is called to initiate the WebAuthn registration process.
 * If the user is already authenticated, they will be redirected to the dashboard page.
 * While the registration process is in progress, a loading spinner is displayed.
 * If an error occurs during registration, an error toast is shown.
 *
 * @returns {JSX.Element} The JSX element representing the Register component.
 */
export default function Register(): JSX.Element {
  // Retrieving session data and status using NextAuth hook
  const { data: session, status } = useSession();

  // Checking authorization status
  const authorized = status === "authenticated";
  const unAuthorized = status === "unauthenticated";
  const loading = status === "loading";

  // Initializing Next.js router
  const router = useRouter();

  // Validation schema for registration form
  const registerForm = {
    fName: yup.string().required("First name is required"),
    lName: yup.string().required("Last name is required"),
    email: yup.string().required("Email is required").email("Invalid email format"),
  };

  // Initializing React Hook Form with validation resolver
  // Destructuring the useForm hook and its return values:
  // - register: Function to register form inputs with React Hook Form
  // - control: Object that allows you to use uncontrolled components with React Hook Form
  // - handleSubmit: Function to handle form submission with React Hook Form
  // - formState: Object containing the state of the form, including errors and touched fields

  // Configuring the useForm hook with the validation resolver:
  // - resolver: yupResolver from the yup library is used to integrate Yup validation with React Hook Form
  // - yupResolver takes the validation schema (registerForm)
  // - This configuration ensures that the form inputs are validated according to the defined rules in registerForm
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm({
    resolver: yupResolver(yup.object().shape(registerForm)),
  });

  // Form submission handler
  function onSubmit(data: any) {
    registerWebauthn(data.email, data.fName, data.lName, router);
  }

  // Effect hook to handle page navigation based on session status
  useEffect(() => {
    // Check if the session is loading or the router is not ready
    if (loading) return;
    // If the user is authorized, redirect to the dashboard page
    if (authorized) {
      redirect("/dashboard", RedirectType.push);
    }
  }, [loading, unAuthorized, authorized]);

  // If the user refreshed the page or somehow navigated to the protected page
  if (loading) {
    return (
      <>
        {/* Display a loading backdrop */}
        <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }

  // Dismiss any active toasts
  toast.dismiss();

  return (
    <>
      {/* Registration form */}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Registration
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 2, md: 4 }} sx={{ marginBottom: 4 }}>
          {/* First Name field */}
          <TextField
            id="fName"
            type="text"
            variant="outlined"
            color="primary"
            label="First Name"
            fullWidth
            {...register("fName")}
            error={touchedFields.fName && Boolean(errors.fName)}
            helperText={touchedFields.fName ? errors.fName?.message : ""}
          />
          {/* Last Name field */}
          <TextField
            type="text"
            variant="outlined"
            color="primary"
            label="Last Name"
            {...register("lName")}
            error={touchedFields.lName && Boolean(errors.lName)}
            helperText={touchedFields.lName ? errors.lName?.message : ""}
            fullWidth
          />
        </Stack>
        {/* Email field */}
        <TextField
          type="email"
          variant="outlined"
          color="primary"
          label="Email"
          {...register("email")}
          error={touchedFields.email && Boolean(errors.email)}
          helperText={touchedFields.email ? errors.email?.message : ""}
          fullWidth
          sx={{ mb: 4 }}
        />
        {/* Submit button */}
        <Button variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>
      {/* Sign-in link */}
      <small>
        Already have an account? <Link href="/signin">Sign in Here</Link>
      </small>
    </>
  );
}

// Function for registering WebAuthn credentials:
// - Constructs the registration URL using the provided email, first name, and last name
// - Fetches the registration options from the server using the constructed URL
// - If the options request is successful (status 200), starts the WebAuthn registration process
// - Sends the registration data to the server for verification and storage
// - If the registration request is successful (status 201), displays a success toast and can redirect to the sign-in page
// - If any error occurs during the process, displays an error toast and logs the error message or response
async function registerWebauthn(email: string, fName: string, lName: string, router: AppRouterInstance) {
  // Construct the registration URL
  const url = new URL("/api/auth/register/webauthn", window.location.origin);
  url.search = new URLSearchParams({ email, fName, lName }).toString();

  // Fetch the registration options from the server
  const optionsResponse = await fetch(url.toString());
  const opt = await optionsResponse.json();

  // Handle error if the options request failed
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

    // Send the registration data to the server
    const response = await fetch("/api/auth/register/webauthn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credential),
      credentials: "include",
    });

    // Handle error if the registration request failed
    if (response.status !== 201) {
      toast.error("Could not register WebAuthn credentials.");
      const errorResp = await response.json();
      console.error(errorResp);
    } else {
      toast.success("Your WebAuthn credentials have been registered.", { duration: 10000 });
      // Redirect to the sign-in page
      // router.push('/signin');
    }
  } catch (err) {
    handleRegistrationError(err);
  }
}
