// --------------------------------------------------------------------------
// ⚡ ARJUN RAJPUT – ALL VIDEO DOWNLOADER (POWERED BY ZYROX)
// 3D Tactile Buttons • Web Audio Sound Synthesizer • Round Splash Screen
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Sound Synthesis Engine (Web Audio API - 0ms Latency, Zero Dependencies)
  let soundEnabled = true;
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 1. Tactile 3D Click Sound
  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {}
  }

  // 2. Futuristic Laser Fetch Sound
  function playFetchSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // 3. Download Start Sound
  function playDownloadStartSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(300, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);

      osc2.frequency.setValueAtTime(450, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.25);
      osc2.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  }

  // 4. Success Fanfare Chord Sound
  function playSuccessSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, High C
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }

  // Attach sound to all buttons
  document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.nav-item') || e.target.closest('.quality-chip-card')) {
      playClickSound();
    }
  });

  // Sound Toggle Button
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    showToast(soundEnabled ? 'Button Sound Effects Enabled' : 'Sound Effects Muted', soundEnabled ? '🔊' : '🔇');
  });

  // Round Splash Screen Dismiss
  const splashScreen = document.getElementById('splashScreen');
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.remove(), 600);
    }
  }, 1800);

  // Status Clock
  function updateClock() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('statusClock');
    if (el) el.textContent = `${hrs}:${mins}`;
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Canvas Particles
  initAmbientParticles();

  // Navigation Router (Home, Downloads, Favorites, Settings)
  const navItems = document.querySelectorAll('.nav-item');
  const screenViews = document.querySelectorAll('.screen-view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      screenViews.forEach(v => {
        if (v.id === targetView) {
          v.classList.add('active');
        } else {
          v.classList.remove('active');
        }
      });
      triggerHaptic();
    });
  });

  document.getElementById('headerSettingsBtn')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-view="viewSettings"]')?.click();
  });

  // Home Screen Elements
  const mainUrlInput = document.getElementById('mainUrlInput');
  const pasteUrlBtn = document.getElementById('pasteUrlBtn');
  const clearUrlBtn = document.getElementById('clearUrlBtn');
  const fetchActionBtn = document.getElementById('fetchActionBtn');
  const detectedBadge = document.getElementById('detectedPlatformBadge');
  const previewShimmer = document.getElementById('previewShimmer');
  const videoPreviewCard = document.getElementById('videoPreviewCard');
  const openQualityModalBtn = document.getElementById('openQualityModalBtn');

  // Preview elements
  const previewImage = document.getElementById('previewImage');
  const previewDuration = document.getElementById('previewDuration');
  const previewPlatformChip = document.getElementById('previewPlatformChip');
  const previewTitle = document.getElementById('previewTitle');
  const previewAuthorAvatar = document.getElementById('previewAuthorAvatar');
  const previewAuthorName = document.getElementById('previewAuthorName');
  const previewViews = document.getElementById('previewViews');
  const previewLikes = document.getElementById('previewLikes');

  // Quality Bottom Sheet Elements
  const qualityBottomSheet = document.getElementById('qualityBottomSheet');
  const closeQualitySheetBtn = document.getElementById('closeQualitySheetBtn');
  const qualityOptionsGrid = document.getElementById('qualityOptionsGrid');
  const confirmDownloadBtn = document.getElementById('confirmDownloadBtn');

  // Success Modal
  const successModal = document.getElementById('successModal');
  const closeSuccessModalBtn = document.getElementById('closeSuccessModalBtn');

  // State
  let currentVideoData = null;
  let selectedQualityItem = null;

  const downloads = [
    {
      id: 'dl_1',
      title: 'Rick Astley - Never Gonna Give You Up (4K)',
      thumb: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
      platform: 'YouTube',
      quality: '1080p FHD',
      format: 'MP4',
      size: '94.1 MB',
      progress: 46,
      speed: '8.4 MB/s',
      eta: '00:08',
      status: 'active'
    }
  ];

  const completedDownloads = [
    {
      id: 'c_1',
      title: 'TikTok Viral Video No Watermark',
      thumb: 'https://p16-common-sign.tiktokcdn-us.com/tos-useast8-p-0068-tx2/okGflIWBcQGJZL5ISqZee2O9NX5cCjAhSTIDAI~tplv-tiktokx-cropcenter-q:300:400:q70.jpeg',
      platform: 'TikTok',
      quality: '1080p HD',
      format: 'MP4',
      size: '18.4 MB',
      date: 'Today, 09:20'
    }
  ];

  renderDownloads();

  // Input Listeners
  mainUrlInput?.addEventListener('input', () => {
    const val = mainUrlInput.value.trim();
    if (val.length > 0) {
      clearUrlBtn?.classList.remove('hidden');
      detectAndShowPlatform(val);
    } else {
      clearUrlBtn?.classList.add('hidden');
      detectedBadge?.classList.add('hidden');
    }
  });

  mainUrlInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchVideoInfo(mainUrlInput.value.trim());
    }
  });

  clearUrlBtn?.addEventListener('click', () => {
    mainUrlInput.value = '';
    clearUrlBtn.classList.add('hidden');
    detectedBadge.classList.add('hidden');
    videoPreviewCard.classList.add('hidden');
    mainUrlInput.focus();
    triggerHaptic();
  });

  pasteUrlBtn?.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        mainUrlInput.value = text;
        clearUrlBtn?.classList.remove('hidden');
        detectAndShowPlatform(text);
        showToast('Link pasted from clipboard', '📋');
        fetchVideoInfo(text);
      }
    } catch (e) {
      showToast('Please paste the URL into the input', '⚠️');
    }
  });

  fetchActionBtn?.addEventListener('click', () => {
    const u = mainUrlInput.value.trim();
    if (!u) {
      showToast('Please paste a video URL first', '⚠️');
      return;
    }
    playFetchSound();
    fetchVideoInfo(u);
  });

  // Sample Buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-url');
      mainUrlInput.value = u;
      clearUrlBtn?.classList.remove('hidden');
      detectAndShowPlatform(u);
      playFetchSound();
      fetchVideoInfo(u);
      triggerHaptic();
    });
  });

  function detectAndShowPlatform(url) {
    const u = url.toLowerCase();
    let name = 'Universal';
    let icon = '⚡';
    if (u.includes('bilibili.com') || u.includes('b23.tv')) { name = 'Bilibili'; icon = '📺'; }
    else if (u.includes('youtube.com') || u.includes('youtu.be')) { name = 'YouTube'; icon = '🔴'; }
    else if (u.includes('tiktok.com')) { name = 'TikTok'; icon = '🎵'; }
    else if (u.includes('instagram.com')) { name = 'Instagram'; icon = '📸'; }
    else if (u.includes('twitter.com') || u.includes('x.com')) { name = 'Twitter / X'; icon = '🐦'; }
    else if (u.includes('facebook.com') || u.includes('fb.watch')) { name = 'Facebook'; icon = '📘'; }
    else if (u.includes('reddit.com')) { name = 'Reddit'; icon = '🤖'; }

    if (detectedBadge) {
      detectedBadge.textContent = `${icon} ${name}`;
      detectedBadge.classList.remove('hidden');
    }
  }

  // Fetch Video Info via API
  async function fetchVideoInfo(url) {
    previewShimmer.classList.remove('hidden');
    videoPreviewCard.classList.add('hidden');

    try {
      const res = await fetch(`/api/parse?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      previewShimmer.classList.add('hidden');

      if (data && data.success && data.data) {
        currentVideoData = data.data;
        displayVideoPreview(data.data);
        showToast(`${data.data.platform || 'Video'} formats loaded!`, '⚡');
        triggerHaptic();
      } else {
        showToast(data?.error || 'Unable to extract video stream', '⚠️');
      }
    } catch (err) {
      previewShimmer.classList.add('hidden');
      showToast('Connecting to video servers...', '⚠️');
    }
  }

  function displayVideoPreview(data) {
    previewImage.src = data.thumbnail || 'https://via.placeholder.com/640x360?text=Preview';
    previewDuration.textContent = data.duration || 'HD';
    previewPlatformChip.textContent = `${data.platformIcon || '⚡'} ${data.platform || 'Universal'}`;
    previewTitle.textContent = data.title || 'Social Media Video';
    previewAuthorAvatar.src = data.author?.face || 'https://via.placeholder.com/60?text=U';
    previewAuthorName.textContent = data.author?.name || 'Verified Creator';
    previewViews.textContent = `👁️ ${data.stats?.views || 'Public'}`;
    previewLikes.textContent = `❤️ ${data.stats?.likes || 'HQ'}`;

    videoPreviewCard.classList.remove('hidden');
    videoPreviewCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Open Quality Selection Glass Bottom Sheet
  openQualityModalBtn?.addEventListener('click', () => {
    if (!currentVideoData) return;
    renderQualityOptions(currentVideoData.formats || []);
    qualityBottomSheet.classList.remove('hidden');
    triggerHaptic();
  });

  closeQualitySheetBtn?.addEventListener('click', () => {
    qualityBottomSheet.classList.add('hidden');
  });

  function renderQualityOptions(formats) {
    qualityOptionsGrid.innerHTML = '';
    selectedQualityItem = formats[0] || null;

    formats.forEach((f, idx) => {
      const isAudio = f.type === 'audio' || f.format === 'MP3';
      const card = document.createElement('div');
      card.className = `quality-chip-card ${idx === 0 ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="chip-left">
          <div class="chip-icon ${isAudio ? 'audio' : ''}">
            ${isAudio ? '🎧' : '🎬'}
          </div>
          <div>
            <div class="chip-title">
              ${f.label} <span class="chip-badge">${f.badge || f.format}</span>
            </div>
            <div class="chip-sub">${f.description || 'High Quality Stream'} • ${f.size || 'HD'}</div>
          </div>
        </div>
        <div class="chip-check">✓</div>
      `;

      card.addEventListener('click', () => {
        document.querySelectorAll('.quality-chip-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedQualityItem = f;
        triggerHaptic();
      });

      qualityOptionsGrid.appendChild(card);
    });
  }

  // Confirm Download CTA
  confirmDownloadBtn?.addEventListener('click', () => {
    qualityBottomSheet.classList.add('hidden');
    if (!selectedQualityItem || !currentVideoData) return;

    playDownloadStartSound();

    const newDownload = {
      id: 'dl_' + Date.now(),
      title: currentVideoData.title || 'Video Download',
      thumb: currentVideoData.thumbnail || '',
      platform: currentVideoData.platform || 'Social',
      quality: selectedQualityItem.label,
      format: selectedQualityItem.format || 'MP4',
      size: selectedQualityItem.size || '90 MB',
      progress: 0,
      speed: 'Initializing...',
      eta: '00:15',
      status: 'active'
    };

    downloads.unshift(newDownload);
    renderDownloads();

    showSystemNotification(newDownload.title);
    document.querySelector('.nav-item[data-view="viewDownloads"]')?.click();
    showToast('Download started in background 🚀', '⬇️');

    if (selectedQualityItem.downloadUrl) {
      const link = document.createElement('a');
      link.href = selectedQualityItem.downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    animateLiveDownload(newDownload);
  });

  function animateLiveDownload(item) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        item.progress = 100;
        item.status = 'completed';
        renderDownloads();
        playSuccessSound();
        showSuccessCelebration(item);
      } else {
        item.progress = progress;
        item.speed = (Math.random() * 4 + 6).toFixed(1) + ' MB/s';
        const rem = Math.max(1, Math.floor((100 - progress) / 7));
        item.eta = `00:${String(rem).padStart(2, '0')}`;
        renderDownloads();
        updateSystemNotification(item.speed, progress, item.eta);
      }
    }, 450);
  }

  function showSuccessCelebration(item) {
    document.getElementById('successFileName').textContent = `[ARJUN_RAJPUT]_${item.title.substring(0, 30)}.${item.format.toLowerCase()}`;
    document.getElementById('successFileSize').textContent = item.size;
    document.getElementById('successResolution').textContent = item.quality;
    document.getElementById('successFormat').textContent = item.format;
    successModal.classList.remove('hidden');
    triggerConfetti();
    triggerHaptic();
  }

  closeSuccessModalBtn?.addEventListener('click', () => {
    successModal.classList.add('hidden');
  });

  function renderDownloads() {
    const activeListEl = document.getElementById('activeDownloadsList');
    const completedListEl = document.getElementById('completedDownloadsList');
    const countActive = document.getElementById('countActive');
    const countCompleted = document.getElementById('countCompleted');
    const navBadge = document.getElementById('navDownloadsBadge');

    const activeItems = downloads.filter(d => d.status === 'active' || d.status === 'waiting');
    const doneItems = completedDownloads;

    if (countActive) countActive.textContent = activeItems.length;
    if (countCompleted) countCompleted.textContent = doneItems.length;
    if (navBadge) navBadge.textContent = activeItems.length;

    if (activeListEl) {
      if (activeItems.length === 0) {
        activeListEl.innerHTML = `
          <div class="search-empty-hint">
            <div style="font-size: 32px; margin-bottom: 8px;">📥</div>
            <h4>No Active Downloads</h4>
            <p style="font-size: 0.76rem; color: var(--text-muted);">Paste a link on Home to start downloading.</p>
          </div>
        `;
      } else {
        activeListEl.innerHTML = activeItems.map(d => `
          <div class="download-card">
            <div class="dl-card-top">
              <img src="${d.thumb || 'https://via.placeholder.com/100x60'}" class="dl-thumb" alt="Thumbnail">
              <div class="dl-meta">
                <div class="dl-filename">${d.title}</div>
                <div class="dl-tags-row">
                  <span class="dl-tag-badge">${d.platform}</span>
                  <span>${d.quality}</span>
                  <span>•</span>
                  <span>${d.size}</span>
                </div>
              </div>
            </div>
            <div class="dl-progress-bar-wrap">
              <div class="dl-progress-fill" style="width: ${d.progress}%;"></div>
            </div>
            <div class="dl-card-bottom">
              <span class="dl-speed-text">⚡ ${d.speed} • ${d.progress}%</span>
              <span>⏳ ETA ${d.eta}</span>
              <div class="dl-actions-group">
                <button class="dl-icon-btn" title="Pause">⏸</button>
                <button class="dl-icon-btn" title="Cancel">✕</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

    if (completedListEl) {
      completedListEl.innerHTML = doneItems.map(c => `
        <div class="download-card">
          <div class="dl-card-top">
            <img src="${c.thumb}" class="dl-thumb" alt="Thumbnail">
            <div class="dl-meta">
              <div class="dl-filename">${c.title}</div>
              <div class="dl-tags-row">
                <span class="dl-tag-badge" style="color: var(--neon-emerald);">${c.platform}</span>
                <span>${c.quality}</span>
                <span>•</span>
                <span>${c.size}</span>
              </div>
            </div>
          </div>
          <div class="dl-card-bottom">
            <span style="color: var(--neon-emerald); font-weight: 700;">✔ Completed</span>
            <span style="color: var(--text-muted);">${c.date}</span>
            <div class="dl-actions-group">
              <button class="dl-icon-btn" title="Open">▶</button>
              <button class="dl-icon-btn" title="Share">↗</button>
              <button class="dl-icon-btn" title="Delete">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  // Segmented Tabs
  document.querySelectorAll('.tab-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.tab-page').forEach(page => page.classList.remove('active'));

      pill.classList.add('active');
      const tab = pill.getAttribute('data-tab');
      const targetPage = document.getElementById(`tabContent${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
      if (targetPage) targetPage.classList.add('active');
      triggerHaptic();
    });
  });

  // Favorites
  const favorites = [
    { title: 'Bilibili Trending Donghua Channel', source: '📺 Bilibili', icon: '📺' },
    { title: 'Top TikTok Dance Creators Hub', source: '🎵 TikTok', icon: '🎵' },
    { title: 'YouTube 4K Tech & Tutorials', source: '🔴 YouTube', icon: '🔴' }
  ];

  const favListEl = document.getElementById('favoritesList');
  if (favListEl) {
    favListEl.innerHTML = favorites.map(f => `
      <div class="glass-card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; background: var(--glass-card); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 24px;">${f.icon}</div>
          <div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-pure);">${f.title}</div>
            <div style="font-size: 0.72rem; color: var(--neon-cyan);">${f.source}</div>
          </div>
        </div>
        <button class="btn-3d-dark" style="padding: 6px 12px; font-size: 0.75rem; color: var(--neon-cyan);">⚡ Grab</button>
      </div>
    `).join('');
  }

  // Search
  const searchTriggerBtn = document.getElementById('searchTriggerBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const searchResultsList = document.getElementById('searchResultsList');

  searchTriggerBtn?.addEventListener('click', () => {
    searchOverlay.classList.remove('hidden');
    globalSearchInput.focus();
    triggerHaptic();
  });

  closeSearchBtn?.addEventListener('click', () => {
    searchOverlay.classList.add('hidden');
  });

  globalSearchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) {
      searchResultsList.innerHTML = '<div class="search-empty-hint">Type to search your downloaded videos and history...</div>';
      return;
    }
    const matches = completedDownloads.filter(d => d.title.toLowerCase().includes(q) || d.platform.toLowerCase().includes(q) || d.format.toLowerCase().includes(q));
    if (matches.length === 0) {
      searchResultsList.innerHTML = '<div class="search-empty-hint">No matching videos found.</div>';
    } else {
      searchResultsList.innerHTML = matches.map(m => `
        <div class="glass-card" style="padding: 12px; display: flex; gap: 10px; align-items: center; background: var(--glass-card); border-radius: var(--radius-md); border: 1px solid var(--border-glass);">
          <img src="${m.thumb}" style="width: 50px; height: 35px; border-radius: 6px; object-fit: cover;">
          <div style="flex: 1;">
            <div style="font-size: 0.82rem; font-weight: 700; color: #fff;">${m.title}</div>
            <div style="font-size: 0.7rem; color: var(--neon-cyan);">${m.platform} • ${m.size}</div>
          </div>
          <button class="btn-3d-dark" style="padding: 6px 10px; font-size: 0.75rem;">▶</button>
        </div>
      `).join('');
    }
  });

  // System Notification
  const sysNotif = document.getElementById('systemNotification');
  const notifTitle = document.getElementById('notifTitle');
  const notifProgressBar = document.getElementById('notifProgressBar');
  const notifMetrics = document.getElementById('notifMetrics');

  function showSystemNotification(title) {
    if (!sysNotif) return;
    notifTitle.textContent = title.substring(0, 32);
    sysNotif.classList.remove('hidden');
  }

  function updateSystemNotification(speed, pct, eta) {
    if (!sysNotif) return;
    notifProgressBar.style.width = `${pct}%`;
    notifMetrics.textContent = `⚡ ${speed} • ${pct}% • ETA ${eta}`;
    if (pct >= 100) {
      setTimeout(() => sysNotif.classList.add('hidden'), 3000);
    }
  }

  function showToast(msg, icon = '⚡') {
    const toastEl = document.getElementById('glassToast');
    const toastMsg = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    if (!toastEl) return;
    toastMsg.textContent = msg;
    toastIcon.textContent = icon;
    toastEl.classList.remove('hidden');
    setTimeout(() => toastEl.classList.add('hidden'), 3000);
  }

  function triggerHaptic() {
    if (navigator.vibrate) {
      navigator.vibrate(14);
    }
  }

  function initAmbientParticles() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.1
    }));

    function loop() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  }

  function triggerConfetti() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const burst = Array.from({ length: 50 }, () => ({
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      size: Math.random() * 4 + 2,
      color: ['#00f0ff', '#a855f7', '#10b981', '#facc15'][Math.floor(Math.random() * 4)],
      alpha: 1
    }));

    let frames = 0;
    function animateBurst() {
      if (frames > 40) return;
      frames++;
      burst.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.alpha *= 0.95;
        ctx.fillStyle = b.color;
        ctx.globalAlpha = b.alpha;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(animateBurst);
    }
    animateBurst();
  }
});
