# Contributing to Radius 🤝

Thank you for your interest in collaborating on **Radius**!

## Areas for Collaboration

1. **H2H Card Schema (`.h2h.json`)**: Refining the JSON Schema for portable human vector subgraphs, privacy tiers, and group scopes.
2. **Core Graph & Hop-Radius Matching Engine**: Improving graph traversal, `SIMILAR_TO` edge weights, attribute proximity scoring (e.g., skill/rating closeness), and complementary intent matching (`seeking_partner`, `offering_mentorship`).
3. **Social Groups & Presets**: Designing group-scoped card views (e.g., *American Women's Club Zurich*, *Google Cloud Developer Groups*), community bridge suggestions, and directory features.
4. **UI / UX & Graph Visualization**: Building intuitive ways to edit personal vector graphs, simulate H2H card handshakes, and explore contact overlaps in the CRM.
5. **Phase 2 Proximity Discovery**: Prototyping Web Bluetooth / BLE / local P2P privacy-preserving handshake protocols.

## Workflow

1. Check [**SPEC.md**](./SPEC.md) to understand the current architecture and graph model.
2. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and include clear commit messages.
4. Open a Pull Request describing the motivation and any updates to `SPEC.md`.
