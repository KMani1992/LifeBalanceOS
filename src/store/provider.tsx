"use client";

import { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/lib/auth-context";
import theme from "@/theme/theme";
import { store } from "@/store/store";

/**
 * Wraps the application with Redux, auth, and MUI providers.
 */
export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
