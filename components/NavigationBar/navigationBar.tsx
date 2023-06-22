"use client"

import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Button, Tooltip, Avatar, Container } from "@mui/material";
import { useState, MouseEvent, useEffect } from "react";
import AdbIcon from '@mui/icons-material/Adb';
import MenuIcon from '@mui/icons-material/Menu';
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { DEFAULT_THEME, getOtherTheme } from "@/app/theme";
const pages: {
    id: number;
    friendlyName: string;
    href: string;
}[] = [
        { id: 1, friendlyName: "Dashboard", href: '/dashboard' },
        { id: 2, friendlyName: "Users", href: '/dashboard/users' }
    ];


export default function NavigationBar() {
    const { theme: themeState, setTheme } = useTheme();
    const [themeName, setThemeName] = useState(DEFAULT_THEME);
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const [selectedList, setSelectedList] = useState<number[]>([]);

    const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    useEffect(() => setThemeName(getOtherTheme(themeState)), [themeState]);

    const settings: {
        id: number;
        friendlyName: string;
        onClick: () => Promise<void>;
    }[] = [
            { id: 1, friendlyName: "Logout", onClick: async () => { await signOut(); handleCloseUserMenu() } },
            { id: 2, friendlyName: `Activate ${themeName} Theme`, onClick: async () => { setTheme(getOtherTheme(themeState)); handleCloseUserMenu() } }
        ];

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page.id} component={Link} href={page.href} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page.friendlyName}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page.id}
                                component={Link}
                                href={page.href}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page.friendlyName}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="AC" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
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