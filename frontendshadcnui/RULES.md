# Development Rules & Conventions
## Quiz Application - Shadcn UI

### 0. Package Manager

**ALWAYS use `pnpm`** for installing packages. Never use `npm` or `yarn`.

```bash
# Install packages
pnpm add <package>

# Install dev dependencies
pnpm add -D <package>

# Run scripts
pnpm run <script>
```

---

### 0.1 Environment Variables & App Configuration

#### Required Environment Variables (.env.local)
```bash
NEXT_PUBLIC_APP_NAME=Quizologist
NEXT_PUBLIC_APP_LOGO=/Quizologist.svg
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

#### Usage Rules
1. **ALWAYS** use `appConfig` from `@/lib/app-config` in server components
2. **ALWAYS** use `useAppConfig()` hook from `@/hooks/use-app-config` in client components
3. **NEVER** hardcode app name, logo path, or backend URL - always use env variables
4. **NEVER** use `process.env` directly in components - use the config utilities

#### Server Components (e.g., layout.tsx)
```typescript
import { appConfig } from "@/lib/app-config";

// Use in metadata
export const metadata: Metadata = {
  title: appConfig.appName,
  icons: { icon: appConfig.appLogo },
};
```

#### Client Components
```typescript
"use client";
import { useAppConfig } from "@/hooks/use-app-config";

function MyComponent() {
  const { appName, appLogo, backendUrl } = useAppConfig();
  // Use appName, appLogo, and backendUrl
}
```

#### API Calls
Use `authApi` from `@/lib/api` for authentication:
```typescript
import { authApi } from "@/lib/api";

// Signup
const response = await authApi.signup({
  fname, lname, role, email, mobileNumber, password
});

// Login
const response = await authApi.login({ email, password });
```

#### Reusable Logo Component
Use `<AppLogo />` from `@/components/app-logo`:
```tsx
<AppLogo size="md" showName={true} />
// Props: size ("sm" | "md" | "lg"), showName (boolean)
```

---

### 1. Core Principles

#### 1.1 DRY (Don't Repeat Yourself)
- Extract reusable logic into custom hooks
- Create shared components for repeated UI patterns
- Use utility functions for common transformations
- Centralize API calls in service modules

#### 1.2 Component Reusability
- Components must be self-contained and loosely coupled
- Accept props for customization, avoid internal state dependencies
- Export TypeScript interfaces for all component props
- Use composition over configuration

#### 1.3 Single Responsibility
- One component = one job
- Split complex components into smaller, focused ones
- Separate UI from business logic via hooks

---

### 2. File Structure

```
frontendshadcnui/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── student/
│   ├── api/                    # API routes (if needed)
│   ├── globals.css             # Global styles + shadcn theme
│   ├── layout.tsx              # Root layout with ThemeProvider
│   └── page.tsx                # Landing/redirect
├── components/
│   ├── ui/                     # shadcn components (DO NOT MODIFY)
│   │   └── button.tsx
│   ├── shared/                 # Reusable app components
│   │   ├── layout/
│   │   ├── forms/
│   │   └── data-display/
│   ├── admin/                  # Admin-specific components
│   ├── teacher/                # Teacher-specific components
│   ├── student/                # Student-specific components
│   ├── theme-provider.tsx      # Theme context provider
│   └── theme-toggle.tsx        # Dark/light mode toggle button
├── hooks/                      # Custom React hooks
├── lib/
│   ├── utils.ts            # Utility functions
│   ├── api.ts              # API client
│   └── constants.ts        # App constants
├── services/               # API service modules
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── test.service.ts
│   └── ...
├── types/                  # TypeScript type definitions
├── styles/                 # Global styles
└── public/                 # Static assets
```

---

### 3. Naming Conventions

#### 3.1 Files
| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserCard.tsx` |
| Hooks | camelCase with `use` | `useAuth.ts` |
| Services | camelCase with `.service` | `userService.ts` |
| Types | PascalCase | `User.ts`, `TestSession.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE | `API_ENDPOINTS.ts` |

#### 3.2 Variables & Functions
- **Components**: `PascalCase` (e.g., `UserProfile`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useCurrentUser`)
- **Functions**: `camelCase` (e.g., `formatDuration`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_QUESTIONS`)
- **Types/Interfaces**: `PascalCase` (e.g., `QuizQuestion`)

#### 3.3 CSS/Tailwind
- Use Tailwind utility classes exclusively
- No custom CSS unless absolutely necessary
- shadcn components: DO NOT modify files in `components/ui/`

---

### 4. Component Rules

#### 4.1 Component Structure
```typescript
// ComponentName.tsx
import { cn } from "@/lib/utils";
import { ComponentProps } from "./types";

interface ComponentNameProps extends ComponentProps {
  // Props here
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* Content */}
    </div>
  );
}
```

#### 4.2 Props Guidelines
- Always define TypeScript interface for props
- Extend native HTML props when applicable
- Use `className` for custom styling (Tailwind merge)
- Destructure props in function signature
- Provide defaults via destructuring when appropriate

#### 4.3 Component Organization
- One component per file
- Named exports preferred over default exports
- Co-locate related types in same file or types/ directory
- Keep components under 200 lines (split if larger)

---

### 5. State Management Rules

#### 5.1 Local State
- Use `useState` for simple UI state
- Use `useReducer` for complex state logic
- Keep state as close to where it's used as possible

#### 5.2 Shared State
- Use React Context for auth, theme, and global UI state
- Create separate contexts for different domains
- Avoid deep nesting of context providers

#### 5.3 Server State
- Fetch data in Server Components when possible
- Use `useSWR` or `fetch` with proper caching for client-side
- Implement proper loading and error states

---

### 6. API Integration Rules

#### 6.1 API Client
```typescript
// lib/api.ts - Centralized API client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // Add auth headers
  // Handle errors
  // Return typed response
}
```

#### 6.2 Service Pattern
```typescript
// services/user.service.ts
import { apiRequest } from "@/lib/api";

