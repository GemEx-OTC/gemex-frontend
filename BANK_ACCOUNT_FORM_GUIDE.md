# Bank Account Form - Quick Guide

## 🎯 Purpose
Allow clients to link their Nigerian bank account for receiving Naira payouts from crypto trades.

## 📍 Location
**Settings Page**: `/client/settings`
- First section (prominent placement)
- Purple gradient background (brand colors)
- Above profile and notification settings

## 🎨 Visual Design

### Form Layout
```
┌─────────────────────────────────────────────────────┐
│  Naira Payout Account                    [✓ Saved!] │
│  Add your Nigerian bank account to receive...       │
│                                                      │
│  Select Bank                                         │
│  [Choose your bank ▼]                               │
│                                                      │
│  Account Number                                      │
│  [0123456789]                    [Verify]           │
│                                                      │
│  ┌──────────────────────────────────────┐          │
│  │ ✓ Account Name                        │          │
│  │   John Doe                            │          │
│  └──────────────────────────────────────┘          │
│                                                      │
│  [Save Bank Account]                                │
│                                                      │
│  🔒 Security Note: Your bank account details...     │
└─────────────────────────────────────────────────────┘
```

## 🔄 User Flow

### Step 1: Select Bank
```
User clicks dropdown
  ↓
Sees 22 Nigerian banks
  ↓
Selects their bank (e.g., "GTBank")
  ↓
Dropdown closes, bank selected
```

### Step 2: Enter Account Number
```
User types in account number field
  ↓
Only numbers allowed (auto-filtered)
  ↓
Maximum 10 digits
  ↓
Verify button enables when 10 digits entered
```

### Step 3: Verify Account
```
User clicks "Verify" button
  ↓
Button shows "Verifying..." with spinner
  ↓
API call to bank verification service (1.5s mock)
  ↓
Success: Account name appears in green card
Error: Red alert with error message
```

### Step 4: Save Account
```
User reviews account name
  ↓
Clicks "Save Bank Account"
  ↓
Success checkmark appears
  ↓
Account saved for future payouts
```

## 🎭 States & Feedback

### 1. Initial State
- Empty dropdown: "Choose your bank"
- Empty account number field
- Verify button: Disabled (gray)
- No account name card
- No save button

### 2. Bank Selected
- Dropdown shows selected bank
- Account number field active
- Verify button: Still disabled
- Waiting for 10 digits

### 3. Ready to Verify
- Bank selected ✓
- 10 digits entered ✓
- Verify button: Enabled (Neon Lime)
- Hover effect active

### 4. Verifying
- Verify button: "Verifying..." + spinner
- Button disabled
- User waits ~1.5 seconds

### 5. Verified Success
- Green card appears with checkmark
- Shows: "Account Name: John Doe"
- Verify button returns to normal
- "Save Bank Account" button appears

### 6. Verification Error
- Red alert appears
- Shows error message
- Verify button returns to normal
- User can try again

### 7. Saved
- Checkmark appears next to title
- "Saved!" text shows briefly
- Form remains filled
- User can edit and re-save

## 🎨 Color Coding

### Success (Green)
- Account name card: `bg-[#C8F55A]/10`
- Border: `border-[#C8F55A]/30`
- Checkmark: `text-[#C8F55A]`

### Error (Red)
- Error alert: `bg-red-500/10`
- Border: `border-red-500/30`
- Icon: `text-red-400`

### Primary (Purple)
- Form background: `from-[#641AE4]/20 to-[#9A24D2]/10`
- Border: `border-[#641AE4]/40`

### Buttons
- Verify: `bg-[#C8F55A]` (Neon Lime)
- Save: `bg-[#C8F55A]` (Neon Lime)
- Disabled: `opacity-50`

## 🔤 Input Validation

### Bank Selection
```typescript
Required: Yes
Type: Dropdown
Options: 22 Nigerian banks
Validation: Must select one
Error: "Please select a bank"
```

