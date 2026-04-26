# ZendFi Design System

## Colors

### Primary
- **Blue accent**: `#5d74ff` (buttons, active tab, links, highlights)
- **Blue hover**: `#4a5fe6`
- **Blue soft**: `#8b9dff` (gradient starts, subtle accents)

### Backgrounds
- **Page**: `gray-50` (#f9fafb)
- **Card**: white (#ffffff)
- **Card border**: `gray-200` (#e5e7eb)

### Text
- **Primary**: `gray-900` (#111827)
- **Secondary**: `gray-500` (#6b7280)
- **Muted**: `gray-400` (#9ca3af)

### Semantic
- **Success**: `emerald-500` / `emerald-600`
- **Warning**: `amber-500`
- **Error**: `red-500`

### Hero Gradient
```
linear-gradient(135deg, #c4b5fd 0%, #93c5fd 20%, #e0c3fc 40%, #fde68a 60%, #bfdbfe 80%, #c4b5fd 100%)
```
Animated with `gradient-shift` keyframe (400% background-size, 15s cycle).

## Typography

- **Display/Headings**: EB Garamond (serif), loaded via `next/font/google`
- **Body/UI**: Inter (sans-serif), loaded via `next/font/google`
- **Heading tracking**: -0.01em
- **Body size**: 16px minimum
- **Line height**: 1.5x body
- **Headings**: `text-wrap: balance`
- **Number columns**: `font-variant-numeric: tabular-nums`

## Spacing

- **Base unit**: 4px (Tailwind default)
- **Card padding**: 20px (p-5)
- **Section spacing**: 24px (mb-6)
- **Border radius**: 16px (rounded-2xl) for cards, 12px (rounded-xl) for buttons/inputs

## Interaction States

- **Hover**: `border-gray-300 shadow-md` on cards, `bg-zend-blue-dark` on buttons
- **Focus**: `focus-visible` ring, 2px solid rgba(93, 116, 255, 0.6), 2px offset
- **Disabled**: `bg-gray-300 text-gray-500` (buttons), `opacity-50` (other)
- **Active tab**: `bg-zend-blue text-white shadow-[0_4px_12px_rgba(93,116,255,0.3)]`

## Motion

- **Cloud drift**: 20-35s ease-in-out infinite (hero clouds)
- **Gradient shift**: 15s ease infinite (hero background)
- **Scroll reveal**: 700ms ease-out, opacity + translate-y
- **Float**: 6s ease-in-out infinite (empty state icons)
- **Hover transitions**: 200ms duration, `transition-all`

## Accessibility

- Touch targets: 44px minimum
- Focus-visible rings on all interactive elements
- `aria-label` on icon-only buttons
- `color-scheme: light` on html
- No `user-scalable=no` in viewport
