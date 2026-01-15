# GemOTC Color System Guide

## Overview
This document outlines the improved color system for GemOTC that prioritizes readability, accessibility, and consistent user experience across all interfaces.

## Key Improvements Made

### 1. Enhanced Contrast Ratios
- **Before**: Purple (#641ae4) on dark backgrounds had poor contrast
- **After**: Lighter purple (#a855f7) with better contrast ratios
- **Result**: Improved text readability and accessibility compliance

### 2. Semantic Color Usage
- **Primary**: Used for main actions and brand elements
- **Secondary**: Used for success states and positive actions
- **Accent**: Used for information and secondary actions
- **Muted**: Used for less important text and backgrounds

### 3. Consistent Color Variables
All colors now use CSS custom properties that automatically adapt to light/dark themes.

## Color Palette

### Core Colors (Dark Mode)
```css
--background: #1a1a24        /* Main background */
--foreground: #f8f9fa        /* Primary text */
--card: #242438              /* Card backgrounds */
--muted: #2d2d42             /* Muted backgrounds */
--border: #374151            /* Borders and dividers */
```

### Brand Colors
```css
--primary: #a855f7           /* Purple - main brand color */
--secondary: #84cc16         /* Green - success/positive */
--accent: #3b82f6            /* Blue - information/secondary */
--destructive: #ef4444       /* Red - errors/warnings */
```

### Usage Guidelines

#### Primary Color (#a855f7)
- **Use for**: Main CTAs, active states, brand elements
- **Don't use for**: Large text blocks, backgrounds
- **Accessibility**: Meets WCAG AA standards for contrast

#### Secondary Color (#84cc16)
- **Use for**: Success messages, positive actions, highlights
- **Don't use for**: Error states, warnings
- **Best with**: Dark backgrounds for maximum impact

#### Accent Color (#3b82f6)
- **Use for**: Information, secondary actions, links
- **Don't use for**: Primary actions (use primary instead)
- **Pairs well with**: Neutral grays and whites

## Component Classes

### Buttons
```css
.gemex-button-primary    /* Primary actions */
.gemex-button-secondary  /* Success/positive actions */
.gemex-button-accent     /* Information/secondary actions */
.gemex-button-outline    /* Secondary importance */
.gemex-button-ghost      /* Minimal styling */
```

### Badges
```css
.gemex-badge-success     /* Green badges */
.gemex-badge-warning     /* Yellow badges */
.gemex-badge-error       /* Red badges */
.gemex-badge-info        /* Blue badges */
.gemex-badge-neutral     /* Gray badges */
```

### Cards
```css
.gemex-card              /* Standard card */
.gemex-card-elevated     /* Card with shadow */
```

## Accessibility Considerations

### Contrast Ratios
- **Text on background**: 7:1 (AAA level)
- **Interactive elements**: 4.5:1 minimum (AA level)
- **Large text**: 3:1 minimum (AA level)

### Color Blindness Support
- Never rely on color alone to convey information
- Use icons, text labels, and patterns alongside colors
- Test with color blindness simulators

## Migration Notes

### Replaced Hard-coded Colors
- `#641ae4` → `hsl(var(--primary))`
- `#9a24d2` → `hsl(var(--accent))`
- `#c8f55a` → `hsl(var(--secondary))`
- `#1e1e2b` → `hsl(var(--background))`
- `#f0f0f0` → `hsl(var(--foreground))`

### Component Updates
- All components now use semantic color classes
- Improved focus states and hover effects
- Better visual hierarchy through color usage

## Best Practices

### Do's
✅ Use semantic color variables instead of hex codes
✅ Test color combinations for accessibility
✅ Maintain consistent color usage across components
✅ Use the provided utility classes

### Don'ts
❌ Use hard-coded hex values in components
❌ Override color variables without consideration
❌ Use purple for large text areas
❌ Ignore contrast ratio requirements

## Testing
- Use browser dev tools to check contrast ratios
- Test with screen readers
- Verify color combinations in both light and dark modes
- Test with color blindness simulators

## Future Considerations
- Monitor user feedback on color choices
- Consider adding more semantic color variants if needed
- Keep accessibility standards updated
- Regular color contrast audits