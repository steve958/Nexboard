import React, { SetStateAction, useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { MdAlternateEmail, MdArrowBack } from 'react-icons/md';
import { useToast } from "@chakra-ui/react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { validateEmail, getEmailError } from "@/utils/validation";
import { getFriendlyAuthError } from "@/utils/authErrors";

interface ForgotPasswordProps {
    setLoading: React.Dispatch<SetStateAction<boolean>>;
    onBack: () => void;
}

export default function ForgotPassword(props: ForgotPasswordProps) {
    const { setLoading, onBack } = props;
    const toast = useToast();

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
            toast({ status: 'error', title: 'Please enter a valid email address' });
            return;
        }

        try {
            setIsSubmitting(true);
            setLoading(true);

            const auth = getAuth();
            await sendPasswordResetEmail(auth, email);

            toast({ status: 'success', title: 'Password reset email sent! Check your inbox.' });
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
            toast({ status: 'error', title: friendlyError });

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
        <Box className="login-form" as="form">
            <p className="login-heading">Reset Password</p>
            <p style={{ fontSize: '14px', color: '#7e755a', textAlign: 'center', marginTop: '-10px', marginBottom: '10px' }}>
                Enter your email address and we'll send you a link to reset your password.
            </p>
            <FormControl isRequired mb={2}>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Box as={MdAlternateEmail} />
                    </InputLeftElement>
                    <Input
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        onBlur={handleEmailBlur}
                        placeholder="email@example.com"
                        isInvalid={!!emailError && touched}
                    />
                </InputGroup>
            </FormControl>
            <Button colorScheme="brand" className="login-button" onClick={handleResetPassword} isDisabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
            <Button variant="ghost" onClick={onBack} isDisabled={isSubmitting} leftIcon={<Box as={MdArrowBack} />} color="#7e755a">
                Back to Login
            </Button>
        </Box>
    );
}
