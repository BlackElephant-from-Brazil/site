# Customer Dashboard Charts Design

## Goal

Add two visual summaries to each project card on `/dashboard/customer`: a status distribution pie chart for the project's activities and a monthly support-hours progress chart showing used and remaining hours.

## Scope

This change is presentation-only. It uses the data already available in `CustomerProjectDashboard` and `CustomerProjectActivity`: activity status, used minutes, monthly contracted hours, and whether the project has a monthly support bank. It does not add database fields, migrations, server actions, or Supabase query changes.

## Layout

Inside each project card, place a two-column chart area below the project title/header metrics and above the activity list. On narrow screens, stack the panels vertically. Each panel uses the existing dashboard card language: dark background, subtle border, compact headings, and lime accents.

The existing support and used-hours metric chips remain in the card header to preserve the current scannable summary.

## Status Pie Chart

Group `project.activities` by `activity.status`. Render a compact SVG pie/donut chart with a legend showing each status, count, and percentage. When the project has no activities, show a small empty state instead of a chart.

Use a restrained palette based on the existing dark UI with lime as the primary accent and neutral companion colors so the chart does not become a one-color interface.

## Hours Progress Chart

For projects with monthly support enabled and `monthlyHours` defined, compute:

- contracted minutes: `monthlyHours * 60`
- used minutes: `project.usedMinutes`
- remaining minutes: `max(contracted - used, 0)`
- usage percentage: capped at 100 for the filled bar while still showing the real used value

Render a horizontal progress chart with used and remaining values. If usage exceeds the contracted bank, show the bar as full and surface the overage in the tooltip text. For projects without monthly support, render a muted empty state.

## Tooltips

Use custom lightweight tooltips built with local React/CSS patterns, not a chart dependency. Tooltips should be discreet: dark background, subtle border, small text, and no large motion.

Pie tooltip content: status name, activity count, and percentage of project activities.

Hours tooltip content: contracted hours, used hours, remaining hours, and overage when applicable.

## Testing

Because the repository has no automated test script, verification should include:

- `npm run lint`
- `npm run build`
- manual browser check on `/pt/dashboard/customer` for desktop and mobile widths

The implementation should keep all formatting helpers deterministic and handle empty data without runtime errors.
