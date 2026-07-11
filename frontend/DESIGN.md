# Quizologist Design System

A clean, modern, professional design system for the Quizologist platform using CSS Modules.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary 50 | `#EEF2FF` | Light backgrounds, hover states |
| Primary 100 | `#E0E7FF` | Borders, subtle highlights |
| Primary 200 | `#C7D2FE` | Disabled states |
| Primary 300 | `#A5B4FC` | Icons, secondary elements |
| Primary 400 | `#818CF8` | Hover states for secondary buttons |
| Primary 500 | `#6366F1` | Primary buttons, links, active states |
| Primary 600 | `#4F46E5` | Primary button hover |
| Primary 700 | `#4338CA` | Primary button active |
| Primary 800 | `#3730A3` | Dark accents |
| Primary 900 | `#312E81` | Darkest accents |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| Gray 50 | `#F9FAFB` | Page background |
| Gray 100 | `#F3F4F6` | Card backgrounds, input backgrounds |
| Gray 200 | `#E5E7EB` | Borders, dividers |
| Gray 300 | `#D1D5DB` | Placeholder text, disabled borders |
| Gray 400 | `#9CA3AF` | Placeholder text |
| Gray 500 | `#6B7280` | Secondary text |
| Gray 600 | `#4B5563` | Body text |
| Gray 700 | `#374151` | Headings, strong text |
| Gray 800 | `#1F2937` | Primary text |
| Gray 900 | `#111827` | Darkest text |

### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#10B981` | Success messages, correct answers |
| Success Light | `#D1FAE5` | Success backgrounds |
| Warning | `#F59E0B` | Warning messages |
| Warning Light | `#FEF3C7` | Warning backgrounds |
| Error | `#EF4444` | Error messages, incorrect answers |
| Error Light | `#FEE2E2` | Error backgrounds |
| Info | `#3B82F6` | Info messages |
| Info Light | `#DBEAFE` | Info backgrounds |

---

## Typography

### Font Family

```css
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| xs | 0.75rem (12px) | 1rem | Captions, labels |
| sm | 0.875rem (14px) | 1.25rem | Small text, helper text |
| base | 1rem (16px) | 1.5rem | Body text |
| lg | 1.125rem (18px) | 1.75rem | Large body text |
| xl | 1.25rem (20px) | 1.75rem | Subheadings |
| 2xl | 1.5rem (24px) | 2rem | Section headings |
| 3xl | 1.875rem (30px) | 2.25rem | Page titles |
| 4xl | 2.25rem (36px) | 2.5rem | Hero headings |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| normal | 400 | Body text |
| medium | 500 | Labels, emphasis |
| semibold | 600 | Headings, buttons |
| bold | 700 | Strong emphasis |

---

## Spacing System

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| 0 | 0 | Reset |
| 1 | 0.25rem (4px) | Tight spacing |
| 2 | 0.5rem (8px) | Small spacing |
| 3 | 0.75rem (12px) | Default small spacing |
| 4 | 1rem (16px) | Default spacing |
| 5 | 1.25rem (20px) | Medium spacing |
| 6 | 1.5rem (24px) | Large spacing |
| 8 | 2rem (32px) | Section spacing |
| 10 | 2.5rem (40px) | Large section spacing |
| 12 | 3rem (48px) | Page padding |
| 16 | 4rem (64px) | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| none | 0 | No radius |
| sm | 0.25rem (4px) | Small elements |
| base | 0.375rem (6px) | Buttons, inputs |
| md | 0.5rem (8px) | Cards |
| lg | 0.75rem (12px) | Large cards, modals |
| xl | 1rem (16px) | Feature cards |
| full | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| base | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Cards, dropdowns |
| md | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Elevated cards |
| lg | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Modals, popovers |
| xl | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | High elevation |

---

## Button Variants

### Primary Button
- Background: Primary 500 (`#6366F1`)
- Text: White
- Hover: Primary 600 (`#4F46E5`)
- Active: Primary 700 (`#4338CA`)
- Border radius: base (6px)
- Padding: 12px 24px
- Font weight: semibold

### Secondary Button
- Background: White
- Text: Gray 700
- Border: 1px solid Gray 200
- Hover: Gray 50 background
- Active: Gray 100 background

### Danger Button
- Background: Error (`#EF4444`)
- Text: White
- Hover: Darker red
- Active: Darkest red

