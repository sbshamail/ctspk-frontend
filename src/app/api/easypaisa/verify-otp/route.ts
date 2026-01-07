import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// EasyPaisa configuration from environment variables
const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID;
const EASYPAISA_STORE_PASSWORD = process.env.EASYPAISA_STORE_PASSWORD;
const EASYPAISA_API_URL = process.env.EASYPAISA_API_URL || 'https://easypaisa.com.pk/api/v1';

interface VerifyOTPRequest {
  transactionId: string;
  otp: string;
  orderId: string;
}

// Generate checksum for EasyPaisa request
function generateChecksum(data: Record<string, string>, secretKey: string): string {
  const sortedKeys = Object.keys(data).sort();
  const paramString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  const stringToHash = `${paramString}&secretKey=${secretKey}`;
  return crypto.createHash('sha256').update(stringToHash).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyOTPRequest = await request.json();

    // Validate required fields
    if (!body.transactionId || !body.otp || !body.orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields', errorCode: '0001' },
        { status: 400 }
      );
    }

    // Validate OTP format (should be 4-6 digits)
    const otp = body.otp.replace(/[^0-9]/g, '');
    if (otp.length < 4 || otp.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format', errorCode: '0004' },
        { status: 400 }
      );
    }

    // Development mode: Return mock response (before checking credentials)
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_NODE_ENV === 'development';
    if (isDevelopment) {
      console.log('EasyPaisa Mock - Verifying OTP:', { transactionId: body.transactionId, otp });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock: Accept any 6-digit OTP starting with 1 as success
      if (otp.startsWith('1') || otp === '123456') {
        return NextResponse.json({
          success: true,
          transactionId: body.transactionId,
          transactionStatus: 'SUCCESS',
          message: 'Payment successful',
        });
      } else if (otp === '000000') {
        return NextResponse.json(
          {
            success: false,
            error: 'OTP has expired. Please request a new one.',
            errorCode: '0005',
            transactionStatus: 'FAILED',
          },
          { status: 400 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid OTP. Please try again.',
            errorCode: '0004',
            transactionStatus: 'FAILED',
          },
          { status: 400 }
        );
      }
    }

    // Validate environment variables (production only)
    if (!EASYPAISA_STORE_ID || !EASYPAISA_STORE_PASSWORD) {
      console.error('EasyPaisa credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured', errorCode: '0009' },
        { status: 500 }
      );
    }

    const timestamp = new Date().toISOString();

    // Prepare request data for OTP verification
    const requestData: Record<string, string> = {
      storeId: EASYPAISA_STORE_ID,
      transactionId: body.transactionId,
      orderId: body.orderId,
      otp: otp,
      timestamp: timestamp,
    };

    // Generate checksum
    requestData.checksum = generateChecksum(requestData, EASYPAISA_STORE_PASSWORD);

    // Create authorization header
    const authCredentials = Buffer.from(`${EASYPAISA_STORE_ID}:${EASYPAISA_STORE_PASSWORD}`).toString('base64');

    // Production: Call EasyPaisa OTP verification API
    const response = await fetch(`${EASYPAISA_API_URL}/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authCredentials}`,
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (response.ok && responseData.transactionStatus === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        transactionId: responseData.transactionId || body.transactionId,
        transactionStatus: 'SUCCESS',
        message: 'Payment successful',
      });
    } else {
      console.error('EasyPaisa OTP verification error:', responseData);

      // Map response codes to user-friendly messages
      let errorCode = responseData.responseCode || '0001';
      let errorMessage = responseData.message || 'OTP verification failed';

      if (responseData.responseCode === '0004' || responseData.message?.toLowerCase().includes('invalid otp')) {
        errorCode = '0004';
        errorMessage = 'Invalid OTP. Please try again.';
      } else if (responseData.responseCode === '0005' || responseData.message?.toLowerCase().includes('expired')) {
        errorCode = '0005';
        errorMessage = 'OTP has expired. Please request a new one.';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCode: errorCode,
          transactionStatus: 'FAILED',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('EasyPaisa OTP verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', errorCode: '0009' },
      { status: 500 }
    );
  }
}
