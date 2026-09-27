/* The 18 roadmap topics, in roadmap order, plus the orientation material. */
window.ROADMAP = [
  { n: "01", id: "arrays-hashing", title: "Arrays and Hashing", accent: "teal", time: "O(n)", aux: "O(n)", driver: "one pass, expected O(1) hash ops", ready: true },
  { n: "02", id: "two-pointers", title: "Two Pointers", accent: "sky", time: "O(n) after O(n log n) sort", aux: "O(1)", driver: "pointers only move inward" },
  { n: "03", id: "sliding-window", title: "Sliding Window", accent: "indigo", time: "O(n)", aux: "O(k)", driver: "each index enters and leaves once" },
  { n: "04", id: "stack", title: "Stack", accent: "violet", time: "O(n)", aux: "O(n)", driver: "each element pushed and popped once" },
  { n: "05", id: "binary-search", title: "Binary Search", accent: "purple", time: "O(log n)", aux: "O(1)", driver: "search space halves per step" },
  { n: "06", id: "linked-list", title: "Linked List", accent: "fuchsia", time: "O(n)", aux: "O(1)", driver: "pointer rewiring, no extra structure" },
  { n: "07", id: "trees", title: "Trees (DFS/BFS)", accent: "rose", time: "O(n)", aux: "O(h) / O(w)", driver: "each node visited once" },
  { n: "08", id: "tries", title: "Tries", accent: "red", time: "O(L) per op", aux: "O(A&middot;N&middot;L)", driver: "path length = key length" },
  { n: "09", id: "heap", title: "Heap / Priority Queue", accent: "orange", time: "O(n log k)", aux: "O(k)", driver: "log k per sift on a k-heap" },
  { n: "10", id: "backtracking", title: "Backtracking", accent: "amber", time: "O(branch^depth &middot; work)", aux: "O(depth)", driver: "size of the output/search tree" },
  { n: "11", id: "graphs", title: "Graphs (BFS/DFS)", accent: "yellow", time: "O(V+E)", aux: "O(V)", driver: "each vertex and edge scanned once" },
  { n: "12", id: "advanced-graphs", title: "Advanced Graphs", accent: "lime", time: "O(E log V)", aux: "O(V+E)", driver: "Dijkstra/MST heap operations" },
  { n: "13", id: "dp-1d", title: "1-D Dynamic Programming", accent: "green", time: "O(n &middot; transitions)", aux: "O(n) or O(1)", driver: "one state per index", practice: 9 },
  { n: "14", id: "dp-2d", title: "2-D Dynamic Programming", accent: "emerald", time: "O(n&middot;m)", aux: "O(n&middot;m) or O(min(n,m))", driver: "one state per index pair", practice: 9 },
  { n: "15", id: "greedy", title: "Greedy", accent: "teal", time: "O(n) or O(n log n)", aux: "O(1)", driver: "single scan, sort if ordering needed" },
  { n: "16", id: "intervals", title: "Intervals", accent: "cyan", time: "O(n log n)", aux: "O(n)", driver: "dominated by the sort" },
  { n: "17", id: "math-geometry", title: "Math and Geometry", accent: "sky", time: "O(n) to O(&radic;n)", aux: "O(1)", driver: "closed form or bounded divisor scan" },
  { n: "18", id: "bit-manipulation", title: "Bit Manipulation", accent: "blue", time: "O(n&middot;w) or O(n)", aux: "O(1)", driver: "w = word width, treated as 32/64" }
];

window.HOTPATH = {
  caption: "Constant-factor facts that change answers in interviews",
  head: ["Operation", "Cost", "Interview-relevant consequence"],
  rows: [
    ["<code>x in set</code> / <code>dict[k]</code>", "expected O(1)", "<code>x in list</code> is O(n); mixing them up turns O(n) into O(n&sup2;)"],
    ["<code>list.pop()</code> / <code>append</code>", "amortised O(1)", "<code>list.pop(0)</code> is O(n); use <code>collections.deque</code>"],
    ["<code>deque.popleft()</code>", "O(1)", "the only correct BFS/window queue"],
    ["<code>heapq.heappush/pop</code>", "O(log n)", "min-heap only; negate keys for a max-heap"],
    ["<code>sorted(x)</code>", "O(n log n), Timsort", "near-sorted input approaches O(n); stable"],
    ["<code>string +=</code> in a loop", "O(n&sup2;) worst case", "build a list and <code>&quot;&quot;.join</code>"],
    ["slicing <code>a[i:j]</code>", "O(j-i) copy", "a slice inside a loop silently adds a factor of n"],
    ["<code>int</code> arithmetic", "arbitrary precision", "no overflow, so bit tricks need explicit masking"],
    ["recursion", "default limit 1000", "deep DFS on a 10<sup>5</sup>-node path needs an explicit stack"]
  ],
  trap:
    "Two Python-specific facts that cause <em>wrong</em> answers rather than slow answers: negative operands make " +
    "<code>%</code> return a non-negative result (unlike C), and <code>-1 &gt;&gt; 1</code> is <code>-1</code> because " +
    "integers are conceptually infinite two&rsquo;s-complement. Both matter in topics 17 and 18."
};

window.PROTOCOL = [
  "Restate the problem and pin the constraints.",
  "Name the pattern and the invariant out loud.",
  "State the complexity before writing any code.",
  "Code it.",
  "Walk one small example as a trace &mdash; exactly the style of the dry runs here.",
  "Enumerate the edge cases unprompted."
];
