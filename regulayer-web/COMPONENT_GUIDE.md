# Component Architecture Guide

## 📐 Landing Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│                         NAVBAR                               │
│  [Logo] [Product] [Pricing] [Docs] [About] [Login] [CTA]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      HERO SECTION                            │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │   Content Column     │  │   3D Visualization   │        │
│  │  • Badge             │  │  • Cryptographic Orb │        │
│  │  • Headline          │  │  • Particle Field    │        │
│  │  • Description       │  │  • Floating Cards    │        │
│  │  • CTA Buttons       │  │                      │        │
│  │  • Trust Indicators  │  │                      │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FEATURES GRID                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Feature1│ │Feature2│ │Feature3│ │Feature4│              │
│  │ Icon   │ │ Icon   │ │ Icon   │ │ Icon   │              │
│  │ Title  │ │ Title  │ │ Title  │ │ Title  │              │
│  │ Desc   │ │ Desc   │ │ Desc   │ │ Desc   │              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Feature5│ │Feature6│ │Feature7│ │Feature8│              │
│  └────────┘ └────────┘ └────────┘ └────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CODE SHOWCASE                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Python] [TypeScript] [Go]              [Copy]      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 1  from regulayer import Regulayer                  │   │
│  │ 2                                                    │   │
│  │ 3  client = Regulayer("rl_sk_live_...")            │   │
│  │ 4                                                    │   │
│  │ 5  with client.trace("model-v4") as t:             │   │
│  │ 6      decision = model.predict(data)              │   │
│  │ 7      t.record(input=data, output=decision)       │   │
│  └─────────────────────────────────────────────────────┘   │
│  [Badge] [Badge] [Badge] [Badge] [Badge]                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   PRICING SECTION                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   Free   │  │   Pro    │  │Enterprise│                 │
│  │          │  │ ⭐Popular│  │          │                 │
│  │   $0     │  │  $299    │  │  Custom  │                 │
│  │          │  │          │  │          │                 │
│  │ Features │  │ Features │  │ Features │                 │
│  │ • Item 1 │  │ • Item 1 │  │ • Item 1 │                 │
│  │ • Item 2 │  │ • Item 2 │  │ • Item 2 │                 │
│  │ • Item 3 │  │ • Item 3 │  │ • Item 3 │                 │
│  │          │  │          │  │          │                 │
│  │ [Button] │  │ [Button] │  │ [Button] │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FINAL CTA                               │
│              [Badge: Join 500+ AI teams]                     │
│                                                              │
│           Ready to make AI accountable?                      │
│                                                              │
│     Deploy cryptographic accountability in 5 minutes        │
│                                                              │
│        [Start Building Free]  [Talk to Sales]               │
│                                                              │
│  ✓ Free trial  ✓ No credit card  ✓ Cancel anytime         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  [Links] [Links] [Links] [Social] [Legal]                  │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Component Breakdown

### 1. Navbar (`components/layout/navbar.tsx`)
**Purpose**: Site navigation and branding

**Features**:
- Animated logo with hover effects
- Active link indicators with sliding background
- Scroll-triggered glass morphism
- Mobile hamburger menu with slide-down
- Framer Motion animations

**Props**: None (uses pathname from Next.js)

**State**:
- `scrolled`: Boolean for scroll state
- `mobileOpen`: Boolean for mobile menu

---

### 2. Hero Section (`components/sections/hero-section.tsx`)
**Purpose**: First impression, value proposition, 3D visualization

**Features**:
- Split layout (content + visualization)
- Animated badge with pulse
- Gradient text on "for AI"
- Floating info cards
- Trust indicators
- Radial gradient overlays
- Grid pattern background

**Dependencies**:
- `CryptographicOrb` component
- Framer Motion
- Lucide icons

**Animations**:
- Staggered reveals (0.2s, 0.3s, 0.4s delays)
- Fade-in with upward movement
- Scale animation on 3D orb

---

### 3. Cryptographic Orb (`components/ui/cryptographic-orb.tsx`)
**Purpose**: Interactive 3D visualization

**Features**:
- Animated distortion sphere
- 1000+ particle field
- Auto-rotating camera
- Multi-point lighting
- Color-coded particles

**Technology**:
- React Three Fiber
- Three.js
- MeshDistortMaterial

**Performance**:
- Lazy loaded with `next/dynamic`
- Suspense boundary with fallback
- GPU-accelerated rendering

---

### 4. Features Grid (`components/sections/features-grid.tsx`)
**Purpose**: Showcase architecture features

