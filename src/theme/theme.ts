import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffefba',
      dark: '#AFA37B',
      light: '#FFF8DC',
      contrastText: '#7e755a',
    },
    secondary: {
      main: '#7e755a',
      dark: '#5a5340',
      light: '#9e9577',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#7e755a',
      secondary: '#AFA37B',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F54627',
    },
    warning: {
      main: '#FFA500',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7e755a',
      dark: '#5a5340',
      light: '#9e9577',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffefba',
      dark: '#AFA37B',
      light: '#FFF8DC',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
    success: {
      main: '#66BB6A',
    },
    error: {
      main: '#EF5350',
    },
    warning: {
      main: '#FFA726',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});
