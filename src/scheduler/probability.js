// Analyzes calendar event history and returns schedule suggestions
// based on frequency and time-of-day patterns.

/**
 * Count how often each (dayOfWeek, hourBucket) pair appears in history.
 * dayOfWeek: 0 (Sun) – 6 (Sat)
 * hourBucket: 0–23
 */
export function buildFrequencyMap(events) {
  const map = {}; // key: "day-hour" -> { count, titles: [] }

  for (const event of events) {
    const date = new Date(event.start);
    const key = `${date.getDay()}-${date.getHours()}`;
    if (!map[key]) map[key] = { count: 0, titles: [] };
    map[key].count++;
    map[key].titles.push(event.title);
  }

  return map;
}

/**
 * Given a frequency map, return the top N (day, hour) slots by count.
 * These are the "high probability" windows the user tends to be busy.
 */
export function getTopSlots(freqMap, topN = 10) {
  return Object.entries(freqMap)
    .map(([key, data]) => {
      const [day, hour] = key.split("-").map(Number);
      return { day, hour, count: data.count, titles: data.titles };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

/**
 * Score a candidate time slot (Date object) against the frequency map.
 * Returns a 0–1 probability score.
 */
export function scoreSlot(date, freqMap, maxCount) {
  const key = `${date.getDay()}-${date.getHours()}`;
  const entry = freqMap[key];
  if (!entry || maxCount === 0) return 0;
  return entry.count / maxCount;
}

/**
 * Build suggestions for the next `days` days (default 14).
 * Returns an array of suggested slots sorted by probability descending.
 *
 * @param {Array} events - raw calendar event objects with { title, start, end }
 * @param {number} days  - lookahead window
 */
export function generateSuggestions(events, days = 14) {
  if (!events.length) return [];

  const freqMap = buildFrequencyMap(events);
  const maxCount = Math.max(...Object.values(freqMap).map((v) => v.count));

  const suggestions = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    for (let h = 7; h <= 21; h++) { // only suggest waking hours
      const candidate = new Date(now);
      candidate.setDate(now.getDate() + d);
      candidate.setHours(h, 0, 0, 0);

      const score = scoreSlot(candidate, freqMap, maxCount);
      if (score > 0) {
        suggestions.push({ date: new Date(candidate), score });
      }
    }
  }

  return suggestions.sort((a, b) => b.score - a.score);
}

function toInterval(dateStr, startStr, endStr, fallbackMinutes, title) {
  if (!dateStr) return null;
  // dateStr may already be a full ISO timestamp from the DB
  // (e.g. "2026-07-28T04:00:00.000Z") — strip it down to "YYYY-MM-DD" before
  // gluing on a time, otherwise the result is a silently-Invalid Date and
  // every conflict/overlap check against it just returns false.
  const dateOnly = String(dateStr).slice(0, 10);
  const start = new Date(`${dateOnly}T${startStr || "00:00"}`);
  const end = endStr
    ? new Date(`${dateOnly}T${endStr}`)
    : new Date(start.getTime() + fallbackMinutes * 60000);
  return { start, end, title: title || "" };
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

// Loose match in either direction, case-insensitive — "gym" matches "Go to
// the gym", and "go to the gym" would also match a history entry titled
// just "gym".
function titlesMatch(a, b) {
  if (!a || !b) return false;
  return a.includes(b) || b.includes(a);
}

/**
 * Find open (conflict-free) slots across real events + scheduled/reminder tasks.
 *
 * Ranking: if `title` is given and matches past events/tasks by name (e.g.
 * "gym" matching "Go to the gym"), suggestions are ranked by when *that*
 * activity has actually happened before — so a recurring weekday-morning gym
 * habit gets recommended weekday mornings. Without a name match, it falls
 * back to the general pattern: open slots outside the user's typical busy
 * hours are ranked higher. With no history at all, every open slot ranks
 * equally (by soonest) instead of being scored against nothing.
 *
 * @param {Array} events - { date, startTime, endTime, title } event objects
 * @param {Array} tasks  - { date, time, type, title } task objects
 * @param {string} title - the title of the event/task being scheduled
 * @param {string} date  - optional "YYYY-MM-DD"; if given, only that day is
 *                         searched instead of the whole `days` lookahead window
 * @param {number} [durationMinutes] - how long the new event should be. If
 *                         omitted, it's inferred from the average length of
 *                         title-matched past events (falling back to 60
 *                         minutes if there's no match to learn from).
 */
export function findOpenSlots({
  events = [],
  tasks = [],
  title = "",
  date = "",
  durationMinutes,
  days = 14,
  startHour = 6,
  endHour = 21,
  limit = 5,
}) {
  const now = new Date();

  // Everything that can block a candidate slot — past or future.
  const busy = [
    ...events.map((e) => toInterval(e.date, e.startTime, e.endTime, 60, e.title)),
    ...tasks
      .filter((t) => t.date && (t.type === "reminder" || t.type === "scheduled"))
      .map((t) => toInterval(t.date, t.time, null, 30, t.title)),
  ].filter(Boolean);

  // History = only what's already happened — used to learn the user's
  // typical pattern, kept separate from upcoming commitments so the score
  // reflects actual past behavior, not just whatever's already on the books.
  const history = busy.filter((b) => b.start < now);

  const needle = title.trim().toLowerCase();
  const matched = needle
    ? history.filter((h) => titlesMatch(h.title.toLowerCase(), needle))
    : [];
  const useMatch = matched.length > 0;

  const freqMap = buildFrequencyMap((useMatch ? matched : history).map((b) => ({ start: b.start })));
  const counts = Object.values(freqMap).map((v) => v.count);
  const maxCount = counts.length ? Math.max(...counts) : 0;
  const hasPattern = maxCount > 0;

  // Duration: respect an explicit value if the caller gave one; otherwise
  // learn it from how long the matched past occurrences actually ran.
  let effectiveDuration = durationMinutes;
  if (!effectiveDuration) {
    if (useMatch) {
      const pastDurations = matched
        .map((m) => (m.end - m.start) / 60000)
        .filter((mins) => mins > 0);
      effectiveDuration = pastDurations.length
        ? Math.round(pastDurations.reduce((sum, mins) => sum + mins, 0) / pastDurations.length)
        : 60;
    } else {
      effectiveDuration = 60;
    }
  }

  // If a specific date was given, search only that day; otherwise sweep the
  // whole lookahead window starting today.
  const searchDates = date
    ? [new Date(`${date}T00:00`)]
    : Array.from({ length: days }, (_, d) => {
        const d0 = new Date(now);
        d0.setDate(now.getDate() + d);
        return d0;
      });

  const candidates = [];

  for (const dayDate of searchDates) {
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 15) {
        const start = new Date(dayDate);
        start.setHours(h, m, 0, 0);
        if (start < now) continue;

        const end = new Date(start.getTime() + effectiveDuration * 60000);
        const conflict = busy.some((b) => overlaps(start, end, b.start, b.end));
        if (conflict) continue;

        let score;
        if (!hasPattern) {
          score = 0.5; // no signal either way
        } else if (useMatch) {
          score = scoreSlot(start, freqMap, maxCount); // prefer times this activity usually happens
        } else {
          score = 1 - scoreSlot(start, freqMap, maxCount); // prefer times outside the general busy pattern
        }

        candidates.push({ date: start, durationMinutes: effectiveDuration, score });
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.date - b.date)
    .slice(0, limit);
}
