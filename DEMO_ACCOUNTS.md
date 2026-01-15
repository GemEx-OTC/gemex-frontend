# 🎭 GemOTC Demo Accounts

## Quick Access

Visit **[/demo](/demo)** to see all demo accounts with one-click login.

## Available Demo Accounts

### 👤 Client Account
**Role:** Client/Trader  
**Email:** `client@gemotc.demo`  
**Password:** `client123`  
**Dashboard:** `/client/dashboard`

**Features:**
- View trading dashboard with metrics
- Request new quotes for crypto/fiat trades
- View trade history
- Manage wallet addresses
- Account settings

---

### 💼 Dealer Account
**Role:** Dealer/Operator  
**Email:** `dealer@gemotc.demo`  
**Password:** `dealer123`  
**Dashboard:** `/dealer/dashboard`

**Features:**
- Real-time metrics with live updates
- Quote queue management
- Approve/reject trade requests
- Two-factor authentication for approvals
- Trade processing dashboard

---

### ⚙️ Admin Account
**Role:** System Administrator  
**Email:** `admin@gemotc.demo`  
**Password:** `admin123`  
**Dashboard:** `/admin/dashboard`

**Features:**
- System-wide settings management
- Exchange rate controls with 2FA
- User management (verify, suspend)
- Audit logs
- Full system access

---

## How to Use Demo Accounts

### Method 1: Demo Page (Recommended)
1. Visit `/demo` or click "Try Demo" on the homepage
2. Click on any account card to auto-login
3. You'll be redirected to the role-specific dashboard

### Method 2: Login Page
1. Go to `/auth/login`
2. Click "🎭 Show demo accounts" at the bottom
3. Click "Use this account" on any demo account
4. Auto-login will occur

### Method 3: Manual Entry
1. Go to `/auth/login`
2. Enter the email and password from the table above
3. Click "Sign in"
4. You'll be redirected to the appropriate dashboard

---

## Features by Role

### Client Features
- ✅ Trading dashboard with balance and metrics
- ✅ Request quote form (multi-step)
- ✅ Trade history with status filters
- ✅ Wallet management
- ✅ Account settings

### Dealer Features
- ✅ Real-time metrics with pulse animations
- ✅ Quote queue with Vivid Violet glow for new requests
- ✅ Trade detail view with comprehensive information
- ✅ Two-step approval modal with 2FA (demo code: 123456)
- ✅ Filterable quote management

### Admin Features
- ✅ Exchange rate management with 2FA confirmation
- ✅ User management with search and filters
- ✅ Multi-step suspend user confirmation
- ✅ System settings
- ✅ Audit logs (basic implementation)

---

## Demo Data

All demo accounts come with:
- Pre-populated metrics and data
- Sample transactions and quotes
- Realistic user information
- Full feature access

**Note:** Demo data is not persisted and will reset periodically.

---

## Testing Workflows

### Client Workflow
1. Login as client
2. View dashboard metrics
3. Click "Request New Quote"
4. Fill out quote form
5. View in trade history

### Dealer Workflow
1. Login as dealer
2. View real-time metrics (watch the pulse animations!)
3. Go to Quote Queue
4. See new quotes with Vivid Violet glow
5. Click on a quote to expand
6. Click "Approve Quote"
7. Go to Trades and select a trade
8. Click "Approve Trade"
9. Complete 2FA confirmation (code: 123456)

### Admin Workflow
1. Login as admin
2. Go to Settings
3. Update exchange rates
4. Complete 2FA confirmation (code: 123456)
5. Watch for Neon Lime success flash
6. Go to Users
7. Search/filter users
8. Click "Suspend" on a user
9. Complete multi-step confirmation

---

## Security Notes

### Demo Environment
- ✅ No real money or crypto involved
- ✅ All transactions are simulated
- ✅ Data resets periodically
- ✅ Safe for testing and exploration

### 2FA Demo Codes
For testing 2FA features, use:
- **Dealer Trade Approval:** `123456`
- **Admin Rate Changes:** `123456`

---

## Troubleshooting

### Can't login?
- Make sure you're using the exact email and password
- Try using the demo page for one-click login
- Clear browser cache and try again

### Wrong dashboard?
- Each role redirects to its specific dashboard
- Client → `/client/dashboard`
- Dealer → `/dealer/dashboard`
- Admin → `/admin/dashboard`

### Features not working?
- Demo accounts have full access to all features
- Some features require backend integration (coming soon)
- Check browser console for any errors

---

## Next Steps

### For Testing
1. Try all three roles to see different perspectives
2. Test the complete workflows listed above
3. Explore all dashboard features
4. Test responsive design on mobile

### For Development
1. Demo accounts are defined in `lib/demo-accounts.ts`
2. Validation logic in `validateDemoAccount()`
3. Add more demo accounts by extending the `DEMO_ACCOUNTS` object

### For Production
When ready for production:
1. Create a real account via signup
2. Complete KYC verification
3. Connect real payment methods
4. Start trading with real funds

---

## Quick Links

- 🏠 [Home](/)
- 🎭 [Demo Accounts](/demo)
- 🔐 [Login](/auth/login)
- 📝 [Sign Up](/auth/signup)
- 👤 [Client Dashboard](/client/dashboard)
- 💼 [Dealer Dashboard](/dealer/dashboard)
- ⚙️ [Admin Dashboard](/admin/dashboard)

---

**Happy Testing! 🚀**
