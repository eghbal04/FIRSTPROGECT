(function(){
  // Configure your channel and optional live video ID
  let CHANNEL_ID = window.YT_CHANNEL_ID || '';
  const CHANNEL_HANDLE = (window.YT_CHANNEL_HANDLE || '').replace(/^@+/, '');
  const API_KEY = window.YT_API_KEY || '';
  let FALLBACK_PLAYLIST_ID = window.YT_UPLOADS_PLAYLIST_ID || '';
  const DISABLE_API = window.YT_DISABLE_API === true;

  // Utility: build iframe
  function buildIframe(videoId, autoplay){
    const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${autoplay?'&autoplay=1&mute=1':''}`;
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    return iframe;
  }

  async function fetchJson(url){
    const r = await fetch(url, { mode: 'cors' });
    if (!r.ok) {
      const err = new Error('HTTP '+r.status);
      err.status = r.status;
      throw err;
    }
    return await r.json();
  }

  async function resolveChannelId(){
    if (CHANNEL_ID) return CHANNEL_ID;
    if (!API_KEY || !CHANNEL_HANDLE) return '';
    try {
      // Try official forHandle endpoint first
      const url1 = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent('@'+CHANNEL_HANDLE)}&key=${API_KEY}`;
      let data = await fetchJson(url1);
      let item = data.items && data.items[0];
      if (!(item && item.id)) {
        // Fallback: search channel by query
        const url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(CHANNEL_HANDLE)}&key=${API_KEY}&maxResults=1`;
        data = await fetchJson(url2);
        item = data.items && data.items[0];
        if (item && item.id && item.id.channelId) CHANNEL_ID = item.id.channelId;
      } else {
        CHANNEL_ID = item.id;
      }
      if (!FALLBACK_PLAYLIST_ID && CHANNEL_ID && CHANNEL_ID.startsWith('UC')) {
        FALLBACK_PLAYLIST_ID = 'UU' + CHANNEL_ID.substring(2);
      }
    } catch(_){
      // Try fallback search by query even if forHandle failed (e.g., 403 on forHandle)
      try {
        const url2 = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(CHANNEL_HANDLE)}&key=${API_KEY}&maxResults=1`;
        const data2 = await fetchJson(url2);
        const item2 = data2.items && data2.items[0];
        if (item2 && item2.id && item2.id.channelId) CHANNEL_ID = item2.id.channelId;
        if (!FALLBACK_PLAYLIST_ID && CHANNEL_ID && CHANNEL_ID.startsWith('UC')) {
          FALLBACK_PLAYLIST_ID = 'UU' + CHANNEL_ID.substring(2);
        }
      } catch(__) {}
    }
    return CHANNEL_ID;
  }

  async function resolveUploadsPlaylistId(){
    if (FALLBACK_PLAYLIST_ID) return FALLBACK_PLAYLIST_ID;
    if (!API_KEY) return '';
    if (!CHANNEL_ID) await resolveChannelId();
    if (!CHANNEL_ID) return '';
    try {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`;
      const data = await fetchJson(url);
      const item = data.items && data.items[0];
      const uploads = item && item.contentDetails && item.contentDetails.relatedPlaylists && item.contentDetails.relatedPlaylists.uploads;
      if (uploads) FALLBACK_PLAYLIST_ID = uploads;
    } catch(_){}
    return FALLBACK_PLAYLIST_ID;
  }

  // Get live broadcast if available
  async function fetchLiveVideoId(){
    if ((!CHANNEL_ID && !CHANNEL_HANDLE) || !API_KEY) return null;
    if (!CHANNEL_ID) await resolveChannelId();
    try {
      // Search for live event
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}&maxResults=1`;
      const data = await fetchJson(url);
      const item = data.items && data.items[0];
      return item ? item.id.videoId : null;
    } catch (_) { return null; }
  }

  // Get latest upload videoId
  async function fetchLatestUploadVideoId(){
    if ((!CHANNEL_ID && !CHANNEL_HANDLE) || !API_KEY) return null;
    if (!CHANNEL_ID) await resolveChannelId();
    try {
      // Method 1: use search ordered by date
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&key=${API_KEY}&maxResults=1`;
      const data = await fetchJson(url);
      const item = data.items && data.items[0];
      return item ? item.id.videoId : null;
    } catch (_) { return null; }
  }

  async function render(){
    const liveWrap = document.getElementById('yt-live');
    const latestWrap = document.getElementById('yt-latest');
    const allWrap = document.getElementById('yt-all');
    if (!liveWrap && !latestWrap && !allWrap) return;
    // Ensure we have channel id if possible
    if (!CHANNEL_ID && !DISABLE_API) await resolveChannelId();
    // Derive uploads playlist if possible
    if (!FALLBACK_PLAYLIST_ID && CHANNEL_ID && CHANNEL_ID.startsWith('UC')) {
      FALLBACK_PLAYLIST_ID = 'UU' + CHANNEL_ID.substring(2);
    }

    // No-API mode: embed-only (clean, no 403s)
    if (DISABLE_API) {
      if (liveWrap) {
        liveWrap.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'yt-embed-wrap';
        if (CHANNEL_ID) container.innerHTML = `<iframe src="https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}" allowfullscreen title="YouTube live"></iframe>`;
        else liveWrap.innerHTML = '<div class="yt-note">Channel ID تنظیم نشده است</div>';
        if (!liveWrap.innerHTML) liveWrap.appendChild(container);
      }
      if (latestWrap) {
        latestWrap.innerHTML = '';
        const container = document.createElement('div');
        container.className = 'yt-embed-wrap';
        if (FALLBACK_PLAYLIST_ID) container.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube playlist"></iframe>`;
        else latestWrap.innerHTML = '<div class="yt-note">Uploads Playlist تنظیم نشده است</div>';
        if (!latestWrap.innerHTML) latestWrap.appendChild(container);
      }
      if (allWrap) {
        allWrap.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'yt-embed-wrap';
        if (FALLBACK_PLAYLIST_ID) wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube uploads"></iframe>`;
        else wrap.innerHTML = '<div class="yt-note">Uploads Playlist تنظیم نشده است</div>';
        allWrap.appendChild(wrap);
      }
      return;
    }

    let liveId = await fetchLiveVideoId();
    if (liveWrap) {
      liveWrap.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'yt-embed-wrap';
      liveWrap.appendChild(container);
      const vid = liveId || window.YT_LIVE_FALLBACK_VIDEO_ID;
      if (vid) container.appendChild(buildIframe(vid, !!liveId));
      else liveWrap.innerHTML = '<div class="yt-note">در حال حاضر لایوی یافت نشد</div>';
    }

    if (latestWrap) {
      latestWrap.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'yt-embed-wrap';
      latestWrap.appendChild(container);
      try {
        let latestId = await fetchLatestUploadVideoId();
        if (!latestId && FALLBACK_PLAYLIST_ID) {
          // Playlist fallback: show the uploads playlist
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube playlist"></iframe>`;
        } else if (latestId) {
          container.appendChild(buildIframe(latestId, false));
        } else if (FALLBACK_PLAYLIST_ID) {
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube playlist"></iframe>`;
        } else if (CHANNEL_ID) {
          // As a last resort show channel live stream endpoint (may show not available)
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}" allowfullscreen title="YouTube live"></iframe>`;
        } else {
          latestWrap.innerHTML = '<div class="yt-note">ویدیویی یافت نشد</div>';
        }
      } catch (e) {
        // No API access -> fallback to playlist or live
        if (FALLBACK_PLAYLIST_ID) {
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube playlist"></iframe>`;
        } else if (CHANNEL_ID) {
          container.innerHTML = `<iframe src="https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}" allowfullscreen title="YouTube live"></iframe>`;
        } else {
          latestWrap.innerHTML = '<div class="yt-note">نمایش ویدیو ممکن نشد (API محدود). لطفاً Channel ID یا Uploads Playlist را تنظیم کنید.</div>';
        }
      }
    }

    // All videos list (uploads playlist)
    if (allWrap) {
      // Determine uploads playlist id if not set
      if (!FALLBACK_PLAYLIST_ID) await resolveUploadsPlaylistId();
      allWrap.innerHTML = '';
      const grid = document.createElement('div');
      grid.className = 'yt-grid';
      const loadBox = document.createElement('div');
      loadBox.style.textAlign = 'center';
      loadBox.style.marginTop = '12px';
      const loadBtn = document.createElement('button');
      loadBtn.className = 'yt-load-btn';
      loadBtn.textContent = 'نمایش بیشتر';
      loadBox.appendChild(loadBtn);
      allWrap.appendChild(grid);
      allWrap.appendChild(loadBox);

      let nextPageToken = '';
      let loading = false;

      async function loadMore(){
        if (loading) return; loading = true; loadBtn.disabled = true; loadBtn.textContent = 'در حال بارگذاری...';
        try {
          if (!API_KEY) throw Object.assign(new Error('NO_API_KEY'), { code: 'NO_API_KEY' });
          if (!FALLBACK_PLAYLIST_ID) await resolveUploadsPlaylistId();
          if (!FALLBACK_PLAYLIST_ID) throw Object.assign(new Error('NO_UPLOADS'), { code: 'NO_UPLOADS' });
          const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${FALLBACK_PLAYLIST_ID}&maxResults=12&key=${API_KEY}${nextPageToken?`&pageToken=${nextPageToken}`:''}`;
          const data = await fetchJson(url);
          nextPageToken = data.nextPageToken || '';
          const items = (data.items || []).filter(it=>it.snippet && it.snippet.resourceId && it.snippet.resourceId.videoId);
          // Sort by publishedAt desc
          items.sort((a,b)=> new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
          for (const it of items){
            const sn = it.snippet;
            const vid = sn.resourceId.videoId;
            const thumb = (sn.thumbnails && (sn.thumbnails.medium || sn.thumbnails.high || sn.thumbnails.default)) || {};
            const url = `https://www.youtube.com/watch?v=${vid}`;
            const card = document.createElement('div');
            card.className = 'yt-card';
            card.innerHTML = `
              <img class="yt-thumb" src="${thumb.url || ''}" alt="${(sn.title||'').replace(/"/g,'&quot;')}">
              <div class="yt-meta">
                <div class="yt-title">${sn.title || ''}</div>
                <div class="yt-date">${new Date(sn.publishedAt).toLocaleString('fa-IR')}</div>
              </div>`;
            card.onclick = ()=>{
              // Play selected in live/embed area if exists; else open new tab
              const topPlayer = document.getElementById('yt-live') || document.getElementById('yt-latest');
              if (topPlayer) {
                topPlayer.innerHTML = '';
                const wrap = document.createElement('div');
                wrap.className = 'yt-embed-wrap';
                wrap.appendChild(buildIframe(vid, true));
                topPlayer.appendChild(wrap);
                window.scrollTo({ top: topPlayer.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
              } else {
                window.open(url, '_blank');
              }
            };
            grid.appendChild(card);
          }
          if (!nextPageToken) { loadBtn.style.display = 'none'; }
        } catch (e) {
          // Fallback: embed uploads playlist without API if we have playlist id
          loadBtn.style.display = 'none';
          if (!FALLBACK_PLAYLIST_ID && CHANNEL_ID && CHANNEL_ID.startsWith('UC')) {
            FALLBACK_PLAYLIST_ID = 'UU' + CHANNEL_ID.substring(2);
          }
          if (FALLBACK_PLAYLIST_ID) {
            const wrap = document.createElement('div');
            wrap.className = 'yt-embed-wrap';
            wrap.innerHTML = `<iframe src="https://www.youtube.com/embed/videoseries?list=${FALLBACK_PLAYLIST_ID}" allowfullscreen title="YouTube playlist"></iframe>`;
            // span full width
            const holder = document.createElement('div');
            holder.style.gridColumn = '1 / -1';
            holder.appendChild(wrap);
            grid.appendChild(holder);
          } else {
            grid.insertAdjacentHTML('beforeend', `<div class="yt-note" style="grid-column:1/-1;">نمایش لیست ویدیوها بدون API نیازمند تنظیم Channel ID یا Uploads Playlist است</div>`);
          }
        } finally {
          loading = false; loadBtn.disabled = false; loadBtn.textContent = 'نمایش بیشتر';
        }
      }

      loadBtn.addEventListener('click', loadMore);
      // initial load
      loadMore();
    }
  }

  document.addEventListener('DOMContentLoaded', render);
})();


