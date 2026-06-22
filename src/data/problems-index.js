// Aggregator: imports all topic files, exports a single PROBLEMS array
// plus lookup indices (BY_ID, BY_TOPIC).

import { ARRAYS_PROBLEMS } from './problems-arrays'
import { STRINGS_PROBLEMS } from './problems-strings'
import { TREES_PROBLEMS } from './problems-trees'
import { TREES_PROBLEMS_2 } from './problems-trees-2'
import { DP_PROBLEMS } from './problems-dp'
import { DP_PROBLEMS_2 } from './problems-dp-2'
import { DP_PROBLEMS_3 } from './problems-dp-3'
import { LINKEDLIST_PROBLEMS } from './problems-linkedlist'
import { LINKEDLIST_PROBLEMS_2 } from './problems-linkedlist-2'
import { STACK_PROBLEMS } from './problems-stack'
import { STACK2_PROBLEMS } from './problems-stack-2'
import { GRAPHS_PROBLEMS } from './problems-graphs'
import { GRAPHS_PROBLEMS_2 } from './problems-graphs-2'
import { GREEDY_PROBLEMS } from './problems-greedy'
import { BITMANIP_PROBLEMS } from './problems-bitmanip'
import { MATH_PROBLEMS } from './problems-math'
import { TWOPOINTERS_PROBLEMS } from './problems-two-pointers'
import { SLIDINGWINDOW_PROBLEMS } from './problems-sliding-window'
import { INTERVALS_PROBLEMS } from './problems-intervals'
import { HEAPS_PROBLEMS } from './problems-heaps'
import { TRIES_PROBLEMS } from './problems-tries'
import { BACKTRACKING_PROBLEMS } from './problems-backtracking'

export const PROBLEMS = [
  ...ARRAYS_PROBLEMS,
  ...STRINGS_PROBLEMS,
  ...TREES_PROBLEMS,
  ...TREES_PROBLEMS_2,
  ...DP_PROBLEMS,
  ...DP_PROBLEMS_2,
  ...DP_PROBLEMS_3,
  ...LINKEDLIST_PROBLEMS,
  ...LINKEDLIST_PROBLEMS_2,
  ...STACK_PROBLEMS,
  ...STACK2_PROBLEMS,
  ...GRAPHS_PROBLEMS,
  ...GRAPHS_PROBLEMS_2,
  ...GREEDY_PROBLEMS,
  ...BITMANIP_PROBLEMS,
  ...MATH_PROBLEMS,
  ...TWOPOINTERS_PROBLEMS,
  ...SLIDINGWINDOW_PROBLEMS,
  ...INTERVALS_PROBLEMS,
  ...HEAPS_PROBLEMS,
  ...TRIES_PROBLEMS,
  ...BACKTRACKING_PROBLEMS,
]

export const PROBLEMS_BY_ID = Object.fromEntries(PROBLEMS.map(p => [p.id, p]))
export const PROBLEMS_BY_TOPIC = PROBLEMS.reduce((acc, p) => {
  (acc[p.topic] = acc[p.topic] || []).push(p)
  return acc
}, {})

export const TOTAL_PROBLEMS = PROBLEMS.length

export function statsByDifficulty(problems = PROBLEMS) {
  const stats = { Easy: 0, Medium: 0, Hard: 0 }
  for (const p of problems) stats[p.difficulty]++
  return stats
}