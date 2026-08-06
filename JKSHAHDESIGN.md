# JK Shah Classes — Design System Document

## Overview

JK Shah Classes positions itself as India's leading commerce coaching institute — the marketing surface reads as a professional educational institution with 43+ years of legacy, not a tech startup. The default page is a generous white canvas (`#ffffff`) with a deep indigo-purple brand color (`#373081`) for primary CTAs, navigation elements, and brand identity. Around this restrained primary, the brand layers a warm amber/orange accent (`#f59e0b`) for highlights, badges, and call-to-action emphasis. The brand's secondary accent palette includes a success green (`#2ba57d`) for positive indicators and ratings.

Type carries the decisive voice. The **Inter** font family carries every display, body, and label role at weights 400 / 500 / 600 / 700 / 900 — the brand uses bold (700) for primary headings and semibold (600) for emphasis, with weight 900 reserved for high-impact section headlines. Hero display sits at 36px / weight 700 — confident but not shouting. Section headlines use 24px / weight 900 with tight `-0.6px` tracking for impact.

The shape system is generous. Buttons take a rounded `10px` radius — approachable and modern. Cards use `16px` radius for content containers. Pill shapes (`3.35e+07px` / `9999px`) are reserved for badges, tags, and status indicators. The brand uses subtle box-shadows on cards for depth without heavy material design.

**Key Characteristics:**
- A two-colour conversion hierarchy — brand indigo-purple (`#373081`) for every primary CTA, white-on-indigo for secondary actions. Amber/orange accent for badges and highlights.
- The brand's signature is its **educational trust palette**: deep indigo-purple as primary, warm amber as accent, clean white as canvas.
- Hero typography at 36px weight 700 — restrained, confident, professional.
- Inter is the single family across the system; the brand uses no separate display vs body face.
- Generous `16px` card radius, `10px` button radius, pill shapes for badges.
- Subtle multi-stop drop-shadows on cards — the brand's only elevation cue.

---

## Colors

### Brand & Primary
- **Brand Indigo** (`#373081`): The brand's primary conversion colour. Every primary CTA, navigation active state, section headlines, and brand accent. A deep, professional indigo-purple that conveys trust and academic authority.
- **Brand Indigo Light** (`rgba(55, 48, 129, 0.1)`): Light indigo for hover states, soft backgrounds, and subtle accents.
- **Brand Indigo Medium** (`rgba(55, 48, 129, 0.7)`): Medium opacity for secondary text within indigo contexts.
- **Brand Indigo Dark** (`rgba(55, 48, 129, 0.9)`): Near-full opacity for text on light backgrounds.

### Accent
- **Amber/Orange** (`#f59e0b`): Warm accent for star ratings, badge highlights, and "Bestseller" / "Most Popular" tags. Creates visual warmth against the cool indigo.
- **Amber Light** (`rgba(251, 191, 36, 0.1)`): Light amber for soft badge backgrounds.
- **Success Green** (`#2ba57d`): Used for success indicators, enrollment counts, and positive metrics.
- **Green Light** (`rgba(43, 165, 125, 0.1)`): Light green for soft success backgrounds.

### Surface
- **Canvas** (`#ffffff`): The default page background.
- **Hairline** (`#e2e8f0`): 1px solid borders — input borders, card chrome, divider lines. A cool slate gray.
- **Surface Light** (`#f8fafc`): Very light gray for alternating section backgrounds.
- **Surface Purple Light** (`#f5f3ff`): Light purple tint for subtle indigo-tinted backgrounds.
- **Surface Purple Muted** (`#f0eaff`): Muted purple for card hover states and soft accents.

### Text
- **Ink** (`#2d3748`): Default text and headings. A deep slate gray.
- **Body** (`#64748b`): Secondary text, captions, and descriptions. A medium slate.
- **Muted** (`oklch(0.446 0.03 256.802)`): Lower-priority text — placeholders, fine print.

### Gradients
- **Hero Gradient** (`linear-gradient(to right bottom, rgba(248, 250, 252, 0.3) 0%, #ffffff 50%, rgba(55, 48, 129, 0.05) 100%)`): Subtle gradient on hero sections adding depth.
- **Overlay Gradient** (`linear-gradient(to top, rgba(0, 0, 0, 0.2) 0%, transparent 100%)`): Used on image overlays for text legibility.

