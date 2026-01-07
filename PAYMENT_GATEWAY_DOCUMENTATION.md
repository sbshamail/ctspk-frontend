# Payment Gateway Integration Documentation

## Overview

This document provides comprehensive documentation for the payment gateway integration in the checkout system. The following payment methods are implemented:

1. **PayFast** - Card payments (South Africa-based gateway)
2. **EasyPaisa** - Mobile wallet payments (Pakistan)
3. **JazzCash** - Mobile wallet payments (Pakistan)
4. **Cash on Delivery** - Pay when the order is delivered

---

## Payment Flow Architecture

### Payment Flow Diagram

```
User clicks "Place Order"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Payment Method Check                      │
└─────────────────────────────────────────────────────────────┘
         │
         ├──► Cash on Delivery
         │         │
         │         ▼
         │    Create Order Directly ──► Order Success Page
         │
         ├──► PayFast
         │         │
         │         ▼
         │    Initiate Payment (PayFast Modal)
         │         │
         │         ├── Success ──► Create Order ──► Order Success
         │         └── Failed  ──► Show Error ──► Stay on Checkout
         │
         ├──► EasyPaisa
         │         │
         │         ▼
         │    Initiate Payment ──► Show OTP Modal
         │         │
         │         ├── OTP Verified ──► Create Order ──► Order Success
         │         └── OTP Failed   ──► Show Error ──► Retry OTP
         │
         └──► JazzCash
                   │
                   ▼
              Initiate Payment ──► Show OTP Modal
                   │
                   ├── OTP Verified ──► Create Order ──► Order Success
                   └── OTP Failed   ──► Show Error ──► Retry OTP
```

**Key Principle:** For all online payment methods (PayFast, EasyPaisa, JazzCash), the payment MUST be collected and verified FIRST before creating the order. The order is only created after successful payment confirmation.

---

## Frontend API Routes (Next.js)

### 1. PayFast Create Payment

**Endpoint:** `POST /api/payfast/create-payment`

**Purpose:** Generate a payment UUID from PayFast for the onsite payment modal.

**Request Body:**
```json
{
  "orderId": "PF1704067200000",
  "amount": 1500.00,
  "itemName": "Order Payment",
  "itemDescription": "3 item(s)",
  "customerEmail": "customer@example.com",
  "customerFirstName": "John",
  "customerLastName": "Doe",
  "customerPhone": "03001234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "uuid": "abc123-def456-ghi789"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Failed to generate payment identifier"
}
```

**Environment Variables Required:**
```
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
NEXT_PUBLIC_PAYFAST_RETURN_URL=https://yoursite.com/order-success
NEXT_PUBLIC_PAYFAST_CANCEL_URL=https://yoursite.com/checkout
NEXT_PUBLIC_PAYFAST_NOTIFY_URL=https://your-backend.com/api/payfast/ipn
```

---

### 2. EasyPaisa Initiate Payment

**Endpoint:** `POST /api/easypaisa/initiate`

**Purpose:** Initiate an EasyPaisa mobile wallet transaction. Sends OTP to customer's mobile.

**Request Body:**
```json
{
  "orderId": "EP1704067200000",
  "amount": 1500.00,
  "mobileNumber": "03001234567",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "EP1704067200ABC123",
  "orderId": "EP1704067200000",
  "message": "OTP sent to your mobile number. Please enter it to complete the payment."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid mobile number format",
  "errorCode": "0003"
}
```

**Environment Variables Required:**
```
EASYPAISA_STORE_ID=your_store_id
EASYPAISA_STORE_PASSWORD=your_store_password
EASYPAISA_ACCOUNT_NUMBER=your_account_number
EASYPAISA_API_URL=https://easypaisa.com.pk/api/v1
```

---

### 3. EasyPaisa Verify OTP

**Endpoint:** `POST /api/easypaisa/verify-otp`

**Purpose:** Verify the OTP entered by the customer to complete the payment.

**Request Body:**
```json
{
  "transactionId": "EP1704067200ABC123",
  "orderId": "EP1704067200000",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "EP1704067200ABC123",
  "transactionStatus": "SUCCESS",
  "message": "Payment successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid OTP. Please try again.",
  "errorCode": "0004",
  "transactionStatus": "FAILED"
}
```

---

### 4. JazzCash Initiate Payment

**Endpoint:** `POST /api/jazzcash/initiate`

**Purpose:** Initiate a JazzCash mobile wallet transaction. Sends OTP to customer's mobile.

