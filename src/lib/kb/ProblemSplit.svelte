<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, type ProblemGroup } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → { href, label } of the ticket that tracks it.
  let { ticket, tickets }: { ticket: number; tickets: Partial<Record<ProblemGroup['problem'], { href: string; label: string }>> } = $props();

  const rows = (reports as Report[]).filter((r) => r.mergedInto === ticket);
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByProblem(merged, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket}
  ({rows.length - merged.length} rows in the export are repeats of the same id) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      {@const t = tickets[g.problem]}
      <tr class:open={!t}>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.href}>{t.label}</a>{:else}no ticket yet{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{groups.reduce((n, g) => n + g.reports.length, 0)}</td><td colspan="3"></td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
  tfoot td { font-weight: 600; }
</style>
