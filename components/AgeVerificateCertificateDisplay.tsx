import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import QRCode from 'qrcode.react'; // Install qrcode.react
import { XMLParser } from "fast-xml-parser";
import { AgeVerificatingCertificate } from '@/lib/interfaces/Certificate.interface';
import Image from 'next/image';

export interface CertificateDisplayProps {
    certificateData: string;
    shareUrl: string;
}

export const CertificateDisplay = (displayProps: CertificateDisplayProps) => {
    const [showQR, setShowQR] = useState(true);

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

    if (!displayProps.certificateData) {
        return <div>No certificate data</div>;
    }
    if (!certificateInfo.Certificate) {
        return <div>Loading...</div>;
    }
    const flipCard = () => {
        setShowQR(!showQR);
    };
    return (
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
                    {showQR && (<QRCode value={displayProps.shareUrl} />)}
                    <Box sx={styles.buttonsContainer}>
                        <Button variant="contained" color="primary" onClick={flipCard}>
                            {!showQR ? "Display QR" : "Hide QR"}
                        </Button>
                        <Button variant="contained" color="primary">
                            Share
                        </Button>
                        <Button variant="contained" color="primary">
                            Download
                        </Button>
                    </Box>
                </CardContent>
            </Card>

        </Box>

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
        display: 'flex',
        justifyContent: 'space-between',
        '& > button': {
            marginRight: '6px', // Adjust the margin to your preference
        },
    },
};
export default CertificateDisplay;