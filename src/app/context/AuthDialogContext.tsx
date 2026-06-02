"use client";

import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";

export type FeedbackType = "success" | "error";

export interface AuthFeedbackState {
  open: boolean;
  type: FeedbackType;
  message: string;
}

interface AuthDialogContextType {
  feedback: AuthFeedbackState;
  showFeedback: (type: FeedbackType, message: string, duration?: number) => void;
  /** @deprecated Utiliser showFeedback */
  isSuccessDialogOpen: boolean;
  /** @deprecated Utiliser showFeedback */
  isFailedDialogOpen: boolean;
  /** @deprecated Utiliser showFeedback */
  isUserRegistered: boolean;
  setIsSuccessDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsFailedDialogOpen: Dispatch<SetStateAction<boolean>>;
  setIsUserRegistered: Dispatch<SetStateAction<boolean>>;
}

export const AuthDialogContext = createContext<AuthDialogContextType | null>(
  null
);

interface AuthDialogProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION = 4000;

export const AuthDialogProvider: React.FC<AuthDialogProviderProps> = ({
  children,
}) => {
  const [feedback, setFeedback] = useState<AuthFeedbackState>({
    open: false,
    type: "success",
    message: "",
  });
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isFailedDialogOpen, setIsFailedDialogOpen] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFeedback = useCallback(
    (type: FeedbackType, message: string, duration = DEFAULT_DURATION) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      setFeedback({ open: true, type, message });
      setIsSuccessDialogOpen(false);
      setIsFailedDialogOpen(false);
      setIsUserRegistered(false);

      hideTimerRef.current = setTimeout(() => {
        setFeedback((prev) => ({ ...prev, open: false }));
      }, duration);
    },
    []
  );

  return (
    <AuthDialogContext.Provider
      value={{
        feedback,
        showFeedback,
        isSuccessDialogOpen,
        isFailedDialogOpen,
        isUserRegistered,
        setIsSuccessDialogOpen,
        setIsFailedDialogOpen,
        setIsUserRegistered,
      }}>
      {children}
    </AuthDialogContext.Provider>
  );
};

export default AuthDialogContext;
