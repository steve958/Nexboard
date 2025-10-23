import React, { SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { Button, InputAdornment, CircularProgress } from "@mui/material";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from "react-toastify";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { validateEmail, getEmailError } from "@/utils/validation";
import { getFriendlyAuthError } from "@/utils/authErrors";

interface ForgotPasswordProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    onBack: () => void;
}

export default function ForgotPassword(props: ForgotPasswordProps) {
    const { setLoading, onBack } = props;

    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [touched, setTouched] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (touched) {
            setEmailError(getEmailError(value));
        }
    };

    const handleEmailBlur = () => {
        setTouched(true);
        setEmailError(getEmailError(email));
    };

    const handleResetPassword = async (e: any) => {
        e.preventDefault();

        // Validate before submission
        const emailValidationError = getEmailError(email);

        setEmailError(emailValidationError);
        setTouched(true);

        if (emailValidationError) {
            toast.error('Please enter a valid email address', { position: 'top-center' });
            return;
        }

        try {
            setIsSubmitting(true);
            setLoading(true);

            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);

            toast.success('Password reset email sent! Check your inbox.', {
                position: 'top-center',
                autoClose: 5000
            });
            setEmail('');
            setEmailError('');
            setTouched(false);
            setLoading(false);
            setIsSubmitting(false);

            // Go back to login after successful email send
            setTimeout(() => {
                onBack();
            }, 2000);
        } catch (e: any) {
            const friendlyError = getFriendlyAuthError(e);
            toast.error(friendlyError, { position: 'top-center' });

            // Set field-specific errors if applicable
            if (e.code === 'auth/user-not-found') {
                setEmailError('No account found with this email');
            } else if (e.code === 'auth/invalid-email') {
                setEmailError('Invalid email address');
            }

            setLoading(false);
            setIsSubmitting(false);
        }
    };

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
            <p className="login-heading">Reset Password</p>
            <p style={{
                fontSize: '14px',
                color: '#7e755a',
                textAlign: 'center',
                marginTop: '-10px',
                marginBottom: '10px'
            }}>
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <TextField
                id="outlined-reset-email"
                variant="outlined"
                label="Email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="email@example.com"
                error={!!emailError && touched}
                helperText={touched ? emailError : ''}
                required
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <AlternateEmailIcon />
                        </InputAdornment>
                    ),
                }}
            />
            <Button
                variant="contained"
                className="login-button"
                onClick={handleResetPassword}
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: '#7e755a' }} /> : null}
            >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button
                variant="text"
                onClick={onBack}
                disabled={isSubmitting}
                startIcon={<ArrowBackIcon />}
                sx={{
                    color: '#7e755a',
                    textTransform: 'none',
                    '&:hover': {
                        backgroundColor: 'rgba(175, 163, 123, 0.1)'
                    }
                }}
            >
                Back to Login
            </Button>
        </Box>
    );
}
