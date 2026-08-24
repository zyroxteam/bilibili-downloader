// Vercel Serverless Function: api/parse.js
// ⚡ ARJUN RAJPUT – All Video & Movie Downloader (Powered by ZYROX)
// Supports: Long Movies, Full Songs, Bilibili, YouTube, TikTok, Instagram, Twitter, Facebook, Pinterest, Reddit

import * as btch from 'btch-downloader';
import ytdl from '@distube/ytdl-core';

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
    const urlMatch = rawUrl.match(/(https?:\/\/[^\s]+)/i);
    let targetUrl = urlMatch ? urlMatch[1] : rawUrl.trim();

    // Resolve shortlinks
    if (targetUrl.includes('b23.tv') || targetUrl.includes('vm.tiktok.com') || targetUrl.includes('vt.tiktok.com') || targetUrl.includes('pin.it') || targetUrl.includes('t.co')) {
      try {
        const resolveRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (resolveRes.url) targetUrl = resolveRes.url;
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
        error: result?.error || 'Unable to extract video from this link. Please ensure the link is public.'
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

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes('bilibili.com') || u.includes('b23.tv') || u.includes('bilibili.tv')) return 'bilibili';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  if (u.includes('tiktok.com') || u.includes('douyin.com')) return 'tiktok';
  if (u.includes('instagram.com') || u.includes('instagr.am')) return 'instagram';
  if (u.includes('twitter.com') || u.includes('x.com') || u.includes('t.co')) return 'twitter';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'facebook';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'pinterest';
  if (u.includes('reddit.com') || u.includes('redd.it')) return 'reddit';
  return 'universal';
}

