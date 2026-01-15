# 🎭 Demo Accounts - Quick Reference

## 📋 Account Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 👤 **Client** | `client@gemotc.demo` | `client123` | `/client/dashboard` |
| 💼 **Dealer** | `dealer@gemotc.demo` | `dealer123` | `/dealer/dashboard` |
| ⚙️ **Admin** | `admin@gemotc.demo` | `admin123` | `/admin/dashboard` |

## 🚀 Quick Start

### Option 1: One-Click Login (Easiest)
```
1. Visit: http://localhost:3000/demo
2. Click any account card
3. Auto-login → Dashboard
```

### Option 2: Login Page
```
1. Visit: http://localhost:3000/auth/login
2. Click "🎭 Show demo accounts"
3. Click "Use this account"
4. Auto-login → Dashboard
```

### Option 3: Manual
```
1. Visit: http://localhost:3000/auth/login
2. Enter email and password
3. Click "Sign in"
4. Redirect → Dashboard
```

## 🎯 What Each Role Can Do

### 👤 Client
- View trading metrics
- Request quotes
- View trade history
- Manage wallet
- Account settings

### 💼 Dealer
- Real-time metrics (with animations!)
- Manage quote queue
- Approve/reject trades
- 2FA trade approval (code: `123456`)
- View trade details

### ⚙️ Admin
- Update exchange rates
- 2FA rate confirmation (code: `123456`)
- Manage users
- Suspend accounts
- View audit logs

## 🎨 Special Features to Test

### Dealer Dashboard
- **Pulse animations** on metrics
- **Vivid Violet glow** on new quotes (fades after 5s)
- **Number rolling** animations
- **Two-step approval** modal

### Admin Dashboard
- **Neon Lime flash** on successful rate save
- **Multi-step suspend** confirmation
- **2FA modal** for critical actions

## 🔐 2FA Demo Codes

All 2FA prompts accept: `123456`

## 📱 Pages to Visit

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Landing page with demo link |
| Demo | `/demo` | All demo accounts showcase |
| Login | `/auth/login` | Login with demo toggle |
| Client | `/client/dashboard` | Client trading dashboard |
| Dealer | `/dealer/dashboard` | Dealer operations |
| Admin | `/admin/dashboard` | System administration |

## ✨ Implementation Details

### Files Created
- `lib/demo-accounts.ts` - Account definitions
- `components/demo-accounts-card.tsx` - Reusable card component
- `app/demo/page.tsx` - Dedicated demo page
- Updated `app/auth/login/page.tsx` - Added demo toggle
- Updated `app/page.tsx` - Added demo link

### Features
- ✅ Auto-fill credentials
- ✅ One-click login
- ✅ Copy to clipboard
- ✅ Role-based routing
- ✅ Visual feedback
- ✅ Responsive design

## 🎬 Demo Flow

```
Homepage
   ↓
Click "Try Demo"
   ↓
Demo Page (3 account cards)
   ↓
Click any card
   ↓
Auto-redirect to Login
   ↓
Auto-login
   ↓
Role-specific Dashboard
```

## 💡 Tips

1. **Start with Client** - Easiest to understand
2. **Then try Dealer** - See the cool animations
3. **Finally Admin** - Test critical actions
4. **Use /demo page** - Fastest way to switch roles
5. **Check animations** - Pulse, glow, flash effects

## 🐛 Known Limitations

- Demo data doesn't persist
- Some features need backend (coming soon)
- 2FA is simulated (always accepts `123456`)
- No real transactions

## 📞 Support

If you encounter issues:
1. Check browser console
2. Clear cache and reload
3. Try incognito mode
4. Use the `/demo` page

---

**Ready to test? Visit [/demo](/demo) now! 🚀**
