// --------------------------------------------------------------------------
// ⚡ ARJUN RAJPUT • BILIBILI DOWNLOADER (POWERED BY ZYROX)
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
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = document.getElementById('toastIcon');

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
      showToast('Clipboard access not permitted', '⚠️');
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
      showError('Please paste a valid Bilibili video link first.');
      return;
    }

    hideError();
    hideResult();
    showLoading();

    try {
      const response = await fetch(`/api/parse?url=${encodeURIComponent(rawUrl)}`);
      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to fetch video stream.');
      }

      renderVideoResult(resData.data);
      showToast('Video formats loaded successfully!', '⚡');
    } catch (err) {
      showError(err.message || 'Unable to connect to Bilibili servers.');
    } finally {
      hideLoading();
    }
  }

  // Render Result Card
  function renderVideoResult(data) {
    document.getElementById('videoThumb').src = data.thumbnail || 'https://via.placeholder.com/640x360?text=No+Thumbnail';
    document.getElementById('videoDuration').textContent = data.duration || '00:00';
    document.getElementById('videoBvid').textContent = data.bvid || 'Bilibili Video';
    document.getElementById('videoTitle').textContent = data.title || 'Untitled Video';
    
    document.getElementById('authorAvatar').src = data.author?.face || 'https://via.placeholder.com/60?text=U';
    document.getElementById('authorName').textContent = data.author?.name || 'Bilibili Creator';
    document.getElementById('videoPubDate').textContent = data.pubdate ? `Published ${data.pubdate}` : '';

    document.getElementById('statViews').textContent = data.stats?.views || '0';
    document.getElementById('statLikes').textContent = data.stats?.likes || '0';
    document.getElementById('statDanmaku').textContent = data.stats?.danmaku || '0';

    // Render Formats
    formatsGrid.innerHTML = '';
    const formats = data.formats || [];
    formatCount.textContent = `${formats.length} Formats Available`;

    if (formats.length === 0) {
      formatsGrid.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
          No direct formats available for this video (VIP Restricted or Region Locked).
        </div>
      `;
    } else {
      formats.forEach(f => {
        const isAudio = f.type === 'audio';
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
                <span class="format-badge">${f.badge}</span>
              </h4>
              <p class="format-desc">${f.description}</p>
            </div>
          </div>
          <div class="format-right">
            <span class="format-size">${f.size}</span>
            <button class="btn-download ${isAudio ? 'audio-btn' : ''}" data-url="${f.downloadUrl}" data-filename="${encodeURIComponent(data.title)}.${f.ext}">
              <span>Download ${f.format}</span>
              <span>⬇</span>
            </button>
          </div>
        `;
        formatsGrid.appendChild(row);
      });

      // Attach Click Handlers to Download Buttons
      document.querySelectorAll('.btn-download').forEach(btn => {
        btn.addEventListener('click', (e) => {
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

  // Trigger Download with visual feedback
  function triggerDirectDownload(btn, url) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span>Starting...</span> <div class="spinner" style="width:14px;height:14px;border-color:currentColor transparent transparent transparent;"></div>`;
    btn.disabled = true;

    showToast('Download initialized in your browser 🚀', '⬇️');

    // Create an invisible iframe or trigger direct download link
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
    fetchBtn.querySelector('.btn-text').textContent = 'Processing...';
    fetchBtn.querySelector('.btn-icon').classList.add('hidden');
    fetchBtn.querySelector('.spinner').classList.remove('hidden');
    loadingSkeleton.classList.remove('hidden');
  }

  function hideLoading() {
    fetchBtn.disabled = false;
    fetchBtn.querySelector('.btn-text').textContent = 'Get Download Links';
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

  // Toast Function
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
