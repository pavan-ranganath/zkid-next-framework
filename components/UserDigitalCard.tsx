import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import moment from "moment";
import { UserInterface } from "@/lib/models/user.model";

export function DisplayUserCard({ userInfo }: { userInfo: UserInterface }) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  // Dynamically calculate the screen height
  const screenHeight = window.innerHeight;
  let defaultImageHeight = 0.35;
  // Calculate the image height based on screen height
  if (screenHeight < 600) {
    defaultImageHeight = 0.25;
  }
  const imageHeight = screenHeight * defaultImageHeight;
  return (
    <Box sx={{ ...styles.cardContainer, height: screenHeight - 120 }}>
      <Card sx={{ ...styles.card }} variant="outlined">
        <CardContent sx={{ overflowY: "auto" }}>
          <CardMedia component="img" src={`${userInfo.photo}`} sx={{ height: imageHeight }} title="green iguana" />

          <Typography variant="h4" sx={{ textTransform: "capitalize" }} color="yellow">
            {userInfo.name}
          </Typography>
          <Typography variant="h5" style={styles.spacingBetween} color="red">
            {userInfo.role}
          </Typography>
          <Typography variant="body1" style={styles.spacingBetween}>
            {userInfo.phone}
          </Typography>
          <Typography variant="body1" style={styles.spacingBetween}>
            {userInfo.email}
          </Typography>
          <div style={{ marginTop: "10px" }}>
            <Typography variant="body1" component="div" style={{ textAlign: "justify" }}>
              {userInfo.description}
            </Typography>
          </div>
          <Typography variant="body1" component="div" style={{ textAlign: "justify" }}>
            {userInfo.extra}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

const styles = {
  centeredContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    // perspective: "1000px",
    width: "100%",
    height: "100%",
    // minHeight: '300px',
    margin: "0 auto",
  },
  card: {
    display: "flex",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.5s",
  },
  buttonsContainer: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    "& > button": {
      marginRight: "6px", // Adjust the margin to your preference
    },
  },
  spacingBetween: {
    paddingTop: "5px",
  },
};
