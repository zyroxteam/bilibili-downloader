// Vercel Serverless Function: api/download.js
// Proxies Bilibili stream with required headers to prevent 403 Forbidden errors
// and sets Content-Disposition for 1-click downloads directly to user's device.

import { Readable } from 'stream';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { bvid, cid, qn = 80, type, title = 'Bilibili_Video', ext = 'mp4' } = req.query;

  if (!bvid || !cid) {
    return res.status(400).send('Missing required video parameters (bvid, cid).');
  }

  try {
    let streamUrl = null;

    if (type === 'audio') {
      // Audio stream via DASH
      const dashUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=80&fnval=16&fnver=0&fourk=1`;
      const dashRes = await fetch(dashUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      });
      const dashData = await dashRes.json();
      if (dashData.code === 0 && dashData.data?.dash?.audio?.length > 0) {
        streamUrl = dashData.data.dash.audio[0].baseUrl || dashData.data.dash.audio[0].url;
      }
    } else {
      // Video MP4 stream
      const playUrlApi = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${qn}&type=mp4&platform=html5`;
      const playRes = await fetch(playUrlApi, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://www.bilibili.com'
        }
      });
      const playData = await playRes.json();
      if (playData.code === 0 && playData.data?.durl?.length > 0) {
        streamUrl = playData.data.durl[0].url;
      }
    }

    if (!streamUrl) {
      return res.status(404).send('Stream URL could not be resolved from Bilibili.');
    }

    // Forward range header if present for resumable downloads
    const forwardHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.bilibili.com'
    };
    if (req.headers.range) {
      forwardHeaders['Range'] = req.headers.range;
    }

    const cdnRes = await fetch(streamUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: forwardHeaders
    });

    if (!cdnRes.ok && cdnRes.status !== 206) {
      return res.status(cdnRes.status).send(`Failed to stream from CDN: ${cdnRes.statusText}`);
    }

    // Sanitize filename
    const safeTitle = (title || 'Bilibili_Video').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 80);
    const finalFilename = `[ARJUN_RAJPUT]_${safeTitle}.${ext}`;

    // Set streaming & attachment headers
    res.setHeader('Content-Type', type === 'audio' ? 'audio/mpeg' : 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFilename)}"; filename*=UTF-8''${encodeURIComponent(finalFilename)}`);
    
    if (cdnRes.headers.has('content-length')) {
      res.setHeader('Content-Length', cdnRes.headers.get('content-length'));
    }
    if (cdnRes.headers.has('accept-ranges')) {
      res.setHeader('Accept-Ranges', cdnRes.headers.get('accept-ranges'));
    }
    if (cdnRes.status === 206 && cdnRes.headers.has('content-range')) {
      res.status(206);
      res.setHeader('Content-Range', cdnRes.headers.get('content-range'));
    }

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    // Stream pipe to client
    if (cdnRes.body) {
      const nodeStream = Readable.fromWeb(cdnRes.body);
      nodeStream.pipe(res);
      nodeStream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) res.status(500).end();
      });
    } else {
      res.status(500).send('Unable to read stream body');
    }

  } catch (error) {
    console.error('Download proxy error:', error);
    if (!res.headersSent) {
      res.status(500).send(`Server download error: ${error.message}`);
    }
  }
}
