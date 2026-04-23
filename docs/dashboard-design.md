# Dashboard Design Specification

**Document type:** Functional specification
**Audience:** UI/UX designer, AI design agent
**Scope:** Event progress dashboard overhaul
**Version:** 1.0

---

## 1. Purpose and Context

This application supports outdoor team events — think orienteering-style
competitions where groups of people (teams) travel between a series of
checkpoints (stations) along a defined path (route). Multiple routes can
run simultaneously within a single event.

The dashboard is a live view that shows how far each team has progressed
through the event. It is displayed publicly throughout the duration of the
event and is visible to three distinct audiences:

- **Participants** — teams currently competing, checking their own status
  or comparing against others
- **Supporters** — parents, friends, or relatives following from outside
  the event venue
- **Staff** — organisers and volunteers who need operational awareness

The dashboard is primarily shown on a large, unattended display (projector
or TV screen) that refreshes automatically every few seconds. Staff and
supporters may also view it on a desktop browser or a mobile device.

The most important quality of the dashboard is **immediate legibility at
a glance**, particularly on the large display where viewers are at a
distance and cannot interact with the screen.

---

## 2. Domain Model

Understanding the following concepts is essential before designing the
dashboard.

### Event

A single competition instance. It has a defined set of routes, stations,
and teams. The dashboard always operates within the context of one event.

### Route

A named, ordered sequence of stations. Each route has an associated
**colour** that is set by organisers and stored as data — the colour is
not a design choice, it is part of the domain. A route's colour must be
preserved and used as a recognisable identity marker throughout the
dashboard.

Routes vary significantly between events. Examples:

- **Bidirectional linear:** Two routes share exactly the same physical
  stations but teams travel them in opposite directions — one route goes
  A → B → C → D, the other goes D → C → B → A. Both routes start and end
  at the same physical location.

- **Star pattern:** Five departure stations and one central arrival
  station. Five routes, each with a different set of stations, all
  converging at the same endpoint.

- **Arbitrary:** Any other topology is possible. No assumptions about
  symmetry, station count, or direction should be made.

**The geographic layout of stations is secret and must never be implied
or visualised spatially.** The dashboard shows only progress — not
position on a map, not relative distance between stations, not any hint
of where stations are located.

### Station

A physical checkpoint that a team visits. Within a route, stations are
ordered (first, second, third, …). A station's position in the sequence
is what matters — its name is secondary. Station names are known to staff
but are not the primary visual element.

### Team

A group of participants. Each team is assigned to exactly one route for
the duration of an event. A team has the following relevant attributes:

- **Name** — display identifier
- **Route** — which route the team is on (determines colour and station
  sequence)
- **Status** — one of: active, cancelled, completed
- **Start time** — when the team began (may be staggered across teams)
- **Finish time** — when the team completed the route (if applicable)

### Station State (per team, per station)

Each combination of team + station has one of four states:

| State         | Meaning                                                      |
| ------------- | ------------------------------------------------------------ |
| `unknown`     | Team has not yet reached this station                        |
| `arrived`     | Team is currently at this station (checked in, not yet done) |
| `finished`    | Team has completed this station and moved on                 |
| `unreachable` | This station cannot be reached by this team (e.g. skipped)   |

These four states are the foundation of all progress visualisation.

### Score

Each station interaction can carry a numeric score. Scores accumulate
across stations to give a team's total score. Scores are public — all
viewers including participants and supporters may see them.

Two score aggregations are relevant to the dashboard:

- **Team total score** — sum of all scores across all stations a team
  has completed so far
- **Station average score** — the average score all teams have received
  at a given station (a measure of difficulty or performance at that
  checkpoint)

### Progress

Progress for a team is defined by how many of its route's stations have
reached the `finished` state. A team is considered **finished** when all
its stations are in state `finished`, or when the team is explicitly
marked as completed by staff.

---

## 3. Views

The dashboard has multiple views that serve different needs. The mechanism
for switching between views should be lightweight and unobtrusive — it
must not dominate the display, since most of the time the dashboard runs
unattended on the projector without anyone switching views.

### 3.1 Route-Grouped View

**Primary purpose:** Let viewers understand the state of each route
independently and compare teams within a route.

**Required information:**

- Each route is presented as a distinct group, identifiable by its colour
- Within each route group, each team is shown as a distinct row or unit
- For each team, the viewer must be able to tell:
  - How many stations are finished, how many are in progress (`arrived`),
    how many are not yet reached, and whether any are unreachable
  - The spatial order of those states along the station sequence —
    which stations near the start are done vs which near the end are
    still pending. This is the key improvement over the current design,
    which only shows aggregate counts with no positional information
  - The team's current total score
  - Whether the team is cancelled (visually distinct, clearly
    de-emphasised) or completed
- Within a route group, teams should be sorted by progress so that the
  leading team is easy to identify
- `unreachable` stations must be visually distinguishable from
  not-yet-reached stations
- Station names are **not** shown in the default display but must be
  accessible as a tooltip or on hover for staff using a browser

**Not required in this view:**

- Cross-route comparisons
- Per-station score breakdown

### 3.2 Combined View

