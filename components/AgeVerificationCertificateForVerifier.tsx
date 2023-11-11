import React, { useEffect, useRef, useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import QRCode from "qrcode.react"; // Install qrcode.react
import { XMLParser } from "fast-xml-parser";
import { AgeVerificatingCertificate } from "@/lib/interfaces/Certificate.interface";
import Image from "next/image";
import { decodeBase64AndDeserializeProof, epochToDate } from "@/lib/services/utils";
import moment from "moment";
import { LoggerProps } from "@/lib/services/zkProofGenerators/ageVerificationProofGenerator";
import { Check, Close, Help } from "@mui/icons-material"; // Import icons from Material-UI
import { XadesClass } from "@/lib/services/XadesClass";
import { parseX509Certificate } from "@/lib/generateCertificate";
import { pki } from "node-forge";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useConfirm } from "material-ui-confirm";
import { dialogContentContactUs, dialogContentVerifyProof } from "@/lib/services/dialogContent";
import DigitalSignatureTag from "./DigitalSignatureTag";
import AlertMessageDialog from "./AlertMessageDialog";
import { AgeverificationVerifierInputModal } from "./ageverificationVerifierInputModal";
import { CertificateDisplayProps } from "./AgeVerificateCertificateDisplay";

// import { readFileSync } from 'fs';
// import path from 'path';
import LoadingSpinner from "./Loading";
import ReusableDialog from "./ReusableDialog";

const snarkjs = require("snarkjs") as typeof import("snarkjs");

// const vKeyfilePath = path.join(process.cwd(), "lib/circomBuilds/ageVerifcation/ageProof.vkey.json");
// const vKeyfile = readFileSync(vKeyfilePath);

