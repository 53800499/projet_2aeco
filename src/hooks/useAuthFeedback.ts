"use client";

import { useCallback, useContext } from "react";
import AuthDialogContext from "@/app/context/AuthDialogContext";
import { formatAuthError } from "@/lib/auth-messages";

export const useAuthFeedback = () => {
  const context = useContext(AuthDialogContext);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      context?.showFeedback("success", message, duration);
    },
    [context]
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      context?.showFeedback("error", message, duration);
    },
    [context]
  );

  const showAuthError = useCallback(
    (error: unknown, fallback?: string, duration?: number) => {
      showError(formatAuthError(error, fallback), duration);
    },
    [showError]
  );

  return { showSuccess, showError, showAuthError };
};
