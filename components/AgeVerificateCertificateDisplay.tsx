import React, { useEffect, useState } from 'react';
import { Button, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import QRCode from 'qrcode.react'; // Install qrcode.react
import { XMLParser } from "fast-xml-parser";
import { AgeVerificatingCertificate } from '@/lib/interfaces/Certificate.interface';
import Image from 'next/image';

export const CertificateDisplay = ({ xmlData }: { xmlData: string }) => {
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
        const parsedData = parser.parse(xmlData); // Implement your own parseXML function
        console.log(parsedData);
        setCertificateInfo(parsedData);
    }, [xmlData]);

    if (!xmlData) {
        return <div>No certificate data</div>;
    }
    if (!certificateInfo.Certificate) {
        return <div>Loading...</div>;
    }

    return (
        <Card>
            <CardHeader title={certificateInfo.Certificate.name} />
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="h6">Issued By:</Typography>
                        <Typography>{certificateInfo.Certificate.IssuedBy.Organization.name}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="h6">Issued To:</Typography>
                        <Typography>{certificateInfo.Certificate.IssuedTo.Person.name}</Typography>
                        <Image width={100} height={100} src={`data:image/jpeg;base64, ${certificateInfo.Certificate.IssuedTo.Person.Photo._}`} alt="Person's Photo" />
                        <Typography>Claimed Age: {certificateInfo.Certificate.CertificateData?.ZKPROOF?.claimedAge}</Typography>
                    </Grid>
                </Grid>
                <QRCode value={"https://google.com"} />
                <Button variant="contained" color="primary">
                    Share
                </Button>
                <Button variant="contained" color="primary">
                    Download
                </Button>
            </CardContent>
        </Card>
    );
};

export default CertificateDisplay;
