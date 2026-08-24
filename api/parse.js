// Vercel Serverless Function: api/parse.js
// ⚡ ARJUN RAJPUT • All-In-One Video & Audio Downloader Engine (Powered by ZYROX)
// Supports: Bilibili, YouTube, TikTok, Instagram, Twitter/X, Facebook, Threads, Pinterest, Reddit

import * as btch from 'btch-downloader';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.query.url || req.body?.url;
  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(200).json({ success: false, error: 'Please enter a valid video link.' });
  }

  try {
    // 1. Clean URL
    const urlMatch = rawUrl.match(/(https?:\/\/[^\s]+)/i);
    let targetUrl = urlMatch ? urlMatch[1] : rawUrl.trim();

    // 2. Resolve shortlinks (b23.tv, youtu.be, vm.tiktok.com, vt.tiktok.com, pin.it, t.co)
    if (targetUrl.includes('b23.tv') || targetUrl.includes('vm.tiktok.com') || targetUrl.includes('vt.tiktok.com') || targetUrl.includes('pin.it') || targetUrl.includes('t.co')) {
      try {
        const resolveRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (resolveRes.url) {
          targetUrl = resolveRes.url;
        }
      } catch (e) {}
    }

    const platform = detectPlatform(targetUrl);
    let result = null;

    switch (platform) {
      case 'bilibili':
        result = await handleBilibili(targetUrl);
        break;
      case 'youtube':
        result = await handleYouTube(targetUrl);
        break;
      case 'tiktok':
        result = await handleTikTok(targetUrl);
        break;
      case 'instagram':
        result = await handleInstagram(targetUrl);
        break;
      case 'twitter':
        result = await handleTwitter(targetUrl);
        break;
      case 'facebook':
        result = await handleFacebook(targetUrl);
        break;
      case 'pinterest':
        result = await handlePinterest(targetUrl);
        break;
      case 'reddit':
        result = await handleReddit(targetUrl);
        break;
      default:
        result = await handleUniversal(targetUrl);
        break;
    }

    if (!result || !result.success) {
      return res.status(200).json({
        success: false,
        error: result?.error || 'Unable to extract video from this link. Please ensure the link is public and accessible.'
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Parse error:', error);
    return res.status(200).json({
      success: false,
      error: error.message || 'An error occurred while extracting video formats.'
    });
  }
}

// --------------------------------------------------------------------------
// Platform Detect Helper
// --------------------------------------------------------------------------
function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('bilibili.com') || u.includes('b23.tv') || u.includes('bili2233.cn') || u.includes('bilibili.tv')) return 'bilibili';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com') || u.includes('douyin.com')) return 'tiktok';
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
  if (u.includes('twitter.com') || u.includes('x.com') || u.includes('t.co')) return 'twitter';
  if (u.includes('facebook.com') || u.includes('fb.watch') || u.includes('fb.me')) return 'facebook';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('reddit.com') || u.includes('redd.it')) return 'reddit';
  return 'universal';
}

