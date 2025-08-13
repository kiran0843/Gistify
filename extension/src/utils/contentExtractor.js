// Get content from the current active tab
export const getCurrentTabContent = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }

    // Execute script to extract content from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: extractPageContent
    });

    if (results && results[0] && results[0].result) {
      return results[0].result;
    }

    throw new Error('Failed to extract content from page');
  } catch (error) {
    console.error('Error getting current tab content:', error);
    throw error;
  }
};

// Get selected text from the current tab
export const getSelectedText = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      throw new Error('No active tab found');
    }

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getSelection
    });

    if (results && results[0] && results[0].result) {
      return results[0].result;
    }

    return null;
  } catch (error) {
    console.error('Error getting selected text:', error);
    throw error;
  }
};

// Get YouTube transcript
export const getYouTubeTranscript = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !/(youtube\.com|youtu\.be)/.test(tab.url)) {
      throw new Error('Not on a YouTube video page');
    }

    // Prefer timedtext list API to discover available tracks (handles non-English and ASR)
    const videoId = (() => {
      try {
        const url = new URL(tab.url);
        const host = url.hostname;
        const path = url.pathname;
        // youtube.com/watch?v=ID
        const v = url.searchParams.get('v');
        if (v) return v;
        // youtu.be/ID
        if (host === 'youtu.be') {
          const seg = path.split('/').filter(Boolean)[0];
          if (seg) return seg;
        }
        // youtube.com/shorts/ID
        if (path.startsWith('/shorts/')) {
          const seg = path.split('/shorts/')[1]?.split('/')[0];
          if (seg) return seg;
        }
        // youtube.com/embed/ID
        if (path.startsWith('/embed/')) {
          const seg = path.split('/embed/')[1]?.split('/')[0];
          if (seg) return seg;
        }
        return null;
      } catch (_) { return null; }
    })();

    // Highest reliability: read all captionTracks from ytInitialPlayerResponse in page
    const trackInfoRes = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      function: () => {
        try {
          const w = window;
          let pr = w.ytInitialPlayerResponse;
          if (!pr && w.ytplayer && w.ytplayer.config && w.ytplayer.config.args && w.ytplayer.config.args.player_response) {
            pr = JSON.parse(w.ytplayer.config.args.player_response);
          }
          // Fallback: parse from inline <script> text
          if (!pr) {
            const scripts = Array.from(document.querySelectorAll('script'));
            for (const s of scripts) {
              const txt = s.textContent || '';
              const m = txt.match(/ytInitialPlayerResponse\s*=\s*(\{[\s\S]*?\})\s*;?/);
              if (m && m[1]) {
                try { pr = JSON.parse(m[1]); break; } catch (_) {}
              }
            }
          }
          const listA = pr && pr.captions && pr.captions.playerCaptionsTracklistRenderer && pr.captions.playerCaptionsTracklistRenderer.captionTracks;
          const listB = pr && pr.captions && pr.captions.captionTracks;
          const all = (listA && listA.length ? listA : (listB || []));
          if (all && all.length) {
            // Log all tracks for debugging
            console.log('YouTube transcript tracks:', all);
            // Return all tracks, not just English
            return all.map(t => ({
              baseUrl: t.baseUrl,
              lang: t.languageCode || t.lang || '',
              name: (t.name && (t.name.simpleText || (t.name.runs && t.name.runs.map(r=>r.text).join('')))) || '',
              kind: t.kind || '',
            }));
          }
        } catch (e) { console.error('Error extracting captionTracks:', e); }
        return null;
      }
    });
    const allTracks = trackInfoRes && trackInfoRes[0] && trackInfoRes[0].result;
    if (allTracks && allTracks.length) {
      // Log tracks in extension context for debugging
      console.log('Detected YouTube transcript tracks:', allTracks);
      // Try English first, then fallback to any available
      const sortedTracks = [
        ...allTracks.filter(t => t.lang.startsWith('en')),
        ...allTracks.filter(t => !t.lang.startsWith('en'))
      ];
      for (const track of sortedTracks) {
        try {
          let url = track.baseUrl;
          // Try JSON3 first
          let jsonUrl = url + (url.includes('?') ? '&' : '?') + 'fmt=json3';
          let resp = await fetch(jsonUrl, { credentials: 'include' });
          if (resp.ok) {
            const text = await resp.text();
            if (text.trim().startsWith('{')) {
              const data = JSON.parse(text);
              const parts = (data.events || []).map(e => (e.segs || []).map(s => s.utf8).join('')).join(' ').replace(/\s+/g, ' ').trim();
              if (parts) return parts;
            }
          }
          // Fallback XML
          resp = await fetch(url, { credentials: 'include' });
          if (resp.ok) {
            const xml = await resp.text();
            const decoded = xml
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"');
            const matches = [...decoded.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)];
            const transcript = matches.map(m => m[1]).join(' ').replace(/\s+/g, ' ').trim();
            if (transcript) return transcript;
          }
        } catch (e) {
          console.error('Error fetching transcript for track', track, e);
        }
      }
    }

    if (videoId) {
      const listUrl = `https://youtubetranscript.googleapis.com/api/timedtext?type=list&v=${videoId}`;
      const listResp = await fetch(listUrl);
      if (listResp.ok) {
        const listXml = await listResp.text();
        const tracks = [...listXml.matchAll(/<track[^>]+>/gi)].map((m) => {
          const tag = m[0];
          const lang = (tag.match(/lang_code="([^"]+)"/) || [,''])[1];
          const name = (tag.match(/name="([^"]+)"/) || [,''])[1];
          const kind = (tag.match(/kind="([^"]+)"/) || [,''])[1];
          return { lang, name, kind };
        });

        const prefer = (a, b) => {
          const prio = (t) => t.lang.startsWith('en') ? 2 : 1;
          const ap = prio(a), bp = prio(b);
          if (ap !== bp) return bp - ap;
          // prefer manual over ASR
          const asr = (t) => t.kind === 'asr' ? 0 : 1;
          return asr(b) - asr(a);
        };

        tracks.sort(prefer);

        for (const tr of tracks) {
          const params = new URLSearchParams({ v: videoId, lang: tr.lang });
          if (tr.name) params.set('name', tr.name);
          if (tr.kind) params.set('kind', tr.kind);

          // Try JSON3 first
          let url = `https://youtubetranscript.googleapis.com/api/timedtext?fmt=json3&${params.toString()}`;
          let resp = await fetch(url);
          if (resp.ok) {
            const jsonText = await resp.text();
            if (jsonText.trim().startsWith('{')) {
              const data = JSON.parse(jsonText);
              const parts = (data.events || [])
                .map(e => (e.segs || []).map(s => s.utf8).join(''))
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (parts) return parts;
            }
          }

          // Fallback to XML
          url = `https://youtubetranscript.googleapis.com/api/timedtext?${params.toString()}`;
          resp = await fetch(url);
          if (resp.ok) {
            const xml = await resp.text();
            const decoded = xml
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'")
              .replace(/&quot;/g, '"');
            const matches = [...decoded.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/gi)];
            const transcript = matches.map(m => m[1]).join(' ').replace(/\s+/g, ' ').trim();
            if (transcript) return transcript;
          }
        }
      }
    }

    // Always try to scrape the transcript from the visible panel as a fallback
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      function: () => {
        // Robustly extract transcript text from the visible YouTube transcript panel
        let transcript = '';
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length > 0) {
          segments.forEach(segment => {
            const textElement = segment.querySelector('yt-formatted-string.segment-text');
            if (textElement) transcript += textElement.textContent + ' ';
          });
          if (transcript.trim()) return transcript.trim();
        }
        return null;
      }
    });
    if (results && results[0] && results[0].result) {
      return results[0].result;
    }

    throw new Error('No transcript found for this video');
  } catch (error) {
    console.error('Error getting YouTube transcript:', error);
    throw error;
  }
};

