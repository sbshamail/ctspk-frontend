"use client";

import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("http://69.10.53.162/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("API Response:", data);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-lg shadow bg-card w-80 space-y-4"
      >
        <h2 className="text-lg font-semibold text-foreground">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded bg-input text-foreground"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded bg-input text-foreground"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full py-2 rounded bg-primary text-primary-foreground font-medium"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
