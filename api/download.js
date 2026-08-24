// Vercel Serverless Function: api/download.js
// Universal stream proxy with required Referer & User-Agent headers
// Bypasses 403 Forbidden checks and triggers direct file downloads with proper filenames.

import { Readable } from 'stream';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { bvid, cid, qn = 80, type, title = 'Video_Download', ext = 'mp4', directUrl } = req.query;

  try {
    let streamUrl = null;
    let customHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };

    if (directUrl) {
      streamUrl = decodeURIComponent(directUrl);
    } else if (bvid && cid) {
      customHeaders['Referer'] = 'https://www.bilibili.com';

      if (type === 'audio') {
        const dashUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=80&fnval=16&fnver=0&fourk=1`;
        const dashRes = await fetch(dashUrl, { headers: customHeaders });
        const dashData = await dashRes.json();
        if (dashData.code === 0 && dashData.data?.dash?.audio?.length > 0) {
          streamUrl = dashData.data.dash.audio[0].baseUrl || dashData.data.dash.audio[0].url;
        }
      } else {
        const playUrlApi = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&qn=${qn}&type=mp4&platform=html5`;
        const playRes = await fetch(playUrlApi, { headers: customHeaders });
        const playData = await playRes.json();
        if (playData.code === 0 && playData.data?.durl?.length > 0) {
          streamUrl = playData.data.durl[0].url;
        }
      }
    }

    if (!streamUrl) {
      return res.status(404).send('Stream URL could not be resolved.');
    }

    if (req.headers.range) {
      customHeaders['Range'] = req.headers.range;
    }

    const cdnRes = await fetch(streamUrl, {
      method: req.method === 'HEAD' ? 'HEAD' : 'GET',
      headers: customHeaders
    });

    if (!cdnRes.ok && cdnRes.status !== 206) {
      // If direct proxy fails, redirect to original stream
      return res.redirect(streamUrl);
    }

    // Sanitize filename
    const safeTitle = (title || 'Video').replace(/[/\\?%*:|"<>]/g, '_').substring(0, 80);
    const finalFilename = `[ARJUN_RAJPUT]_${safeTitle}.${ext}`;

    res.setHeader('Content-Type', type === 'audio' || ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
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

    if (cdnRes.body) {
      const nodeStream = Readable.fromWeb(cdnRes.body);
      nodeStream.pipe(res);
      nodeStream.on('error', () => {
        if (!res.headersSent) res.status(500).end();
      });
    } else {
      res.redirect(streamUrl);
    }

  } catch (error) {
    console.error('Download handler error:', error);
    if (!res.headersSent) {
      res.status(500).send(`Download failed: ${error.message}`);
    }
  }
}
