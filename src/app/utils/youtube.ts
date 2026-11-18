/**
 * Utilidades puras para URLs de YouTube.
 * Sin llamadas a la API — todo client-side, sin clave API.
 *
 * Formatos de URL de video soportados:
 *   https://www.youtube.com/watch?v=VIDEO_ID
 *   https://youtu.be/VIDEO_ID
 *   https://www.youtube.com/embed/VIDEO_ID
 *   https://www.youtube-nocookie.com/embed/VIDEO_ID
 *   https://www.youtube.com/shorts/VIDEO_ID
 *
 * Formatos de playlist soportados:
 *   https://www.youtube.com/playlist?list=PLAYLIST_ID
 *   https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
 */

export const PLAYLIST_THRESHOLD = 10;

export function parseVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // youtu.be/VIDEO_ID
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
    // /embed/VIDEO_ID or /shorts/VIDEO_ID
    const embedMatch = u.pathname.match(/\/(embed|shorts)\/([^/?&]+)/);
    if (embedMatch) return embedMatch[2];
    // ?v=VIDEO_ID
    const v = u.searchParams.get('v');
    if (v) return v;
  } catch {
    // not a valid URL — try regex fallback
    const m = url.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
  }
  return null;
}

export function parsePlaylistId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.searchParams.get('list');
  } catch {
    const m = url.match(/[?&]list=([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  }
}

/** mqdefault: 320×180 — good quality without the letterboxing of hqdefault */
export function thumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/** Privacy-enhanced embed URL for individual video */
export function embedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/** Privacy-enhanced embed URL for a full playlist */
export function embedPlaylistUrl(playlistId: string): string {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`;
}

export function isYouTubeUrl(url: string): boolean {
  return /youtube\.com|youtu\.be/i.test(url);
}
