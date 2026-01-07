import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || process.env.PAYFAST_SECURED_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE;
// Only use sandbox if explicitly set - onsite payments don't work in sandbox
const PAYFAST_SANDBOX = process.env.PAYFAST_SANDBOX === 'true';

// Different URLs for sandbox vs production
const PAYFAST_ONSITE_URL = 'https://www.payfast.co.za/onsite/process';
const PAYFAST_REDIRECT_URL = PAYFAST_SANDBOX
  ? 'https://sandbox.payfast.co.za/eng/process'
  : 'https://www.payfast.co.za/eng/process';

interface PaymentRequestBody {
  orderId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
  trackingNumber?: string; // For return URL after payment - REQUIRED for order tracking
}

function generateSignatureString(data: Record<string, string>, passphrase?: string): string {
  // PayFast signature - minimal fields with URL encoding
  const fieldOrder = [
    'merchant_id',
    'merchant_key',
    'return_url',
    'cancel_url',
    'amount',
    'item_name',
  ];

  const pfOutput: string[] = [];

  for (const key of fieldOrder) {
    if (key in data && data[key] !== undefined && data[key] !== null && data[key] !== '') {
      const value = String(data[key]).trim();
      // URL encode and convert spaces to +
      const encoded = encodeURIComponent(value).replace(/%20/g, '+');
      pfOutput.push(`${key}=${encoded}`);
    }
  }

  let getString = pfOutput.join('&');

  // Append passphrase (required for sandbox)
  if (passphrase && passphrase.trim()) {
    getString += `&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, '+')}`;
  }

  return getString;
}

export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequestBody = await request.json();

    // Validate required fields
    if (!body.orderId || !body.amount || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Validate environment variables
    if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
      console.error('PayFast credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Build return/cancel URLs - keep them clean (no query params) for signature compatibility
    // Tracking is handled via localStorage - ensure domain matches where you're testing!
    const returnUrl = process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL ||
                      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/order-success`;
    const cancelUrl = process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL ||
                      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/payment-cancelled`;

    console.log('Return URL:', returnUrl);
    console.log('Cancel URL:', cancelUrl);
    console.log('Tracking number (stored in localStorage):', body.trackingNumber || 'none');

    // Build payment data object - minimal fields that work
    const paymentData: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      amount: body.amount.toFixed(2),
      item_name: body.itemName.substring(0, 100).replace(/[^a-zA-Z0-9 ]/g, ''), // Alphanumeric only
    };

    // Generate signature
    const signatureString = generateSignatureString(paymentData, PAYFAST_PASSPHRASE);
    paymentData.signature = crypto.createHash('md5').update(signatureString).digest('hex');

    // Debug logging
    console.log('=== PAYFAST DEBUG ===');
    console.log('Signature string:', signatureString);
    console.log('Generated signature:', paymentData.signature);
    console.log('Passphrase used:', PAYFAST_PASSPHRASE ? 'YES' : 'NO');
    console.log('=====================');

    // SANDBOX MODE: Use redirect flow (onsite doesn't work in sandbox)
    if (PAYFAST_SANDBOX) {
      return NextResponse.json({
        success: true,
        mode: 'redirect',
        redirectUrl: PAYFAST_REDIRECT_URL,
        paymentData: paymentData,
      });
    }

    // PRODUCTION MODE: Use onsite modal
    const formData = new URLSearchParams(paymentData).toString();

    const response = await fetch(PAYFAST_ONSITE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: formData,
    });

    const responseText = await response.text();

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('PayFast response not JSON. URL:', PAYFAST_ONSITE_URL);
      console.error('Response status:', response.status);
      console.error('Response text:', responseText.substring(0, 500));
      return NextResponse.json(
        { success: false, error: 'Invalid response from payment gateway. Please check PayFast credentials.' },
        { status: 500 }
      );
    }

    if (result.uuid) {
      return NextResponse.json({
        success: true,
        mode: 'onsite',
        uuid: result.uuid,
      });
    } else {
      console.error('PayFast error:', result);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate payment identifier',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PayFast payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
