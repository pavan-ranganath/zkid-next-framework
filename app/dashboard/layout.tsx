import React from "react";
import Providers from "../Providers";
import NavigationBar from "@/components/NavigationBar/navigationBar";
import { ProtectedLayout } from "@/components/protectedLayouts/protectedLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Providers>
        <NavigationBar />
        {children}
      </Providers>
    </>
  );
}
