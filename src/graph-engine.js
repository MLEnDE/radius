/**
 * Radius v0.2 — Core Graph Database & Hop-Radius Progressive Disclosure Engine
 * Public repository ships with anonymous Demo Data by default.
 * Personal network data is unlocked locally via encrypted vault (src/vault.js) or JSON import.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'radius_v02_state';
  const VAULT_STATUS_KEY = 'radius_v02_vault_unlocked';

  const PUBLIC_DEMO_STATE = {
    profile: {
      id: 'usr_demo_01',
      name: 'Alex Rivera (Demo)',
      handle: '@alex.demo',
      headline: 'Cloud Architect · Public Demo Mode',
      location: 'Zurich, Switzerland',
      avatarInitials: 'AR'
    },
    activeCircles: ['public', 'professional'],
    activeEventId: 'evt_demo_meetup',
    events: [
      {
        id: 'evt_demo_meetup',
        label: 'Cloud Tech Meetup — Demo Session',
        shortLabel: 'Cloud Tech Meetup',
        groupId: 'grp_demo_cloud',
        date: '2026-11-05',
        location: 'Zurich',
        baselineNodeIds: ['node_google_cloud', 'node_cloud_arch', 'node_ai_agents']
      }
    ],
    socialGroups: [
      {
        id: 'grp_demo_cloud',
        name: 'Cloud Developer Community (Demo)',
        chapter: 'Zurich Chapter',
        role: 'Member',
        location: 'Zurich',
        visibility: 'public',
        relatedNodeIds: ['node_google_cloud', 'node_cloud_arch', 'node_ai_agents']
      }
    ],
    nodes: [
      {
        id: 'node_books',
        label: 'Books & Reading',
        icon: '📚',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 1,
        visibility: 'public',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_fiction',
        label: 'Contemporary Fiction',
        icon: '📖',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 2,
        visibility: 'friends',
        unlockOnMatch: true,
        attributes: { genre: 'Fiction' }
      },
      {
        id: 'node_book_detail',
        label: 'Current Book Club Pick (Demo)',
        icon: '✨',
        nodeType: 'Detail',
        category: 'hobbies',
        tier: 3,
        visibility: 'friends',
        unlockOnMatch: true,
        attributes: {
          status: 'Currently Reading',
          intent: 'mutual_learning',
          note: 'Unlock Personal Vault to load real book title!'
        }
      },
      {
        id: 'node_tennis',
        label: 'Tennis',
        icon: '🎾',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 1,
        visibility: 'public',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_doubles_tennis',
        label: 'Doubles Tennis',
        icon: '🎾',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 2,
        visibility: 'friends',
        unlockOnMatch: true,
        attributes: { format: 'Doubles' }
      },
      {
        id: 'node_tennis_rating',
        label: 'Intermediate · Seeking Partner',
        icon: '🏆',
        nodeType: 'Detail',
        category: 'hobbies',
        tier: 3,
        visibility: 'friends',
        unlockOnMatch: true,
        attributes: {
          rating: 3.3,
          ratingSystem: 'Club Rating',
          intent: 'seeking_partner',
          schedule: 'Weekend Mornings'
        }
      },
      {
        id: 'node_google_cloud',
        label: 'Google Cloud',
        icon: '☁️',
        nodeType: 'Concept',
        category: 'professional',
        tier: 1,
        visibility: 'professional',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_cloud_arch',
        label: 'Cloud Architecture',
        icon: '🏗️',
        nodeType: 'Concept',
        category: 'professional',
        tier: 2,
        visibility: 'professional',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_ai_agents',
        label: 'AI Agents & A2A Protocol',
        icon: '🤖',
        nodeType: 'Concept',
        category: 'professional',
        tier: 2,
        visibility: 'professional',
        unlockOnMatch: true,
        attributes: { intent: 'mutual_learning' }
      },
      {
        id: 'node_running',
        label: 'Running',
        icon: '🏃‍♀️',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 1,
        visibility: 'public',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_trail_running',
        label: 'Trail Running',
        icon: '⛰️',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 2,
        visibility: 'friends',
        unlockOnMatch: true,
        attributes: {}
      },
      {
        id: 'node_ultramarathons',
        label: 'Ultramarathons',
        icon: '🏅',
        nodeType: 'Concept',
        category: 'hobbies',
        tier: 2,
        visibility: 'friends',
        unlockOnMatch: true,
        isSharedOntologyOnly: true,
        attributes: {}
      }
    ],
    edges: [
      { source: 'node_fiction', target: 'node_books', type: 'PART_OF', weight: 1.0 },
      { source: 'node_book_detail', target: 'node_fiction', type: 'HAS_DETAIL', weight: 1.0 },
      { source: 'node_doubles_tennis', target: 'node_tennis', type: 'PART_OF', weight: 1.0 },
      { source: 'node_tennis_rating', target: 'node_doubles_tennis', type: 'HAS_DETAIL', weight: 1.0 },
      { source: 'node_cloud_arch', target: 'node_google_cloud', type: 'PART_OF', weight: 1.0 },
      { source: 'node_ai_agents', target: 'node_google_cloud', type: 'PART_OF', weight: 1.0 },
      { source: 'node_trail_running', target: 'node_running', type: 'PART_OF', weight: 1.0 },
      { source: 'node_ultramarathons', target: 'node_running', type: 'PART_OF', weight: 1.0 },
      { source: 'node_trail_running', target: 'node_ultramarathons', type: 'SIMILAR_TO', weight: 0.85 }
    ],
    contacts: [
      {
        id: 'cnt_demo_a',
        name: 'Contact A (Demo)',
        handle: '@contact.a',
        headline: 'Cloud Engineer · Demo Contact',
        location: 'Zurich',
        avatarInitials: 'CA',
        avatarColor: 'from-emerald-500 to-teal-600',
        relationshipStatus: 'Existing Contact',
        isManualCard: false,
        claimed: true,
        groupIds: ['grp_demo_cloud'],
        vectorNodeIds: [
          'node_google_cloud',
          'node_cloud_arch',
          'node_books',
          'node_fiction',
          'node_book_detail',
          'node_tennis',
          'node_doubles_tennis',
          'node_tennis_rating'
        ],
        contactAttributes: {
          node_tennis_rating: {
            rating: 3.5,
            ratingSystem: 'Club Rating',
            intent: 'seeking_partner'
          }
        },
        eventTags: ['Previous Meetup'],
        notes: 'Public demo contact. Tap "🔐 Unlock Vault" in the top bar to load your real personal network!',
        lastInteractionAt: '2026-10-15T18:30:00Z'
      },
      {
        id: 'cnt_demo_b',
        name: 'Contact B (Demo)',
        handle: '@contact.b',
        headline: 'Platform Architect · Demo Contact',
        location: 'Zurich',
        avatarInitials: 'CB',
        avatarColor: 'from-indigo-500 to-violet-600',
        relationshipStatus: 'New Connection',
        isManualCard: false,
        claimed: true,
        groupIds: ['grp_demo_cloud'],
        vectorNodeIds: [
          'node_google_cloud',
          'node_ai_agents',
          'node_books',
          'node_fiction',
          'node_running',
          'node_ultramarathons'
        ],
        contactAttributes: {},
        eventTags: ['Cloud Tech Meetup — Demo Session'],
        notes: 'Demo card exchange contact.',
        lastInteractionAt: '2026-11-02T18:45:00Z'
      }
    ],
    interactions: [
      {
        id: 'int_demo_1',
        contactId: 'cnt_demo_a',
        eventId: 'evt_demo_meetup',
        eventLabel: 'Previous Meetup',
        type: 'card_exchange',
        note: 'Demo interaction record.',
        createdAt: '2026-10-15T18:30:00Z'
      }
    ]
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  class RadiusGraphEngine {
    constructor() {
      this.isVaultUnlocked = localStorage.getItem(VAULT_STATUS_KEY) === 'true';
      this.state = this.loadState();
    }

    loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.profile && Array.isArray(parsed.nodes)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load state from localStorage:', e);
      }
      return clone(PUBLIC_DEMO_STATE);
    }

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
        localStorage.setItem(VAULT_STATUS_KEY, this.isVaultUnlocked ? 'true' : 'false');
      } catch (e) {
        console.warn('Failed to save state:', e);
      }
    }

    unlockPersonalVault(passphrase) {
      if (!global.RadiusVault) {
        throw new Error('Vault module not loaded.');
      }
      const decryptedState = global.RadiusVault.decryptVault(passphrase);
      this.state = decryptedState;
      this.isVaultUnlocked = true;
      this.saveState();
      return this.state;
    }

    importVaultJSON(jsonStringOrObject) {
      const parsed =
        typeof jsonStringOrObject === 'string' ? JSON.parse(jsonStringOrObject) : jsonStringOrObject;
      if (!parsed || !parsed.profile || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid Radius vault JSON structure.');
      }
      this.state = parsed;
      this.isVaultUnlocked = true;
      this.saveState();
      return this.state;
    }

    lockToPublicDemo() {
      this.state = clone(PUBLIC_DEMO_STATE);
      this.isVaultUnlocked = false;
      this.saveState();
      return this.state;
    }

    getNode(nodeId) {
      return this.state.nodes.find((n) => n.id === nodeId) || null;
    }

    getUserNodes() {
      return this.state.nodes.filter((n) => !n.isSharedOntologyOnly);
    }

    getActiveEvent() {
      if (!this.state.activeEventId) return null;
      return this.state.events.find((e) => e.id === this.state.activeEventId) || null;
    }

    toggleEventMode(eventId) {
      const defaultEventId = this.state.events[0] ? this.state.events[0].id : null;
      const targetId = eventId || defaultEventId;
      if (this.state.activeEventId === targetId) {
        this.state.activeEventId = null;
      } else {
        this.state.activeEventId = targetId;
      }
      this.saveState();
      return this.getActiveEvent();
    }

    toggleCircle(circleId) {
      const idx = this.state.activeCircles.indexOf(circleId);
      if (idx >= 0) {
        if (this.state.activeCircles.length > 1) {
          this.state.activeCircles.splice(idx, 1);
        }
      } else {
        this.state.activeCircles.push(circleId);
      }
      this.saveState();
      return this.state.activeCircles;
    }

    isExposedByCircles(node, activeCircles) {
      const circles = activeCircles || this.state.activeCircles;
      if (circles.includes('inner')) return true;
      if (node.visibility === 'public' && circles.includes('public')) return true;
      if (node.visibility === 'professional' && circles.includes('professional')) return true;
      if (node.visibility === 'friends' && circles.includes('friends')) return true;
      if (circles.includes('public') && node.tier === 1 && node.category === 'hobbies') return true;
      return false;
    }

    getChildNodes(parentNodeId) {
      const childIds = this.state.edges
        .filter((e) => e.target === parentNodeId && (e.type === 'PART_OF' || e.type === 'HAS_DETAIL'))
        .map((e) => e.source);
      return childIds.map((id) => this.getNode(id)).filter(Boolean);
    }

    getParentNode(childNodeId) {
      const edge = this.state.edges.find(
        (e) => e.source === childNodeId && (e.type === 'PART_OF' || e.type === 'HAS_DETAIL')
      );
      return edge ? this.getNode(edge.target) : null;
    }

    getSimilarNodes(nodeId) {
      const results = [];
      for (const edge of this.state.edges) {
        if (edge.type === 'SIMILAR_TO') {
          if (edge.source === nodeId) {
            const target = this.getNode(edge.target);
            if (target) results.push({ node: target, weight: edge.weight, reason: 'SIMILAR_TO' });
          } else if (edge.target === nodeId) {
            const source = this.getNode(edge.source);
            if (source) results.push({ node: source, weight: edge.weight, reason: 'SIMILAR_TO' });
          }
        }
      }
      return results;
    }

    evaluateHandshake(contactVectorIds, contactAttributes = {}, options = {}) {
      const activeCircles = options.activeCircles || this.state.activeCircles;
      const activeEvent = options.activeEvent !== undefined ? options.activeEvent : this.getActiveEvent();
      const baselineSet = new Set(activeEvent ? activeEvent.baselineNodeIds : []);
      const contactSet = new Set(contactVectorIds || []);
      const userNodes = this.getUserNodes();
      const userNodeIds = new Set(userNodes.map((n) => n.id));

      const stage1BaselineIds = new Set();
      for (const node of userNodes) {
        if (this.isExposedByCircles(node, activeCircles)) {
          stage1BaselineIds.add(node.id);
        }
      }

      const stage2UnlockedIds = new Set();
      for (const node of userNodes) {
        if (node.tier === 1 && contactSet.has(node.id)) {
          const children = this.getChildNodes(node.id);
          for (const child of children) {
            if (!child.isSharedOntologyOnly && child.unlockOnMatch) {
              stage2UnlockedIds.add(child.id);
            }
          }
        }
      }

      const stage3UnlockedIds = new Set();
      for (const node of userNodes) {
        if (node.tier === 2) {
          const exactTier2 = contactSet.has(node.id);
          const fuzzyTier2 = this.getSimilarNodes(node.id).some((sim) => contactSet.has(sim.node.id));
          if (exactTier2 || fuzzyTier2) {
            stage2UnlockedIds.add(node.id);
            const details = this.getChildNodes(node.id);
            for (const detail of details) {
              if (!detail.isSharedOntologyOnly && detail.unlockOnMatch) {
                stage3UnlockedIds.add(detail.id);
              }
            }
          }
        }
      }

      for (const node of userNodes) {
        if (node.tier === 3 && contactSet.has(node.id) && node.unlockOnMatch) {
          stage3UnlockedIds.add(node.id);
          const parent = this.getParentNode(node.id);
          if (parent) stage2UnlockedIds.add(parent.id);
        }
      }

      const allVisibleIds = new Set([...stage1BaselineIds, ...stage2UnlockedIds, ...stage3UnlockedIds]);

      const matches = [];
      for (const node of userNodes) {
        if (contactSet.has(node.id)) {
          const isBaselineEventTopic = baselineSet.has(node.id);
          const parent = this.getParentNode(node.id);
          const grandParent = parent ? this.getParentNode(parent.id) : null;
          const pathLabels = [grandParent?.label, parent?.label, node.label].filter(Boolean);

          let scoreWeight = node.tier === 3 ? 1.0 : node.tier === 2 ? 0.9 : 0.6;
          let badge = node.tier >= 2 ? '0-Hop Deep Match' : '0-Hop Match';
          let intentBadge = null;
          let proximityNote = null;

          const myAttrs = node.attributes || {};
          const theirAttrs = (contactAttributes && contactAttributes[node.id]) || {};

          if (myAttrs.rating && theirAttrs.rating) {
            const diff = Math.abs(Number(myAttrs.rating) - Number(theirAttrs.rating)).toFixed(1);
            scoreWeight += 0.15;
            proximityNote = `${myAttrs.ratingSystem || 'Rating'} ${myAttrs.rating} vs ${theirAttrs.rating} (Δ ${diff})`;
          }
          if (myAttrs.intent === 'seeking_partner' && theirAttrs.intent === 'seeking_partner') {
            intentBadge = '🎾 Actionable Partner Match';
          } else if (node.tier === 3 && node.category === 'hobbies') {
            intentBadge = '📖 Shared Deep Interest';
          } else if (myAttrs.intent === 'mutual_learning') {
            intentBadge = '✨ Mutual Learning';
          }

          matches.push({
            nodeId: node.id,
            node,
            matchType: 'exact',
            hops: 0,
            tier: node.tier,
            path: pathLabels.join(' → '),
            score: Number(scoreWeight.toFixed(2)),
            badge,
            intentBadge,
            proximityNote,
            theirNote: theirAttrs.note || null,
            isBeyondGroup: !isBaselineEventTopic,
            wasProgressivelyUnlocked:
              !stage1BaselineIds.has(node.id) &&
              (stage2UnlockedIds.has(node.id) || stage3UnlockedIds.has(node.id))
          });
        } else {
          const sims = this.getSimilarNodes(node.id);
          for (const sim of sims) {
            if (contactSet.has(sim.node.id) && !userNodeIds.has(sim.node.id)) {
              const isBaselineEventTopic = baselineSet.has(node.id) || baselineSet.has(sim.node.id);
              matches.push({
                nodeId: node.id,
                node,
                otherNode: sim.node,
                matchType: 'fuzzy',
                hops: 1,
                tier: node.tier,
                path: `${node.label} ↔ ${sim.node.label} (1-Hop)`,
                score: sim.weight,
                badge: `1-Hop Fuzzy (${Math.round(sim.weight * 100)}%)`,
                intentBadge: '⛰️ Shared Trail / Endurance Interest',
                proximityNote: null,
                theirNote: null,
                isBeyondGroup: !isBaselineEventTopic,
                wasProgressivelyUnlocked: !stage1BaselineIds.has(node.id)
              });
            }
          }
        }
      }

      matches.sort((a, b) => {
        if (a.isBeyondGroup !== b.isBeyondGroup) return a.isBeyondGroup ? -1 : 1;
        if (b.tier !== a.tier) return b.tier - a.tier;
        return b.score - a.score;
      });

      const matchedNodeIds = new Set(matches.map((m) => m.nodeId));
      const leafMatches = matches.filter((m) => {
        const children = this.getChildNodes(m.nodeId);
        return !children.some((c) => matchedNodeIds.has(c.id));
      });

      const beyondGroupHighlights = leafMatches.filter((m) => m.isBeyondGroup);
      const baselineMatches = leafMatches.filter((m) => !m.isBeyondGroup);

      return {
        stage1BaselineIds: Array.from(stage1BaselineIds),
        stage2UnlockedIds: Array.from(stage2UnlockedIds),
        stage3UnlockedIds: Array.from(stage3UnlockedIds),
        allVisibleIds: Array.from(allVisibleIds),
        matches,
        leafMatches,
        beyondGroupHighlights,
        baselineMatches
      };
    }

    logCheckIn(contactId, customNote = '', interactionType = 'check_in') {
      const contact = this.state.contacts.find((c) => c.id === contactId);
      if (!contact) return null;
      const activeEvent = this.getActiveEvent();
      const now = new Date().toISOString();

      if (activeEvent && !contact.eventTags.includes(activeEvent.label)) {
        contact.eventTags.unshift(activeEvent.label);
      }
      if (customNote && customNote.trim()) {
        contact.notes = customNote.trim();
      }
      contact.lastInteractionAt = now;

      const interaction = {
        id: 'int_' + Date.now(),
        contactId: contact.id,
        eventId: activeEvent ? activeEvent.id : null,
        eventLabel: activeEvent ? activeEvent.label : 'Direct Check-In',
        type: interactionType,
        note: customNote || (activeEvent ? `Checked in during ${activeEvent.label}` : 'Logged check-in'),
        createdAt: now
      };
      this.state.interactions.unshift(interaction);
      this.saveState();
      return { contact, interaction, activeEvent };
    }

    saveContactHandshake({ id, name, handle, headline, vectorNodeIds, note, isManualCard = false, contactAttributes = {} }) {
      const activeEvent = this.getActiveEvent();
      const now = new Date().toISOString();
      const cleanName = (name || 'New Event Contact').trim();
      const initials =
        cleanName
          .split(/\s+/)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'NC';

      let contact = id ? this.state.contacts.find((c) => c.id === id) : null;
      if (!contact) {
        contact = this.state.contacts.find((c) => c.name.toLowerCase() === cleanName.toLowerCase());
      }

      if (contact) {
        contact.headline = headline || contact.headline;
        contact.vectorNodeIds = Array.from(new Set([...contact.vectorNodeIds, ...(vectorNodeIds || [])]));
        contact.contactAttributes = Object.assign({}, contact.contactAttributes || {}, contactAttributes);
        if (activeEvent && !contact.eventTags.includes(activeEvent.label)) {
          contact.eventTags.unshift(activeEvent.label);
        }
        if (note) contact.notes = note;
        contact.lastInteractionAt = now;
      } else {
        const colors = [
          'from-indigo-500 to-purple-600',
          'from-amber-500 to-orange-600',
          'from-pink-500 to-rose-600',
          'from-cyan-500 to-blue-600'
        ];
        contact = {
          id: 'cnt_' + Date.now(),
          name: cleanName,
          handle: handle || '@' + cleanName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          headline: headline || (activeEvent ? `Met at ${activeEvent.shortLabel}` : 'Radius Connection'),
          location: 'Zurich, Switzerland',
          avatarInitials: initials,
          avatarColor: colors[this.state.contacts.length % colors.length],
          relationshipStatus: isManualCard ? 'Manual H2H Card (Unclaimed)' : 'Verified H2H Handshake',
          isManualCard: Boolean(isManualCard),
          claimed: !isManualCard,
          groupIds: activeEvent && activeEvent.groupId ? [activeEvent.groupId] : [],
          vectorNodeIds: vectorNodeIds || [],
          contactAttributes: contactAttributes || {},
          eventTags: activeEvent ? [activeEvent.label] : [],
          notes: note || '',
          lastInteractionAt: now
        };
        this.state.contacts.unshift(contact);
      }

      const interaction = {
        id: 'int_' + Date.now(),
        contactId: contact.id,
        eventId: activeEvent ? activeEvent.id : null,
        eventLabel: activeEvent ? activeEvent.label : 'Direct Handshake',
        type: isManualCard ? 'manual_card' : 'card_exchange',
        note:
          note ||
          (isManualCard
            ? `Created manual H2H card for ${contact.name}`
            : `Exchanged H2H cards with ${contact.name}`),
        createdAt: now
      };
      this.state.interactions.unshift(interaction);
      this.saveState();
      return { contact, interaction, activeEvent };
    }

    addCustomVectorNode({ label, tier = 1, parentNodeId = null, category = 'hobbies', visibility = 'public', icon = '✨', note = '' }) {
      const cleanLabel = (label || '').trim();
      if (!cleanLabel) return null;
      const id =
        'node_custom_' +
        cleanLabel.toLowerCase().replace(/[^a-z0-9]+/g, '_') +
        '_' +
        Date.now().toString(36).slice(-3);
      const newNode = {
        id,
        label: cleanLabel,
        icon: icon || (tier === 3 ? '✨' : tier === 2 ? '🔹' : '🌟'),
        nodeType: tier === 3 ? 'Detail' : 'Concept',
        category,
        tier: Number(tier),
        visibility,
        unlockOnMatch: true,
        attributes: note ? { note } : {}
      };
      this.state.nodes.push(newNode);
      if (parentNodeId && this.getNode(parentNodeId)) {
        this.state.edges.push({
          source: id,
          target: parentNodeId,
          type: tier === 3 ? 'HAS_DETAIL' : 'PART_OF',
          weight: 1.0
        });
      }
      this.saveState();
      return newNode;
    }

    updateVectorNode(nodeId, { label, icon, visibility, note }) {
      const node = this.getNode(nodeId);
      if (!node) return null;
      if (label && label.trim()) node.label = label.trim();
      if (icon && icon.trim()) node.icon = icon.trim();
      if (visibility) node.visibility = visibility;
      if (note !== undefined) {
        node.attributes = Object.assign({}, node.attributes || {}, { note: note.trim() });
      }
      this.saveState();
      return node;
    }

    deleteVectorNode(nodeId) {
      const children = this.getChildNodes(nodeId).map((c) => c.id);
      const toRemove = new Set([nodeId, ...children]);
      this.state.nodes = this.state.nodes.filter((n) => !toRemove.has(n.id));
      this.state.edges = this.state.edges.filter(
        (e) => !toRemove.has(e.source) && !toRemove.has(e.target)
      );
      this.saveState();
      return true;
    }

    updateFullCard({ profileUpdates, nodeUpdates, deletedNodeIds }) {
      if (profileUpdates) {
        if (profileUpdates.name !== undefined && profileUpdates.name.trim()) {
          this.state.profile.name = profileUpdates.name.trim();
          this.state.profile.avatarInitials =
            this.state.profile.name
              .split(/\s+/)
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) || 'ER';
        }
        if (profileUpdates.headline !== undefined) {
          this.state.profile.headline = profileUpdates.headline.trim();
        }
        if (profileUpdates.location !== undefined) {
          this.state.profile.location = profileUpdates.location.trim();
        }
        if (profileUpdates.linkedin !== undefined) {
          this.state.profile.linkedin = profileUpdates.linkedin.trim();
        }
        if (profileUpdates.avatarUrl !== undefined) {
          this.state.profile.avatarUrl = profileUpdates.avatarUrl;
        }
      }

      if (Array.isArray(deletedNodeIds) && deletedNodeIds.length > 0) {
        const toRemove = new Set(deletedNodeIds);
        for (const id of deletedNodeIds) {
          this.getChildNodes(id).forEach((c) => toRemove.add(c.id));
        }
        this.state.nodes = this.state.nodes.filter((n) => !toRemove.has(n.id));
        this.state.edges = this.state.edges.filter(
          (e) => !toRemove.has(e.source) && !toRemove.has(e.target)
        );
      }

      if (Array.isArray(nodeUpdates)) {
        for (const upd of nodeUpdates) {
          const node = this.getNode(upd.id);
          if (!node) continue;
          if (upd.label !== undefined && upd.label.trim()) node.label = upd.label.trim();
          if (upd.icon !== undefined && upd.icon.trim()) node.icon = upd.icon.trim();
          if (upd.visibility) node.visibility = upd.visibility;
        }
      }

      this.saveState();
      return this.state;
    }

    exportH2HCardJSON() {
      const activeEvent = this.getActiveEvent();
      const userNodes = this.getUserNodes();
      return {
        $schema: 'https://radius.app/schema/h2h-v0.2.json',
        version: '0.2.0',
        profile: this.state.profile,
        exchangeContext: {
          activeCircles: this.state.activeCircles,
          activeEvent: activeEvent
            ? {
                eventId: activeEvent.id,
                label: activeEvent.label,
                groupId: activeEvent.groupId,
                date: activeEvent.date
              }
            : null
        },
        socialGroups: this.state.socialGroups,
        vectorSubgraph: {
          nodes: userNodes.map((n) => ({
            id: n.id,
            label: n.label,
            category: n.category,
            tier: n.tier,
            visibility: n.visibility,
            unlockOnMatch: n.unlockOnMatch,
            attributes: n.attributes
          })),
          edges: this.state.edges
        }
      };
    }

    getShareableHandshakeURL() {
      const base =
        typeof location !== 'undefined'
          ? `${location.origin}${location.pathname}`
          : 'https://mlende.github.io/radius/';
      const activeEvent = this.getActiveEvent();
      const payload = {
        n: this.state.profile.name,
        h: this.state.profile.handle,
        e: activeEvent ? activeEvent.shortLabel : 'Radius H2H',
        c: this.state.activeCircles.map((c) => c[0]).join('')
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${base}#h2h=${encoded}`;
    }
  }

  global.RadiusGraphEngine = RadiusGraphEngine;
})(typeof window !== 'undefined' ? window : globalThis);
