import { pki } from 'node-forge';
import React, { useState } from 'react';
import { AgeVerificatingCertificate } from '../lib/interfaces/Certificate.interface';
import { ConfirmOptions, useConfirm } from 'material-ui-confirm';
import { Backdrop, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Fade, Modal, Typography } from '@mui/material';
import moment from 'moment';

function DigitalSignatureTag({ certificate, ageVerificationXMLCertificate }: { certificate: pki.Certificate, ageVerificationXMLCertificate: AgeVerificatingCertificate }) {
    const organizationName = certificate.subject.getField('O').value || 'Unknown Organization';
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    // display ageVerificationXMLCertificate signed info and digest info
    const signingCert = ageVerificationXMLCertificate.Certificate['ds:Signature']['ds:Object']['xades:QualifyingProperties']['xades:SignedProperties']['xades:SignedSignatureProperties']['xades:SigningCertificate']['xades:Cert']['xades:IssuerSerial']
    return (
        <div style={{ border: '1px solid', padding: '10px', borderRadius: '5px' }}>
            <Typography variant='body2'>Digitally signed by</Typography>
            <Typography variant='body1'> {organizationName} </Typography>
            <Typography variant='body1'> Date: {moment(ageVerificationXMLCertificate.Certificate.issueDate).format('DD, MMM, YYYY')}</Typography>
            {/* more info button */}
            <Button variant='text' fullWidth size='small' onClick={handleOpen}>More info</Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="certificate-dialog">
                <DialogTitle id="certificate-dialog">Certificate Details</DialogTitle>
                <DialogContent>

                    <Box mb={2}>
                        <Typography variant="h6" gutterBottom>
                            Signature
                        </Typography>
                        <Typography variant="body1">
                            <strong>Signature algorithm:</strong>
                        </Typography>
                        <Typography variant="body2">
                            {ageVerificationXMLCertificate.Certificate['ds:Signature']['ds:SignedInfo']['ds:SignatureMethod'].Algorithm}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Signature Value:</strong>
                        </Typography>
                        <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                            {ageVerificationXMLCertificate.Certificate['ds:Signature']['ds:SignatureValue']}
                        </Typography>
                    </Box>

                    <Divider variant="middle" />

                    <Box mt={2}>
                        <Typography variant="h6" gutterBottom>
                            Digest
                        </Typography>
                        <Typography variant="body1">
                            <strong>Digest algorithm:</strong>
                        </Typography>
                        <Typography variant="body2">
                            {ageVerificationXMLCertificate.Certificate['ds:Signature']['ds:SignedInfo']['ds:Reference'][0]['ds:DigestMethod'].Algorithm}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Digest Value:</strong>
                        </Typography>
                        <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                            {ageVerificationXMLCertificate.Certificate['ds:Signature']['ds:SignedInfo']['ds:Reference'][0]['ds:DigestValue']}
                        </Typography>
                    </Box>

                    <Divider variant="middle" />

                    <Box mt={2}>
                        <Typography variant="h6" gutterBottom>
                            Signed Certificate
                        </Typography>
                        <Typography variant="body1">
                            <strong>Issuer name:</strong>
                        </Typography>
                        <Typography variant="body2">
                            {signingCert['ds:X509IssuerName']}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Serial no.:</strong>
                        </Typography>
                        <Typography variant="body2" style={{ wordBreak: 'break-all' }}>
                            {BigInt(signingCert['ds:X509SerialNumber'] as bigint).toString()}
                        </Typography>
                    </Box>


                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DigitalSignatureTag;
