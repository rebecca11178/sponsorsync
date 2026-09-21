import { NextResponse } from "next/server";
import { getCreator } from "@/lib/mockData";
import { generateJSON, geminiEnabled } from "@/lib/gemini";
import { getRecentVideos, getVideoDetails, youtubeEnabled } from "@/lib/youtube";
import { VET_SCHEMA, VET_SYSTEM, vetPrompt, riskOf } from "@/lib/ai/vet";

// POST /api/vet
// Body: { creatorId }
// Returns: { risk, isSponsored, summary, checks[], video?, source }
//
// Pre-deal creator vetting: watch one of the creator's OWN recent videos and
// judge how safely they handle brand work (disclosure, claims, competitor
// knocking, brand safety, integration, audience). Runs the real Gemini + YouTube
// path only when the creator has a real channel handle and both APIs are on;
// otherwise returns a clearly-labelled sample so the UI always has something.

// Labelled sample used when we can't run the real check.
function sample(creator) {
  const checks = [
    { status: "ok", label: "Discloses paid promotion", note: "‘Includes paid promotion’ shown and mentioned verbally in the first 30s." },
    { status: "ok", label: "No unsafe or adult content", note: "Family-safe language and visuals throughout." },
    { status: "warn", label: "Soft benefit claim ~4:10", note: "Says a product ‘changed my routine’ without specifics — fine, but keep it away from health framing." },
    { status: "ok", label: "No competitor knocking", note: "Compares on features, doesn’t name rivals." },
    { status: "ok", label: "Natural integration", note: "Woven into the video, not a bolted-on ad read." },
    { status: "warn", label: "Confirm audience age", note: "Some comments read young — verify the under-18 share before youth-sensitive products." },
  ];
  return {
    risk: riskOf(checks),
    isSponsored: true,
    summary: `${creator?.name || "This creator"} handles brand deals cleanly, with a couple of points to confirm before signing.`,
    checks,
  };
}

export async function POST(req) {
  const { creatorId } = await req.json();
  const creator = getCreator(creatorId);
  const handle = (creator?.youtubeHandle || "").trim();

  if (creator && handle && youtubeEnabled() && geminiEnabled()) {
    try {
      const { videos } = await getRecentVideos(handle, 10);
      const pick = videos?.[0];
      if (pick?.id) {
        const details = await getVideoDetails(pick.id).catch(() => null);
        const video = details || pick;
        const url = `https://www.youtube.com/watch?v=${pick.id}`;
        const { data, error } = await generateJSON({
          system: VET_SYSTEM,
          prompt: vetPrompt(video),
          schema: VET_SCHEMA,
          videoUrl: url,
          timeoutMs: 120_000, // Gemini has to watch the video
        });
        if (data?.checks?.length) {
          return NextResponse.json({
            risk: riskOf(data.checks),
            isSponsored: data.isSponsored,
            summary: data.summary,
            checks: data.checks,
            video: { title: video.title, url },
            source: "gemini",
          });
        }
        return NextResponse.json({ ...sample(creator), source: "mock", ...(error ? { debug: error } : {}) });
      }
    } catch (err) {
      return NextResponse.json({ ...sample(creator), source: "mock", debug: err.message });
    }
  }

  return NextResponse.json({ ...sample(creator), source: "mock" });
}
