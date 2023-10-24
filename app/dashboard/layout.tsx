"use client";

/**
 * The 'react' package provides the necessary components and utilities for building React applications.
 * It includes the core React library and other essential components, hooks, and functions.
 */
import React, { useEffect } from "react";
/**
 * The 'NavigationBar' component is imported from the '@/components/NavigationBar/navigationBar' module.
 * It represents the navigation bar component used in the dashboard layout.
 * The navigation bar typically contains links or menus for navigating between different sections or pages of the application.
 */
import NavigationBar from "@/components/NavigationBar/navigationBar";
import { ConfirmProvider } from "material-ui-confirm";
import useSWR from "swr";
import VerificationBanner from "@/components/verificationBanner";
import { VerifyStatusProvider } from "@/components/verificationStatusProvider";
import { fetcher } from "@/lib/services/apiService";
import Providers from "../Providers";

/**
 * DashboardLayout is a layout component that provides a common layout structure for the dashboard page.
 * It includes a navigation bar and wraps the content with Providers, which include theme provider
 *
 * @param children - The child components to be rendered within the layout.
 * @returns The rendered DashboardLayout component.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // // set state for profile verification
  // const [profileVerified, setProfileVerified] = React.useState(false);
  // check for profile verification by making API call to /api/profile
  // if not verified, redirect to profile page to verify and display a message to indicate that the profile is not verified
  const {
    data: verifyStatus,
    error: errorVerifyStatus,
    isLoading: verifyStatusIsLoading,
  } = useSWR<{ status: boolean }>("/api/profile", fetcher, {
    // suspense: true,
  });
  if (errorVerifyStatus) {
    return <>Error</>;
  }
  if (verifyStatusIsLoading) {
    return <>Loading</>;
  }

  return (
    <>
      <Providers>
        <NavigationBar />
        <VerifyStatusProvider initialStatus={verifyStatus?.status ? verifyStatus?.status : false}>
          {" "}
          {/* Provide the initial status */}
          <ConfirmProvider>
            <div style={{ margin: 10 }}>{children}</div>
          </ConfirmProvider>
        </VerifyStatusProvider>
      </Providers>
    </>
  );
}
