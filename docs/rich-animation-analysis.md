# Rich Animation Analysis — Dashboard Phase 2

**Document type:** Technical analysis
**Audience:** Frontend engineers
**Scope:** Animation upgrade path for the event progress dashboard
**Prerequisite:** Phase 1 (SVG segment track implementation) complete
**Line width:** ≤ 80 characters

---

## 1. Scope

Phase 1 of the dashboard overhaul introduces per-station segment tracks
rendered as inline SVG, with CSS transitions for fill and colour
changes. This document analyses the options for a richer animation
layer in a subsequent iteration.

The animations under consideration are:

1. A **moving indicator** showing a team's current station in real time
2. A **pulse or glow effect** on segments in the `arrived` state
3. **Entrance / exit transitions** as teams move between sections
   (active → finished)
4. **Score counter animation** when a score value changes

---

## 2. Current Phase 1 Baseline

Phase 1 uses only CSS transitions applied to SVG `<rect>` elements:

```css
rect.segment {
  transition: fill 0.4s ease, width 0.5s ease;
}
```

And Vue `<TransitionGroup>` for team row reordering:

```css
.team-row-move {
  transition: transform 0.5s ease;
}
.team-row-enter-active {
  transition: opacity 0.3s ease;
}
.team-row-leave-active {
  transition: opacity 0.3s ease;
}
```

This is sufficient for Phase 1. The following sections address what
changes and what new dependencies are needed for Phase 2.

---

## 3. Animation Catalogue

### 3.1 Moving Position Indicator

**Goal:** A small marker (dot, chevron, or similar) sits on top of the
segment that corresponds to the team's current station — the rightmost
`finished` segment or the `arrived` segment if one exists. When the
state updates, the marker glides smoothly to its new position.

**Implementation approach with SVG:**

```
Track:  [■■■■▣░░░░░]
              ↑
         marker: x position interpolated via JS
```

The marker is an additional SVG element (`<circle>` or `<polygon>`)
whose `cx` (or `x`) attribute is animated from its previous value to
the new value on each data refresh.

CSS transitions cannot animate SVG positional attributes set via
JavaScript in all browsers reliably. A JS-driven approach is required:

- **Web Animations API (WAAPI):**

  ```js
  markerEl.animate(
    [
      { transform: `translateX(${prev}px)` },
      { transform: `translateX(${next}px)` }
    ],
    { duration: 600, easing: 'ease-out', fill: 'forwards' }
  )
  ```

  No additional dependency. Available in all modern browsers.
  Performant (compositor-thread animation where possible).

- **GSAP `gsap.to()`:**
  ```js
  gsap.to(markerEl, { x: next, duration: 0.6, ease: 'power2.out' })
  ```
  Requires the GSAP package (~30 kB min+gzip for core).
  Handles interrupted animations (`.to()` on an already-animating
  element) more gracefully than raw WAAPI out of the box.

**Recommendation for this use case:** WAAPI is sufficient. The marker
moves only when data refreshes (every few seconds), so interrupted
mid-animation transitions are rare. No additional dependency needed.

---

### 3.2 Pulse / Glow Effect on `arrived` Segments

**Goal:** Segments in the `arrived` state draw the eye — they represent
teams actively at a checkpoint right now. A subtle repeating animation
(opacity pulse, brightness oscillation, or outer glow) communicates
liveness without being distracting.

**CSS keyframe approach (no JS dependency):**

```css
@keyframes arrived-pulse {
  0%,
  100% {
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    opacity: 0.65;
    filter: brightness(1.4);
  }
}

rect.segment--arrived {
  animation: arrived-pulse 2s ease-in-out infinite;
}
```

This is the simplest approach and has zero runtime cost beyond the
animation itself. Vue adds/removes the `--arrived` class reactively
when state changes.

**Limitation:** `filter: brightness()` on many SVG elements
simultaneously can cause paint-layer promotion overhead in some
browsers. For ≤ 30 teams × ≤ 20 stations, this is well within safe
bounds.

**Alternative — SVG `<animate>` element:**

```svg
<rect ...>
  <animate attributeName="opacity"
    values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
</rect>
```

Declarative, no JS, compositor-friendly. Less flexible for dynamic
start/stop (must manipulate the `<animate>` element directly to pause).

**Recommendation:** CSS keyframe on a class toggle. Simple, reactive,
no dependencies, easy to tune.

---

### 3.3 Entrance / Exit Transitions (Team Row Reordering)

**Goal:** When a team crosses from the active section to the finished
section (or changes rank within a section), the row movement should be
perceivable rather than an abrupt jump.

**Phase 1 baseline** (Vue `<TransitionGroup>` + CSS) already handles
this for simple enter/leave. The gap in Phase 1 is **FLIP-style
reordering** — when a team moves up the ranking within the active list,
its row should animate to its new vertical position rather than snap.

Vue `<TransitionGroup>` provides the `move` class hook which enables
FLIP automatically:

