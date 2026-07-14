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

function toInterval(dateStr, startStr, endStr, fallbackMinutes) {
  if (!dateStr) return null;
  const start = new Date(`${dateStr}T${startStr || "00:00"}`);
  const end = endStr
    ? new Date(`${dateStr}T${endStr}`)
    : new Date(start.getTime() + fallbackMinutes * 60000);
  return { start, end };
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Find open (conflict-free) slots across real events + scheduled/reminder tasks,
 * ranked to prefer times outside the user's habitual busy pattern.
 *
 * @param {Array} events - { date, startTime, endTime } event objects
 * @param {Array} tasks  - { date, time, type } task objects
 */
export function findOpenSlots({
  events = [],
  tasks = [],
  durationMinutes = 60,
  days = 14,
  startHour = 7,
  endHour = 21,
  limit = 5,
}) {
  const busy = [
    ...events.map((e) => toInterval(e.date, e.startTime, e.endTime, 60)),
    ...tasks
      .filter((t) => t.date && (t.type === "reminder" || t.type === "scheduled"))
      .map((t) => toInterval(t.date, t.time, null, 30)),
  ].filter(Boolean);

  const freqMap = buildFrequencyMap(busy.map((b) => ({ start: b.start, title: "" })));
  const counts = Object.values(freqMap).map((v) => v.count);
  const maxCount = counts.length ? Math.max(...counts) : 0;

  const now = new Date();
  const candidates = [];

  for (let d = 0; d < days; d++) {
    for (let h = startHour; h <= endHour; h++) {
      for (let m = 0; m < 60; m += 30) {
        const start = new Date(now);
        start.setDate(now.getDate() + d);
        start.setHours(h, m, 0, 0);
        if (start < now) continue;

        const end = new Date(start.getTime() + durationMinutes * 60000);
        const conflict = busy.some((b) => overlaps(start, end, b.start, b.end));
        if (conflict) continue;

        const busyScore = maxCount ? scoreSlot(start, freqMap, maxCount) : 0;
        candidates.push({ date: start, durationMinutes, score: 1 - busyScore });
      }
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.date - b.date)
    .slice(0, limit);
}