export const userService = {
  getUsers: () => apiRequest<User[]>("/api/users"),
  getUser: (id: string) => apiRequest<User>(`/api/users/${id}`),
  createUser: (data: CreateUserDto) => 
    apiRequest<User>("/api/users", { method: "POST", body: data }),
};
```

#### 6.3 Error Handling
- Always handle loading, success, and error states
- Use toast notifications for user feedback
- Log errors for debugging (never expose to UI)
- Implement retry logic for network failures

---

### 7. TypeScript Rules

#### 7.1 Strict Mode
- Enable `strict: true` in tsconfig
- No `any` types - use `unknown` and type guards
- Prefer interfaces over types for object shapes
- Export all public types

#### 7.2 Type Definitions
```typescript
// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "teacher" | "student";
  createdAt: string;
}

export type CreateUserDto = Omit<User, "id" | "createdAt">;
```

---

### 8. Testing Rules

#### 8.1 Test Coverage
- Unit tests for utility functions
- Component tests for shared components
- Integration tests for critical user flows
- Minimum 80% coverage for new code

#### 8.2 Test Structure
```typescript
// ComponentName.test.tsx
import { render, screen } from "@testing-library/react";
import { ComponentName } from "./ComponentName";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName prop="value" />);
    expect(screen.getByText("Expected")).toBeInTheDocument();
  });
});
```

---

### 9. Performance Rules

#### 9.1 Rendering
- Use `React.memo` for expensive computations
- Avoid inline object/array creation in JSX
- Use `useMemo` for derived data
- Use `useCallback` for stable function references

#### 9.2 Code Splitting
- Lazy load route components
- Dynamic import for heavy dependencies
- Use Next.js `dynamic()` for component splitting

#### 9.3 Images
- Use Next.js `Image` component
- Provide `width` and `height` for static images
- Use `priority` for above-the-fold images
- Implement proper `alt` text

---

### 10. Accessibility Rules

#### 10.1 Semantic HTML
- Use proper heading hierarchy (h1-h6)
- Use `<button>` for actions, `<a>` for navigation
- Use `<label>` for form inputs
- Use ARIA attributes when needed

#### 10.2 Keyboard Navigation
- All interactive elements must be focusable
- Implement logical tab order
- Support Escape to close modals
- Use focus trapping in dialogs

#### 10.3 Screen Readers
- Provide meaningful `alt` text for images
- Use `aria-label` for icon-only buttons
- Announce dynamic content changes
- Use `role` attributes when semantics are unclear

---

### 11. Git Rules

#### 11.1 Branch Naming
- `feature/TICKET-description` - New features
- `fix/TICKET-description` - Bug fixes
- `refactor/description` - Code refactoring
- `chore/description` - Maintenance tasks

#### 11.2 Commit Messages
```
type(scope): description

- Detail 1
- Detail 2
```
Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

#### 11.3 PR Requirements
- All tests passing
- TypeScript compilation successful
- No lint errors
- PR description with context
- Screenshots for UI changes

---

### 12. Code Review Checklist

- [ ] Follows naming conventions
- [ ] TypeScript types are correct
- [ ] No `any` types
- [ ] Handles loading/error states
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive on all breakpoints
- [ ] No console errors
- [ ] Tests included
- [ ] DRY - no duplicate code
- [ ] Comments only when necessary

---

### 13. Prohibited Practices

1. **DO NOT** modify files in `components/ui/` (shadcn components)
2. **DO NOT** use `any` type
3. **DO NOT** add comments unless absolutely necessary
4. **DO NOT** create components over 200 lines
5. **DO NOT** skip error handling
6. **DO NOT** hardcode values - use constants
7. **DO NOT** create new files without checking existing ones first
8. **DO NOT** use inline styles
9. **DO NOT** use `index` as key in lists
10. **DO NOT** modify the existing `frontend/` folder

---

### 14. Animation Rules (Framer Motion)

#### 14.1 Animation Library
Use `framer-motion` for all animations. Import from `framer-motion`:
```tsx
import { motion, AnimatePresence } from "framer-motion";
```

#### 14.2 Animation Principles
- **Subtlety**: Animations should enhance UX, not distract
- **Performance**: Use `transform` and `opacity` only (GPU-accelerated)
- **Consistency**: Use shared animation variants across similar components
- **Respect `prefers-reduced-motion`**: Disable animations for users who prefer reduced motion

#### 14.3 Common Animation Patterns
```tsx
// Fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

// Slide up
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 20 }}

// Scale
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}

// Rotate (for icons)
initial={{ rotate: -90, scale: 0 }}
animate={{ rotate: 0, scale: 1 }}
exit={{ rotate: 90, scale: 0 }}
```

#### 14.4 Duration Guidelines
- Micro-interactions: 150-200ms
- Page transitions: 200-300ms
- Complex animations: 300-500ms

#### 14.5 Theme Transitions
Use the CSS class `.theme-transition` for smooth theme changes (applied automatically by ThemeProvider).
