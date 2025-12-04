# Wallet Feature - Quick Reference Card

## 🎯 What Changed

### Before
- Single Ethereum wallet address
- No network selection
- Basic UI

### After
- **4 networks**: TRC20, BSC, ERC20, BTC
- Network-specific addresses and information
- Professional, safe UX

## 🌐 Supported Networks

| Network | Assets | Confirmations | Avg Time | Fees |
|---------|--------|---------------|----------|------|
| **TRC20** | USDT | 1 | ~1 min | Very Low |
| **BSC** | USDT, USDC | 15 | ~3 min | Low |
| **ERC20** | USDT, USDC | 12 | ~3 min | Medium |
| **BTC** | BTC | 2 | ~20 min | Variable |

## 🎨 Network Colors

- **TRC20**: Red `#FF0013` (Tron)
- **BSC**: Yellow `#F3BA2F` (BNB)
- **ERC20**: Blue `#627EEA` (Ethereum)
- **BTC**: Orange `#F7931A` (Bitcoin)

## 📍 Address Formats

```typescript
TRC20:  "TXYZa1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5"  // Starts with 'T'
BSC:    "0x742d35Cc6634C0532925a3b844Bc9e7595f64c31" // Starts with '0x'
ERC20:  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063" // Starts with '0x'
BTC:    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" // bc1, 1, or 3
```

## 🔐 Validation Rules

### TRC20
- Must start with 'T'
- Minimum 26 characters
- Base58 encoded

### BSC / ERC20
- Must start with '0x'
- Exactly 42 characters
- Hexadecimal

### BTC
- Must start with 'bc1', '1', or '3'
- Minimum 26 characters
- Base58 or Bech32

## 🎯 User Journey

### Deposit Flow
1. Navigate to Wallet page
2. Select network
3. Copy address
4. Send crypto from external wallet
5. Wait for confirmations
6. Balance updates automatically

### Withdrawal Setup (Onboarding)
1. Reach wallet step in KYC
2. Select network
3. Enter withdrawal address
4. Validate format
5. Save or skip
6. Continue to next step

## 🚨 Safety Features

### Warnings Displayed
- ✅ Network selection importance
- ✅ Consequences of wrong network
- ✅ Asset compatibility per network
- ✅ Minimum deposit requirements

### Validation
- ✅ Real-time format checking
- ✅ Network-specific rules
- ✅ Clear error messages
- ✅ Visual feedback

## 💡 UX Highlights

### Visual Feedback
- Network selection with checkmarks
- Copy button state changes
- Smooth animations between networks
- Color-coded network cards

### Information Display
- Network details in grid layout
- Step-by-step deposit guide
- Important notes section
- Educational content

### Responsive Design
- Mobile-friendly layouts
- Touch-optimized buttons
- Readable on all screens
- Adaptive grid columns

## 🔌 Integration Points

### Frontend
```typescript
// Fetch deposit addresses
GET /api/v1/wallets/deposit-addresses

// Save withdrawal address
POST /api/v1/wallets/withdrawal-address
```

### Backend Services
- **Tatum.io**: Address generation & monitoring
- **Webhook**: Deposit confirmations
- **Database**: Address storage
- **Notifications**: Deposit alerts

## 📊 Metrics to Track

- Network selection distribution
- Copy button usage
- Time spent on page
- Validation errors by network
- Deposit success rate per network

## 🐛 Common Issues

### Address not copying
- Check browser clipboard permissions
- Verify HTTPS connection
- Test on different browsers

### Wrong network selected
- Verify default network logic
- Check user's last used network
- Review network switching code

### Validation failing
- Check regex patterns
- Verify address format
- Test with known valid addresses

## 📱 Mobile Considerations

- Single column layout on mobile
- Larger touch targets (min 44px)
- Readable font sizes (min 16px)
- Collapsible sections
- Bottom sheet for network selection

## ✅ Testing Checklist

- [ ] All networks display correctly
- [ ] Copy functionality works
- [ ] Network switching is smooth
- [ ] Validation catches invalid addresses
- [ ] Mobile layout is responsive
- [ ] Animations perform well
- [ ] Error states display properly
- [ ] Loading states work

## 🚀 Deployment Notes

1. No breaking changes to existing code
2. Backward compatible with current API
3. Ready for gradual rollout
4. Feature flag recommended
5. Monitor user feedback closely

## 📞 Support Resources

- **Documentation**: See `WALLET_IMPROVEMENTS.md`
- **Integration Guide**: See `WALLET_INTEGRATION_GUIDE.md`
- **Backend Spec**: See `BACKEND_ALIGNMENT_SUMMARY.md`
- **Design System**: See `GemEx Color Guide (Web App).pdf`

---

**Last Updated**: December 4, 2024  
**Version**: 2.0  
**Status**: ✅ Ready for Integration
