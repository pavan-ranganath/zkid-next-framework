"use client";

// Importing components from the Material-UI library
import {
  AppBar, // Represents the top app bar component
  Toolbar, // Contains the content of the app bar
  Typography, // Used for displaying text
  Box, // A container component
  IconButton, // A button component with an icon
  Menu, // Represents a dropdown menu
  MenuItem, // Represents an item within a dropdown menu
  Button, // A button component
  Tooltip, // Displays a tooltip when hovering over an element
  Avatar, // Displays an avatar or profile picture
  Container, // A container component for layout purposes
} from "@mui/material";

import { useState, MouseEvent, useEffect } from "react"; // Importing React hooks for state management and side effects

import AdbIcon from "@mui/icons-material/Adb"; // Importing an icon component from Material-UI
import MenuIcon from "@mui/icons-material/Menu"; // Importing a menu icon component from Material-UI

import Link from "next/link"; // Importing the Link component from Next.js for client-side navigation

import { signOut } from "next-auth/react"; // Importing the signOut function from the next-auth/react package for user sign out

import { useTheme } from "next-themes"; // Importing the useTheme hook from the next-themes package for theme management

import { DEFAULT_THEME, getOtherTheme } from "@/app/theme"; // Importing custom theme-related functions from the "@/app/theme" module

// An array of page objects containing page information
const pages: {
  id: number;
  friendlyName: string;
  href: string;
}[] = [
  { id: 1, friendlyName: "Dashboard", href: "/dashboard" },
  { id: 2, friendlyName: "Users", href: "/dashboard/users" },
];

export default function NavigationBar() {
  const { theme: themeState, setTheme } = useTheme(); // Using the useTheme hook to access the current theme and set the theme
  const [themeName, setThemeName] = useState(DEFAULT_THEME); // State variable to store the name of the current theme
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null); // State variable for the anchor element of the navigation menu
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null); // State variable for the anchor element of the user menu
  const [selectedList, setSelectedList] = useState<number[]>([]); // State variable for the selected list items

  // Event handler for opening the navigation menu
  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  // Event handler for opening the user menu
  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Event handler for closing the navigation menu
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  // Event handler for closing the user menu
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Side effect for updating the theme name when the theme changes
  useEffect(() => setThemeName(getOtherTheme(themeState)), [themeState]);

  // An array of settings objects containing setting information
  const settings: {
    id: number;
    friendlyName: string;
    onClick: () => Promise<void>;
  }[] = [
    {
      id: 1,
      friendlyName: "Logout",
      onClick: async () => {
        await signOut({ callbackUrl: "/signin" }); // Calling the signOut function to sign the user out and redirect to the sign-in page
        handleCloseUserMenu();
      },
    },
    {
      id: 2,
      friendlyName: `Activate ${themeName} Theme`,
      onClick: async () => {
        setTheme(getOtherTheme(themeState)); // Calling the setTheme function to switch to the other theme (light/dark)
        handleCloseUserMenu();
      },
    },
  ];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <Link href="/dashboard">
            <Box component="img" sx={{ height: 54 }} alt="Logo" src={"EGS_logo_final.svg"} />
          </Link>

          {/* Navigation Menu (for small screens) */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {/* Pages */}
              {pages.map((page) => (
                <MenuItem key={page.id} component={Link} href={page.href} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page.friendlyName}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* AdbIcon (for small screens) */}
          <AdbIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />

          {/* Navigation Buttons (for medium and large screens) */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button key={page.id} component={Link} href={page.href} sx={{ my: 2, color: "white", display: "block" }}>
                {page.friendlyName}
              </Button>
            ))}
          </Box>

          {/* User Avatar and Settings */}
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="AC" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* User Settings */}
              {settings.map((setting) => (
                <MenuItem key={setting.id} onClick={setting.onClick}>
                  <Typography textAlign="center">{setting.friendlyName}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
