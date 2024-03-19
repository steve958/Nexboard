import React, { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment } from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { UserAuth } from "@/context/AuthContext";

interface LoginProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>
}

export default function Login(props: LoginProps) {

    const { setLoading } = props

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')

    const { login } = UserAuth()

    const router = useRouter()

    async function handleLogin(e: any) {
        e.preventDefault()

        try {
            setLoading(true)
            await login(email, password)
            toast.success('Login successful', { position: 'top-center' })
            router.push('/dashboard')
            setEmail('')
            setPassword('')
            setLoading(false)
        } catch (e: any) {
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
            }
            }
            noValidate
            autoComplete="off"
        >
            <p className="login-heading">Login User</p>
            <TextField
                id="outlined-basic4"
                variant="outlined"
                onChange={(e) => setEmail(e.target.value)}
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
                id="outlined-basic3"
                variant="outlined"
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="password"
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <HttpsIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button variant="contained" className="login-button" onClick={handleLogin}>
                login
            </Button>
        </Box>
    );
}
