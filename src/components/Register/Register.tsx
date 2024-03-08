import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment } from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

export default function Register() {
    return (
        <Box
            className="login-form"
            component="form"
            sx={{
                "& > :not(style)": {
                    m: 1, width: "100%", display: "flex"
                },
            }}
            noValidate
            autoComplete="off"
        >
            <p className="login-heading">Register User</p>
            <TextField
                id="outlined-basic1"
                variant="outlined"
                placeholder="email"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <AlternateEmailIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <TextField
                id="outlined-basic2"
                variant="outlined"
                type="text"
                placeholder="password"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <HttpsIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button variant="contained" className="login-button">
                register
            </Button>
        </Box>
    );
}
