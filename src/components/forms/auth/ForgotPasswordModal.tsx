"use client";
import React, { useState } from "react";
import { ShadDialog } from "@/components/dialog/ShadDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import OtpVerifyModal from "./OtpVerifyModal";
import { fetchApi } from "@/action/fetchApi";
import { set } from "zod";
interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ForgotPasswordModal = ({ open, setOpen }: Props) => {
  const [otpModal, setOtpModal] = useState(false);
  const [email, setEmail] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const forgetPassword = await fetchApi({
      url: "user/forgot-password",
      method: "POST",
      data: { email },
      showToast: true,
    });
    setEmail("");
    // Close and open next modal
    setOpen(false);
    setTimeout(() => setOtpModal(true), 200);
  };

  return (
    <>
      <ShadDialog open={open} onOpenChange={setOpen} title="Forgot Password">
        <form onSubmit={handleSendOtp} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your email to receive a 5-digit OTP code.
          </p>

          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>
      </ShadDialog>

      {/* OTP Modal */}
      <OtpVerifyModal open={otpModal} setOpen={setOtpModal} email={email} />
    </>
  );
};

export default ForgotPasswordModal;
