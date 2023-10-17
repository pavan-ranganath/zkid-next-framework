import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';

const AlertMessageDialog = forwardRef((props, ref) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');

    const handleAlertOpen = (message: React.SetStateAction<string>, severity: React.SetStateAction<string>) => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
    };

    const mapSeverityToIcon = (severity: string) => {
        switch (severity) {
            case 'success':
                return <CheckCircleOutlineIcon fontSize="large" style={{ color: 'green' }} />;
            case 'error':
                return <ErrorOutlineIcon fontSize="large" style={{ color: 'red' }} />;
            case 'warning':
                return <WarningIcon fontSize="large" style={{ color: 'orange' }} />;
            case 'info':
                return <InfoIcon fontSize="large" style={{ color: 'blue' }} />;
            default:
                return null; // Default to no icon for unrecognized severity
        }
    };

    useImperativeHandle(ref, () => ({
        handleAlertOpen: (message: any, severity: any) => {
            handleAlertOpen(message, severity);
        },
    }));
    const mapSeverityToText = (severity: string) => {
        switch (severity) {
            case 'success':
                return 'Success';
            case 'error':
                return 'Error';
            case 'warning':
                return 'Warning';
            case 'info':
                return 'Info';
            default:
                return ''; // Default to an empty string for unrecognized severity
        }
    };

    return (
        <Dialog open={dialogOpen} onClose={handleClose}>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    {mapSeverityToIcon(alertSeverity)}
                    <Box marginLeft={1}>
                        {mapSeverityToText(alertSeverity)}
                    </Box>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Typography>{alertMessage}</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
});

export default AlertMessageDialog;
