# Design System Document: The Bespoke Grooming Experience

## 1. Overview & Creative North Star
**Creative North Star: "The Modern Atelier"**
This design system moves away from the generic "tech-heavy" booking platform and into the realm of a high-end editorial lookbook. The goal is to evoke the feeling of a private club—exclusive, masculine, and meticulously curated. We achieve this through a "less-is-more" philosophy: expansive negative space, high-contrast typography, and a rejection of standard structural UI elements like heavy borders and rigid grids. By using intentional asymmetry and layered surfaces, we create a digital experience that feels as premium as a hot towel shave.

---

## 2. Colors & Tonal Depth
The palette is rooted in the "Midnight & Gold" spectrum. We utilize deep charcols and blacks to provide a canvas where the gold accents act as a "light source" rather than just a color.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid lines to separate sections. Structure must be defined by shifts in background tone. 
*   Use `surface` for the primary background.
*   Use `surface-container-low` for secondary content blocks.
*   Use `surface-container-highest` for interactive elements like cards.
Boundaries should feel like different materials meeting, not like lines drawn on a page.

### The "Glass & Gradient" Rule
To prevent the UI from feeling "flat" or "heavy," use Glassmorphism for floating overlays (like mobile navigation bars or booking modals). 
*   **Tokens:** Use `surface` at 80% opacity with a `24px` backdrop-blur.
*   **Signature Gradients:** For primary CTAs, use a linear gradient from `primary` (#f2ca50) to `primary_container` (#d4af37) at a 135-degree angle to simulate the sheen of polished brass.

---

## 3. Typography: The Editorial Edge
The contrast between the classic Serif and the architectural Sans-Serif is the backbone of this system’s luxury feel.

*   **Display & Headlines (Noto Serif):** Used for storytelling, service names, and high-level headings. The serif adds a sense of tradition and "Master Barber" authority.
*   **Body & Titles (Manrope):** A clean, modern sans-serif that ensures legibility in the functional parts of the app (booking times, price lists, and settings).

**Hierarchy Principle:** Always pair a `display-lg` headline with a `label-md` uppercase kicker to create an editorial layout that feels like a premium magazine spread.

---

## 4. Elevation & Depth: Tonal Layering
In this system, elevation is not about "lifting" an object with a shadow; it is about "layering" light and texture.

*   **The Layering Principle:** Stack containers to define hierarchy. Place a `surface_container_highest` booking slot on a `surface_container_low` calendar background. This creates a soft, tactile depth.
*   **Ambient Shadows:** If an element must float (e.g., a "Confirm Booking" button), use an ultra-diffused shadow. 
    *   *Spec:* `0px 20px 40px rgba(0, 0, 0, 0.4)`. The shadow should feel like a soft glow of darkness, never a harsh outline.
*   **The "Ghost Border" Fallback:** For secondary buttons or input fields, use the `outline_variant` token at **15% opacity**. This provides a "suggestion" of a boundary that disappears into the luxury aesthetic.

---

## 5. Components

### Buttons: The Primary Touchpoints
*   **Primary Action:** Background is the Signature Gold Gradient. Text is `on_primary`. Shape is `DEFAULT` (0.5rem) for a masculine, architectural feel.
*   **Secondary Action:** No background. A "Ghost Border" using `primary_container` at 30% opacity. Text is `primary`.
*   **Tertiary Action:** Pure text using `label-md` in all caps with `0.1em` letter spacing.

### Cards & Lists: The Service Menu
*   **Constraint:** Zero dividers. Use vertical spacing (32px or 48px) to separate service categories.
*   **Styling:** Service cards should use `surface_container_low`. On hover/selection, transition to `surface_container_highest` with a `primary` gold glow on the left edge (2px width).

### Input Fields: The Consultation
*   **Styling:** Minimalist. Only a bottom border using `outline_variant` at 40% opacity. When focused, the border transitions to `primary` gold and the label (Manrope) floats upward using `label-sm`.

### Signature Component: The "Time Slot" Grain
*   Instead of a standard grid of buttons, booking times should be presented as a vertical scrolling list of `surface_container_highest` tiles. Available slots feature a subtle gold `outline` (20% opacity), while unavailable slots are `surface_dim` with 30% opacity text.

---

## 6. Do’s and Don'ts

### Do:
*   **Do** use asymmetrical layouts. Place a large `display-md` headline on the left with a small `body-md` description offset to the right.
*   **Do** use high-quality, desaturated photography. Images of the barbershop should be moody, high-contrast, and grainy.
*   **Do** maximize white space (or "Black Space"). Luxury is defined by the space you *don't* fill.

### Don't:
*   **Don't** use 100% white (#FFFFFF). Always use `on_surface` (#e5e2e1) to keep the contrast sophisticated and easy on the eyes in dark mode.
*   **Don't** use "Standard" shadows. If the shadow looks like a default CSS property, it’s too heavy.
*   **Don't** use rounded-corners "full" (pills) for primary buttons; stick to the `DEFAULT` (8px) or `md` (12px) to maintain a structural, masculine silhouette.