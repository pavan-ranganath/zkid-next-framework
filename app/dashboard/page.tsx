"use client";

import PageTitle from "@/components/pageTitle";
import { useVerifyStatus } from "@/components/verificationStatusProvider";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Dashboard component
export default function Dashboard() {
  const verifyStatus = useVerifyStatus(); // Access verifyStatus from context
  const confirm = useConfirm();
  const router = useRouter();
  // display alert to navigate to profile page to verify profile if not verified
  useEffect(() => {
    if (!verifyStatus) {
      // alert("Please verify your profile to continue using the application features.");
      confirm({
        title: "Profile verification",
        description: "Please verify your profile to continue using the application features.",
        confirmationText: "Go to profile",
        // cancellationText: "Cancel",
        hideCancelButton: true,
        allowClose: false

      })
        .then(async () => {
          /* ... */
          router.push("/dashboard/profile");
        })
        .catch(() => {
          /* ... */
        });
    }
  }, [verifyStatus]);
  return (
    <>
      <PageTitle title="Home" />
    </>
  );
}
