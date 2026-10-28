// What #4471 actually holds: one problem per fix. causes.ts places a report by its tenant; a report
// the desk read as a one-day move (desk-notes.json) is not a flipped date at all, whatever its tenant.
import { causeOf, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'shift';

export function problemOf(r: Pick<Report, 'id' | 'channel'>, t: Tenant | undefined, shifted: readonly string[]): Problem | null {
  if (shifted.includes(r.id)) return 'shift';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: number;
  firstSeen: string;
  lastSeen: string;
};

export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, shifted: readonly string[]): ProblemGroup[] {
  const byProblem = new Map<ProblemGroup['problem'], Report[]>();
  for (const r of reports) {
    const p = problemOf(r, tenantOf(r), shifted) ?? 'unplaced';
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports: rs, tenants: new Set(rs.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
