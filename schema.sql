-- Radius v0.2 Core Graph Database Schema (SQLite)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    node_type TEXT NOT NULL CHECK (node_type IN ('Concept', 'SocialGroup', 'Location', 'Detail', 'Organization')),
    category TEXT NOT NULL,
    tier INTEGER NOT NULL DEFAULT 1,
    description TEXT
);

CREATE TABLE IF NOT EXISTS edges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    edge_type TEXT NOT NULL CHECK (edge_type IN ('PART_OF', 'SUBCATEGORY_OF', 'SIMILAR_TO', 'LOCATED_IN', 'FOCUSES_ON', 'HAS_DETAIL')),
    weight REAL NOT NULL DEFAULT 1.0,
    FOREIGN KEY (source_id) REFERENCES nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (target_id) REFERENCES nodes(id) ON DELETE CASCADE,
    UNIQUE(source_id, target_id, edge_type)
);

CREATE TABLE IF NOT EXISTS social_groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Member',
    location TEXT,
    visibility TEXT NOT NULL DEFAULT 'public',
    related_node_ids TEXT NOT NULL DEFAULT '[]' -- JSON array of node IDs
);

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    group_id TEXT,
    event_date TEXT NOT NULL,
    location TEXT,
    baseline_node_ids TEXT NOT NULL DEFAULT '[]', -- JSON array of baseline/expected node IDs
    is_active INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (group_id) REFERENCES social_groups(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS user_vectors (
    node_id TEXT PRIMARY KEY,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'professional', 'friends', 'inner')),
    unlock_on_match INTEGER NOT NULL DEFAULT 1,
    unlock_radius INTEGER NOT NULL DEFAULT 1,
    intent TEXT,
    attributes_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    handle TEXT,
    headline TEXT,
    location TEXT,
    avatar_initials TEXT,
    avatar_color TEXT,
    is_manual_card INTEGER NOT NULL DEFAULT 0,
    claimed INTEGER NOT NULL DEFAULT 1,
    group_ids_json TEXT NOT NULL DEFAULT '[]',
    vectors_json TEXT NOT NULL DEFAULT '[]',
    unlocked_node_ids_json TEXT NOT NULL DEFAULT '[]',
    event_tags_json TEXT NOT NULL DEFAULT '[]',
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS interactions (
    id TEXT PRIMARY KEY,
    contact_id TEXT NOT NULL,
    event_id TEXT,
    event_label TEXT,
    interaction_type TEXT NOT NULL, -- 'check_in', 'card_exchange', 'manual_card', 'unlock_tier'
    note TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
