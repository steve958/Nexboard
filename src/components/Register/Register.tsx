import React, { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment, CircularProgress, IconButton } from "@mui/material";
import HttpsIcon from '@mui/icons-material/Https';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { UserAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { validateEmail, getEmailError, validatePassword, getPasswordStrength } from "@/utils/validation";
import PasswordStrengthIndicator from "../PasswordStrengthIndicator/PasswordStrengthIndicator";
import { getFriendlyAuthError } from "@/utils/authErrors";

interface RegisterProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>
}

export default function Register(props: RegisterProps) {

    const { setLoading } = props

    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [emailError, setEmailError] = useState<string>('')
    const [passwordError, setPasswordError] = useState<string>('')
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>('')
    const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false })
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)

    const { signup } = UserAuth()

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword)
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
        // Check if confirm password needs to be revalidated
        if (touched.confirmPassword && confirmPassword) {
            setConfirmPasswordError(value !== confirmPassword ? 'Passwords do not match' : '')
        }
    }

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value)
        if (touched.confirmPassword) {
            setConfirmPasswordError(value !== password ? 'Passwords do not match' : '')
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

    const handleConfirmPasswordBlur = () => {
        setTouched({ ...touched, confirmPassword: true })
        setConfirmPasswordError(confirmPassword !== password ? 'Passwords do not match' : '')
    }

    async function handleRegister(e: any) {
        e.preventDefault()

        // Validate before submission
        const emailValidationError = getEmailError(email)
        const passwordValidation = validatePassword(password)
        const confirmError = confirmPassword !== password ? 'Passwords do not match' : ''

        setEmailError(emailValidationError)
        setPasswordError(passwordValidation.error)
        setConfirmPasswordError(confirmError)
        setTouched({ email: true, password: true, confirmPassword: true })

        // Check password strength for registration
        const strength = getPasswordStrength(password)
        if (strength === 'weak' && password.length >= 8) {
            toast.warning('Consider using a stronger password', { position: 'top-center' })
        }

        if (emailValidationError || !passwordValidation.isValid || confirmError) {
            toast.error('Please fix validation errors', { position: 'top-center' })
            return
        }

        try {
            setIsSubmitting(true)
            setLoading(true)
            await signup(email, password)
            toast.success('Registration successful! Welcome to Nexboard.', { position: 'top-center' })
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setEmailError('')
            setPasswordError('')
            setConfirmPasswordError('')
            setLoading(false)
            setIsSubmitting(false)
        } catch (e: any) {
            const friendlyError = getFriendlyAuthError(e)
            toast.error(friendlyError, { position: 'top-center' })

            // Set field-specific errors if applicable
            if (e.code === 'auth/email-already-in-use') {
                setEmailError('This email is already registered')
            } else if (e.code === 'auth/invalid-email') {
                setEmailError('Invalid email address')
            } else if (e.code === 'auth/weak-password') {
                setPasswordError('Password is too weak')
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
            }}
            noValidate
            autoComplete="off"
        >
            <p className="login-heading">Register User</p>
            <TextField
                id="outlined-basic1"
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
                id="outlined-basic2"
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
            <PasswordStrengthIndicator password={password} show={touched.password || password.length > 0} />
            <TextField
                id="outlined-basic-confirm"
                variant="outlined"
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                onBlur={handleConfirmPasswordBlur}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="confirm password"
                error={!!confirmPasswordError && touched.confirmPassword}
                helperText={touched.confirmPassword ? confirmPasswordError : ''}
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
                                aria-label="toggle confirm password visibility"
                                onClick={handleToggleConfirmPasswordVisibility}
                                edge="end"
                                size="small"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
            <Button
                variant="contained"
                className="login-button"
                onClick={handleRegister}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#7e755a' }} /> : null}
            >
                {isSubmitting ? 'Creating account...' : 'Register'}
            </Button>
        </Box>
    );
}
