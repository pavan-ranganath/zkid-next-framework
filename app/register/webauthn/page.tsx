"use client";
import { Stack, TextField, Button, Typography, Alert } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { startRegistration } from "@simplewebauthn/browser";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context";

export default function Register() {
    const router = useRouter()
    const registerForm = {
        fName: yup.string().required("First name is required"),
        lName: yup.string().required("Last name is required"),
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
        resolver: yupResolver(yup.object().shape(registerForm)),
    });

    function onSubmit(data: any) {
        registerWebauthn(data.email, data.fName, data.lName, router);
        // fetch("/api/auth/register/webauthn", { method: "POST", body: JSON.stringify(data) }).then(
        //     async (response) => {
        //         console.log(response);
        //         if (response.status === 200) {
        //             toast.success("Registration succesfull");
        //             router.push("/signin");
        //         }
        //         if (response.status === 400) {
        //             let resp = await response.json()
        //             toast.error(resp.error)
        //         }
        //     },
        //     (err) => {
        //         toast.error(err)
        //     }
        // );
    }

    return (
        <>
            <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
                Registration
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 1, sm: 2, md: 4 }}
                    sx={{ marginBottom: 4 }}
                >
                    <TextField
                        id="fName"
                        type="text"
                        variant="outlined"
                        color="primary"
                        label="First Name"
                        fullWidth
                        {...register("fName")}
                        error={touchedFields.fName && errors.fName ? true : false}
                        helperText={touchedFields.fName ? errors.fName?.message : ""}
                    />
                    <TextField
                        type="text"
                        variant="outlined"
                        color="primary"
                        label="Last Name"
                        {...register("lName")}
                        error={touchedFields.lName && Boolean(errors.lName)}
                        helperText={touchedFields.lName ? errors.lName?.message : ""}
                        fullWidth
                    />
                </Stack>
                <TextField
                    type="email"
                    variant="outlined"
                    color="primary"
                    label="Email"
                    {...register("email")}
                    error={touchedFields.email && Boolean(errors.email)}
                    helperText={touchedFields.email ? errors.email?.message : ""}
                    fullWidth
                    sx={{ mb: 4 }}
                />
                <Button variant="contained" color="primary" type="submit">
                    Register
                </Button>
            </form>
            <small>
                Already have an account? <Link href="/signin">Signin Here</Link>
            </small>
        </>
    );
}

async function registerWebauthn(email: string, fName: string, lName: string, router: AppRouterInstance) {
    const url = new URL(
        '/api/auth/register/webauthn',
        window.location.origin,
    );
    url.search = new URLSearchParams({ email: email, fName: fName, lName: lName }).toString();
    const optionsResponse = await fetch(url.toString());
    const opt = await optionsResponse.json();
    if (optionsResponse.status !== 200) {
        console.error(opt);
        toast.error(opt.error);
        return;
    }


    try {
        const credential = await startRegistration(opt)

        const response = await fetch('/api/auth/register/webauthn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credential),
            credentials: 'include'
        });
        if (response.status != 201) {
            toast.error('Could not register webauthn credentials.');
            const errorResp = await response.json();
            console.error(errorResp)
        } else {
            toast.success('Your webauthn credentials have been registered.', { duration: 10000 });
            // router.push('/signin');
        }
    } catch (err) {
        toast.error(`Registration failed. ${(err as Error).message}`);
    }

}