### Ghost Button
- Background: Transparent
- Text: Primary 500
- Hover: Primary 50 background
- Active: Primary 100 background

### Button Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| sm | 8px 16px | sm (14px) | 32px |
| md | 12px 24px | base (16px) | 40px |
| lg | 16px 32px | lg (18px) | 48px |

---

## Form Controls

### Input

- Height: 44px
- Padding: 12px 16px
- Border: 1px solid Gray 300
- Border radius: base (6px)
- Background: White
- Font size: base (16px)
- Focus: Border Primary 500, ring 3px Primary 100

### Input States

| State | Border | Background | Ring |
|-------|--------|------------|------|
| Default | Gray 300 | White | None |
| Focus | Primary 500 | White | 3px Primary 100 |
| Error | Error | White | 3px Error Light |
| Disabled | Gray 200 | Gray 50 | None |
| Success | Success | White | None |

### Label

- Font size: sm (14px)
- Font weight: medium
- Color: Gray 700
- Margin bottom: 6px

### Helper Text

- Font size: sm (14px)
- Color: Gray 500
- Margin top: 4px

### Error Text

- Font size: sm (14px)
- Color: Error (`#EF4444`)
- Margin top: 4px

---

## Card Styles

### Default Card
- Background: White
- Border: 1px solid Gray 200
- Border radius: md (8px)
- Shadow: base
- Padding: 24px

### Interactive Card
- Same as default
- Hover: Shadow md, border Gray 300
- Cursor: pointer
- Transition: all 150ms ease

### Highlighted Card
- Background: Primary 50
- Border: 2px solid Primary 200
- Border radius: md (8px)

---

## Layout Guidelines

### Page Layout
- Max width: 90%
- Horizontal padding: 24px (mobile: 16px)
- Vertical padding: 48px (mobile: 32px)

### Grid System
- 12-column grid
- Gutter: 24px
- Breakpoints: 640px, 768px, 1024px, 1280px

### Content Widths
- Auth forms: 400px max
- Content area: 800px max
- Full width: 100%

---

## Responsive Breakpoints

| Name | Min Width | Usage |
|------|-----------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small desktops |
| xl | 1280px | Large desktops |
| 2xl | 1536px | Extra large screens |

---

## Icon Usage

- Size: 20px (default), 16px (small), 24px (large)
- Color: Inherits from text color
- Spacing: 8px gap when paired with text
- Library: Lucide React (to be installed)

---

## Accessibility Rules

1. **Color contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus indicators**: Visible focus ring on all interactive elements
3. **Keyboard navigation**: All interactive elements must be focusable
4. **ARIA labels**: Required for icon-only buttons and form controls
5. **Form labels**: Every input must have an associated label
6. **Error announcements**: Use `aria-live` for dynamic error messages
7. **Skip link**: Provide skip-to-content link for keyboard users
8. **Alt text**: All meaningful images require alt text

---

## Animation and Transition Guidelines

### Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| Colors | 150ms | ease-in-out |
| Transform | 200ms | ease-out |
| Opacity | 150ms | ease-in-out |
| Shadow | 150ms | ease-in-out |

### Hover Effects
- Buttons: Subtle scale (1.02) or color change
- Cards: Shadow elevation increase
- Links: Color change + underline

### Loading States
- Skeleton loaders with pulse animation
- Spinner for button loading states
- Minimum 200ms display time to prevent flicker

### Page Transitions
- Fade in: 200ms ease-out
- Slide up: 200ms ease-out (for modals, drawers)

---

## CSS Variables Reference

```css
:root {
  /* Colors */
  --color-primary-50: #EEF2FF;
  --color-primary-100: #E0E7FF;
  --color-primary-500: #6366F1;
  --color-primary-600: #4F46E5;
  --color-primary-700: #4338CA;

  --color-gray-50: #F9FAFB;
  --color-gray-100: #F3F4F6;
  --color-gray-200: #E5E7EB;
  --color-gray-300: #D1D5DB;
  --color-gray-400: #9CA3AF;
  --color-gray-500: #6B7280;
  --color-gray-600: #4B5563;
  --color-gray-700: #374151;
  --color-gray-800: #1F2937;
  --color-gray-900: #111827;

  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-error: #EF4444;
  --color-error-light: #FEE2E2;
  --color-info: #3B82F6;
  --color-info-light: #DBEAFE;

  /* Typography */
  --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-base: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}
```
