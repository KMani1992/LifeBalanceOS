"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { updateCurrentUserPassword } from "@/lib/persistence";
import { supabase } from "@/lib/supabaseClient";

/**
 * Renders the password reset screen reached from the Supabase recovery email.
 */
export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasRecoverySession = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.location.hash.includes("access_token=") || window.location.search.includes("code=");
  }, []);

  /**
   * Updates the user's password after validating the new value.
   */
  async function handleUpdatePassword() {
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The password and confirmation must match.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);
      await updateCurrentUserPassword(password);
      setSuccess("Password updated. Return to the sign-in screen and use your new password.");
      setPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <div>
              <Typography variant="h4">Reset your password</Typography>
              <Typography color="text.secondary">
                Choose a new password for your LifeBalanceOS account.
              </Typography>
            </div>
            {!hasRecoverySession ? (
              <Alert severity="info">
                Open this page from the password reset link in your email. If you have not requested one yet, go back and use Forgot password.
              </Alert>
            ) : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}
            <TextField
              label="New password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleUpdatePassword} disabled={submitting || !hasRecoverySession}>
              {submitting ? "Updating password..." : "Update Password"}
            </Button>
            <Button component={Link} href="/" variant="text">
              Back to sign in
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}