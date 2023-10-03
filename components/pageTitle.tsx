import React from "react";
import Typography from "@mui/material/Typography";

function PageTitle({ title }: { title: string }) {
  return (
    <Typography variant="h4" component="h1" gutterBottom>
      {title}
    </Typography>
  );
}

export default PageTitle;
