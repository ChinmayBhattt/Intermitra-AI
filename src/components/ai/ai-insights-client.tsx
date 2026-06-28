"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMemberName } from "@/lib/utils";
import type { Member, AiInsight } from "@/lib/types/database";
import { Sparkles, AlertTriangle, Mail, FileText, Tag } from "lucide-react";

export function AiInsightsClient({
  atRiskMembers,
  insights,
}: {
  atRiskMembers: Member[];
  insights: AiInsight[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  async function runAnalysis(type: string, memberId?: string) {
    setLoading(type);
    setResult(null);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, memberId }),
    });
    const data = await res.json();
    setResult(data.content ?? data.error);
    setLoading(null);
    if (type === "at_risk") window.location.reload();
  }

  const actions = [
    { type: "at_risk", label: "Analyze At-Risk Members", icon: AlertTriangle, desc: "Flag members with attendance drop-off" },
    { type: "engagement_summary", label: "Monthly Engagement Report", icon: FileText, desc: "Claude-written summary of gym activity" },
    { type: "promotions", label: "Suggest Promotions", icon: Tag, desc: "AI-powered promotion ideas based on trends" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">AI Insights</h1>
        <p className="text-zinc-400">Claude-powered retention and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.type}>
              <CardHeader>
                <Icon className="h-5 w-5 text-red-400" />
                <CardTitle className="text-base">{action.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-zinc-400">{action.desc}</p>
                <Button
                  onClick={() => runAnalysis(action.type)}
                  disabled={loading === action.type}
                  size="sm"
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading === action.type ? "Analyzing..." : "Run Analysis"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {result && (
        <Card className="border-red-900/30">
          <CardHeader><CardTitle>AI Result</CardTitle></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-zinc-300">{result}</pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            At-Risk Members ({atRiskMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {atRiskMembers.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 p-3">
              <div>
                <p className="font-medium text-zinc-100">{getMemberName(m)}</p>
                <p className="text-sm text-zinc-500">{m.email}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSelectedMember(m.id); runAnalysis("retention_email", m.id); }}
                disabled={loading === "retention_email"}
              >
                <Mail className="h-4 w-4" /> Draft Email
              </Button>
            </div>
          ))}
          {!atRiskMembers.length && <p className="text-sm text-zinc-500">No at-risk members. Run analysis to detect drop-offs.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Previous Insights</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="rounded-lg bg-zinc-800/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Badge>{insight.type.replace("_", " ")}</Badge>
                <span className="text-xs text-zinc-500">{new Date(insight.created_at).toLocaleDateString()}</span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-zinc-300">{insight.content.slice(0, 500)}{insight.content.length > 500 ? "..." : ""}</pre>
            </div>
          ))}
          {!insights.length && <p className="text-sm text-zinc-500">No insights yet. Run an analysis above.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
