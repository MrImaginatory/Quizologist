# Design Plan — Sign In & Sign Up Pages

---

## Design Approach

The authentication pages will use a split-screen layout on desktop (branding left, form right) and stack vertically on mobile. The design follows the indigo primary color palette with clean, minimal aesthetics.

---

## Page Layouts

### Sign Up Page

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │                  │  │                            │  │
│  │   Logo           │  │   Create Account           │  │
│  │                  │  │                            │  │
│  │   Welcome to     │  │   ┌──────────────────┐    │  │
│  │   Quizologist    │  │   │ First Name       │    │  │
│  │                  │  │   └──────────────────┘    │  │
│  │   Your journey   │  │   ┌──────────────────┐    │  │
│  │   to mastery     │  │   │ Last Name        │    │  │
│  │   starts here    │  │   └──────────────────┘    │  │
│  │                  │  │   ┌──────────────────┐    │  │
│  │                  │  │   │ Email            │    │  │
│  │                  │  │   └──────────────────┘    │  │
│  │                  │  │   ┌──────────────────┐    │  │
│  │                  │  │   │ Mobile Number    │    │  │
│  │                  │  │   └──────────────────┘    │  │
│  │                  │  │   ┌──────────────────┐    │  │
│  │                  │  │   │ Password         │    │  │
│  │                  │  │   └──────────────────┘    │  │
│  │                  │  │                            │  │
│  │                  │  │   Role:  ○ Student  ○ Teacher│ │
│  │                  │  │                            │  │
│  │                  │  │   [ Create Account ]       │  │
│  │                  │  │                            │  │
│  │                  │  │   Already have an account?  │  │
│  │                  │  │   Sign In                  │  │
│  └──────────────────┘  └────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Sign In Page

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌──────────────────┐  ┌────────────────────────────┐  │
│  │                  │  │                            │  │
│  │   Logo           │  │   Welcome Back             │  │
│  │                  │  │                            │  │
│  │   Welcome to     │  │   ┌──────────────────┐    │  │
│  │   Quizologist    │  │   │ Email            │    │  │
│  │                  │  │   └──────────────────┘    │  │
│  │   Continue your  │  │   ┌──────────────────┐    │  │
│  │   learning       │  │   │ Password         │    │  │
│  │   journey        │  │   └──────────────────┘    │  │
│  │                  │  │                            │  │
│  │                  │  │   [ Sign In ]              │  │
│  │                  │  │                            │  │
│  │                  │  │   Don't have an account?   │  │
│  │                  │  │   Sign Up                  │  │
│  └──────────────────┘  └────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
src/
├── app/
│   ├── layout.tsx              # Root layout with global styles
│   ├── page.tsx                # Redirect to /signin or home
│   ├── globals.css             # CSS variables, reset, base styles
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout (split screen)
│   │   ├── signin/
│   │   │   └── page.tsx        # Sign In page
│   │   └── signup/
│   │       └── page.tsx        # Sign Up page
├── components/
│   └── auth/
│       ├── AuthLayout.module.css
│       ├── AuthLayout.tsx      # Split-screen layout wrapper
│       ├── BrandPanel.module.css
│       ├── BrandPanel.tsx      # Left side branding
│       ├── FormPanel.module.css
│       ├── FormPanel.tsx       # Right side form wrapper
│       ├── Input.module.css
│       ├── Input.tsx           # Reusable input component
│       ├── Button.module.css
│       ├── Button.tsx          # Reusable button component
│       ├── RadioGroup.module.css
│       ├── RadioGroup.tsx      # Role selection (student/teacher)
│       ├── FormError.module.css
│       ├── FormError.tsx       # Error message display
│       └── LoadingSpinner.module.css
│       └── LoadingSpinner.tsx  # Loading indicator
├── lib/
│   ├── api.ts                  # API client (fetch wrapper)
│   └── auth.ts                 # Auth helpers (token storage)
└── types/
    └── index.ts                # Shared TypeScript types
