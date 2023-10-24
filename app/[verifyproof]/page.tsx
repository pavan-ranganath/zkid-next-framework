"use client";

import { CertificateDisplayProps } from "@/components/AgeVerificateCertificateDisplay";
import { CertificateDisplayForVerifier } from "@/components/AgeVerificationCertificateForVerifier";
import AppLogoSVG from "@/components/appLogo";
import { AgeVerificatingCertificate } from "@/lib/interfaces/Certificate.interface";
import { Backdrop, Box, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useConfirm } from "material-ui-confirm";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function VerifyProofComponent() {
  const searchParams = useSearchParams();
  const [certificateInfo, setCertificateInfo] = useState<CertificateDisplayProps>({} as CertificateDisplayProps);
  const userId = useMemo(() => {
    return searchParams.get("userId");
  }, [searchParams]);
  useEffect(() => {
    if (userId) {
      const getData = async (id: string) => {
        const response = await fetch(`/api/proof?userId=${id}&type=nAgeVerify`);
        const data = await response.json();
        console.log(data);
        setCertificateInfo(data);
      };

      getData(userId);
    }
  }, [userId]);

  if (userId && certificateInfo.certificateData === undefined) {
    return (
      <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (userId) {
    return (
      <CertificateDisplayForVerifier certificateData={certificateInfo.certificateData} shareUrl={certificateInfo.shareUrl} />
    );
  }
  return (
    <>
      {/* Display branding */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <AppLogoSVG theme="light" />
      </div>

      {/* Display the sign-in form */}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Verify nZKID Issued Documents
      </Typography>
      <Button variant="contained" color="primary" sx={{ marginBottom: 2 }}>
        Scan QR Code
      </Button>
      <Typography sx={{ marginBottom: 2 }} align="left">
        The nZKID documents have a QR code. This can be authenticated online using the verification utility in this portal.
      </Typography>
      <Typography variant="body1" align="left">
        1. Click on “Scan QR code”
      </Typography>
      <Typography variant="body1" align="left">
        2. A notification will prompt to activate your device&rsquo;s camera
      </Typography>
      <Typography variant="body1" align="left">
        3. Point the camera to the QR code on the document issued and scan
      </Typography>
    </>
  );
}
