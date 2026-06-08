---
name: Role seeding on boot
description: Why system roles are insert-only (not upsert) at startup, and why bootstrap is awaited before listen.
---

# Role seeding at server boot

`seedSystemRoles()` is intentionally **insert-only** — it skips keys that already exist in `rolesTable`, it does NOT upsert/overwrite their permissions.

**Why:** Roles are user-editable permission templates (a product requirement). System roles (super_admin / content_editor / order_manager) are seeded once on first boot, but admins can then customize their permissions. Upserting defaults on every boot would silently wipe those customizations and reintroduce drift in the opposite direction.

**How to apply:** If you add a new system role default, it will seed on next boot. If you change an existing system role's default permissions in `SYSTEM_ROLE_DEFAULTS`, that change will NOT propagate to already-seeded DBs — you must migrate/update those rows deliberately, never via blanket upsert.

Bootstrap ordering: `ensureRolesReady()` (seed + cache refresh) is **awaited before `app.listen`** so the RBAC cache is populated before any request is served. Do not move it back into the listen callback — early requests would otherwise fall back to `SYSTEM_ROLE_DEFAULTS` and miss custom roles.
