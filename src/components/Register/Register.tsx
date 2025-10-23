import React, { SetStateAction, useState } from "react";
import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, IconButton } from "@chakra-ui/react";
import { MdHttps, MdAlternateEmail, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { UserAuth } from "@/context/AuthContext";
import { useToast } from "@chakra-ui/react";
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
    const toast = useToast()

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
            toast({ status: 'warning', title: 'Consider using a stronger password' })
        }

        if (emailValidationError || !passwordValidation.isValid || confirmError) {
            toast({ status: 'error', title: 'Please fix validation errors' })
            return
        }

        try {
            setIsSubmitting(true)
            setLoading(true)
            await signup(email, password)
            toast({ status: 'success', title: 'Registration successful! Welcome to Nexboard.' })
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
            toast({ status: 'error', title: friendlyError })

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
        <Box className="login-form" as="form">
            <p className="login-heading">Register User</p>

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
                        isInvalid={!!emailError && touched.email}
                    />
                </InputGroup>
            </FormControl>

            <FormControl isRequired mb={2}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Box as={MdHttps} />
                    </InputLeftElement>
                    <Input
                        value={password}
                        onChange={(e) => handlePasswordChange(e.target.value)}
                        onBlur={handlePasswordBlur}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="password"
                        isInvalid={!!passwordError && touched.password}
                    />
                    <InputRightElement>
                        <IconButton aria-label="toggle password visibility" size="sm" variant="ghost" onClick={handleTogglePasswordVisibility} icon={showPassword ? <MdVisibilityOff /> : <MdVisibility />} />
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <PasswordStrengthIndicator password={password} show={touched.password || password.length > 0} />

            <FormControl isRequired mb={2}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup>
                    <InputLeftElement pointerEvents="none">
                        <Box as={MdHttps} />
                    </InputLeftElement>
                    <Input
                        value={confirmPassword}
                        onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                        onBlur={handleConfirmPasswordBlur}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="confirm password"
                        isInvalid={!!confirmPasswordError && touched.confirmPassword}
                    />
                    <InputRightElement>
                        <IconButton aria-label="toggle confirm password visibility" size="sm" variant="ghost" onClick={handleToggleConfirmPasswordVisibility} icon={showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />} />
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme="brand" className="login-button" onClick={handleRegister} isDisabled={isSubmitting}>
                {isSubmitting ? 'Creating account...' : 'Register'}
            </Button>
        </Box>
    );
}
