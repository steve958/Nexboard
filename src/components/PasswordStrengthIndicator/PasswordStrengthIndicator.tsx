import React from 'react';
import { Box, Progress, Text, HStack } from '@chakra-ui/react';
import { MdCheckCircle, MdCancel } from 'react-icons/md';
import { getPasswordStrength, getPasswordRequirements } from '@/utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export default function PasswordStrengthIndicator({ password, show }: PasswordStrengthIndicatorProps) {
  if (!show) return null;

  const strength = getPasswordStrength(password);
  const requirements = getPasswordRequirements(password);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak':
        return '#F54627';
      case 'medium':
        return '#FFA500';
      case 'strong':
        return '#4CAF50';
      default:
        return '#ccc';
    }
  };

  const getStrengthValue = () => {
    switch (strength) {
      case 'weak':
        return 33;
      case 'medium':
        return 66;
      case 'strong':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <Box w="100%" mt={1} mb={2}>
      <HStack align="center" justify="space-between" mb={1}>
        <Text fontSize="xs" color="#7e755a">Password Strength:</Text>
        <Text fontSize="xs" fontWeight="bold" textTransform="capitalize" color={getStrengthColor()}>
          {password ? strength : 'None'}
        </Text>
      </HStack>
      <Progress value={getStrengthValue()} size="sm" borderRadius={4} sx={{
        '& > div': { backgroundColor: getStrengthColor() }
      }} />

      <Box mt={2}>
        <Text fontSize="xs" color="#7e755a" fontWeight="bold" display="block" mb={1}>
          Password Requirements:
        </Text>
        <Box display="flex" flexDirection="column" gap={0.5}>
          <RequirementItem met={requirements.minLength} text="At least 8 characters" />
          <RequirementItem met={requirements.hasUpperCase} text="One uppercase letter" />
          <RequirementItem met={requirements.hasLowerCase} text="One lowercase letter" />
          <RequirementItem met={requirements.hasNumber} text="One number" />
          <RequirementItem met={requirements.hasSpecialChar} text="One special character (!@#$%^&*)" />
        </Box>
      </Box>
    </Box>
  );
}

interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <HStack align="center" spacing={1}>
      {met ? (
        <MdCheckCircle style={{ fontSize: 16, color: '#4CAF50' }} />
      ) : (
        <MdCancel style={{ fontSize: 16, color: '#ccc' }} />
      )}
      <Text fontSize="xs" color={met ? '#4CAF50' : '#999'}>
        {text}
      </Text>
    </HStack>
  );
}
