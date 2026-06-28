import { createClient } from "@/lib/supabase/server";
import { AiInsightsClient } from "@/components/ai/ai-insights-client";

export default async function AiPage() {
  const supabase = await createClient();

  const [{ data: atRiskMembers }, { data: insights }] = await Promise.all([
    supabase.from("members").select("*").eq("at_risk", true).eq("archived", false),
    supabase.from("ai_insights").select("*").order("created_at", { ascending: false }).limit(20),
  ]);

  return <AiInsightsClient atRiskMembers={atRiskMembers ?? []} insights={insights ?? []} />;
}
