import React from "react";
import Providers from "../Providers";
import { ProtectedLayout } from "@/components/protectedLayouts/protectedLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactElement;
}) {
  return (
    <>
      <Providers>
        <ProtectedLayout>{children}</ProtectedLayout>
      </Providers>
    </>
  );
}