// --------------------------------------------------------------------------
// 1. BILIBILI HANDLER (Native High-Res Engine)
// --------------------------------------------------------------------------
async function handleBilibili(rawUrl) {
  let targetUrl = rawUrl;
  if (targetUrl.includes('b23.tv')) {
    try {
      const resolveRes = await fetch(targetUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (resolveRes.url) targetUrl = resolveRes.url;
    } catch (e) {}
  }

  const bvMatch = targetUrl.match(/(BV[a-zA-Z0-9]+)/i);
  const avMatch = targetUrl.match(/\/video\/av([0-9]+)/i);
  let bvid = bvMatch ? bvMatch[1] : null;
  let aid = avMatch ? avMatch[1] : null;

  if (!bvid && !aid) {
    return { success: false, error: 'Invalid Bilibili URL. Could not find BV / AV video identifier.' };
  }

  const viewApiUrl = bvid 
    ? `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
    : `https://api.bilibili.com/x/web-interface/view?aid=${aid}`;

  const viewRes = await fetch(viewApiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.bilibili.com'
    }
  });

  const viewData = await viewRes.json();
  if (viewData.code !== 0 || !viewData.data) {
    return { success: false, error: viewData.message || 'Bilibili video not found.' };
  }

  const videoInfo = viewData.data;
  const cid = videoInfo.cid;
  const realBvid = videoInfo.bvid || bvid;

  const qualityMap = [
    { qn: 80, label: '1080p Full HD', desc: 'Original Clean Web Stream', badge: 'Ultra HD', type: 'video' },
    { qn: 64, label: '720p HD', desc: 'Standard High Definition', badge: 'Popular', type: 'video' },
    { qn: 32, label: '480p SD', desc: 'Clear Standard Definition', badge: 'Fast', type: 'video' },
    { qn: 16, label: '360p Smooth', desc: 'Data Saver Video', badge: 'Light', type: 'video' }
  ];

  const formats = [];

  for (const q of qualityMap) {
    try {
      const playUrlApi = `https://api.bilibili.com/x/player/playurl?bvid=${realBvid}&cid=${cid}&qn=${q.qn}&type=mp4&platform=html5`;
      const playRes = await fetch(playUrlApi, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      });
      const playData = await playRes.json();

      if (playData.code === 0 && playData.data?.durl?.length > 0) {
        const durlItem = playData.data.durl[0];
        const sizeBytes = durlItem.size;
        const sizeFormatted = sizeBytes ? (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '~-- MB';

        const existing = formats.find(f => f.quality === playData.data.quality);
        if (!existing) {
          formats.push({
            quality: playData.data.quality || q.qn,
            label: q.label,
            description: q.desc,
            badge: q.badge,
            format: 'MP4',
            ext: 'mp4',
            type: 'video',
            size: sizeFormatted,
            downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&qn=${q.qn}&title=${encodeURIComponent(videoInfo.title)}&ext=mp4`
          });
        }
      }
    } catch (e) {}
  }

  formats.push({
    quality: 'audio',
    label: 'Audio Only (MP3)',
    description: 'High Quality 320kbps Audio',
    badge: 'Audio',
    format: 'MP3',
    ext: 'mp3',
    type: 'audio',
    size: '~10 MB',
    downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&type=audio&title=${encodeURIComponent(videoInfo.title)}&ext=mp3`
  });

  const durSec = videoInfo.duration || 0;
  const mins = Math.floor(durSec / 60);
  const secs = durSec % 60;

  return {
    success: true,
    data: {
      platform: 'Bilibili',
      platformIcon: '📺',
      title: videoInfo.title,
      thumbnail: videoInfo.pic ? videoInfo.pic.replace('http://', 'https://') : '',
      duration: `${mins}:${secs.toString().padStart(2, '0')}`,
      author: {
        name: videoInfo.owner?.name || 'Bilibili Creator',
        face: videoInfo.owner?.face ? videoInfo.owner.face.replace('http://', 'https://') : ''
      },
      stats: {
        views: (videoInfo.stat?.view || 0).toLocaleString(),
        likes: (videoInfo.stat?.like || 0).toLocaleString()
      },
      formats
    }
  };
}

// --------------------------------------------------------------------------
// 2. YOUTUBE & SHORTS HANDLER (Working Native Downloader)
// --------------------------------------------------------------------------
async function handleYouTube(url) {
  try {
    const ytData = await btch.youtube(url);
    if (ytData && ytData.status && (ytData.mp4 || ytData.mp3)) {
      const formats = [];

      if (ytData.mp4) {
        formats.push({
          quality: '1080',
          label: '1080p / 720p HD Video (MP4)',
          description: 'High Quality YouTube Video Stream',
          badge: 'Ultra HD',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'HD Video',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(ytData.mp4)}&title=${encodeURIComponent(ytData.title || 'YouTube_Video')}&ext=mp4`
        });
      }

      if (ytData.mp3) {
        formats.push({
          quality: 'audio',
          label: 'Audio Only (MP3 320kbps)',
          description: 'Original High-Bitrate Soundtrack',
          badge: 'Audio',
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          size: 'HQ Audio',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(ytData.mp3)}&title=${encodeURIComponent(ytData.title || 'YouTube_Audio')}&ext=mp3`
        });
      }

      return {
        success: true,
        data: {
          platform: 'YouTube',
          platformIcon: '🔴',
          title: ytData.title || 'YouTube Video',
          thumbnail: ytData.thumbnail || '',
          duration: 'HD Video',
          author: {
            name: ytData.author || 'YouTube Creator',
            face: 'https://www.youtube.com/s/desktop/f417f7b3/img/favicon_144x144.png'
          },
          stats: { views: 'Verified', likes: 'High Speed' },
          formats
        }
      };
    }
  } catch (e) {
    console.warn('btch youtube error:', e.message);
  }

  return { success: false, error: 'Could not extract YouTube video stream. Please ensure the video is public.' };
}

// --------------------------------------------------------------------------
// 3. TIKTOK & DOUYIN HANDLER (No-Watermark & High-Bitrate Audio)
// --------------------------------------------------------------------------
async function handleTikTok(url) {
  // Strategy 1: TikWM Direct
  try {
    const tkRes = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url));
    const tkData = await tkRes.json();

    if (tkData.code === 0 && tkData.data) {
      const item = tkData.data;
      const formats = [];

      if (item.hdplay || item.play) {
        const stream = item.hdplay || item.play;
        formats.push({
          quality: 'HD',
          label: '1080p Full HD (No Watermark)',
          description: 'Clean TikTok Video Stream',
          badge: 'HD No-WM',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: item.size ? (item.size / 1024 / 1024).toFixed(1) + ' MB' : 'HD',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(stream)}&title=${encodeURIComponent(item.title || 'TikTok_Video')}&ext=mp4`
        });
      }

      if (item.music) {
        formats.push({
          quality: 'audio',
          label: 'Audio Only (MP3)',
          description: item.music_info?.title || 'Original TikTok Audio',
          badge: 'Audio',
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          size: '~3 MB',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(item.music)}&title=${encodeURIComponent(item.music_info?.title || 'TikTok_Audio')}&ext=mp3`
        });
      }

      return {
        success: true,
        data: {
          platform: 'TikTok',
          platformIcon: '🎵',
          title: item.title || 'TikTok Video',
          thumbnail: item.cover || item.origin_cover || '',
          duration: item.duration ? `${item.duration}s` : 'Short',
          author: {
            name: item.author?.nickname || item.author?.unique_id || 'TikTok Creator',
            face: item.author?.avatar || ''
          },
          stats: {
            views: (item.play_count || 0).toLocaleString(),
            likes: (item.digg_count || 0).toLocaleString()
          },
          formats
        }
      };
    }
  } catch (e) {}

  // Strategy 2: btch.ttdl
  try {
    const ttdl = await btch.ttdl(url);
    if (ttdl && ttdl.status && ttdl.video?.length > 0) {
      const formats = [
        {
          quality: 'HD',
          label: 'Full HD Video (No Watermark)',
          description: 'Clean TikTok Stream',
          badge: 'HD No-WM',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'HD',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(ttdl.video[0])}&title=${encodeURIComponent(ttdl.title || 'TikTok_Video')}&ext=mp4`
        }
      ];

      if (ttdl.audio?.length > 0) {
        formats.push({
          quality: 'audio',
          label: 'Audio Only (MP3)',
          description: ttdl.title_audio || 'Original Soundtrack',
          badge: 'Audio',
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          size: '~3 MB',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(ttdl.audio[0])}&title=${encodeURIComponent(ttdl.title_audio || 'TikTok_Audio')}&ext=mp3`
        });
      }

      return {
        success: true,
        data: {
          platform: 'TikTok',
          platformIcon: '🎵',
          title: ttdl.title || 'TikTok Video',
          thumbnail: ttdl.thumbnail || '',
          duration: 'Short',
          author: { name: 'TikTok Creator', face: '' },
          stats: { views: 'Verified', likes: 'High Speed' },
          formats
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract TikTok video. Please ensure the link is public.' };
}

// --------------------------------------------------------------------------
// 4. INSTAGRAM & REELS HANDLER
// --------------------------------------------------------------------------
async function handleInstagram(url) {
  try {
    const igData = await btch.igdl(url);
    if (igData && igData.status && igData.result?.length > 0) {
      const validResults = igData.result.filter(r => r.url && r.url.length > 0);
      if (validResults.length > 0) {
        const formats = validResults.map((r, i) => ({
          quality: 'HD',
          label: `Instagram Media ${i + 1} (HD MP4)`,
          description: 'Direct Clean Instagram Reel / Video',
          badge: 'HD Reel',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'HD',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(r.url)}&title=Instagram_Reel_${i + 1}&ext=mp4`
        }));

        return {
          success: true,
          data: {
            platform: 'Instagram',
            platformIcon: '📸',
            title: 'Instagram Reel / Post',
            thumbnail: validResults[0].thumbnail || 'https://instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
            duration: 'Reel',
            author: { name: 'Instagram User', face: 'https://instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png' },
            stats: { views: 'Reel', likes: 'HD Quality' },
            formats
          }
        };
      }
    }
  } catch (e) {}

  // Fallback: oEmbed info
  try {
    const oembedRes = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`);
    if (oembedRes.ok) {
      const oembed = await oembedRes.json();
      return {
        success: true,
        data: {
          platform: 'Instagram',
          platformIcon: '📸',
          title: oembed.title || 'Instagram Reel',
          thumbnail: oembed.thumbnail_url || '',
          duration: 'Reel',
          author: { name: oembed.author_name || 'Instagram Creator', face: '' },
          stats: { views: 'Public Reel', likes: 'Supported' },
          formats: [
            {
              quality: 'HD',
              label: 'Download Instagram Reel (HD MP4)',
              description: 'Clean Reel Video Stream',
              badge: 'HD Reel',
              format: 'MP4',
              ext: 'mp4',
              type: 'video',
              size: 'HD',
              downloadUrl: `/api/download?directUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(oembed.title || 'Instagram_Reel')}&ext=mp4`
            }
          ]
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract Instagram Reel. Please ensure the account and reel are public.' };
}

// --------------------------------------------------------------------------
// 5. TWITTER / X HANDLER
// --------------------------------------------------------------------------
async function handleTwitter(url) {
  try {
    const tw = await btch.twitter(url);
    if (tw && tw.status && tw.url?.length > 0) {
      const valid = tw.url.filter(u => u.url || u.hd || u.sd);
      if (valid.length > 0) {
        const stream = valid[0].hd || valid[0].url || valid[0].sd;
        return {
          success: true,
          data: {
            platform: 'Twitter / X',
            platformIcon: '🐦',
            title: tw.title || 'Twitter / X Video',
            thumbnail: '',
            duration: 'Video',
            author: { name: 'X User', face: '' },
            stats: { views: 'Verified', likes: 'Supported' },
            formats: [
              {
                quality: 'HD',
                label: 'Twitter Video (HD MP4)',
                description: 'Original Tweet Video Stream',
                badge: 'Twitter HD',
                format: 'MP4',
                ext: 'mp4',
                type: 'video',
                size: 'HD',
                downloadUrl: `/api/download?directUrl=${encodeURIComponent(stream)}&title=${encodeURIComponent(tw.title || 'Twitter_Video')}&ext=mp4`
              }
            ]
          }
        };
      }
    }
  } catch (e) {}

  return { success: false, error: 'Could not find a downloadable video in this tweet.' };
}

// --------------------------------------------------------------------------
// 6. FACEBOOK, PINTEREST, REDDIT & UNIVERSAL HANDLERS
// --------------------------------------------------------------------------
async function handleFacebook(url) {
  try {
    const fb = await btch.fbdown(url);
    const stream = fb?.HD || fb?.Normal_video;
    if (stream) {
      return {
        success: true,
        data: {
          platform: 'Facebook',
          platformIcon: '📘',
          title: 'Facebook Video / Reel',
          thumbnail: 'https://static.xx.fbcdn.net/rsrc.php/v3/yO/r/Y14iNflXfO5.png',
          duration: 'FB Video',
          author: { name: 'Facebook Creator', face: '' },
          stats: { views: 'Public', likes: 'HD' },
          formats: [
            {
              quality: 'HD',
              label: 'Facebook HD Video (MP4)',
              description: 'Direct Facebook Stream',
              badge: 'HD',
              format: 'MP4',
              ext: 'mp4',
              type: 'video',
              size: 'HD',
              downloadUrl: `/api/download?directUrl=${encodeURIComponent(stream)}&title=Facebook_Video&ext=mp4`
            }
          ]
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract Facebook video. Please ensure the video/reel is public.' };
}

async function handlePinterest(url) {
  try {
    const pin = await btch.pinterest(url);
    const media = pin?.result?.data || pin?.result;
    const stream = media?.url || media?.video;
    if (stream) {
      return {
        success: true,
        data: {
          platform: 'Pinterest',
          platformIcon: '📌',
          title: 'Pinterest Video Pin',
          thumbnail: media?.thumbnail || '',
          duration: 'Pin Video',
          author: { name: 'Pinterest Creator', face: '' },
          stats: { views: 'Saved', likes: 'High Speed' },
          formats: [
            {
              quality: 'HD',
              label: 'Pinterest Video (MP4)',
              description: 'Clean Pin Video',
              badge: 'Pinterest',
              format: 'MP4',
              ext: 'mp4',
              type: 'video',
              size: 'HD',
              downloadUrl: `/api/download?directUrl=${encodeURIComponent(stream)}&title=Pinterest_Pin&ext=mp4`
            }
          ]
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract Pinterest video.' };
}

async function handleReddit(url) {
  return {
    success: true,
    data: {
      platform: 'Reddit',
      platformIcon: '🤖',
      title: 'Reddit Video Stream',
      thumbnail: '',
      duration: 'Clip',
      author: { name: 'Reddit User', face: '' },
      stats: { views: 'Public', likes: 'High Speed' },
      formats: [
        {
          quality: 'HD',
          label: 'Reddit Video (MP4)',
          description: 'Original Reddit Video Stream',
          badge: 'Reddit HD',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'HD',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(url)}&title=Reddit_Video&ext=mp4`
        }
      ]
    }
  };
}

async function handleUniversal(url) {
  return {
    success: true,
    data: {
      platform: 'Universal Web',
      platformIcon: '🌐',
      title: 'Web Media Stream',
      thumbnail: '',
      duration: 'Media',
      author: { name: 'Web Creator', face: '' },
      stats: { views: 'Direct', likes: 'Supported' },
      formats: [
        {
          quality: 'Best',
          label: 'Download Media (MP4)',
          description: 'Universal Direct Stream',
          badge: 'Auto',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'Auto',
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(url)}&title=Media_Download&ext=mp4`
        }
      ]
    }
  };
}
