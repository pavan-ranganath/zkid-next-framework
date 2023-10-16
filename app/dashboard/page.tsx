"use client";

import CertificateDisplay, { CertificateDisplayProps } from "@/components/AgeVerificateCertificateDisplay";
import PageTitle from "@/components/pageTitle";
import { useVerifyStatus } from "@/components/verificationStatusProvider";
import { AgeVerificatingCertificate } from "@/lib/interfaces/Certificate.interface";
import { Button, Card, CardContent, CardHeader, Grid } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Dashboard component
export default function Dashboard() {
  const verifyStatus = useVerifyStatus(); // Access verifyStatus from context
  const confirm = useConfirm();
  const router = useRouter();
  const [vertificateData, setVertificateData] = useState<CertificateDisplayProps>({ certificateData: "", shareUrl: "" });
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
        allowClose: false,
      })
        .then(async () => {
          /* ... */
          router.push("/dashboard/profile");
        })
        .catch(() => {
          /* ... */
        });
    }
  }, [verifyStatus, confirm, router]);

  // API request to generate proof after button click
  const generateProof = async () => {

    const response = await fetch("/api/proof/ageverification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ claimedAge: 21 }),
    });
    const data = await response.json();
    console.log(data);
    setVertificateData(data);

  };
  return (
    <>
      <PageTitle title="Home" />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <CardHeader title="Generate Proof" />
            <CardContent>
              <Button variant="contained" color="primary" onClick={generateProof}>Age Verification</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <CardHeader title="Certificates" />
            <CardContent>
              <CertificateDisplay certificateData={vertificateData.certificateData} shareUrl={vertificateData.shareUrl} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    </>
  );
}
