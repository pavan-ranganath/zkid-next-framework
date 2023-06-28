"use client";

// Importing the SessionProvider component from the "next-auth/react" module
// This component is used to provide session management and authentication capabilities
import { SessionProvider } from "next-auth/react";

// Importing the React library
// This is necessary to use JSX syntax and React components
import React from "react";

// AuthProvider is a component that wraps its children with the SessionProvider from next-auth/react
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
// Exporting the AuthProvider component as the default export
// This allows other components to import and use AuthProvider easily