**Request Body:**
```json
{
  "orderId": "JC1704067200000",
  "amount": 1500.00,
  "mobileNumber": "03001234567",
  "customerEmail": "customer@example.com",
  "customerName": "John Doe",
  "description": "Order Payment - 3 item(s)"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "T20240101120000ABC123",
  "txnRefNo": "T20240101120000ABC123",
  "message": "OTP sent to your mobile number. Please enter it to complete the payment."
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Insufficient balance in your JazzCash account.",
  "responseCode": "124"
}
```

**Environment Variables Required:**
```
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_integrity_salt
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0
NEXT_PUBLIC_JAZZCASH_RETURN_URL=https://yoursite.com/order-success
```

---

### 5. JazzCash Verify OTP

**Endpoint:** `POST /api/jazzcash/verify-otp`

**Purpose:** Verify the OTP entered by the customer to complete the JazzCash payment.

**Request Body:**
```json
{
  "transactionId": "T20240101120000ABC123",
  "txnRefNo": "T20240101120000ABC123",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "transactionId": "T20240101120000ABC123",
  "transactionStatus": "SUCCESS",
  "responseCode": "000",
  "message": "Payment successful"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid OTP. Please try again.",
  "responseCode": "INVALID_OTP",
  "transactionStatus": "FAILED"
}
```

---

## Backend API Requirements

### 1. Create Order Endpoint

**Endpoint:** `POST /order/cartcreate`

**Purpose:** Create a new order after successful payment (or directly for COD).

**Request Body:**
```json
{
  "shipping_address": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "street": "123 Main Street",
    "city": "Karachi",
    "state": "Sindh",
    "postal_code": "75000",
    "country": "Pakistan",
    "is_default": false
  },
  "billing_address": {
    "street": "123 Main Street",
    "city": "Karachi",
    "state": "Sindh",
    "postal_code": "75000",
    "country": "Pakistan",
    "is_default": false
  },
  "payment_gateway": "payfast",
  "payment_status": "success",
  "payment_id": "PF1704067200000",
  "payment_response": {
    "gateway": "payfast",
    "transactionId": "PF1704067200000",
    "transactionStatus": "SUCCESS",
    "message": "Payment completed successfully",
    "completedAt": "2024-01-01T12:00:00.000Z"
  },
  "cart": [
    {
      "id": 1,
      "quantity": 2,
      "product_id": 101,
      "variation_option_id": null
    }
  ],
  "shipping_id": 1,
  "tax_id": 1,
  "coupon_id": null,
  "customer_contact": "03001234567",
  "customer_id": 123,
  "delivery_time": "Monday, January 1, 2024 - 9:00 AM - 12:00 PM",
  "use_wallet": true,
  "wallet_amount": 500.00
}
```

**Payment Gateway Values:**
- `payfast` - PayFast card payment
- `easypaisa` - EasyPaisa mobile wallet
- `jazzcash` - JazzCash mobile wallet
- `cash_on_delivery` - Cash on delivery

**Payment Status Values:**
- `success` - Payment was successful (for online payments)
- `cash-on-delivery` - Payment will be collected on delivery

**Payment Response Structure by Gateway:**

| Gateway | payment_response fields |
|---------|------------------------|
| PayFast | `gateway`, `transactionId`, `transactionStatus`, `message`, `completedAt` |
| EasyPaisa | `gateway`, `transactionId`, `transactionStatus`, `message`, `errorCode`, `verifiedAt` |
| JazzCash | `gateway`, `transactionId`, `transactionStatus`, `message`, `responseCode`, `verifiedAt` |
| Cash on Delivery | `null` (no payment response) |

**Example payment_response for EasyPaisa:**
```json
{
  "gateway": "easypaisa",
  "transactionId": "EP1704067200ABC123",
  "transactionStatus": "SUCCESS",
  "message": "Payment successful",
  "errorCode": null,
  "verifiedAt": "2024-01-01T12:00:00.000Z"
}
```

**Example payment_response for JazzCash:**
```json
{
  "gateway": "jazzcash",
  "transactionId": "T20240101120000ABC123",
  "transactionStatus": "SUCCESS",
  "message": "Payment successful",
  "responseCode": "000",
  "verifiedAt": "2024-01-01T12:00:00.000Z"
}
```

**Response (Success):**
```json
{
  "success": 1,
  "data": {
    "id": 456,
    "tracking_number": "TRK-20240101-001"
  },
  "detail": "Order created successfully"
}
```

