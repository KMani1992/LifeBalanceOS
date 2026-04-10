"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  ensureUserProfile,
  loadApplicationData,
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
  signOutUser,
  type AuthSubmissionResult,
  type OAuthSignInResult,
  type PasswordResetRequestResult,
} from "@/lib/persistence";
import { supabase } from "@/lib/supabaseClient";
import { setTasks } from "@/store/slices/dailySlice";
import { setFinanceEntries } from "@/store/slices/financeSlice";
import { setGoals } from "@/store/slices/goalsSlice";
import { setHabits } from "@/store/slices/habitSlice";
import { setKidsActivities } from "@/store/slices/kidsSlice";
import { setReflections } from "@/store/slices/reflectionSlice";
import { setWeeklyReviews } from "@/store/slices/weeklyReviewSlice";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isInitializing: boolean;
  isHydrating: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<OAuthSignInResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthSubmissionResult>;
  sendPasswordReset: (email: string) => Promise<PasswordResetRequestResult>;
  signOut: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Provides authentication state plus initial application data hydration.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const dispatch = useDispatch<AppDispatch>();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isHydrating, setIsHydrating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  /**
   * Clears all persisted module state when the user signs out.
   */
  const clearApplicationState = useCallback(() => {
    dispatch(setTasks([]));
    dispatch(setWeeklyReviews([]));
    dispatch(setGoals([]));
    dispatch(setKidsActivities([]));
    dispatch(setFinanceEntries([]));
    dispatch(setReflections([]));
    dispatch(setHabits([]));
  }, [dispatch]);

  /**
   * Loads all app datasets after a session is available.
   */
  const hydrateApplicationData = useCallback(async (currentUser: User) => {
    setIsHydrating(true);
    try {
      const ensuredProfile = await ensureUserProfile(currentUser);
      const appData = await loadApplicationData();
      setProfile(ensuredProfile);
      dispatch(setTasks(appData.dailyTasks));
      dispatch(setWeeklyReviews(appData.weeklyReviews));
      dispatch(setGoals(appData.goals));
      dispatch(setKidsActivities(appData.kidsActivities));
      dispatch(setFinanceEntries(appData.financeEntries));
      dispatch(setReflections(appData.reflections));
      dispatch(setHabits(appData.habits));
      setAuthError(null);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Failed to load application data.");
    } finally {
      setIsHydrating(false);
    }
  }, [dispatch]);

  useEffect(() => {
    let active = true;

    /**
     * Resolves the initial session and subscribes to later auth events.
     */
    async function initializeAuth() {
      if (!supabase) {
        if (active) {
          setIsInitializing(false);
          setAuthError("Supabase is not configured.");
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        await hydrateApplicationData(sessionUser);
      } else {
        clearApplicationState();
        setProfile(null);
      }

      if (active) {
        setIsInitializing(false);
      }
    }

    void initializeAuth();

    if (!supabase) {
      return () => {
        active = false;
      };
    }

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (!nextUser) {
        clearApplicationState();
        setProfile(null);
        setIsHydrating(false);
        return;
      }

      void hydrateApplicationData(nextUser);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [clearApplicationState, hydrateApplicationData]);

  /**
   * Signs in the user and lets the auth subscription trigger hydration.
   */
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    await signInWithPassword(email, password);
  }, []);

  /**
   * Starts Google OAuth sign-in.
   */
  const handleSignInWithGoogle = useCallback(async () => {
    setAuthError(null);
    return signInWithGoogle();
  }, []);

  /**
   * Creates a new user account and lets auth state changes hydrate data when a session is issued.
   */
  const handleSignUp = useCallback(async (email: string, password: string, name?: string) => {
    setAuthError(null);
    return signUpWithPassword(email, password, name);
  }, []);

  /**
   * Sends a password reset email for the supplied account email.
   */
  const handleSendPasswordReset = useCallback(async (email: string) => {
    setAuthError(null);
    return requestPasswordReset(email);
  }, []);

  /**
   * Signs the current user out and clears app state.
   */
  const handleSignOut = useCallback(async () => {
    await signOutUser();
    clearApplicationState();
    setProfile(null);
  }, [clearApplicationState]);

  /**
   * Refreshes all application datasets for the signed-in user.
   */
  const refreshData = useCallback(async () => {
    if (!user) {
      return;
    }

    await hydrateApplicationData(user);
  }, [hydrateApplicationData, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isInitializing,
      isHydrating,
      authError,
      signIn: handleSignIn,
      signInWithGoogle: handleSignInWithGoogle,
      signUp: handleSignUp,
      sendPasswordReset: handleSendPasswordReset,
      signOut: handleSignOut,
      refreshData,
    }),
    [
      authError,
      handleSendPasswordReset,
      handleSignIn,
      handleSignInWithGoogle,
      handleSignOut,
      handleSignUp,
      isHydrating,
      isInitializing,
      profile,
      refreshData,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Returns the active authentication context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
