---
name: radius-dev-and-vault
description: >-
  Use this skill when developing, updating, encrypting, auditing, or deploying the
  Radius H2H Card & Personal CRM project (/home/emilyjaneryan/radius), managing the
  encrypted personal vault (private-vault.local.json -> src/vault.js), adding new
  user stories from SPEC.md, or pushing updates to GitHub Pages for the user's Google Pixel 9.
---

# Radius Development & Encrypted Vault Workflow

This skill provides the standard procedures and helper tools for evolving **Radius** (`/home/emilyjaneryan/radius`) while protecting the user's personal CRM network on public GitHub Pages (`https://mlende.github.io/radius/`).

## Key Project Files

- **Specification**: [SPEC.md](../../../SPEC.md) — Product & Technical Specification (`v0.2` Graph Edition) and Core User Stories.
- **PWA Frontend**:
  - [index.html](../../../index.html), [manifest.json](../../../manifest.json), [sw.js](../../../sw.js)
  - [src/graph-engine.js](../../../src/graph-engine.js) — Core Graph & Hop-Radius Progressive Disclosure Engine (`PUBLIC_DEMO_STATE` + `localStorage` persistence).
  - [src/app.js](../../../src/app.js) — Mobile-first Google Pixel 9 UI controller (Reception, Handshake, My H2H, CRM Log, Vault Settings).
  - [src/vault.js](../../../src/vault.js) — Client-side `PBKDF2-HMAC-SHA256` (25,000 iterations) encrypted personal vault.
  - [src/qr.js](../../../src/qr.js) — Offline-capable pure-JS SVG QR code generator.
- **Local Private Vault & Passcode (Gitignored)**:
  - `/home/emilyjaneryan/radius/private-vault.local.json` — Plaintext personal profile, LinkedIn URL, hobbies/vectors, events, and contacts.
  - `/home/emilyjaneryan/radius/.vault-passcode.local` — Current vault passcode (never committed or hinted in UI/docs).
- **Local SQLite Server**: [server.py](../../../server.py) and [schema.sql](../../../schema.sql)

---

## Standard Workflows

### 1. Updating or Re-Encrypting the Personal Vault
Whenever the user wants to add/edit default personal vectors, events, or contacts in her encrypted vault (or rotate her passcode in `.vault-passcode.local`):

1. Edit `/home/emilyjaneryan/radius/private-vault.local.json` (and/or `.vault-passcode.local`), both of which are gitignored.
2. Run the encryption & privacy audit script:
   ```bash
   python3 /home/emilyjaneryan/radius/.agents/skills/radius-dev-and-vault/scripts/update_vault.py
   ```
   *(This reads the passcode from `.vault-passcode.local`, re-encrypts `src/vault.js`, and audits all git-tracked files to verify zero leaks of contact names, private Tier 3 vectors, or the passcode.)*

### 2. Shipping App Improvements Without Losing Pixel 9 Data
When adding new features (e.g., User Story #2 Cohort Graph Search or User Story #3 Selective Tier Unlocking):

1. **Preserve `STORAGE_KEY`**: Keep `const STORAGE_KEY = 'radius_v02_state'` in `src/graph-engine.js`.
2. **Non-Destructive State Migration**: In `RadiusGraphEngine.prototype.loadState()`, ensure any new top-level arrays or profile fields (`avatarUrl`, `linkedin`, `headline`, etc.) default gracefully if an older saved state is loaded from `localStorage` on the user's Pixel 9.
3. **Bump Cache-Busting Version**: Increment the `?v=YYYYMMDDx` query parameter in `index.html` and `sw.js` (`CACHE_NAME` and `ASSETS`) so the Pixel 9 PWA fetches the updated JS bundle immediately.
4. **Run Privacy Audit Before Pushing**:
   ```bash
   python3 /home/emilyjaneryan/radius/.agents/skills/radius-dev-and-vault/scripts/update_vault.py --audit-only
   ```
5. **Commit & Push to GitHub Pages**:
   ```bash
   git -C /home/emilyjaneryan/radius status -s
   git -C /home/emilyjaneryan/radius push origin main
   ```

---

## Session Activity Log

### 2026-11-05 — UI Simplification, Design Polish, Passcode Rotation & Unified H2H Card Editor
- **Design Engineering Skills Installed**: Cloned and installed Emil Kowalski's design engineering skills (`emil-design-eng`, `mobile-native`, `animate`, `review-animations`, `improve-animations`, `apple-design`, `prototype`) into `.agents/skills/`.
- **Streamlined 3-Tab Demo UI**: Simplified the bottom navigation from 4 tabs to 3 focused tabs (`🤝 Meet`, `🕸️ My Card`, `📇 Network`) with a 2-step H2H Handshake simulator and spring bottom sheets.
- **Passcode Rotation & History Scrub**: Removed all passcode hints from the UI/docs, stored the rotated passcode in gitignored `.vault-passcode.local`, re-encrypted `src/vault.js`, and scrubbed previous git history.
- **Single Unified `Edit Card` Window**: Replaced per-row edit/delete buttons on `🕸️ My Card` with one top-level `Edit Card` button (`renderCardEditorModal` + `engine.updateFullCard`) supporting:
  - **1-Tap Local Profile Photo Picker (`📷 Choose Photo`)**: Resizes selected image client-side to a `160x160` JPEG data URI stored locally on the Pixel 9 (avoiding LinkedIn's expiring CDN links and keeping photos out of the public repo).
  - **Full Profile & Vector Editing**: Edit Display Name, Role Description / Headline, Location, LinkedIn Profile URL (`https://www.linkedin.com/in/emily-jane-ryan`), and all Tier 1/2/3 vectors in a single modal.
