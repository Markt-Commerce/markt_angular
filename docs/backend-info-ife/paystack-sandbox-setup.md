# Paystack Sandbox Setup & Testing Guide

## Overview
This guide provides step-by-step instructions for setting up and testing Paystack integration in the Markt backend sandbox environment.

## 1. Getting Paystack Sandbox Keys

### Step 1: Create Paystack Account
1. Visit [Paystack Dashboard](https://dashboard.paystack.com/)
2. Sign up for a new account
3. Complete email verification

### Step 2: Access Sandbox Environment
1. Login to Paystack Dashboard
2. Navigate to **Settings** → **API Keys & Webhooks**
3. Switch to **Test Mode** (toggle in top-right corner)
4. Copy your test keys:
   - **Secret Key**: `sk_test_...`
   - **Public Key**: `pk_test_...`

### Step 3: Configure Webhook URL
1. In the same section, add webhook URL:
   ```
   https://your-domain.com/payments/webhook/paystack
   ```
2. For local testing with ngrok:
   ```
   https://your-ngrok-url.ngrok.io/payments/webhook/paystack
   ```
3. Copy the webhook secret (will be shown after saving)

## 2. Environment Configuration

### Step 1: Update Environment Variables
Add these to your `.env` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYMENT_CURRENCY=NGN
PAYMENT_GATEWAY=paystack
```

### Step 2: Verify Configuration
The configuration is automatically loaded in `main/config.py`:

```python
# Payment Gateway Configuration (Paystack for Nigeria)
self.PAYSTACK_SECRET_KEY = config("PAYSTACK_SECRET_KEY", default="")
self.PAYSTACK_PUBLIC_KEY = config("PAYSTACK_PUBLIC_KEY", default="")
self.PAYMENT_CURRENCY = config("PAYMENT_CURRENCY", default="NGN")
self.PAYMENT_GATEWAY = config("PAYMENT_GATEWAY", default="paystack")
```

## 3. Testing Tools Setup

### Option 1: Postman Collection
Import the provided Postman collection from `POSTMAN_COLLECTION.md` which includes:
- Payment initialization
- Payment processing
- Payment verification
- Webhook testing

### Option 2: Ngrok for Local Testing
1. Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com/)
2. Start your Flask app: `python main/run.py`
3. Expose your local server:
   ```bash
   ngrok http 8000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update webhook URL in Paystack dashboard

### Option 3: CLI Testing Script
Create a test script for automated testing:

```python
# test_payments.py
import requests
import json

BASE_URL = "http://localhost:8000"
PAYSTACK_PUBLIC_KEY = "pk_test_your_key"

def test_payment_flow():
    # 1. Initialize payment
    init_data = {
        "order_id": "test_order_123",
        "amount": 1000.00,
        "currency": "NGN",
        "method": "card"
    }
    
    response = requests.post(
        f"{BASE_URL}/payments/initialize",
        json=init_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        payment_data = response.json()
        print(f"Payment initialized: {payment_data}")
        
        # 2. Use Paystack test card
        test_card_data = {
            "authorization_code": "AUTH_test123",
            "reference": payment_data["reference"]
        }
        
        # 3. Process payment
        process_response = requests.post(
            f"{BASE_URL}/payments/{payment_data['payment_id']}/process",
            json=test_card_data
        )
        
        print(f"Payment processed: {process_response.json()}")
    else:
        print(f"Initialization failed: {response.text}")

if __name__ == "__main__":
    test_payment_flow()
```

## 4. Test Transaction Flow

### Step 1: Create Test Order
```bash
curl -X POST http://localhost:8000/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_id": "test_buyer_123",
    "items": [{"product_id": "test_product_123", "quantity": 1}],
    "shipping_address": "Test Address"
  }'
```

### Step 2: Initialize Payment
```bash
curl -X POST http://localhost:8000/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "order_id_from_step_1",
    "amount": 1000.00,
    "currency": "NGN",
    "method": "card"
  }'
```

### Step 3: Use Test Cards
Paystack provides these test cards:

| Card Number | Expiry | CVV | PIN | OTP | Expected Result |
|-------------|--------|-----|-----|-----|-----------------|
| 4084 0840 8408 4081 | 01/25 | 408 | 4081 | 123456 | Success |
| 4084 0840 8408 4082 | 01/25 | 408 | 4081 | 123456 | Failed |
| 4084 0840 8408 4083 | 01/25 | 408 | 4081 | 123456 | Insufficient Funds |

### Step 4: Process Payment
```bash
curl -X POST http://localhost:8000/payments/{payment_id}/process \
  -H "Content-Type: application/json" \
  -d '{
    "authorization_code": "AUTH_test123",
    "reference": "payment_reference"
  }'
```

### Step 5: Verify Payment
```bash
curl -X GET http://localhost:8000/payments/{payment_id}/verify
```

## 5. Webhook Testing

### Step 1: Simulate Webhook
Use Paystack's webhook simulator or send test payload:

```bash
curl -X POST http://localhost:8000/payments/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "X-Paystack-Signature: computed_signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "payment_reference",
      "amount": 100000,
      "status": "success"
    }
  }'
```

### Step 2: Verify Webhook Signature
The system automatically verifies webhook signatures using HMAC SHA512:

```python
# From PaymentService._verify_webhook_signature()
computed_signature = hmac.new(
    PAYSTACK_SECRET_KEY.encode("utf-8"),
    str(payload).encode("utf-8"),
    hashlib.sha512,
).hexdigest()
```

### Step 3: Test Different Events
- `charge.success` - Successful payment
- `charge.failed` - Failed payment
- `transfer.success` - Successful transfer (for payouts)

## 6. Error Handling & Debugging

### Common Issues

1. **Invalid Secret Key**
   ```
   Error: Invalid secret key
   Solution: Verify PAYSTACK_SECRET_KEY in .env
   ```

2. **Webhook Signature Mismatch**
   ```
   Error: Invalid webhook signature
   Solution: Check PAYSTACK_WEBHOOK_SECRET and payload format
   ```

3. **Order Not Found**
   ```
   Error: Order not found
   Solution: Ensure order exists and is in PENDING status
   ```

### Debug Mode
Enable debug logging in `main/config.py`:

```python
self.DEBUG = config("DEBUG", default=True, cast=bool)
```

### Log Monitoring
Check logs for payment processing:

```bash
tail -f logs/app.log | grep -i payment
```

## 7. Production Checklist

Before going live:

- [ ] Switch to live Paystack keys
- [ ] Update webhook URL to production domain
- [ ] Test with real card (small amount)
- [ ] Verify webhook signature validation
- [ ] Test error scenarios
- [ ] Monitor payment logs
- [ ] Set up payment alerts

## 8. Security Best Practices

1. **Never commit keys to version control**
2. **Use environment variables for all secrets**
3. **Validate webhook signatures**
4. **Log payment events for audit**
5. **Implement proper error handling**
6. **Use HTTPS in production**
7. **Regular security audits**

## 9. Monitoring & Analytics

### Payment Metrics to Track
- Success rate
- Average transaction value
- Failed payment reasons
- Webhook delivery success
- Processing time

### Alerts to Set Up
- Failed webhook deliveries
- High failure rates
- Unusual transaction patterns
- System errors

## 10. Support Resources

- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/support)
- [Test Cards Reference](https://paystack.com/docs/testing)
- [Webhook Testing Guide](https://paystack.com/docs/webhooks)

---

**Note**: Always test thoroughly in sandbox before going live. The sandbox environment is identical to production but uses test cards and doesn't process real money.  this is the next 