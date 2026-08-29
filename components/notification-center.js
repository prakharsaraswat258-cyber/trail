/**
 * LPU FIND — Universal Notification Center & Dual-Party Match Alert System
 * Manages real-time alerts for both the Item Owner (User) and the Item Finder (Person).
 */

(function(window) {
  const NotificationCenter = {
    notifications: [],
    unreadCount: 0,
    userUnreadCount: 0,
    personUnreadCount: 0,
    currentTab: 'ALL', // 'ALL' | 'USER' | 'PERSON'
    isDrawerOpen: false,
    activeDossierNotif: null,
    soundEnabled: localStorage.getItem('lpufind_sound') !== 'false',
    audioCtx: null,
    audioEl: null,
    audioUnlocked: false,

    async init() {
      this.injectContainers();
      this.initAudioEngine();
      await this.fetchNotifications();
      this.renderBellBadges();
      this.renderSoundToggle();
      setInterval(() => this.fetchNotifications(true), 8000);
    },

    initAudioEngine() {
      // Create audio element for chime
      try {
        this.audioEl = document.getElementById('notif-audio-player') || new Audio('/chime.wav');
        this.audioEl.volume = 1.0;
      } catch (e) {}

      // Auto-unlock audio engine on first user interaction anywhere
      const unlock = () => {
        if (this.audioUnlocked) return;
        this.audioUnlocked = true;
        try {
          if (this.audioEl) {
            this.audioEl.load();
          }
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) {
            if (!this.audioCtx) this.audioCtx = new AudioContextClass();
            if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
          }
        } catch (e) {}
      };

      window.addEventListener('click', unlock, { once: true });
      window.addEventListener('touchstart', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    },

    // Play chime sound using HTML5 Audio with Web Audio API fallback
    playChime() {
      if (!this.soundEnabled) return;

      // Method 1: HTML5 Audio
      let played = false;
      try {
        if (!this.audioEl) {
          this.audioEl = document.getElementById('notif-audio-player') || new Audio('/chime.wav');
        }
        if (this.audioEl) {
          this.audioEl.currentTime = 0;
          this.audioEl.volume = 1.0;
          const promise = this.audioEl.play();
          if (promise !== undefined) {
            promise.then(() => {
              played = true;
            }).catch(() => {
              this.playWebAudioChime();
            });
          } else {
            played = true;
          }
        }
      } catch (e) {
        this.playWebAudioChime();
      }

      // Method 2: Web Audio API (if not already playing)
      if (!played) {
        this.playWebAudioChime();
      }
    },

    playWebAudioChime() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        
        if (!this.audioCtx || this.audioCtx.state === 'closed') {
          this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        
        const now = this.audioCtx.currentTime;
        
        // Tone 1: E6 Bell (1318.5 Hz)
        const osc1 = this.audioCtx.createOscillator();
        const gain1 = this.audioCtx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1318.5, now);
        gain1.gain.setValueAtTime(0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc1.connect(gain1);
        gain1.connect(this.audioCtx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);

        // Tone 2: A6 High Ding (1760.0 Hz) - 100ms later
        const osc2 = this.audioCtx.createOscillator();
        const gain2 = this.audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1760.0, now + 0.1);
        gain2.gain.setValueAtTime(0.45, now + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
        osc2.connect(gain2);
        gain2.connect(this.audioCtx.destination);
        osc2.start(now + 0.1);
        osc2.stop(now + 0.75);
      } catch (e) {}
    },

    // Phone Haptic Vibration
    triggerVibration() {
      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([180, 80, 180]);
        } catch (e) {}
      }
    },

    // Native Mobile / Desktop Push Notifications
    async requestPushPermission() {
      if ('Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            this.sendSystemNotification('🔔 LPU FIND Alerts Enabled', 'You will receive real-time notifications with sound when items match.');
            this.playChime();
            this.triggerVibration();
            alert('Phone notifications enabled successfully!');
          } else {
            alert('Notification permission was ' + perm);
          }
          return perm === 'granted';
        } catch (e) {}
      } else {
        alert('Push notifications not supported on this browser version.');
      }
      return false;
    },

    sendSystemNotification(title, body) {
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
            vibrate: [200, 100, 200],
            tag: 'lpu-match-alert'
          });
        } catch (e) {}
      }
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('lpufind_sound', this.soundEnabled ? 'true' : 'false');
      this.renderSoundToggle();
      if (this.soundEnabled) {
        this.playChime();
        this.triggerVibration();
      }
    },

    renderSoundToggle() {
      const btn = document.getElementById('notif-sound-btn');
      if (btn) {
        btn.innerHTML = this.soundEnabled 
          ? '<span>🔊</span> <span>Sound: ON</span>' 
          : '<span>🔇</span> <span>Sound: MUTED</span>';
        btn.className = `touch-target text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
          this.soundEnabled ? 'bg-white border-emerald-300 text-emerald-800 shadow-xs' : 'bg-zinc-100 border-zinc-300 text-zinc-600'
        }`;
      }
    },

    injectContainers() {
      if (document.getElementById('notif-center-root')) return;

      const container = document.createElement('div');
      container.id = 'notif-center-root';
      container.innerHTML = `
        <!-- Notification Drawer Backdrop (strictly hidden by default) -->
        <div id="notif-drawer-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); z-index: 99998;" onclick="NotificationCenter.closeDrawer()"></div>

        <!-- Notification Drawer Panel (strictly hidden by default, only visible on bell click) -->
        <div id="notif-drawer-panel" style="display: none; position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 440px; background: #FAF8F3; z-index: 99999; box-shadow: -5px 0 30px rgba(0,0,0,0.25); flex-direction: column; border-left: 1px solid rgba(0,0,0,0.1); font-family: inherit;">
          
          <!-- Drawer Header -->
          <div style="padding: 16px; background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 34px; height: 34px; border-radius: 50%; background: #F2E8E2; color: #C96442; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                <svg style="width: 18px; height: 18px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 style="font-size: 15px; font-weight: 800; color: #1C1B18; margin: 0; line-height: 1.2;">Campus Alerts & Matches</h3>
                <p style="font-size: 11px; color: #6E6B5F; margin: 2px 0 0 0;">Live notifications for Owners & Finders</p>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" onclick="NotificationCenter.markAllRead()" style="padding: 4px 8px; font-size: 11px; font-weight: 600; color: #6E6B5F; background: transparent; border: 1px solid rgba(0,0,0,0.1); border-radius: 6px; cursor: pointer;">
                Mark read
              </button>
              <button type="button" onclick="NotificationCenter.closeDrawer()" aria-label="Close" style="width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #6E6B5F; background: #F3F1EB; border: none; font-size: 14px; cursor: pointer;">
                ✕
              </button>
            </div>
          </div>

          <!-- Filter Tabs -->
          <div style="padding: 10px 16px 0 16px; background: #ffffff; border-bottom: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
            <button
              type="button"
              id="notif-tab-all"
              onclick="NotificationCenter.switchTab('ALL')"
              style="padding-bottom: 8px; font-size: 12px; font-weight: 700; border: none; border-bottom: 2px solid #C96442; background: transparent; color: #C96442; cursor: pointer;"
            >
              All (<span id="tab-count-all">0</span>)
            </button>
            <button
              type="button"
              id="notif-tab-user"
              onclick="NotificationCenter.switchTab('USER')"
              style="padding-bottom: 8px; font-size: 12px; font-weight: 600; border: none; border-bottom: 2px solid transparent; background: transparent; color: #6E6B5F; cursor: pointer;"
            >
              👤 Owner Alerts (<span id="tab-count-user">0</span>)
            </button>
            <button
              type="button"
              id="notif-tab-person"
              onclick="NotificationCenter.switchTab('PERSON')"
              style="padding-bottom: 8px; font-size: 12px; font-weight: 600; border: none; border-bottom: 2px solid transparent; background: transparent; color: #6E6B5F; cursor: pointer;"
            >
              🤝 Finder Alerts (<span id="tab-count-person">0</span>)
            </button>
          </div>

          <!-- Notification List Scrollable Body -->
          <div id="notif-list-container" style="flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px;">
            <!-- Rendered by JS -->
          </div>

          <!-- Drawer Footer -->
          <div style="padding: 10px 16px; background: #ffffff; border-top: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; font-size: 11px; color: #6E6B5F;">
            <span>LPU Find Campus Alert Center</span>
            <button type="button" onclick="NotificationCenter.clearAll()" style="color: #EF4444; background: transparent; border: none; font-weight: 600; font-size: 11px; cursor: pointer;">
              Clear history
            </button>
          </div>
        </div>

        <!-- Match Dossier Modal (strictly hidden by default) -->
        <div id="match-dossier-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 100000; align-items: center; justify-content: center; padding: 16px;" onclick="if(event.target === this) NotificationCenter.closeDossier()">
          <div id="match-dossier-content" style="background: #ffffff; border-radius: 16px; border: 1px solid rgba(0,0,0,0.1); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.3); display: flex; flex-direction: column; gap: 16px;">
            <!-- Injected by openDossier -->
          </div>
        </div>
      `;

      document.body.appendChild(container);
    },

    async fetchNotifications(silent = false) {
      try {
        const res = await fetch('/api/notifications');
        if (res.ok) {
          const data = await res.json();
          const prevCount = this.unreadCount;
          this.notifications = data.notifications || [];
          this.unreadCount = data.unreadCount || 0;
          this.userUnreadCount = data.userUnreadCount || 0;
          this.personUnreadCount = data.personUnreadCount || 0;
          this.renderBellBadges();
          if (silent && this.unreadCount > prevCount) {
            this.playChime();
            this.triggerVibration();
            this.openDrawer();
          }
          if (this.isDrawerOpen) {
            this.renderDrawerList();
          }
        }
      } catch (e) {
        if (!silent) console.warn('Could not fetch notifications from backend API', e);
      }
    },

    renderBellBadges() {
      const badges = document.querySelectorAll('.notif-badge');
      badges.forEach(b => {
        if (this.unreadCount > 0) {
          b.textContent = this.unreadCount;
          b.classList.remove('hidden');
        } else {
          b.classList.add('hidden');
        }
      });

      const countAll = document.getElementById('tab-count-all');
      const countUser = document.getElementById('tab-count-user');
      const countPerson = document.getElementById('tab-count-person');
      if (countAll) countAll.textContent = this.notifications.length;
      if (countUser) countUser.textContent = this.notifications.filter(n => n.recipient_role === 'USER').length;
      if (countPerson) countPerson.textContent = this.notifications.filter(n => n.recipient_role === 'PERSON').length;
    },

    openDrawer() {
      this.isDrawerOpen = true;
      const backdrop = document.getElementById('notif-drawer-backdrop');
      const panel = document.getElementById('notif-drawer-panel');
      if (backdrop) {
        backdrop.style.display = 'block';
      }
      if (panel) {
        panel.style.display = 'flex';
      }
      this.renderDrawerList();
      this.fetchNotifications().then(() => this.renderDrawerList());
    },

    closeDrawer() {
      this.isDrawerOpen = false;
      const backdrop = document.getElementById('notif-drawer-backdrop');
      const panel = document.getElementById('notif-drawer-panel');
      if (backdrop) {
        backdrop.style.display = 'none';
      }
      if (panel) {
        panel.style.display = 'none';
      }
    },

    toggleDrawer() {
      if (this.isDrawerOpen) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    },

    switchTab(tab) {
      this.currentTab = tab;
      ['ALL', 'USER', 'PERSON'].forEach(t => {
        const btn = document.getElementById(`notif-tab-${t.toLowerCase()}`);
        if (!btn) return;
        if (t === tab) {
          btn.style.borderBottom = '2px solid #C96442';
          btn.style.color = '#C96442';
          btn.style.fontWeight = '700';
        } else {
          btn.style.borderBottom = '2px solid transparent';
          btn.style.color = '#6E6B5F';
          btn.style.fontWeight = '600';
        }
      });
      this.renderDrawerList();
    },

    renderDrawerList() {
      const container = document.getElementById('notif-list-container');
      if (!container) return;

      let filtered = this.notifications;
      if (this.currentTab === 'USER') {
        filtered = filtered.filter(n => n.recipient_role === 'USER');
      } else if (this.currentTab === 'PERSON') {
        filtered = filtered.filter(n => n.recipient_role === 'PERSON');
      }

      if (!filtered || filtered.length === 0) {
        container.innerHTML = `
          <div style="padding: 40px 16px; text-align: center; color: #6E6B5F; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #F3F1EB; display: flex; align-items: center; justify-content: center; font-size: 22px;">📭</div>
            <p style="font-size: 14px; font-weight: 700; color: #1C1B18; margin: 0;">No notifications in this view</p>
            <p style="font-size: 12px; color: #6E6B5F; margin: 0;">When matches occur between lost & found items, alerts will appear here instantly.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(n => {
        const isUser = n.recipient_role === 'USER';
        const isUnread = !n.is_read;
        const timeStr = this.formatTime(n.created_at);

        return `
          <div style="padding: 14px; border-radius: 12px; border: 1px solid ${isUnread ? '#C96442' : '#E5E7EB'}; background: ${isUnread ? '#FFFDFC' : '#ffffff'}; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; gap: 10px; font-family: inherit;">
            <!-- Header Badges -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; background: ${isUser ? '#EFF6FF' : '#ECFDF5'}; color: ${isUser ? '#1D4ED8' : '#047857'}; border: 1px solid ${isUser ? '#BFDBFE' : '#A7F3D0'};">
                  ${isUser ? '👤 Alert for Owner (User)' : '🤝 Alert for Finder (Person)'}
                </span>
                ${n.match_score ? `
                  <span style="font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px; background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;">
                    ⚡ ${n.match_score}% Match
                  </span>
                ` : ''}
              </div>
              <span style="font-size: 11px; color: #9CA3AF;">${timeStr}</span>
            </div>

            <!-- Title & Message -->
            <div>
              <h4 style="font-size: 13px; font-weight: 700; color: #111827; margin: 0; line-height: 1.3; display: flex; align-items: center; gap: 6px;">
                ${isUnread ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #C96442; display: inline-block; flex-shrink: 0;"></span>' : ''}
                <span>${n.title}</span>
              </h4>
              <p style="font-size: 12px; color: #4B5563; margin: 4px 0 0 0; line-height: 1.4;">${n.message}</p>
            </div>

            <!-- Channel Deliveries Pill -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 10px; color: #6B7280;">
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: #F3F4F6; border: 1px solid #E5E7EB;">
                <span>📱</span> <span>SMS: ${n.partner_contact || 'Dispatched'}</span>
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: #F3F4F6; border: 1px solid #E5E7EB;">
                <span>✉️</span> <span>Email Sent</span>
              </span>
              <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px; border-radius: 4px; background: #F3F4F6; border: 1px solid #E5E7EB;">
                <span>📍</span> <span>${n.location || 'Campus'}</span>
              </span>
            </div>

            <!-- Actions -->
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #F3F4F6; padding-top: 8px; margin-top: 2px;">
              <button
                type="button"
                onclick="NotificationCenter.openDossier('${n.id}')"
                style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #C96442; background: transparent; border: none; cursor: pointer; padding: 0;"
              >
                <span>View Match Dossier & Coordinate</span> →
              </button>
              ${isUnread ? `
                <button
                  type="button"
                  onclick="NotificationCenter.markSingleRead('${n.id}')"
                  style="font-size: 11px; color: #6B7280; background: transparent; border: none; cursor: pointer; font-weight: 500;"
                >
                  Mark read
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    },

    async triggerMatch(customPayload = {}) {
      try {
        const payload = {
          lostItemName: customPayload.lostItemName || 'Apple MacBook Pro 96W Charger (White)',
          foundItemName: customPayload.foundItemName || 'Apple MagSafe 3 MacBook Charger (Space Gray)',
          ticketId: customPayload.ticketId || `LST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          userName: customPayload.userName || 'Prakhar Saraswat (Owner)',
          userPhone: customPayload.userPhone || '+91 98765 43210',
          userEmail: customPayload.userEmail || 'prakhar.12204589@lpu.in',
          personName: customPayload.personName || 'Aman Sharma (Finder)',
          personPhone: customPayload.personPhone || '+91 98111 22334',
          personEmail: customPayload.personEmail || 'aman.finder@lpu.in',
          location: customPayload.location || 'Central Library 2nd Floor Study Desk 14',
          matchScore: customPayload.matchScore || 96,
          notes: customPayload.notes || 'Color, connector and room location match.'
        };

        const res = await fetch('/api/notifications/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          await this.fetchNotifications();
          this.playChime();
          this.triggerVibration();
          this.openDrawer();
          return data;
        }
      } catch (e) {
        console.error('Failed to trigger match notification', e);
      }
    },

    triggerDemoMatch() {
      this.triggerMatch({
        lostItemName: 'Apple MacBook Pro 96W Charger',
        foundItemName: 'Apple MagSafe 3 MacBook Charger',
        location: 'Central Library 2nd Floor Desk 14',
        matchScore: 96,
        userName: 'Prakhar Saraswat (Owner)',
        personName: 'Aman Sharma (Finder)'
      });
    },

    showToast(notif, role) {
      const container = document.getElementById('notif-toast-container');
      if (!container) return;

      // Play Sound Chime & Mobile Vibration
      this.playChime();
      this.triggerVibration();
      this.sendSystemNotification(notif.title, notif.message);

      const toast = document.createElement('div');
      toast.className = 'pointer-events-auto bg-white border border-black/10 rounded-xl p-4 shadow-xl flex items-start gap-3 transform translate-y-2 opacity-0 transition-all duration-300 ring-1 ring-black/5';

      const isUser = role === 'USER';
      toast.innerHTML = `
        <div class="w-10 h-10 rounded-lg ${isUser ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'} flex items-center justify-center shrink-0 text-lg font-bold">
          ${isUser ? '👤' : '🤝'}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-1">
            <span class="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isUser ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}">
              ${isUser ? 'Owner Alert Dispatched' : 'Finder Alert Dispatched'}
            </span>
            <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
              ⚡ ${notif.match_score || 96}% Match
            </span>
          </div>
          <h5 class="text-xs font-bold text-[#1C1B18] mt-1 line-clamp-1 flex items-center gap-1">
            <span>🔊</span>
            <span>${notif.title}</span>
          </h5>
          <p class="text-[11px] text-[#6E6B5F] mt-0.5 line-clamp-2">${notif.message}</p>
          <div class="flex items-center gap-2 mt-2">
            <button
              type="button"
              onclick="NotificationCenter.openDossier('${notif.id}')"
              class="touch-target text-[11px] font-bold text-[#C96442] hover:underline cursor-pointer"
            >
              Open Dossier →
            </button>
            <span class="text-[10px] text-[#A8A49A]">• SMS & Email Sent</span>
          </div>
        </div>
        <button
          type="button"
          onclick="this.parentElement.remove()"
          class="text-[#A8A49A] hover:text-[#1C1B18] text-xs p-1 cursor-pointer"
        >
          ✕
        </button>
      `;

      container.appendChild(toast);
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });

      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.add('opacity-0', 'translate-y-2');
          setTimeout(() => toast.remove(), 300);
        }
      }, 7000);
    },

    openDossier(notifId) {
      if (!document.getElementById('match-dossier-modal') || !document.getElementById('match-dossier-content')) {
        this.injectContainers();
      }

      const defaultNotif = {
        id: 'notif_user_01',
        recipient_role: 'USER',
        recipient_name: 'Prakhar Saraswat (Owner)',
        recipient_contact: 'prakhar.12204589@lpu.in',
        partner_name: 'Aman Sharma (Finder)',
        partner_contact: '+91 98111 22334',
        item_name: 'Apple MacBook Pro 96W Charger',
        ticket_id: 'LST-2026-8921',
        location: 'Central Library 2nd Floor Study Desk 14',
        match_score: 96,
        is_read: 0,
        title: 'Potential Match Detected for Your Lost Item!',
        message: 'AI Matcher found a 96% match at Central Library 2nd Floor Study Desk 14.'
      };

      const notif = (notifId ? this.notifications.find(n => n.id === notifId) : null) || this.notifications[0] || defaultNotif;
      this.activeDossierNotif = notif;
      
      const modal = document.getElementById('match-dossier-modal');
      const content = document.getElementById('match-dossier-content');
      if (!modal || !content) {
        alert('Match Dossier: ' + notif.item_name + ' (Score: ' + (notif.match_score || 96) + '%) at ' + (notif.location || 'Central Library Desk 14'));
        return;
      }

      const isUser = notif.recipient_role === 'USER';
      const ticketId = notif.ticket_id || 'LST-2026-8921';
      const otpCode = `LPU-${ticketId.includes('-') ? ticketId.split('-').pop() : ticketId}-RET`;

      content.innerHTML = `
        <div class="flex items-center justify-between border-b border-black/10 pb-4">
          <div class="flex items-center gap-2.5">
            <div class="w-10 h-10 rounded-xl bg-orange-50 text-[#C96442] border border-orange-200 flex items-center justify-center font-bold text-lg">
              🎯
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-bold text-[#1C1B18]">Campus Lost & Found Match Dossier</h3>
              <p class="text-xs text-[#6E6B5F]">Ticket: <span class="font-mono font-bold">${notif.ticket_id}</span> • Confidence: <span class="text-emerald-700 font-extrabold">${notif.match_score || 96}% High Match</span></p>
            </div>
          </div>
          <button type="button" onclick="NotificationCenter.closeDossier()" class="w-8 h-8 rounded-full flex items-center justify-center text-[#6E6B5F] hover:bg-[#F3F1EB] cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Dual Party Side-by-Side Comparison -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          <!-- Party 1: Item Owner (User) -->
          <div class="p-4 rounded-xl border ${isUser ? 'border-[#C96442] bg-orange-50/40 ring-2 ring-[#C96442]/15' : 'border-black/10 bg-[#FAF8F3]'} space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded">👤 Item Owner (User)</span>
              ${isUser ? '<span class="text-[10px] font-bold text-[#C96442]">Current View</span>' : ''}
            </div>
            <div>
              <p class="text-xs font-bold text-[#1C1B18]">${isUser ? notif.recipient_name : notif.partner_name}</p>
              <p class="text-[11px] text-[#6E6B5F]">${isUser ? notif.recipient_contact : notif.partner_contact}</p>
            </div>
            <div class="pt-2 border-t border-black/5 text-xs space-y-1">
              <span class="text-[11px] font-semibold text-[#6E6B5F] block">Reported Lost Item:</span>
              <p class="font-bold text-[#1C1B18]">${notif.item_name}</p>
            </div>
          </div>

          <!-- Party 2: Item Finder (Person) -->
          <div class="p-4 rounded-xl border ${!isUser ? 'border-[#C96442] bg-orange-50/40 ring-2 ring-[#C96442]/15' : 'border-black/10 bg-[#FAF8F3]'} space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">🤝 Item Finder (Person)</span>
              ${!isUser ? '<span class="text-[10px] font-bold text-[#C96442]">Current View</span>' : ''}
            </div>
            <div>
              <p class="text-xs font-bold text-[#1C1B18]">${!isUser ? notif.recipient_name : notif.partner_name}</p>
              <p class="text-[11px] text-[#6E6B5F]">${!isUser ? notif.recipient_contact : notif.partner_contact}</p>
            </div>
            <div class="pt-2 border-t border-black/5 text-xs space-y-1">
              <span class="text-[11px] font-semibold text-[#6E6B5F] block">Turned-In Found Location:</span>
              <p class="font-bold text-[#1C1B18]">${notif.location}</p>
            </div>
          </div>
        </div>

        <!-- Simulated Multi-Channel Delivery Status -->
        <div class="bg-[#F3F1EB] p-3.5 rounded-xl border border-black/8 space-y-2 text-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#1C1B18] flex items-center gap-1.5">
              <span>📡</span> Delivery Channels Active for Both Parties
            </span>
            <span class="text-emerald-700 font-bold text-[11px]">✓ Dispatched Live</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6E6B5F]">
            <div class="p-2 bg-white rounded-lg border border-black/5">
              <strong class="text-[#1C1B18] block">📲 SMS Sent to Owner & Finder:</strong>
              <span>"LPU-FIND: A potential match was verified for item #${notif.ticket_id}. Open app to coordinate secure pickup."</span>
            </div>
            <div class="p-2 bg-white rounded-lg border border-black/5">
              <strong class="text-[#1C1B18] block">📧 Official University Email:</strong>
              <span>"Match Dossier dispatched to student domain. Security Desk pickup code generated."</span>
            </div>
          </div>
        </div>

        <!-- Secure Campus Handover Verification Code -->
        <div class="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block">Security Desk Handover Code (OTP)</span>
            <span class="font-mono text-xl font-bold text-emerald-950">${otpCode}</span>
            <p class="text-[11px] text-emerald-800">Present this OTP at ${notif.location} security counter to release item.</p>
          </div>
          <button
            type="button"
            onclick="NotificationCenter.confirmHandover('${notif.id}')"
            class="touch-target px-4 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            Confirm Handover Complete
          </button>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-black/10">
          <button
            type="button"
            onclick="NotificationCenter.closeDossier()"
            class="touch-target px-4 py-2 text-xs font-semibold text-[#6E6B5F] bg-[#F3F1EB] hover:bg-[#ECEAE2] rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      `;

      modal.style.display = 'flex';
    },

    closeDossier() {
      const modal = document.getElementById('match-dossier-modal');
      if (modal) modal.style.display = 'none';
    },

    async confirmHandover(notifId) {
      await this.markSingleRead(notifId);
      alert('Handover verified! Community Karma points (+100) and transaction record have been credited.');
      this.closeDossier();
    },

    async markSingleRead(id) {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        await this.fetchNotifications();
      } catch (e) {}
    },

    async markAllRead() {
      try {
        await fetch('/api/notifications/read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAll: true })
        });
        await this.fetchNotifications();
      } catch (e) {}
    },

    async clearAll() {
      try {
        await fetch('/api/notifications/clear', { method: 'POST' });
        await this.fetchNotifications();
      } catch (e) {}
    },

    formatTime(timestamp) {
      if (!timestamp) return 'Just now';
      const secAgo = Math.floor(Date.now() / 1000 - timestamp);
      if (secAgo < 60) return 'Just now';
      if (secAgo < 3600) return `${Math.floor(secAgo / 60)}m ago`;
      if (secAgo < 86400) return `${Math.floor(secAgo / 3600)}h ago`;
      return `${Math.floor(secAgo / 86400)}d ago`;
    }
  };

  window.NotificationCenter = NotificationCenter;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotificationCenter.init());
  } else {
    NotificationCenter.init();
  }
})(window);
