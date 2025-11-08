# Test Razorpay Webhook

## Test Webhook Locally

You can test the webhook by sending a POST request with this payload:

```bash
curl -X POST https://zbcncpmhumhgbydcsfyp.supabase.co/functions/v1/razorpay-webhook \
  -H "Content-Type: application/json" \
  -H "x-razorpay-signature: YOUR_SIGNATURE_HERE" \
  -d '{
    "event": "payment.captured",
    "payload": {
      "payment": {
        "entity": {
          "id": "pay_test123",
          "amount": 99900,
          "currency": "INR",
          "status": "captured",
          "email": "test@example.com",
          "contact": "+919876543210"
        }
      }
    }
  }'
```

## Generate Test Signature

To generate a valid signature for testing:

```javascript
const crypto = require('crypto');

const webhookSecret = 'YOUR_RAZORPAY_WEBHOOK_SECRET';
const payload = JSON.stringify({
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test123",
        amount: 99900,
        currency: "INR",
        status: "captured",
        email: "test@example.com",
        contact: "+919876543210"
      }
    }
  }
});

const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('hex');

console.log('Signature:', signature);
```

## Check Database Before Testing

Before testing, create a pending payment in the database:

```sql
-- Check if a pending payment exists for test user
SELECT * FROM payments 
WHERE status = 'pending' 
AND email = 'test@example.com'
ORDER BY created_at DESC 
LIMIT 1;

-- If not, you need to go through the normal flow first:
-- 1. Fill the payment form
-- 2. Click "Proceed to Payment"
-- This will create the pending payment record
```

## Verify After Webhook

After the webhook is triggered, check:

```sql
-- Check payment was updated
SELECT * FROM payments 
WHERE provider_payment_id = 'pay_test123';

-- Check user was enrolled
SELECT id, name, email, enrolled, cohort_start, cohort_end 
FROM profiles 
WHERE email = 'test@example.com';

-- Check referral points (if applicable)
SELECT * FROM referrals 
WHERE referee_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
```

## Common Issues

1. **"No signature provided"** - Add `x-razorpay-signature` header
2. **"Invalid signature"** - Ensure webhook secret matches Razorpay dashboard
3. **"No matching payment found"** - Create pending payment first by going through the normal flow
4. **Email mismatch** - Ensure email in webhook matches email in pending payment

## Test Checklist

- [ ] Webhook secret is configured in Lovable Cloud
- [ ] Webhook is configured in Razorpay Dashboard
- [ ] Pending payment created (via normal flow)
- [ ] Email matches between pending payment and webhook
- [ ] Amount matches (within 1% tolerance)
- [ ] Payment status updates to 'completed'
- [ ] User enrolled = true
- [ ] Cohort dates are set
- [ ] Referral points awarded (if applicable)
