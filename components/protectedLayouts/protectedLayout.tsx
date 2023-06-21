"use client";
import { useSession } from "next-auth/react";
import { RedirectType } from "next/dist/client/components/redirect";
import { useRouter, redirect } from "next/navigation";
import { useEffect } from "react";

export const ProtectedLayout = ({
  children
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const { status: sessionStatus } = useSession();
  const authorized = sessionStatus === "authenticated";
  const unAuthorized = sessionStatus === "unauthenticated";
  const loading = sessionStatus === "loading";

  useEffect(() => {
    // check if the session is loading or the router is not ready
    if (loading) return;

    // if the user is not authorized, redirect to the login page
    // with a return url to the current page
    if (unAuthorized) {
      redirect("/login", RedirectType.push);
    }
  }, [loading, unAuthorized, sessionStatus]);

  // if the user refreshed the page or somehow navigated to the protected page
  if (loading) {
    return <>Loading app...</>;
  }

  // if the user is authorized, render the page
  // otherwise, render nothing while the router redirects him to the login page
  return authorized ? <div>{children}</div> : <></>;
};
