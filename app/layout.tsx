import AuthProvider from "@/components/AuthProvider/AuthProvider";

// Importing global styles from "./globals.css"
// These styles are applied globally to the entire application
import "./globals.css";

import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import Providers from "./Providers";
import Pwa from "./Pwa";

export const metadata = {
  manifest: "/manifest.json",
  themeColor: "#ffffff",
};

// RootLayout component
// This component represents the root layout of the application
const RootLayout = ({ children }: { children: React.ReactNode }) => (
  // suppressHydrationWarning is for next-themes - see: https://github.com/pacocoursey/next-themes#with-app
  // Root HTML element with lang attribute set to "en" for language specification
  // suppressHydrationWarning attribute is added to suppress a hydration warning related to next-themes
  <html lang="en" suppressHydrationWarning>
    <head>
      {/* meta tag for defining the viewport */}
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    <body>
      {/* Providers component */}
      {/* This component wraps the application with MUI and Next themes providers */}
      <Providers>
        {/* Toaster component */}
        {/* This component is used for displaying toast notifications */}
        <Toaster />

        {/* AuthProvider component */}
        {/* This component is used for providing authentication context to its children */}
        <AuthProvider>{children}</AuthProvider>
      </Providers>
      <Pwa />
    </body>
  </html>
);

export default RootLayout;
