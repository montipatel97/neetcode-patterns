/* Topic content, transcribed from the Binary Search chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["binary-search"] = {
  id: "binary-search",
  number: "05",
  title: "Binary Search",
  subtitle: "Boundary search on a monotone predicate, rotated arrays, and search on the answer",
  accent: "purple",
  bounds: { time: "O(log n)", space: "O(1)", driver: "search space halves per step" },

  mechanics: {
    lede:
      "Binary search is not about sorted arrays. It is about a <strong>monotone predicate</strong>: a boolean function " +
      "that is False, False, &hellip;, False, True, True, &hellip;, True over the search space, with the algorithm " +
      "finding the flip point. A sorted array is just the special case where " +
      "<code>pred(i) = (a[i] &ge; target)</code> happens to be monotone. Internalising this generalisation is what " +
      "unlocks <em>binary search on the answer</em>, which is where the hard problems in this topic live.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Exact search, inclusive bounds",
        blurb: "The classic form. Both updates skip <code>mid</code>, because <code>mid</code> has been proven unequal.",
        caption: "[lo, hi] both inclusive",
        code: [
          "def search(a, target):",
          "    lo, hi = 0, len(a) - 1     # both inclusive",
          "    while lo <= hi:",
          "        mid = (lo + hi) // 2",
          "        if a[mid] == target:",
          "            return mid",
          "        if a[mid] < target:",
          "            lo = mid + 1       # updates SKIP mid",
          "        else:",
          "            hi = mid - 1",
          "    return -1"
        ],
        invariant:
          "If <code>target</code> occurs in <code>a</code>, it occurs in <code>a[lo..hi]</code>. Initialisation makes " +
          "the range the whole array; each branch discards only elements proven unequal to target; termination with " +
          "<code>lo &gt; hi</code> means the range is empty, so target is absent."
      },
      {
        tag: "Mechanism B",
        name: "Boundary search (lower bound), half-open bounds",
        blurb:
          "<strong>This is the form to memorise</strong>, because it answers &ldquo;first index satisfying P&rdquo; and " +
          "every other variant reduces to it.",
        caption: "Leftmost index where pred is True; returns len(a) if never",
        code: [
          "def lower_bound(a, target):",
          "    lo, hi = 0, len(a)         # hi is EXCLUSIVE",
          "    while lo < hi:",
          "        mid = (lo + hi) // 2",
          "        if a[mid] < target:    # pred(mid) is False",
          "            lo = mid + 1",
          "        else:                  # pred(mid) is True",
          "            hi = mid           # keep mid as a candidate",
          "    return lo                  # lo == hi == boundary"
        ],
        invariant:
          "<code>pred</code> is False for every index <code>&lt; lo</code> and True for every index <code>&ge; hi</code>. " +
          "The boundary is always inside <code>[lo, hi]</code>, and the interval shrinks strictly, so the loop exits " +
          "with <code>lo == hi</code> equal to the boundary. <em>Nothing is returned from inside the loop</em> &mdash; " +
          "that absence is the feature, because it removes the &ldquo;did I check the last element?&rdquo; class of bug."
      },
      {
        tag: "Mechanism C",
        name: "Binary search on the answer (parametric search)",
        blurb:
          "When the prompt asks to minimise a maximum (or maximise a minimum) and you can check a candidate answer in " +
          "O(n), search the <em>answer space</em> instead of the input.",
        caption: "Template: smallest feasible k",
        code: [
          "def min_feasible(lo, hi, feasible):",
          "    while lo < hi:",
          "        mid = (lo + hi) // 2",
          "        if feasible(mid):",
          "            hi = mid",
          "        else:",
          "            lo = mid + 1",
          "    return lo"
        ],
        invariant:
          "<code>feasible</code> is monotone: once true it stays true for larger candidates. <code>lo</code> is always a " +
          "lower bound on the answer and <code>hi</code> an upper bound that is known feasible (or the sentinel " +
          "maximum). The whole design work is (1) choosing the answer interval and (2) <em>proving monotonicity</em> of " +
          "<code>feasible</code>."
      },
      {
        tag: "Mechanism D",
        name: "Rotated sorted array",
        blurb:
          "A rotated array is two sorted runs. At each step, identify which half is internally sorted by comparing " +
          "<code>a[lo]</code> with <code>a[mid]</code>, then test whether the target lies inside that half&rsquo;s " +
          "range. If yes, recurse into it; otherwise recurse into the other half, which must contain the rotation point.",
        caption: null,
        code: null,
        invariant: null
      }
    ],
    aside: {
      title: "Termination: why the mid rounding must match the update",
      body:
        "With <code>mid = (lo + hi) // 2</code> and <code>lo &lt; hi</code>, we have " +
        "<code>lo &le; mid &lt; hi</code>. Therefore <code>hi = mid</code> strictly decreases hi, and " +
        "<code>lo = mid + 1</code> strictly increases lo. But if you pair the <em>lower</em> mid with the update " +
        "<code>lo = mid</code>, then when <code>hi == lo + 1</code> you get <code>mid == lo</code> and the interval " +
        "never changes &mdash; an infinite loop. <strong>The rule:</strong> <code>lo = mid</code> requires the upper " +
        "mid <code>(lo + hi + 1) // 2</code>; <code>hi = mid</code> requires the lower mid. Pairing them the other way " +
        "is the single most common way to hang a binary search."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness by loop invariant",
        sub: "mechanism B",
        body:
          "<p><strong>Initialisation.</strong> With <code>lo = 0, hi = n</code>, the claim &ldquo;False below lo, True " +
          "at or above hi&rdquo; is vacuous on both sides, hence true.</p>" +
          "<p><strong>Maintenance.</strong> If <code>pred(mid)</code> is False, monotonicity gives " +
          "<code>pred(j)</code> False for all <code>j &le; mid</code>, so setting <code>lo = mid + 1</code> preserves " +
          "the left half of the claim. If <code>pred(mid)</code> is True, monotonicity gives True for all " +
          "<code>j &ge; mid</code>, so <code>hi = mid</code> preserves the right half.</p>" +
          "<p><strong>Termination.</strong> The interval length <code>hi - lo</code> strictly decreases, so the loop " +
          "ends with <code>lo == hi</code>; at that point everything below is False and everything at or above is True, " +
          "which is exactly the definition of the boundary. <em>No case analysis on &ldquo;found it&rdquo; is " +
          "required.</em></p>"
      },
      {
        title: "Complexity proof",
        sub: "halving, and the information bound",
        body:
          "<p><strong>Time.</strong> Let <code>S_k</code> be the interval length after k iterations. Each iteration " +
          "replaces the interval by one of its halves, so <code>S_{k+1} &le; ceil(S_k / 2)</code>, giving " +
          "<code>S_k &le; n / 2^k</code>. The loop stops when <code>S_k &le; 1</code>, i.e. when " +
          "<code>2^k &ge; n</code>, so <code>k &le; ceil(log2 n) + 1</code>. Each iteration does O(1) work: " +
          "<strong>O(log n)</strong>. For binary search on the answer with an O(n) feasibility check, the total is " +
          "<code>O(n log(hi - lo))</code> &mdash; note the log is over the <em>value range</em>, not over n.</p>" +
          "<p><strong>Lower bound.</strong> Each comparison yields at most one bit of information, and there are " +
          "<code>n + 1</code> possible outcomes (n positions plus &ldquo;absent&rdquo;), so any comparison-based " +
          "algorithm needs at least <code>log2(n + 1)</code> comparisons in the worst case. Binary search matches this, " +
          "so it is <em>optimal</em>, not merely fast.</p>" +
          "<p><strong>Space.</strong> O(1) iteratively; the recursive formulation costs O(log n) stack frames. Prefer " +
          "iterative in interviews &mdash; it is shorter and has no depth caveat.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Note"],
      rows: [
        ["Exact search, sorted", "O(log n)", "O(1)", "optimal by the information bound"],
        ["Lower / upper bound", "O(log n)", "O(1)", "handles duplicates without extra passes"],
        ["Count of a value", "O(log n)", "O(1)", "<code>upper_bound - lower_bound</code>"],
        ["Rotated array, distinct values", "O(log n)", "O(1)", "one extra comparison per step"],
        ["Rotated array with duplicates", "O(n) worst case", "O(1)", "<code>a[lo] == a[mid]</code> is undecidable, must step in"],
        ["Search on the answer", "O(n log R)", "O(1)", "R = size of the value range"],
        ["2D sorted matrix, flattened", "O(log(n&middot;m))", "O(1)", "index math <code>divmod(mid, m)</code>"],
        ["2D staircase search", "O(n + m)", "O(1)", "not binary search; start at a corner"],
        ["Median of two sorted arrays", "O(log min(n,m))", "O(1)", "binary search on the partition point"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "The tell for <strong>binary search on the answer</strong> is a superlative plus a budget: <em>minimise the " +
        "largest, maximise the smallest, smallest capacity/speed/size such that it fits in D days / K bins / H " +
        "hours</em>. Ask yourself: &ldquo;given a candidate answer, can I verify it in one linear pass?&rdquo; If yes, " +
        "and verification is monotone in the candidate, binary search the candidate space. This converts an " +
        "intractable-looking optimisation into a loop plus a checker, and it is the single highest-yield recognition in " +
        "this topic."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["sorted array, find one target or a boundary", "binary search", "hashing cannot answer &ldquo;first element &ge; x&rdquo;"],
      ["unsorted, exact membership only", "hash set <span class='topic-ref'>topic 01</span>", "O(1) beats O(log n), and no sort is needed"],
      ["sorted, find a pair with a given sum", "two pointers <span class='topic-ref'>topic 02</span>", "n binary searches cost O(n log n) vs O(n)"],
      ["&ldquo;minimise the maximum&rdquo; with an O(n) checker", "binary search on the answer", "greedy alone cannot prove optimality of the bound"],
      ["monotone-looking function, find a peak", "binary search on the local slope", "no total order needed, only unimodality"],
      ["rotated / shifted sorted input", "binary search with a sortedness test", "plain comparison to <code>a[mid]</code> is not monotone"],
      ["matrix sorted rows and columns only", "staircase walk from a corner, O(n+m)", "rows are not globally ordered, so binary search is invalid"],
      ["matrix sorted as one flattened list", "binary search with <code>divmod</code>", "the staircase walk is slower here"],
      ["k-th smallest in a sorted matrix / range", "binary search on the value + counting", "a heap is O(k log k) and worse for large k"],
      ["need every element&rsquo;s rank", "sort once as a pre-pass", "repeated searches beat repeated sorts only if the data is static"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty array", "<code>hi = len(a) - 1 = -1</code>; <code>while lo &le; hi</code> is safely false, but <code>lo &lt; hi</code> forms must not index <code>a[mid]</code> before the check"],
      ["target smaller than everything", "<code>lower_bound</code> returns 0; an exact-search form must still return -1, not 0"],
      ["target larger than everything", "<code>lower_bound</code> returns <code>len(a)</code> &mdash; callers must test that before indexing"],
      ["duplicates of the target", "exact search returns an arbitrary occurrence; if the prompt says &ldquo;first&rdquo; you need <code>lower_bound</code>"],
      ["<code>lo = mid</code> with the lower mid", "infinite loop whenever <code>hi == lo + 1</code>"],
      ["<code>while lo &le; hi</code> paired with <code>hi = mid</code>", "infinite loop; inclusive bounds require <code>mid - 1</code>"],
      ["answer space starting at 0 (Koko, capacity)", "<code>ceil(p / 0)</code> raises <code>ZeroDivisionError</code>; start <code>lo</code> at 1"],
      ["answer-space upper bound too small", "the search converges to an infeasible value silently; use <code>max(piles)</code> or <code>sum(weights)</code>"],
      ["non-monotone <code>feasible</code>", "the returned boundary is meaningless; verify monotonicity explicitly before coding"],
      ["rotated array with duplicates (<code>[1,1,1,0,1]</code>)", "<code>a[lo] == a[mid]</code> cannot identify the sorted half; must advance <code>lo</code> by 1, degrading to O(n)"],
      ["<code>(lo + hi)</code> overflow", "irrelevant in Python; in C++/Java use <code>lo + (hi - lo) // 2</code>, and say so"],
      ["float answer space", "<code>lo &lt; hi</code> never terminates on reals; run a fixed 100 iterations or use an epsilon"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Inclusive bounds with an exclusive-style update",
      wrong: [
        "lo, hi = 0, len(a) - 1",
        "while lo <= hi:",
        "    mid = (lo + hi) // 2",
        "    if a[mid] < target:",
        "        lo = mid + 1",
        "    else:",
        "        hi = mid       # mid never excluded",
        "",
        "# a=[1,2], target=1 -> hi stays 0,",
        "# lo stays 0 -> infinite loop"
      ],
      right: [
        "lo, hi = 0, len(a)     # exclusive hi",
        "while lo < hi:",
        "    mid = (lo + hi) // 2",
        "    if a[mid] < target:",
        "        lo = mid + 1",
        "    else:",
        "        hi = mid",
        "return lo",
        "",
        "# or keep inclusive bounds",
        "# and use hi = mid - 1"
      ],
      note:
        "Pick one convention and never mix. <code>[lo, hi]</code> inclusive goes with <code>while lo &le; hi</code> and " +
        "<code>hi = mid - 1</code>; <code>[lo, hi)</code> half-open goes with <code>while lo &lt; hi</code> and " +
        "<code>hi = mid</code>. <em>Every</em> infinite binary search loop in an interview is this mismatch."
    },
    {
      n: 2,
      title: "<code>lo = mid</code> with the lower mid (upper-bound search)",
      wrong: [
        "# find the LAST index with a[i] <= x",
        "while lo < hi:",
        "    mid = (lo + hi) // 2",
        "    if a[mid] <= x:",
        "        lo = mid     # hangs when hi == lo+1",
        "    else:",
        "        hi = mid - 1"
      ],
      right: [
        "while lo < hi:",
        "    mid = (lo + hi + 1) // 2   # upper mid",
        "    if a[mid] <= x:",
        "        lo = mid",
        "    else:",
        "        hi = mid - 1"
      ],
      note:
        "Biasing mid upward guarantees <code>mid &gt; lo</code>, so <code>lo = mid</code> makes progress. Equivalent and " +
        "usually safer: search for the <em>first</em> index where the predicate flips and subtract one &mdash; reduce " +
        "every variant to <code>lower_bound</code> rather than maintaining four templates."
    },
    {
      n: 3,
      title: "Rotated array: testing the target before identifying the sorted half",
      wrong: [
        "while lo <= hi:",
        "    mid = (lo + hi) // 2",
        "    if a[mid] == target: return mid",
        "    if a[mid] < target:",
        "        lo = mid + 1   # assumes global sort",
        "    else:",
        "        hi = mid - 1",
        "",
        "# a=[4,5,6,7,0,1,2], target=0",
        "# mid=3 (7) > 0 -> hi=2, searches",
        "# [4,5,6] -> returns -1"
      ],
      right: [
        "while lo <= hi:",
        "    mid = (lo + hi) // 2",
        "    if a[mid] == target: return mid",
        "    if a[lo] <= a[mid]:        # left sorted",
        "        if a[lo] <= target < a[mid]:",
        "            hi = mid - 1",
        "        else:",
        "            lo = mid + 1",
        "    else:                      # right sorted",
        "        if a[mid] < target <= a[hi]:",
        "            lo = mid + 1",
        "        else:",
        "            hi = mid - 1"
      ],
      note:
        "<code>a[lo] &le; a[mid]</code> with <code>&le;</code> (not <code>&lt;</code>) is required for the two-element " +
        "case where <code>lo == mid</code>. The nested range tests must use the <em>closed</em> end that belongs to the " +
        "sorted half, which is why one is <code>a[lo] &le; target &lt; a[mid]</code> and the mirror is " +
        "<code>a[mid] &lt; target &le; a[hi]</code>."
    },
    {
      n: 4,
      title: "Answer-space bounds that are wrong rather than just loose",
      wrong: [
        "lo, hi = 0, max(piles)     # lo = 0",
        "while lo < hi:",
        "    mid = (lo + hi) // 2",
        "    if hours(mid) <= h:",
        "        hi = mid",
        "    else:",
        "        lo = mid + 1",
        "",
        "# mid can be 0 -> ceil(p/0)",
        "# ZeroDivisionError"
      ],
      right: [
        "lo, hi = 1, max(piles)     # lo = 1",
        "while lo < hi:",
        "    mid = (lo + hi) // 2",
        "    if hours(mid) <= h:",
        "        hi = mid",
        "    else:",
        "        lo = mid + 1",
        "return lo"
      ],
      note:
        "Two separate obligations when searching an answer space: the lower bound must be <em>legal</em> (not merely " +
        "small), and the upper bound must be <em>feasible</em> (<code>max(piles)</code> finishes in " +
        "<code>len(piles)</code> hours, which is &le; h given the problem&rsquo;s guarantee). An infeasible " +
        "<code>hi</code> makes the loop converge to a value that fails the check, with no error raised."
    }
  ],

  practice: {
    caption: "Drill set for Binary Search",
    rows: [
      ["Search Insert Position", "LC 35", "Easy", "<code>lower_bound</code> returned as an insertion index"],
      ["Find First and Last Position of Element", "LC 34", "Medium", "lower and upper bound as two calls, duplicates"],
      ["Search a 2D Matrix", "LC 74", "Medium", "flatten with <code>divmod</code>; contrast with the staircase walk"],
      ["Find Minimum in Rotated Sorted Array", "LC 153", "Medium", "boundary form where the predicate is <code>a[mid] &gt; a[hi]</code>"],
      ["Find Peak Element", "LC 162", "Medium", "binary search with no sortedness at all, only local slope"],
      ["Time Based Key-Value Store", "LC 981", "Medium", "bisect over append-only timestamps, floor query"],
      ["Split Array Largest Sum", "LC 410", "Hard", "search on the answer with a greedy feasibility checker"],
      ["Median of Two Sorted Arrays", "LC 4", "Hard", "binary search on the partition point, O(log min(n,m))"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;<strong>Minimise the maximum</strong> load, such that everything fits in D days.&rdquo;",
      options: ["Greedy", "Binary search on the answer", "DP", "Heap"],
      answer: 1,
      why: "A superlative plus a budget, and a candidate answer is checkable in one linear pass. Greedy alone cannot prove the bound is optimal."
    },
    {
      prompt: "Unsorted array, and you only need to know whether a value is <strong>present</strong>.",
      options: ["Binary search after sorting", "Hash set", "Two pointers", "Heap"],
      answer: 1,
      why: "O(1) beats O(log n), and you avoid paying O(n log n) to sort in the first place."
    },
    {
      prompt: "Sorted array, find a <strong>pair</strong> with a given sum.",
      options: ["Two pointers", "Binary search per element", "Hash map", "Heap"],
      answer: 0,
      why: "n binary searches cost O(n log n); converging pointers do it in O(n), because each move retires a whole band."
    },
    {
      prompt: "Matrix where <strong>each row and each column</strong> is sorted, but rows are not globally ordered.",
      options: ["Binary search the flattened list", "Staircase walk from a corner", "Sort everything", "Heap"],
      answer: 1,
      why: "Binary search is invalid — there is no single monotone order over the flattened array. Start at a corner and walk in O(n+m)."
    },
    {
      prompt: "Matrix sorted as <strong>one flattened list</strong>.",
      options: ["Binary search with divmod", "Staircase walk", "Row-by-row scan", "Hash set"],
      answer: 0,
      why: "Here the flattening really is monotone, so a single O(log(n·m)) search applies and the staircase walk is slower."
    },
    {
      prompt: "Find a <strong>peak</strong> in an array with no global sortedness at all.",
      options: ["Linear scan", "Binary search on the local slope", "Sort first", "Two pointers"],
      answer: 1,
      why: "Binary search needs only unimodality, not a total order: compare a[mid] to its neighbour and walk uphill."
    },
    {
      prompt: "Sorted array <strong>with duplicates</strong>, and the prompt asks for the <em>first</em> occurrence.",
      options: ["Exact search", "lower_bound", "Linear scan from the hit", "Hash map"],
      answer: 1,
      why: "Exact search returns an arbitrary occurrence. lower_bound returns the boundary, which is the first, with no extra pass."
    },
    {
      prompt: "You are writing an upper-bound search with the update <code>lo = mid</code>. Which mid?",
      options: ["(lo + hi) // 2", "(lo + hi + 1) // 2", "Either works", "lo + (hi - lo) // 2"],
      answer: 1,
      why: "The lower mid makes mid == lo when hi == lo + 1, so lo = mid never progresses and the loop hangs. Bias mid upward."
    },
    {
      prompt: "k-th smallest value in a <strong>sorted matrix</strong>, with k large.",
      options: ["Heap of size k", "Binary search on the value + counting", "Sort everything", "Staircase walk"],
      answer: 1,
      why: "A heap is O(k log k) and degrades as k grows. Binary searching the value range and counting entries below it does not depend on k."
    }
  ]
};
