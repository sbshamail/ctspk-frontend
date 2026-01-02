'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  paymentMethod: 'easypaisa' | 'jazzcash';
  mobileNumber?: string;
  onResendOTP?: () => Promise<void>;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  isLoading,
  error,
  paymentMethod,
  mobileNumber,
  onResendOTP,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      setResendCooldown(60); // Start with 60 seconds cooldown
    }
  }, [isOpen]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/[^0-9]/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    // Focus last filled input or next empty one
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle verify click
  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      await onVerify(otpString);
    }
  };

  // Handle resend OTP
  const handleResend = async () => {
    if (onResendOTP && resendCooldown === 0) {
      setIsResending(true);
      try {
        await onResendOTP();
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setIsResending(false);
      }
    }
  };

  const isOTPComplete = otp.every(digit => digit !== '');
  const displayMobile = mobileNumber
    ? `${mobileNumber.slice(0, 4)}****${mobileNumber.slice(-3)}`
    : '';

  const paymentMethodLabel = paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'JazzCash';
  const paymentMethodColor = paymentMethod === 'easypaisa' ? 'text-green-600' : 'text-red-600';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img
              src={`/assets/imgs/${paymentMethod}.png`}
              alt={paymentMethodLabel}
              className="h-6 w-6"
            />
            <span className={paymentMethodColor}>{paymentMethodLabel}</span> Verification
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP sent to your mobile number
            {displayMobile && <span className="font-semibold"> {displayMobile}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OTP Input */}
          <div className="space-y-2">
            <Label htmlFor="otp-0">Enter OTP</Label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold"
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Resend OTP */}
          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold">{resendCooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-sm text-primary hover:underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : "Didn't receive OTP? Resend"}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={!isOTPComplete || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </span>
                  Verifying...
                </>
              ) : (
                'Verify & Pay'
              )}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-gray-500">
            Your payment is secured by {paymentMethodLabel}. Never share your OTP with anyone.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
