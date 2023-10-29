import { AadhaarXmlParser } from "@/lib/services/aadhaarService";
import { fetcher } from "@/lib/services/apiService";
import { credentailsFromTb } from "@/lib/services/userService";
import { Card, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useConfirm } from "material-ui-confirm";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import useSWR from "swr";
import Image from "next/image";
import moment from "moment";
import { epochToDate } from "@/lib/services/utils";

export const ZKidDigitalCardDisplay = () => {
  const {
    data: userInfoResp,
    error: errorUserInfo,
    isLoading: userInfoIsLoading,
  } = useSWR<{ data: credentailsFromTb; error: string }>("/api/passkeys", fetcher, {
    suspense: true,
    // revalidateOnFocus: false,
    // revalidateOnReconnect: false,
    // revalidateOnMount: false,
    // revalidateIfStale: false,
    // shouldRetryOnError: false,
  });
  if (!userInfoResp) {
    return <>Error</>;
  }
  const { data: userInfo, error } = userInfoResp;

  return (
    <>
      {/* Showing a loading message while fetching data */}
      <Suspense fallback={<p>Loading data...</p>}>
        <DisplayUserCard data={userInfo} error={error} isLoading={userInfoIsLoading} warningDisplay={error} />
      </Suspense>
    </>
  );
};
function DisplayUserCard({
  data: userInfo,
  error,
  isLoading,
  warningDisplay,
}: {
  data: credentailsFromTb;
  error: any;
  isLoading: any;
  warningDisplay: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  // Display loading message while fetching data
  if (isLoading) return <div>loading...</div>;

  // Handling error case
  if (!userInfo) {
    return <div>No data</div>;
  }

  // Handling error case for passkeyInfo
  if (!userInfo.passkeyInfo) {
    console.log(userInfo);
    return <div>Error passkeyInfo</div>;
  }
  if (!userInfo.aadhaar) {
    console.log(userInfo);
    return <div>Error aadhaar</div>;
  }

  return (
    <Box sx={styles.cardContainer}>
      <Card sx={{ ...styles.card }}>
        <CardContent sx={styles.centeredContent}>
          <Typography variant="h5" sx={{ textTransform: "capitalize" }}>
            nZKid Digital Identity
          </Typography>
          <Typography>Issued By: Entrada Global Solutions</Typography>
          <Grid container spacing={2} style={styles.spacingBetween}>
            <Grid item xs={4} sx={styles.centeredContent}>
              <Image src={`data:image/jpeg;base64, ${userInfo.photo}`} alt="Person's Photo" width={100} height={100} />
            </Grid>
            <Grid item xs={8} sx={{ ...styles.centeredContent, alignItems: "start" }}>
              <Typography variant="h6">{userInfo.userInfo?.fullName.value}</Typography>
              <Typography variant="body1">
                {userInfo.userInfo?.dob.value
                  ? moment(epochToDate(userInfo.userInfo?.dob.value.toString())).format("DD, MMM, YYYY")
                  : ""}
              </Typography>
              <Typography variant="body1">{userInfo.userInfo?.mobile.value}</Typography>
              <Typography variant="body1">{userInfo.userInfo?.email.value}</Typography>
            </Grid>
          </Grid>
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
