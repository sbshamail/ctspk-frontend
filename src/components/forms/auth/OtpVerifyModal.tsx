"use client";
import React, { useState } from "react";
import { ShadDialog } from "@/components/dialog/ShadDialog";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { fetchApi } from "@/action/fetchApi";
import { set } from "zod/v3";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  email?: string;
}

const OtpVerifyModal = ({ open, setOpen, email }: Props) => {
  const [otpValue, setOtpValue] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verify = await fetchApi({
      url: "user/verify-code",
      method: "POST",
      data: { email },
    });
    setOtpValue("");
    // TODO: verify via API
    setOpen(false);
  };

  return (
    <ShadDialog open={open} onOpenChange={setOpen} title="Enter OTP Code">
      <form onSubmit={handleVerify} className="space-y-6">
        <p className="text-sm text-muted-foreground text-center">
          We’ve sent a 6-digit code to <b>{email}</b>.
        </p>

        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpValue}
            onChange={(value) => setOtpValue(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={otpValue.length !== 6}
        >
          Verify Code
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn’t receive it?{" "}
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => console.log("Resend OTP")}
          >
            Resend OTP
          </button>
        </p>
      </form>
    </ShadDialog>
  );
};

export default OtpVerifyModal;
