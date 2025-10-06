import { AuthShell } from "@/@pages/AuthShell";
import { RegisterForm } from "@/components/forms/auth/RegisterForm";
import React from "react";

const page = () => {
  return (
    <AuthShell
      title="Create your account"
      description="Join the marketplace—buy, sell, and grow your brand."
    >
      <RegisterForm />
    </AuthShell>
  );
};

export default page;
