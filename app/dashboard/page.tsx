"use client";

import { CertificateDisplay, CertificateDisplayProps } from "@/components/AgeVerificateCertificateDisplay";
import { AgeverificationProverInputModal } from "@/components/AgeVerificationProverInputModal";
import LoadingSpinner from "@/components/Loading";
import { ZKidDigitalCardDisplay } from "@/components/ZKidDigitalCard";
import PageTitle from "@/components/pageTitle";
import { useVerifyStatus } from "@/components/verificationStatusProvider";
import { AgeVerificatingCertificate } from "@/lib/interfaces/Certificate.interface";
import { fetcher } from "@/lib/services/apiService";
import { credentailsFromTb } from "@/lib/services/userService";
import { Button, Card, CardContent, CardHeader, Grid } from "@mui/material";
import { ConfirmOptions, useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
// Dashboard component
export default function Dashboard() {
  const [isAgeverificationProverInputModalOpen, setAgeverificationProverInputModalOpen] = useState(false);
  const verifyStatus = useVerifyStatus(); // Access verifyStatus from context
  const confirm = useConfirm();
  const router = useRouter();
  const [vertificateData, setVertificateData] = useState<CertificateDisplayProps | null>(null);
  const [userInfo, setUserInfo] = useState<credentailsFromTb | null>(null);
  const [error, setError] = useState<any>(null);
  const [userInfoIsLoading, setUserInfoIsLoading] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const handleAgeverificationProverInputCloseModal = async (formData: { claimAge: string; claimDate: number }) => {
    setAgeverificationProverInputModalOpen(false);
    if (!formData) {
      return;
    }
    if (formData.claimAge === "" || formData.claimDate === 0) {
      return;
    }
    setLoadingMessage("Generating proof...");
    await generateProof(formData);
    setLoadingMessage("");
  };
  // Get certificate data from backend
  const getCertificateData = async () => {
    const response = await fetch("/api/proof");
    if (response.status !== 200) {
      setVertificateData({ certificateData: "", shareUrl: "", deleteButton: () => { } });
      return;
    }
    const data = await response.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    if (data) {
      setVertificateData(data);
      return;
    }
    setVertificateData({ certificateData: "", shareUrl: "", deleteButton: () => { } });
  };

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
    } else {
      getCertificateData();
    }
  }, [verifyStatus, confirm, router]);
  // API request to generate proof after button click
  const generateProof = async (formData: { claimAge: string; claimDate: number }) => {
    const response = await fetch("/api/proof/ageverification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    const data = await response.json();
    setLoadingMessage("");
    if (data.error) {
      alert(data.error);
      return;
    }
    setVertificateData(data);
  };
  const deleteAgeVerificationproof = () => {
    // Implement the delete logic here
    // use a library like material-ui-confirm for confirmation dialog
    // make Delete http request to /api/ageverification to delete the certificate from the database
    const confirmOptions: ConfirmOptions = {
      title: "Delete Age Verification Proof",
      description: "Are you sure you want to delete this age verification proof?",
      confirmationText: "Delete",
      cancellationText: "Cancel",
      dialogProps: { maxWidth: "sm" },
    };
    confirm(confirmOptions).then(async () => {
      console.log("deleted");
      // send DELETE request to /api/ageverification
      const deleteProof = await fetch("/api/proof/ageverification", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (deleteProof.status === 200) {
        // if delete is successful, redirect to home page
        window.location.href = "/";
      } else {
        const resp = await deleteProof.json();
        console.log("deleteProof error", resp);
        // else show error message
        alert("Error deleting age verification proof");
      }

    });
  }
  return (
    <>
      <PageTitle title="Home" />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} md={6} sm={6}>
          {verifyStatus && <ZKidDigitalCardDisplay />}
        </Grid>
        <Grid item xs={12} md={6} sm={6}>
          <Card variant="outlined">
            <CardHeader title="nZKP Certificates" />
            <CardContent>
              {vertificateData !== null ? (
                <CertificateDisplay certificateData={vertificateData.certificateData} shareUrl={vertificateData.shareUrl} deleteButton={deleteAgeVerificationproof} />
              ) : (
                <p>Loading...</p>
              )}
              {vertificateData?.certificateData === "" && (
                <Button variant="contained" onClick={() => setAgeverificationProverInputModalOpen(true)}>
                  Generate new proof
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <AgeverificationProverInputModal
        open={isAgeverificationProverInputModalOpen}
        onClose={handleAgeverificationProverInputCloseModal}
      />
      {loadingMessage && <LoadingSpinner message={loadingMessage} />}
    </>
  );
}
