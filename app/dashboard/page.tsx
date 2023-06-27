"use client"
import LogoutButton from "@/components/LogoutButton";
import { Button, Card, CardActions, CardContent, CardHeader, Collapse, Grid, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Typography } from "@mui/material";
import { startRegistration } from "@simplewebauthn/browser";
import toast from "react-hot-toast";
import { credentailsFromTb } from "./users/service";
import { Suspense } from "react";
import useSWR from 'swr'

export default function Dashboard() {


  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading data...</p>}>
        <GetPasskeys />
      </Suspense>
    </>
  );
}

async function GetPasskeys() {
  const { data: userInfo, error, isLoading } = useSWR<credentailsFromTb>('/api/passkeys', fetcher)
  if (isLoading) return <div>loading...</div>
  if (!userInfo) {
    return <div>Error</div>
  }
  if (!userInfo.passkeyInfo) {
    console.log(userInfo)
    return <div>Error passkeyInfo</div>
  }
  // const userInfo: credentailsFromTb = await userInfoResponse.json();
  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardHeader title="User info" />
            <CardContent>
              <Typography gutterBottom variant="body1" component="div">
                Email:{userInfo.userInfo?.email}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Firstname: {userInfo.userInfo?.firstName}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Lastname: {userInfo.userInfo?.lastName}
              </Typography>
              <Typography gutterBottom variant="body1" component="div">
                Email verified: {userInfo.userInfo?.emailVerified}
              </Typography>
            </CardContent>

          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card variant="outlined">
            <CardHeader title="Passkeys" />
            <CardContent>

              <List

                sx={{ width: '100%' }}
                component="nav"

              >
                {userInfo.passkeyInfo?.map((passkey) => (
                  <ListItemButton>
                    <ListItemText primary={passkey.friendlyName} />
                  </ListItemButton>
                ))
                }
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={registerWebauthn}>Add new passkey</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </>

  )
}
export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  const res = await fetch(input, init)
  return res.json()
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
    console.error(err);
    toast.error(`Registration failed. ${(err as Error).message}`);
  }

}