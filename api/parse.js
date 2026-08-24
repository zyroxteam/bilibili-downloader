// Vercel Serverless Function: api/parse.js
// Extracts Bilibili video info, stream URLs, and all format qualities

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.query.url || req.body?.url;
  if (!rawUrl) {
    return res.status(400).json({ success: false, error: 'Please provide a valid Bilibili video URL.' });
  }

  try {
    // 1. Clean and extract URL from potential shared text
    const urlMatch = rawUrl.match(/(https?:\/\/[^\s]+)/i);
    let targetUrl = urlMatch ? urlMatch[1] : rawUrl.trim();

    // 2. Resolve shortlink if it's a b23.tv link
    if (targetUrl.includes('b23.tv')) {
      try {
        const resolveRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
          }
        });
        targetUrl = resolveRes.url;
      } catch (err) {
        console.warn('Shortlink redirect failed, continuing with targetUrl', err);
      }
    }

    // 3. Extract BV ID or AV ID
    let bvid = null;
    let aid = null;
    const bvMatch = targetUrl.match(/(BV[a-zA-Z0-9]+)/i);
    const avMatch = targetUrl.match(/\/video\/av([0-9]+)/i);

    if (bvMatch) {
      bvid = bvMatch[1];
    } else if (avMatch) {
      aid = avMatch[1];
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid Bilibili URL. Could not find BV / AV video identifier.'
      });
    }

    // 4. Fetch Video Metadata from Bilibili View API
    const viewApiUrl = bvid 
      ? `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
      : `https://api.bilibili.com/x/web-interface/view?aid=${aid}`;

    const viewRes = await fetch(viewApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.bilibili.com'
      }
    });

    const viewData = await viewRes.json();
    if (viewData.code !== 0 || !viewData.data) {
      return res.status(404).json({
        success: false,
        error: viewData.message || 'Video not found or region restricted on Bilibili.'
      });
    }

    const videoInfo = viewData.data;
    const cid = videoInfo.cid;
    const realBvid = videoInfo.bvid || bvid;

    // 5. Fetch Playable Qualities & Streams (MP4 & DASH)
    const qualityMap = [
      { qn: 80, label: '1080p Full HD', desc: 'Crisp High-Definition Video', badge: 'Ultra HD', type: 'video' },
      { qn: 64, label: '720p HD', desc: 'Standard High Definition', badge: 'Popular', type: 'video' },
      { qn: 32, label: '480p SD', desc: 'Clear Standard Definition', badge: 'Fast', type: 'video' },
      { qn: 16, label: '360p Smooth', desc: 'Optimized Data Saver', badge: 'Light', type: 'video' }
    ];

    const formats = [];

    // Fetch MP4 formats for each quality
    for (const q of qualityMap) {
      try {
        const playUrlApi = `https://api.bilibili.com/x/player/playurl?bvid=${realBvid}&cid=${cid}&qn=${q.qn}&type=mp4&platform=html5`;
        const playRes = await fetch(playUrlApi, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://www.bilibili.com'
          }
        });
        const playData = await playRes.json();

        if (playData.code === 0 && playData.data && playData.data.durl && playData.data.durl.length > 0) {
          const durlItem = playData.data.durl[0];
          const sizeBytes = durlItem.size;
          const sizeFormatted = sizeBytes ? (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB' : '~-- MB';

          // Avoid duplicate qualities if server downscales
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
              sizeBytes: sizeBytes,
              downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&qn=${q.qn}&title=${encodeURIComponent(videoInfo.title)}&ext=mp4`
            });
          }
        }
      } catch (err) {
        console.warn(`Failed fetching quality ${q.qn}:`, err.message);
      }
    }

    // 6. Fetch Audio Stream (MP3/M4A) via DASH endpoint
    try {
      const dashUrl = `https://api.bilibili.com/x/player/playurl?bvid=${realBvid}&cid=${cid}&qn=80&fnval=16&fnver=0&fourk=1`;
      const dashRes = await fetch(dashUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      });
      const dashData = await dashRes.json();
      if (dashData.code === 0 && dashData.data?.dash?.audio?.length > 0) {
        const audioItem = dashData.data.dash.audio[0];
        const audioSize = audioItem.bandwidth ? ((audioItem.bandwidth * (videoInfo.duration || 60)) / (8 * 1024 * 1024)).toFixed(1) + ' MB' : '~5 MB';
        
        formats.push({
          quality: 'audio',
          label: 'Audio Only (MP3)',
          description: 'High Quality 320kbps Audio Track',
          badge: 'Audio',
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          size: audioSize,
          downloadUrl: `/api/download?bvid=${encodeURIComponent(realBvid)}&cid=${cid}&type=audio&title=${encodeURIComponent(videoInfo.title)}&ext=mp3`
        });
      }
    } catch (err) {
      console.warn('DASH audio fetch error:', err.message);
    }

    // Format duration (seconds to MM:SS or HH:MM:SS)
    const durSec = videoInfo.duration || 0;
    const hrs = Math.floor(durSec / 3600);
    const mins = Math.floor((durSec % 3600) / 60);
    const secs = durSec % 60;
    const formattedDuration = hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;

    return res.status(200).json({
      success: true,
      data: {
        bvid: realBvid,
        aid: videoInfo.aid,
        cid: cid,
        title: videoInfo.title,
        description: videoInfo.desc || '',
        thumbnail: videoInfo.pic ? videoInfo.pic.replace('http://', 'https://') : '',
        duration: formattedDuration,
        durationSeconds: durSec,
        author: {
          name: videoInfo.owner?.name || 'Bilibili Creator',
          face: videoInfo.owner?.face ? videoInfo.owner.face.replace('http://', 'https://') : '',
          mid: videoInfo.owner?.mid
        },
        stats: {
          views: (videoInfo.stat?.view || 0).toLocaleString(),
          likes: (videoInfo.stat?.like || 0).toLocaleString(),
          danmaku: (videoInfo.stat?.danmaku || 0).toLocaleString()
        },
        pubdate: new Date((videoInfo.pubdate || Date.now() / 1000) * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        formats: formats
      }
    });

  } catch (error) {
    console.error('Bilibili parse error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while parsing the Bilibili video. Please try again.'
    });
  }
}
