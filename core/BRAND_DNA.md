# 🎓 LPU FIND — BRAND DNA
## Complete visual identity. Apply to ALL UI work without deviation.
## Last updated: June 2026

---

## UI STYLE — BENTO GRID & SYSTEM RULES

Bento Grid with modular card layout — every metric, list, or control lives in a clear, bounded card. 

*   **BANNED Everywhere:** Glassmorphism, backdrop-blur, neumorphism, claymorphism, 3D transforms, full-page gradients.
*   **Touch Targets:** All interactive elements must have a minimum **44px** touch target for accessibility and mobile/tablet ease of use.
*   **Marketing/Public Canvas:** Always rendered in the **Light Theme** (e.g. landing pages).
*   **Dashboard/Admin Canvas:** Always rendered in the **Dark Theme** (e.g. owner/manager panels).

---

## COLOUR SYSTEM

⚠️ **DEPRECATED COLORS & FONTS (Remove on sight):** 
`#5B2D8E` (old violet), `#00C2B8` (old teal), `#0D0D1A` (old dark background), `#0F172A` (old navy background), `#1E293B` (old slate card), `#334155` (old border), `#1E40AF` (old blue), `#7C3AED` (old violet), `#F8FAFC` (old light text), and the **Syne** font.

### 🌤 Light Theme (Marketing / Public Pages)
| Token | Hex/RGB Value | Color Name | Usage |
|---|---|---|---|
| **Canvas** | `#FAF8F3` | Warm Parchment | Page background |
| **Surface** | `#FFFFFF` | Pure White | Standard card background |
| **Surface-alt** | `#F3F1EB` | Soft Parchment | Alternate section / background panels |
| **Surface-raised** | `#ECEAE2` | Light Warm Grey | Raised surfaces / dropdowns |
| **Border** | `rgba(0,0,0,0.07)` | Translucent Slate | Subtle dividers / card borders |
| **Border-strong** | `rgba(0,0,0,0.14)` | Mid Translucent | Active / hover borders |
| **Text Primary** | `#1C1B18` | Ink Black | Main headings, body text, data values |
| **Text Secondary** | `#6E6B5F` | Stone Grey | Subheadings, labels, secondary text |
| **Text Muted** | `#A8A49A` | Muted Clay | Timestamps, placeholders, inactive states |
| **Accent** | `#C96442` | Warm Terracotta | Primary buttons, active markers, brand highlights |
| **Accent-hover** | `#B5572E` | Deep Terracotta | Button hover states |
| **Accent-light** | `#F2E8E2` | Terracotta Mist | Highlight panels / badge backgrounds |
| **Success** | `#059669` | Emerald Green | Positive metrics, success states |
| **Error** | `#DC2626` | Crimson Red | Negative metrics, errors, alert states |

### 🌙 Dark Theme (Dashboard & Admin Panels)
| Token | Hex/RGB Value | Color Name | Usage |
|---|---|---|---|
| **Canvas** | `#1E1C19` | Charcoal Parchment | Main dashboard background |
| **Surface** | `#2A2825` | Dark Clay | Standard card background |
| **Surface-alt** | `#322F2B` | Deep Clay | Alternate panels / sidebar background |
| **Surface-raised** | `#3D3A35` | Medium Dark Clay | Raised surfaces, popovers, active cards |
| **Border** | `rgba(255,255,255,0.07)` | Translucent White | Subtle dividers / card borders |
| **Border-strong** | `rgba(255,255,255,0.12)` | Mid Translucent White| Active / hover borders |
| **Text Primary** | `#F5F2EC` | Cream | Main headings, body text, metric values |
| **Text Secondary** | `#A09C93` | Warm Grey | Subheadings, labels, secondary text |
| **Text Muted** | `#6B6760` | Dusk Grey | Timestamps, placeholders, inactive states |
| **Accent** | `#D97757` | Dusty Terracotta | Primary buttons, active markers, brand highlights |
| **Accent-hover** | `#C96442` | Warm Terracotta | Button hover states |
| **Accent-light** | `#3D2419` | Dark Terracotta Rust | Highlight panels / badge backgrounds |
| **Success** | `#059669` | Emerald Green | Positive trends, successful statuses |
| **Error** | `#DC2626` | Crimson Red | Negative trends, alerts, critical statuses |

