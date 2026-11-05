# Radius — Agent Rules & Architecture Guidelines

**Radius** (`/home/emilyjaneryan/radius`) is a mobile-first Personal CRM & Human-to-Human (`.h2h.json`) Card Protocol powered by a Core Graph Database and Hop-Radius Progressive Disclosure, deployed via **GitHub Pages** (`https://mlende.github.io/radius/`) for Google Pixel 9 and backed locally by Python + SQLite (`server.py`, `schema.sql`).

## 1. Strict Privacy & Zero-Plaintext Git Rule (CRITICAL)
- **Public Repository**: `https://github.com/MLEnDE/radius.git` is a public repository hosting free GitHub Pages.
- **Never Commit Plaintext Personal Data**: Never hardcode real contact names, personal notes, or private vectors in git-tracked application files (`index.html`, `src/graph-engine.js`, `src/app.js`, `server.py`, `schema.sql`).
- **Default Public Seed**: `PUBLIC_DEMO_STATE` in `src/graph-engine.js` and `server.py` must always use anonymous sample data (`Alex Rivera (Demo)`, `Contact A (Demo)`, `Contact B (Demo)`).
- **Encrypted Personal Vault**:
  - Plaintext personal network data lives **only** in gitignored `private-vault.local.json` (or in the user's Pixel 9 `localStorage`).
  - To update the encrypted vault in `src/vault.js`, use the `radius-dev-and-vault` skill script (`.agents/skills/radius-dev-and-vault/scripts/update_vault.py`).
  - Always run a privacy grep audit before `git commit` / `git push` to verify zero personal strings appear in tracked code files.

## 2. Non-Destructive Mobile `localStorage` Upgrades
- The user actively builds her personal network on her **Google Pixel 9** in Chrome (`localStorage` key: `radius_v02_state`, vault status key: `radius_v02_vault_unlocked`).
- **Never change `STORAGE_KEY` (`radius_v02_state`) or wipe existing `localStorage` state** when shipping UI or engine updates.
- When introducing new state properties in future versions, merge defaults non-destructively inside `RadiusGraphEngine.prototype.loadState()` so existing contacts, vectors, event tags, and interaction logs on the user's phone are 100% preserved.

## 3. Environment & Tech Stack Constraints
- **Local Runtime**: Use `python3` (`server.py` + `sqlite3`) for local backend/database serving (`http://localhost:8080`). Node/npm is not installed in the base container environment.
- **PWA Requirements (Android / Pixel 9)**:
  - `manifest.json` must maintain separate `"purpose": "any"` and `"purpose": "maskable"` entries for `icon-192.png` and `icon-512.png`.
  - `sw.js` must use a **network-first with offline cache fallback** strategy so GitHub Pages updates propagate immediately to the Pixel 9 without stale cache lock-in, while still working offline at event venues.
