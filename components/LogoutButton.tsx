"use client";

import Button from "@mui/material/Button";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  return (
    <Button variant="contained" color="success" onClick={() => signOut({ callbackUrl: "/login" })}>
      Logout
    </Button>
  );
};

export default LogoutButton;
