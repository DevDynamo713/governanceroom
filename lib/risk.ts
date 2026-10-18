export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export interface RiskItem { id: string; title: string; category: string; riskLevel: RiskLevel; score: number; mitigated: boolean }
export function riskScoreToLevel(score: number): RiskLevel {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}
export function overallRisk(items: RiskItem[]): number {
  if (items.length === 0) return 0;
  const active = items.filter(i => !i.mitigated);
  if (active.length === 0) return 0;
  return Math.round(active.reduce((sum, i) => sum + i.score, 0) / active.length);
}
export function formatRisk(r: RiskItem): string { return `${r.title} [${r.category}] score:${r.score} (${r.riskLevel}) mitigated:${r.mitigated}`; }