**Features**:
- 8 feature cards in 4-column grid
- Unique color coding per feature
- Hover lift with glow
- Icon rotation on hover
- Gradient background reveal
- Staggered entrance animations

**Data Structure**:
```typescript
{
  icon: LucideIcon,
  title: string,
  description: string,
  gradient: string,
  iconColor: string
}
```

**Responsive**:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 4 columns

---

### 5. Code Showcase (`components/sections/code-showcase.tsx`)
**Purpose**: Interactive code examples

**Features**:
- Tab switching (Python, TypeScript, Go)
- Line numbers
- Copy to clipboard
- Syntax highlighting
- Feature badges
- Smooth transitions

**State**:
- `activeTab`: Number (0-2)
- `copied`: Boolean

**Interactions**:
- Tab click switches language
- Copy button shows success state
- Hover effects on tabs

---

### 6. Pricing Section (`components/sections/pricing-section.tsx`)
**Purpose**: Display pricing tiers

**Features**:
- 3 pricing cards
- "Most Popular" badge on Pro
- Scale effect on popular plan
- Detailed feature lists
- Checkmark icons
- Hover glow effects

**Data Structure**:
```typescript
{
  name: string,
  description: string,
  price: string,
  period: string,
  features: string[],
  cta: string,
  href: string,
  popular: boolean
}
```

**Visual Hierarchy**:
- Pro plan: Scaled 105%, gradient background
- Free/Enterprise: Standard size, card background

---

### 7. Final CTA (`components/sections/final-cta.tsx`)
**Purpose**: Conversion-focused closing section

**Features**:
- Animated trust network background
- Radial gradient overlays
- Large prominent CTAs
- Trust indicators
- Social proof badge
- Staggered animations

**Trust Signals**:
- ✓ Free 14-day trial
- ✓ No credit card required
- ✓ Cancel anytime

---

## 🎨 Shared Utilities (globals.css)

### Glass Morphism
```css
.glass {
  background: hsl(222 18% 7% / 0.6);
  backdrop-filter: blur(24px);
  border: 1px solid hsl(222 16% 12% / 0.8);
}

.glass-strong {
  background: hsl(222 18% 10% / 0.8);
  backdrop-filter: blur(32px);
  border: 1px solid hsl(222 16% 18% / 0.6);
}
```

### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #00D4AA, #4B6FFF, #A855F7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Hover Lift
```css
.hover-lift {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.hover-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px -12px hsl(168 100% 42% / 0.25);
}
```

### Glow Effects
```css
.shadow-glow-sm: 0 0 40px -12px rgba(0,212,170,0.4)
.shadow-glow: 0 0 60px -12px rgba(0,212,170,0.6)
.shadow-glow-lg: 0 0 80px -12px rgba(0,212,170,0.8)
```

---

## 🔄 Animation Patterns

### Scroll Reveals
```typescript
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: "-100px" });

<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={isInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.6 }}
>
```

### Staggered Children
```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
```

### Hover Interactions
```typescript
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
```

---

## 📱 Responsive Breakpoints

```typescript
// Tailwind breakpoints
sm: 640px   // Small devices
md: 768px   // Tablets
lg: 1024px  // Laptops
xl: 1280px  // Desktops
2xl: 1536px // Large screens
```

### Usage Examples
```tsx
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Hide on mobile
<div className="hidden md:flex">

// Show only on mobile
<div className="md:hidden">
```

---

## 🎯 Best Practices

### Component Organization
1. **Imports** at top
2. **Type definitions** next
3. **Component function**
4. **Return JSX**

### Animation Guidelines
- Use `once: true` for scroll reveals
- Add `margin: "-100px"` for early trigger
- Keep durations 300-800ms
- Use cubic-bezier easing

### Performance Tips
- Lazy load heavy components
- Use `next/dynamic` for 3D
- Implement Suspense boundaries
- Optimize images with Next.js Image

### Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus visible states

---

## 🚀 Quick Reference

### Adding a New Section
1. Create component in `components/sections/`
2. Import in `app/page.tsx`
3. Add to page component
4. Test responsiveness
5. Add animations

### Modifying Colors
Edit `app/globals.css`:
```css
:root {
  --primary: 168 100% 42%;
  --accent: 227 100% 65%;
}
```

### Changing Fonts
Edit `tailwind.config.js`:
```javascript
fontFamily: {
  sans: ['Inter', ...],
  display: ['Outfit', ...],
}
```

---

**For detailed implementation, see individual component files.**
