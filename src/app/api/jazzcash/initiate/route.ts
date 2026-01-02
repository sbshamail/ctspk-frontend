import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// JazzCash configuration from environment variables
const JAZZCASH_MERCHANT_ID = process.env.JAZZCASH_MERCHANT_ID;
const JAZZCASH_PASSWORD = process.env.JAZZCASH_PASSWORD;
const JAZZCASH_INTEGRITY_SALT = process.env.JAZZCASH_INTEGRITY_SALT;
const JAZZCASH_API_URL = process.env.JAZZCASH_API_URL || 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0';
const JAZZCASH_RETURN_URL = process.env.NEXT_PUBLIC_JAZZCASH_RETURN_URL;

interface InitiatePaymentRequest {
  orderId: string;
  amount: number;
  mobileNumber: string;
  customerEmail: string;
  customerName: string;
  description?: string;
}

// Generate secure hash for JazzCash request
function generateSecureHash(data: Record<string, string>, integritySalt: string): string {
  // JazzCash requires specific order of parameters for hash generation
  const hashParams = [
    'pp_Amount',
    'pp_BillReference',
    'pp_Description',
    'pp_Language',
    'pp_MerchantID',
    'pp_MobileNumber',
    'pp_Password',
    'pp_ReturnURL',
    'pp_TxnCurrency',
    'pp_TxnDateTime',
    'pp_TxnRefNo',
    'pp_TxnType',
    'pp_Version',
  ];

  // Build hash string with integrity salt
  let hashString = integritySalt;
  for (const param of hashParams) {
    if (data[param] && data[param] !== '') {
      hashString += `&${data[param]}`;
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
    const body: InitiatePaymentRequest = await request.json();

    // Validate required fields
    if (!body.orderId || !body.amount || !body.mobileNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields', responseCode: '400' },
        { status: 400 }
      );
    }

    // Validate mobile number format (Pakistani format: 03XXXXXXXXX)
    const mobileNumber = body.mobileNumber.replace(/[^0-9]/g, '');
    if (!/^03[0-9]{9}$/.test(mobileNumber)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format', responseCode: '210' },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const txnDateTime = formatJazzCashDateTime();
    const txnRefNo = `T${txnDateTime}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Development mode: Return mock response (before checking credentials)
    if (process.env.NODE_ENV === 'development') {
      console.log('JazzCash Mock - Initiating payment:', {
        orderId: body.orderId,
        amount: body.amount,
        mobileNumber: mobileNumber,
      });

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return NextResponse.json({
        success: true,
        transactionId: txnRefNo,
        txnRefNo: txnRefNo,
        message: 'OTP sent to your mobile number. Please enter it to complete the payment.',
      });
    }

    // Validate environment variables (production only)
    if (!JAZZCASH_MERCHANT_ID || !JAZZCASH_PASSWORD || !JAZZCASH_INTEGRITY_SALT) {
      console.error('JazzCash credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured', responseCode: '500' },
        { status: 500 }
      );
    }

    // Amount in paisa (JazzCash requires amount in smallest currency unit)
    const amountInPaisa = Math.round(body.amount * 100).toString();

    // Prepare request data for JazzCash API
    const requestData: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_MERCHANT_ID,
      pp_Password: JAZZCASH_PASSWORD,
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountInPaisa,
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_BillReference: body.orderId,
      pp_Description: body.description || `Order Payment - ${body.orderId}`,
      pp_MobileNumber: mobileNumber,
      pp_ReturnURL: JAZZCASH_RETURN_URL || '',
    };

    // Generate secure hash
    requestData.pp_SecureHash = generateSecureHash(requestData, JAZZCASH_INTEGRITY_SALT);

    // Production: Call JazzCash API
    const response = await fetch(`${JAZZCASH_API_URL}/Purchase/DoMWalletTransaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseData = await response.json();

    // JazzCash returns pp_ResponseCode: "000" for success
    if (responseData.pp_ResponseCode === '000' || responseData.pp_ResponseCode === '001') {
      return NextResponse.json({
        success: true,
        transactionId: responseData.pp_TxnRefNo || txnRefNo,
        txnRefNo: responseData.pp_TxnRefNo || txnRefNo,
        message: responseData.pp_ResponseCode === '000'
          ? 'Payment successful'
          : 'OTP sent to your mobile number. Please enter it to complete the payment.',
      });
    } else {
      console.error('JazzCash initiate error:', responseData);

      // Map response codes to user-friendly messages
      const errorMessages: Record<string, string> = {
        '124': 'Insufficient balance in your JazzCash account.',
        '157': 'Transaction declined. Please try again.',
        '210': 'Invalid mobile number format.',
        '400': 'Invalid request. Please try again.',
        '401': 'Authentication failed. Please contact support.',
        '404': 'Mobile account not found.',
        '500': 'System error. Please try another payment method.',
        '999': 'System error. Please try another payment method.',
      };

      const errorMessage = errorMessages[responseData.pp_ResponseCode] ||
                          responseData.pp_ResponseMessage ||
                          'Failed to initiate payment';

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          responseCode: responseData.pp_ResponseCode || '999',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('JazzCash initiate error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', responseCode: '500' },
      { status: 500 }
    );
  }
}
