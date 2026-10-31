# Radius — Product & Technical Specification (v0.2 — Graph Edition)

**Radius** is a personal CRM built around the **H2H (Human-to-Human) Card** — inspired by the Agent-to-Agent (`agent.json`) protocol, but designed for human connection. Instead of exchanging static business cards or flat social profiles, people exchange structured **Description Vector Subgraphs** (connected nodes of hobbies, skills, goals, locations, and real-world **Social Groups**) with granular privacy controls and **hop-radius progressive disclosure**.

---

## 1. Core Concepts

### 1.1 The H2H Card (`.h2h.json`)
Just as an A2A card describes an AI agent's capabilities, endpoints, and authentication rules, an **H2H Card** describes a person's identity, facets, memberships, and interaction preferences:
- **Identity Header**: Display name, handle, avatar, headline, location/timezone, and preferred contact channels.
- **Personal Vector Subgraph**: Your personal nodes and weighted edges connecting to the shared concept graph (*Hobbies*, *Professional*, *Learning*, *Projects*, *Locations*, and *Social Groups*).
- **Exposure Policy**: Rules governing which circles or social groups see which subgraph layer by default, and how many **hops (radius)** get unlocked automatically when two cards match.

### 1.2 Graph-Based Description Vectors (Nodes, Edges & Specificity Tiers)
Rather than a rigid tree where each item can only have one parent, Radius models vectors in a **Core Graph Database**. A single concept can connect to multiple parent categories and sibling concepts.

```text
   [Sports & Outdoors]        [Running]
             \                   /
          (PART_OF)          (PART_OF)
               \               /
                v             v
                [Trail Running] <---SIMILAR_TO (0.85)---> [Ultramarathons]

   [Tennis] <---PART_OF--- [Doubles Tennis] <---HAS_DETAIL--- [USTA Rating: 3.3]
```

#### Node Types in the Graph
1. **Concept Nodes** (`Concept`): Topics, hobbies, skills, domains (e.g., `Tennis`, `Doubles Tennis`, `Trail Running`, `Google Cloud`, `TypeScript`).
2. **Social Group Nodes** (`SocialGroup`): Real-world clubs, communities, chapters, and organizations (e.g., `American Women's Club Zurich`, `Google Cloud Developer Groups`).
3. **Location Nodes** (`Location`): Cities, neighborhoods, venues (e.g., `Zurich`, `San Francisco`).
4. **Personal Detail / Attribute Nodes** (`Detail`): User-specific leaf details attached to a concept or group (e.g., `USTA Rating: 3.3`, `Schedule: Weekend Mornings`, `Role: Chapter Co-Organizer`).

#### Edge Types in the Graph
- **Ontology / Concept Edges** (Shared Graph):
  - `PART_OF` / `SUBCATEGORY_OF` (e.g., `Doubles Tennis` -> `Tennis`)
  - `SIMILAR_TO` (weighted `0.0–1.0`, e.g., `Trail Running` <-> `Ultramarathons` = `0.85`)
  - `LOCATED_IN` (e.g., `American Women's Club Zurich` -> `Zurich`)
  - `FOCUSES_ON` (e.g., `Google Cloud Developer Groups` -> `Google Cloud`, `Software Engineering`)
- **Personal H2H Edges** (User -> Node):
  - `HAS_VECTOR` (connects a person to a `Concept` with `{ tier, visibility, unlockRadius, intent, attributes }`)
  - `MEMBER_OF` (connects a person to a `SocialGroup` with `{ role, since, chapter, visibility, unlockOnMatch }`)

---

## 2. Real-World Social Groups (`SocialGroup` Nodes)

Real-world communities — such as **American Women's Club Zurich** or **Google Cloud Developer Groups** — are first-class citizens in the Radius graph. They play **three critical roles**:

### 2.1 Direct & Bridge Matching in the Graph
Because each `SocialGroup` node is linked to `Location` and `Concept` nodes in the graph:
- **0-Hop Fellow Member Match**: Alice and Bob are both `MEMBER_OF` `[American Women's Club Zurich]`. Instant high-trust match!
- **1-Hop Community Bridge Match**: Alice is `MEMBER_OF` `[Google Cloud Developer Groups]` (which has edge `FOCUSES_ON -> [Google Cloud]`). Bob isn't a member yet, but has `HAS_VECTOR -> [Google Cloud]`. Radius spots the 1-hop bridge and suggests: *"Bob is into Google Cloud — invite him to Google Cloud Developer Groups!"*