---

## Typography

### Font Family
A single system family carries every typographic role: **Inter** (with `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif` fallback). Weights 400 / 500 / 600 / 700 / 800 / 900 are present. The brand uses 700 for primary headings, 900 for high-impact section titles, and 400-500 for body and UI elements.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `display-xl` | 36px | 700 | 45px | normal | Hero headlines, page titles. |
| `display-lg` | 24px | 900 | 30px | -0.6px | Section headlines, high-impact headings. |
| `display-md` | 24px | 700 | 32px | normal | Sub-section headlines. |
| `display-sm` | 20px | 700 | 28px | normal | Card headlines, feature titles. |
| `heading-lg` | 16px | 700 | 20px | -0.35px | Compact section headers (Why CA?). |
| `heading-md` | 14px | 700 | 17.5px | normal | Tab labels, small headers. |
| `body-lg` | 16px | 400 | 24px | normal | Lead paragraphs, descriptions. |
| `body-md` | 16px | 400 | 24px | normal | Default body text. |
| `body-sm` | 14px | 400 | 20px | normal | Secondary body, captions. |
| `body-sm-strong` | 14px | 500 | 20px | normal | Navigation links, button labels. |
| `caption` | 14px | 500 | 20px | normal | Badge labels, metadata. |
| `caption-sm` | 12px | 500 | 16px | normal | Small badges, fine print. |
| `button-lg` | 16px | 500 | 24px | normal | Primary button labels. |
| `button-md` | 14px | 500 | 20px | normal | Secondary button labels. |

### Principles
- **Weight ceiling at 900.** The brand uses 900 only for high-impact section headlines (e.g., "Empower your career with CA.").
- **Bold (700) is the primary heading weight.** Hero titles, card headings, and feature titles use 700.
- **Negative tracking at display sizes.** `-0.6px` at 24px weight 900, `-0.35px` at 14px weight 700. Tight kerning adds professionalism.
- **Single family across the system.** Inter handles every role from hero display to fine print.

### Font Substitutes
Inter is freely available via Google Fonts. Open-source substitutes:
- **Alternative** — *DM Sans* weights 400 / 500 / 600 / 700 with similar x-height and optical balance.
- **Premium alternative** — *Plus Jakarta Sans* for a slightly more geometric feel.

---

## Layout

### Spacing System
- **Base unit**: 4px (with frequent 2px / 6px / 8px sub-multiples).
- **Tokens**: `xs` 2px · `sm` 4px · `md` 8px · `lg` 12px · `xl` 16px · `2xl` 20px · `3xl` 24px · `4xl` 32px · `5xl` 40px · `6xl` 48px.
- **Section padding**: Hero / content bands use `4xl` 32px gutters with generous vertical spacing.
- **Card interior padding**: Feature and content cards sit at `4xl` 32px.

### Grid & Container
- Marketing container is wide with `4xl` 32px gutters (max-width ~1200px centered).
- Course card grid: 3-up at desktop with equal sizing.
- Stats carousel: 7-up at desktop with horizontal scroll.
- Footer: 4-column grid at desktop.

### Responsive Strategy

#### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Mobile | < 640px | Hero stacks; grids 1-up; hamburger nav. |
| Tablet | 640–1024px | 2-up grids; condensed navigation. |
| Desktop | ≥ 1024px | Full multi-up grids; full navigation. |

#### Touch Targets
Buttons render at ~40px (12px vertical padding + 20px line-height). WCAG AA met.

#### Collapsing Strategy
- Nav: full link row at desktop. Hamburger at mobile.
- Course card grid: 3-up at desktop, 2-up at tablet, 1-up at mobile.
- Stats section: horizontal scroll carousel at all sizes.
- Footer: 4-column at desktop, 2-column at tablet, 1-column at mobile.

#### Image Behavior
- Hero: full-width background images with gradient overlays.
- Course cards: 16:9 ratio images with rounded corners.
- Student avatars: circular with fixed dimensions.
- Alumni logos: grayscale with hover colorization.

---

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| Level 0 — Flat | No shadow, no border. | Default bands, inline elements. |
| Level 1 — Hairline | 1px solid `#e2e8f0` border on white. | Default card chrome and input borders. |
| Level 2 — Subtle | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | Course cards, content containers. |
| Level 3 — Elevated | Multi-stop layered shadow with indigo tint. | Featured cards, pricing sections. |
| Level 4 — Modal | Heavy overlay with `rgba(0,0,0,0.25)` backdrop. | Dialog/modal surfaces. |

