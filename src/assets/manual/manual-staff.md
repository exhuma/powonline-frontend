# Staff Manual

## Important Concepts

### Team States

A team has a **state** for each station it passes through. There are four
possible states:

| State | Meaning |
|---|---|
| **Unknown / Pending** | The team has not yet arrived at this station |
| **Arrived** | The team is currently at this station |
| **Finished** | The team has left this station |
| **Unreachable** | This station cannot be reached by this team |

The states are shown as icons throughout the application:

- Unknown/Pending: ![Pending](/manual/images/icon-pending.png 'State Icon: Pending')
- Arrived: ![Arrived](/manual/images/icon-arrived.png 'State Icon: Arrived')
- Finished: ![Finished](/manual/images/icon-finished.png 'State Icon: Finished')

### Team Completion

A team is considered to have completed the event when **any** of the
following happens:

- The team is marked as **finished** at the designated **Arrival Station**.
- A staff member manually marks the team as **cancelled**.
- A staff member manually marks the team as **finished** from the Team List.

::: admonition important
**Keep the states up to date.** Stations receive the states of neighbouring
stations in their dashboard. If teams are marked finished promptly, the next
station can see them coming and prepare. Cancellations are equally important:
stations will stop waiting for a cancelled team.
:::

---

## Navigation

On mobile, tap the **hamburger menu (&#9776;)** in the top-left to open the
navigation drawer. The available items depend on your role and the currently
selected event:

- **Dashboard** — live event progress overview
- **Photos** — photo gallery
- **Stations** — station list and dashboards (station managers and admins)
- **Uploads** — manage your photo uploads (when logged in)

---

## Station List

The Station List shows every station registered for the current event.

![Station List](/manual/images/station-list.png 'Station List')

Tap the **clipboard icon** next to a station to open its dashboard.

::: admonition tip
The clipboard button is only available for stations you have been assigned to
(or for all stations if you have the `admin` role).
:::

---

## Station Dashboard

The Station Dashboard is the primary working view for station staff.

![Station Dashboard](/manual/images/station-dashboard.png 'Station Dashboard')

### Layout

The screen is divided into three vertical areas:

- **Left strip** — icons showing the states of teams at the **previous**
  station. Brighter icons are more recent. Tap this strip to jump to the
  previous station.
- **Centre column** — the main content area (described below).
- **Right strip** — icons showing the states of teams at the **next**
  station. Brighter icons are more recent. Tap this strip to jump to the
  next station.

::: admonition tip
Use the side strips to predict incoming traffic. If the previous station has
recently finished many teams (bright green icons at the top), those teams
will be arriving at your station soon.
:::

### Navigation Bar

At the top of the centre column the names of the **previous** and **next**
stations are shown as tappable buttons. Use these to quickly jump between
stations.

### Find a Team

A filter box lets you search for a team by name or contact person (minimum
3 characters). Only matching teams will be shown while the filter is active.

### Team Cards

Each active team is shown as a card with:

- **Team name** in the card header (shown with a strikethrough and an
  "Cancelled" label if the team has been cancelled)
- **Score** — the numeric score for this station. Edit and press Enter or
  tap away to save, or use the Save button.
- **Q-Score** — the questionnaire score for this station (label shows the
  questionnaire name). Saved the same way.
- **State button** — shows the current state icon. Tap it to **advance the
  state** in sequence: Unknown → Arrived → Finished.
- **Save button** (&#128190;) — saves both score fields at once.

### Finished Teams

Teams that have been marked as **Finished** at this station are moved into a
collapsible **"Done"** section at the bottom. Expand it to see or edit them.

---

## Tips for Station Staff

- Mark teams as **Arrived** as soon as they appear at your station — this
  information is immediately visible to the next station.
- Mark teams as **Finished** when they leave — this removes them from the
  active list and updates the dashboard for everyone.
- If a team skips your station entirely, leave them as **Unknown** or contact
  the event admin to mark them cancelled.