---

### 2. PayFast IPN (Instant Payment Notification) Handler

**Endpoint:** `POST /api/payfast/ipn` (Backend URL)

**Purpose:** Receive asynchronous payment confirmations from PayFast for additional verification.

**PayFast Sends (form-urlencoded):**
```
m_payment_id=PF1704067200000
pf_payment_id=12345678
payment_status=COMPLETE
amount_gross=1500.00
amount_fee=45.00
amount_net=1455.00
name_first=John
name_last=Doe
email_address=john@example.com
merchant_id=your_merchant_id
signature=a1b2c3d4e5f6...
```

**Backend Should:**
1. Verify the signature matches the expected signature
2. Verify the payment amount matches the order amount
3. Verify the merchant_id matches your merchant ID
4. Update order payment_status to "success" if valid
5. Log the IPN for audit purposes
6. Send confirmation email to customer

**Signature Verification (PHP Example):**
```php
function validateSignature($data, $passphrase) {
    $tempParamString = '';
    foreach($data as $key => $value) {
        if ($key !== 'signature' && $value !== '') {
            $tempParamString .= $key . '=' . urlencode(stripslashes($value)) . '&';
        }
    }
    $tempParamString = substr($tempParamString, 0, -1);
    if ($passphrase !== null) {
        $tempParamString .= '&passphrase=' . urlencode(stripslashes($passphrase));
    }
    return md5($tempParamString) === $data['signature'];
}
```

---

### 3. EasyPaisa Callback Handler

**Endpoint:** `POST /api/easypaisa/callback` (Backend URL)

**Purpose:** Receive payment confirmation callbacks from EasyPaisa.

**EasyPaisa Sends:**
```json
{
  "orderRefNumber": "EP1704067200000",
  "transactionId": "EP123456789",
  "transactionStatus": "SUCCESS",
  "transactionAmount": "1500.00",
  "msisdn": "03001234567",
  "checksum": "abc123..."
}
```

**Backend Should:**
1. Verify the checksum using your store password
2. Verify the transaction amount matches the order
3. Update order payment_status based on transactionStatus
4. Send confirmation notifications

---

### 4. JazzCash Callback Handler

**Endpoint:** `POST /api/jazzcash/callback` (Backend URL)

**Purpose:** Receive payment confirmation callbacks from JazzCash.

**JazzCash Sends:**
```json
{
  "pp_TxnRefNo": "T20240101120000ABC123",
  "pp_TxnDateTime": "20240101120000",
  "pp_Amount": "150000",
  "pp_ResponseCode": "000",
  "pp_ResponseMessage": "Successful",
  "pp_MerchantID": "your_merchant_id",
  "pp_SecureHash": "abc123..."
}
```

**Note:** Amount is in paisa (smallest unit). 150000 = PKR 1500.00

**Response Code Meanings:**
- `000` - Successful
- `001` - Pending
- `124` - Insufficient Balance
- `157` - Transaction Declined
- `999` - System Error

**Backend Should:**
1. Verify the secure hash matches
2. Check pp_ResponseCode === "000" for success
3. Convert amount from paisa to PKR (divide by 100)
4. Update order payment_status
5. Send confirmation notifications

---

## Error Codes Reference

### EasyPaisa Error Codes

| Code | Message | User Action |
|------|---------|-------------|
| 0001 | Transaction failed | Try again |
| 0002 | Insufficient balance | Add funds to wallet |
| 0003 | Invalid mobile number | Check number format |
| 0004 | Invalid OTP | Enter correct OTP |
| 0005 | OTP expired | Request new OTP |
| 0006 | Transaction timeout | Try again |
| 0007 | Mobile account not found | Check number |
| 0008 | Daily limit exceeded | Try tomorrow |
| 0009 | Service unavailable | Try later |

### JazzCash Response Codes

| Code | Message | User Action |
|------|---------|-------------|
| 000 | Successful | Payment complete |
| 001 | Pending | Wait for confirmation |
| 124 | Insufficient balance | Add funds to wallet |
| 157 | Transaction declined | Contact support |
| 210 | Invalid mobile format | Check number |
| 400 | Invalid request | Try again |
| 401 | Authentication failed | Contact support |
| 404 | Account not found | Check number |
| 500 | System error | Try another method |
| 999 | System error | Try another method |

---

## Security Considerations

### Signature/Hash Verification

