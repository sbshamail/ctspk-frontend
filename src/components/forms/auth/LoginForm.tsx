"use client";

import { saveSession } from "@/action/auth";
import { fetchApi } from "@/action/fetchApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

interface LoginFormProps {
  close: () => void;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}
export function LoginForm({ close, setUser }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    close();

    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    try {
      setSubmitting(true);
      const data = {
        email,
        password,
      };
      const login = await fetchApi({
        url: "login",
        method: "POST",
        data,
      });
      if (login) {
        setUser(login.data.user);
        const { access_token, refresh_token, user, exp } = login.data || {};
        saveSession(user, access_token, refresh_token, exp);
        close();
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={!!error && !email}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={!!error && !password}
          required
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <Link href="#" className="text-primary underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground hover:opacity-90"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
