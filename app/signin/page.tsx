"use client"
import { yupResolver } from '@hookform/resolvers/yup';
import { Backdrop, Button, CircularProgress } from '@mui/material';
import { Typography, TextField } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/typescript-types';
import { startAuthentication } from '@simplewebauthn/browser';
import { RedirectType } from 'next/dist/client/components/redirect';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInComponent() {
    const { data: session, status } = useSession();
    const authorized = status === "authenticated";
    const unAuthorized = status === "unauthenticated";
    const loading = status === "loading";
    const signInForm = {
        email: yup
            .string()
            .required("Email is required")
            .email("Invalid email format")
    };

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, touchedFields },
    } = useForm({
        resolver: yupResolver(yup.object().shape(signInForm)),
    });

    const onSubmit = async (data: { email: string }) => {
        // signIn("webauthn", { ...data, redirect: false, callbackUrl: "/signin" })
        //     .then((callback) => {
        //         if (callback?.error) {
        //             toast.error(callback.error, { duration: 10000 })
        //         }
        //         if (callback?.ok && !callback?.error) {
        //             toast.success("Login success");
        //             control._reset()
        //         }
        //     }).catch((err) => {
        //         console.error(err);
        //         toast.error("Something went wrong");
        //     })
        console.log(data);
        const t = await signInWithWebauthn(data.email);
        console.log(t);
    };
    useEffect(() => {
        // check if the session is loading or the router is not ready
        if (loading) return;
        // if the user is  authorized, redirect to the dashboard page
        if (authorized) {
            redirect("/dashboard", RedirectType.push);
        }
    }, [loading, unAuthorized, status]);
    // if the user refreshed the page or somehow navigated to the protected page
    if (loading) {
        return <>
            <Backdrop
                open={true}
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </>;
    }
    toast.dismiss()
    return (
        <>
            <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
                Sign In
            </Typography>
            <form autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    label="Email"
                    {...register("email")}
                    variant="outlined"
                    color="primary"
                    sx={{ mb: 3 }}
                    fullWidth
                    error={touchedFields.email && errors.email ? true : false}
                    helperText={touchedFields.email ? errors.email?.message : ""}
                />

                <Button variant="contained" color="primary" type="submit">
                    Sign In
                </Button>
            </form>
        </>
    )
}
async function signInWithWebauthn(email: any) {
    const url = new URL(
        '/api/auth/authenticate',
        window.location.origin,
    );
    url.search = new URLSearchParams({ email: email }).toString();
    const optionsResponse = await fetch(url.toString());

    if (optionsResponse.status !== 200) {
        throw new Error('Could not get authentication options from server');
    }
    const opt: PublicKeyCredentialRequestOptionsJSON = await optionsResponse.json();

    if (!opt.allowCredentials || opt.allowCredentials.length === 0) {
        toast.error('There is no registered credential.')
        throw new Error('There is no registered credential.')
    }

    const credential = await startAuthentication(opt);

    await signIn('webauthn', {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type,
        clientDataJSON: credential.response.clientDataJSON,
        authenticatorData: credential.response.authenticatorData,
        signature: credential.response.signature,
        userHandle: credential.response.userHandle,
        callbackUrl: "/dashboard/users"
    })

}