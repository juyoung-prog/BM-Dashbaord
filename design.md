# BeautyMaster Dashboard Design System

## 1. Philosophy

This dashboard is an **operational tool**, not a marketing surface.

- The UI should not express brand personality visually
- The UI should not compete with data
- The UI should prioritize clarity, speed, and decision-making

> Design supports decisions. It does not seek attention.

---

## 2. Core Principles

### Data First
- Data is the primary focus
- UI exists to structure and guide interpretation

### Low-Emotion Interface
- Avoid expressive colors and visual noise
- Maintain a calm, neutral tone

### Functional Clarity
- Every element must serve a purpose
- Remove anything decorative

### Consistency
- Reuse patterns instead of creating new ones
- Predictability improves usability

---

## 3. Color System

### Brand Separation

Brand color is intentionally **not used as a UI color**.

```css
--accent: #E81D25;   /* destructive / error only */
--primary: #1E293B;  /* primary UI interactions */
```

### Color Usage Rules

#### Red (Accent)
Use ONLY for:
- Errors
- Destructive actions (delete, disconnect)
- Critical alerts

Never use for:
- Primary buttons
- Navigation
- Active states

---

#### Primary (Neutral Dark)
Use for:
- Primary buttons
- Key actions
- Core interactions

---

#### Semantic Colors
- Success → Green
- Warning → Orange
- Info → Blue

---

## 4. Layout System

### Structure
- Sidebar → Navigation
- Main → Core data and interaction
- Right Panel → Contextual detail

---

### Right Panel Rules
- Provides context, not duplicate information
- Triggered by selection (not always visible)
- Can be hidden on non-analytical pages (e.g. Influencers, Settings)

---

## 5. Components

### Buttons
- Primary → `--primary`
- Secondary → outline / neutral
- Danger → red only for destructive actions

---

### Cards
- Minimal elevation
- Defined by borders, not heavy shadows
- Used for grouping, not decoration

---

### Tables
- Primary data surface
- High density, low noise
- Subtle row separation

---

## 6. Dark Mode

Dark mode is **rebalanced, not inverted**.

- Avoid pure black
- Use layered surfaces
- Maintain readable contrast
- Reduce visual harshness

---

## 7. Interaction

### Motion
- Subtle only
- ~160ms duration
- No dramatic animation

### Hover
- Slight background or elevation change
- No aggressive color shifts

---

## 8. What We Avoid

- Brand-heavy UI styling
- Decorative gradients
- Excessive shadows
- High-contrast noise
- Red as a primary UI color
- Emotion-driven design decisions

---

## 9. Product Direction

This dashboard is designed to:

- Support real operational decisions
- Scale with increasing data complexity
- Stay usable under high information density

> Good design becomes invisible when the user focuses on decisions.