### Decorative Depth
- The indigo-purple primary color provides visual depth through pure color contrast against the white canvas.
- Gradient backgrounds on hero sections add subtle atmospheric depth.
- Subtle box-shadows on cards provide lift without heavy material design.

---

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `none` | 0px | Full-bleed bands. |
| `xs` | 2px | Tight inline elements. |
| `sm` | 4px | Small UI elements, inputs. |
| `md` | 10px | Buttons, navigation elements. |
| `lg` | 12px | Medium containers. |
| `xl` | 16px | Course cards, content containers. |
| `2xl` | 24px | Large feature cards. |
| `full` | 9999px / 3.35e+07px | Badges, tags, status pills, avatars. |

---

## Components

### Buttons

**`button-primary`** — the canonical indigo CTA.
- Background `#373081`, text white, label `button-lg` (16px weight 500), padding `8px 12px`, shape `md` 10px radius.

**`button-secondary`** — the white outline CTA.
- Background transparent, text `#373081`, 1px solid `#e2e8f0` border, same typography + padding + shape.

**`button-ghost`** — the borderless text button.
- Background transparent, text `#64748b`, no border, body-sm-strong typography.

**`button-icon`** — the icon-only circular button.
- Background transparent, ink icon, shape `full` 9999px.

**`button-badge`** — the pill-shaped badge button.
- Background `rgba(55, 48, 129, 0.1)`, text `#373081`, shape `full` 9999px.

### Cards & Containers

**`card-course`** — the canonical course card.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, padding `4xl` 32px, shape `xl` 16px. Subtle Level 2 shadow.

**`card-feature`** — the feature highlight card.
- Background `rgba(55, 48, 129, 0.05)`, text `#373081`, padding `4xl` 32px, shape `2xl` 24px.

**`card-stat`** — the statistics counter card.
- Background white, text `#373081`, padding `3xl` 24px, shape `xl` 16px. Animated counter.

**`card-testimonial`** — the student success story card.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, padding `4xl` 32px, shape `xl` 16px.

**`card-branch`** — the branch/location card.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, padding `4xl` 32px, shape `xl` 16px.

### Inputs & Forms

**`text-input`** — the canonical text input.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, body-md typography, padding `md` 8px `lg` 12px, shape `sm` 4px.

**`search-input`** — the search input with icon.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, body-md typography, padding `md` 8px `lg` 12px, shape `xl` 16px.

**`select-input`** — the dropdown select.
- Background white, text `#2d3748`, 1px solid `#e2e8f0`, body-md typography, padding `md` 8px `lg` 12px, shape `sm` 4px.

### Navigation

**`nav-bar`** — the sticky top nav.
- Background white with 80% opacity (backdrop blur), text `#2d3748`, padding `lg` 12px `4xl` 32px, 1px solid `#e2e8f0` bottom border.

**`nav-link`** — link items inside `nav-bar`.
- Text `#2d3748`, set in `body-sm-strong` (14px weight 500), padding `6px 12px`.

**`nav-link-active`** — active navigation link.
- Background `#373081`, text white, shape `md` 10px.

**`footer`** — the footer band.
- Background dark (image-based), text white, padding `5xl` 40px `4xl` 32px. Body in `body-sm`.

**`bottom-bar`** — the fixed bottom contact bar.
- Background white, text `#2d3748`, padding `md` 8px `4xl` 32px, 1px solid `#e2e8f0` top border.

### Badges & Tags

**`badge-premium`** — the "Bestseller" badge.
- Background amber, text `#2d3748`, shape `full`, body-sm typography.

**`badge-popular`** — the "Most Popular" badge.
- Background green, text white, shape `full`, body-sm typography.

**`badge-rating`** — the star rating badge.
- Background amber, text `#2d3748`, shape `full`, caption-sm typography.

**`badge-count`** — the count badge (e.g., "15 Available").
- Background indigo-light, text `#373081`, shape `full`, body-sm typography.

**`badge-level`** — the level indicator (e.g., "3 Levels").
- Background white, text `#64748b`, 1px solid `#e2e8f0`, shape `full`, caption-sm typography.

