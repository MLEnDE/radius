# Radius — Agent Rules & Architecture Guidelines

**Radius** (`/home/emilyjaneryan/radius`) is a mobile-first Personal CRM & Human-to-Human (`.h2h.json`) Card Protocol powered by a Core Graph Database and Hop-Radius Progressive Disclosure, deployed via **GitHub Pages** (`https://mlende.github.io/radius/`) for Google Pixel 9 and backed locally by Python + SQLite (`server.py`, `schema.sql`).

## 1. Strict Privacy & Zero-Plaintext Git Rule (CRITICAL)
- **Public Repository**: `https://github.com/MLEnDE/radius.git` is a public repository hosting free GitHub Pages.
- **Never Commit Plaintext Personal Data**: Never hardcode real contact names, personal notes, or private vectors in git-tracked application files (`index.html`, `src/graph-engine.js`, `src/app.js`, `server.py`, `schema.sql`).
- **Default Public Seed**: `PUBLIC_DEMO_STATE` in `src/graph-engine.js` and `server.py` must always use anonymous sample data (`Alex Rivera (Demo)`, `Contact A (Demo)`, `Contact B (Demo)`).
- **Encrypted Personal Vault & Passcode Security**:
  - Plaintext personal network data lives **only** in gitignored `private-vault.local.json` (or in the user's Pixel 9 `localStorage`).
  - The vault passcode lives **only** in gitignored `.vault-passcode.local`. **Never** place passcode hints, placeholders, or plaintext passcodes in UI code, comments, or documentation.
  - To update the encrypted vault in `src/vault.js`, use the `radius-dev-and-vault` skill script (`.agents/skills/radius-dev-and-vault/scripts/update_vault.py`), which automatically audits all tracked files against both private contact/vector strings and the passcode in `.vault-passcode.local`.

## 2. Non-Destructive Mobile `localStorage` Upgrades
- The user actively builds her personal network on her **Google Pixel 9** in Chrome (`localStorage` key: `radius_v02_state`, vault status key: `radius_v02_vault_unlocked`).
- **Never change `STORAGE_KEY` (`radius_v02_state`) or wipe existing `localStorage` state** when shipping UI or engine updates.
- When introducing new state properties in future versions, merge defaults non-destructively inside `RadiusGraphEngine.prototype.loadState()` so existing contacts, vectors, event tags, profile photos (`avatarUrl`), LinkedIn URLs (`linkedin`), and interaction logs on the user's phone are 100% preserved.

## 3. UI & Design Engineering Guidelines
- **Emil Kowalski Design Skills Installed**: Use the project skills in `.agents/skills/` (`emil-design-eng`, `mobile-native`, `animate`, `review-animations`, `improve-animations`, `apple-design`, `prototype`) when refining UI/UX.
- **3-Tab Demo-First Architecture**:
  - **`🤝 Meet`**: Hero H2H Handshake Simulation (2-Step: Select who is scanning → Instant Mutual Common Ground + QR Share).
  - **`🕸️ My Card`**: Clean progressive disclosure card (Tier 1 Public, Tier 2 Contextual, Tier 3 High-Affinity) with a **single unified `Edit Card` button** at the top-right (`renderCardEditorModal` + `engine.updateFullCard`) to edit profile photo (`160x160` local JPEG data URI), display name, role description/headline, location, LinkedIn URL, and all vectors in one window.
  - **`📇 Network`**: Event Room Radar + Contact Cards + CRM Follow-Up Log.

## 4. Environment & Tech Stack Constraints
- **Local Runtime**: Use `python3` (`server.py` + `sqlite3`) for local backend/database serving (`http://localhost:8080`). Node/npm is not installed in the base container environment.
- **PWA Requirements & Cache Busting (Android / Pixel 9)**:
  - `manifest.json` must maintain separate `"purpose": "any"` and `"purpose": "maskable"` entries for `icon-192.png` and `icon-512.png`.
  - `sw.js` uses a **network-first with `cache: 'no-cache'`** strategy. Whenever deploying updates to `src/*.js`, bump the `?v=YYYYMMDDx` query string in both `index.html` and `sw.js` (`CACHE_NAME` + `ASSETS`) so the Pixel 9 PWA immediately pulls fresh code.
