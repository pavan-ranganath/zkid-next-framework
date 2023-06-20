"use client";
import { Stack, TextField, Button, Typography, Alert } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const registerForm = {
    fName: yup.string().required("First name is required"),
    lName: yup.string().required("Last name is required"),
    email: yup
      .string()
      .required("Email is required")
      .email("Invalid email format"),
    password: yup
      .string()
      .required("Password is required")
      .min(6, "Minimum 6 characters"),
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
    fetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }).then(
      (response) => {
        if (response.status === 200) {
          router.push("/login");
        }
      },
      (err) => {
        console.error(err);
      }
    );
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
        <TextField
          type="password"
          variant="filled"
          color="primary"
          label="Password"
          {...register("password")}
          error={touchedFields.password && Boolean(errors.password)}
          helperText={touchedFields.password ? errors.password?.message : ""}
          fullWidth
          sx={{ mb: 4 }}
        />
        <Button variant="contained" color="primary" type="submit">
          Register
        </Button>
      </form>
      <small>
        Already have an account? <Link href="/login">Login Here</Link>
      </small>
    </>
  );
}
