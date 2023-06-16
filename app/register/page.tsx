"use client";
import { Stack, TextField, Button, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    console.log(firstName, lastName, email, password);
    addUserToServer();
  }
  function addUserToServer() {
    // Add user to the database using a POST request
    const d = {
      fName : firstName,
      lName: lastName,
      email: email,
      password: password
    }
    fetch("/api/user",{method:"POST",body:JSON.stringify(d)}).then((r)=>{
      r.json()
    },(err)=>{
      console.error(err);
    });
  }
  return (
    <>
      <Typography component="h1" variant="h5" sx={{ marginBottom: 2 }}>
        Registration
      </Typography>
      <form onSubmit={handleSubmit}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2, md: 4 }}
          sx={{ marginBottom: 4 }}
        >
          <TextField
            type="text"
            variant="outlined"
            color="primary"
            label="First Name"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
            fullWidth
            required
          />
          <TextField
            type="text"
            variant="outlined"
            color="primary"
            label="Last Name"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
            fullWidth
            required
          />
        </Stack>
        <TextField
          type="email"
          variant="outlined"
          color="primary"
          label="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          fullWidth
          required
          sx={{ mb: 4 }}
        />
        <TextField
          type="password"
          variant="filled"
          color="primary"
          label="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
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
