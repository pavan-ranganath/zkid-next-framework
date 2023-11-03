import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import moment from "moment";
import { UserInterface } from "@/lib/models/user.model";


export function DisplayUserCard({ userInfo }: { userInfo: UserInterface }) {

  return (
    <Box sx={styles.cardContainer}>
      <Card sx={{ ...styles.card }} variant="outlined">
        <CardContent sx={styles.centeredContent}>
          <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
            {userInfo.name}
          </Typography>
          <Grid container spacing={2} style={styles.spacingBetween}>
            <Grid item xs={4} sx={styles.centeredContent}>
              <Image src={`${userInfo.photo}`} alt="Person's Photo" width={100} height={100} />
            </Grid>
            <Grid item xs={8} sx={{ ...styles.centeredContent, alignItems: "start" }}>
              <Typography variant="body1">{userInfo.phone}</Typography>
              <Typography variant="body1">{userInfo.email}</Typography>
              <Typography variant="body1">{userInfo.role}</Typography>
            </Grid>
          </Grid>
          <Typography variant="body1" component="div" style={{ textAlign: "justify", marginTop: '10px' }}>{userInfo.description}</Typography>
          <Typography variant="body1" component="div" style={{ textAlign: "justify" }}>{userInfo.extra}</Typography>
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
    perspective: "1000px",
    width: "100%",
    // minHeight: '300px',
    margin: "0 auto",
  },
  card: {
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
