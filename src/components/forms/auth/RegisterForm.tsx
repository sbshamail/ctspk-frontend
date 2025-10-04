"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/action/fetchApi";

type FormState = {
  name: string;
  email: string;
  phone_no: string;
  password: string;
  confirm_password: string;
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = React.useState<FormState>({
    name: "",
    email: "",
    phone_no: "",
    password: "",
    confirm_password: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const passwordsMismatch =
    form.password.length > 0 &&
    form.confirm_password.length > 0 &&
    form.password !== form.confirm_password;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (passwordsMismatch) {
      setError("Passwords do not match.");
      return;
    }
    try {
      setSubmitting(true);
      const data = {
        name: form.name,
        email: form.email,
        phone_no: form.phone_no,
        password: form.password,
      };
      const register = await fetchApi({
        url: "register",
        method: "POST",
        data,
      });
      console.log(register);
      if (register) {
        // route to onboarding once backend wired:
        router.push("/login");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="phone_no">Phone number</Label>
        <Input
          id="phone_no"
          type="tel"
          autoComplete="tel"
          placeholder="92123456789"
          value={form.phone_no}
          onChange={(e) => update("phone_no", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Optional. Include country code for faster verification.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a strong password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          aria-invalid={passwordsMismatch}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirm_password">Confirm password</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirm_password}
          onChange={(e) => update("confirm_password", e.target.value)}
          required
          aria-invalid={passwordsMismatch}
        />
        {passwordsMismatch ? (
          <p role="alert" className="text-sm text-destructive">
            Passwords do not match.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Must match the password above.
          </p>
        )}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={submitting || passwordsMismatch}
        className="w-full bg-primary text-primary-foreground hover:opacity-90"
      >
        {submitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
