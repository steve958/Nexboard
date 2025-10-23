import React, { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment, CircularProgress, IconButton, Checkbox, FormControlLabel } from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { UserAuth } from "@/context/AuthContext";
import { validateEmail, getEmailError, validatePassword } from "@/utils/validation";
import { getFriendlyAuthError } from "@/utils/authErrors";

interface LoginProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    onForgotPassword: () => void;
}

export default function Login(props: LoginProps) {

    const { setLoading, onForgotPassword } = props

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [emailError, setEmailError] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    const [touched, setTouched] = useState({ email: false, password: false })
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [rememberMe, setRememberMe] = useState<boolean>(false)

    const { login } = UserAuth()

    const router = useRouter()

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleEmailChange = (value: string) => {
        setEmail(value)
        if (touched.email) {
            setEmailError(getEmailError(value))
        }
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value)
        if (touched.password) {
            const validation = validatePassword(value)
            setPasswordError(validation.error)
        }
    }

    const handleEmailBlur = () => {
        setTouched({ ...touched, email: true })
        setEmailError(getEmailError(email))
    }

    const handlePasswordBlur = () => {
        setTouched({ ...touched, password: true })
        const validation = validatePassword(password)
        setPasswordError(validation.error)
    }

    async function handleLogin(e: any) {
        e.preventDefault()

        // Validate before submission
        const emailValidationError = getEmailError(email)
        const passwordValidation = validatePassword(password)

        setEmailError(emailValidationError)
        setPasswordError(passwordValidation.error)
        setTouched({ email: true, password: true })

        if (emailValidationError || !passwordValidation.isValid) {
            toast.error('Please fix validation errors', { position: 'top-center' })
            return
        }

        try {
            setIsSubmitting(true)
            setLoading(true)
            await login(email, password, rememberMe)

            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true')
            } else {
                localStorage.removeItem('rememberMe')
            }

            toast.success('Login successful', { position: 'top-center' })
            router.push('/dashboard')
            setEmail('')
            setPassword('')
            setEmailError('')
            setPasswordError('')
            setLoading(false)
            setIsSubmitting(false)
        } catch (e: any) {
            const friendlyError = getFriendlyAuthError(e)
            toast.error(friendlyError, { position: 'top-center' })

            // Set field-specific errors if applicable
            if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-email') {
                setEmailError('Email not found or invalid')
            } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
                setPasswordError('Incorrect password')
            }

            setLoading(false)
            setIsSubmitting(false)
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
                label="Email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="email@example.com"
                error={!!emailError && touched.email}
                helperText={touched.email ? emailError : ''}
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
                id="outlined-basic3"
                variant="outlined"
                label="Password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={handlePasswordBlur}
                type={showPassword ? "text" : "password"}
                placeholder="password"
                error={!!passwordError && touched.password}
                helperText={touched.password ? passwordError : ''}
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <HttpsIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleTogglePasswordVisibility}
                                edge="end"
                                size="small"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                marginTop: '-8px',
                marginBottom: '8px'
            }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            sx={{
                                color: '#7e755a',
                                '&.Mui-checked': {
                                    color: '#7e755a',
                                },
                            }}
                        />
                    }
                    label="Remember me"
                    sx={{
                        color: '#7e755a',
                        '& .MuiFormControlLabel-label': {
                            fontSize: '14px'
                        }
                    }}
                />
                <Button
                    variant="text"
                    onClick={onForgotPassword}
                    disabled={isSubmitting}
                    sx={{
                        color: '#7e755a',
                        textTransform: 'none',
                        fontSize: '14px',
                        padding: '4px 8px',
                        '&:hover': {
                            backgroundColor: 'rgba(175, 163, 123, 0.1)',
                            textDecoration: 'underline'
                        }
                    }}
                >
                    Forgot Password?
                </Button>
            </Box>
            <Button
                variant="contained"
                className="login-button"
                onClick={handleLogin}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#7e755a' }} /> : null}
            >
                {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
        </Box>
    );
}
