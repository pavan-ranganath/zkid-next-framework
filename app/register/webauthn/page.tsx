/*
  The code provides a registration page
 */

"use client";

import Link from "next/link"; // Link component from Next.js for navigation
import { useEffect, useState } from "react"; // React hook for side effects
import * as yup from "yup"; // Yup library for form validation
import { yupResolver } from "@hookform/resolvers/yup"; // Resolver for Yup validation with React Hook Form
import { Controller, useForm } from "react-hook-form"; // Form management library
import { redirect, useRouter } from "next/navigation"; // Next.js functions for navigation
import { toast } from "react-hot-toast"; // Toast notification library
import { startRegistration } from "@simplewebauthn/browser"; // WebAuthn registration function
import { useSession } from "next-auth/react"; // NextAuth session hook
import { RedirectType } from "next/dist/client/components/redirect"; // Next.js redirect type
import { handleRegistrationError } from "@/lib/webauthn";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// MUI library imports
import { Backdrop, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import "yup-phone-lite";
import AppLogoSVG from "@/components/appLogo";
import LoadingSpinner from "@/components/Loading";
import { time } from "console";
import { ConfirmOptions, useConfirm } from "material-ui-confirm";
import moment from "moment";
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
  const { status } = useSession();
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const confirm = useConfirm();
  // Checking authorization status
  const authorized = status === "authenticated";
  const unAuthorized = status === "unauthenticated";
  const loading = status === "loading";

  // Initializing Next.js router
  const router = useRouter();

  // Validation schema for registration form
  const registerForm = {
    fullName: yup.string().required("Full name is required"),
    email: yup.string().required("Email is required").email("Invalid email format"),
    dob: yup.date().required("Date of birth is required").max(new Date(), "Date of birth must be in the past"),
    mobile: yup
      .string()
      // .phone("IN", "Please enter a valid mobile number")
      .required("A Mobile number is required"),
    // .matches(/^\+91 [6-9]\d{4} \d{5}$/, "Please enter a valid mobile number"),
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
  async function onSubmit(data: any) {
    setLoadingMessage("Registering...");
    const dobFormatted = moment(data.dob).format("YYYY-MM-DD");
    await registerWebauthn(
      data.email,
      data.fullName,
      dateOfBirthToUTCTimestamp(dobFormatted).toString(),
      data.mobile,
      router,
      confirm,
    );
    setLoadingMessage("");
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
      {/* Display branding */}
      <div style={{ textAlign: "center", margin: "0 10% 5% 10%" }}>
        {/* <img
          src="/zkidLogo_v1.svg"
          alt="EGS Logo"
          style={{
            maxWidth: "100%",
            height: "auto",
            marginBottom: "2rem",
            display: "inline-block",
          }}
        /> */}
        <AppLogoSVG theme="light" />
        {/* <Typography variant="h4" component="h2">
          zKID
        </Typography> */}
      </div>

      {/* Registration form */}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Registration
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name field */}
        <TextField
          id="fullName"
          type="text"
          variant="outlined"
          color="primary"
          label="Full Name (Firstname and Lastname)"
          fullWidth
          {...register("fullName")}
          error={touchedFields.fullName && Boolean(errors.fullName)}
          helperText={touchedFields.fullName ? errors.fullName?.message : ""}
          sx={{ mb: 2 }}
        />
        {/* Date of Birth field */}
        <TextField
          type="date"
          variant="outlined"
          color="primary"
          label="Date of Birth (DD/MM/YYYY)"
          InputLabelProps={{ shrink: true }}
          {...register("dob")}
          error={touchedFields.dob && Boolean(errors.dob)}
          helperText={touchedFields.dob ? errors.dob?.message : ""}
          fullWidth
          sx={{ mb: 2 }}
        />
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
          sx={{ mb: 2 }}
        />
        {/* Phone field */}
        <Controller
          name="mobile"
          control={control}
          rules={{
            validate: (value) => {
              console.log("value", value);
              return matchIsValidTel(value) || "Invalid mobile number";
            },
          }}
          render={({ field: { ref, ...field } }) => (
            <MuiTelInput
              disableDropdown
              inputRef={ref}
              inputProps={{ readOnly: false }}
              {...field}
              color="primary"
              defaultCountry="US"
              variant="outlined"
              // onlyCountries={["US", "IN"]}
              // onlyCountries={["IN"]}
              label="Mobile Number"
              error={!!errors.mobile}
              helperText={errors.mobile?.message}
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
        />
        {/* Submit button */}
        <Button variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>

      {/* Sign-in link */}
      <small>
        Already have an account?{" "}
        <Link style={{ textDecoration: "underline" }} href="/signin">
          Sign in Here
        </Link>
      </small>
      {loadingMessage && <LoadingSpinner message={loadingMessage} />}
    </>
  );
}
function dateOfBirthToUTCTimestamp(dateString: string) {
  // Split the input date string into year, month, and day components
  const [year, month, day] = dateString.split("-").map(Number);

  // Create a Date object with UTC time
  const dob = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  // Get the UTC Unix timestamp (epoch time) for the date of birth
  const timestamp = dob.getTime() / 1000;

  return timestamp;
}

// Function for registering WebAuthn credentials:
// - Constructs the registration URL using the provided email, first name, and last name
// - Fetches the registration options from the server using the constructed URL
// - If the options request is successful (status 200), starts the WebAuthn registration process
// - Sends the registration data to the server for verification and storage
// - If the registration request is successful (status 201), displays a success toast and can redirect to the sign-in page
// - If any error occurs during the process, displays an error toast and logs the error message or response
async function registerWebauthn(
  email: string,
  fullName: string,
  dob: string,
  mobile: string,
  router: AppRouterInstance,
  confirm: (options?: ConfirmOptions | undefined) => Promise<void>,
) {
  // Construct the registration URL
  const url = new URL("/api/auth/register/webauthn", window.location.origin);
  url.search = new URLSearchParams({ email, fullName, dob, mobile }).toString();

  // Fetch the registration options from the server
  const optionsResponse = await fetch(url.toString());
  const opt = await optionsResponse.json();

  // Handle error if the options request failed
  if (optionsResponse.status !== 200) {
    console.error(opt);
    alert(`Error: ${opt.error}`);
    // toast.error(opt.error);
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
      // toast.error("Could not register WebAuthn credentials.");
      alert("Error: Could not register nZKid credentials.");
      const errorResp = await response.json();
      console.error(errorResp);
    } else {
      // toast.success("Your WebAuthn credentials have been registered.", { duration: 10000 });
      alert("Your nZKid credentials have been registered.");
      // Redirect to the sign-in page
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    }
  } catch (err) {
    handleRegistrationError(err);
  }
}
