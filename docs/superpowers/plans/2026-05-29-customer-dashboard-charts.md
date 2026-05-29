# Customer Dashboard Charts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-project activity status and monthly support-hours charts to `/dashboard/customer`.

**Architecture:** Keep data fetching unchanged and derive chart data from the existing `CustomerProjectDashboard` payload. Add small pure helper functions next to the page for status grouping, pie geometry, and support-hour usage, then render lightweight SVG/CSS chart panels inside each project card. Use CSS hover/focus tooltips instead of adding a chart dependency.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, Tailwind CSS v4 utility classes, existing CSS design tokens.

---

## File Structure

- Modify `src/app/[locale]/(member)/dashboard/customer/page.tsx`
  - Add pure chart-data helper functions.
  - Add chart panel components below the project header and above the activity list.
  - Keep existing Supabase query usage unchanged.
- No new database, migration, server action, or Supabase query files.
- No new npm dependencies.

## Task 1: Add Chart Data Helpers

**Files:**
- Modify: `src/app/[locale]/(member)/dashboard/customer/page.tsx`

- [ ] **Step 1: Write the helper signatures and expected calculations as comments before implementation**

Add this block near the formatter helpers at the bottom of `src/app/[locale]/(member)/dashboard/customer/page.tsx`:

```tsx
// Chart helper requirements:
// buildStatusSegments([{ status: 'Backlog' }, { status: 'Backlog' }, { status: 'Done' }])
// returns two segments with counts 2 and 1, percentages 66.7 and 33.3, and deterministic colors.
//
// buildHoursUsage({ hasMonthlyBank: true, monthlyHours: 40, usedMinutes: 540 })
// returns contractedMinutes 2400, usedMinutes 540, remainingMinutes 1860, overageMinutes 0, usagePercent 22.5.
//
// buildHoursUsage({ hasMonthlyBank: true, monthlyHours: 1, usedMinutes: 90 })
// returns contractedMinutes 60, usedMinutes 90, remainingMinutes 0, overageMinutes 30, usagePercent 100.
```

- [ ] **Step 2: Run lint to verify the comment-only change is harmless**

Run:

```bash
npm run lint
```

Expected: existing lint state is reported without new syntax errors from the comment block.

- [ ] **Step 3: Implement the pure helper types and functions**

Add this implementation near the formatter helpers:

```tsx
const STATUS_COLORS = [
  '#39FF14',
  '#7dd3fc',
  '#facc15',
  '#fb7185',
  '#a78bfa',
  '#f97316',
]

interface StatusSegment {
  status: string
  count: number
  percentage: number
  color: string
  dashArray: string
  dashOffset: number
}

interface HoursUsage {
  hasBank: boolean
  contractedMinutes: number
  usedMinutes: number
  remainingMinutes: number
  overageMinutes: number
  usagePercent: number
}

function buildStatusSegments(activities: CustomerProjectActivity[]): StatusSegment[] {
  const counts = activities.reduce<Record<string, number>>((acc, activity) => {
    acc[activity.status] = (acc[activity.status] ?? 0) + 1
    return acc
  }, {})

  const total = activities.length
  let offset = 0

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
    .map(([status, count], index) => {
      const percentage = total === 0 ? 0 : (count / total) * 100
      const segment: StatusSegment = {
        status,
        count,
        percentage,
        color: STATUS_COLORS[index % STATUS_COLORS.length],
        dashArray: `${percentage} ${100 - percentage}`,
        dashOffset: -offset,
      }
      offset += percentage
      return segment
    })
}

function buildHoursUsage(project: CustomerProjectDashboard): HoursUsage {
  const hasBank = project.hasMonthlyBank && project.monthlyHours !== null
  const contractedMinutes = hasBank ? project.monthlyHours! * 60 : 0
  const usedMinutes = project.usedMinutes
  const remainingMinutes = hasBank ? Math.max(contractedMinutes - usedMinutes, 0) : 0
  const overageMinutes = hasBank ? Math.max(usedMinutes - contractedMinutes, 0) : 0
  const usagePercent = hasBank && contractedMinutes > 0
    ? Math.min((usedMinutes / contractedMinutes) * 100, 100)
    : 0

  return {
    hasBank,
    contractedMinutes,
    usedMinutes,
    remainingMinutes,
    overageMinutes,
    usagePercent,
  }
}
```

