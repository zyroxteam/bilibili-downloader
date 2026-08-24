// --------------------------------------------------------------------------
// ⚡ ARJUN RAJPUT • ALL-IN-ONE VIDEO DOWNLOADER (POWERED BY ZYROX)
// Frontend Controller
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const videoUrlInput = document.getElementById('videoUrlInput');
  const fetchBtn = document.getElementById('fetchBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const errorAlert = document.getElementById('errorAlert');
  const errorMessage = document.getElementById('errorMessage');
  const loadingSkeleton = document.getElementById('loadingSkeleton');
  const resultCard = document.getElementById('resultCard');
  const formatsGrid = document.getElementById('formatsGrid');
  const formatCount = document.getElementById('formatCount');
  const platformBadge = document.getElementById('platformBadge');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

  // Platform switcher chips
  const platformChips = document.querySelectorAll('.platform-chip');
  const platformPlaceholders = {
    all: 'Paste any video link here (Bilibili, Instagram, YouTube, TikTok, X, FB)...',
    bilibili: 'Paste Bilibili link (e.g. https://www.bilibili.com/video/BV... or b23.tv)...',
    youtube: 'Paste YouTube / Shorts link (e.g. https://youtube.com/watch?v=... or youtu.be)...',
    instagram: 'Paste Instagram Reel / Post link (e.g. https://instagram.com/reel/...)...',
    tiktok: 'Paste TikTok link (e.g. https://tiktok.com/@user/video/...)...',
    twitter: 'Paste Twitter / X link (e.g. https://x.com/user/status/...)...',
    facebook: 'Paste Facebook Video / Reel link (e.g. https://fb.watch/...)...',
    reddit: 'Paste Reddit Video link (e.g. https://reddit.com/r/...)...',
    pinterest: 'Paste Pinterest Video Pin link (e.g. https://pin.it/...)...'
  };

  platformChips.forEach(chip => {
    chip.addEventListener('click', () => {
      platformChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const p = chip.getAttribute('data-platform');
      videoUrlInput.placeholder = platformPlaceholders[p] || platformPlaceholders.all;
      videoUrlInput.focus();
    });
  });

  // App Cards in Ecosystem grid clickable
  document.querySelectorAll('.app-card').forEach(card => {
    card.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      videoUrlInput.focus();
    });
  });

  // Input & Button State Listeners
  videoUrlInput.addEventListener('input', () => {
    if (videoUrlInput.value.trim().length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  });

  videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      fetchVideoDetails();
    }
  });

  clearBtn.addEventListener('click', () => {
    videoUrlInput.value = '';
    clearBtn.classList.add('hidden');
    videoUrlInput.focus();
  });

  // Paste from Clipboard
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        videoUrlInput.value = text;
        clearBtn.classList.remove('hidden');
        showToast('Link pasted from clipboard', '📋');
        fetchVideoDetails();
      }
    } catch (err) {
      showToast('Please paste the URL manually', '⚠️');
    }
  });

  // Example Chips
  document.querySelectorAll('.example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      videoUrlInput.value = url;
      clearBtn.classList.remove('hidden');
      fetchVideoDetails();
    });
  });

  fetchBtn.addEventListener('click', fetchVideoDetails);

  // Main Fetch Function
  async function fetchVideoDetails() {
    const rawUrl = videoUrlInput.value.trim();
    if (!rawUrl) {
      showError('Please paste a valid video or social media link first.');
      return;
    }

    hideError();
    hideResult();
    showLoading();

    try {
      const response = await fetch(`/api/parse?url=${encodeURIComponent(rawUrl)}`);
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to extract video streams from this platform.');
      }

      renderVideoResult(resData.data);
      showToast(`${resData.data.platform || 'Video'} formats loaded!`, '⚡');
    } catch (err) {
      showError(err.message || 'Unable to process this link. Please check if the video is public.');
    } finally {
      hideLoading();
    }
  }

  // Render Result Card
  function renderVideoResult(data) {
    document.getElementById('videoThumb').src = data.thumbnail || 'https://via.placeholder.com/640x360?text=Video+Stream';
    document.getElementById('videoDuration').textContent = data.duration || 'HD Video';
    
    platformBadge.textContent = `${data.platformIcon || '⚡'} ${data.platform || 'Universal'}`;
    document.getElementById('videoTitle').textContent = data.title || 'Social Media Video';
    
    document.getElementById('authorAvatar').src = data.author?.face || 'https://via.placeholder.com/60?text=Creator';
    document.getElementById('authorName').textContent = data.author?.name || 'Verified Creator';
    document.getElementById('videoMetaExtra').textContent = `${data.platform || 'Online'} • Clean Stream`;

    document.getElementById('statViews').textContent = data.stats?.views || 'Public';
    document.getElementById('statLikes').textContent = data.stats?.likes || 'Supported';

    // Render Formats
    formatsGrid.innerHTML = '';
    const formats = data.formats || [];
    formatCount.textContent = `${formats.length} Formats Ready`;

    if (formats.length === 0) {
      formatsGrid.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
          No direct formats available for this video (Restricted or Private).
        </div>
      `;
    } else {
      formats.forEach(f => {
        const isAudio = f.type === 'audio' || f.format === 'MP3';
        const row = document.createElement('div');
        row.className = 'format-row';

        row.innerHTML = `
          <div class="format-left">
            <div class="format-icon ${isAudio ? 'audio' : ''}">
              ${isAudio ? '🎵' : '🎬'}
            </div>
            <div class="format-details">
              <h4>
                ${f.label} 
                <span class="format-badge">${f.badge || f.format}</span>
              </h4>
              <p class="format-desc">${f.description || 'High Quality Stream'}</p>
            </div>
          </div>
          <div class="format-right">
            <span class="format-size">${f.size || 'HD'}</span>
            <button class="btn-download ${isAudio ? 'audio-btn' : ''}" data-url="${f.downloadUrl}" data-title="${encodeURIComponent(data.title || 'Video')}">
              <span>Download ${f.format || 'MP4'}</span>
              <span>⬇</span>
            </button>
          </div>
        `;
        formatsGrid.appendChild(row);
      });

      // Attach Click Handlers to Download Buttons
      document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', () => {
          const downloadUrl = btn.getAttribute('data-url');
          if (downloadUrl) {
            triggerDirectDownload(btn, downloadUrl);
          }
        });
      });
    }

    resultCard.classList.remove('hidden');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Trigger Download
  function triggerDirectDownload(btn, url) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>Starting...</span> <div class="spinner" style="width:14px;height:14px;border-color:currentColor transparent transparent transparent;"></div>`;
    btn.disabled = true;

    showToast('Download started directly in browser 🚀', '⬇️');

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }, 2500);
  }

  // UI State Helpers
  function showLoading() {
    fetchBtn.disabled = true;
    fetchBtn.querySelector('.btn-text').textContent = 'Extracting...';
    fetchBtn.querySelector('.btn-icon').classList.add('hidden');
    fetchBtn.querySelector('.spinner').classList.remove('hidden');
    loadingSkeleton.classList.remove('hidden');
  }

  function hideLoading() {
    fetchBtn.disabled = false;
    fetchBtn.querySelector('.btn-text').textContent = 'Get Video Formats';
    fetchBtn.querySelector('.btn-icon').classList.remove('hidden');
    fetchBtn.querySelector('.spinner').classList.add('hidden');
    loadingSkeleton.classList.add('hidden');
  }

  function showError(msg) {
    errorMessage.textContent = msg;
    errorAlert.classList.remove('hidden');
    errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideError() {
    errorAlert.classList.add('hidden');
  }

  function hideResult() {
    resultCard.classList.add('hidden');
  }

  let toastTimer = null;
  function showToast(msg, icon = '✔') {
    if (toastTimer) clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toastIcon.textContent = icon;
    toast.classList.remove('hidden');
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3500);
  }
});
