"use client";

import { LoginForm } from "@/components/forms/auth/LoginForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => router.back(), 0);
  };

  const handleSwitch = async () => {
    setOpen(false);
    // Wait for modal close before switching
    setTimeout(() => {
      router.back(); // go back to background page (e.g. /cart)
      setTimeout(() => {
        router.push("/register", { scroll: false }); // then open register modal
      }, 10);
    }, 0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-in fade-in-50">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Sign In to Your Account
        </h2>
        <LoginForm close={handleClose} />
        <p className="text-center text-sm text-muted-foreground mt-4">
          New here?{" "}
          <button
            onClick={handleSwitch}
            className="text-primary hover:underline cursor-pointer"
          >
            Register
          </button>
        </p>

        {/* <p className="text-sm text-center text-muted-foreground mt-4">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-primary hover:underline"
          >
            Register
          </button>
        </p> */}
      </div>
    </div>
  );
}
