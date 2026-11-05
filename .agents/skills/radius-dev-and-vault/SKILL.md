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
- **Local Private Vault (Gitignored)**: `/home/emilyjaneryan/radius/private-vault.local.json`
- **Local SQLite Server**: [server.py](../../../server.py) and [schema.sql](../../../schema.sql)

---

## Standard Workflows

### 1. Updating or Re-Encrypting the Personal Vault
Whenever the user wants to add/edit default personal vectors, events, or contacts in her encrypted vault (or imports an updated `private-vault.local.json` exported from her Pixel 9):

1. Edit `/home/emilyjaneryan/radius/private-vault.local.json` (which is gitignored).
2. Run the encryption & privacy audit script:
   ```bash
   python3 /home/emilyjaneryan/radius/.agents/skills/radius-dev-and-vault/scripts/update_vault.py
   ```
   *(Optional: pass `--passcode <new-passcode>` if the user wants to change her vault passcode from the one stored in gitignored `.vault-passcode.local`.)*

### 2. Shipping App Improvements Without Losing Pixel 9 Data
When adding new features (e.g., User Story #2 Cohort Graph Search or User Story #3 Selective Tier Unlocking):

1. **Preserve `STORAGE_KEY`**: Keep `const STORAGE_KEY = 'radius_v02_state'` in `src/graph-engine.js`.
2. **Non-Destructive State Migration**: In `RadiusGraphEngine.prototype.loadState()`, ensure any new top-level arrays or fields default gracefully if an older saved state is loaded from `localStorage` on the user's Pixel 9.
3. **Run Privacy Audit Before Pushing**:
   ```bash
   python3 /home/emilyjaneryan/radius/.agents/skills/radius-dev-and-vault/scripts/update_vault.py --audit-only
   ```
4. **Commit & Push to GitHub Pages**:
   ```bash
   git -C /home/emilyjaneryan/radius status -s
   git -C /home/emilyjaneryan/radius push origin main
   ```
