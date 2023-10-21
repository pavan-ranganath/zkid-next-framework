import React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import toast from "react-hot-toast";

export default function ShareButton({ url, style }: { url: string; style?: React.CSSProperties }) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = () => {
    // Copy the URL to the clipboard
    navigator.clipboard.writeText(url);
    toast.success("Link copied!!");
    handleClose();
  };

  const handleMessage = () => {
    // Open the messages app with the URL as a message
    window.open(`sms:?&body=${encodeURIComponent(url)}`);

    handleClose();
  };

  const handleMail = () => {
    // Compose an email with the URL as the body
    window.location.href = `mailto:?subject=&body=${encodeURIComponent(url)}`;
    handleClose();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleClick} style={style}>
        Share
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
        <MenuItem onClick={handleMessage}>Message</MenuItem>
        <MenuItem onClick={handleMail}>Mail</MenuItem>
      </Menu>
    </div>
  );
}
