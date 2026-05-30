---
name: Auth bootstrap form mount race
description: Why public auth forms (login/setup) drop keystrokes, and the gating rule that fixes it
---

# Controlled auth forms must not mount before auth bootstrap settles

A public, auth-adjacent page (e.g. the admin login/first-setup page) that renders
react-hook-form controlled fields wrapped in shadcn `FormControl` (radix `Slot`) +
`Input` **while the auth bootstrap query is still in flight** can silently drop the
first keystrokes: the field reads back empty even though the user typed.

**Why:** the auth provider runs a "who am I" query on mount (e.g. `GET
/api/admin/auth/me`, returns 401 for anon). When it resolves, the auth context value
flips and re-renders the page. If that re-render lands while the user is typing into a
`Slot`-cloned controlled input, the in-progress value is lost. Plain uncontrolled
inputs and `Controller`-without-`Slot` fields survive it; the `Slot` + controlled +
mid-typing re-render combination is what breaks. Protected pages never hit this
because they only mount *after* auth settles (behind the route guard) — only the
public auth page renders during the loading window.

**How to apply:** in any page that mounts controlled forms during auth bootstrap,
read the auth loading flag and render a loading placeholder until it settles; mount
the form only once `isLoading` is false. Do not rely on adding extra fields or
restarting the dev server — those only masked it intermittently. Symptom signature:
typing works on raw `<input>` but not on RHF/`FormControl` fields, and the failure is
load-timing dependent (first interaction after load).
