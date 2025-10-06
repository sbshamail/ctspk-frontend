import React from "react";
import { AuthShell } from "@/@pages/AuthShell";
import { LoginForm } from "@/components/forms/auth/LoginForm";
const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <AuthShell
        title="Welcome back"
        description="Sign in to continue shopping or manage your storefront."
      >
        <LoginForm />
      </AuthShell>
    </div>
  );
};

export default page;
