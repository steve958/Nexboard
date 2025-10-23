import * as React from 'react';
import { Box, Spinner } from '@chakra-ui/react';

export default function CircularIndeterminate() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" position="relative">
      <Spinner color="gray.400" size="xl" thickness="4px" speed="0.65s" />
    </Box>
  );
}
