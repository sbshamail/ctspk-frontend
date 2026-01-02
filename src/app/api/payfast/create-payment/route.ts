import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const PAYFAST_MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
const PAYFAST_MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || process.env.PAYFAST_SECURED_KEY;
const PAYFAST_PASSPHRASE = process.env.PAYFAST_PASSPHRASE || process.env.PAYFAST_SECURED_KEY;
const PAYFAST_URL = 'https://www.payfast.co.za/onsite/process';

interface PaymentRequestBody {
  orderId: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  customerPhone?: string;
}

function generateSignature(data: Record<string, string>, passphrase?: string): string {
  // Create parameter string (alphabetically sorted, URL encoded)
  const sortedKeys = Object.keys(data).sort();
  const paramString = sortedKeys
    .filter(key => data[key] !== '' && data[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if provided
  const stringToHash = passphrase
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}`
    : paramString;

  // Generate MD5 hash
  return crypto.createHash('md5').update(stringToHash).digest('hex');
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

    // Get return URLs from environment or use defaults
    const returnUrl = process.env.NEXT_PUBLIC_PAYFAST_RETURN_URL ||
                      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/order-success`;
    const cancelUrl = process.env.NEXT_PUBLIC_PAYFAST_CANCEL_URL ||
                      `${process.env.NEXT_PUBLIC_WEBSITE_URL}/checkout`;
    const notifyUrl = process.env.NEXT_PUBLIC_PAYFAST_NOTIFY_URL ||
                      `${process.env.NEXT_PUBLIC_API_URL}/payfast/ipn`;

    // Build payment data object
    const paymentData: Record<string, string> = {
      merchant_id: PAYFAST_MERCHANT_ID,
      merchant_key: PAYFAST_MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      name_first: body.customerFirstName || '',
      name_last: body.customerLastName || '',
      email_address: body.customerEmail,
      m_payment_id: body.orderId,
      amount: body.amount.toFixed(2),
      item_name: body.itemName.substring(0, 100), // PayFast limit
    };

    // Add optional item description
    if (body.itemDescription) {
      paymentData.item_description = body.itemDescription.substring(0, 255);
    }

    // Add optional phone
    if (body.customerPhone) {
      paymentData.cell_number = body.customerPhone.replace(/[^0-9]/g, '');
    }

    // Generate signature
    paymentData.signature = generateSignature(paymentData, PAYFAST_PASSPHRASE);

    // Request payment identifier (UUID) from PayFast
    const formData = new URLSearchParams(paymentData).toString();

    const response = await fetch(PAYFAST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const responseText = await response.text();

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('PayFast response not JSON:', responseText);
      return NextResponse.json(
        { success: false, error: 'Invalid response from payment gateway' },
        { status: 500 }
      );
    }

    if (result.uuid) {
      return NextResponse.json({
        success: true,
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
