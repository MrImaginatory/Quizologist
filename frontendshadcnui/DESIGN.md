# Design System Guide
## Quiz Application - Shadcn UI (Base-Maia Style)

### 1. Shadcn Configuration
- **Style**: base-maia (Base UI primitives)
- **Base Color**: Stone
- **Color Format**: oklch
- **Icon Library**: Lucide
- **CSS Variables**: Enabled
- **RTL**: Disabled

### 2. Color System (oklch)

#### 2.1 Light Mode
```css
--background: oklch(1 0 0);
--foreground: oklch(0.147 0.004 49.25);
--card: oklch(1 0 0);
--card-foreground: oklch(0.147 0.004 49.25);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.147 0.004 49.25);
--primary: oklch(0.491 0.27 292.581);
--primary-foreground: oklch(0.969 0.016 293.756);
--secondary: oklch(0.967 0.001 286.375);
--secondary-foreground: oklch(0.21 0.006 285.885);
--muted: oklch(0.97 0.001 106.424);
--muted-foreground: oklch(0.553 0.013 58.071);
--accent: oklch(0.97 0.001 106.424);
--accent-foreground: oklch(0.216 0.006 56.043);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.923 0.003 48.717);
--input: oklch(0.923 0.003 48.717);
--ring: oklch(0.709 0.01 56.259);
--radius: 0.45rem;
```

#### 2.2 Dark Mode
```css
--background: oklch(0.147 0.004 49.25);
--foreground: oklch(0.985 0.001 106.423);
--card: oklch(0.216 0.006 56.043);
--card-foreground: oklch(0.985 0.001 106.423);
--popover: oklch(0.216 0.006 56.043);
--popover-foreground: oklch(0.985 0.001 106.423);
--primary: oklch(0.432 0.232 292.759);
--primary-foreground: oklch(0.969 0.016 293.756);
--secondary: oklch(0.274 0.006 286.033);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.268 0.007 34.298);
--muted-foreground: oklch(0.709 0.01 56.259);
--accent: oklch(0.268 0.007 34.298);
--accent-foreground: oklch(0.985 0.001 106.423);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.553 0.013 58.071);
```

#### 2.3 Chart Colors
```css
--chart-1: oklch(0.811 0.111 293.571);
--chart-2: oklch(0.606 0.25 292.717);
--chart-3: oklch(0.541 0.281 293.009);
--chart-4: oklch(0.491 0.27 292.581);
--chart-5: oklch(0.432 0.232 292.759);
```

#### 2.4 Sidebar Colors
```css
/* Light */
--sidebar: oklch(0.985 0.001 106.423);
--sidebar-foreground: oklch(0.147 0.004 49.25);
--sidebar-primary: oklch(0.541 0.281 293.009);
--sidebar-primary-foreground: oklch(0.969 0.016 293.756);
--sidebar-accent: oklch(0.97 0.001 106.424);
--sidebar-accent-foreground: oklch(0.216 0.006 56.043);
--sidebar-border: oklch(0.923 0.003 48.717);
--sidebar-ring: oklch(0.709 0.01 56.259);

/* Dark */
--sidebar: oklch(0.216 0.006 56.043);
--sidebar-foreground: oklch(0.985 0.001 106.423);
--sidebar-primary: oklch(0.606 0.25 292.717);
--sidebar-primary-foreground: oklch(0.969 0.016 293.756);
--sidebar-accent: oklch(0.268 0.007 34.298);
--sidebar-accent-foreground: oklch(0.985 0.001 106.423);
--sidebar-border: oklch(1 0 0 / 10%);
--sidebar-ring: oklch(0.553 0.013 58.071);
```

### 3. Typography

#### 3.1 Font Stack
- **Body**: Inter (sans-serif) via `--font-sans`
- **Headings**: Geist via `--font-heading`
- **Monospace**: Geist Mono via `--font-geist-mono`

#### 3.2 Font Sizes
Use Tailwind's built-in scale: `text-xs` through `text-4xl`

### 4. Border Radius
Base radius: `0.45rem`

| Token | Calculation | Value |
|-------|-------------|-------|
| --radius-sm | radius * 0.6 | ~0.27rem |
| --radius-md | radius * 0.8 | ~0.36rem |
| --radius-lg | radius | 0.45rem |
| --radius-xl | radius * 1.4 | ~0.63rem |
| --radius-2xl | radius * 1.8 | ~0.81rem |
| --radius-3xl | radius * 2.2 | ~0.99rem |
| --radius-4xl | radius * 2.6 | ~1.17rem |

### 5. Component Patterns (Base-Maia Style)

#### 5.1 Buttons
Use the shadcn Button component with variants:
- `default` - Primary action (bg-primary)
- `secondary` - Secondary action (bg-secondary)
- `outline` - Border style with hover
- `ghost` - Transparent with hover
- `destructive` - Danger actions
- `link` - Text-only link style

Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

#### 5.2 Cards
```tsx
<Card className="rounded-xl border border-border bg-card text-card-foreground">
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

#### 5.3 Form Controls
Use shadcn Input, Select, Checkbox, etc. with consistent styling from the theme.

### 6. Theme Toggle
- Fixed position bottom-right corner
- Uses `next-themes` for theme persistence
- Toggles between light/dark mode
- Adds/removes `.dark` class on `<html>` element

### 7. Responsive Breakpoints
| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Small desktop |
| xl | 1280px | Standard desktop |
| 2xl | 1536px | Large desktop |

### 8. Spacing System
Use Tailwind's spacing scale: `p-1` through `p-24`, `m-1` through `m-24`, etc.

### 9. Shadows
Use Tailwind's shadow utilities: `shadow-sm`, `shadow`, `shadow-md`, `shadow-lg`, `shadow-xl`

### 10. Animations
- Use Tailwind's transition utilities
- `transition-all`, `transition-colors`, `transition-transform`
- Duration: `duration-150`, `duration-200`, `duration-300`

### 11. Icon Usage
- Import from `lucide-react`
- Use size props or Tailwind classes: `size-4`, `size-5`, `size-6`
- Color inherits from text or use `text-muted-foreground`, `text-primary`, etc.
