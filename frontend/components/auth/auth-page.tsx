"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";
import { AuthBranding } from "./auth-branding";

type AuthMode = "signin" | "signup";

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin");

  return (
    <main className="min-h-screen flex">
      {/* Left side - Branding (signin) / Form (signup) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted">
        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="branding-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <AuthBranding />
            </motion.div>
          ) : (
            <motion.div
              key="form-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center p-8"
            >
              <div className="w-full max-w-lg">
                <SignUpForm onSwitch={() => setMode("signin")} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side - Form (signin) / Branding (signup) */}
      <div
        className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${
          mode === "signup" ? "bg-muted" : "bg-background"
        }`}
      >
        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="form-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-center justify-center p-8"
            >
              <div className="w-full max-w-lg">
                <SignInForm onSwitch={() => setMode("signup")} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="branding-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <AuthBranding />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile form */}
      <div className="w-full lg:hidden flex items-center justify-center p-8 bg-background">
        <AnimatePresence mode="wait">
          {mode === "signin" ? (
            <motion.div
              key="mobile-signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <SignInForm onSwitch={() => setMode("signup")} />
            </motion.div>
          ) : (
            <motion.div
              key="mobile-signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <SignUpForm onSwitch={() => setMode("signin")} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
