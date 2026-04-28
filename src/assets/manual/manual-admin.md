# Admin Manual

::: admonition note
Admin features are only available after logging in with an account that has
the `admin` role. On mobile, all admin pages are accessible from the
navigation drawer (tap &#9776; in the top-left).
:::

---

## Station List & Station Details

The **Stations** page lists every station for the current event.

![Station List](/manual/images/station-list.png 'Station List')

Tap the **edit icon** (&#9998;) on a station card to modify it. The
following fields are available:

- **Station name** — the unique identifier for the station (cannot be
  changed after creation).
- **Departure Station** — mark this as the start of the route. When a team
  is marked as *Arrived* here, the team's effective start time is recorded.
- **Arrival Station** — mark this as the end of the route. When a team is
  marked as *Arrived* here, they are automatically flagged as *Finished*.
- **Phone Number** — contact phone for this station (optional).
- **Contact** — name of the person responsible for this station (optional).

The **clipboard icon** (&#x1F4CB;) next to a station opens the
[Station Dashboard](#station-dashboard) for that station.

::: admonition note
Admins can open the dashboard for **any** station directly from this list.
Station managers can only open dashboards for stations assigned to them.
:::

### Station Ordering

Stations are displayed in the order defined by their **order** field. You
can drag and drop rows in the desktop view to reorder them. The order
determines which station is shown as "previous" and "next" in the Station
Dashboard side strips.

---

## Team List & Team Details

The **Teams** page lists every team registered for the current event.

![Team List](/manual/images/team-list.png 'Team List')

Tap a team's **edit icon** to open the Team Panel.

![Team Panel](/manual/images/team-panel.png 'Team Panel')

From here you can:

- Edit the team's **name**, **route** and **contact** information.
- **Delete** the team (requires confirmation).
- **Save** any changes.

::: admonition tip
Use the Team Panel to manually mark a team as **cancelled** or **finished**
even if they have not reached the Arrival Station. This immediately informs
all station dashboards that the team is no longer active.
:::

---

## Station Dashboard

See the [Station Dashboard section in the Staff Manual](../staff) for full
details. As an admin you can open the dashboard for **any** station.

![Station Dashboard](/manual/images/station-dashboard.png 'Station Dashboard')

---

## Upload Management

The **Uploads** page lets you view and delete **any** photo in the system —
including photos submitted by other users or received by e-mail.

Tap the preview icon to view a photo full-screen, or the delete icon to
remove it.

---

## User Management

The **Users** page (accessible from the navigation drawer) lets you create,
view and delete user accounts.

![User Management](/manual/images/user-panel.png 'User Management')

Each user card shows:

- The **username**.
- The user's **roles** (displayed as coloured chips).

::: admonition important
For a user to access the Station Dashboard for a specific station they must:
1. Have the `station_manager` role assigned.
2. Have that station assigned to them for the current event.

Both conditions must be met. Use the Users page to manage roles and station
assignments.
:::

::: admonition note
Users with the `admin` role have the `manage-all-stations` permission, which
lets them open the dashboard for every station from the Station List without
needing individual station assignments.
:::

---

## Audit Log

The **Audit** page shows a full chronological history of every score change
and state change made during the event.

![Audit Log](/manual/images/audit-log.png 'Audit Log')

Each row shows the timestamp, team name, station name and what changed (a
state transition or a new score value). Use this view to investigate
disputed scores or to verify that state updates were recorded correctly.
