import { NextResponse } from "next/server";

// POST /api/performance
// Body: { dealId }
// Returns: { spend, metrics: [...], funnel: [...], daily: [...], insight }
//
// TODO(api): pull real numbers from the YouTube Data API (views, watch time,
// engagement) plus Google Ads (boost spend, conversions) for this deal's video.
// The mock returns a realistic post-campaign recap so the UI is demoable.

export async function POST(req) {
  await req.json(); // { dealId }

  const sponsorshipFee = 2500;
  const boostSpend = 800;
  const revenue = 11200;
  const spend = sponsorshipFee + boostSpend;

  const metrics = [
    { label: "Views", value: "128,400", sub: "+42% vs. channel avg" },
    { label: "Avg. watch time", value: "3:12", sub: "of 6:40 video" },
    { label: "Engagement rate", value: "8.1%", sub: "likes + comments" },
    { label: "Link clicks", value: "4,020", sub: "3.1% CTR" },
    { label: "Conversions", value: "212", sub: "discount code used" },
    { label: "Revenue", value: "$11,200", sub: "attributed sales" },
  ];

  // Simple funnel for a bar chart.
  const funnel = [
    { stage: "Views", value: 128400 },
    { stage: "Clicks", value: 4020 },
    { stage: "Add to cart", value: 640 },
    { stage: "Purchases", value: 212 },
  ];

  // Daily views for a sparkline (7 days after publish).
  const daily = [52000, 31000, 18000, 12000, 7000, 4800, 3600];

  const roas = (revenue / spend).toFixed(1);
  const insight = `This campaign returned ${roas}x on a $${spend.toLocaleString()} total spend ($${sponsorshipFee.toLocaleString()} fee + $${boostSpend} boost). Boosting the video drove ~30% of conversions — worth repeating via your multi-activation clause.`;

  await new Promise((r) => setTimeout(r, 700));
  return NextResponse.json({ spend, revenue, roas, metrics, funnel, daily, insight });
}