**Primary purpose:** A single unified overview of all teams across all
routes, useful when route-level grouping would create too many small
sections or as a summary suitable for a large display.

**Required information:**

- All teams from all routes shown together in one flat list
- Each team's route must remain identifiable (via route colour)
- The same per-team progress information as in the Route-Grouped View
- Teams sorted by overall progress (furthest along first)
- Teams that have finished are visually separated from active teams

**Not required in this view:**

- Route-level aggregate statistics

### 3.3 Summary View

**Primary purpose:** Highest-level overview. Useful for the large display
when individual team rows are too small to read at a distance, or as a
quick health check for staff.

**Required information:**

- One entry per route, not per team
- Each entry shows the aggregate progress across all teams on that route
  (total station completions vs total possible)
- A grand-total entry covering all routes combined
- The route colour must be prominent

**Not required in this view:**

- Individual team breakdown
- Scores

---

## 4. Scoreboard Panel

A floating scoreboard panel can be summoned and dismissed without leaving
the current view. It overlays on top of whichever view is currently
displayed and does not replace it.

**Required information:**

- Ranked list of all non-cancelled teams by total score (highest first)
- Team name and total score per row
- Rank / position number
- Teams with equal scores must be handled gracefully (shared rank)
- The panel must be dismissible

**Constraints:**

- The panel should not obscure the entire dashboard when open — partial
  visibility of the background view is preferred
- It must be clear that the panel is a temporary overlay, not a
  navigation destination
- It must be accessible from all three views without switching views

---

## 5. Interactions

### 5.1 View Switching

The mechanism for switching between the three views (Route-Grouped,
Combined, Summary) must be available but unobtrusive. The dashboard
spends most of its time in a passive, unattended display state. The
switcher should not compete visually with the content.

No preference is given for the exact form of the switcher — this is
the designer's decision.

### 5.2 Tooltips

Station names are revealed on hover over a station's visual
representation. This is intended for staff on a desktop browser. It
does not need to be available on touch-only devices. Station names must
not appear in the default, no-interaction display state.

### 5.3 Auto-Refresh Indicator

The data refreshes automatically at a configurable interval (typically
every few seconds). The UI must provide a subtle, non-distracting
indication that a refresh is in progress or imminent. The current
implementation uses a thin progress bar at the top edge of the screen.
Whether this pattern is retained or replaced is the designer's choice,
as long as some feedback exists.

### 5.4 Scoreboard Trigger

The scoreboard panel can be opened and closed. The trigger for opening
it must be reachable from all views without navigating away. The exact
form and placement of this trigger is the designer's decision.

---

## 6. Display Environments

### Primary: Large display / projector

- Resolution: 1080p or higher, landscape orientation
- Viewers: standing at a distance, cannot interact, glance-and-read
- Data: refreshes automatically, continuously
- Interaction: none expected
- Legibility: must be readable at distance; avoid small text and
  visually thin elements

### Secondary: Desktop browser (staff)

- Resolution: standard laptop or desktop monitor
- Viewers: single person, seated, interactive
- Tooltips and hover states are meaningful in this context
- May open the scoreboard panel

### Tertiary: Mobile browser (supporters and participants)

- Resolution: phone or tablet, portrait orientation most likely
- Viewers: checking in occasionally, not continuous monitoring
- Touch interaction
- Content should reflow gracefully; no horizontal scrolling required

---

## 7. Visual Identity Constraints

These constraints are non-negotiable because they are driven by data,
not aesthetics:

- **Route colours are data.** Each route has a colour set by the event
  organiser (stored as a CSS colour string). This colour must be used
  as the primary identity marker for that route everywhere it appears.
  The designer may use the colour in various ways (fill, border, accent,
  label background, etc.) but must not replace it with an arbitrary
  palette choice.

- **Station order is meaningful.** The left-to-right (or equivalent
  primary reading direction) sequence of a route's stations represents
  real chronological order: earlier stations come first, later stations
  come last. This direction must not be reversed or randomised.

- **Station count varies per route.** Different routes in the same event
  may have different numbers of stations. The design must accommodate
  this without breaking or looking broken.

- **Team count varies per event.** Between 10 and 30 teams is typical.

---

## 8. Non-Goals for This Iteration

The following are explicitly out of scope:

- Map or geographic display of any kind
- Editing scores or advancing team states (that is the station-operator
  interface, a separate part of the application)
- Authentication or access control changes
- Historical data or event-to-event comparisons
- Push notifications or alerts
- Filtering, search, or personalised views within the dashboard
- Per-station score breakdown in the main progress views (scores appear
  only as team totals in the progress views and in the scoreboard panel)
- Printing or data export

---

## 9. Success Criteria

A viewer standing in front of the large display should be able to answer
the following questions within a few seconds, without any interaction:

1. Which team is furthest along their route right now?
2. Is any team currently at a station (checked in but not yet done)?
3. Has any team finished the entire event?
4. Which route has the most completed station visits overall?
5. Which team has the highest score so far?

Questions 1–4 must be answerable from the main display without opening
any panel. Question 5 must be answerable from the scoreboard panel.