### Signature Components

**`hero-band`** — the hero section.
- Background gradient (white to light purple), text `#2d3748`, padding `5xl` 40px. Headline in `display-xl` (36px weight 700).

**`hero-video`** — the video hero with overlay.
- Background image with gradient overlay, text white, shape `xl` 16px.

**`stats-carousel`** — the statistics counter carousel.
- Background white, text `#373081`, padding `4xl` 32px, shape `xl` 16px. Animated counters.

**`course-carousel`** — the trending courses carousel.
- Background transparent, padding `4xl` 32px. Cards use `card-course`.

**`testimonial-grid`** — the student success stories grid.
- Background white, padding `4xl` 32px. Cards use `card-testimonial`.

**`alumni-carousel`** — the company logos carousel.
- Background white, padding `4xl` 32px. Logos in grayscale.

**`enquiry-modal`** — the enquiry form modal.
- Background white, text `#2d3748`, padding `4xl` 32px, shape `xl` 16px, Level 4 shadow with `rgba(0,0,0,0.25)` backdrop.

**`course-detail-hero`** — the course detail page hero.
- Background white, text `#2d3748`, padding `4xl` 32px. Includes breadcrumb, badges, and pricing.

**`course-roadmap`** — the course roadmap/timeline.
- Background indigo, text white, padding `4xl` 32px, shape `xl` 16px.

---

## Do's and Don'ts

### Do
- Reserve `#373081` (Brand Indigo) for every primary CTA, active navigation state, and brand accent. Deep indigo is the conversion colour.
- Use the amber accent (`#f59e0b`) for star ratings, badges, and highlight tags. It creates warmth against the cool indigo.
- Set hero headlines in `display-xl` (36px weight 700) with normal tracking.
- Use Inter across every typographic role — it's the brand's single family.
- Use `md` 10px radius for buttons, `xl` 16px for cards, `full` for badges. The brand's geometry is generous and approachable.
- Use subtle multi-stop drop-shadows on cards — the brand's distinctive elevation recipe.

### Don't
- Don't promote button weight to 900. The brand's button weight ceiling is 500-600.
- Don't use the indigo color as a full background for large sections. It's reserved for CTAs and accents.
- Don't render badges as sharp rectangles. The brand's badge geometry is always pill-shaped.
- Don't introduce a third primary colour. The indigo + amber palette is the system.
- Don't use heavy material shadows. The brand's elevation is subtle and professional.
- Don't use decorative fonts. Inter carries every role with professional restraint.

---

## Dark Mode

### Overview

Dark mode inverts the brand's light canvas paradigm: the default page becomes a deep charcoal canvas with light text, while the brand indigo (`#373081`) shifts to a lighter, more vibrant indigo-purple (`#6366f1`) for CTAs and accents. The amber accent (`#f59e0b`) remains unchanged as it provides excellent contrast on dark backgrounds. All surface, border, and shadow tokens adapt to the dark palette while preserving the brand's educational trust identity.

### Dark Mode Principles

- **Maintain brand recognition.** The indigo-purple primary remains the dominant brand signal in both modes — only its shade adjusts for contrast.
- **Preserve visual hierarchy.** Dark mode inverts luminance relationships but maintains the same information architecture.
- **Ensure WCAG AA compliance.** All text combinations must meet 4.5:1 contrast ratio minimum.
- **Respect system preference.** Default to the user's OS preference; allow manual override with localStorage persistence.
- **Reduce eye strain.** Dark backgrounds use `#0f172a` (slate-900) as the primary canvas — not pure black — to reduce harsh contrast.

### Dark Mode Color Tokens

