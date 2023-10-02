"use client";

/**
 * The 'react' package provides the necessary components and utilities for building React applications.
 * It includes the core React library and other essential components, hooks, and functions.
 */
import React from "react";
/**
 * The 'NavigationBar' component is imported from the '@/components/NavigationBar/navigationBar' module.
 * It represents the navigation bar component used in the dashboard layout.
 * The navigation bar typically contains links or menus for navigating between different sections or pages of the application.
 */
import NavigationBar from "@/components/NavigationBar/navigationBar";
import { ConfirmProvider } from "material-ui-confirm";
import Providers from "../Providers";

/**
 * DashboardLayout is a layout component that provides a common layout structure for the dashboard page.
 * It includes a navigation bar and wraps the content with Providers, which include theme provider
 *
 * @param children - The child components to be rendered within the layout.
 * @returns The rendered DashboardLayout component.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Providers>
        <NavigationBar />
        <ConfirmProvider>
          <div style={{ margin: 10 }}>{children}</div>
        </ConfirmProvider>
      </Providers>
    </>
  );
}