### Account Number
```typescript
Required: Yes
Type: Text (numbers only)
Length: Exactly 10 digits
Pattern: /^\d{10}$/
Auto-format: Remove non-digits
Error: "Please enter a valid 10-digit account number"
```

### Account Name
```typescript
Required: Yes (auto-filled)
Type: Display only
Source: API verification
Editable: No
Validation: Must match bank records
```

## 🔌 API Integration

### Mock Implementation (Current)
```typescript
// Simulates bank verification API
setTimeout(() => {
  const mockNames = [
    "John Doe",
    "Jane Smith", 
    "Michael Johnson",
    "Sarah Williams",
    "David Brown"
  ]
  const randomName = mockNames[Math.floor(Math.random() * mockNames.length)]
  setBankDetails(prev => ({ ...prev, accountName: randomName }))
  setIsVerified(true)
}, 1500)
```

### Production Implementation (To Do)
```typescript
// Real bank verification API
const response = await fetch('/api/v1/bank/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bankCode: bankDetails.bankCode,
    accountNumber: bankDetails.accountNumber
  })
})

const data = await response.json()

if (data.success) {
  setBankDetails(prev => ({ ...prev, accountName: data.accountName }))
  setIsVerified(true)
} else {
  setVerificationError(data.message)
}
```

## 🎯 Validation Messages

### Success Messages
- ✅ "Account verified successfully"
- ✅ "Bank account saved"
- ✅ Shows account name in green card

### Error Messages
- ❌ "Please select a bank"
- ❌ "Please enter a valid 10-digit account number"
- ❌ "Account verification failed. Please try again"
- ❌ "Invalid account number for selected bank"
- ❌ "Please verify your account number first"

## 📱 Mobile Optimization

### Layout Changes
- Verify button below account number (stacked)
- Full-width inputs
- Larger touch targets (44px minimum)
- Dropdown optimized for mobile select

### Responsive Breakpoints
```css
/* Mobile: < 768px */
- Single column layout
- Stacked buttons
- Full-width cards

/* Desktop: ≥ 768px */
- Verify button inline with input
- Side-by-side layout possible
- Hover effects active
```

## 🔐 Security Features

### Display
- Security note at bottom of form
- Explains encryption
- Mentions bank verification API
- Builds user trust

### Implementation
- Frontend: Display only
- Backend: Encrypted storage
- API: Secure verification
- No sensitive data in localStorage

## 🧪 Testing Checklist

- [ ] Bank dropdown displays all 22 banks
- [ ] Account number accepts only digits
- [ ] Account number limited to 10 digits
- [ ] Verify button disabled until ready
- [ ] Verification shows loading state
- [ ] Success card appears after verification
- [ ] Error alert shows on failure
- [ ] Save button appears after verification
- [ ] Save shows success feedback
- [ ] Form works on mobile
- [ ] All animations smooth
- [ ] No console errors

## 💡 Tips for Users

### Displayed in UI:
1. "Select your bank from the dropdown"
2. "Enter your 10-digit account number"
3. "Click Verify to confirm your account"
4. "Review your account name"
5. "Click Save to link your account"

### Security Note:
"Your bank account details are encrypted and securely stored. We use bank verification APIs to ensure the account belongs to you."

## 🎬 Demo Flow

### Happy Path (30 seconds):
1. User opens Settings page (0s)
2. Scrolls to Bank Account section (2s)
3. Clicks bank dropdown (3s)
4. Selects "GTBank" (5s)
5. Types account number "0123456789" (10s)
6. Clicks "Verify" button (11s)
7. Waits for verification (12.5s)
8. Sees account name "John Doe" (13s)
9. Reviews information (15s)
10. Clicks "Save Bank Account" (16s)
11. Sees success checkmark (17s)
12. Done! ✓

### Error Path:
1. User enters wrong account number
2. Clicks Verify
3. Sees error: "Invalid account number"
4. Corrects the number
5. Clicks Verify again
6. Success!

---

**Form Status**: ✅ Fully Implemented  
**Location**: `/client/settings`  
**Dependencies**: NIGERIAN_BANKS constant  
**API**: Mock (ready for production integration)
