# Dark Mode & Animations Guide

## Overview
This portfolio website now features a complete dark mode implementation with futuristic animations and modern visual effects.

## Dark Mode Features

### Theme Provider
- **Location**: `components/theme-provider.tsx`
- **Implementation**: Uses `next-themes` for seamless theme switching
- **Detection**: Automatically detects system preferences
- **Persistence**: Saves user preference to localStorage

### Theme Toggle Button
- **Location**: `components/theme-toggle.tsx`
- **Placement**: 
  - Header (public pages)
  - Admin layout top bar
- **Features**:
  - Smooth transition between light/dark modes
  - Icon changes (Sun ☀️ / Moon 🌙)
  - Hover and active animations

### Color Schemes

#### Light Mode (Default)
- **Background**: White (#ffffff)
- **Foreground**: Near black (#0a0a0a)
- **Card**: Light gray (#f8f8f8)
- **Primary**: Black (#0a0a0a)
- **Accent**: Blue (#3b82f6)

#### Dark Mode
- **Background**: Near black (#0a0a0a)
- **Foreground**: White (#ffffff)
- **Card**: Dark gray (#1a1a1a)
- **Primary**: White (#ffffff)
- **Accent**: Light blue (#60a5fa)

### CSS Variables
All colors are defined as CSS custom properties in `app/globals.css`:
```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --primary: #0a0a0a;
  --accent: #3b82f6;
  /* ... more variables */
}

.dark {
  --background: #0a0a0a;
  --foreground: #ffffff;
  --primary: #ffffff;
  --accent: #60a5fa;
  /* ... more variables */
}
```

## Animation System

### Framer Motion Animations
Using `framer-motion` for smooth, declarative animations throughout the site.

#### Key Animations

1. **Fade In Up** (`fadeInUp`)
   - Elements fade in while moving up
   - Used for section headings and content
   - Duration: 0.6s

2. **Fade In Down** (`fadeInDown`)
   - Elements fade in while moving down
   - Used for headers and navigation

3. **Glow Pulse** (`glowPulse`)
   - Smooth pulsing glow effect
   - Applied to accent elements
   - Duration: 2s, infinite loop

4. **Float** (`float`)
   - Floating animation (vertical movement)
   - Used for emoji icons and background elements
   - Duration: 3s, infinite loop

5. **Slide In Left/Right** (`slideInLeft`, `slideInRight`)
   - Horizontal slide-in animations
   - Used for staggered content reveals

6. **Shimmer** (`shimmer`)
   - Gradient shimmer effect
   - Applied to blog cards and special elements

### Component-Specific Animations

#### Home Page (`app/page.tsx`)
- **Hero Section**:
  - Staggered content animations
  - Floating background gradients
  - Badge with glow pulse effect
  - Emoji with bounce animation
  
- **Projects Section**:
  - Staggered card reveals on scroll
  - Hover scale and shadow effects
  - Floating emoji on hover
  
- **Experience Section**:
  - Slide-in from left animations
  - Hover border color change
  
- **Skills Section**:
  - Staggered grid animation
  - Scale and lift on hover
  - Color transition on hover
  
- **Blog Section**:
  - Shimmer effect on image
  - Y-axis lift on hover
  - Staggered article reveals
  
- **Contact Section**:
  - Fade and slide-up animation
  - Button scale and tap animations
  - Floating background gradients

#### Login Page (`app/admin/login/page.tsx`)
- Logo with scale and fade animation
- Card with staggered form field animations
- Form inputs with smooth focus states
- Button with gradient and interactive animations
- Background floating gradients
- Error alerts with slide-in animation

### CSS Animation Classes

Custom utility classes available in globals.css:
```css
.animate-fade-in-up       /* Fade in with upward movement */
.animate-fade-in-down     /* Fade in with downward movement */
.animate-glow-pulse       /* Pulsing glow effect */
.animate-float            /* Floating animation */
.animate-shimmer          /* Shimmer effect */
.animate-slide-in-left    /* Slide in from left */
.animate-slide-in-right   /* Slide in from right */
```

## Implementation Details

### Library Versions
- `framer-motion`: 12.38.0
- `next-themes`: Latest

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS custom properties support required
- Respects `prefers-reduced-motion` for accessibility

### Performance Considerations
- Animations use CSS transforms and opacity (GPU accelerated)
- Framer Motion handles animation cleanup automatically
- Blur effects on backgrounds are subtle to maintain performance
- Floating gradients are positioned absolutely for efficiency

## Customization

### Changing Colors
Edit the CSS variables in `app/globals.css`:
```css
:root {
  --primary: #3b82f6; /* Change primary color */
  --accent: #ec4899;  /* Change accent color */
}
```

### Adjusting Animation Speed
Modify the `duration` and `delay` properties in animation components:
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 1 }} // Increase for slower animations
```

### Disabling Animations
Set animation durations to 0 or use `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Testing

### Test Dark Mode:
1. Toggle theme with the button in header or admin panel
2. Refresh page - preference should persist
3. Change system theme preference - should auto-detect

### Test Animations:
1. Scroll through home page - sections should animate on view
2. Hover over project cards - should scale and lift
3. Click buttons - should have press animation
4. Login page - form should have staggered animations

## Accessibility

- Theme toggle has proper ARIA labels
- Color contrast meets WCAG AA standards
- Animations respect `prefers-reduced-motion` preference
- All interactive elements are keyboard accessible
- Semantic HTML with proper heading hierarchy

## Future Enhancements

- [ ] Add particle effects on scroll
- [ ] Implement page transition animations
- [ ] Add sound effects (optional)
- [ ] Create custom animation presets
- [ ] Add animation performance metrics
- [ ] Implement gesture-based animations for mobile
