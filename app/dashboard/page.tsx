"use client";

import { DisplayUserCard } from "@/components/UserDigitalCard";
import PageTitle from "@/components/pageTitle";
import { UserInterface } from "@/lib/models/user.model";
import { fetcher } from "@/lib/utils";
import { Grid } from "@mui/material";
import useSWR from "swr";
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Import the CSS


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
      <Carousel
        showArrows={true}
        showStatus={false}
        showIndicators={false}
        showThumbs={false}
        infiniteLoop={true}
        selectedItem={0}
        emulateTouch={true}
      >
        {users.users.map((user, index) => (
          <div key={index}>
            <DisplayUserCard userInfo={user} />
          </div>
        ))}
      </Carousel>
    </>
  );
}
