export const TOPICS = [
  { key: 'arrays',            name: 'Arrays & Hashing',     color: '#7ee787', icon: '📦', order: 1 },
  { key: 'two-pointers',      name: 'Two Pointers',         color: '#56d364', icon: '👉', order: 2 },
  { key: 'sliding-window',    name: 'Sliding Window',       color: '#a5d6ff', icon: '🪟', order: 3 },
  { key: 'stack',             name: 'Stack',                color: '#d2a8ff', icon: '📚', order: 4 },
  { key: 'intervals',         name: 'Intervals',            color: '#ffa657', icon: '⏱️', order: 5 },
  { key: 'linkedlist',        name: 'Linked List',          color: '#ff7b72', icon: '🔗', order: 6 },
  { key: 'trees',             name: 'Trees',                color: '#7ee787', icon: '🌳', order: 7 },
  { key: 'tries',             name: 'Tries',                color: '#d2a8ff', icon: '🔤', order: 8 },
  { key: 'heaps',             name: 'Heaps',                color: '#ffa657', icon: '⛰️', order: 9 },
  { key: 'backtracking',      name: 'Backtracking',         color: '#ff7b72', icon: '↩️', order: 10 },
  { key: 'greedy',            name: 'Greedy',               color: '#56d364', icon: '💰', order: 11 },
  { key: 'graphs',            name: 'Graphs',               color: '#a5d6ff', icon: '🕸️', order: 12 },
  { key: 'dp',                name: 'Dynamic Programming',  color: '#d2a8ff', icon: '🧠', order: 13 },
  { key: 'bitmanip',          name: 'Bit Manipulation',     color: '#7ee787', icon: '🔢', order: 14 },
  { key: 'math',              name: 'Math & Geometry',      color: '#56d364', icon: '📐', order: 15 },
  { key: 'strings',           name: 'Strings',              color: '#ffa657', icon: '✍️', order: 16 },
]

export const TOPICS_BY_KEY = Object.fromEntries(TOPICS.map(t => [t.key, t]))

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
export const DIFFICULTY_COLORS = {
  Easy: '#3fb950',
  Medium: '#d29922',
  Hard: '#f85149',
}