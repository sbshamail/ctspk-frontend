import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// JazzCash configuration from environment variables
const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD;
const JAZZCASH_INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
const JAZZCASH_API_URL = process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0';

interface VerifyOTPRequest {
  transactionId: string;
  otp: string;
  txnRefNo: string;
}

// Generate secure hash for JazzCash request
function generateSecureHash(data: Record<string, string>, integritySalt: string): string {
  // Build hash string with sorted keys
  const sortedKeys = Object.keys(data).sort();
  let hashString = integritySalt;

  for (const key of sortedKeys) {
    if (data[key] && data[key] !== '' && key !== 'pp_SecureHash') {
      hashString += `&${data[key]}`;
    }
  }

  // Generate HMAC SHA256 hash
  return crypto.createHmac('sha256', integritySalt).update(hashString).digest('hex');
}

// Format date for JazzCash (YYYYMMDDHHmmss)
function formatJazzCashDateTime(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();

    // Validate required fields
    if (!body.transactionId || !body.otp || !body.txnRefNo) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', responseCode: '400' },
        { status: 400 }
      );
    }

    // Validate OTP format (should be 4-6 digits)
    const otp = body.otp.replace(/[^0-9]/g, '');
    if (otp.length < 4 || otp.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format', responseCode: 'INVALID_OTP' },
        { status: 400 }
      );
    }

    // Development mode: Return mock response (before checking credentials)
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('JazzCash Mock - Verifying OTP:', { transactionId: body.transactionId, otp });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: Accept any 6-digit OTP starting with 1 as success
      if (otp.startsWith('1') || otp === '123456') {
        return NextResponse.json({
          success: true,
          transactionId: body.txnRefNo,
          transactionStatus: 'SUCCESS',
          responseCode: '000',
          message: 'Payment successful',
        });
      } else if (otp === '000000') {
        return NextResponse.json(
          {
            success: false,
            error: 'OTP has expired. Please request a new one.',
            responseCode: 'OTP_EXPIRED',
            transactionStatus: 'FAILED',
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid OTP. Please try again.',
            responseCode: 'INVALID_OTP',
            transactionStatus: 'FAILED',
          },
          { status: 400 }
        );
      }
    }

    // Validate environment variables (production only)
    if (!JAZZCASH_MERCHANT_ID || !JAZZCASH_PASSWORD || !JAZZCASH_INTEGRITY_SALT) {
      console.error('JazzCash credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured', responseCode: '500' },
        { status: 500 }
      );
    }

    const txnDateTime = formatJazzCashDateTime();

    // Prepare request data for OTP verification
    const requestData: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'OTC', // OTP Confirmation
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_Password: JAZZCASH_PASSWORD,
      pp_TxnRefNo: body.txnRefNo,
      pp_TxnDateTime: txnDateTime,
      pp_OTP: otp,
    };

    // Generate secure hash
    requestData.pp_SecureHash = generateSecureHash(requestData, JAZZCASH_INTEGRITY_SALT);

    // Production: Call JazzCash OTP verification API
    const response = await fetch(`${JAZZCASH_API_URL}/Purchase/ConfirmOTP`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    // JazzCash returns pp_ResponseCode: "000" for success
    if (responseData.pp_ResponseCode === '000') {
      return NextResponse.json({
        success: true,
        transactionId: responseData.pp_TxnRefNo || body.txnRefNo,
        transactionStatus: 'SUCCESS',
        responseCode: '000',
        message: 'Payment successful',
      });
    } else {
      console.error('JazzCash OTP verification error:', responseData);

      // Map response codes to user-friendly messages
      let errorMessage = 'OTP verification failed';
      let errorCode = responseData.pp_ResponseCode || 'UNKNOWN';

      if (responseData.pp_ResponseCode === '157' ||
          responseData.pp_ResponseMessage?.toLowerCase().includes('invalid otp')) {
        errorMessage = 'Invalid OTP. Please try again.';
        errorCode = 'INVALID_OTP';
      } else if (responseData.pp_ResponseMessage?.toLowerCase().includes('expired')) {
        errorMessage = 'OTP has expired. Please request a new one.';
        errorCode = 'OTP_EXPIRED';
      } else if (responseData.pp_ResponseCode === '124') {
        errorMessage = 'Insufficient balance in your JazzCash account.';
        errorCode = 'INSUFFICIENT_BALANCE';
      } else if (responseData.pp_ResponseMessage) {
        errorMessage = responseData.pp_ResponseMessage;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          responseCode: errorCode,
          transactionStatus: 'FAILED',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('JazzCash OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', responseCode: '500' },
      { status: 500 }
    );
  }
}