| Token | Light Mode | Dark Mode | Use |
|---|---|---|---|
| `--jksc-brand` | `#373081` | `#6366f1` | Primary CTA, active states |
| `--jksc-brand-light` | `rgba(55, 48, 129, 0.1)` | `rgba(99, 102, 241, 0.15)` | Hover states, soft backgrounds |
| `--jksc-brand-medium` | `rgba(55, 48, 129, 0.7)` | `rgba(99, 102, 241, 0.7)` | Secondary text in indigo contexts |
| `--jksc-brand-dark` | `rgba(55, 48, 129, 0.9)` | `rgba(99, 102, 241, 0.9)` | Text on light backgrounds |
| `--jksc-amber` | `#f59e0b` | `#f59e0b` | Star ratings, badges (unchanged) |
| `--jksc-amber-light` | `rgba(251, 191, 36, 0.1)` | `rgba(251, 191, 36, 0.15)` | Soft badge backgrounds |
| `--jksc-green` | `#2ba57d` | `#34d399` | Success indicators (brighter for dark bg) |
| `--jksc-green-light` | `rgba(43, 165, 125, 0.1)` | `rgba(52, 211, 153, 0.15)` | Soft success backgrounds |
| `--jksc-canvas` | `#ffffff` | `#0f172a` | Page background |
| `--jksc-hairline` | `#e2e8f0` | `#1e293b` | Borders, dividers |
| `--jksc-surface-light` | `#f8fafc` | `#1e293b` | Alternating section backgrounds |
| `--jksc-surface-purple` | `#f5f3ff` | `rgba(99, 102, 241, 0.08)` | Subtle indigo-tinted backgrounds |
| `--jksc-surface-purple-muted` | `#f0eaff` | `rgba(99, 102, 241, 0.12)` | Card hover states |
| `--jksc-ink` | `#2d3748` | `#f1f5f9` | Default text, headings |
| `--jksc-body` | `#64748b` | `#94a3b8` | Secondary text, captions |
| `--jksc-muted` | `#94a3b8` | `#64748b` | Lower-priority text |

### Dark Mode Shadows

| Level | Light Mode | Dark Mode | Use |
|---|---|---|---|
| Level 2 — Subtle | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | `0 1px 3px 0 rgba(0,0,0,0.3), 0 1px 2px -1px rgba(0,0,0,0.4)` | Course cards |
| Level 3 — Elevated | Multi-stop with indigo tint | `0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -2px rgba(0,0,0,0.3)` | Featured cards |
| Level 4 — Modal | `rgba(0,0,0,0.25)` backdrop | `rgba(0,0,0,0.6)` backdrop | Modal overlay |

### Dark Mode Component Variations

#### Buttons

**`button-primary`** — Dark mode variant.
- Background `#6366f1` (lighter indigo), text white, same typography + padding + shape.

**`button-secondary`** — Dark mode variant.
- Background transparent, text `#a5b4fc` (light indigo), 1px solid `#334155` border.

**`button-ghost`** — Dark mode variant.
- Background transparent, text `#94a3b8`.

**`button-badge`** — Dark mode variant.
- Background `rgba(99, 102, 241, 0.2)`, text `#a5b4fc`.

#### Cards

**`card-course`** — Dark mode variant.
- Background `#1e293b`, text `#f1f5f9`, 1px solid `#334155`, subtle shadow deepened.

**`card-feature`** — Dark mode variant.
- Background `rgba(99, 102, 241, 0.1)`, text `#a5b4fc`.

**`card-stat`** — Dark mode variant.
- Background `#1e293b`, text `#a5b4fc`.

**`card-testimonial`** — Dark mode variant.
- Background `#1e293b`, text `#f1f5f9`, 1px solid `#334155`.

#### Inputs

**`text-input`** — Dark mode variant.
- Background `#0f172a`, text `#f1f5f9`, 1px solid `#334155`.

**`search-input`** — Dark mode variant.
- Background `#0f172a`, text `#f1f5f9`, 1px solid `#334155`.

#### Navigation

**`nav-bar`** — Dark mode variant.
- Background `rgba(15, 23, 42, 0.9)` with backdrop blur, text `#f1f5f9`, 1px solid `#1e293b` bottom border.

**`nav-link`** — Dark mode variant.
- Text `#cbd5e1`.

**`nav-link-active`** — Dark mode variant.
- Background `#6366f1`, text white.

**`bottom-bar`** — Dark mode variant.
- Background `#1e293b`, text `#f1f5f9`, 1px solid `#334155` top border.

#### Badges

**`badge-premium`** — Dark mode variant.
- Background `#f59e0b`, text `#0f172a` (dark text on amber).

**`badge-popular`** — Dark mode variant.
- Background `#34d399`, text `#0f172a`.

**`badge-count`** — Dark mode variant.
- Background `rgba(99, 102, 241, 0.2)`, text `#a5b4fc`.

**`badge-level`** — Dark mode variant.
- Background `transparent`, text `#94a3b8`, 1px solid `#334155`.

