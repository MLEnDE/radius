# Radius 🌐

**A Personal CRM & Human-to-Human (`H2H`) Card Protocol powered by a Core Graph Database and Hop-Radius Progressive Disclosure.**

Inspired by the Agent-to-Agent (`agent.json`) protocol, **Radius** replaces flat business cards and static social profiles with structured **H2H Cards (`.h2h.json`)**. People define personal **Description Vector Subgraphs** — connected nodes of hobbies, skills, goals, locations, organizations, and real-world **Social Groups** — and control what gets exposed to different circles, automatically unlocking deeper nodes when two cards share common ground.

---

## ✨ Key Capabilities

### 1. The H2H Card (`.h2h.json`) & Composable Circles
- **Identity Header**: Name, handle, headline, location, and contact channels.
- **Vector Subgraph**: Multi-tiered nodes (`Concept`, `SocialGroup`, `Organization`, `Location`, `Detail`) connected by typed, weighted edges (`PART_OF`, `SIMILAR_TO`, `LOCATED_IN`, `FOCUSES_ON`).
- **Composable Circles**: Toggle multiple circles ON at once (e.g., `Public + Professional`) and selectively unlock deeper tiers (`Data Analytics`, `Vacations in Milan`) or use `unlockOnMatch: true` to progressively reveal details (like `Tennis -> Doubles -> Rating: 3.3`).

### 2. Event Mode & "Beyond-Group" Signal Highlighting
- Activate an **Event or Meeting Session** (e.g., *GDG Cloud Zurich Nov 5th* or *Deloitte Office Meeting*).
- **Beyond-Group Highlights**: At a GDG Cloud event, matching on `Google Cloud` is expected noise. Radius elevates matches *beyond* the event's baseline group — so you immediately see that **Anna** matches with you on **Doubles Tennis**.
- **Auto-Tagging**: Both existing contacts you check in with and new contacts you exchange cards with during an active session are automatically tagged with that event.

### 3. Community Curation, Cohort Graph Search & Warm Outreach
- **Multi-Facet Graph Cohort Search**: Query your CRM across intersecting graph dimensions and 1-hop radii (e.g., `Women in Tech` ∩ `Software Development (0–1 hops)` ∩ `Berlin Area (0–1 hops)`).
- **Warm Outreach Dossiers & Peer Introductions**: Automatically synthesize shared past events, personal common ground, and **mutual learning / opportunity-raising** prompts — plus suggest which attendees should meet *each other*.

### 4. Manual ("Shadow") H2H Cards for Non-Radius Contacts
- Meet someone who doesn't have Radius yet? Create a **Manual H2H Card** in seconds right inside your active meeting/event mode.
- Their vectors immediately participate in your graph searches and matching, and you can send them a **Claim Link / QR** so their card upgrades into a live two-way H2H connection when they download the app.

---

## 📖 Core User Stories (from [SPEC.md](./SPEC.md))

1. **User Story #1 — Event Mode & Beyond-Group Highlights (`GDG Cloud Zurich Nov 5th`)**: Emily enables her `Public + Professional` circles at a GDG Cloud Zurich reception, spots a highlighted `Tennis` match on her existing contact **Anna**, exchanges cards with a new contact **Graham**, and both are auto-tagged with `GDG Cloud Zurich Nov 5th`.
2. **User Story #2 — Curating a Community Event & Warm Outreach (`Berlin Women in Tech`)**: Emily queries her graph for female developers within 1 hop of Berlin, reviews each contact's shared event history and personal common ground, and sends warm, personal invitations focused on authentic friendship, mutual learning, and raising opportunities for each other.
3. **User Story #3 — Deeper Professional Meetings & Manual H2H Cards (`Deloitte Office Meeting`)**: Emily unlocks next-tier nodes (`Data Analytics` skills and `Vacations in Milan`) with her existing Deloitte contacts, and creates a manual H2H card (auto-tagged with `Deloitte` and the meeting) for a new team member who doesn't have Radius yet.

---

## 📄 Full Specification

Read the full product & technical specification in [**SPEC.md**](./SPEC.md).

---

## 🛠️ Tech Stack

- **Frontend & App Framework**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Graph Engine & Storage**: SQLite-backed Core Graph Database (`nodes`, `edges`, `user_vectors`, `social_groups`, `events`, `contacts`, `interactions`) + Hop-Radius Traversal Engine
- **Protocol**: `.h2h.json` open schema (`v0.2`) with shareable links & QR codes (Phase 1) and proximity/BLE discovery (Phase 2)

---

## 🤝 Contributing

We welcome collaborators! Please read [**CONTRIBUTING.md**](./CONTRIBUTING.md) for details on our workflow and how to get involved.