### 2.2 Group-Scoped Exposure Presets
When you are at an event or exchanging cards with fellow members of a specific group, you can share a **Group-Scoped H2H Card**:
- **Example (`American Women's Club Zurich` Card View)**: Automatically exposes your `Zurich` local life, `Hobbies` (`Tennis > Doubles`), and cultural/social vectors, while keeping deep technical work vectors summarized.
- **Example (`Google Cloud Developer Groups` Card View)**: Automatically exposes your `Professional`, `Tech Stack`, and `Side Projects` subgraphs in full detail, while keeping `Hobbies` at Tier 1 (broad) unless a hobby match occurs.

### 2.3 CRM Group Directories & Event Context
- Track which contacts belong to which social groups (`American Women's Club Zurich`, `Google Cloud Developer Groups`, etc.).
- Filter your CRM graph by group membership or see how a social group connects multiple people in your network.

---

## 3. Privacy, Circles & Hop-Radius Progressive Disclosure

Radius combines **Preset Circles / Groups** with **Match-Unlocked Hop Radius** so you never overshare with strangers, yet automatically reveal deeper context when common ground is found.

### 3.1 Specificity Tiers on Your Personal Graph
Every node in your personal subgraph has a **Tier (Depth Level)**:
- **Tier 1 (Broad Surface)**: High-level categories & public memberships (e.g., `Tennis`, `Cooking`, `Cloud Computing`, `Google Cloud Developer Groups`).
- **Tier 2 (Specific Facet)**: Sub-specialties & active pursuits (e.g., `Doubles Tennis`, `Sourdough Baking`, `Kubernetes`).
- **Tier 3 (Personal Detail / Attributes)**: Granular metrics, ratings, schedules, and personal notes (e.g., `Rating: 3.3`, `Seeking Doubles Partner`, `Organizer since 2025`).

### 3.2 Combinable Circles (Multi-Select Active Exposure)
Instead of a single rigid preset, Circles in Radius are **composable toggles**. When you go to an event or share your card, you can enable **multiple circles at once** (the union of their permissions applies):
- **Public Circle** — Exposes Tier 1 `Hobbies` & general `Locations` (with `unlockOnMatch: true` waiting on Tier 2/3 nodes like `Doubles > Rating 3.3`).
- **Professional Circle** — Exposes Tiers 1–3 of `Professional`, `Tech Stack`, `Speaking / Projects`, and professional `SocialGroups`.
- **Friends / Social Circle** — Exposes Tiers 1–2 of `Hobbies`, `Personal Projects`, and social `SocialGroups`.
- **Inner Circle** — Full subgraph (Tiers 1–3).

> **Example:** At a tech meetup, Emily toggles ON **`Public` + `Professional`**. Everyone she meets sees her full professional subgraph *plus* her Tier 1 hobbies — and if someone *also* plays Tennis, `unlockOnMatch` automatically reveals her Tier 2/3 Tennis details!

### 3.3 "Event Mode" & Beyond-Group Highlighting (Signal vs. Noise)
When you activate an **Event Session** (e.g., `GDG Cloud Zurich — Nov 5, 2026`, linked to `[GDG Cloud Zurich]`):
1. **Signal-to-Noise Filtering ("Beyond-Group Highlights")**: At a `GDG Cloud Zurich` event, matching on `Google Cloud` is expected baseline context. Radius automatically elevates and highlights **matches outside the event's primary domain** (e.g., highlighting that **Anna** matches with you on `Hobbies > Tennis > Doubles`).
2. **Automatic Event Tagging (`EventSession`)**: Any contact you **exchange cards with** (new contact like **Graham**) OR **log a quick interaction with** (existing contact like **Anna**) while Event Mode is active is automatically tagged with `GDG Cloud Zurich — Nov 5, 2026` in your CRM timeline.

### 3.4 Match-Based Progressive Disclosure ("Unlock Radius on Match")
Even if you exchange a **Public** card capped at Tier 1 (`Tennis`), nodes with `unlockOnMatch: true` reveal their connected **1-hop deeper neighborhood** whenever a match (0-hop exact or 1-hop fuzzy) is detected:

1. **Baseline Handshake**: Alice and Bob exchange Public H2H cards. Only Tier 1 (`[Tennis]`) is initially visible.
2. **Tier 1 Match Detected**: The Graph Engine sees both cards connect to `[Tennis]`.
3. **1-Hop Radius Unlock**: Because `[Tennis]` matched, Radius unlocks the immediate child/neighbor nodes at Tier 2 (`[Doubles Tennis]`) for both Alice and Bob.
4. **Tier 2 Match Detected**: Both connect to `[Doubles Tennis]`! Radius unlocks Tier 3 personal detail attributes (`Rating: 3.3` vs `Rating: 3.5`, `Intent: Seeking Partner`).

