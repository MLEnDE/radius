/**
 * Radius v0.2 — Simplified, High-Craft Mobile UI (Emil Kowalski Design Eng + A2UI Declarative Cards)
 * Built for fast, 5-second comprehension during live in-person demos on Google Pixel 9.
 */
(function () {
  'use strict';

  const engine = new window.RadiusGraphEngine();

  const uiState = {
    activeTab: 'reception', // 'reception' | 'handshake' | 'mycard' | 'crm'
    handshakeMode: 'interactive', // 'interactive' | 'qr'
    selectedPresetIndex: 1, // 0 = first contact, 1 = second contact, -1 = custom
    handshakeName: '',
    handshakeHeadline: '',
    handshakeVectors: [],
    handshakeNote: '',
    showManualModal: false,
    showAddNodeModal: false,
    showVaultModal: false,
    showCardEditorModal: false,
    pendingAvatarDataUrl: null,
    pendingDeletedNodeIds: [],
    toastMessage: null
  };

  function syncPresetFromContacts(presetIdx) {
    uiState.selectedPresetIndex = presetIdx;
    if (presetIdx >= 0 && engine.state.contacts[presetIdx]) {
      const c = engine.state.contacts[presetIdx];
      uiState.handshakeName = c.name;
      uiState.handshakeHeadline = c.headline;
      uiState.handshakeVectors = [...(c.vectorNodeIds || [])];
      uiState.handshakeNote = c.notes || '';
    } else {
      const activeEvent = engine.getActiveEvent();
      uiState.handshakeName = '';
      uiState.handshakeHeadline = activeEvent ? `${activeEvent.shortLabel} Attendee` : 'Event Attendee';
      uiState.handshakeVectors = ['node_google_cloud', 'node_books'];
      uiState.handshakeNote = '';
    }
  }

  syncPresetFromContacts(engine.state.contacts.length > 1 ? 1 : 0);

  function showToast(msg) {
    uiState.toastMessage = msg;
    renderToast();
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      uiState.toastMessage = null;
      renderToast();
    }, 2600);
  }

  function renderToast() {
    const el = document.getElementById('toast-container');
    if (!el) return;
    if (!uiState.toastMessage) {
      el.innerHTML = '';
      return;
    }
    el.innerHTML = `
      <div class="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-[380px] w-[92%] bg-slate-900/95 border border-white/15 text-slate-100 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2.5 text-xs font-medium animate-enter">
        <span class="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
        <span class="flex-1 leading-snug">${escapeHtml(uiState.toastMessage)}</span>
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderHeader() {
    const activeEvent = engine.getActiveEvent();
    const defaultEvent = engine.state.events[0] || { label: 'Event Mode', shortLabel: 'Event Mode' };

    return `
      <header class="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-xl border-b border-white/[0.07] px-4 safe-top pb-3">
        <!-- Row 1: Brand, Identity/Vault, Quick Add -->
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center text-teal-300 font-bold text-sm shrink-0">
              R
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-[15px] tracking-[-0.02em] text-white">Radius</span>
                <button
                  data-action="open-vault-modal"
                  class="text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                    engine.isVaultUnlocked
                      ? 'bg-white/[0.05] text-slate-300 border-white/10'
                      : 'bg-amber-400/15 text-amber-300 border-amber-400/30'
                  }"
                >
                  ${engine.isVaultUnlocked ? `🔓 ${escapeHtml(engine.state.profile.name.split(' ')[0])}` : '🔐 Unlock Vault'}
                </button>
              </div>
            </div>
          </div>

          <button
            data-action="open-manual-modal"
            class="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.06] text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1"
          >
            <span>＋</span>
            <span>Add Person</span>
          </button>
        </div>

        <!-- Row 2: Calm, Single-Tap Event Context Pill -->
        <button
          data-action="toggle-event-mode"
          class="mt-2.5 w-full rounded-2xl px-3.5 py-2.5 text-left flex items-center justify-between gap-3 border ${
            activeEvent
              ? 'bg-teal-500/[0.08] border-teal-400/30'
              : 'bg-white/[0.03] border-white/[0.07]'
          }"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="w-2 h-2 rounded-full shrink-0 ${
              activeEvent ? 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]' : 'bg-slate-600'
            }"></span>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-white truncate">
                ${activeEvent ? escapeHtml(activeEvent.label) : `Event Mode Off · Tap for ${escapeHtml(defaultEvent.shortLabel || defaultEvent.label)}`}
              </p>
              <p class="text-[11px] text-slate-400 truncate mt-0.5">
                ${
                  activeEvent
                    ? 'Muting expected Google Cloud overlap · elevating personal matches'
                    : 'Showing all professional & personal overlaps equally'
                }
              </p>
            </div>
          </div>
          <span class="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
            activeEvent ? 'bg-teal-400/20 text-teal-300' : 'bg-white/[0.06] text-slate-400'
          }">
            ${activeEvent ? 'Active' : 'Off'}
          </span>
        </button>
      </header>
    `;
  }

  function renderReceptionTab() {
    const activeEvent = engine.getActiveEvent();
    const contacts = engine.state.contacts;

    const vaultBanner = !engine.isVaultUnlocked
      ? `
        <div class="rounded-2xl bg-amber-400/[0.08] border border-amber-400/25 p-3.5 flex items-center justify-between gap-3 animate-enter">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-amber-200">Public Demo Mode</p>
            <p class="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Unlock your private vault with your passcode to load your personal network.
            </p>
          </div>
          <button
            data-action="open-vault-modal"
            class="shrink-0 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs"
          >
            Unlock
          </button>
        </div>
      `
      : '';

    const contactCards = contacts
      .map((contact, idx) => {
        const evalResult = engine.evaluateHandshake(contact.vectorNodeIds, contact.contactAttributes || {});
        const hasActiveEventTag = activeEvent && contact.eventTags.includes(activeEvent.label);

        const beyondItems = evalResult.beyondGroupHighlights.map((m) => {
          const subtitleParts = [m.path];
          if (m.proximityNote) subtitleParts.push(m.proximityNote);
          return `
            <div class="p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-start gap-3">
              <span class="text-lg leading-none mt-0.5 shrink-0">${m.node.icon || '✨'}</span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[13px] font-semibold text-white truncate">${escapeHtml(m.node.label)}</span>
                  <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-400/15 text-teal-300 shrink-0">
                    Tier ${m.tier} unlocked
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(subtitleParts.join(' · '))}</p>
                ${
                  m.theirNote
                    ? `<p class="text-[11px] text-slate-300 mt-1 italic">"${escapeHtml(m.theirNote)}"</p>`
                    : ''
                }
              </div>
            </div>
          `;
        });

        const baselineLabels = evalResult.baselineMatches.map((m) => m.node.label).join(' · ');

        return `
          <article class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-4 space-y-3.5 animate-enter">
            <!-- Contact Identity Header -->
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br ${
                  contact.avatarColor || 'from-teal-500 to-emerald-600'
                } flex items-center justify-center text-white font-semibold text-xs shrink-0">
                  ${escapeHtml(contact.avatarInitials)}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-[15px] tracking-[-0.01em] text-white truncate">${escapeHtml(contact.name)}</h3>
                    ${
                      hasActiveEventTag
                        ? `<span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-400/15 text-emerald-300 shrink-0">Checked in</span>`
                        : ''
                    }
                  </div>
                  <p class="text-xs text-slate-400 truncate">${escapeHtml(contact.headline)}</p>
                </div>
              </div>

              <button
                data-action="open-contact-handshake"
                data-preset-idx="${idx}"
                class="shrink-0 px-2.5 py-1.5 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-medium border border-white/[0.08]"
              >
                Unlock Tree →
              </button>
            </div>

            <!-- Declarative Beyond-Group Highlights -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-medium text-teal-300">
                  Shared beyond ${activeEvent ? escapeHtml(activeEvent.shortLabel) : 'group'}
                </span>
                <span class="text-[11px] text-slate-500 tabular-nums">
                  ${evalResult.beyondGroupHighlights.length} ${evalResult.beyondGroupHighlights.length === 1 ? 'match' : 'matches'}
                </span>
              </div>
              ${
                beyondItems.length
                  ? `<div class="space-y-2">${beyondItems.join('')}</div>`
                  : `<p class="text-xs text-slate-500 py-1">Tap "Unlock Tree" to explore common ground.</p>`
              }
            </div>

            ${
              baselineLabels
                ? `<div class="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                    <span>Expected event overlap:</span>
                    <span class="text-slate-400">${escapeHtml(baselineLabels)}</span>
                  </div>`
                : ''
            }

            <!-- Single Clear Check-In Action -->
            <button
              data-action="checkin-contact"
              data-contact-id="${contact.id}"
              class="w-full py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 ${
                hasActiveEventTag
                  ? 'bg-white/[0.04] text-emerald-300 border border-emerald-400/25'
                  : 'bg-teal-400 text-slate-950'
              }"
            >
              <span>${
                hasActiveEventTag
                  ? `✓ Checked in at ${activeEvent ? escapeHtml(activeEvent.shortLabel) : 'Event'}`
                  : `Check In with ${escapeHtml(contact.name)}`
              }</span>
            </button>
          </article>
        `;
      })
      .join('');

    return `
      <section class="space-y-3">
        ${vaultBanner}
        ${contactCards}
      </section>
    `;
  }

  function renderHandshakeTab() {
    const shareUrl = engine.getShareableHandshakeURL();
    const activeEvent = engine.getActiveEvent();
    const currentContact =
      uiState.selectedPresetIndex >= 0 ? engine.state.contacts[uiState.selectedPresetIndex] : null;
    const contactAttrs = currentContact ? currentContact.contactAttributes || {} : {};

    const evalResult = engine.evaluateHandshake(uiState.handshakeVectors, contactAttrs);
    const tier1Nodes = engine.getUserNodes().filter((n) => n.tier === 1);

    if (uiState.handshakeMode === 'qr') {
      return `
        <section class="space-y-3 animate-enter">
          <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-900 border border-white/[0.08]">
            <button
              data-action="switch-handshake-mode"
              data-mode="interactive"
              class="py-2 rounded-xl text-xs font-semibold text-slate-400"
            >
              Interactive Demo
            </button>
            <button
              data-action="switch-handshake-mode"
              data-mode="qr"
              class="py-2 rounded-xl text-xs font-semibold bg-white/10 text-white"
            >
              My QR Code
            </button>
          </div>

          <div class="rounded-2xl bg-slate-900/80 border border-white/[0.08] p-5 text-center space-y-4">
            <div>
              <h3 class="text-base font-semibold text-white tracking-[-0.01em]">${escapeHtml(engine.state.profile.name)}</h3>
              <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(engine.state.profile.headline)}</p>
            </div>

            <div class="w-52 h-52 mx-auto p-3 bg-white rounded-3xl shadow-xl">
              ${window.RadiusQR.renderSVG(shareUrl)}
            </div>

            <p class="text-xs text-slate-400 max-w-[26ch] mx-auto leading-relaxed">
              Scan with any phone camera to open your H2H card and unlock shared interests.
            </p>

            <div class="grid grid-cols-2 gap-2 pt-1">
              <button
                data-action="native-share"
                class="py-2.5 px-3 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs"
              >
                Share Link
              </button>
              <button
                data-action="copy-share-url"
                class="py-2.5 px-3 rounded-xl bg-white/[0.06] text-slate-200 font-medium text-xs border border-white/10"
              >
                Copy URL
              </button>
            </div>
          </div>
        </section>
      `;
    }

    // Visual Progressive Unlock Tree per Tier 1 category
    const progressiveTreeHtml = tier1Nodes
      .map((t1) => {
        const t1Matched = uiState.handshakeVectors.includes(t1.id);
        const t2Nodes = engine.getChildNodes(t1.id).filter((n) => !n.isSharedOntologyOnly);

        return `
          <div class="rounded-xl p-3 border ${
            t1Matched ? 'bg-teal-500/[0.07] border-teal-400/30' : 'bg-white/[0.02] border-white/[0.06]'
          }">
            <div class="flex items-center justify-between gap-2">
              <button
                data-action="toggle-handshake-vector"
                data-node-id="${t1.id}"
                class="flex items-center gap-2 text-left flex-1"
              >
                <span class="text-base">${t1.icon || '🔹'}</span>
                <span class="text-xs font-semibold ${t1Matched ? 'text-white' : 'text-slate-300'}">${escapeHtml(t1.label)}</span>
              </button>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${
                t1Matched ? 'bg-teal-400/20 text-teal-300' : 'bg-white/[0.05] text-slate-500'
              }">
                ${t1Matched ? 'Tier 1 Matched' : 'Tap to match'}
              </span>
            </div>

            ${
              t1Matched && t2Nodes.length
                ? `<div class="mt-2.5 pl-3 border-l-2 border-teal-400/30 space-y-2 animate-enter">
                    <p class="text-[10px] font-medium text-teal-300/90">
                      🔓 1-Hop Unlocked — tap specific overlap:
                    </p>
                    <div class="flex flex-wrap gap-1.5">
                      ${t2Nodes
                        .map((t2) => {
                          const t2Matched = uiState.handshakeVectors.includes(t2.id);
                          return `
                            <button
                              data-action="toggle-handshake-vector"
                              data-node-id="${t2.id}"
                              class="px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${
                                t2Matched
                                  ? 'bg-teal-400 text-slate-950 border-teal-300 font-semibold'
                                  : 'bg-slate-900/90 text-slate-200 border-white/15'
                              }"
                            >
                              <span>${t2.icon || '✨'}</span>
                              <span>${escapeHtml(t2.label)}</span>
                            </button>
                          `;
                        })
                        .join('')}
                    </div>

                    ${t2Nodes
                      .map((t2) => {
                        if (!uiState.handshakeVectors.includes(t2.id)) return '';
                        const t3Nodes = engine.getChildNodes(t2.id).filter((n) => !n.isSharedOntologyOnly);
                        if (!t3Nodes.length) return '';
                        return `
                          <div class="mt-2 p-2.5 rounded-xl bg-amber-400/[0.1] border border-amber-400/30 animate-enter">
                            <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-300 block mb-1">
                              🌟 Tier 3 Personal Detail Revealed
                            </span>
                            ${t3Nodes
                              .map(
                                (t3) => `
                                <div class="text-xs font-semibold text-white flex items-center justify-between">
                                  <span>${t3.icon || '✨'} ${escapeHtml(t3.label)}</span>
                                  <span class="text-[10px] text-amber-200 font-normal">Mutual Match</span>
                                </div>
                              `
                              )
                              .join('')}
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : ''
            }
          </div>
        `;
      })
      .join('');

    return `
      <section class="space-y-3 animate-enter">
        <!-- Mode Segmented Control -->
        <div class="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-900 border border-white/[0.08]">
          <button
            data-action="switch-handshake-mode"
            data-mode="interactive"
            class="py-2 rounded-xl text-xs font-semibold bg-white/10 text-white"
          >
            Interactive Demo
          </button>
          <button
            data-action="switch-handshake-mode"
            data-mode="qr"
            class="py-2 rounded-xl text-xs font-semibold text-slate-400"
          >
            My QR Code
          </button>
        </div>

        <!-- Person Selector -->
        <div class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-3.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-300">Simulating handshake with:</span>
            <div class="flex gap-1.5">
              ${engine.state.contacts
                .slice(0, 2)
                .map(
                  (c, idx) => `
                  <button
                    data-action="select-preset"
                    data-preset-idx="${idx}"
                    class="px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      uiState.selectedPresetIndex === idx
                        ? 'bg-teal-400/20 text-teal-200 border-teal-400/40'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                    }"
                  >
                    ${escapeHtml(c.name)}
                  </button>
                `
                )
                .join('')}
              <button
                data-action="select-preset"
                data-preset-idx="-1"
                class="px-2.5 py-1 rounded-lg text-xs font-medium border ${
                  uiState.selectedPresetIndex === -1
                    ? 'bg-teal-400/20 text-teal-200 border-teal-400/40'
                    : 'bg-white/[0.04] text-slate-400 border-white/[0.06]'
                }"
              >
                New
              </button>
            </div>
          </div>

          ${
            uiState.selectedPresetIndex === -1
              ? `<div class="grid grid-cols-2 gap-2 pt-1">
                  <input
                    id="handshake-name-input"
                    type="text"
                    value="${escapeHtml(uiState.handshakeName)}"
                    placeholder="Their Name"
                    class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-teal-400 focus:outline-none"
                  />
                  <input
                    id="handshake-headline-input"
                    type="text"
                    value="${escapeHtml(uiState.handshakeHeadline)}"
                    placeholder="Role / Context"
                    class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:border-teal-400 focus:outline-none"
                  />
                </div>`
              : ''
          }
        </div>

        <!-- Unified Interactive Progressive Disclosure Tree -->
        <div class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-3.5 space-y-2.5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-xs font-semibold text-white">Hop-Radius Progressive Unlock</h3>
              <p class="text-[11px] text-slate-400">Tap a broad Tier 1 topic to reveal Tier 2 & Tier 3 details</p>
            </div>
            <span class="text-[11px] font-semibold text-teal-300 tabular-nums">
              ${evalResult.beyondGroupHighlights.length} deep ${evalResult.beyondGroupHighlights.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          <div class="space-y-2 pt-1">
            ${progressiveTreeHtml}
          </div>

          <div class="pt-2">
            <button
              data-action="complete-handshake"
              class="w-full py-2.5 px-4 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs"
            >
              Save Handshake ${activeEvent ? `· Tag ${escapeHtml(activeEvent.shortLabel)}` : ''}
            </button>
          </div>
        </div>
      </section>
    `;
  }

  function renderMyCardTab() {
    const userNodes = engine.getUserNodes();
    const tier1Nodes = userNodes.filter((n) => n.tier === 1);
    const circles = engine.state.activeCircles;
    const profile = engine.state.profile;
    const allCircles = [
      { id: 'public', label: 'Public', icon: '🌐' },
      { id: 'professional', label: 'Professional', icon: '💼' },
      { id: 'friends', label: 'Friends', icon: '🤝' },
      { id: 'inner', label: 'Inner', icon: '🔒' }
    ];

    const avatarHtml = profile.avatarUrl
      ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}" class="w-12 h-12 rounded-full object-cover shrink-0 border border-white/15" />`
      : `<div class="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-sm shrink-0">
          ${escapeHtml(profile.avatarInitials || 'ER')}
        </div>`;

    const treeHtml = tier1Nodes
      .map((t1) => {
        const t1Exposed = engine.isExposedByCircles(t1);
        const t2Children = engine.getChildNodes(t1.id).filter((n) => !n.isSharedOntologyOnly);

        return `
          <div class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-3.5 space-y-2">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-base shrink-0">${t1.icon || '🌟'}</span>
                <span class="font-semibold text-sm text-white truncate">${escapeHtml(t1.label)}</span>
              </div>
              <span class="text-[11px] font-medium ${t1Exposed ? 'text-teal-300' : 'text-slate-500'} shrink-0">
                ${t1Exposed ? 'Visible' : 'Unlock on match'}
              </span>
            </div>

            ${
              t2Children.length
                ? `<div class="pl-3.5 border-l border-white/10 space-y-2 mt-2">
                    ${t2Children
                      .map((t2) => {
                        const t2Exposed = engine.isExposedByCircles(t2);
                        const t3Children = engine.getChildNodes(t2.id).filter((n) => !n.isSharedOntologyOnly);
                        return `
                          <div class="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                            <div class="flex items-center justify-between gap-2">
                              <span class="text-xs font-medium text-slate-200 truncate">${t2.icon || '🔹'} ${escapeHtml(t2.label)}</span>
                              <span class="text-[10px] ${t2Exposed ? 'text-teal-300/80' : 'text-slate-500'} shrink-0">
                                ${t2Exposed ? 'Exposed' : '1-hop unlock'}
                              </span>
                            </div>
                            ${
                              t3Children.length
                                ? `<div class="mt-2 pl-3 border-l border-teal-400/30 space-y-1.5">
                                    ${t3Children
                                      .map(
                                        (t3) => `
                                        <div class="p-2 rounded-lg bg-teal-400/[0.08] border border-teal-400/20 flex items-center justify-between gap-2">
                                          <span class="text-xs font-semibold text-teal-200 truncate">${t3.icon || '✨'} ${escapeHtml(t3.label)}</span>
                                          <span class="text-[10px] text-teal-300/70 shrink-0">Tier 3</span>
                                        </div>
                                      `
                                      )
                                      .join('')}
                                  </div>`
                                : ''
                            }
                          </div>
                        `;
                      })
                      .join('')}
                  </div>`
                : ''
            }
          </div>
        `;
      })
      .join('');

    return `
      <section class="space-y-3.5 animate-enter">
        <!-- Identity & Active Circles Card with ONE Unified Edit Button -->
        <div class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-4 space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              ${avatarHtml}
              <div class="min-w-0">
                <h2 class="text-base font-semibold text-white tracking-[-0.01em] truncate">${escapeHtml(profile.name)}</h2>
                <p class="text-xs text-slate-300 truncate">${escapeHtml(profile.headline)}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="text-[11px] text-slate-500 truncate">${escapeHtml(profile.location || 'Zurich')}</span>
                  ${
                    profile.linkedin
                      ? `<a href="${escapeHtml(profile.linkedin)}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-medium text-teal-300 hover:underline shrink-0">in LinkedIn ↗</a>`
                      : ''
                  }
                </div>
              </div>
            </div>
            <button
              data-action="open-card-editor"
              class="px-3 py-1.5 rounded-xl bg-white/[0.08] text-white font-semibold text-xs border border-white/15 shrink-0"
            >
              Edit Card
            </button>
          </div>

          <div class="pt-2.5 border-t border-white/[0.07]">
            <span class="text-[11px] text-slate-400 block mb-2">Active exposure circles:</span>
            <div class="flex flex-wrap gap-1.5">
              ${allCircles
                .map((c) => {
                  const active = circles.includes(c.id);
                  return `
                    <button
                      data-action="toggle-circle"
                      data-circle="${c.id}"
                      class="px-2.5 py-1 rounded-full text-xs font-medium border ${
                        active
                          ? 'bg-teal-400/15 text-teal-200 border-teal-400/40'
                          : 'bg-white/[0.03] text-slate-500 border-white/[0.06]'
                      }"
                    >
                      ${c.icon} ${c.label}
                    </button>
                  `;
                })
                .join('')}
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-medium text-slate-400">Your vectors (Tiers 1–3)</h3>
            <button
              data-action="copy-h2h-json"
              class="text-xs text-teal-300 font-medium"
            >
              Copy .h2h.json
            </button>
          </div>
          ${treeHtml}
        </div>
      </section>
    `;
  }

  function renderCrmTab() {
    const activeEvent = engine.getActiveEvent();
    const targetEventLabel = activeEvent
      ? activeEvent.label
      : engine.state.events[0]
      ? engine.state.events[0].label
      : 'Event';
    const interactions = engine.state.interactions;

    return `
      <section class="space-y-3.5 animate-enter">
        <div class="rounded-2xl bg-slate-900/70 border border-white/[0.08] p-4 space-y-2.5">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-white">${escapeHtml(targetEventLabel)}</span>
            <span class="text-xs font-semibold text-teal-300 tabular-nums">
              ${
                engine.state.contacts.filter((c) => c.eventTags.includes(targetEventLabel)).length
              } / ${engine.state.contacts.length} checked in
            </span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${engine.state.contacts
              .map((c) => {
                const tagged = c.eventTags.includes(targetEventLabel);
                return `
                  <span class="px-2.5 py-1 rounded-lg border text-xs ${
                    tagged
                      ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-200 font-medium'
                      : 'bg-white/[0.03] border-white/[0.06] text-slate-400'
                  }">
                    ${escapeHtml(c.name)} ${tagged ? '✓' : ''}
                  </span>
                `;
              })
              .join('')}
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between px-1">
            <h3 class="text-xs font-medium text-slate-400">Activity log</h3>
            <button
              data-action="open-vault-modal"
              class="text-xs text-teal-300 font-medium"
            >
              Vault & Backup
            </button>
          </div>
          ${interactions
            .map((item) => {
              const c = engine.state.contacts.find((cnt) => cnt.id === item.contactId);
              return `
                <div class="rounded-2xl bg-slate-900/60 border border-white/[0.07] p-3.5 flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <span class="font-semibold text-xs text-white">${escapeHtml(c ? c.name : 'Contact')}</span>
                    <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(item.note)}</p>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 shrink-0">
                    ${escapeHtml(item.eventLabel || 'Direct')}
                  </span>
                </div>
              `;
            })
            .join('')}
        </div>
      </section>
    `;
  }

  function renderModals() {
    if (uiState.showVaultModal) {
      return `
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div class="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-white/15 p-5 safe-sheet space-y-4 shadow-2xl animate-sheet">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-white">Personal Network Vault</h3>
              <button data-action="close-modals" class="text-slate-400 text-lg px-2">✕</button>
            </div>

            <p class="text-xs text-slate-400 leading-relaxed">
              Enter your passcode to decrypt your personal profile and contacts into local storage on this phone.
            </p>

            <div class="flex gap-2">
              <input
                id="vault-passcode-input"
                type="password"
                autocapitalize="none"
                autocorrect="off"
                enterkeyhint="done"
                placeholder="Enter vault passcode"
                class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white focus:border-teal-400 focus:outline-none"
              />
              <button
                data-action="unlock-vault-passcode"
                class="px-4 py-2.5 rounded-xl bg-teal-400 text-slate-950 font-semibold text-xs shrink-0"
              >
                Unlock
              </button>
            </div>

            <div class="pt-3 border-t border-white/10 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <button
                  data-action="export-vault-json"
                  class="py-2.5 px-3 rounded-xl bg-white/[0.06] text-slate-200 text-xs font-medium border border-white/10"
                >
                  Export Backup
                </button>
                <label class="py-2.5 px-3 rounded-xl bg-white/[0.06] text-slate-200 text-xs font-medium border border-white/10 text-center cursor-pointer">
                  Import Backup
                  <input id="import-vault-file" type="file" accept=".json,application/json" class="hidden" />
                </label>
              </div>
              <button
                data-action="force-app-update"
                class="w-full py-2.5 rounded-xl bg-white/[0.04] text-teal-300 border border-teal-400/25 text-xs font-medium"
              >
                Refresh App Code (Keep My Saved Data)
              </button>
              ${
                engine.isVaultUnlocked
                  ? `<button
                      data-action="lock-to-demo"
                      class="w-full py-2.5 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/25 text-xs font-medium"
                    >
                      Switch to Public Demo Mode
                    </button>`
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    }

    if (uiState.showManualModal) {
      const activeEvent = engine.getActiveEvent();
      return `
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div class="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-white/15 p-5 safe-sheet space-y-3.5 shadow-2xl animate-sheet">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-white">Add Person</h3>
              <button data-action="close-modals" class="text-slate-400 text-lg px-2">✕</button>
            </div>
            <p class="text-xs text-slate-400">
              Automatically tagged with <span class="text-teal-300 font-medium">${
                activeEvent ? escapeHtml(activeEvent.label) : 'current session'
              }</span>.
            </p>
            <div class="space-y-2.5">
              <input
                id="manual-name-input"
                type="text"
                enterkeyhint="next"
                placeholder="Name"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
              />
              <input
                id="manual-headline-input"
                type="text"
                enterkeyhint="next"
                placeholder="Role or company"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
              />
              <input
                id="manual-note-input"
                type="text"
                enterkeyhint="done"
                placeholder="Quick note (what you talked about)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
              />
            </div>
            <div class="flex gap-2 pt-1">
              <button
                data-action="close-modals"
                class="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                data-action="save-manual-card"
                class="flex-1 py-2.5 rounded-xl bg-teal-400 text-slate-950 text-xs font-semibold"
              >
                Save Person
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (uiState.showCardEditorModal) {
      const profile = engine.state.profile;
      const currentAvatar =
        uiState.pendingAvatarDataUrl !== null ? uiState.pendingAvatarDataUrl : profile.avatarUrl || '';
      const userNodes = engine
        .getUserNodes()
        .filter((n) => !uiState.pendingDeletedNodeIds.includes(n.id));

      return `
        <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div class="w-full max-w-[430px] max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-white/15 shadow-2xl animate-sheet">
            <!-- Sticky Sheet Header -->
            <div class="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
              <h3 class="text-base font-semibold text-white">Edit H2H Card</h3>
              <button data-action="close-modals" class="text-slate-400 text-lg px-2">✕</button>
            </div>

            <!-- Scrollable Form Body -->
            <div class="flex-1 overflow-y-auto px-5 py-4 space-y-5 overscroll-contain">
              <!-- Identity & Photo Section -->
              <div class="space-y-3">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block">
                  Identity & Role
                </span>

                <div class="flex items-center gap-3.5">
                  ${
                    currentAvatar
                      ? `<img src="${escapeHtml(currentAvatar)}" alt="Avatar" class="w-14 h-14 rounded-full object-cover border border-white/20 shrink-0" />`
                      : `<div class="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center text-slate-950 font-bold text-base shrink-0">
                          ${escapeHtml(profile.avatarInitials || 'ER')}
                        </div>`
                  }
                  <div class="flex flex-wrap gap-2">
                    <label class="px-3 py-1.5 rounded-xl bg-white/[0.08] text-white text-xs font-medium border border-white/15 cursor-pointer">
                      📷 Choose Photo
                      <input id="card-avatar-file" type="file" accept="image/*" class="hidden" />
                    </label>
                    ${
                      currentAvatar
                        ? `<button data-action="clear-avatar-photo" class="px-2.5 py-1.5 rounded-xl bg-white/[0.04] text-slate-400 text-xs border border-white/10">
                            Remove
                          </button>`
                        : ''
                    }
                  </div>
                </div>

                <div class="space-y-2">
                  <div>
                    <label class="block text-[11px] text-slate-400 mb-1">Display Name</label>
                    <input
                      id="card-edit-name"
                      type="text"
                      value="${escapeHtml(profile.name)}"
                      class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label class="block text-[11px] text-slate-400 mb-1">Role Description / Headline</label>
                    <input
                      id="card-edit-headline"
                      type="text"
                      value="${escapeHtml(profile.headline)}"
                      class="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">Location</label>
                      <input
                        id="card-edit-location"
                        type="text"
                        value="${escapeHtml(profile.location || '')}"
                        class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label class="block text-[11px] text-slate-400 mb-1">LinkedIn URL</label>
                      <input
                        id="card-edit-linkedin"
                        type="url"
                        value="${escapeHtml(profile.linkedin || '')}"
                        placeholder="https://linkedin.com/in/..."
                        class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- All Vectors Section -->
              <div class="space-y-2.5 pt-2 border-t border-white/10">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-teal-300">
                    Vectors (${userNodes.length})
                  </span>
                  <button
                    data-action="open-add-node-modal"
                    class="px-2.5 py-1 rounded-lg bg-teal-400/15 text-teal-300 border border-teal-400/30 text-xs font-medium"
                  >
                    ＋ Add Vector
                  </button>
                </div>

                <div class="space-y-2">
                  ${userNodes
                    .map(
                      (n) => `
                      <div class="p-2.5 rounded-xl bg-slate-950/90 border border-white/10 flex items-center gap-2" data-vector-row="${n.id}">
                        <input
                          type="text"
                          data-field="icon"
                          value="${escapeHtml(n.icon || '✨')}"
                          class="w-9 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-center text-white shrink-0"
                        />
                        <div class="flex-1 min-w-0">
                          <input
                            type="text"
                            data-field="label"
                            value="${escapeHtml(n.label)}"
                            class="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                          />
                        </div>
                        <select
                          data-field="visibility"
                          class="px-2 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[11px] text-slate-300 shrink-0"
                        >
                          <option value="public" ${n.visibility === 'public' ? 'selected' : ''}>Public</option>
                          <option value="professional" ${n.visibility === 'professional' ? 'selected' : ''}>Prof</option>
                          <option value="friends" ${n.visibility === 'friends' ? 'selected' : ''}>Match</option>
                          <option value="inner" ${n.visibility === 'inner' ? 'selected' : ''}>Inner</option>
                        </select>
                        <button
                          data-action="mark-delete-node"
                          data-node-id="${n.id}"
                          class="px-2 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 text-xs shrink-0"
                          title="Remove vector"
                        >
                          ✕
                        </button>
                      </div>
                    `
                    )
                    .join('')}
                </div>
              </div>
            </div>

            <!-- Sticky Sheet Footer -->
            <div class="px-5 pt-3 border-t border-white/10 safe-sheet flex gap-2 shrink-0 bg-slate-900">
              <button
                data-action="close-modals"
                class="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                data-action="save-full-card"
                class="flex-1 py-2.5 rounded-xl bg-teal-400 text-slate-950 text-xs font-semibold"
              >
                Save All Changes
              </button>
            </div>
          </div>
        </div>
      `;
    }

    if (uiState.showAddNodeModal) {
      const parentNodes = engine.getUserNodes().filter((n) => n.tier <= 2);
      return `
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div class="w-full max-w-[430px] rounded-t-3xl sm:rounded-3xl bg-slate-900 border-t sm:border border-white/15 p-5 safe-sheet space-y-3.5 shadow-2xl animate-sheet">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold text-white">Add Vector</h3>
              <button data-action="close-modals" class="text-slate-400 text-lg px-2">✕</button>
            </div>
            <div class="space-y-2.5">
              <input
                id="new-node-label"
                type="text"
                placeholder="Label (e.g. Sci-Fi Books or Sourdough)"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white"
              />
              <div class="grid grid-cols-2 gap-2">
                <select id="new-node-tier" class="px-3 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white">
                  <option value="1">Tier 1 (Broad)</option>
                  <option value="2">Tier 2 (Specific)</option>
                  <option value="3" selected>Tier 3 (Detail)</option>
                </select>
                <select id="new-node-visibility" class="px-3 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white">
                  <option value="public">Public</option>
                  <option value="professional">Professional</option>
                  <option value="friends" selected>Unlock on Match</option>
                </select>
              </div>
              <select id="new-node-parent" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/15 text-xs text-white">
                <option value="">Parent category (optional)</option>
                ${parentNodes
                  .map((p) => `<option value="${p.id}">${escapeHtml(p.label)} (T${p.tier})</option>`)
                  .join('')}
              </select>
            </div>
            <div class="flex gap-2 pt-1">
              <button data-action="close-modals" class="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-slate-300 text-xs font-medium">
                Cancel
              </button>
              <button data-action="save-new-node" class="flex-1 py-2.5 rounded-xl bg-teal-400 text-slate-950 text-xs font-semibold">
                Add Vector
              </button>
            </div>
          </div>
        </div>
      `;
    }

    return '';
  }

  function renderBottomNav() {
    const tabs = [
      { id: 'reception', label: 'Reception', icon: '🎯' },
      { id: 'handshake', label: 'Handshake', icon: '📲' },
      { id: 'mycard', label: 'My Card', icon: '🕸️' },
      { id: 'crm', label: 'Activity', icon: '🏷️' }
    ];

    return `
      <nav class="fixed bottom-0 left-0 right-0 z-30 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/[0.07] safe-bottom">
        <div class="max-w-[430px] mx-auto grid grid-cols-4 px-3 pt-1.5">
          ${tabs
            .map((t) => {
              const active = uiState.activeTab === t.id;
              return `
                <button
                  data-action="switch-tab"
                  data-tab="${t.id}"
                  class="py-1.5 rounded-xl flex flex-col items-center justify-center ${
                    active ? 'text-teal-300' : 'text-slate-500'
                  }"
                >
                  <span class="text-base leading-none">${t.icon}</span>
                  <span class="text-[11px] font-medium mt-1">${t.label}</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </nav>
    `;
  }

  function renderApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    let mainContent = '';
    if (uiState.activeTab === 'reception') mainContent = renderReceptionTab();
    else if (uiState.activeTab === 'handshake') mainContent = renderHandshakeTab();
    else if (uiState.activeTab === 'mycard') mainContent = renderMyCardTab();
    else if (uiState.activeTab === 'crm') mainContent = renderCrmTab();

    root.innerHTML = `
      <div class="max-w-[430px] mx-auto min-h-[100dvh] flex flex-col bg-[#090d16] text-slate-100 pb-24">
        ${renderHeader()}
        <main class="flex-1 px-4 pt-3">
          ${mainContent}
        </main>
        ${renderBottomNav()}
        ${renderModals()}
      </div>
    `;
  }

  function bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-action');

      if (action === 'switch-tab') {
        uiState.activeTab = btn.getAttribute('data-tab');
        renderApp();
      } else if (action === 'toggle-event-mode') {
        const ev = engine.toggleEventMode();
        showToast(ev ? `Event Mode Active: ${ev.label}` : 'Event Mode Off');
        renderApp();
      } else if (action === 'toggle-circle') {
        const circleId = btn.getAttribute('data-circle');
        engine.toggleCircle(circleId);
        showToast(`Active Circles: ${engine.state.activeCircles.join(' + ')}`);
        renderApp();
      } else if (action === 'checkin-contact') {
        const contactId = btn.getAttribute('data-contact-id');
        const res = engine.logCheckIn(contactId);
        if (res) {
          showToast(
            `Checked in with ${res.contact.name} (${
              res.activeEvent ? res.activeEvent.shortLabel : 'Direct'
            })`
          );
          renderApp();
        }
      } else if (action === 'open-contact-handshake') {
        const idx = Number(btn.getAttribute('data-preset-idx') || 0);
        uiState.activeTab = 'handshake';
        uiState.handshakeMode = 'interactive';
        syncPresetFromContacts(idx);
        renderApp();
      } else if (action === 'switch-handshake-mode') {
        uiState.handshakeMode = btn.getAttribute('data-mode');
        renderApp();
      } else if (action === 'select-preset') {
        const idx = Number(btn.getAttribute('data-preset-idx'));
        syncPresetFromContacts(idx);
        renderApp();
      } else if (action === 'toggle-handshake-vector') {
        const nodeId = btn.getAttribute('data-node-id');
        const idx = uiState.handshakeVectors.indexOf(nodeId);
        if (idx >= 0) {
          // Also remove children if deselecting a parent
          const children = engine.getChildNodes(nodeId);
          const toRemove = new Set([nodeId, ...children.map((c) => c.id)]);
          for (const c of children) {
            engine.getChildNodes(c.id).forEach((gc) => toRemove.add(gc.id));
          }
          uiState.handshakeVectors = uiState.handshakeVectors.filter((id) => !toRemove.has(id));
        } else {
          uiState.handshakeVectors.push(nodeId);
          // Automatically include Tier 3 detail children when a Tier 2 node is tapped so the reveal is immediate!
          const node = engine.getNode(nodeId);
          if (node && node.tier === 2) {
            const t3Children = engine.getChildNodes(nodeId);
            for (const t3 of t3Children) {
              if (!uiState.handshakeVectors.includes(t3.id)) {
                uiState.handshakeVectors.push(t3.id);
              }
            }
          }
          const parent = engine.getParentNode(nodeId);
          if (parent && !uiState.handshakeVectors.includes(parent.id)) {
            uiState.handshakeVectors.push(parent.id);
          }
        }
        renderApp();
      } else if (action === 'complete-handshake') {
        const nameInput = document.getElementById('handshake-name-input');
        const headlineInput = document.getElementById('handshake-headline-input');
        const name = (nameInput ? nameInput.value : uiState.handshakeName) || 'Event Connection';
        const headline = (headlineInput ? headlineInput.value : uiState.handshakeHeadline) || 'Event Attendee';
        const res = engine.saveContactHandshake({
          name,
          headline,
          vectorNodeIds: uiState.handshakeVectors,
          note: uiState.handshakeNote || 'Exchanged H2H cards'
        });
        showToast(`Saved ${res.contact.name}`);
        uiState.activeTab = 'reception';
        renderApp();
      } else if (action === 'native-share') {
        const url = engine.getShareableHandshakeURL();
        if (navigator.share) {
          navigator
            .share({
              title: `${engine.state.profile.name} — Radius H2H Card`,
              text: 'Tap to see what we have in common on Radius:',
              url
            })
            .catch(() => {});
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          showToast('Link copied');
        }
      } else if (action === 'copy-share-url') {
        const url = engine.getShareableHandshakeURL();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
        }
        showToast('Link copied');
      } else if (action === 'copy-h2h-json') {
        const json = JSON.stringify(engine.exportH2HCardJSON(), null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(json);
        }
        showToast('Copied .h2h.json');
      } else if (action === 'open-vault-modal') {
        uiState.showVaultModal = true;
        renderApp();
      } else if (action === 'unlock-vault-passcode') {
        const passInput = document.getElementById('vault-passcode-input');
        const passphrase = passInput ? passInput.value.trim() : '';
        try {
          engine.unlockPersonalVault(passphrase);
          syncPresetFromContacts(engine.state.contacts.length > 1 ? 1 : 0);
          uiState.showVaultModal = false;
          showToast(`Unlocked ${engine.state.profile.name}'s vault`);
          renderApp();
        } catch (err) {
          showToast(err.message);
        }
      } else if (action === 'lock-to-demo') {
        engine.lockToPublicDemo();
        syncPresetFromContacts(1);
        uiState.showVaultModal = false;
        showToast('Switched to Public Demo Mode');
        renderApp();
      } else if (action === 'force-app-update') {
        showToast('Refreshing app...');
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            Promise.all(regs.map((r) => r.unregister())).then(() => {
              if (window.caches) {
                caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => {
                  location.reload();
                });
              } else {
                location.reload();
              }
            });
          });
        } else {
          location.reload();
        }
      } else if (action === 'export-vault-json') {
        const blob = new Blob([JSON.stringify(engine.state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'private-vault.local.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported backup');
      } else if (action === 'open-manual-modal') {
        uiState.showManualModal = true;
        renderApp();
      } else if (action === 'open-add-node-modal') {
        uiState.showCardEditorModal = false;
        uiState.showAddNodeModal = true;
        renderApp();
      } else if (action === 'open-card-editor') {
        uiState.pendingAvatarDataUrl = null;
        uiState.pendingDeletedNodeIds = [];
        uiState.showCardEditorModal = true;
        renderApp();
      } else if (action === 'clear-avatar-photo') {
        uiState.pendingAvatarDataUrl = '';
        renderApp();
      } else if (action === 'mark-delete-node') {
        const nodeId = btn.getAttribute('data-node-id');
        if (nodeId && !uiState.pendingDeletedNodeIds.includes(nodeId)) {
          uiState.pendingDeletedNodeIds.push(nodeId);
          renderApp();
        }
      } else if (action === 'save-full-card') {
        const profileUpdates = {
          name: document.getElementById('card-edit-name')?.value || engine.state.profile.name,
          headline: document.getElementById('card-edit-headline')?.value || '',
          location: document.getElementById('card-edit-location')?.value || '',
          linkedin: document.getElementById('card-edit-linkedin')?.value || ''
        };
        if (uiState.pendingAvatarDataUrl !== null) {
          profileUpdates.avatarUrl = uiState.pendingAvatarDataUrl;
        }
        const rows = document.querySelectorAll('[data-vector-row]');
        const nodeUpdates = [];
        rows.forEach((row) => {
          const id = row.getAttribute('data-vector-row');
          const icon = row.querySelector('[data-field="icon"]')?.value;
          const label = row.querySelector('[data-field="label"]')?.value;
          const visibility = row.querySelector('[data-field="visibility"]')?.value;
          nodeUpdates.push({ id, icon, label, visibility });
        });
        engine.updateFullCard({
          profileUpdates,
          nodeUpdates,
          deletedNodeIds: uiState.pendingDeletedNodeIds
        });
        uiState.showCardEditorModal = false;
        uiState.pendingAvatarDataUrl = null;
        uiState.pendingDeletedNodeIds = [];
        showToast('Saved H2H card');
        renderApp();
      } else if (action === 'close-modals') {
        uiState.showManualModal = false;
        uiState.showAddNodeModal = false;
        uiState.showVaultModal = false;
        uiState.showCardEditorModal = false;
        uiState.pendingAvatarDataUrl = null;
        uiState.pendingDeletedNodeIds = [];
        renderApp();
      } else if (action === 'save-manual-card') {
        const name = document.getElementById('manual-name-input')?.value || 'New Event Contact';
        const headline = document.getElementById('manual-headline-input')?.value || 'Event Attendee';
        const note = document.getElementById('manual-note-input')?.value || '';
        const res = engine.saveContactHandshake({
          name,
          headline,
          vectorNodeIds: ['node_google_cloud', 'node_books', 'node_fiction'],
          note,
          isManualCard: true
        });
        uiState.showManualModal = false;
        uiState.activeTab = 'reception';
        showToast(`Added ${res.contact.name}`);
        renderApp();
      } else if (action === 'save-new-node') {
        const label = document.getElementById('new-node-label')?.value;
        const tier = Number(document.getElementById('new-node-tier')?.value || 1);
        const visibility = document.getElementById('new-node-visibility')?.value || 'friends';
        const parentNodeId = document.getElementById('new-node-parent')?.value || null;
        const created = engine.addCustomVectorNode({ label, tier, visibility, parentNodeId });
        if (created) {
          uiState.showAddNodeModal = false;
          showToast(`Added ${created.label}`);
          renderApp();
        }
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'card-avatar-file') {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const size = 160;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
            uiState.pendingAvatarDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            renderApp();
          };
          img.src = String(reader.result);
        };
        reader.readAsDataURL(file);
      } else if (e.target.id === 'import-vault-file') {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            engine.importVaultJSON(String(reader.result));
            syncPresetFromContacts(engine.state.contacts.length > 1 ? 1 : 0);
            uiState.showVaultModal = false;
            showToast(`Imported ${engine.state.profile.name}'s vault`);
            renderApp();
          } catch (err) {
            showToast(`Invalid file: ${err.message}`);
          }
        };
        reader.readAsText(file);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.id === 'vault-passcode-input') {
        const passphrase = e.target.value.trim();
        try {
          engine.unlockPersonalVault(passphrase);
          syncPresetFromContacts(engine.state.contacts.length > 1 ? 1 : 0);
          uiState.showVaultModal = false;
          showToast(`Unlocked ${engine.state.profile.name}'s vault`);
          renderApp();
        } catch (err) {
          showToast(err.message);
        }
      }
    });

    document.addEventListener('input', (e) => {
      if (e.target.id === 'handshake-name-input') {
        uiState.handshakeName = e.target.value;
      } else if (e.target.id === 'handshake-headline-input') {
        uiState.handshakeHeadline = e.target.value;
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    if (location.hash.startsWith('#h2h=')) {
      uiState.activeTab = 'handshake';
      uiState.handshakeMode = 'interactive';
      syncPresetFromContacts(-1);
      showToast('Tap what we have in common to unlock deeper tiers');
    }
    bindEvents();
    renderApp();
  });
})();
