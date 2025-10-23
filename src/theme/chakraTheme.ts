import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: "#e6f0ff",
    100: "#cce0ff",
    200: "#99c2ff",
    300: "#66a3ff",
    400: "#3385ff",
    500: "#0066ff",
    600: "#0052cc",
    700: "#003d99",
    800: "#002966",
    900: "#001433",
  },
};

const semanticTokens = {
  colors: {
    bg: {
      default: '#F0F4F8',
      _dark: '#0f172a',
    },
    text: {
      default: '#0F172A',
      _dark: '#E5E7EB',
    },
    cardBg: {
      default: 'white',
      _dark: '#111827',
    },
    ring: {
      default: 'brand.500',
      _dark: 'brand.400',
    },
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
  },
};

const components = {
  Button: {
    defaultProps: {
      colorScheme: "brand",
    },
    baseStyle: {
      _focusVisible: { boxShadow: '0 0 0 3px var(--chakra-colors-ring)' },
    },
  },
  Input: {
    variants: {
      filled: {
        field: {
          bg: 'cardBg',
          _focusVisible: { boxShadow: '0 0 0 3px var(--chakra-colors-ring)', borderColor: 'brand.500' },
        },
      },
    },
  },
};

const styles = {
  global: {
    body: {
      bg: 'bg',
      color: 'text',
    },
    'p, span, label': {
      color: 'text',
    },
    '*:focus-visible': {
      boxShadow: '0 0 0 3px var(--chakra-colors-ring) !important',
      outline: 'none',
    },
  },
};

const chakraTheme = extendTheme({ config, colors, components, styles, semanticTokens });
export default chakraTheme;