### Shared Lead Badges (Both Themes)
<!-- NOTE: Badge naming (Hot/Warm/Cold Lead) may need remapping to Strong/Possible/Weak MatchBadge terminology for LPU Find — confirm before reuse -->
*   **Hot Lead:** Text `#DC2626` with Background `#FEF2F2` (Crimson on Pale Red)
*   **Warm Lead:** Text `#D97706` with Background `#FFFBEB` (Amber on Pale Yellow)
*   **Cold Lead:** Text `#6B7280` with Background `#F9FAFB` (Slate Grey on Off-White)

---

## TYPOGRAPHY

**Fonts:** **Inter** (via `next/font/google`) or **Geist Sans** (fallback). 
*No secondary font is permitted. Hierarchy must be achieved entirely through weight, size, and color scaling.*

| Element | Size | CSS Class / Tailwind | Weight | Notes |
|---|---|---|---|---|
| **H1** | 32px | `text-3xl` | 700 (Bold) | Main page headings |
| **H2** | 24px | `text-2xl` | 700 (Bold) | Card headers, panel titles |
| **H3** | 18px | `text-lg` | 600 (Semibold) | Metric sub-labels |
| **H4** | 14px | `text-sm` | 600 (Semibold) | Secondary headings |
| **Body** | 14px | `text-sm` | 400 (Regular) | Line-height 1.6 (`leading-6`) |
| **Metric Numbers** | 48px | `text-5xl` | 700 (Bold) | Tracking-wider (0.05em) - *GCI Display* |
| **Table Text** | 13px | `text-xs` | 400 (Regular) | Line-height normal |
| **Badge Text** | 12px | `text-xs` | 600 (Semibold) | Tracking-wide |

*   **Letter Spacing:** Apply `tracking-wide` (0.025em) to body copy in Dark Mode to ensure high legibility.

---

## LOGO DIRECTION

Concept: LPU official crest/logo + 'LPU Find' wordmark.
- Icon: Official LPU logo asset (SVG), sourced from /public/lpu-logo.svg. 
  Do not redraw, recolor, or reinterpret the university crest — use the asset 
  as provided, unmodified, at all sizes.
- Fallback (only if /public/lpu-logo.svg is missing): 32x32px rounded-md badge, 
  bg Accent-light, bold 'LF' initials in Accent color, centered.
- Wordmark: 'LPU Find' in Inter Bold, tracking-wide.
  - Light Theme: #1C1B18 (Ink Black)
  - Dark Theme: #F5F2EC (Cream)
- Sizing: scales to 16px (favicon), 40px (WhatsApp/profile), 24px (header), 
  up to 120px (hero).

---

## COMPONENT SPECS

### 1. Metric Card (Bento Card)
*   **Light Theme:** bg `#FFFFFF`, border 1px `rgba(0,0,0,0.07)`, hover bg `#F3F1EB`, hover border `rgba(0,0,0,0.14)`
*   **Dark Theme:** bg `#2A2825`, border 1px `rgba(255,255,255,0.07)`, hover bg `#322F2B`, hover border `rgba(255,255,255,0.12)`
*   **Layout:** `p-5` (20px padding), rounded corners (8px / `rounded-lg`).
*   **Typography:** Label 14px Font-Medium (Text Secondary), Metric Number 48px Bold (Text Primary) with 10px spacing.
*   **GCI Metric Rule:** Every Gross Commission Income (GCI) metric card MUST display assumptions in an interactive tooltip on hover.
*   **Trend line:** Sparkline height 24px, 2px thickness. Upward trend: `#059669` (Emerald); Downward trend: `#DC2626` (Crimson).

### 2. Lead Score Badge
*   **Style:** Rounded rectangle (`rounded-md` 6px), `px-3 py-1`, 12px Semibold tracking-wide.
*   **Hot:** Text `#DC2626` | BG `#FEF2F2`
*   **Warm:** Text `#D97706` | BG `#FFFBEB`
*   **Cold:** Text `#6B7280` | BG `#F9FAFB`