### Dark Mode Toggle Implementation

```html
<!-- Declare support for both themes — MUST be in <head> -->
<meta name="color-scheme" content="light dark">

<!-- Prevent FOUC for users with pinned theme -->
<script>
{
  const colorScheme = localStorage.getItem("jksc-color-scheme");
  if (colorScheme) {
    document.querySelector('meta[name="color-scheme"]').content = colorScheme;
  }
}
</script>
```

```css
:root {
  color-scheme: light dark;
  
  /* Light mode tokens (default) */
  --jksc-brand: #373081;
  --jksc-brand-light: rgba(55, 48, 129, 0.1);
  --jksc-canvas: #ffffff;
  --jksc-ink: #2d3748;
  --jksc-body: #64748b;
  --jksc-hairline: #e2e8f0;
  /* ... other light tokens ... */
  
  /* Dark mode overrides */
  @media (prefers-color-scheme: dark) {
    --jksc-brand: #6366f1;
    --jksc-brand-light: rgba(99, 102, 241, 0.15);
    --jksc-canvas: #0f172a;
    --jksc-ink: #f1f5f9;
    --jksc-body: #94a3b8;
    --jksc-hairline: #1e293b;
    /* ... other dark tokens ... */
  }
}

/* Manual override class */
html[data-theme="dark"] {
  --jksc-brand: #6366f1;
  --jksc-brand-light: rgba(99, 102, 241, 0.15);
  --jksc-canvas: #0f172a;
  --jksc-ink: #f1f5f9;
  --jksc-body: #94a3b8;
  --jksc-hairline: #1e293b;
  /* ... other dark tokens ... */
}

html[data-theme="light"] {
  --jksc-brand: #373081;
  --jksc-brand-light: rgba(55, 48, 129, 0.1);
  --jksc-canvas: #ffffff;
  --jksc-ink: #2d3748;
  --jksc-body: #64748b;
  --jksc-hairline: #e2e8f0;
  /* ... other light tokens ... */
}
```

### Dark Mode Do's and Don'ts

#### Do
- Use `#0f172a` (slate-900) as the dark canvas — never pure black (`#000000`).
- Brighten the brand indigo to `#6366f1` for adequate contrast on dark backgrounds.
- Increase shadow opacity in dark mode — subtle shadows disappear on dark surfaces.
- Use `rgba(99, 102, 241, 0.15)` for soft indigo backgrounds instead of the light mode's `0.1` opacity.
- Maintain the amber accent unchanged — it has sufficient contrast on dark backgrounds.

#### Don't
- Don't use pure black (`#000000`) as a background — it creates harsh contrast and eye strain.
- Don't reduce text contrast — maintain or increase contrast ratios in dark mode.
- Don't remove borders — dark mode benefits from subtle borders to define component boundaries.
- Don't use the light mode brand indigo (`#373081`) on dark backgrounds — it becomes muddy and hard to read.
- Don't invert images or media — keep images in their natural state.

---

## Appendix: Color Tokens (Tailwind CSS)

### Light Mode Tokens

```css
:root {
  /* Brand */
  --jksc-brand: #373081;
  --jksc-brand-light: rgba(55, 48, 129, 0.1);
  --jksc-brand-medium: rgba(55, 48, 129, 0.7);
  --jksc-brand-dark: rgba(55, 48, 129, 0.9);
  
  /* Accent */
  --jksc-amber: #f59e0b;
  --jksc-amber-light: rgba(251, 191, 36, 0.1);
  --jksc-green: #2ba57d;
  --jksc-green-light: rgba(43, 165, 125, 0.1);
  
  /* Surface */
  --jksc-canvas: #ffffff;
  --jksc-hairline: #e2e8f0;
  --jksc-surface-light: #f8fafc;
  --jksc-surface-purple: #f5f3ff;
  --jksc-surface-purple-muted: #f0eaff;
  
  /* Text */
  --jksc-ink: #2d3748;
  --jksc-body: #64748b;
  --jksc-muted: #94a3b8;
}
```

### Dark Mode Tokens

