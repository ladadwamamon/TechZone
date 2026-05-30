---
name: backdrop-filter traps position:fixed descendants
description: Why fixed overlays/drawers rendered inside a blurred panel get confined; portal them out.
---

# backdrop-filter creates a containing block for fixed descendants

Any ancestor with `backdrop-filter` (or `filter`/`transform`/`perspective`) becomes
the containing block for `position: fixed` descendants. Those descendants then size
and position against that ancestor's box, NOT the viewport.

**Symptom seen:** the storefront mobile hamburger drawer "opened but showed nothing"
— it was rendered inside `<header class="glass-panel">`, and `glass-panel` applies
`backdrop-filter: blur(12px)`, so the full-screen `fixed inset-0` overlay + drawer
were trapped inside the small header box. Desktop hid it via `md:hidden`, so it went
unnoticed there.

**Why:** CSS spec — backdrop-filter establishes a containing block. This is the same
trap as `transform`/`filter` ancestors.

**How to apply:** Render full-viewport overlays, drawers, and modals via
`createPortal(node, document.body)` so they escape any blurred/transformed ancestor.
Don't try to fix it by tweaking z-index or position — the containing block is the
problem, not stacking.

**Testing note:** A Playwright force-click on a drawer link can falsely report
"pointer events intercepted / no navigation" when an in-panel `sticky` header (higher
z) overlaps a link the harness scrolled under it. Verify by clicking a top-of-panel
link too before assuming a real navigation bug — real users were fine.
