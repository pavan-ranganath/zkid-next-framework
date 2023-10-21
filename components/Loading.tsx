import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Backdrop } from "@mui/material";

const fullscreenLoader: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column", // Stack elements vertically
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1500, // Set an appropriate value
};

const backdropStyle: React.CSSProperties = {
  zIndex: 1400, // Set an appropriate value
};

const LoadingSpinner = ({ message }: { message: string }) => {
  return (
    <Backdrop open style={backdropStyle}>
      <div style={fullscreenLoader}>
        <CircularProgress color="primary" />
        {message && (
          <Typography color="white" variant="h6">
            {message}
          </Typography>
        )}
      </div>
    </Backdrop>
  );
};

export default LoadingSpinner;
