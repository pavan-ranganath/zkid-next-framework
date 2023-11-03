"use client";

import { DisplayUserCard } from "@/components/UserDigitalCard";
import PageTitle from "@/components/pageTitle";
import { UserInterface } from "@/lib/models/user.model";
import { fetcher } from "@/lib/utils";
import { Grid } from "@mui/material";
import useSWR from "swr";


// Dashboard component
export default function Dashboard() {
  // get user data from the server
  const {
    data: users,
    error: error,
    isLoading: isLoading,
  } = useSWR<{ users: UserInterface[] }>("/api/users", fetcher, {
    // suspense: true,
  });
  if (isLoading) return <div>loading...</div>;
  if (error) return <div>failed to load</div>;
  if (!users) return <div>No users...</div>;
  if (!users.users) return <div>No users found</div>
  console.log("users", users);
  return (
    <>
      <PageTitle title="Home" />
      <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {users.users.map((user, index) => (
          <Grid item xs={12} md={6} sm={6} key={index}>
            <DisplayUserCard userInfo={user} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
