"use client";
import "./login.css";
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
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setEmailError(false);
    setPasswordError(false);

    if (email == "") {
      setEmailError(true);
    }
    if (password == "") {
      setPasswordError(true);
    }

    if (email && password) {
      console.log(email, password);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Login
      </Typography>
      <form autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          variant="outlined"
          color="primary"
          type="email"
          sx={{ mb: 3 }}
          fullWidth
          value={email}
          error={emailError}
        />
        <TextField
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
          variant="outlined"
          color="primary"
          type="password"
          value={password}
          error={passwordError}
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
