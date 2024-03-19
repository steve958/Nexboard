import React, { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment } from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { UserAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

interface RegisterProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>
}

export default function Register(props: RegisterProps) {

    const { setLoading } = props

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')


    const { signup } = UserAuth()

    async function handleRegister(e: any) {
        e.preventDefault()
        try {
            setLoading(true)
            await signup(email, password)
            toast.success('Registration successful', { position: 'top-center' })
            setEmail('')
            setPassword('')
            setLoading(false)
        } catch (e: any) {
            setEmail('')
            setPassword('')
            toast.error(e.message, { position: 'top-center' })
            setLoading(false)
        }
    }

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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                required
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
                required
                type="text"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <HttpsIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button variant="contained" className="login-button" onClick={handleRegister}>
                register
            </Button>
        </Box>
    );
}
