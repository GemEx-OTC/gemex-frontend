# Wallet Integration Guide

## 🔌 Backend Integration Checklist

### API Endpoints Needed

#### 1. Get Deposit Addresses
```typescript
GET /api/v1/wallets/deposit-addresses

Response: {
  success: true,
  data: {
    TRC20: "TXYZa1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5",
    BSC: "0x742d35Cc6634C0532925a3b844Bc9e7595f64c31",
    ERC20: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
  }
}
```

#### 2. Add Withdrawal Address
```typescript
POST /api/v1/wallets/withdrawal-address

Body: {
  network: "TRC20" | "BSC" | "ERC20" | "BTC",
  address: string
}

Response: {
  success: true,
  message: "Withdrawal address added successfully"
}
```

#### 3. Get Deposit History
```typescript
GET /api/v1/wallets/deposits?network=TRC20

Response: {
  success: true,
  data: [
    {
      id: string,
      network: "TRC20",
      asset: "USDT",
      amount: number,
      txHash: string,
      confirmations: number,
      requiredConfirmations: number,
      status: "pending" | "confirmed" | "failed",
      timestamp: string
    }
  ]
}
```

### Frontend Integration Steps

#### Step 1: Update Wallet Page Component
```typescript
// app/(dashboard)/client/wallet/page.tsx

import { useEffect, useState } from "react"

export default function WalletPage() {
  const [addresses, setAddresses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepositAddresses()
  }, [])

  const fetchDepositAddresses = async () => {
    try {
      const response = await fetch('/api/v1/wallets/deposit-addresses')
      const data = await response.json()
      setAddresses(data.data)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Rest of component...
}
```

#### Step 2: Update Onboarding Wallet Component
```typescript
// app/auth/onboard/wallet/page.tsx

const handleSubmit = async () => {
  if (walletAddress && !validateAddress()) return

  setLoading(true)
  try {
    const response = await fetch('/api/v1/wallets/withdrawal-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        network: walletType,
        address: walletAddress
      })
    })

    if (response.ok) {
      router.push("/auth/onboard/pending")
    } else {
      setError("Failed to save wallet address")
    }
  } catch (error) {
    setError("Network error. Please try again.")
  } finally {
    setLoading(false)
  }
}
```

### Tatum.io Integration

#### Generate Deposit Addresses
```typescript
// Backend: services/wallet.service.ts

import { TatumSDK, Network } from '@tatumio/tatum'

async function generateDepositAddress(userId: string, network: string) {
  const tatum = await TatumSDK.init({ network: Network.TRON })
  
  // Generate address based on network
  const address = await tatum.address.generateAddress()
  
  // Store in database with userId
  await WalletAddress.create({
    userId,
    network,
    address: address.address,
    privateKey: encrypt(address.privateKey), // Encrypt before storing!
    createdAt: new Date()
  })
  
  return address.address
}
```

#### Monitor Deposits
```typescript
// Backend: webhooks/tatum.webhook.ts

export async function handleTatumWebhook(req: Request) {
  const { address, amount, asset, txId, confirmations } = req.body
  
  // Find user by address
  const wallet = await WalletAddress.findOne({ address })
  if (!wallet) return
  
  // Create or update deposit record
  await Deposit.upsert({
    userId: wallet.userId,
    network: wallet.network,
    asset,
    amount,
    txHash: txId,
    confirmations,
    status: confirmations >= getRequiredConfirmations(wallet.network) 
      ? 'confirmed' 
      : 'pending'
  })
  
  // Notify user if confirmed
  if (confirmations >= getRequiredConfirmations(wallet.network)) {
    await notifyUser(wallet.userId, 'deposit_confirmed', { amount, asset })
  }
}
```

### Environment Variables

```env
# Tatum API
TATUM_API_KEY=your_tatum_api_key
TATUM_WEBHOOK_SECRET=your_webhook_secret

# Encryption
WALLET_ENCRYPTION_KEY=your_encryption_key_32_chars

# Network Confirmations
CONFIRMATIONS_TRC20=1
CONFIRMATIONS_BSC=15
CONFIRMATIONS_ERC20=12
CONFIRMATIONS_BTC=2
```

