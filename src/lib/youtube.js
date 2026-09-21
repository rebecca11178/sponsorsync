// ---------------------------------------------------------------------------
// YouTube Data API v3 helper — SERVER ONLY.
//
// Quota-friendly on purpose (default quota = 10,000 units/day):
//   channels.list (forHandle)   1 unit   → uploads playlist id
//   playlistItems.list          1 unit   → latest video ids
//   videos.list                 1 unit   → stats for up to 50 videos
// We never call search.list (100 units). Results are cached in memory for
// 30 min so re-running the demo doesn't burn quota.
//
// .env.local:  YOUTUBE_API_KEY=...
// ---------------------------------------------------------------------------
const API = "https://www.googleapis.com/youtube/v3";
const TTL_MS = 30 * 60 * 1000;
const cache = new Map();

export function youtubeEnabled() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

async function yt(endpoint, params) {
  const qs = new URLSearchParams({ ...params, key: process.env.YOUTUBE_API_KEY });
  const url = `${API}/${endpoint}?${qs}`;
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < TTL_MS) return hit.v;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`YouTube ${endpoint} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const v = await res.json();
  cache.set(url, { t: Date.now(), v });
  return v;
}

const daysAgo = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000));

// Accepts watch?v=, youtu.be/, /shorts/, /embed/, /live/ and bare 11-char ids.
export function parseVideoId(input = "") {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1, 12) || null;
    const v = u.searchParams.get("v");
    if (v && /^[\w-]{11}$/.test(v)) return v;
    const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]{11})/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}

function toVideo(v) {
  const s = v.statistics || {};
  return {
    id: v.id,
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.snippet?.title || "",
    description: (v.snippet?.description || "").slice(0, 400),
    tags: (v.snippet?.tags || []).slice(0, 10),
    views: Number(s.viewCount || 0),
    likes: Number(s.likeCount || 0),
    comments: Number(s.commentCount || 0),
    days: daysAgo(v.snippet?.publishedAt),
    publishedAt: v.snippet?.publishedAt,
    likesHidden: s.likeCount == null, // creators can hide like counts
  };
}

/**
 * Latest uploads for a channel handle (e.g. "@mkbhd"), newest first.
 * Default 20 so the data layer can compute posting frequency; still only
 * 3 quota units (playlistItems + videos.list both take up to 50 at once).
 * Video shape = what the UI uses ({ title, views, days }) + extra LLM fields.
 */
export async function getRecentVideos(handle, max = 20) {
  const ch = await yt("channels", { part: "contentDetails,statistics", forHandle: handle.replace(/^@?/, "@") });
  const channel = ch.items?.[0];
  if (!channel) throw new Error(`No channel for handle ${handle}`);

  const uploads = channel.contentDetails.relatedPlaylists.uploads;
  const pl = await yt("playlistItems", { part: "contentDetails", playlistId: uploads, maxResults: String(max) });
  const ids = (pl.items || []).map((i) => i.contentDetails.videoId);
  const stats = {
    subscribers: Number(channel.statistics?.subscriberCount || 0),
    hiddenSubscriberCount: Boolean(channel.statistics?.hiddenSubscriberCount),
  };
  if (!ids.length) return { videos: [], ...stats };

  const vids = await yt("videos", { part: "snippet,statistics", id: ids.join(",") });
  const videos = (vids.items || []).map(toVideo).sort((a, b) => a.days - b.days); // newest first
  return { videos, ...stats };
}

/**
 * Metadata for one delivered video — used by the platform compliance check.
 * Returns null if the video doesn't exist or isn't visible to the API key.
 */
export async function getVideoDetails(videoId) {
  const r = await yt("videos", {
    part: "snippet,statistics,status,contentDetails,paidProductPlacementDetails",
    id: videoId,
  });
  const v = r.items?.[0];
  if (!v) return null;
  return {
    ...toVideo(v),
    fullDescription: v.snippet?.description || "",
    privacyStatus: v.status?.privacyStatus, // public | unlisted | private
    madeForKids: v.status?.madeForKids,
    ageRestricted: v.contentDetails?.contentRating?.ytRating === "ytAgeRestricted",
    regionBlocked: v.contentDetails?.regionRestriction?.blocked || [],
    // YouTube's "Includes paid promotion" toggle. undefined = API didn't report it.
    hasPaidPromotion: v.paidProductPlacementDetails?.hasPaidProductPlacement,
  };
}
