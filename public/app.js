// --------------------------------------------------------------------------
// ⚡ ARJUN RAJPUT – ALL VIDEO DOWNLOADER (POWERED BY ZYROX)
// Real-Time Chunk Streaming Engine • Background Service Worker • 60FPS Smooth UI
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // 1. Register PWA Service Worker for Background Execution
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // 2. Sound Synthesis Engine (0ms Latency)
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

  function playClickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  }

  function playFetchSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {}
  }

  function playSuccessSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.4);
      });
    } catch (e) {}
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.nav-item') || e.target.closest('.quality-chip-card')) {
      playClickSound();
    }
  });

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    if (soundIcon) soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    showToast(soundEnabled ? 'Button Sound Enabled' : 'Sound Muted', soundEnabled ? '🔊' : '🔇');
  });

  // 3. Round Splash Screen Dismiss
  const splashScreen = document.getElementById('splashScreen');
  setTimeout(() => {
    if (splashScreen) {
      splashScreen.classList.add('fade-out');
      setTimeout(() => splashScreen.remove(), 400);
    }
  }, 1400);

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

  // Navigation Router
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
    });
  });

  document.getElementById('headerSettingsBtn')?.addEventListener('click', () => {
    document.querySelector('.nav-item[data-view="viewSettings"]')?.click();
  });

  // Views & UI Elements
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
  const activeDownloads = [];
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

  // URL Input
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
      showToast('Please paste the URL manually', '⚠️');
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

  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-url');
      mainUrlInput.value = u;
      clearUrlBtn?.classList.remove('hidden');
      detectAndShowPlatform(u);
      playFetchSound();
      fetchVideoInfo(u);
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

  // 4. Video Info Extractor
  async function fetchVideoInfo(url) {
    previewShimmer?.classList.remove('hidden');
    videoPreviewCard?.classList.add('hidden');

    try {
      const res = await fetch(`/api/parse?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      previewShimmer?.classList.add('hidden');

      if (data && data.success && data.data) {
        currentVideoData = data.data;
        displayVideoPreview(data.data);
        showToast(`${data.data.platform || 'Video'} formats loaded!`, '⚡');
      } else {
        showToast(data?.error || 'Unable to extract video stream', '⚠️');
      }
    } catch (err) {
      previewShimmer?.classList.add('hidden');
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

  openQualityModalBtn?.addEventListener('click', () => {
    if (!currentVideoData) return;
    renderQualityOptions(currentVideoData.formats || []);
    qualityBottomSheet.classList.remove('hidden');
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
      });

      qualityOptionsGrid.appendChild(card);
    });
  }

  // --------------------------------------------------------------------------
  // 5. REAL CHUNK STREAMING DOWNLOAD ENGINE (Background & Large File Support)
  // --------------------------------------------------------------------------
  confirmDownloadBtn?.addEventListener('click', () => {
    qualityBottomSheet.classList.add('hidden');
    if (!selectedQualityItem || !currentVideoData) return;

    const downloadTask = {
      id: 'dl_' + Date.now(),
      title: currentVideoData.title || 'Video Download',
      thumb: currentVideoData.thumbnail || '',
      platform: currentVideoData.platform || 'Social',
      quality: selectedQualityItem.label,
      format: selectedQualityItem.format || 'MP4',
      size: selectedQualityItem.size || 'HD',
      downloadUrl: selectedQualityItem.downloadUrl,
      progress: 0,
      speed: 'Connecting...',
      eta: 'Calculating...',
      status: 'active',
      receivedBytes: 0,
      totalBytes: 0
    };

    activeDownloads.unshift(downloadTask);
    renderDownloads();

    showSystemNotification(downloadTask.title);
    document.querySelector('.nav-item[data-view="viewDownloads"]')?.click();
    showToast('Download started with real-time stream 🚀', '⬇️');

    // Execute Real Streaming in Background
    executeRealStreamDownload(downloadTask);
  });

  async function executeRealStreamDownload(task) {
    const startTime = Date.now();
    const safeTitle = (task.title || 'Video').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 60);
    const fileName = `[ARJUN_RAJPUT]_${safeTitle}.${task.format.toLowerCase()}`;

    try {
      const response = await fetch(task.downloadUrl, {
        headers: { 'Accept': '*/*' }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
      task.totalBytes = totalBytes;

      const reader = response.body.getReader();
      const chunks = [];
      let receivedBytes = 0;
      let lastUIUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;
        task.receivedBytes = receivedBytes;

        const now = Date.now();
        // Update UI throttled to 10fps for silky smooth performance
        if (now - lastUIUpdate > 100) {
          lastUIUpdate = now;
          const elapsedSec = Math.max(0.1, (now - startTime) / 1000);
          const speedMB = (receivedBytes / (1024 * 1024)) / elapsedSec;
          const pct = totalBytes > 0 ? Math.min(99, Math.floor((receivedBytes / totalBytes) * 100)) : Math.min(99, Math.floor(receivedBytes / (1024 * 1024 * 1.5)));
          const remainingBytes = Math.max(0, totalBytes - receivedBytes);
          const etaSec = (speedMB > 0 && remainingBytes > 0) ? Math.floor((remainingBytes / (1024 * 1024)) / speedMB) : 0;

          task.progress = pct;
          task.speed = `${speedMB.toFixed(1)} MB/s`;
          task.eta = totalBytes > 0 ? `00:${String(etaSec).padStart(2, '0')}` : 'Streaming...';

          updateDownloadCardUI(task);
          updateSystemNotification(task.speed, pct, task.eta);
        }
      }

      // Download 100% Finished - Assemble Blob and Save Directly
      task.progress = 100;
      task.status = 'completed';
      updateDownloadCardUI(task);

      const mimeType = task.format.toLowerCase() === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up after 1 minute
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

      // Move from active to completed list
      const idx = activeDownloads.indexOf(task);
      if (idx !== -1) activeDownloads.splice(idx, 1);

      completedDownloads.unshift({
        id: 'c_' + Date.now(),
        title: task.title,
        thumb: task.thumb,
        platform: task.platform,
        quality: task.quality,
        format: task.format,
        size: `${(receivedBytes / (1024 * 1024)).toFixed(1)} MB`,
        date: 'Just now'
      });

      renderDownloads();
      playSuccessSound();
      showSuccessCelebration(task);

    } catch (err) {
      console.warn('Direct stream fallback:', err);
      // Fallback for massive files: Direct browser redirect download
      window.open(task.downloadUrl, '_blank');
      task.status = 'completed';
      task.progress = 100;
      renderDownloads();
    }
  }

  function updateDownloadCardUI(task) {
    const card = document.querySelector(`.download-card[data-id="${task.id}"]`);
    if (!card) return;

    const fill = card.querySelector('.dl-progress-fill');
    const speedEl = card.querySelector('.dl-speed-text');
    const etaEl = card.querySelector('.dl-eta-text');

    if (fill) fill.style.width = `${task.progress}%`;
    if (speedEl) speedEl.textContent = `⚡ ${task.speed} • ${task.progress}%`;
    if (etaEl) etaEl.textContent = `⏳ ETA ${task.eta}`;
  }

  function showSuccessCelebration(task) {
    document.getElementById('successFileName').textContent = `[ARJUN_RAJPUT]_${task.title.substring(0, 30)}.${task.format.toLowerCase()}`;
    document.getElementById('successFileSize').textContent = task.size;
    document.getElementById('successResolution').textContent = task.quality;
    document.getElementById('successFormat').textContent = task.format;
    successModal?.classList.remove('hidden');
  }

  closeSuccessModalBtn?.addEventListener('click', () => {
    successModal?.classList.add('hidden');
  });

  function renderDownloads() {
    const activeListEl = document.getElementById('activeDownloadsList');
    const completedListEl = document.getElementById('completedDownloadsList');
    const countActive = document.getElementById('countActive');
    const countCompleted = document.getElementById('countCompleted');
    const navBadge = document.getElementById('navDownloadsBadge');

    if (countActive) countActive.textContent = activeDownloads.length;
    if (countCompleted) countCompleted.textContent = completedDownloads.length;
    if (navBadge) {
      navBadge.textContent = activeDownloads.length;
      navBadge.style.display = activeDownloads.length > 0 ? 'block' : 'none';
    }

    if (activeListEl) {
      if (activeDownloads.length === 0) {
        activeListEl.innerHTML = `
          <div class="search-empty-hint">
            <div style="font-size: 32px; margin-bottom: 8px;">📥</div>
            <h4>No Active Downloads</h4>
            <p style="font-size: 0.76rem; color: var(--text-muted);">Paste a video link to start live downloading.</p>
          </div>
        `;
      } else {
        activeListEl.innerHTML = activeDownloads.map(d => `
          <div class="download-card" data-id="${d.id}">
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
              <span class="dl-eta-text">⏳ ETA ${d.eta}</span>
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
      completedListEl.innerHTML = completedDownloads.map(c => `
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
    });
  });

  // System Notification Simulation
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
      setTimeout(() => sysNotif.classList.add('hidden'), 2500);
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
    setTimeout(() => toastEl.classList.add('hidden'), 2800);
  }
});
