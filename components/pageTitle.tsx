import React from "react";
import Typography from "@mui/material/Typography";

function PageTitle({ title }: { title: string }) {
  return (
    <Typography component="h1" variant="h4" sx={{ marginBottom: 0 }}>
      {title}
    </Typography>
  );
}

export default PageTitle;