// --------------------------------------------------------------------------
// 1. BILIBILI HANDLER
// --------------------------------------------------------------------------
async function handleBilibili(rawUrl) {
  let targetUrl = rawUrl;
  const bvMatch = targetUrl.match(/(BV[a-zA-Z0-9]+)/i);
  const avMatch = targetUrl.match(/\/video\/av([0-9]+)/i);
  let bvid = bvMatch ? bvMatch[1] : null;
  let aid = avMatch ? avMatch[1] : null;

  if (!bvid && !aid) return { success: false, error: 'Invalid Bilibili URL.' };

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
  if (viewData.code !== 0 || !viewData.data) return { success: false, error: 'Bilibili video not found.' };

  const videoInfo = viewData.data;
  const cid = videoInfo.cid;
  const realBvid = videoInfo.bvid || bvid;

  const qualityMap = [
    { qn: 80, label: '1080p Full HD (No Watermark)', badge: 'Ultra HD', type: 'video' },
    { qn: 64, label: '720p HD (High Speed)', badge: 'Popular', type: 'video' },
    { qn: 32, label: '480p SD (Data Saver)', badge: 'Fast', type: 'video' }
  ];

  const formats = [];
  for (const q of qualityMap) {
    formats.push({
      quality: String(q.qn),
      label: q.label,
      description: 'Original Clean Web Stream',
      badge: q.badge,
      format: 'MP4',
      ext: 'mp4',
      type: 'video',
      size: 'HD Video',
      downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&qn=${q.qn}&title=${encodeURIComponent(videoInfo.title)}&ext=mp4&redirect=1`
    });
  }

  formats.push({
    quality: 'audio',
    label: 'Audio Only (MP3 320kbps)',
    description: 'High-Bitrate Original Audio',
    badge: 'Audio',
    format: 'MP3',
    ext: 'mp3',
    type: 'audio',
    size: '~10 MB',
    downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&type=audio&title=${encodeURIComponent(videoInfo.title)}&ext=mp3&redirect=1`
  });

  const durSec = videoInfo.duration || 0;
  const hrs = Math.floor(durSec / 3600);
  const mins = Math.floor((durSec % 3600) / 60);
  const secs = durSec % 60;
  const durStr = hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;

  return {
    success: true,
    data: {
      platform: 'Bilibili',
      platformIcon: '📺',
      title: videoInfo.title,
      thumbnail: videoInfo.pic ? videoInfo.pic.replace('http://', 'https://') : '',
      duration: durStr,
      author: { name: videoInfo.owner?.name || 'Bilibili Creator', face: videoInfo.owner?.face || '' },
      stats: { views: (videoInfo.stat?.view || 0).toLocaleString(), likes: (videoInfo.stat?.like || 0).toLocaleString() },
      formats
    }
  };
}

// --------------------------------------------------------------------------
// 2. YOUTUBE & LONG MOVIES/SONGS HANDLER
// --------------------------------------------------------------------------
async function handleYouTube(url) {
  let title = 'YouTube Video';
  let author = 'YouTube Creator';
  let thumb = '';
  let durationStr = 'HD Video';

  // Extract Metadata via BasicInfo
  try {
    const basicInfo = await ytdl.getBasicInfo(url, {
      requestOptions: {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      }
    });
    if (basicInfo && basicInfo.videoDetails) {
      title = basicInfo.videoDetails.title;
      author = basicInfo.videoDetails.author?.name || 'Verified';
      thumb = basicInfo.videoDetails.thumbnails?.[0]?.url || '';
      const lenSec = parseInt(basicInfo.videoDetails.lengthSeconds, 10) || 0;
      const hrs = Math.floor(lenSec / 3600);
      const mins = Math.floor((lenSec % 3600) / 60);
      const secs = lenSec % 60;
      durationStr = hrs > 0 ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` : `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  } catch (e) {}

  // Fetch High-Speed Direct Stream Links
  try {
    const ytData = await btch.youtube(url);
    if (ytData && ytData.status) {
      if (ytData.title) title = ytData.title;
      if (ytData.author) author = ytData.author;
      if (ytData.thumbnail) thumb = ytData.thumbnail;

      const formats = [];

      if (ytData.mp4) {
        formats.push({
          quality: '1080',
          label: '1080p / 720p Full HD Video (MP4)',
          description: 'High Speed Direct Stream for Movies & Songs',
          badge: 'Ultra HD',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: 'Full HD',
          downloadUrl: ytData.mp4
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
          size: '320kbps MP3',
          downloadUrl: ytData.mp3
        });
      }

      return {
        success: true,
        data: {
          platform: 'YouTube',
          platformIcon: '🔴',
          title,
          thumbnail: thumb,
          duration: durationStr,
          author: { name: author, face: 'https://www.youtube.com/s/desktop/f417f7b3/img/favicon_144x144.png' },
          stats: { views: 'Verified', likes: 'High Speed' },
          formats
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract YouTube media. Please check the link and try again.' };
}

// --------------------------------------------------------------------------
// 3. TIKTOK & DOUYIN (No Watermark)
// --------------------------------------------------------------------------
async function handleTikTok(url) {
  try {
    const tkRes = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url));
    const tkData = await tkRes.json();

    if (tkData.code === 0 && tkData.data) {
      const item = tkData.data;
      const formats = [];

      const stream = item.hdplay || item.play;
      if (stream) {
        formats.push({
          quality: 'HD',
          label: '1080p Full HD (No Watermark)',
          description: 'Clean TikTok Video Stream',
          badge: 'HD No-WM',
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          size: item.size ? (item.size / 1024 / 1024).toFixed(1) + ' MB' : 'HD',
          downloadUrl: stream
        });
      }

      if (item.music) {
        formats.push({
          quality: 'audio',
          label: 'Original Audio (MP3)',
          description: item.music_info?.title || 'Original Audio',
          badge: 'Audio',
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          size: '~3 MB',
          downloadUrl: item.music
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
          author: { name: item.author?.nickname || item.author?.unique_id || 'TikTok Creator', face: item.author?.avatar || '' },
          stats: { views: (item.play_count || 0).toLocaleString(), likes: (item.digg_count || 0).toLocaleString() },
          formats
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract TikTok video. Please ensure the link is public.' };
}

// --------------------------------------------------------------------------
// 4. INSTAGRAM & REELS
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
          downloadUrl: r.url
        }));

        return {
          success: true,
          data: {
            platform: 'Instagram',
            platformIcon: '📸',
            title: 'Instagram Reel / Post',
            thumbnail: validResults[0].thumbnail || 'https://instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png',
            duration: 'Reel',
            author: { name: 'Instagram Creator', face: '' },
            stats: { views: 'Reel', likes: 'HD' },
            formats
          }
        };
      }
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract Instagram Reel. Please ensure the account is public.' };
}

// --------------------------------------------------------------------------
// 5. TWITTER, FACEBOOK, PINTEREST, REDDIT
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
            title: tw.title || 'Twitter Video',
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
                downloadUrl: stream
              }
            ]
          }
        };
      }
    }
  } catch (e) {}

  return { success: false, error: 'Could not find a downloadable video in this tweet.' };
}

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
              downloadUrl: stream
            }
          ]
        }
      };
    }
  } catch (e) {}

  return { success: false, error: 'Could not extract Facebook video. Please ensure the video is public.' };
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
              downloadUrl: stream
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
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(url)}&title=Reddit_Video&ext=mp4&redirect=1`
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
          downloadUrl: `/api/download?directUrl=${encodeURIComponent(url)}&title=Media_Download&ext=mp4&redirect=1`
        }
      ]
    }
  };
}