```

---

## Folder Structure

```
frontend/
├── .env                        # BACKEND_URL, TITLE, LOGO
├── DESIGN.md                   # Design system reference
├── DESIGN_PLAN.md              # This file
├── package.json
├── tsconfig.json
├── next.config.ts
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── (auth)/
    │       ├── layout.tsx
    │       ├── signin/
    │       │   └── page.tsx
    │       └── signup/
    │           └── page.tsx
    ├── components/
    │   └── auth/
    │       ├── AuthLayout.tsx
    │       ├── AuthLayout.module.css
    │       ├── BrandPanel.tsx
    │       ├── BrandPanel.module.css
    │       ├── FormPanel.tsx
    │       ├── FormPanel.module.css
    │       ├── Input.tsx
    │       ├── Input.module.css
    │       ├── Button.tsx
    │       ├── Button.module.css
    │       ├── RadioGroup.tsx
    │       ├── RadioGroup.module.css
    │       ├── FormError.tsx
    │       ├── FormError.module.css
    │       ├── LoadingSpinner.tsx
    │       └── LoadingSpinner.module.css
    ├── lib/
    │   ├── api.ts
    │   └── auth.ts
    └── types/
        └── index.ts
```

---

## Reusable Components

### Input
- Props: `label`, `type`, `placeholder`, `value`, `onChange`, `error`, `disabled`
- States: default, focus, error, disabled
- Includes label, input, and error message

### Button
- Props: `variant` (primary/secondary/ghost/danger), `size` (sm/md/lg), `loading`, `disabled`, `type`, `onClick`
- Loading state shows spinner and disables interaction

### RadioGroup
- Props: `name`, `options`, `value`, `onChange`, `label`
- Horizontal layout for role selection

### FormError
- Props: `message`
- Red text with error icon, animated entrance

### LoadingSpinner
- Props: `size` (sm/md/lg), `color`
- SVG-based spinner

### BrandPanel
- Logo display
- Welcome message
- Decorative background gradient

### FormPanel
- Card wrapper with shadow
- Title, subtitle slot
- Children (form content)

### AuthLayout
- Split-screen on desktop (50/50)
- Stacked on mobile
- Left: BrandPanel, Right: FormPanel

---

## CSS Architecture

### File Naming
- `ComponentName.module.css` — CSS Module files
- `ComponentName.tsx` — Component files

### CSS Structure per Module
```css
/* ComponentName.module.css */

/* 1. Container/Layout */
.container { }

/* 2. Internal elements */
.label { }
.input { }
.error { }

/* 3. States */
.input:focus { }
.input.error { }
.input:disabled { }

/* 4. Responsive */
@media (max-width: 768px) { }
```

### Class Naming Convention
- Use camelCase for CSS Module classes
- BEM-like structure within modules
- CSS variables for all design tokens

---

## Design System Application

1. All colors use CSS variables from globals.css
2. Typography follows the defined scale
3. Spacing uses the 4px base unit
4. Border radius from the defined tokens
5. Shadows from the shadow scale
6. Transitions follow the animation guidelines
7. All interactive elements have focus states

---

## Environment Variables

```env
BACKEND_URL=http://localhost:3000
TITLE=Quizologist
LOGO=
```

- `BACKEND_URL`: API gateway URL for all backend requests
- `TITLE`: Application title displayed in branding panel
- `LOGO`: Optional logo image path (if not provided, show text logo)

---

## API Integration

### Sign Up
```typescript
POST ${BACKEND_URL}/api/user/signup
Body: { fname, lname, role, email, mobilenumber, password }
Response: { success, message, data: { user, token } }
```

### Sign In
```typescript
POST ${BACKEND_URL}/api/user/login
Body: { email, password }
Response: { success, message, data: { user, token } }
```

---

## Flow

1. User visits `/signup` or `/signin`
2. Split-screen layout renders
3. User fills form
4. Client-side validation (Zod)
5. API call to backend
6. On success: store token, redirect to dashboard
7. On error: display error message

---

## Implementation Order

1. Create globals.css with CSS variables
2. Create reusable components (Input, Button, RadioGroup, etc.)
3. Create AuthLayout component
4. Create BrandPanel component
5. Create Sign Up page
6. Create Sign In page
7. Create API client
8. Create auth helpers
9. Test and refine
