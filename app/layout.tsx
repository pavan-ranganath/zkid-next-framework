import AuthProvider from "@/components/AuthProvider/AuthProvider";
import "./globals.css";

import Providers from "./Providers";
import { Toaster } from "react-hot-toast";

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
