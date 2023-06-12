import "./globals.css";

import Providers from "./Providers";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  // suppressHydrationWarning is for next-themes - see: https://github.com/pacocoursey/next-themes#with-app
  <html lang="en" suppressHydrationWarning>
    <head>
    <meta name="viewport" content="initial-scale=1, width=device-width" />
    </head>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;