All payment gateways use cryptographic signatures to verify requests:

1. **PayFast:** MD5 hash with passphrase
2. **EasyPaisa:** SHA256 hash with store password
3. **JazzCash:** HMAC-SHA256 with integrity salt

**Always verify signatures on the backend before processing payments.**

### Secure Data Handling

1. Never log sensitive data (OTPs, passwords, full card numbers)
2. Use HTTPS for all API calls
3. Store credentials in environment variables, not in code
4. Validate all inputs on both frontend and backend
5. Implement rate limiting on payment endpoints

### Amount Verification

Always verify the payment amount matches the order amount before creating the order:

```javascript
// Backend verification
if (receivedAmount !== expectedOrderAmount) {
  throw new Error("Payment amount mismatch");
}
```

---

## Testing Guide

### Development Mode

In development mode (`NODE_ENV=development`), the APIs return mock responses:

**EasyPaisa/JazzCash OTP Testing:**
- OTP starting with `1` or `123456` = Success
- OTP `000000` = Expired OTP error
- Any other OTP = Invalid OTP error

**PayFast Testing:**
- Payment automatically succeeds after 2 seconds in development

### Sandbox Credentials

For testing with real sandbox environments:

**JazzCash Sandbox:**
- API URL: `https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0`
- Get sandbox credentials from JazzCash developer portal

**EasyPaisa Sandbox:**
- Contact EasyPaisa for sandbox access
- API URL will be provided for testing

---

## File Structure

```
src/
├── app/
│   └── api/
│       ├── payfast/
│       │   └── create-payment/
│       │       └── route.ts        # PayFast payment initiation
│       ├── easypaisa/
│       │   ├── initiate/
│       │   │   └── route.ts        # EasyPaisa payment initiation
│       │   └── verify-otp/
│       │       └── route.ts        # EasyPaisa OTP verification
│       └── jazzcash/
│           ├── initiate/
│           │   └── route.ts        # JazzCash payment initiation
│           └── verify-otp/
│               └── route.ts        # JazzCash OTP verification
├── hooks/
│   ├── usePayFast.ts               # PayFast React hook
│   ├── useEasyPaisa.ts             # EasyPaisa React hook
│   └── useJazzCash.ts              # JazzCash React hook
├── types/
│   ├── payfast.ts                  # PayFast TypeScript types
│   ├── easypaisa.ts                # EasyPaisa TypeScript types
│   └── jazzcash.ts                 # JazzCash TypeScript types
├── components/
│   └── OTPVerificationModal.tsx    # Reusable OTP modal
└── app/(customer)/checkout/
    └── page.tsx                    # Checkout page with payment flow
```

---

## Environment Variables Summary

```env
# PayFast Configuration
PAYFAST_MERCHANT_ID=
PAYFAST_MERCHANT_KEY=
PAYFAST_PASSPHRASE=
NEXT_PUBLIC_PAYFAST_RETURN_URL=
NEXT_PUBLIC_PAYFAST_CANCEL_URL=
NEXT_PUBLIC_PAYFAST_NOTIFY_URL=

# EasyPaisa Configuration
EASYPAISA_STORE_ID=
EASYPAISA_STORE_PASSWORD=
EASYPAISA_ACCOUNT_NUMBER=
EASYPAISA_API_URL=https://easypaisa.com.pk/api/v1
NEXT_PUBLIC_EASYPAISA_CALLBACK_URL=

# JazzCash Configuration
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
JAZZCASH_API_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0
NEXT_PUBLIC_JAZZCASH_RETURN_URL=

# General
NEXT_PUBLIC_WEBSITE_URL=
NEXT_PUBLIC_API_URL=
```

---

## Troubleshooting

### Common Issues

1. **"Payment system not configured"**
   - Check that all required environment variables are set
   - Restart the development server after adding env vars

2. **"Invalid mobile number format"**
   - Mobile number must be in format: 03XXXXXXXXX (11 digits)
   - Only Pakistani mobile numbers are supported

3. **"OTP verification failed"**
   - In development, use OTP starting with `1` or `123456`
   - In production, ensure the OTP is entered within the expiry window

4. **PayFast popup not opening**
   - Check that PayFast script is loaded (isPayFastLoaded state)
   - Verify merchant credentials are correct
   - Check browser console for script loading errors

5. **Order not created after payment**
   - Check network tab for `/order/cartcreate` request
   - Verify backend is receiving the payment_status and payment_id
   - Check server logs for validation errors
