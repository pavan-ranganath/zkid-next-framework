"use client";

import { Backdrop, CircularProgress } from "@mui/material";
// Importing required modules and components

// Importing the Backdrop and CircularProgress components from the Material-UI library
// These components are used to display a loading indicator backdrop while content is being loaded or processed


// Importing the useSession hook from the next-auth/react package
// This hook is used to access the user session information provided by Next.js authentication
import { useSession } from "next-auth/react";

// Importing the RedirectType type from the next package
// This type is used to specify the type of redirect when navigating to a different page
import { RedirectType } from "next/dist/client/components/redirect";

// Importing the redirect function from the next/navigation module
// This function is used to programmatically navigate to a different page in the application
import { redirect } from "next/navigation";

// Importing the useEffect hook from the React library
// This hook is used to perform side effects in functional components, such as executing code on component mount or when dependencies change
import { useEffect } from "react";

// Importing the toast function from the react-hot-toast package
// This function is used to display toast messages, which are temporary notifications shown to the user
import { toast } from "react-hot-toast";

// Creating a component named ProtectedLayout
export const ProtectedLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  // Checking the status of the user session
  const { status: sessionStatus } = useSession();

  // Checking if the user is authenticated, unauthenticated, or loading
  const authorized = sessionStatus === "authenticated";
  const unAuthorized = sessionStatus === "unauthenticated";
  const loading = sessionStatus === "loading";

  // Logging the session status to the console
  console.log(sessionStatus);

  // Executing the following code on component mount or when the sessionStatus changes
  useEffect(() => {
    // Check if the session is loading or the router is not ready
    if (authorized) {
      // User is authenticated, continue to the protected route
      return;
    }

    if (loading) {
      // Session is loading, show a loading indicator or redirect if needed
      return;
    }

    // If the user is not authorized, redirect to the login page
    // with a return URL to the current page
    if (unAuthorized) {
      // Display a loading toast message
      toast.loading("Please sign in to view this page");

      // Redirect to the login page using the push method
      redirect("/signin", RedirectType.push);
    }
  }, [unAuthorized, authorized, loading]);

  // If the user refreshed the page or somehow navigated to the protected page
  if (loading) {
    // Display a backdrop with a loading indicator
    return (
      <>
        <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }

  // If the user is authorized, render the page
  // Otherwise, render nothing while the router redirects them to the login page
  return <div>{children}</div>;
};
