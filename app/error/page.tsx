"use client";
import React from 'react';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { ThemeProvider } from '@mui/material/styles';
import { useSearchParams } from 'next/navigation';
import { Typography } from '@mui/material';
import { Container } from '@mui/system';

const AccessDenied = () => {
    const searchParams = useSearchParams();
    let message = searchParams.get("error");
    return (
        // <div>
        //     <h2>Error:</h2>
        //     <h3>{message}</h3>
        //     <Link href="/dashboard/profile">
        //         <Button variant="contained" color="primary">
        //             Go To Profile
        //         </Button>
        //     </Link>
        // </div>
        <Container
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Typography variant="h4" gutterBottom>
                Oops!
            </Typography>
            <Typography variant="h5" gutterBottom>
                {message
                    ? `An error occurred: ${message}`
                    : 'An error occurred on the client'}
            </Typography>
            <Link href="/dashboard/profile">
                <Button variant="contained" color="primary" sx={{ mt: 3 }}>
                    Go to profile
                </Button>
            </Link>
        </Container>
    );
};

export default AccessDenied;
