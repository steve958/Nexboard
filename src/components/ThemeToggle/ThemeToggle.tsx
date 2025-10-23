import React from 'react';
import { IconButton, Tooltip, useColorMode } from '@chakra-ui/react';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} openDelay={150}>
      <IconButton
        aria-label="toggle theme"
        onClick={toggleColorMode}
        color={colorMode === 'light' ? '#0F172A' : '#E5E7EB'}
        variant="ghost"
        icon={colorMode === 'light' ? <MdBrightness4 /> : <MdBrightness7 />}
      />
    </Tooltip>
  );
}
