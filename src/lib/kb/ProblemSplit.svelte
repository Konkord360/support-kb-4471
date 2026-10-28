<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type CauseGroup, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // Counts are the desk's own view (causes.ts): one row per cause. The one-day moves (desk-notes.json)
  // stay counted under the cause they're filed in, and get their own ticket.
  type Ticket = { href: string; label: string; outcome: string };
  let { ticket, tickets, shift }: { ticket: number; tickets: Partial<Record<CauseGroup['cause'], Ticket>>; shift: Ticket } = $props();

  const rows = (reports as Report[]).filter((r) => r.mergedInto === ticket);
  const merged = $derived(uniqueById(rows));
  const groups = $derived(groupByCause(merged, tenantOf));
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket}
  ({rows.length - merged.length} rows in the export are repeats of the same id) ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'cause' : 'causes'}, plus one problem filed inside them
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th><th>outcome</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.cause)}
      {@const t = tickets[g.cause]}
      {@const moved = readAs(g, notes.oneDayMove)}
      <tr class:open={!t}>
        <td><code>{g.cause}</code></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if t}<a href={t.href}>{t.label}</a>{:else}no ticket yet{/if}</td>
        <td>{t?.outcome ?? ''}</td>
      </tr>
      {#if moved}
        <tr class="sub">
          <td>↳ <code>shift</code></td>
          <td>{moved}</td>
          <td colspan="2">read as a one-day move; counted above under <code>{g.cause}</code></td>
          <td><a href={shift.href}>{shift.label}</a></td>
          <td>{shift.outcome}</td>
        </tr>
      {/if}
    {/each}
  </tbody>
  <tfoot>
    <tr><td>total</td><td>{groups.reduce((n, g) => n + g.reports.length, 0)}</td><td colspan="4"></td></tr>
  </tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .open td { background: var(--warn-bg); }
  .open td:nth-child(5) { color: var(--warn); font-weight: 600; }
  .sub td { color: var(--muted); font-size: 0.9em; }
  tfoot td { font-weight: 600; }
</style>
