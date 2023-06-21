import React from "react";
import Providers from "../Providers";
import { ProtectedLayout } from "@/components/protectedLayouts/protectedLayout";
import NavigationBar from "@/components/NavigationBar/navigationBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <>
      <Providers>
        <ProtectedLayout>
          <NavigationBar />
          {children}
        </ProtectedLayout>
      </Providers>
    </>
  );
}