### 3. Data Table Row
*   **Height:** `h-12` (48px table row height).
*   **Light Theme:** Background alternation between `#FFFFFF` and `#F3F1EB`. Border-bottom 1px `rgba(0,0,0,0.07)`.
*   **Dark Theme:** Background alternation between `#2A2825` and `#322F2B`. Border-bottom 1px `rgba(255,255,255,0.07)`.
*   **Typography:** Text 13px (Text Primary).
*   **Interactive States (Hover/Select):**
    *   **Light Hover:** bg `#ECEAE2`, cursor-pointer, border-left 3px solid `#C96442`
    *   **Dark Hover:** bg `#3D3A35`, cursor-pointer, border-left 3px solid `#D97757`
*   **Actions:** 28×28px touch target area icons, Text Muted/Secondary, hover color changes to Accent.

### 4. Primary Button
*   **Min-Height:** 44px touch target.
*   **Light Theme:** bg `#C96442`, text `#FFFFFF`, 14px Semibold, `px-6 py-3`, `rounded-lg` (8px). Hover: bg `#B5572E`.
*   **Dark Theme:** bg `#D97757`, text `#1E1C19`, 14px Semibold, `px-6 py-3`, `rounded-lg` (8px). Hover: bg `#C96442`.

### 5. Secondary Button
*   **Min-Height:** 44px touch target.
*   **Light Theme:** bg `#FFFFFF`, border 1px `rgba(0,0,0,0.14)`, text `#1C1B18`, `px-6 py-3`, `rounded-lg`. Hover bg: `#F3F1EB`.
*   **Dark Theme:** bg `#2A2825`, border 1px `rgba(255,255,255,0.12)`, text `#F5F2EC`, `px-6 py-3`, `rounded-lg`. Hover bg: `#322F2B`.

### 6. Input Field
*   **Light Theme:** bg `#FFFFFF`, border 1px `rgba(0,0,0,0.14)`, text `#1C1B18`, placeholder `#A8A49A`. Focus: border `#C96442`, ring `rgba(201,100,66,0.15)`.
*   **Dark Theme:** bg `#2A2825`, border 1px `rgba(255,255,255,0.12)`, text `#F5F2EC`, placeholder `#6B6760`. Focus: border `#D97757`, ring `rgba(217,119,87,0.15)`.
*   **Error State:** Border `#DC2626` (both themes).

---

## ACCESSIBILITY & INCLUSIVITY RULES

1.  **Contrast:** Maintain a minimum of 4.5:1 text-to-background contrast ratio (the palette parameters achieve over 7:1 for all major text tokens).
2.  **Size Constraints:** Interactive links, buttons, table actions, and pagination items must maintain a **minimum 44×44px** active clickable bounding area.
3.  **Redundant Coding:** Do not convey status or priority using color alone. Provide text badges or icons alongside color-coded elements (e.g., lead scoring badges use both label text and color background).

---

## ONE-PARAGRAPH BRAND DESCRIPTION (For Designer & LLM Context)

LPU Find is a campus lost & found matching and notification system for LPU students and staff, utilizing a unified two-theme Bento Grid design. The Light Theme (for public marketing pages) utilizes a warm parchment canvas (#FAF8F3), pure white surfaces (#FFFFFF), and soft parchment accents, contrasted by a warm terracotta accent (#C96442). The Dark Theme (for dashboards and management interfaces) employs a charcoal parchment canvas (#1E1C19), dark clay card surfaces (#2A2825), and cream primary typography (#F5F2EC), highlighted by a dusty terracotta accent (#D97757). Typography is strictly set in Inter or Geist Sans, showcasing large tracking-wider 48px metrics for financial readouts and structured 13px tables for lead queues. The logo is a sharp, geometric 3-line dragon head silhouette in the theme's matching accent color, conveying growth, speed, and precision. The overall aesthetic is warm, high-contrast, premium, and professional, optimized for principal directors reviewing agency performance.

---

🎓 LPU Find — Lost something on campus? Someone probably found it.