- [ ] **Step 4: Run lint after helper implementation**

Run:

```bash
npm run lint
```

Expected: no TypeScript syntax or lint errors introduced by the helper code.

## Task 2: Render the Status Pie Chart

**Files:**
- Modify: `src/app/[locale]/(member)/dashboard/customer/page.tsx`

- [ ] **Step 1: Compute chart data in `ProjectActivityList`**

Inside `ProjectActivityList`, after the support/used labels:

```tsx
const statusSegments = buildStatusSegments(project.activities)
const hoursUsage = buildHoursUsage(project)
```

- [ ] **Step 2: Insert the chart area below the project header**

Immediately after the closing `</header>` in `ProjectActivityList`, add:

```tsx
<ProjectCharts
  statusSegments={statusSegments}
  totalActivities={project.activities.length}
  hoursUsage={hoursUsage}
/>
```

- [ ] **Step 3: Add `ProjectCharts` and `StatusPieChart` components**

Add these components above `ActivityRow`:

```tsx
function ProjectCharts({
  statusSegments,
  totalActivities,
  hoursUsage,
}: {
  statusSegments: StatusSegment[]
  totalActivities: number
  hoursUsage: HoursUsage
}) {
  return (
    <section
      className="grid gap-3 border-b px-5 py-4 lg:grid-cols-2"
      style={{ borderColor: 'var(--card-border)' }}
    >
      <ChartPanel title="Status das atividades">
        <StatusPieChart segments={statusSegments} totalActivities={totalActivities} />
      </ChartPanel>
      <ChartPanel title="Uso do suporte mensal">
        <HoursProgressChart usage={hoursUsage} />
      </ChartPanel>
    </section>
  )
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,0.025)' }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: 'var(--foreground-muted)' }}
      >
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function StatusPieChart({
  segments,
  totalActivities,
}: {
  segments: StatusSegment[]
  totalActivities: number
}) {
  if (totalActivities === 0) {
    return <ChartEmptyState message="Nenhuma atividade para calcular status." />
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative h-28 w-28 shrink-0">
        <svg viewBox="0 0 42 42" className="h-28 w-28 -rotate-90" aria-hidden="true">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          {segments.map(segment => (
            <circle
              key={segment.status}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={segment.color}
              strokeWidth="6"
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {totalActivities}
          </span>
          <span className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--foreground-muted)' }}>
            atividades
          </span>
        </div>
      </div>

      <ul className="grid flex-1 gap-2">
        {segments.map(segment => (
          <li key={segment.status}>
            <Tooltip content={`${segment.status}: ${segment.count} atividade(s), ${formatNumber(segment.percentage)}%`}>
              <div className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-white/[0.03]">
                <span className="flex min-w-0 items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segment.color }} />
                  <span className="truncate">{segment.status}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold" style={{ color: 'var(--foreground-muted)' }}>
                  {segment.count} - {formatNumber(segment.percentage)}%
                </span>
              </div>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Run lint after adding the status chart**

Run:

```bash
npm run lint
```

Expected: no new errors from the chart components.

## Task 3: Render the Hours Progress Chart and Tooltips

**Files:**
- Modify: `src/app/[locale]/(member)/dashboard/customer/page.tsx`

- [ ] **Step 1: Add `HoursProgressChart`, `Tooltip`, and empty state components**

Add these components above `ActivityRow`:

```tsx
function HoursProgressChart({ usage }: { usage: HoursUsage }) {
  if (!usage.hasBank) {
    return <ChartEmptyState message="Sem suporte mensal contratado." />
  }

  const tooltip = [
    `${formatMinutes(usage.usedMinutes)} usadas`,
    `${formatMinutes(usage.contractedMinutes)} contratadas`,
    `${formatMinutes(usage.remainingMinutes)} disponíveis`,
    usage.overageMinutes > 0 ? `${formatMinutes(usage.overageMinutes)} excedentes` : null,
  ].filter(Boolean).join(' | ')

  return (
    <Tooltip content={tooltip}>
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              {formatNumber(usage.usagePercent)}%
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              do banco mensal utilizado
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: 'var(--foreground-muted)' }}>
            <p>
              <span style={{ color: 'var(--foreground)' }}>{formatMinutes(usage.remainingMinutes)}</span> disponíveis
            </p>
            {usage.overageMinutes > 0 && (
              <p style={{ color: '#fb7185' }}>{formatMinutes(usage.overageMinutes)} excedentes</p>
            )}
          </div>
        </div>
        <div className="h-3 overflow-hidden rounded-full border" style={{ borderColor: 'var(--card-border)', background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${usage.usagePercent}%`,
              background: usage.overageMinutes > 0
                ? 'linear-gradient(90deg, #39FF14 0%, #fb7185 100%)'
                : 'linear-gradient(90deg, #39FF14 0%, #7dd3fc 100%)',
            }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--foreground-muted)' }}>
          <span>{formatMinutes(usage.usedMinutes)} usadas</span>
          <span>{formatMinutes(usage.contractedMinutes)} contratadas</span>
        </div>
      </div>
    </Tooltip>
  )
}

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="group relative">
      <div tabIndex={0} className="outline-none">
        {children}
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-full z-[400] mt-2 w-max max-w-64 -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-xs opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
        style={{
          borderColor: 'var(--card-border)',
          background: 'rgba(10,10,10,0.96)',
          color: 'var(--foreground-muted)',
        }}
      >
        {content}
      </div>
    </div>
  )
}

function ChartEmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-28 items-center justify-center rounded-md border border-dashed px-4 py-6 text-center text-sm"
      style={{ borderColor: 'var(--card-border)', color: 'var(--foreground-muted)' }}
    >
      {message}
    </div>
  )
}
```

- [ ] **Step 2: Import `ReactNode` if needed**

If TypeScript requires a React type import, add:

```tsx
import type { ReactNode } from 'react'
```

Then update component props from `React.ReactNode` to `ReactNode`.

- [ ] **Step 3: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0, or failures are investigated and fixed before continuing.

## Task 4: Browser Verification and Polish

**Files:**
- Modify: `src/app/[locale]/(member)/dashboard/customer/page.tsx`

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Open `/pt/dashboard/customer` in the browser**

Verify:

- The project title remains at the top of the card.
- The status chart and hours chart appear below the project title/header.
- Tooltips appear on hover/focus and do not cover unrelated controls.
- Empty activity and no-bank states render without broken layout.
- Mobile width stacks the two chart panels vertically.

- [ ] **Step 3: Fix any visual overflow found in browser verification**

Use constrained widths, `truncate`, or stacked layout classes in `src/app/[locale]/(member)/dashboard/customer/page.tsx` if labels or tooltips overflow.

- [ ] **Step 4: Run final verification**

Run:

```bash
npm run lint
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 5: Commit implementation**

Commit only files changed for this feature:

```bash
git add 'src/app/[locale]/(member)/dashboard/customer/page.tsx' docs/superpowers/plans/2026-05-29-customer-dashboard-charts.md
git commit -m "feat: add customer dashboard charts"
```

Before committing, run `git diff --cached --stat` and confirm it does not include unrelated existing worktree changes.

---

## Self-Review

- Spec coverage: the plan covers the two chart panels, status grouping, support-hour progress, custom discreet tooltips, empty states, responsive layout, and no new chart dependency.
- Placeholder scan: no `TBD`, `TODO`, or deferred implementation instructions remain.
- Type consistency: `StatusSegment`, `HoursUsage`, `CustomerProjectDashboard`, and `CustomerProjectActivity` are used consistently across helper and component steps.
