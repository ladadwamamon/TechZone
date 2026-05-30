---
name: Site settings cross-artifact coupling
description: The untyped SettingsMap key/value contract shared between admin CMS and storefront
---

# Site settings coupling (admin CMS ⇄ storefront)

Site settings travel as an **untyped** `SettingsMap` (`{ [key: string]: unknown }`)
over `GET /api/settings` (public) and `GET/PUT /api/admin/settings`. Because the
type is `unknown`, **no compiler check** enforces that the admin writes the same
shape the storefront reads — a renamed key silently breaks the storefront.

The agreed keys and their nested shape (defined in admin `Settings.tsx`, mirrored
in storefront `src/lib/settings.ts`):
- `announcementBar`: `{ enabled, text, link }`
- `hero`: `{ title, subtitle, ctaText, ctaLink, image }`
- `contact`: `{ phone, email, address, hours }`
- `social`: `{ facebook, instagram, twitter, tiktok, youtube, whatsapp }`
- `features`: `Array<{ title, description, icon }>` (icon is a name string mapped to a Lucide icon)

**Why:** the storefront consumes these via `useSiteSettings()` (wraps the generated
`useGetPublicSettings`). All consumers expect safe defaults when a key/value is
absent, so missing settings must never crash a page.

**How to apply:** when adding/renaming a settings field, change BOTH the admin
editor and the storefront `lib/settings.ts` (interfaces + defaults) in lockstep,
and keep a sensible fallback. The storefront hero override only replaces the
HeroSlider's first slide when `hero.title` is non-empty.