// Function to extract page content (injected into the page)
function extractPageContent() {
  // Remove script and style elements
  const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
  scripts.forEach(el => el.remove());

  // Get main content areas
  const selectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '#content',
    '#main'
  ];

  let content = '';
  
  // Try to find main content area
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = element.textContent || element.innerText;
      break;
    }
  }

  // If no main content found, get body content
  if (!content) {
    const body = document.body;
    if (body) {
      content = body.textContent || body.innerText;
    }
  }

  // Clean up the content
  if (content) {
    // Remove extra whitespace and normalize
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    // Limit content length to avoid API limits
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }
  }

  return content || '';
}

// Function to get selected text (injected into the page)
function getSelection() {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    return selection.toString().trim();
  }
  return null;
}

// Function to extract YouTube transcript (injected into the page)
function extractYouTubeTranscriptSync() {
  // Synchronous DOM-only attempt (no clicking/waits)
  const transcriptContainer = document.querySelector('ytd-transcript-renderer');
  if (transcriptContainer) {
    const segments = transcriptContainer.querySelectorAll('.ytd-transcript-segment-renderer');
    let transcript = '';
    segments.forEach(segment => {
      const textElement = segment.querySelector('.ytd-transcript-segment-renderer-text');
      if (textElement) transcript += textElement.textContent + ' ';
    });
    if (transcript.trim()) return transcript.trim();
  }
  return null;
}
