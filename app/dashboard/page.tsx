"use client"
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@mui/material";
import { startRegistration } from "@simplewebauthn/browser";
import toast from "react-hot-toast";

export default function Dashboard() {
  return (
    <>
      <Button onClick={registerWebauthn}>
        Add new passkey
      </Button>

    </>
  );
}

async function registerWebauthn() {
  const url = new URL(
    '/api/auth/register/webauthn',
    window.location.origin,
  );
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
      method: 'PUT',
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