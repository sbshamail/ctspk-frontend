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
import { Input } from "@/components/ui/input";
import { fetchApi } from "@/action/fetchApi";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  email?: string;
}

const OtpVerifyModal = ({ open, setOpen, email }: Props) => {
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<"verify" | "reset">("verify");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const verify = await fetchApi({
      url: "user/verify-code",
      method: "POST",
      data: { 
        email, 
        verification_code: otpValue 
      },
      showToast: true,
    });
    
    setIsLoading(false);
    
    if (verify) {
      setStep("reset");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }
    
    // Basic password strength check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(newPassword)) {
      alert("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setIsLoading(true);
    
    const reset = await fetchApi({
      url: "user/reset-password",
      method: "POST",
      data: { 
        email,
        verification_code: otpValue,
        new_password: newPassword,
        confirm_password: confirmPassword
      },
      showToast: true,
    });
    
    setIsLoading(false);
    
    if (reset) {
      // Reset all states and close modal
      setOtpValue("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("verify");
      setOpen(false);
      
      // Show signin modal (you'll need to implement this part based on your app structure)
      // For example: setSignInModal(true);
    }
  };

  const handleResendOtp = async () => {
    const resend = await fetchApi({
      url: "user/forgot-password",
      method: "POST",
      data: { email },
      showToast: true,
    });
  };

  return (
    <ShadDialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          // Reset state when modal closes
          setOtpValue("");
          setNewPassword("");
          setConfirmPassword("");
          setStep("verify");
        }
        setOpen(isOpen);
      }} 
      title={step === "verify" ? "Enter OTP Code" : "Reset Your Password"}
    >
      {step === "verify" ? (
        <form onSubmit={handleVerify} className="space-y-6">
          <p className="text-sm text-muted-foreground text-center">
            We've sent a 6-digit code to <b>{email}</b>.
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
            disabled={otpValue.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn't receive it?{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={handleResendOtp}
            >
              Resend OTP
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Create a new strong password for your account.
          </p>

          <div className="space-y-4">
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              required
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full"
            />
            
            <Input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              required
              minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Password must contain:</p>
            <ul className="list-disc list-inside mt-1">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </ShadDialog>
  );
};

export default OtpVerifyModal;