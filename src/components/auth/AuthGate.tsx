"use client";

import { PropsWithChildren, useState } from "react";
import GoogleIcon from "@mui/icons-material/Google";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "@/lib/auth-context";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

type AuthMode = "sign-in" | "sign-up";

/**
 * Protects the application and renders a sign-in form when no session exists.
 */
export default function AuthGate({ children }: PropsWithChildren) {
  const { user, isInitializing, isHydrating, signIn, signInWithGoogle, signUp, sendPasswordReset, authError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /**
   * Sends a password reset email for the entered address.
   */
  async function handleForgotPassword() {
    if (!email.trim()) {
      setLocalError("Enter your email first so the reset link knows where to go.");
      return;
    }

    try {
      setSubmitting(true);
      setLocalError(null);
      setLocalSuccess(null);
      await sendPasswordReset(email.trim());
      setLocalSuccess("Password reset email sent. Open the link from your inbox to choose a new password.");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Unable to send password reset email.");
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Submits either the sign-in or sign-up form using Supabase password auth.
   */
  async function handleSubmit() {
    if (!email.trim() || !password) {
      setLocalError("Enter both email and password.");
      return;
    }

    if (mode === "sign-up" && password.length < 6) {
      setLocalError("Use a password with at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setLocalError(null);
      setLocalSuccess(null);

      if (mode === "sign-up") {
        const result = await signUp(email.trim(), password, name.trim() || undefined);
        setLocalSuccess(
          result.requiresEmailConfirmation
            ? "Account created. Check your email for the confirmation link, then sign in."
            : "Account created. You can continue into LifeBalanceOS now.",
        );
        if (result.requiresEmailConfirmation) {
          setMode("sign-in");
        }
        return;
      }

      await signIn(email.trim(), password);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : `Unable to ${mode === "sign-up" ? "sign up" : "sign in"}.`);
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Starts Google OAuth sign-in flow.
   */
  async function handleGoogleSignIn() {
    try {
      setSubmitting(true);
      setLocalError(null);
      setLocalSuccess(null);
      await signInWithGoogle();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Unable to start Google sign-in.");
      setSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">
          Supabase is not configured. Add your project URL and publishable key to the environment variables before using persistence.
        </Alert>
      </Container>
    );
  }

  if (isInitializing || (user && isHydrating)) {
    return (
      <Box sx={{ minHeight: "calc(100vh - 88px)", display: "grid", placeItems: "center" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography color="text.secondary">Loading your LifeBalanceOS data…</Typography>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    const modeTitle = mode === "sign-in" ? "Sign in to LifeBalanceOS" : "Create your LifeBalanceOS account";
    const modeDescription =
      mode === "sign-in"
        ? "Pick up where you left off across goals, habits, reflections, and your daily balance plan."
        : "Start your personal balance workspace to track focus, family, finance, and peace in one place.";

    return (
      <Container
        maxWidth="sm"
        sx={{
          py: { xs: 4, md: 8 },
          minHeight: "calc(100vh - 88px)",
          display: "grid",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            border: "1px solid rgba(22,50,79,0.10)",
            boxShadow: "0 20px 50px rgba(22,50,79,0.12)",
            background: "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,252,255,0.92) 100%)",
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={3.2}>
              <div>
                <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: -0.3 }}>
                  {modeTitle}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.5 }}>
                  {modeDescription}
                </Typography>
              </div>
              {authError ? <Alert severity="error">{authError}</Alert> : null}
              {localError ? <Alert severity="error">{localError}</Alert> : null}
              {localSuccess ? <Alert severity="success">{localSuccess}</Alert> : null}
              {mode === "sign-up" ? (
                <TextField
                  label="Name (optional)"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  fullWidth
                />
              ) : null}
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} fullWidth />
              <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} fullWidth />
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                sx={{ py: 1.1, fontWeight: 700, borderRadius: 999 }}
              >
                {submitting
                  ? mode === "sign-in"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "sign-in"
                    ? "Sign In"
                    : "Create Account"}
              </Button>
              <Button
                variant="outlined"
                onClick={handleGoogleSignIn}
                disabled={submitting}
                startIcon={<GoogleIcon />}
                sx={{ py: 1.1, fontWeight: 700, borderRadius: 999 }}
              >
                Continue with Google
              </Button>
              {mode === "sign-in" ? (
                <Button variant="text" onClick={handleForgotPassword} disabled={submitting} sx={{ fontWeight: 600 }}>
                  Forgot password?
                </Button>
              ) : null}
              <Divider />
              <Button
                variant="text"
                onClick={() => {
                  setMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
                  setLocalError(null);
                  setLocalSuccess(null);
                }}
                disabled={submitting}
                sx={{ fontWeight: 600 }}
              >
                {mode === "sign-in" ? "Need an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return <>{children}</>;
}
