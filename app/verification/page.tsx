"use client";

import { styled } from "@mui/material/styles"; // Importing the 'styled' function from MUI for custom styling
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Importing the check circle icon from MUI icons
import ErrorIcon from "@mui/icons-material/Error"; // Importing the error icon from MUI icons
import useSWR from "swr"; // Importing the 'useSWR' hook from the SWR library for data fetching and caching

// MUI imports

import { fetcher } from "@/lib/services/apiService";
import { Typography, Button } from "@mui/material";
import { Container } from "@mui/system";

// Styling the container using the 'styled' function from MUI
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

// Styling the success message using the 'styled' function from MUI
const SuccessMessage = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.success.main,
}));

// Styling the error message using the 'styled' function from MUI
const ErrorMessage = styled(Typography)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.error.main,
}));

/**
 * Email Verification Success Page Component
 * @param {object} props - Component props
 * @param {object} props.params - Object containing the slug parameter
 * @param {object} [props.searchParams] - Object containing search parameters
 * @returns {JSX.Element} - JSX element representing the email verification success page
 */
const EmailVerificationSuccessPage = ({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const token = searchParams?.token as string;

  // Fetching email verification status using the useSWR hook
  const { data: emailVerified, error, isLoading } = useSWR<any>(`/api/auth/emailverifier?token=${token}`, fetcher);

  // Display loading message while fetching data
  if (isLoading) return <div>loading...</div>;

  // Handling success case
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

  // Handling error case
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
