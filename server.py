#!/usr/bin/env python3
"""
Radius v0.2 — Local SQLite Core Graph Server & Mobile PWA Host
Initializes radius.db from schema.sql with generic public demo data by default,
and serves the mobile-first Google Pixel 9 PWA + REST API.
"""

import json
import os
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
DB_PATH = ROOT_DIR / "radius.db"
SCHEMA_PATH = ROOT_DIR / "schema.sql"


def init_db():
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        conn.executescript(f.read())

    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM nodes")
    if cur.fetchone()[0] == 0:
        nodes = [
            ("node_books", "Books & Reading", "Concept", "hobbies", 1, "Reading & literature"),
            ("node_fiction", "Contemporary Fiction", "Concept", "hobbies", 2, "Literary & contemporary fiction"),
            ("node_book_detail", "Current Book Club Pick (Demo)", "Detail", "hobbies", 3, "Demo book detail"),
            ("node_tennis", "Tennis", "Concept", "hobbies", 1, "Racquet sports"),
            ("node_doubles_tennis", "Doubles Tennis", "Concept", "hobbies", 2, "Doubles format"),
            ("node_tennis_rating", "Intermediate · Seeking Partner", "Detail", "hobbies", 3, "Weekend mornings"),
            ("node_google_cloud", "Google Cloud", "Concept", "professional", 1, "GCP ecosystem"),
            ("node_cloud_arch", "Cloud Architecture", "Concept", "professional", 2, "Distributed systems"),
            ("node_ai_agents", "AI Agents & A2A Protocol", "Concept", "professional", 2, "Agentic systems"),
            ("node_running", "Running", "Concept", "hobbies", 1, "Endurance running"),
            ("node_trail_running", "Trail Running", "Concept", "hobbies", 2, "Alpine trails"),
            ("node_ultramarathons", "Ultramarathons", "Concept", "hobbies", 2, "Long distance trail racing"),
        ]
        cur.executemany(
            "INSERT OR IGNORE INTO nodes (id, label, node_type, category, tier, description) VALUES (?, ?, ?, ?, ?, ?)",
            nodes,
        )

        edges = [
            ("node_fiction", "node_books", "PART_OF", 1.0),
            ("node_book_detail", "node_fiction", "HAS_DETAIL", 1.0),
            ("node_doubles_tennis", "node_tennis", "PART_OF", 1.0),
            ("node_tennis_rating", "node_doubles_tennis", "HAS_DETAIL", 1.0),
            ("node_cloud_arch", "node_google_cloud", "PART_OF", 1.0),
            ("node_ai_agents", "node_google_cloud", "PART_OF", 1.0),
            ("node_trail_running", "node_running", "PART_OF", 1.0),
            ("node_ultramarathons", "node_running", "PART_OF", 1.0),
            ("node_trail_running", "node_ultramarathons", "SIMILAR_TO", 0.85),
        ]
        cur.executemany(
            "INSERT OR IGNORE INTO edges (source_id, target_id, edge_type, weight) VALUES (?, ?, ?, ?)",
            edges,
        )

        cur.execute(
            "INSERT OR IGNORE INTO social_groups (id, name, role, location, visibility, related_node_ids) VALUES (?, ?, ?, ?, ?, ?)",
            (
                "grp_demo_cloud",
                "Cloud Developer Community (Demo)",
                "Member",
                "Zurich",
                "public",
                json.dumps(["node_google_cloud", "node_cloud_arch", "node_ai_agents"]),
            ),
        )
        cur.execute(
            "INSERT OR IGNORE INTO events (id, label, group_id, event_date, location, baseline_node_ids, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                "evt_demo_meetup",
                "Cloud Tech Meetup — Demo Session",
                "grp_demo_cloud",
                "2026-11-05",
                "Zurich",
                json.dumps(["node_google_cloud", "node_cloud_arch", "node_ai_agents"]),
                1,
            ),
        )

    conn.commit()
    conn.close()


class RadiusRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def do_GET(self):
        if self.path == "/api/health":
            self._send_json({"status": "ok", "db": str(DB_PATH), "mode": "vault-protected"})
            return
        if self.path == "/api/graph":
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            nodes = [dict(r) for r in conn.execute("SELECT * FROM nodes").fetchall()]
            edges = [dict(r) for r in conn.execute("SELECT * FROM edges").fetchall()]
            groups = [dict(r) for r in conn.execute("SELECT * FROM social_groups").fetchall()]
            events = [dict(r) for r in conn.execute("SELECT * FROM events").fetchall()]
            conn.close()
            self._send_json({"nodes": nodes, "edges": edges, "socialGroups": groups, "events": events})
            return
        super().do_GET()

    def _send_json(self, data, status=200):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    server = ThreadingHTTPServer(("0.0.0.0", port), RadiusRequestHandler)
    print(f"Radius v0.2 Server listening on http://localhost:{port}")
    server.serve_forever()