### Database Schema

```typescript
// models/WalletAddress.ts
interface WalletAddress {
  _id: ObjectId
  userId: ObjectId
  network: 'TRC20' | 'BSC' | 'ERC20' | 'BTC'
  address: string
  privateKey: string // Encrypted
  type: 'deposit' | 'withdrawal'
  createdAt: Date
  lastUsed?: Date
}

// models/Deposit.ts
interface Deposit {
  _id: ObjectId
  userId: ObjectId
  network: string
  asset: string
  amount: number
  txHash: string
  confirmations: number
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: Date
  confirmedAt?: Date
}
```

## 🔒 Security Considerations

### 1. Private Key Management
- ✅ Never expose private keys to frontend
- ✅ Encrypt private keys at rest
- ✅ Use HSM or KMS for production
- ✅ Implement key rotation policy

### 2. Address Validation
- ✅ Validate on both frontend and backend
- ✅ Use checksums for address verification
- ✅ Implement address whitelisting for withdrawals
- ✅ Require 2FA for withdrawal address changes

### 3. Deposit Monitoring
- ✅ Verify webhook signatures
- ✅ Implement idempotency for webhook processing
- ✅ Monitor for double-spend attempts
- ✅ Set minimum deposit amounts

### 4. Withdrawal Security
- ✅ Implement withdrawal limits
- ✅ Require email/SMS confirmation
- ✅ Add withdrawal cooldown period
- ✅ Monitor for suspicious patterns

## 📊 Monitoring & Alerts

### Metrics to Track
- Deposit confirmation times by network
- Failed deposit attempts
- Webhook processing delays
- Address generation failures
- Withdrawal request patterns

### Alerts to Set Up
- Deposit stuck in pending (> 1 hour)
- Webhook endpoint down
- Unusual withdrawal patterns
- Low hot wallet balance
- Failed Tatum API calls

## 🧪 Testing Checklist

### Unit Tests
- [ ] Address validation for each network
- [ ] Copy to clipboard functionality
- [ ] Network selection state management
- [ ] Error handling for API failures

### Integration Tests
- [ ] Deposit address generation
- [ ] Webhook processing
- [ ] Deposit confirmation flow
- [ ] Withdrawal address validation

### E2E Tests
- [ ] Complete deposit flow (testnet)
- [ ] Network switching
- [ ] Address copying
- [ ] Error states display

### Manual Testing
- [ ] Test on mobile devices
- [ ] Test with screen readers
- [ ] Test with slow network
- [ ] Test error scenarios

## 🚀 Deployment Steps

1. **Backend Setup**
   - Deploy Tatum webhook endpoint
   - Configure environment variables
   - Set up database indexes
   - Test webhook with Tatum testnet

2. **Frontend Deployment**
   - Update API endpoints
   - Test in staging environment
   - Verify all networks display correctly
   - Test copy functionality

3. **Monitoring Setup**
   - Configure logging
   - Set up alerts
   - Create dashboard for metrics
   - Test alert notifications

4. **Go Live**
   - Enable webhook in production
   - Monitor initial deposits
   - Verify confirmations working
   - Check user notifications

## 📚 Additional Resources

- [Tatum Documentation](https://docs.tatum.io/)
- [Bitcoin Address Formats](https://en.bitcoin.it/wiki/Address)
- [Ethereum Address Checksum](https://eips.ethereum.org/EIPS/eip-55)
- [Tron Address Format](https://developers.tron.network/docs/account)
- [BNB Chain Documentation](https://docs.bnbchain.org/)

## 🆘 Troubleshooting

### Issue: Addresses not loading
- Check API endpoint is accessible
- Verify authentication token
- Check network connectivity
- Review server logs

### Issue: Deposits not confirming
- Verify webhook is receiving events
- Check confirmation thresholds
- Review Tatum dashboard
- Verify transaction on blockchain explorer

### Issue: Copy not working
- Check browser permissions
- Test clipboard API support
- Verify HTTPS connection
- Try fallback copy method

### Issue: Wrong network selected
- Verify network validation logic
- Check default network setting
- Review user's last used network
- Test network switching
