"use client";
import { Backdrop, Box, CircularProgress } from "@mui/material";
import { useSession } from "next-auth/react";
import { RedirectType } from "next/dist/client/components/redirect";
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

export const ProtectedLayout = ({
  children
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const { status: sessionStatus } = useSession();
  const authorized = sessionStatus === "authenticated";
  const unAuthorized = sessionStatus === "unauthenticated";
  const loading = sessionStatus === "loading";
  console.log(sessionStatus)
  useEffect(() => {
    // check if the session is loading or the router is not ready
    if (sessionStatus === 'authenticated') {
      // User is authenticated, continue to the protected route
      return
    }

    if (sessionStatus === 'loading') {
      // Session is loading, show a loading indicator or redirect if needed
      return
    }

    // if the user is not authorized, redirect to the login page
    // with a return url to the current page
    if (unAuthorized) {
      toast.loading("Please signin to view this page")
      redirect("/signin", RedirectType.push);
    }
  }, [sessionStatus]);

  // if the user refreshed the page or somehow navigated to the protected page
  if (loading) {
    return <>
      <Backdrop
        open={true}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>;
  }

  // if the user is authorized, render the page
  // otherwise, render nothing while the router redirects him to the login page
  return <div>{children}</div>;
};
