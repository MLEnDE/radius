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

### 3.2 Preset Circles (Baseline Visibility)
You assign contacts or card-exchange links to a **Circle** (or **Social Group**), which sets the baseline Tier they can see before any matching:
1. **Public / Stranger** — Tier 1 nodes marked public.
2. **Networking / Conference** — Full `Professional` & `Tech` subgraphs; Tier 1 `Hobbies`.
3. **Friends / Social** — Tier 2 across `Hobbies`, `Social Groups`, and `Projects`.
4. **Custom Social Group Preset** (e.g., *AWC Zurich* or *GCDG*) — Custom per-category tier rules tailored to that community.
5. **Inner Circle** — Full subgraph (Tiers 1–3).

### 3.3 Match-Based Progressive Disclosure ("Unlock Radius on Match")
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
- **Complementary / Actionable Intent Bonus**:
  - `seeking_partner` + `seeking_partner` (e.g., Tennis Doubles partner) -> **Actionable Match badge!**
  - `offering_mentorship` + `seeking_mentorship` -> **Complementary Match badge!**

---

## 5. Personal CRM Features

Once you exchange H2H cards with someone, they are saved in your **Radius CRM**:
- **Interactive Subgraph & Venn View**: Inspect a contact's unlocked vector graph, highlighted by **Exact Overlaps**, **1-Hop Fuzzy Connections**, and **Shared Social Groups**.
- **Conversation Starters & Bridge Prompts**: Auto-generated prompts from graph paths (e.g., *"You both play Doubles Tennis (3.3 vs 3.5) and both live in Zurich"* or *"Invite Maya to American Women's Club Zurich — she just moved to Zurich and shares 3 hobbies"*).
- **Social Group Hub**: View your groups (*American Women's Club Zurich*, *Google Cloud Developer Groups*, etc.), see all CRM contacts in each group, and preview what your H2H card exposes to that group.
- **Interaction & Context Log**: Record where/when you met, event tags, private notes, and follow-up reminders.

---

## 6. Card Exchange & "Radius" Proximity Roadmap

### Phase 1: Web App, Graph Engine, `.h2h.json`, Links & QR Codes (MVP)
- **My H2H Graph Builder**: Visual & structured editor to build your personal vector graph, attach attributes (`Rating: 3.3`), join/create Social Groups (*American Women's Club Zurich*, *Google Cloud Developer Groups*), and configure Circle & Group visibility rules.
- **Live H2H Handshake & Progressive Unlock Simulator**: Put your H2H card next to another person's card, pick an exchange Circle or Social Group context, and watch the graph progressively unlock Tier 1 -> Tier 2 -> Tier 3 nodes and highlight 0-hop & 1-hop matches.
- **Personal CRM & Social Groups Directory**: Manage contacts, filter by graph nodes or social groups, log interactions, and export/import `.h2h.json` cards or QR codes.

### Phase 2: Ambient "In Your Radius" Proximity Sync (Future)
- **Active Radius Mode**: Mobile/PWA background discovery via BLE / Ultra-Wideband / local P2P.
- **Privacy-Preserving Graph Intersection**: Nearby devices compare blinded node hashes and only notify both people when a high-value overlap (like fellow membership in *American Women's Club Zurich* or a `[Doubles Tennis]` match) enters their physical radius.

---

## 7. Tech Stack & Graph Database Architecture

- **Framework**: Next.js (App Router) + React + TypeScript + Tailwind CSS
- **Graph Storage & Query Engine**:
  - Embedded persistent **Graph Database layer backed by SQLite** (`nodes`, `edges`, `user_vectors`, `social_groups`, `contacts`, `interactions`) with an in-memory/SQL **Graph Traversal & Hop-Radius Engine** (supporting multi-parent DAGs, weighted `SIMILAR_TO` edges, shortest-path hop calculation, and progressive disclosure evaluation).
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
    "circlePreset": "public",
    "activeGroupScope": null
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