```css
.team-list-move {
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

This works well for small lists (≤ 30 rows). For smooth FLIP on larger
lists or when combined with other animations, **AutoAnimate** is worth
considering:

```js
import autoAnimate from '@formkit/auto-animate'
// applied to the parent container ref
autoAnimate(containerRef.value)
```

AutoAnimate (~3 kB min+gzip) wraps WAAPI internally, handles FLIP
reordering with minimal configuration, and is Vue-compatible via a
composable (`@formkit/auto-animate/vue`).

**Recommendation:** Start with Vue `<TransitionGroup>` move class.
Upgrade to AutoAnimate if reordering feels janky at event scale or
when combined with the pulse animation.

---

### 3.4 Score Counter Animation

**Goal:** When a team's total score updates after a data refresh, the
displayed number counts up (or down) smoothly from the previous value
to the new value rather than snapping.

**Lightweight JS approach (no dependency):**

```ts
function animateCounter(
  el: HTMLElement,
  from: number,
  to: number,
  duration = 800
) {
  const start = performance.now()
  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1)
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t // ease-in-out
    el.textContent = String(Math.round(from + (to - from) * ease))
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
```

~15 lines, no dependency. Works well for the refresh cadence.

**Alternative — `@vueuse/core` `useTransition`:**

```ts
import { useTransition, TransitionPresets } from '@vueuse/core'
const displayScore = useTransition(score, {
  duration: 800,
  transition: TransitionPresets.easeInOut
})
```

VueUse is likely already a project dependency or is a low-friction add.
This is the cleanest Vue-idiomatic solution.

**Recommendation:** Use `@vueuse/core` `useTransition` if VueUse is
already in the project, otherwise use the inline `animateCounter`
utility — avoid adding a large dependency for this feature alone.

---

## 4. SVG vs Canvas — Threshold Analysis

The Phase 1 SVG approach will remain performant within the expected
event scale. The following table estimates the boundary at which SVG
starts to degrade:

| Metric                      | SVG comfortable | SVG degraded | Canvas preferred |
| --------------------------- | --------------- | ------------ | ---------------- |
| Animated elements (rects)   | < 600           | 600–2 000    | > 2 000          |
| Simultaneous CSS animations | < 30            | 30–100       | > 100            |
| Refresh rate (data + DOM)   | ≥ 1 s interval  | 200–500 ms   | < 200 ms         |
| Teams × stations            | ≤ 30 × 20 = 600 | up to ~2 000 | beyond           |

At maximum expected scale (30 teams × 20 stations = 600 segments), SVG
with CSS animations remains well within the comfortable range, even
with pulse effects on multiple `arrived` segments simultaneously.

**Canvas migration is not recommended for Phase 2.** It would be
warranted only if:

- The event scale grows beyond ~50 teams, or
- A sub-second data push cadence (WebSocket real-time) is introduced
  and DOM reconciliation becomes a bottleneck, or
- Complex per-frame particle effects are required

---

## 5. Library Comparison

| Library            | Size (min+gz) | Use case fit     | Notes                        |
| ------------------ | ------------- | ---------------- | ---------------------------- |
| Web Animations API | 0 kB (native) | Position marker  | All modern browsers; no dep  |
| CSS keyframes      | 0 kB (native) | Pulse/glow       | Simplest; compositor-thread  |
| AutoAnimate        | ~3 kB         | Row reordering   | Zero-config FLIP; Vue plugin |
| @vueuse/core       | ~15 kB        | Score counter    | Likely already a dep         |
| GSAP (core)        | ~30 kB        | All of the above | Most powerful; licence cost  |
| Anime.js           | ~17 kB        | All of the above | MIT; good SVG support        |
| Motion One         | ~18 kB        | All of the above | WAAPI wrapper; tree-shakable |

### When to reach for GSAP

GSAP is the right choice when:

- Multiple animations must be orchestrated in a timeline (e.g. a
  sequence of effects when a team finishes the event)
- Interrupted animations need guaranteed smooth reversal
- Morphing between SVG path shapes is required

GSAP is overkill when animations are independent, state-driven, and
triggered by data refresh rather than user interaction.

### When to reach for Anime.js or Motion One

Both are MIT-licensed and lighter than GSAP. Motion One is the most
future-proof as it is a thin wrapper over the native WAAPI. Either is
a reasonable choice if a unified animation API across all Phase 2
effects is preferred over the mix-and-match approach above.

---

## 6. Recommended Phase 2 Implementation Plan

Given the analysis above, the recommended approach avoids adding a
large animation dependency and instead composes native browser
capabilities:

| Effect                   | Approach                     | Dependency |
| ------------------------ | ---------------------------- | ---------- |
| Position marker movement | Web Animations API           | none       |
| Arrived segment pulse    | CSS `@keyframes` + class     | none       |
| Team row reordering      | Vue TransitionGroup (move)   | none       |
| Score counter            | `@vueuse/core` useTransition | vueuse     |

If, after implementation, the row reordering feels insufficient,
replace the TransitionGroup move CSS with AutoAnimate (~3 kB add).

If a coordinated "team finished" celebration sequence is later
requested (e.g. confetti + label swap + row slide), introduce Motion
One at that point as the single animation primitive for all effects.

---

## 7. Open Questions for Phase 2 Kickoff

1. Is Pusher / WebSocket already wired to deliver real-time state
   changes, or will the dashboard continue to poll? Real-time push
   changes the animation trigger model (event-driven vs diff-on-refresh)
   and is the main reason to reconsider Canvas earlier than the scale
   threshold suggests.

2. Is `@vueuse/core` already a project dependency? If yes, `useTransition`
   for score counters is essentially free.

3. Should the "team finished" moment be celebrated with a more prominent
   visual event (e.g. a brief highlight, a sound cue)? This would
   strengthen the case for an orchestration library like Motion One.
