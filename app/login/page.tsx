"use client";
import "./login.css";
import * as yup from "yup";
import { useForm } from "react-hook-form";

import {
  Alert,
  AlertTitle,
  Button,
  Container,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Input,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
export default function Login() {
  
  const loginForm = {
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
    resolver: yupResolver(yup.object().shape(loginForm)),
  });
  const onSubmit = async (data: { email: string; password: string }) => {
    // const result = await signIn("credentials", {...data,redirect:false});
    // if(result) {
    //   console.log("login success", result);
    // }
    signIn("credentials", {...data,redirect:false})
    .then((callback)=>{
      if(callback?.error) {
        toast.error(callback.error,{duration:10000})
      }
      if(callback?.ok && !callback?.error) {
        toast.success("Login success");
        control._reset()
      }
    }).catch((err)=>{
      console.error(err);
      toast.error("Something went wrong");
    })
  };

  const {data: session, status} = useSession();
  if(status === 'loading') {
    return <p>Loading...</p>
  }
  if(status === 'authenticated') {
    // toast("Already user session exists")
    return <Button variant="contained" color="success" onClick={()=>signOut()} >
    Logout
  </Button>
  }
  return (
    <>
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Login
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
        <TextField
          label="Password"
          {...register("password")}
          variant="outlined"
          color="primary"
          type="password"
          error={
            touchedFields.password && errors.password ? true : false
          }
          helperText={touchedFields.password ? errors.password?.message : ""}
          fullWidth
          sx={{ mb: 3 }}
        />
        <Button variant="contained" color="primary" type="submit">
          Login
        </Button>
      </form>
      <small>
        Do not have an account? <Link href="/register">Register Here</Link>
      </small>
    </>
  );
}
