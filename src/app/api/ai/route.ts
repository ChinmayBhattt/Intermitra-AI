import { NextRequest, NextResponse } from "next/server";
import {
  analyzeAtRiskMembers,
  generateRetentionEmail,
  generateEngagementSummary,
  suggestPromotions,
} from "@/lib/ai/claude";

export async function POST(request: NextRequest) {
  try {
    const { type, memberId } = await request.json();

    let content: string | unknown;

    switch (type) {
      case "at_risk":
        content = await analyzeAtRiskMembers();
        break;
      case "retention_email":
        if (!memberId) return NextResponse.json({ error: "memberId required" }, { status: 400 });
        content = await generateRetentionEmail(memberId);
        break;
      case "engagement_summary":
        content = await generateEngagementSummary();
        break;
      case "promotions":
        content = await suggestPromotions();
        break;
      default:
        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    }

    return NextResponse.json({ content: typeof content === "string" ? content : JSON.stringify(content) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI request failed" },
      { status: 500 }
    );
  }
}
