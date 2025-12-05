# Onboarding Flow Fix

## 🐛 Problem

Build was failing with error:
```
The export KYCProgressBar was not found in module kyc-progress-bar.tsx
Did you mean to import KycProgressBar?
```

## ✅ Solution

Fixed the import/export mismatch and configured signup to walk users through the complete onboarding process.

## 🔧 Changes Made

### 1. Fixed Import Names

**Component Export:**
```tsx
// components/kyc-progress-bar.tsx
export function KycProgressBar({ currentStep, totalSteps }: KycProgressBarProps)
```

**Fixed Imports in:**
- `app/auth/onboard/personal/page.tsx`
- `app/auth/onboard/document/page.tsx`
- `app/auth/onboard/wallet/page.tsx`

**Before:**
```tsx
import { KYCProgressBar } from "@/components/kyc-progress-bar"
<KYCProgressBar currentStep={1} totalSteps={4} />
```

**After:**
```tsx
import { KycProgressBar } from "@/components/kyc-progress-bar"
<KycProgressBar currentStep={1} totalSteps={4} />
```

### 2. Updated Signup Flow

**Before:**
```tsx
window.location.href = "/auth/onboard/kyc-start"
```

**After:**
```tsx
window.location.href = "/auth/onboard/personal"
```

## 🔄 Complete Onboarding Flow

### User Journey

```
1. Sign Up (/auth/signup)
   ↓
2. Personal Details (/auth/onboard/personal)
   - Step 1 of 4
   - Name, DOB, Phone, Address
   ↓
3. Document Upload (/auth/onboard/document)
   - Step 2 of 4
   - ID verification (Passport/License/National ID)
   ↓
4. Wallet Setup (/auth/onboard/wallet)
   - Step 3 of 4
   - Optional withdrawal wallet
   ↓
5. Pending Review (/auth/onboard/pending)
   - Step 4 of 4
   - Verification in progress
   ↓
6. Dashboard (/client/dashboard)
   - Account verified, ready to trade
```

### Progress Indicator

Each step shows:
```
Step X of 4
[Progress Bar] XX% Complete
```

## 📝 Onboarding Steps Detail

### Step 1: Personal Details
**Fields:**
- First Name *
- Last Name *
- Date of Birth * (18+ validation)
- Phone Number *
- Street Address *
- City *
- State *
- Postal Code
- Country *

**Validation:**
- All required fields must be filled
- Age must be 18 or older
- Real-time error messages

### Step 2: Document Upload
**Options:**
- Passport (front only)
- Driver's License (front + back)
- National ID (front + back)

**Features:**
- Drag & drop upload
- File preview
- Size display
- Neon lime flash on success
- Tips for best results

### Step 3: Wallet Setup
**Networks:**
- TRC20 (Tron) - USDT
- BSC (BNB Chain) - USDT, USDC
- ERC20 (Ethereum) - USDT, USDC
- BTC (Bitcoin) - BTC

**Features:**
- Network-specific validation
- Optional (can skip)
- Copy to clipboard
- Security notes

### Step 4: Pending Review
**Display:**
- Rotating violet ring animation
- Status checklist
- Email/SMS notification info
- 24-hour timeline
- Links to dashboard

## ✨ Benefits

### User Experience
- ✅ Clear progress indication
- ✅ Step-by-step guidance
- ✅ Can't skip required steps
- ✅ Optional wallet setup
- ✅ Visual feedback throughout

### Developer Experience
- ✅ No build errors
- ✅ Consistent naming
- ✅ Clear flow logic
- ✅ Easy to maintain

### Business Benefits
- ✅ Complete KYC collection
- ✅ Higher completion rates
- ✅ Compliant onboarding
- ✅ Better user data

## 🧪 Testing Checklist

- [x] Build succeeds without errors
- [x] Signup redirects to personal details
- [x] Progress bar shows correct step
- [x] Personal details validation works
- [x] Document upload functions
- [x] Wallet setup is optional
- [x] Pending page displays correctly
- [x] All imports resolved correctly

## 🔍 Technical Details

### Import Resolution

**Issue:**
- JavaScript/TypeScript is case-sensitive
- `KYCProgressBar` ≠ `KycProgressBar`
- Build fails on import mismatch

**Solution:**
- Match import name to export name exactly
- Use consistent naming convention
- Prefer PascalCase for components

### Naming Convention

**Component File:**
```
kyc-progress-bar.tsx (kebab-case)
```

**Component Name:**
```tsx
KycProgressBar (PascalCase, lowercase 'yc')
```

**Why lowercase 'yc'?**
- Follows React naming conventions
- Only first letter of each word capitalized
- KYC is treated as one word: Kyc

## 📊 Flow Diagram

```
┌─────────────┐
│   Sign Up   │
└──────┬──────┘
       │
       ↓
┌─────────────────────┐
│ Personal Details    │ Step 1/4
│ ✓ Name, DOB, etc.   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Document Upload     │ Step 2/4
│ ✓ ID Verification   │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Wallet Setup        │ Step 3/4
│ ⊘ Optional          │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Pending Review      │ Step 4/4
│ ⏳ Verification     │
└──────┬──────────────┘
       │
       ↓
┌─────────────────────┐
│ Dashboard           │
│ ✓ Ready to Trade    │
└─────────────────────┘
```

## 💡 Future Enhancements

### Potential Improvements
1. Save progress (resume later)
2. Email verification step
3. Phone number verification (SMS)
4. Bank account verification
5. Address proof upload
6. Selfie verification
7. Video KYC option

### Backend Integration
```typescript
// Step 1: Save personal details
POST /api/v1/kyc/personal
Body: { firstName, lastName, dateOfBirth, ... }

// Step 2: Upload documents
POST /api/v1/kyc/documents
Body: FormData with files

// Step 3: Save wallet address
POST /api/v1/kyc/wallet
Body: { network, address }

// Step 4: Submit for review
POST /api/v1/kyc/submit
Response: { status: "pending", estimatedTime: "24h" }
```

---

**Status**: ✅ Fixed  
**Build**: Passing  
**Flow**: Complete  
**Ready for**: Production
