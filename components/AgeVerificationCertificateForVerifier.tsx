import React, { useEffect, useRef, useState } from 'react';
import { Backdrop, Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import QRCode from 'qrcode.react'; // Install qrcode.react
import { XMLParser } from "fast-xml-parser";
import { AgeVerificatingCertificate } from '@/lib/interfaces/Certificate.interface';
import Image from 'next/image';
import { CertificateDisplayProps } from './AgeVerificateCertificateDisplay';
import AgeverificationVerifierInputModal from './ageverificationVerifierInputModal';
import { decodeBase64AndDeserializeProof } from '@/lib/services/utils';
const snarkjs = require("snarkjs") as typeof import("snarkjs");
import moment from 'moment';
import { LoggerProps } from '@/lib/services/zkProofGenerators/ageVerificationProofGenerator';
import { Check, Close, Help } from '@mui/icons-material'; // Import icons from Material-UI
import AlertMessageDialog from './AlertMessageDialog';
import { XadesClass } from '@/lib/services/XadesClass';

// import { readFileSync } from 'fs';
// import path from 'path';


// const vKeyfilePath = path.join(process.cwd(), "lib/circomBuilds/ageVerifcation/ageProof.vkey.json");
// const vKeyfile = readFileSync(vKeyfilePath);

export const CertificateDisplayForVerifier = (displayProps: CertificateDisplayProps) => {
    const alertMessageDialogRef = useRef<{ handleAlertOpen: (message: string, severity: "success" | "error" | "warning" | "info") => void } | null>(null);
    const [isAgeverificationVerifierInputModalOpen, setAgeverificationVerifierInputModalOpen] = useState(false);
    const [isProofVerified, setIsProofVerified] = useState<boolean | null>(null);
    const [isSignatureVerified, setIsSignatureVerified] = useState<boolean | null>(null);
    const [certificateInfo, setCertificateInfo] = useState<AgeVerificatingCertificate>({} as AgeVerificatingCertificate);
    const parser = new XMLParser({
        attributeNamePrefix: '',
        textNodeName: '_',
        ignoreAttributes: false,
    });
    useEffect(() => {
        // Parse the XML data and extract the required information
        // You can use a library like xml2js for this stepxw
        // Extract the relevant data and update the certificateInfo state
        if (displayProps.certificateData === "") return;
        const parsedData = parser.parse(displayProps.certificateData); // Implement your own parseXML function
        console.log(parsedData);
        setCertificateInfo(parsedData);
    }, [displayProps]);
    const handleAgeverificationVerifierInputCloseModal = async (formData: { age: string, date: string }) => {
        setAgeverificationVerifierInputModalOpen(false);
        // Do something with the form data received from the modal
        console.log("Form data received from modal:", formData);
        // Use the formData to verify the proof
        // check if formdata is not null
        if (formData) {
            //Implement verification logic here
            const encodedZKproof = certificateInfo.Certificate.CertificateData?.ZKPROOF._;
            const ZKproof = decodeBase64AndDeserializeProof(encodedZKproof);
            const publicSignal =
                [
                    '1',
                    moment(formData.date).date().toString(),
                    (moment(formData.date).month() + 1).toString(),
                    moment(formData.date).year().toString(),
                    formData.age,
                ]

            const vkey = await fetch("ageProof.vkey.json").then(function (res) {
                return res.json();
            });
            const plonkResult: boolean = await snarkjs.plonk.verify(vkey, publicSignal, ZKproof, Logger());
            const message = plonkResult ? 'Proof verified successfully' : 'Proof verification failed';
            const severity = plonkResult ? 'success' : 'error';

            if (alertMessageDialogRef.current) {
                alertMessageDialogRef.current.handleAlertOpen(message, severity);
            }
            setIsProofVerified(plonkResult);
        }
    };

    const verifyXMLSignature = async () => {
        const xades = new XadesClass();
        const resultOfSignatureVerification = await xades.verifyXml(displayProps.certificateData);
        const message = resultOfSignatureVerification ? 'Signature verified successfully' : 'Signature verification failed';
        const severity = resultOfSignatureVerification ? 'success' : 'error';
        if (alertMessageDialogRef.current) {
            alertMessageDialogRef.current.handleAlertOpen(message, severity);
        }
        setIsSignatureVerified(resultOfSignatureVerification);
    }

    if (!displayProps.certificateData) {
        return <div>No certificate data</div>;
    }
    if (!certificateInfo.Certificate) {
        return <>
            {/* Display a loading backdrop */}
            <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>
        </>
    }
    return (
        <>
            <Box sx={styles.cardContainer}>
                <Card sx={{ ...styles.card }}>
                    <CardContent sx={styles.centeredContent}>
                        <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>{certificateInfo.Certificate.name} proof</Typography>
                        <Typography>Issued By: {certificateInfo.Certificate.IssuedBy.Organization.name}</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4} sx={styles.centeredContent}>
                                <Image
                                    src={`data:image/jpeg;base64, ${certificateInfo.Certificate.IssuedTo.Person.Photo._}`}
                                    alt="Person's Photo"
                                    width={100}
                                    height={100}
                                />
                            </Grid>
                            <Grid item xs={8} sx={{ ...styles.centeredContent, alignItems: 'start' }}>
                                <Typography variant="h5">{certificateInfo.Certificate.IssuedTo.Person.name}</Typography>
                                <Typography variant="h6">Claimed Age: {certificateInfo.Certificate.CertificateData?.ZKPROOF?.claimedAge}</Typography>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sx={styles.centeredContent}>
                                <Typography>Issued: {certificateInfo.Certificate.issueDate}</Typography>
                            </Grid>
                            <Grid item xs={6} sx={styles.centeredContent}>
                                <Typography>Expiry: {certificateInfo.Certificate.expiryDate}</Typography>
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
            <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '16px' }}>
                <ListItem>
                    <ListItemText primary="Proof verification status" />
                    {isProofVerified === null ? <Help sx={{ color: 'gray', fontSize: '1.5rem' }} /> : isProofVerified ? <Check sx={{ color: 'green', fontSize: '1.5rem' }} /> : <Close sx={{ color: 'red', fontSize: '1.5rem' }} />}
                </ListItem>
                <ListItem>
                    <ListItemText primary="Signature verification status" />
                    {isSignatureVerified === null ? <Help sx={{ color: 'gray', fontSize: '1.5rem' }} /> : isSignatureVerified ? <Check sx={{ color: 'green', fontSize: '1.5rem' }} /> : <Close sx={{ color: 'red', fontSize: '1.5rem' }} />}
                </ListItem>
            </List>
            <AlertMessageDialog ref={alertMessageDialogRef} /> {/* Render the alert component */}
        </>

    );
};
const styles = {
    centeredContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        perspective: '1000px',
        width: '100%',
        minHeight: '300px',
        margin: '0 auto',
    },
    card: {
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.5s',
    },
    buttonsContainer: {
        marginTop: '16px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        '& > button': {
            marginRight: '6px', // Adjust the margin to your preference
        },
    },
};
export default CertificateDisplayForVerifier;

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
