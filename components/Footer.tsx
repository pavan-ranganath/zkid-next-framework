import React from "react";
import { Box, Typography, Link, Container } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        position: "fixed", // or 'absolute' depending on your layout requirements
        bottom: 0,
        width: "100%",
        backgroundColor: "#f8f8f8", // Adjust the background color as needed
        padding: 2,
      }}
    >
      <Container>
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Entrada Solutions
        </Typography>
        <Typography variant="body2" align="center" sx={{ marginTop: 1 }}>
          Contact: John Doe
          <br />
          Phone: +1 (123) 456-7890
          <br />
          Email: john.doe@example.com
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
