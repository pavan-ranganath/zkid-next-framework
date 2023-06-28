import React from "react";
import NavigationBar from "@/components/NavigationBar/navigationBar";
import Providers from "../Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Providers>
        <NavigationBar />
        {children}
      </Providers>
    </>
  );
}
