import React, { useEffect } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  useEffect(() => {
    // Update data-theme attribute on document
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`} arrow>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: mode === 'light' ? '#7e755a' : '#e0e0e0',
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(175, 163, 123, 0.1)' : 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
}
