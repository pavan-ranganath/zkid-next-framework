import AuthProvider from "@/components/AuthProvider/AuthProvider";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import Providers from "./Providers";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  // suppressHydrationWarning is for next-themes - see: https://github.com/pacocoursey/next-themes#with-app
  <html lang="en" suppressHydrationWarning>
    <head>
      <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    <body>
      <Providers>
        <Toaster />
        <AuthProvider>{children}</AuthProvider>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