```css
html[data-theme="dark"] {
  /* Brand */
  --jksc-brand: #6366f1;
  --jksc-brand-light: rgba(99, 102, 241, 0.15);
  --jksc-brand-medium: rgba(99, 102, 241, 0.7);
  --jksc-brand-dark: rgba(99, 102, 241, 0.9);
  
  /* Accent */
  --jksc-amber: #f59e0b;
  --jksc-amber-light: rgba(251, 191, 36, 0.15);
  --jksc-green: #34d399;
  --jksc-green-light: rgba(52, 211, 153, 0.15);
  
  /* Surface */
  --jksc-canvas: #0f172a;
  --jksc-hairline: #1e293b;
  --jksc-surface-light: #1e293b;
  --jksc-surface-purple: rgba(99, 102, 241, 0.08);
  --jksc-surface-purple-muted: rgba(99, 102, 241, 0.12);
  
  /* Text */
  --jksc-ink: #f1f5f9;
  --jksc-body: #94a3b8;
  --jksc-muted: #64748b;
}
```

### System Preference Fallback (prefers-color-scheme)

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    /* Brand */
    --jksc-brand: #6366f1;
    --jksc-brand-light: rgba(99, 102, 241, 0.15);
    --jksc-brand-medium: rgba(99, 102, 241, 0.7);
    --jksc-brand-dark: rgba(99, 102, 241, 0.9);
    
    /* Accent */
    --jksc-amber: #f59e0b;
    --jksc-amber-light: rgba(251, 191, 36, 0.15);
    --jksc-green: #34d399;
    --jksc-green-light: rgba(52, 211, 153, 0.15);
    
    /* Surface */
    --jksc-canvas: #0f172a;
    --jksc-hairline: #1e293b;
    --jksc-surface-light: #1e293b;
    --jksc-surface-purple: rgba(99, 102, 241, 0.08);
    --jksc-surface-purple-muted: rgba(99, 102, 241, 0.12);
    
    /* Text */
    --jksc-ink: #f1f5f9;
    --jksc-body: #94a3b8;
    --jksc-muted: #64748b;
  }
}
```

---

## Appendix: Border Radius Tokens

```css
:root {
  --jksc-radius-none: 0px;
  --jksc-radius-xs: 2px;
  --jksc-radius-sm: 4px;
  --jksc-radius-md: 10px;
  --jksc-radius-lg: 12px;
  --jksc-radius-xl: 16px;
  --jksc-radius-2xl: 24px;
  --jksc-radius-full: 9999px;
}
```

---

## Appendix: Shadow Tokens

### Light Mode Shadows

```css
:root {
  --jksc-shadow-none: none;
  --jksc-shadow-hairline: 1px solid var(--jksc-hairline);
  --jksc-shadow-subtle: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --jksc-shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --jksc-shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### Dark Mode Shadows

```css
html[data-theme="dark"] {
  --jksc-shadow-hairline: 1px solid var(--jksc-hairline);
  --jksc-shadow-subtle: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
  --jksc-shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --jksc-shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --jksc-shadow-hairline: 1px solid var(--jksc-hairline);
    --jksc-shadow-subtle: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
    --jksc-shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
    --jksc-shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
  }
}
```

---

## Appendix: Typography Scale (CSS)

```css
:root {
  --jksc-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  
  --jksc-text-display-xl: 700 36px/45px var(--jksc-font-family);
  --jksc-text-display-lg: 900 24px/30px var(--jksc-font-family);
  --jksc-text-display-md: 700 24px/32px var(--jksc-font-family);
  --jksc-text-display-sm: 700 20px/28px var(--jksc-font-family);
  --jksc-text-heading-lg: 700 16px/20px var(--jksc-font-family);
  --jksc-text-heading-md: 700 14px/17.5px var(--jksc-font-family);
  --jksc-text-body-lg: 400 16px/24px var(--jksc-font-family);
  --jksc-text-body-md: 400 16px/24px var(--jksc-font-family);
  --jksc-text-body-sm: 400 14px/20px var(--jksc-font-family);
  --jksc-text-body-sm-strong: 500 14px/20px var(--jksc-font-family);
  --jksc-text-caption: 500 14px/20px var(--jksc-font-family);
  --jksc-text-caption-sm: 500 12px/16px var(--jksc-font-family);
  --jksc-text-button-lg: 500 16px/24px var(--jksc-font-family);
  --jksc-text-button-md: 500 14px/20px var(--jksc-font-family);
}
```

---

*Document generated from analysis of [jkshahclasses.com](https://jkshahclasses.com/) — August 2026*
