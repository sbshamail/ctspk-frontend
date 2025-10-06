"use client";

import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterModal() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => router.back(), 0);
  };

  const handleSwitch = () => {
    setOpen(false);
    setTimeout(() => {
      router.back();
      setTimeout(() => {
        router.push("/login", { scroll: false });
      }, 10);
    }, 0);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-in fade-in-50">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">
          Create a New Account
        </h2>
        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-4 ">
          Already have an account?{" "}
          <button
            onClick={handleSwitch}
            className="text-primary hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
