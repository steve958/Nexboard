import React, { SetStateAction, useState } from "react";
import { Box, Button, Checkbox, FormControl, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { MdHttps, MdAlternateEmail, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
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
    const toast = useToast()

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
            toast({ status: 'error', title: 'Please fix validation errors' })
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

            toast({ status: 'success', title: 'Login successful' })
            router.push('/dashboard')
            setEmail('')
            setPassword('')
            setEmailError('')
            setPasswordError('')
            setLoading(false)
            setIsSubmitting(false)
        } catch (e: any) {
            const friendlyError = getFriendlyAuthError(e)
            toast({ status: 'error', title: friendlyError })

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
        <Box className="login-form" as="form">
            <p className="login-heading">Login User</p>

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
                {touched.email && (
                    <Text fontSize="xs" color="red.500" mt={1}>{emailError}</Text>
                )}
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
                        <IconButton
                            aria-label="toggle password visibility"
                            size="sm"
                            variant="ghost"
                            onClick={handleTogglePasswordVisibility}
                            icon={showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                        />
                    </InputRightElement>
                </InputGroup>
                {touched.password && (
                    <Text fontSize="xs" color="red.500" mt={1}>{passwordError}</Text>
                )}
            </FormControl>

            <Box display="flex" justifyContent="space-between" alignItems="center" w="100%" mt={-2} mb={2}>
                <Checkbox isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} colorScheme="brand">
                    <Text fontSize="sm" color="#7e755a">Remember me</Text>
                </Checkbox>
                <Button variant="link" onClick={onForgotPassword} isDisabled={isSubmitting} color="#7e755a" fontSize="sm">
                    Forgot Password?
                </Button>
            </Box>

            <Button colorScheme="brand" className="login-button" onClick={handleLogin} isDisabled={isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
        </Box>
    );
}
