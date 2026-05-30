"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Signin from "@/components/Auth/SignIn";
import SignUp from "@/components/Auth/SignUp";

interface AuthModalContextType {
  isSignInOpen: boolean;
  isSignUpOpen: boolean;
  openSignIn: () => void;
  openSignUp: () => void;
  closeSignIn: () => void;
  closeSignUp: () => void;
}

const AuthModalContext = createContext<AuthModalContextType>({
  isSignInOpen: false,
  isSignUpOpen: false,
  openSignIn: () => {},
  openSignUp: () => {},
  closeSignIn: () => {},
  closeSignUp: () => {},
});

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const signInRef = useRef<HTMLDivElement>(null);
  const signUpRef = useRef<HTMLDivElement>(null);

  const openSignIn = () => {
    setIsSignUpOpen(false);
    setIsSignInOpen(true);
  };

  const openSignUp = () => {
    setIsSignInOpen(false);
    setIsSignUpOpen(true);
  };

  const closeSignIn = () => setIsSignInOpen(false);
  const closeSignUp = () => setIsSignUpOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSignInOpen &&
        signInRef.current &&
        !signInRef.current.contains(event.target as Node)
      ) {
        setIsSignInOpen(false);
      }
      if (
        isSignUpOpen &&
        signUpRef.current &&
        !signUpRef.current.contains(event.target as Node)
      ) {
        setIsSignUpOpen(false);
      }
    };

    if (isSignInOpen || isSignUpOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSignInOpen, isSignUpOpen]);

  useEffect(() => {
    document.body.style.overflow = isSignInOpen || isSignUpOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSignInOpen, isSignUpOpen]);

  return (
    <AuthModalContext.Provider
      value={{
        isSignInOpen,
        isSignUpOpen,
        openSignIn,
        openSignUp,
        closeSignIn,
        closeSignUp,
      }}>
      {children}
      {isSignInOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            ref={signInRef}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-darklight">
            <button
              onClick={closeSignIn}
              className="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded-full absolute -top-5 -right-3 mr-8 mt-8"
              aria-label="Close sign in modal">
              <Icon icon="ic:round-close" className="text-2xl dark:text-white" />
            </button>
            <Signin signInOpen={(value: boolean) => value ? setIsSignInOpen(true) : closeSignIn()} />
          </div>
        </div>
      )}
      {isSignUpOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div
            ref={signUpRef}
            className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-darklight">
            <button
              onClick={closeSignUp}
              className="hover:bg-gray-200 dark:hover:bg-gray-800 p-1 rounded-full absolute -top-5 -right-3 mr-8 mt-8"
              aria-label="Close sign up modal">
              <Icon icon="ic:round-close" className="text-2xl dark:text-white" />
            </button>
            <SignUp signUpOpen={(value: boolean) => value ? setIsSignUpOpen(true) : closeSignUp()} />
          </div>
        </div>
      )}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => useContext(AuthModalContext);
