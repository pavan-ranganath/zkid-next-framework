import React, { useEffect, useState } from 'react';
import { Backdrop, Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid, Typography } from '@mui/material';
import QRCode from 'qrcode.react'; // Install qrcode.react
import { XMLParser } from "fast-xml-parser";
import { AgeVerificatingCertificate } from '@/lib/interfaces/Certificate.interface';
import Image from 'next/image';
import moment from 'moment';
import { saveAs } from 'file-saver';
import ShareButton from './ShareButtons';
import { ConfirmOptions } from 'material-ui-confirm';
import { epochToDate } from '@/lib/services/utils';

export interface CertificateDisplayProps {
    certificateData: string;
    shareUrl: string;
}

export const CertificateDisplay = (displayProps: CertificateDisplayProps) => {

    const [certificateInfo, setCertificateInfo] = useState<AgeVerificatingCertificate>({} as AgeVerificatingCertificate);
    const parser = new XMLParser({
        attributeNamePrefix: '',
        textNodeName: '_',
        ignoreAttributes: false,
    });
    const handleDownload = () => {
        const blob = new Blob([displayProps.certificateData], { type: 'application/xml' });
        saveAs(blob, certificateInfo.Certificate.name + '.xml');
    };
    useEffect(() => {
        // Parse the XML data and extract the required information
        // You can use a library like xml2js for this stepxw
        // Extract the relevant data and update the certificateInfo state
        if (displayProps.certificateData === "") return;
        const parsedData = parser.parse(displayProps.certificateData); // Implement your own parseXML function
        console.log("certificateData", parsedData);
        setCertificateInfo(parsedData);
    }, [displayProps]);

    if (displayProps.certificateData === "") {
        return <></>;
    }
    if (!certificateInfo.Certificate) {
        return <>
            <CircularProgress color="inherit" />
        </>
    }

    return (
        <Box sx={styles.cardContainer}>
            <Card sx={{ ...styles.card }}>
                <CardContent sx={styles.centeredContent}>
                    <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>{certificateInfo.Certificate.name} proof</Typography>
                    <Typography >Issued By: {certificateInfo.Certificate.IssuedBy.Organization.name}</Typography>
                    <Grid container spacing={2} style={styles.spacingBetween}>
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
                    <Grid container spacing={2} style={styles.spacingBetween}>
                        <Grid item xs={6} sx={styles.centeredContent}>
                            <Typography>Issued: {moment(epochToDate(certificateInfo.Certificate.issueDate)).format("DD, MMM, YYYY")}</Typography>
                        </Grid>
                        <Grid item xs={6} sx={styles.centeredContent}>
                            <Typography>Expiry: {moment(epochToDate(certificateInfo.Certificate.expiryDate)).format("DD, MMM, YYYY")}</Typography>
                        </Grid>
                    </Grid>
                    <QRCode value={displayProps.shareUrl} style={styles.spacingBetween} />
                    <Box sx={styles.buttonsContainer}>

                        {/* <Button variant="contained" color="primary">
                            Share
                        </Button> */}
                        <ShareButton style={{ marginRight: '6px' }} url={displayProps.shareUrl} />
                        <Button variant="contained" color="primary" onClick={handleDownload}>
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
    spacingBetween: {
        paddingTop: '5px',
    }
};
export default CertificateDisplay;
