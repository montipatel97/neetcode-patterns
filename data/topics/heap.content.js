/* Topic content, transcribed from the Heap and Priority Queue chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["heap"] = {
  id: "heap",
  number: "09",
  title: "Heap and Priority Queue",
  subtitle: "Bounded top-k heaps, k-way merge, two-heap median, and the O(n) heapify argument",
  accent: "orange",
  bounds: { time: "O(n log k)", space: "O(k)", driver: "log k per sift on a k-heap" },

  mechanics: {
    lede:
      "A heap maintains <em>far less</em> order than sorting, which is exactly why it is cheaper: it gives O(1) access " +
      "to the extreme and O(log n) updates, and <strong>nothing else</strong>. There is no way to find, delete or " +
      "iterate an interior element &mdash; every pattern here is built around that limitation.",
    mechanisms: [
      {
        tag: "heapq",
        name: "The four operations worth memorising",
        blurb: "Python ships a min-heap only. A max-heap is a min-heap of negated keys.",
        caption: "import heapq",
        code: [
          "h = []",
          "heapq.heappush(h, x)          # O(log n)",
          "smallest = h[0]               # O(1), no pop",
          "x = heapq.heappop(h)          # O(log n)",
          "x = heapq.heappushpop(h, y)   # ONE sift, O(log n)",
          "heapq.heapify(a)              # in place, O(n)",
          "",
          "# max-heap: push -x, negate on the way out."
        ],
        invariant:
          "<code>h[0]</code> is the minimum, and that is the <em>only</em> position heapq specifies. The rest of the " +
          "array order is an implementation detail &mdash; never reason about <code>h[1]</code>."
      },
      {
        tag: "Mechanism A",
        name: "Bounded heap for top-k",
        blurb: "The one that matters most. To keep the k <strong>largest</strong>, maintain a <strong>min</strong>-heap of size k.",
        caption: "k-th largest via a size-k min-heap",
        code: [
          "def kth_largest(nums, k):",
          "    h = []",
          "    for x in nums:",
          "        heapq.heappush(h, x)",
          "        if len(h) > k:",
          "            heapq.heappop(h)  # drop the weakest",
          "    return h[0]     # smallest of the k largest"
        ],
        invariant:
          "After processing any prefix, <code>h</code> contains exactly the k largest elements of that prefix, and " +
          "<code>h[0]</code> is the smallest of those. Therefore any new <code>x &le; h[0]</code> can be discarded " +
          "immediately without looking at anything else. <em>The heap is bounded</em>, which is what turns O(n log n) " +
          "into O(n log k)."
      },
      {
        tag: "Mechanism B",
        name: "k-way merge",
        blurb: "Hold one entry per source, pop the global minimum, push that source&rsquo;s successor.",
        caption: "(value, source_id, position)",
        code: [
          "def merge_k(lists):",
          "    h = [(lst[0], i, 0)",
          "         for i, lst in enumerate(lists) if lst]",
          "    heapq.heapify(h)",
          "    out = []",
          "    while h:",
          "        val, i, j = heapq.heappop(h)",
          "        out.append(val)",
          "        if j + 1 < len(lists[i]):",
          "            heapq.heappush(h, (lists[i][j+1], i, j+1))",
          "    return out"
        ],
        invariant:
          "The heap holds exactly one candidate per non-exhausted source, namely its smallest unconsumed element. The " +
          "global minimum of all unconsumed elements is therefore always in the heap, so popping the root emits the " +
          "sequence in sorted order."
      },
      {
        tag: "Mechanism C",
        name: "Two heaps for a running median",
        blurb: "Split the multiset at the median: <code>lo</code> is a max-heap of the lower half, <code>hi</code> a min-heap of the upper half.",
        caption: "lo holds NEGATED values",
        code: [
          "def add_num(self, x):",
          "    heapq.heappush(self.lo, -x)            # always via lo",
          "    heapq.heappush(self.hi,",
          "                   -heapq.heappop(self.lo))  # move max across",
          "    if len(self.hi) > len(self.lo):        # rebalance",
          "        heapq.heappush(self.lo,",
          "                       -heapq.heappop(self.hi))",
          "",
          "def find_median(self):",
          "    if len(self.lo) > len(self.hi):",
          "        return float(-self.lo[0])",
          "    return (-self.lo[0] + self.hi[0]) / 2"
        ],
        invariant:
          "Two conditions held at all times: <code>max(lo) &le; min(hi)</code> (the split is order-correct) and " +
          "<code>len(lo) - len(hi)</code> is 0 or 1 (the split is balanced). The unconditional push-then-transfer " +
          "guarantees the first; the size check restores the second. Together they place the median at " +
          "<code>lo[0]</code>, or between <code>lo[0]</code> and <code>hi[0]</code>, in O(1)."
      }
    ],
    aside: {
      title: "Why heapify is O(n) and not O(n log n)",
      body:
        "Bottom-up heapify sift-downs a node at height h in O(h). In a heap of n elements there are at most " +
        "<code>n / 2^(h+1)</code> nodes at height h. Total work is " +
        "<code>sum_h (n / 2^(h+1)) &middot; O(h) = O(n &middot; sum_h h/2^(h+1))</code>, and " +
        "<code>sum_{h&ge;0} h/2^h = 2</code>, so the total is <strong>O(n)</strong>. The intuition behind the algebra: " +
        "almost all nodes are leaves and cost nothing, while the expensive nodes near the root are few. Inserting n " +
        "elements one at a time is genuinely O(n log n), so <code>heapify(a)</code> beats a push loop by a log factor " +
        "&mdash; worth using whenever you already hold the whole array."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of the bounded top-k heap",
        sub: "exchange argument",
        body:
          "<p><strong>Claim:</strong> after processing prefix P, <code>h</code> equals the multiset of the k largest " +
          "elements of P.</p>" +
          "<p><strong>Induction.</strong> True vacuously while <code>|P| &le; k</code>. For the step, suppose it holds " +
          "for P and we process x. The algorithm pushes x and pops the minimum of the <code>k+1</code> candidates. The " +
          "k largest of <code>P &cup; {x}</code> are exactly the <code>k+1</code> candidates minus the smallest of " +
          "them, because every element of P not already in h is &le; every element of h (induction hypothesis), so no " +
          "discarded element can belong to the new top-k. Popping the root removes precisely that smallest candidate.</p>" +
          "<p>Hence the invariant is maintained, and at the end <code>h[0]</code> is the k-th largest overall.</p>"
      },
      {
        title: "Correctness of the two-heap median",
        sub: "why the route is unconditional",
        body:
          "<p>The unconditional route (push into <code>lo</code>, immediately move <code>lo</code>&rsquo;s maximum into " +
          "<code>hi</code>) is what keeps the ordering invariant true <em>even when x belongs on the far side of the " +
          "split</em>: if x is large, it enters lo, becomes its maximum, and is transferred straight out.</p>" +
          "<p>A naive &ldquo;compare x to the current median, then push into the right heap&rdquo; also works but needs " +
          "case analysis for the empty and tied states, which is where it goes wrong under pressure.</p>" +
          "<p>Balance plus ordering then pin the median by definition: with 2m elements the median is the average of the " +
          "m-th and (m+1)-th, which are <code>lo[0]</code> and <code>hi[0]</code>; with 2m+1 elements the extra one " +
          "lives in lo by construction, so the median is <code>lo[0]</code>.</p>"
      },
      {
        title: "Complexity proof",
        sub: "sift bounds and the k-factor",
        body:
          "<p><strong>Sift bounds.</strong> A complete tree on n nodes has height <code>floor(log2 n)</code>. " +
          "<code>heappush</code> sifts up along one root path, <code>heappop</code> sifts down along one root path: " +
          "O(log n) comparisons each.</p>" +
          "<p><strong>Top-k.</strong> n pushes plus at most n pops on a heap never exceeding size <code>k+1</code>: " +
          "<code>O(n log k)</code>. For k small and n large this is effectively linear &mdash; and it beats sorting " +
          "whenever <code>k = o(n)</code>. Quickselect achieves O(n) expected but O(n&sup2;) worst case and destroys " +
          "the input; the heap is the answer to give unless the interviewer asks for the linear-expected method.</p>" +
          "<p><strong>k-way merge.</strong> N total elements each pushed and popped once, on a heap of size &le; k: " +
          "<code>O(N log k)</code> time, O(k) space. Pairwise merging instead re-reads accumulated prefixes and costs " +
          "<code>O(kN)</code>.</p>" +
          "<p><strong>Median stream.</strong> Each <code>add_num</code> does at most three sift operations: O(log n); " +
          "each <code>find_median</code> reads two roots: O(1).</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Note"],
      rows: [
        ["<code>heappush</code> / <code>heappop</code>", "O(log n)", "O(1)", "one root path"],
        ["<code>heapify</code> on an existing list", "O(n)", "O(1)", "series argument above"],
        ["peek <code>h[0]</code>", "O(1)", "O(1)", "no pop needed"],
        ["k largest / k-th largest", "O(n log k)", "O(k)", "bounded min-heap"],
        ["k smallest", "O(n log k)", "O(k)", "bounded max-heap (negate)"],
        ["Top K Frequent (heap)", "O(n + m log k)", "O(m)", "m distinct values"],
        ["Top K Frequent (bucket sort)", "O(n)", "O(n)", "frequency is bounded by n, so buckets work"],
        ["k-way merge", "O(N log k)", "O(k)", "one entry per source"],
        ["Running median", "O(log n) add, O(1) query", "O(n)", "two heaps"],
        ["Heap sort", "O(n log n)", "O(1)", "in place, not stable"],
        ["Quickselect (alternative)", "O(n) expected, O(n&sup2;) worst", "O(1)", "mutates the input"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "A heap is the right answer when you need <strong>repeated access to the extreme of a changing set</strong>. " +
        "Three tells: the word <em>&ldquo;k-th&rdquo;</em> or <em>&ldquo;top k&rdquo;</em>; a <em>stream</em> where the " +
        "data does not fit or does not arrive all at once; or a greedy loop of the form <em>&ldquo;repeatedly take the " +
        "best remaining&rdquo;</em>. That last one is why most of topic 15 is implemented with a heap."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;k-th largest / top k&rdquo;, k much smaller than n", "bounded heap, O(n log k)", "a full sort computes an order you were not asked for"],
      ["&ldquo;k-th largest&rdquo; with one static array and no follow-ups", "quickselect, O(n) expected", "heap is O(n log k); say both and pick"],
      ["top k by frequency, values bounded", "counting + bucket sort, O(n)", "frequencies are at most n, so no comparisons are needed"],
      ["stream / online data, query the extreme as you go", "heap", "sorting requires the whole input up front"],
      ["extremum of a <em>sliding window</em>", "monotonic deque <span class='topic-ref'>topic 03</span>", "a heap cannot evict by position; needs lazy deletion and O(n log n)"],
      ["&ldquo;merge k sorted sources&rdquo;", "heap of heads", "pairwise merging re-reads prefixes"],
      ["running median", "two heaps", "a single heap exposes one end only"],
      ["&ldquo;repeatedly take the largest/smallest and do something&rdquo;", "heap-driven greedy <span class='topic-ref'>topic 15</span>", "the proof is greedy, the data structure is a heap"],
      ["need arbitrary order statistics or deletion by key", "balanced BST / sorted container / indexed heap", "a binary heap cannot find or delete an interior element"],
      ["scheduling with times / intervals", "heap of <code>(time, item)</code>", "sorting alone cannot handle events generated during the scan"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>heappop</code> on an empty heap", "<code>IndexError: index out of range</code>; guard with <code>while h:</code>"],
      ["<code>k &gt; len(nums)</code>", "the bounded heap never evicts; <code>h[0]</code> is then the global minimum, not the k-th largest"],
      ["<code>k == 0</code>", "<code>h[0]</code> raises <code>IndexError</code>; reject or return early"],
      ["duplicates", "harmless for values, but <code>heapq</code> compares tuples element by element, so ties fall through to the next field"],
      ["tuples containing non-comparable payloads", "<code>TypeError: '&lt;' not supported</code> on a tie; insert a monotonic counter: <code>(priority, next(counter), obj)</code>"],
      ["max-heap via negation", "forgetting to negate on output returns negative answers; also flips the meaning of &ldquo;bounded&rdquo;"],
      ["mutating an element already in the heap", "the heap property silently breaks; re-push instead, and lazily skip stale entries"],
      ["stale entries after a logical delete", "pop in a <code>while h and is_stale(h[0])</code> loop <em>before</em> reading the root"],
      ["floats with <code>nan</code>", "all comparisons with <code>nan</code> are False, corrupting the ordering"],
      ["heap of objects without <code>__lt__</code>", "same <code>TypeError</code>; wrap in a tuple or define <code>__lt__</code>"],
      ["<code>heappushpop</code> vs <code>heapreplace</code>", "<code>heapreplace</code> pops first, so it can return an element larger than the one pushed"],
      ["very large k approaching n", "O(n log k) degenerates to O(n log n); just sort and say so"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Unbounded heap for a top-k query",
      wrong: [
        "h = []",
        "for x in nums:",
        "    heapq.heappush(h, -x)  # max-heap of ALL",
        "for _ in range(k - 1):",
        "    heapq.heappop(h)",
        "return -h[0]",
        "",
        "# correct answer, but O(n log n)",
        "# time and O(n) space"
      ],
      right: [
        "h = []",
        "for x in nums:",
        "    heapq.heappush(h, x)",
        "    if len(h) > k:",
        "        heapq.heappop(h)   # stays size k",
        "return h[0]",
        "",
        "# O(n log k) time, O(k) space"
      ],
      note:
        "The wrong version is not <em>incorrect</em>, it is <em>unasked for</em>: it sorts more than the problem needs " +
        "and fails the memory constraint when <code>nums</code> is a stream. Note the direction flip that trips people " +
        "up &mdash; the k <strong>largest</strong> are kept in a <strong>min</strong>-heap, because you must be able to " +
        "evict the weakest champion in O(1)."
    },
    {
      n: 2,
      title: "Tuples whose tie-break field is not comparable",
      wrong: [
        "h = []",
        "for task in tasks:",
        "    heapq.heappush(h, (task.priority, task))",
        "",
        "# two tasks with equal priority ->",
        "# TypeError: '<' not supported between",
        "# instances of 'Task' and 'Task'"
      ],
      right: [
        "from itertools import count",
        "tie = count()",
        "for task in tasks:",
        "    heapq.heappush(h, (task.priority,",
        "                       next(tie), task))",
        "",
        "# the counter breaks every tie and",
        "# also makes the order FIFO-stable"
      ],
      note:
        "<code>heapq</code> compares tuples lexicographically, so the second field is only touched <em>on a tie</em> " +
        "&mdash; which means this bug hides completely until the input has two equal priorities. The counter costs " +
        "nothing and buys deterministic, insertion-ordered tie-breaking."
    },
    {
      n: 3,
      title: "Lazy deletion without skipping stale roots",
      wrong: [
        "# heap holds (value, index); elements",
        "# may expire as the window moves",
        "while h:",
        "    val, i = heapq.heappop(h)",
        "    out.append(val)     # may be expired"
      ],
      right: [
        "while h and h[0][1] <= bound:",
        "    heapq.heappop(h)    # discard stale",
        "if h:",
        "    out.append(h[0][0])"
      ],
      note:
        "A binary heap cannot delete an interior element, so logical deletion means <em>mark and skip at the root</em>. " +
        "The skip loop must run <strong>before</strong> reading the root, not after popping it, and it must be a " +
        "<code>while</code> &mdash; several entries can expire at once. This is also why a heap is the wrong tool for " +
        "sliding-window extrema: the deque version is O(n), this one is O(n log n)."
    },
    {
      n: 4,
      title: "Median heaps rebalanced by size only, ignoring the ordering invariant",
      wrong: [
        "if len(lo) <= len(hi):",
        "    heapq.heappush(lo, -x)",
        "else:",
        "    heapq.heappush(hi, x)",
        "",
        "# sizes stay balanced, but x may be",
        "# on the wrong SIDE: add 1, 5, 3 ->",
        "# 3 lands in hi -> max(lo)=1,",
        "# min(hi)=3, median reported as 2"
      ],
      right: [
        "heapq.heappush(lo, -x)",
        "heapq.heappush(hi, -heapq.heappop(lo))",
        "if len(hi) > len(lo):",
        "    heapq.heappush(lo, -heapq.heappop(hi))",
        "",
        "# ordering enforced by construction,",
        "# then size restored"
      ],
      note:
        "Balance alone is not enough: <em>both</em> invariants must hold. Routing every element through <code>lo</code> " +
        "and transferring its maximum enforces <code>max(lo) &le; min(hi)</code> unconditionally, which removes all the " +
        "case analysis about where x belongs."
    }
  ],

  practice: {
    caption: "Drill set for Heap / Priority Queue",
    rows: [
      ["Last Stone Weight", "LC 1046", "Easy", "max-heap by negation, loop until one element remains"],
      ["Kth Largest Element in a Stream", "LC 703", "Easy", "the bounded-heap invariant, stated as a class"],
      ["K Closest Points to Origin", "LC 973", "Medium", "bounded max-heap on squared distance (never take the root)"],
      ["Top K Frequent Elements", "LC 347", "Medium", "dict + heap O(n log k), then the O(n) bucket-sort answer"],
      ["Task Scheduler", "LC 621", "Medium", "greedy with a heap plus a cooldown queue; also has a closed form"],
      ["Meeting Rooms II", "LC 253", "Medium", "heap of end times = the interval/heap crossover <span class='topic-ref'>topic 16</span>"],
      ["Reorganize String", "LC 767", "Medium", "always take the two most frequent; feasibility check first"],
      ["IPO", "LC 502", "Hard", "two structures: sort by capital, heap by profit"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;k-th largest&rdquo; where k is <strong>much smaller than n</strong>, and the data is a stream.",
      options: ["Sort everything", "Bounded min-heap of size k", "Quickselect", "Bounded max-heap"],
      answer: 1,
      why: "Sorting needs the whole input up front and computes an order you were not asked for. Keep the k largest in a MIN-heap so the weakest champion is at the root."
    },
    {
      prompt: "&ldquo;k-th largest&rdquo; from <strong>one static array</strong>, no follow-up queries.",
      options: ["Bounded heap", "Quickselect", "Bucket sort", "Two heaps"],
      answer: 1,
      why: "O(n) expected beats O(n log k) here. Say both and pick — noting quickselect is O(n²) worst case and mutates the input."
    },
    {
      prompt: "Top k <strong>by frequency</strong>, over n items.",
      options: ["Heap only", "Counting + bucket sort, O(n)", "Full sort", "Two heaps"],
      answer: 1,
      why: "Frequencies are bounded by n, so you can bucket by count and read off the top — no comparisons needed at all."
    },
    {
      prompt: "The extremum of every <strong>sliding window</strong> of size k.",
      options: ["Heap with lazy deletion", "Monotonic deque", "Two heaps", "Sort each window"],
      answer: 1,
      why: "A heap cannot evict by position, so it needs lazy deletion and becomes O(n log n). The deque evicts from either end and stays O(n)."
    },
    {
      prompt: "You must <strong>delete an arbitrary element by key</strong>, not just the extreme.",
      options: ["Binary heap", "Balanced BST / indexed heap", "Two heaps", "Bucket sort"],
      answer: 1,
      why: "A binary heap cannot find or delete an interior element. That requirement is what pushes you to a BST, a sorted container, or an index-augmented heap."
    },
    {
      prompt: "You already hold the whole array and want it heapified.",
      options: ["Push each element in a loop", "heapify(a)", "Sort it", "Both are O(n log n)"],
      answer: 1,
      why: "A push loop is genuinely O(n log n); heapify is O(n), because almost all nodes are leaves and the expensive ones near the root are few."
    },
    {
      prompt: "Pushing <code>(priority, obj)</code> tuples where two objects can share a priority.",
      options: ["Fine as is", "Add a monotonic counter as the second field", "Sort instead", "Use a set"],
      answer: 1,
      why: "heapq compares tuples lexicographically, so on a tie it tries to compare the payloads and raises TypeError. The counter breaks every tie and makes the order FIFO-stable."
    },
    {
      prompt: "A greedy loop of the form &ldquo;repeatedly take the best remaining and do something&rdquo;.",
      options: ["Sort once", "Heap", "Two pointers", "Sliding window"],
      answer: 1,
      why: "Sorting alone cannot handle events generated during the scan. The proof is greedy; the data structure that implements it is a heap."
    },
    {
      prompt: "k is <strong>close to n</strong>.",
      options: ["Bounded heap", "Just sort, and say why", "Quickselect", "Two heaps"],
      answer: 1,
      why: "O(n log k) degenerates to O(n log n) once k approaches n, so the heap's advantage disappears and the simpler code wins."
    }
  ]
};
