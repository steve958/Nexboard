import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
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
    <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: '#7e755a' }}>
          Password Strength:
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: getStrengthColor(),
            fontWeight: 'bold',
            textTransform: 'capitalize',
          }}
        >
          {password ? strength : 'None'}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={getStrengthValue()}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getStrengthColor(),
            borderRadius: 4,
          },
        }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" sx={{ color: '#7e755a', fontWeight: 'bold', display: 'block', mb: 1 }}>
          Password Requirements:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <RequirementItem
            met={requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem
            met={requirements.hasUpperCase}
            text="One uppercase letter"
          />
          <RequirementItem
            met={requirements.hasLowerCase}
            text="One lowercase letter"
          />
          <RequirementItem
            met={requirements.hasNumber}
            text="One number"
          />
          <RequirementItem
            met={requirements.hasSpecialChar}
            text="One special character (!@#$%^&*)"
          />
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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {met ? (
        <CheckCircleIcon sx={{ fontSize: 16, color: '#4CAF50' }} />
      ) : (
        <CancelIcon sx={{ fontSize: 16, color: '#ccc' }} />
      )}
      <Typography
        variant="caption"
        sx={{
          color: met ? '#4CAF50' : '#999',
          fontSize: '12px',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
