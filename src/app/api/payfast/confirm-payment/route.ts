import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint to confirm PayFast payment and update order status
 * This is a workaround for when PayFast IPN webhook doesn't reach the backend
 *
 * Called from order-success page after user returns from PayFast
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ConfirmPaymentRequest {
  trackingNumber: string;
  paymentGateway: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConfirmPaymentRequest = await request.json();

    if (!body.trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing tracking number' },
        { status: 400 }
      );
    }

    console.log('=== CONFIRM PAYMENT ===');
    console.log('Tracking Number:', body.trackingNumber);
    console.log('Payment Gateway:', body.paymentGateway);

    // Call backend API to update payment status
    // Adjust this endpoint based on your backend API structure
    const response = await fetch(`${API_URL}/payment/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_number: body.trackingNumber,
        payment_gateway: body.paymentGateway || 'payfast',
        payment_status: 'payment-success',
      }),
    });

    const result = await response.json();
    console.log('Backend response:', result);
    console.log('========================');

    if (result.success === 1 || result.success === true) {
      return NextResponse.json({
        success: true,
        message: 'Payment confirmed successfully',
        data: result.data,
      });
    } else {
      // Even if backend fails, don't show error to user
      // The IPN might still update it later
      console.error('Backend payment confirm failed:', result);
      return NextResponse.json({
        success: false,
        error: result.detail || result.message || 'Failed to confirm payment',
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