---

## 4. The Graph Matching Engine (Hop-Radius Scoring)

When two H2H cards meet, the Radius Graph Engine evaluates connections across four dimensions:

| Match Type | Graph Distance | Example | Score Weight |
| :--- | :--- | :--- | :--- |
| **Exact Deep Match** | **0 Hops (Tier 2/3)** | Both link to `[Doubles Tennis]` | **Highest (`1.0x`)** |
| **Shared Social Group** | **0 Hops (`SocialGroup`)** | Both are `MEMBER_OF` `[American Women's Club Zurich]` | **Very High (`0.95x`)** |
| **Exact Broad Match** | **0 Hops (Tier 1)** | Both link to `[Tennis]` (one plays Singles, one plays Doubles) | **Medium (`0.6x`)** |
| **Fuzzy / Sibling Match** | **1 Hop (`SIMILAR_TO` / Shared Parent)** | Alice links to `[Trail Running]`, Bob links to `[Ultramarathons]` | **Fuzzy (`0.5x – 0.8x`)** |
| **Group <-> Interest Bridge** | **1 Hop (`FOCUSES_ON`)** | Alice is in `[Google Cloud Developer Groups]`, Bob links to `[Google Cloud]` | **Bridge (`0.7x`)** |

### Attribute & Intent Modifiers
- **Numeric Proximity Bonus**: On shared nodes like `[Doubles Tennis]`, close numeric attributes (`Rating: 3.3` and `Rating: 3.5`) add a compatibility bonus.
- **Complementary & Peer Intent Bonus**:
  - `seeking_partner` + `seeking_partner` (e.g., Tennis Doubles partner) -> **Actionable Match badge!**
  - `offering_mentorship` + `seeking_mentorship` -> **Complementary Match badge!**
  - `mutual_learning` + `mutual_learning` (e.g., co-exploring a technology or speaking together) -> **Mutual Growth badge!**
  - `opportunity_sharing` / `amplifying` (e.g., raising CFPs, leadership roles, or project opportunities for each other) -> **Opportunity Amplifier badge!**

---

## 5. Personal CRM & Community Curation Features

Once you exchange H2H cards with someone, they are saved in your **Radius CRM**:
- **Interactive Subgraph & Venn View**: Inspect a contact's unlocked vector graph, highlighted by **Exact Overlaps**, **1-Hop Fuzzy Connections**, and **Shared Social Groups**.
- **Multi-Facet Graph Cohort Search ("Event Organizer Query")**: Filter your CRM by intersecting multiple graph dimensions and 1-hop radii — for example: `[Women in Tech]` ∩ `[Software Development (0–1 hops)]` ∩ `[Berlin Area (0–1 hops)]`.
- **Warm Outreach Dossier ("Authentic Touchpoints")**: When reaching out to a cohort, Radius surfaces a per-person context card showing:
  1. **Shared Past Events** (e.g., *"You both attended Women Techmakers Summit 2026 & GDG Cloud"* + your interaction notes).
  2. **Personal Common Ground** (shared hobbies, mutual learning vectors, and personal topics).
  3. **Opportunity & Mutual Learning Prompts** (ways to support each other or introduce them to other invitees).