export const CertificateDisplayForVerifier = (displayProps: CertificateDisplayProps) => {
  const alertMessageDialogRef = useRef<{
    handleAlertOpen: (message: string, severity: "success" | "error" | "warning" | "info") => void;
  } | null>(null);
  const [isAgeverificationVerifierInputModalOpen, setAgeverificationVerifierInputModalOpen] = useState(false);
  const [isProofVerified, setIsProofVerified] = useState<boolean | null>(null);
  const [isSignatureVerified, setIsSignatureVerified] = useState<boolean | null>(null);
  const [signatureCertificate, setSignatureCertificate] = useState<{ signCert: pki.Certificate; signedDate: Date }>(
    {} as { signCert: pki.Certificate; signedDate: Date },
  );
  const [certificateInfo, setCertificateInfo] = useState<AgeVerificatingCertificate>({} as AgeVerificatingCertificate);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogContent, setDialogContent] = useState<any>(dialogContentVerifyProof);
  useEffect(() => {
    // Parse the XML data and extract the required information
    // You can use a library like xml2js for this stepxw
    // Extract the relevant data and update the certificateInfo state
    if (displayProps.certificateData === "") return;
    const parser = new XMLParser({
      attributeNamePrefix: "",
      textNodeName: "_",
      ignoreAttributes: false,
    });
    const parsedData = parser.parse(displayProps.certificateData); // Implement your own parseXML function
    console.log(parsedData);
    setCertificateInfo(parsedData);
  }, [displayProps]);
  const handleAgeverificationVerifierInputCloseModal = async (formData: { age: string; date: number }) => {
    setAgeverificationVerifierInputModalOpen(false);

    // Do something with the form data received from the modal
    console.log("Form data received from modal:", formData);
    // Use the formData to verify the proof
    // check if formdata is not null
    if (formData) {
      setLoadingMessage("Verifying proof...");
      // Implement verification logic here
      const encodedZKproof = certificateInfo.Certificate.CertificateData?.ZKPROOF._;
      const ZKproof = decodeBase64AndDeserializeProof(encodedZKproof);
      const publicSignal = [
        "1",
        moment(formData.date).date().toString(),
        (moment(formData.date).month() + 1).toString(),
        moment(formData.date).year().toString(),
        formData.age,
      ];

      const vkey = await fetch("ageProof.vkey.json").then(function (res) {
        return res.json();
      });
      const plonkResult: boolean = await snarkjs.plonk.verify(vkey, publicSignal, ZKproof, Logger());
      const message = plonkResult ? "Proof verified successfully" : "Proof verification failed";
      const severity = plonkResult ? "success" : "error";

      if (alertMessageDialogRef.current) {
        alertMessageDialogRef.current.handleAlertOpen(message, severity);
      }
      setIsProofVerified(plonkResult);
    }
    setLoadingMessage("");
  };

  const verifyXMLSignature = async () => {
    setLoadingMessage("Verifying signature...");
    const xades = new XadesClass();
    const resultOfSignatureVerification = await xades.verifyXml(displayProps.certificateData);
    const message = resultOfSignatureVerification ? "Signature verified successfully" : "Signature verification failed";
    const severity = resultOfSignatureVerification ? "success" : "error";
    if (alertMessageDialogRef.current) {
      alertMessageDialogRef.current.handleAlertOpen(message, severity);
    }
    setIsSignatureVerified(resultOfSignatureVerification);
    showSignatureCertificate();
    setLoadingMessage("");
  };
  function showSignatureCertificate() {
    const base64CertString =
      certificateInfo.Certificate["ds:Signature"]["ds:KeyInfo"]["ds:X509Data"][0]["ds:X509Certificate"];
    // Decode the base64-encoded string
    const binaryData = Buffer.from(base64CertString, "base64");

    // Format the binary data as a PEM certificate
    const pemCertificate = `-----BEGIN CERTIFICATE-----\n${binaryData.toString("base64")}\n-----END CERTIFICATE-----`;

    const x509Cert = parseX509Certificate(pemCertificate);
    if (x509Cert === null) {
      console.log("Error parsing certificate");
      return;
    }
    setSignatureCertificate({
      signCert: x509Cert,
      signedDate: new Date(
        certificateInfo.Certificate["ds:Signature"]["ds:Object"]["xades:QualifyingProperties"]["xades:SignedProperties"][
          "xades:SignedSignatureProperties"
        ]["xades:SigningTime"],
      ),
    });
    // Use the getField method to get the organization field (OID 2.5.4.10)
    // const organizationField = x509Cert.subject.getField({ type: '2.5.4.10' }).value;
  }
  if (!displayProps.certificateData) {
    return <div>No certificate data</div>;
  }
  if (!certificateInfo.Certificate) {
    return (
      <>
        {/* Display a loading backdrop */}
        <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </>
    );
  }
  const handleOpenDialog = (_dialogContent: any) => {
    setDialogContent(_dialogContent);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const dialogActions = [
    // {
    //   label: 'Cancel',
    //   onClick: handleCloseDialog,
    //   color: 'default',
    // },
    {
      label: "CLOSE",
      onClick: handleCloseDialog,
    },
  ];

  return (
    <>
      <Box sx={styles.cardContainer}>
        <Card sx={{ ...styles.card }}>
          <CardContent sx={styles.centeredContent}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h4" sx={{ textTransform: "capitalize" }}>
                {certificateInfo.Certificate.name} proof
              </Typography>
              <InfoOutlinedIcon
                color="primary"
                fontSize="small"
                sx={{ marginLeft: 1 }}
                onClick={() => handleOpenDialog(dialogContentVerifyProof)}
              />
            </Box>
            <Typography sx={{ marginBottom: 1 }}>
              Issued By: {certificateInfo.Certificate.IssuedBy.Organization.name}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4} sx={styles.centeredContent}>
                <Image
                  src={`data:image/jpeg;base64, ${certificateInfo.Certificate.IssuedTo.Person.Photo._}`}
                  alt="Person's Photo"
                  width={100}
                  height={100}
                />
              </Grid>
              <Grid item xs={8} sx={{ ...styles.centeredContent, alignItems: "start" }}>
                <Typography variant="h5">{certificateInfo.Certificate.IssuedTo.Person.name}</Typography>
                <Typography variant="h6">
                  Claimed Age: {certificateInfo.Certificate.CertificateData?.ZKPROOF?.claimedAge}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={styles.centeredContent}>
                <Typography>
                  Issued: {moment(epochToDate(certificateInfo.Certificate.issueDate)).format("DD, MMM, YYYY")}
                </Typography>
              </Grid>
              <Grid item xs={6} sx={styles.centeredContent}>
                <Typography>
                  Expiry: {moment(epochToDate(certificateInfo.Certificate.expiryDate)).format("DD, MMM, YYYY")}
                </Typography>
              </Grid>
            </Grid>
            {/* <QRCode value={displayProps.shareUrl} /> */}
            <Box sx={styles.buttonsContainer}>
              <Button onClick={() => setAgeverificationVerifierInputModalOpen(true)} variant="contained" color="primary">
                Verify Proof
              </Button>
              <Button variant="contained" color="primary" onClick={verifyXMLSignature}>
                Verify Signature
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <AgeverificationVerifierInputModal
        open={isAgeverificationVerifierInputModalOpen}
        onClose={handleAgeverificationVerifierInputCloseModal}
        data={certificateInfo}
      />
      {/* Separate section for verification status */}
      <List sx={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "16px" }}>
        <ListItem>
          <ListItemText primary="Proof verification status" />
          {isProofVerified === null && <Help sx={{ color: "gray", fontSize: "1.5rem" }} />}
          {isProofVerified === true && <Check sx={{ color: "green", fontSize: "1.5rem" }} />}
          {isProofVerified === false && <Close sx={{ color: "red", fontSize: "1.5rem" }} />}
        </ListItem>

        <ListItem>
          <ListItemText primary="Signature verification status" />
          {isSignatureVerified === null && <Help sx={{ color: "gray", fontSize: "1.5rem" }} />}
          {isSignatureVerified === true && <Check sx={{ color: "green", fontSize: "1.5rem" }} />}
          {isSignatureVerified === false && <Close sx={{ color: "red", fontSize: "1.5rem" }} />}
        </ListItem>
      </List>
      {isSignatureVerified === true && (
        <DigitalSignatureTag certificate={signatureCertificate.signCert} ageVerificationXMLCertificate={certificateInfo} />
      )}
      <AlertMessageDialog ref={alertMessageDialogRef} /> {/* Render the alert component */}
      {loadingMessage && <LoadingSpinner message={loadingMessage} />}
      <ReusableDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        title={dialogContent.title}
        content={dialogContent.content}
        actions={dialogActions}
      />
      {/* <br /> */}
      {/* Contact us link */}
      <small>
        Have questions?{" "}
        <Link
          style={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => handleOpenDialog(dialogContentContactUs)}
        >
          Contact Us
        </Link>
      </small>
    </>
  );
};
const styles = {
  centeredContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    perspective: "1000px",
    width: "100%",
    minHeight: "300px",
    margin: "0 auto",
  },
  card: {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.5s",
  },
  buttonsContainer: {
    marginTop: "16px",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    "& > button": {
      marginRight: "6px", // Adjust the margin to your preference
    },
  },
};

const Logger = () => {
  const logger: LoggerProps = {
    debug: (message: string) => {
      console.log(`[DEBUG] ${message}`);
    },
    error: (message: string) => {
      console.log(`[ERROR] ${message}`);
    },
    info: (message: string) => {
      console.log(`[INFO] ${message}`);
    },
    warn(message: string) {
      console.log(`[WARN] ${message}`);
    },
  };

  return logger;
};
