'use client'
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeProvider, useThemeMode } from "@/context/ThemeContext";

function AppContent({ Component, pageProps }: AppProps) {
  const { mode } = useThemeMode();

  return (
    <>
      <Component {...pageProps} />
      <ToastContainer
        position="top-center"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={mode}
        style={{
          top: '20px',
        }}
      />
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <ThemeProvider>
      <AuthContextProvider>
        <AppContent {...props} />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