- **Selective Next-Level Unlocking ("Deepen Connection")**: With existing contacts (e.g., client or partner teams like **Deloitte**), selectively unlock deeper Tier 2/3 nodes — such as specific professional skills (`Data Analytics`) or personal rapport vectors (`Travel & Vacations -> Milan`) — as the working relationship deepens.
- **Manual / "Shadow" H2H Cards & Claim Flow**: When you meet someone who doesn't have Radius yet, create a **Manual H2H Card** right inside your CRM (capturing their vectors, organization, and meeting context) and share a **"Download & Claim Your H2H Card"** link/QR. Once they join Radius, their manual card seamlessly links and upgrades into a live two-way H2H connection.
- **Social Group & Organization Hub**: View your communities (*American Women's Club Zurich*, *Google Cloud Developer Groups*, *Women in Tech*) and organizations/accounts (*Deloitte*), see all CRM contacts in each, and preview what your H2H card exposes.
- **Interaction & Context Log**: Record where/when you met, event/meeting tags, private notes, and follow-up reminders.

---

## 6. Core User Stories & Reference Workflows

### User Story 1: Event Mode, Beyond-Group Highlights & Auto-Tagging
**Scenario:**
1. **Preparation & Multi-Circle Activation**: Emily has her H2H card prepared and heads to **Google Developer Group (GDG) Cloud Zurich** on Thursday, November 5th. She activates **Event Mode (`GDG Cloud Zurich Nov 5th`)** and toggles ON both her **`Public`** and **`Professional`** Circles.
2. **Reception Prep & "Beyond-Group" Highlighting**: While at the reception, Emily opens the Event Reception view to see the H2H cards of her collected contacts in this group. Because matching on `GDG Cloud` is expected for everyone at the event, Radius specifically highlights **attributes that match *beyond* the GDG Cloud group**.
3. **Actionable Icebreaker (Existing Contact — Anna)**: Emily sees **Anna's** card with a highlighted cross-vector match on **`Tennis`** (`Hobbies -> Tennis -> Doubles`). She immediately knows to walk over to Anna, ask her about Tennis, and tap **"Log Interaction"** on Anna's card.
4. **New Card Exchange (New Contact — Graham)**: Emily meets **Graham** for the first time and exchanges H2H cards with him under her active `Public + Professional` circles.
5. **Automatic Event Tagging**: Because Emily interacted with **Anna** and exchanged cards with **Graham** while the `GDG Cloud Zurich Nov 5th` Event Mode was active, **both Graham and Anna are automatically tagged with `GDG Cloud Zurich Nov 5th`** in Emily's CRM timeline.

### User Story 2: Curating a High-Trust Community Event & Warm Outreach (Berlin Women in Tech)
**Scenario:**
1. **Multi-Facet Graph Cohort Discovery**: Emily is organizing a developer event for **Women in Technology** in **Berlin**. She runs a graph query across her CRM for contacts matching:
   - **Community / Identity**: `Women in Tech` / female developers
   - **Role / Domain (0–1 Hop)**: `[Software Development]` (matching Frontend, Backend, Cloud, AI/ML, DevOps, etc.)
   - **Location Radius (0–1 Hop)**: `[Berlin]` and the surrounding Berlin metro area (e.g., Potsdam / frequent Berlin travelers).
2. **Warm, Personal Context Synthesis (No Cold Blasts)**: For each matched contact, Radius generates a **Warm Outreach Card** that pulls together:
   - **Shared Event History**: Past events they attended together (e.g., *"Met at Cloud Next / WTM Berlin — talked about distributed systems"*).
   - **Personal Vector Overlap**: What they have in common personally or professionally (e.g., shared hobbies like running or baking, or shared tech interests).
   - **Mutual Learning & Opportunity Raising**: Highlights where they can learn from each other or elevate each other (e.g., inviting her to co-present, sharing a CFP opportunity, or connecting her with another woman developer attending the Berlin event).
3. **Authentic Relationship Building**: Emily sends deeply personal, thoughtful invitations referencing their real shared history and common ground — fostering genuine friendship, peer learning, and mutual opportunity-raising rather than transactional networking.

### User Story 3: Deeper Professional Meetings, Selective Unlocking & Non-Radius Contacts (Deloitte Meeting)
**Scenario:**
1. **Office Meeting Context (`Deloitte`)**: Emily is in the office next week meeting with the team from **Deloitte**. She activates a meeting context for **`Deloitte Office Meeting`** (linked to the `[Deloitte]` organization node).
2. **Unlocking Next Levels with Existing Contacts**: Several Deloitte attendees are already in Emily's CRM from earlier introductions. To deepen both professional collaboration and personal rapport during this in-person session, Emily selectively unlocks the next tiers of connection with them — specifically exposing deeper professional nodes like **`Data Analytics`** skills and personal rapport vectors like **`Vacations in Milan`** (`Travel -> Italy -> Milan`), and capturing the newly unlocked overlaps.
3. **Meeting Someone Without Radius (Manual "Shadow" H2H Card)**: Emily meets a new Deloitte team member who doesn't have the Radius app yet. She recommends they download Radius, and right in the moment creates a **Manual H2H Card** for them in her CRM (adding the vectors she learned in conversation, like `Data Analytics` or `Milan`).
4. **Auto-Tagging & Future Claim Link**: Because Emily is in the active meeting mode, this new manual H2H card (along with the existing Deloitte contacts she interacted with) is **automatically tagged with `Deloitte` and `Deloitte Office Meeting`**. Emily can also send the new contact an invite link/QR so that when they download Radius, they can **claim and sync** their card into a live H2H connection!

---

## 7. Card Exchange & "Radius" Proximity Roadmap

### Phase 1: Web App, Graph Engine, `.h2h.json`, Links & QR Codes (MVP)
- **My H2H Graph Builder**: Visual & structured editor to build your personal vector graph, attach attributes (`Rating: 3.3`), join/create Social Groups (*American Women's Club Zurich*, *Google Cloud Developer Groups*), and configure Circle & Group visibility rules.
- **Event Mode & Reception View**: Start an active event session (e.g., *GDG Cloud Zurich Nov 5th*), enable multiple Circles at once (`Public + Professional`), view existing contacts with **Beyond-Group Highlights** (like Anna's Tennis match), and auto-tag everyone you interact with or exchange cards with during the event.
- **Live H2H Handshake & Progressive Unlock Simulator**: Put your H2H card next to another person's card, pick active Circles + Event context, and watch the graph progressively unlock Tier 1 -> Tier 2 -> Tier 3 nodes and highlight 0-hop & 1-hop matches.
- **Personal CRM & Social Groups Directory**: Manage contacts, filter by graph nodes, event tags, or social groups, log interactions, and export/import `.h2h.json` cards or QR codes.

### Phase 2: Ambient "In Your Radius" Proximity Sync (Future)
- **Active Radius Mode**: Mobile/PWA background discovery via BLE / Ultra-Wideband / local P2P.
- **Privacy-Preserving Graph Intersection**: Nearby devices compare blinded node hashes and only notify both people when a high-value overlap (like fellow membership in *American Women's Club Zurich* or a `[Doubles Tennis]` match) enters their physical radius.

---

## 8. Tech Stack & Graph Database Architecture

- **Framework**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Graph Storage & Query Engine**:
  - Embedded persistent **Graph Database layer backed by SQLite** (`nodes`, `edges`, `user_vectors`, `social_groups`, `events`, `contacts`, `interactions`) with an in-memory/SQL **Graph Traversal & Hop-Radius Engine** (supporting multi-parent DAGs, weighted `SIMILAR_TO` edges, shortest-path hop calculation, beyond-group signal filtering, and progressive disclosure evaluation).
- **Visualization**: Interactive SVG/Canvas Force-Directed & Hierarchical Graph Visualizer for inspecting your H2H graph and two-person overlap subgraphs.

### Draft `.h2h.json` Graph Schema Example (`v0.2`)
```json
{
  "$schema": "https://radius.app/schema/h2h-v0.2.json",
  "version": "0.2.0",
  "profile": {
    "id": "usr_emily_01",
    "name": "Emily Ryan",
    "handle": "@emily",
    "headline": "Cloud Architect & Doubles Tennis Player",
    "location": "Zurich, Switzerland"
  },
  "exchangeContext": {
    "activeCircles": ["public", "professional"],
    "activeEvent": {
      "eventId": "evt_gdg_zurich_2026_11_05",
      "label": "GDG Cloud Zurich Nov 5th",
      "groupId": "grp_gcdg",
      "date": "2026-11-05"
    }
  },
  "socialGroups": [
    {
      "groupId": "grp_awc_zurich",
      "name": "American Women's Club Zurich",
      "role": "Member",
      "location": "Zurich",
      "visibility": "public",
      "relatedConcepts": ["node_zurich", "node_expat_community", "node_tennis"]
    },
    {
      "groupId": "grp_gcdg",
      "name": "Google Cloud Developer Groups",
      "role": "Organizer",
      "location": "Zurich",
      "visibility": "public",
      "relatedConcepts": ["node_google_cloud", "node_cloud_architecture", "node_ai_agents"]
    }
  ],
  "vectorSubgraph": {
    "nodes": [
      {
        "id": "node_tennis",
        "label": "Tennis",
        "category": "hobbies",
        "tier": 1,
        "visibility": "public",
        "unlockOnMatch": true
      },
      {
        "id": "node_doubles_tennis",
        "label": "Doubles Tennis",
        "category": "hobbies",
        "tier": 2,
        "visibility": "friends",
        "unlockOnMatch": true,
        "attributes": {
          "rating": 3.3,
          "ratingSystem": "USTA",
          "intent": "seeking_partner",
          "schedule": "Weekend Mornings"
        }
      }
    ],
    "edges": [
      {
        "source": "node_doubles_tennis",
        "target": "node_tennis",
        "type": "PART_OF",
        "weight": 1.0
      }
    ]
  }
}
```
