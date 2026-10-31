# Radius 🌐

**A Personal CRM & Human-to-Human (`H2H`) Card Protocol powered by a Core Graph Database and Hop-Radius Progressive Disclosure.**

Inspired by the Agent-to-Agent (`agent.json`) protocol, **Radius** replaces flat business cards and static social profiles with structured **H2H Cards (`.h2h.json`)**. People define personal **Description Vector Subgraphs** — connected nodes of hobbies, skills, goals, locations, and real-world **Social Groups** — and control exactly what gets exposed to different circles, automatically unlocking deeper nodes when two cards share common ground.

---

## ✨ Key Concepts

### 1. The H2H Card (`.h2h.json`)
Your portable human identity & vector subgraph:
- **Identity Header**: Name, handle, headline, location, and contact channels.
- **Vector Subgraph**: Multi-tiered nodes (`Concept`, `SocialGroup`, `Location`, `Detail`) connected by typed, weighted edges (`PART_OF`, `SIMILAR_TO`, `LOCATED_IN`, `FOCUSES_ON`).
- **Exposure & Progressive Disclosure Policy**: Circle presets + match-triggered hop unlocking.

### 2. Core Graph Database & Hop-Radius Matching
Real life isn't a strict hierarchy (`Trail Running` belongs to both `Running` and `Sports & Outdoors`, and is a 1-hop neighbor to `Ultramarathons`). Radius models concepts in a graph:
- **0-Hop Exact Match**: Both cards link to `[Doubles Tennis]` or `[American Women's Club Zurich]`.
- **1-Hop Fuzzy / Sibling Match**: One card links to `[Trail Running]` and the other to `[Ultramarathons]` (`SIMILAR_TO` edge).
- **1-Hop Community Bridge**: One person is a member of `[Google Cloud Developer Groups]` (`FOCUSES_ON -> [Google Cloud]`) and meets someone with `[Google Cloud]` on their card.

### 3. Progressive Disclosure ("Unlock on Match")
Share safely with strangers without missing deep connections:
- Expose only **Tier 1** (`[Tennis]`) to a `Public` circle.
- If the person you meet *also* has `[Tennis]`, Radius automatically unlocks **Tier 2** (`[Doubles Tennis]`).
- If you both match on `[Doubles Tennis]`, Radius unlocks **Tier 3 Details** (`USTA Rating: 3.3`, `Schedule: Weekend Mornings`, `Intent: Seeking Partner`).

### 4. First-Class Social Groups
Real-world communities like **American Women's Club Zurich** or **Google Cloud Developer Groups** are first-class nodes in the graph:
- Match with fellow members (`0-hop`) or discover people to invite (`1-hop bridge`).
- Use **Group-Scoped Card Presets** at community events to automatically expose the facets of your life most relevant to that group.

---

## 📄 Specification

Read the full product & technical specification in [**SPEC.md**](./SPEC.md).

---

## 🛠️ Planned Tech Stack

- **Frontend & App Framework**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Graph Engine & Storage**: SQLite-backed Graph Schema (`nodes`, `edges`, `user_vectors`, `social_groups`, `contacts`, `interactions`) + Hop-Radius Traversal Engine
- **Protocol**: `.h2h.json` open schema (`v0.2`) with shareable links & QR codes (Phase 1) and proximity/BLE discovery (Phase 2)

---

## 🤝 Contributing

We welcome collaborators! Please read [**CONTRIBUTING.md**](./CONTRIBUTING.md) for details on our workflow, how to propose changes to the `.h2h.json` schema or graph matching engine, and how to run the project locally.
