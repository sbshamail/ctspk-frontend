import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// EasyPaisa configuration from environment variables
const EASYPAISA_STORE_ID = process.env.EASYPAISA_STORE_ID;
const EASYPAISA_STORE_PASSWORD = process.env.EASYPAISA_STORE_PASSWORD;
const EASYPAISA_ACCOUNT_NUMBER = process.env.EASYPAISA_ACCOUNT_NUMBER;
const EASYPAISA_API_URL = process.env.EASYPAISA_API_URL || 'https://easypaisa.com.pk/api/v1';

interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  mobileNumber: string;
  customerEmail: string;
  customerName: string;
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
    const body: InitiatePaymentRequest = await request.json();

    // Validate required fields
    if (!body.orderId || !body.amount || !body.mobileNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields', errorCode: '0001' },
        { status: 400 }
      );
    }

    // Validate mobile number format (Pakistani format: 03XXXXXXXXX)
    const mobileNumber = body.mobileNumber.replace(/[^0-9]/g, '');
    if (!/^03[0-9]{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format', errorCode: '0003' },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const transactionId = `EP${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    // Development mode: Return mock response (before checking credentials)
    if (process.env.NODE_ENV === 'development') {
      console.log('EasyPaisa Mock - Initiating payment:', {
        orderId: body.orderId,
        amount: body.amount,
        mobileNumber: mobileNumber,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        transactionId: transactionId,
        orderId: body.orderId,
        message: 'OTP sent to your mobile number. Please enter it to complete the payment.',
      });
    }

    // Validate environment variables (production only)
    if (!EASYPAISA_STORE_ID || !EASYPAISA_STORE_PASSWORD) {
      console.error('EasyPaisa credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured', errorCode: '0009' },
        { status: 500 }
      );
    }

    // Prepare request data for EasyPaisa API
    const requestData: Record<string, string> = {
      storeId: EASYPAISA_STORE_ID,
      orderId: body.orderId,
      transactionId: transactionId,
      transactionAmount: body.amount.toFixed(2),
      transactionType: 'MA', // Mobile Account
      mobileAccountNo: mobileNumber,
      emailAddress: body.customerEmail || '',
      accountNum: EASYPAISA_ACCOUNT_NUMBER || '',
      timestamp: timestamp,
    };

    // Generate checksum
    requestData.checksum = generateChecksum(requestData, EASYPAISA_STORE_PASSWORD);

    // Create authorization header (Base64 encoded credentials)
    const authCredentials = Buffer.from(`${EASYPAISA_STORE_ID}:${EASYPAISA_STORE_PASSWORD}`).toString('base64');

    // Production: Call EasyPaisa API
    const response = await fetch(`${EASYPAISA_API_URL}/initiate-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authCredentials}`,
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    if (response.ok && responseData.transactionId) {
      return NextResponse.json({
        success: true,
        transactionId: responseData.transactionId || transactionId,
        orderId: body.orderId,
        message: 'OTP sent to your mobile number. Please enter it to complete the payment.',
      });
    } else {
      console.error('EasyPaisa initiate error:', responseData);
      return NextResponse.json(
        {
          success: false,
          error: responseData.message || 'Failed to initiate payment',
          errorCode: responseData.responseCode || '0001',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('EasyPaisa initiate error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', errorCode: '0009' },
      { status: 500 }
    );
  }
}
