"use client";

import { Button, Container, Typography } from "@mui/material";
import { styled } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import useSWR from "swr";
import { fetcher } from "../dashboard/page";

const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SuccessMessage = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.success.main,
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.error.main,
}));

const EmailVerificationSuccessPage = ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const token = searchParams?.token as string;

  // Fetching passkeys using the useSWR hook
  const { data: emailVerified, error, isLoading } = useSWR<any>(`/api/auth/emailverifier?token=${token}`, fetcher);

  // Display loading message while fetching data
  if (isLoading) return <div>loading...</div>;

  // Handling error case
  if (emailVerified) {
    return (
      <StyledContainer maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          Email Verification Status
        </Typography>
        <SuccessMessage variant="body1" align="center">
          <CheckCircleIcon fontSize="large" sx={{ marginRight: "0.5rem" }} />
          Congratulations! Your email has been successfully verified.
        </SuccessMessage>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Button variant="contained" component="a" href="/signin">
            Go Home
          </Button>
        </div>
      </StyledContainer>
    );
  }
  if (error) {
    return (
      <StyledContainer maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          Email Verification Status
        </Typography>
        <ErrorMessage variant="body1" align="center">
          <ErrorIcon fontSize="large" sx={{ marginRight: "0.5rem" }} />
          Oops! Email verification failed. Please try again.
        </ErrorMessage>
      </StyledContainer>
    );
  }
};

export default EmailVerificationSuccessPage;
