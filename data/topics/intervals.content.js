/* Topic content, transcribed from the Intervals chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["intervals"] = {
  id: "intervals",
  number: "16",
  title: "Intervals",
  subtitle: "Sort by start to merge, sort by end to count, sweep lines and heaps for concurrency",
  accent: "cyan",
  bounds: { time: "O(n log n)", space: "O(n)", driver: "dominated by the sort" },

  mechanics: {
    lede:
      "Almost every interval problem is decided by <strong>one choice: the sort key</strong>. Get it right and the scan " +
      "is five lines; get it wrong and the greedy silently loses its proof. " +
      "<em>Merge / union / insert / &ldquo;do any overlap&rdquo;</em> &rarr; sort by <strong>start</strong>, compare " +
      "each interval to the last one in the output. <em>Maximum non-overlapping count, or minimum removals</em> &rarr; " +
      "sort by <strong>end</strong>, keep an interval iff it starts at or after the last kept end. <em>Maximum " +
      "concurrency</em> &rarr; sweep <strong>events</strong>, or sort by start with a heap of ends. <em>Intersect two " +
      "already-sorted lists</em> &rarr; neither; two pointers, advancing whichever ends first.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Merge, sorted by start",
        blurb: "One comparison per interval, because only the last block can overlap.",
        caption: "Merge Intervals",
        code: [
          "def merge(intervals):",
          "    intervals.sort(key=lambda iv: iv[0])",
          "    out = []",
          "    for s, e in intervals:",
          "        if out and s <= out[-1][1]:    # the LAST block",
          "            out[-1][1] = max(out[-1][1], e)  # not e!",
          "        else:",
          "            out.append([s, e])",
          "    return out"
        ],
        invariant:
          "<code>out</code> holds pairwise-disjoint intervals, sorted by start, whose union equals the union of all " +
          "intervals processed so far. Because the input is sorted by start, a new interval can only overlap the " +
          "<em>last</em> block in <code>out</code>, so one comparison per interval suffices."
      },
      {
        tag: "Mechanism B",
        name: "Maximum non-overlapping count, sorted by end",
        blurb: "Activity selection. The exchange argument is specifically about <em>finishing early</em>.",
        caption: "Erase Overlap Intervals",
        code: [
          "def erase_overlap_intervals(intervals):",
          "    intervals.sort(key=lambda iv: iv[1])   # by END",
          "    kept, last_end = 0, float('-inf')",
          "    for s, e in intervals:",
          "        if s >= last_end:   # compatible with all kept",
          "            kept += 1",
          "            last_end = e",
          "    return len(intervals) - kept"
        ],
        invariant:
          "After k keeps, <code>last_end</code> is the smallest end achievable by any set of k pairwise compatible " +
          "intervals. Keeping the earliest-finishing compatible interval leaves the largest possible remaining time, " +
          "which is the staying-ahead measure."
      },
      {
        tag: "Mechanism C",
        name: "Concurrency by sweep line, and by heap",
        blurb: "Two equivalent solutions to Meeting Rooms II.",
        caption: "Sweep two sorted arrays, or keep a heap of end times",
        code: [
          "def min_rooms_sweep(intervals):",
          "    starts = sorted(iv[0] for iv in intervals)",
          "    ends = sorted(iv[1] for iv in intervals)",
          "    rooms = best = j = 0",
          "    for s in starts:",
          "        while ends[j] <= s:   # <= frees the room at s",
          "            j += 1",
          "            rooms -= 1",
          "        rooms += 1",
          "        best = max(best, rooms)",
          "    return best",
          "",
          "def min_rooms_heap(intervals):",
          "    intervals.sort(key=lambda iv: iv[0])",
          "    h = []",
          "    for s, e in intervals:",
          "        if h and h[0] <= s:",
          "            heapq.heappop(h)  # reuse the freed room",
          "        heapq.heappush(h, e)",
          "    return len(h)"
        ],
        invariant:
          "<strong>Sweep:</strong> <code>rooms</code> is the number of intervals containing the current sweep position, " +
          "so its running maximum is the peak concurrency. <strong>Heap:</strong> <code>h</code> holds the end times of " +
          "the rooms currently in use, so <code>h[0]</code> is the soonest a room frees up and <code>len(h)</code> is " +
          "the number of rooms ever needed simultaneously."
      }
    ],
    aside: {
      title: "The three-phase Insert Interval, worth memorising verbatim",
      body:
        "<strong>(1) strictly before:</strong> copy every interval ending before the new one starts. <strong>(2) absorb " +
        "every overlap:</strong> a <code>while</code> loop, because the new interval can swallow many existing ones. " +
        "<strong>(3) strictly after:</strong> extend with the remainder. It is O(n) with no sort, since the input is " +
        "already sorted, and the <code>while</code> in phase two is what handles an insertion spanning many intervals."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Why comparing against only the last merged block is sufficient",
        sub: "the ends are increasing too",
        body:
          "<p><strong>Lemma.</strong> With the input sorted by start, if the incoming interval <code>[s, e]</code> " +
          "overlaps any block already in <code>out</code>, it overlaps <code>out[-1]</code>.</p>" +
          "<p><strong>Proof.</strong> The blocks in <code>out</code> are pairwise disjoint and sorted by start, so their " +
          "ends are also increasing: <code>out[0].end &lt; out[1].start &le; out[1].end &lt; ...</code>. Hence " +
          "<code>out[-1].end</code> is the maximum end in <code>out</code>. Suppose <code>[s, e]</code> overlaps some " +
          "earlier block <code>out[t]</code>. Then <code>s &le; out[t].end &lt; out[-1].start</code>. But the input is " +
          "sorted by start and <code>out[-1]</code> was created from an earlier interval, so " +
          "<code>s &ge; out[-1].start</code> &mdash; contradiction.</p>" +
          "<p>This lemma is why merging is O(n log n) rather than O(n&sup2;): without it you would have to test the new " +
          "interval against <em>every</em> block. It also explains the <code>max</code> in the update &mdash; the " +
          "incoming interval may be entirely contained in the last block (<code>[1,4]</code> then <code>[2,3]</code>), " +
          "in which case the end must not shrink.</p>"
      },
      {
        title: "Activity selection: the exchange argument for sorting by end",
        sub: "and why start order and length order both fail",
        body:
          "<p><strong>Claim.</strong> The interval with the earliest end time belongs to some maximum-size set of " +
          "pairwise non-overlapping intervals.</p>" +
          "<p><strong>Proof.</strong> Let OPT be a maximum set, listed in increasing end order as " +
          "<code>o_1, o_2, ...</code>, and let f be the globally earliest-finishing interval. If <code>f == o_1</code> " +
          "we are done. Otherwise <code>f.end &le; o_1.end</code>, so f cannot overlap <code>o_2, o_3, ...</code> " +
          "&mdash; each of those starts at or after <code>o_1.end &ge; f.end</code>. Then " +
          "<code>{f} &cup; OPT \\ {o_1}</code> is still pairwise non-overlapping and has the same size, so it is also " +
          "optimal and contains f.</p>" +
          "<p><strong>Induction.</strong> Remove f and all intervals overlapping it; the remaining problem is the same " +
          "problem on a suffix of time, and the argument repeats.</p>"
      },
      {
        title: "Sweep-line correctness, and the tie convention",
        sub: "closed versus half-open",
        body:
          "<p>The number of intervals containing a point t is " +
          "<code>(number of starts &le; t) - (number of ends &le; t)</code>, which is exactly the prefix sum of " +
          "<code>+1</code> at each start and <code>-1</code> at each end. The maximum over all t is attained at some " +
          "<em>start</em> point (the count only increases there), so sweeping the sorted starts and draining expired " +
          "ends visits every candidate maximum.</p>" +
          "<p>The tie rule follows from whether intervals are closed or half-open. For meetings, <code>[0, 10)</code> " +
          "and <code>[10, 20)</code> do not conflict, so an end equal to a start must be processed first &mdash; hence " +
          "<code>while ends[j] &le; s</code>. If the problem treats intervals as <em>closed</em> (a balloon touching at " +
          "a point counts as overlapping), the test becomes <code>&lt;</code>. Getting this backwards changes the " +
          "answer by exactly one room on touching inputs, and it is the most common interval bug after the sort key.</p>" +
          "<p><strong>Complexity.</strong> Sorting is O(n log n) and dominates every method here; the scan itself is " +
          "O(n) with each interval examined once (the sweep&rsquo;s inner <code>while</code> advances j monotonically, " +
          "so it contributes O(n) <em>in total</em>, not per iteration).</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "Sorting by <em>start</em> breaks activity selection. Counter-example: " +
        "<code>[[0,10], [1,2], [3,4]]</code>. Start order picks <code>[0,10]</code> first and then nothing else " +
        "&mdash; one interval. End order picks <code>[1,2]</code> then <code>[3,4]</code> &mdash; two. Sorting by " +
        "<em>length</em> also fails: <code>[[1,5], [4,6], [5,9]]</code> picks <code>[4,6]</code> and blocks both " +
        "others, where <code>[1,5]</code> and <code>[5,9]</code> give two. <strong>Only earliest-end has a proof.</strong>"
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Problem", "Sort key", "Time", "Note"],
      rows: [
        ["Merge Intervals", "start", "O(n log n)", "compare against <code>out[-1]</code> only"],
        ["Insert Interval (input already sorted)", "&mdash;", "O(n)", "three phases: before, merge, after"],
        ["Non-overlapping Intervals (min removals)", "end", "O(n log n)", "activity selection"],
        ["Minimum Arrows to Burst Balloons", "end", "O(n log n)", "same greedy, closed-interval ties"],
        ["Meeting Rooms (any overlap?)", "start", "O(n log n)", "one adjacent comparison"],
        ["Meeting Rooms II (max concurrency)", "events or heap", "O(n log n)", "sweep or heap of ends"],
        ["Interval List Intersections", "already sorted", "O(n + m)", "two pointers"],
        ["Car Pooling / bounded range", "&mdash;", "O(n + R)", "difference array over the fixed range"],
        ["Maximum Profit in Job Scheduling", "end", "O(n log n)", "DP + bisect for the last compatible job"],
        ["Minimum Interval to Include Each Query", "start + heap", "O((n+q) log n)", "sort queries too, heap by length"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "One sentence that resolves the sort key: <strong>if the answer is a set of intervals, sort by start; if the " +
        "answer is a count, sort by end; if the answer is &ldquo;how many at once&rdquo;, sweep the events.</strong> " +
        "Merging builds objects, so it needs start order to make adjacency meaningful. Counting needs end order because " +
        "the exchange argument is about finishing early."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;merge&rdquo;, &ldquo;union&rdquo;, &ldquo;insert into a sorted list&rdquo;", "sort by start, scan", "end order makes adjacency non-local"],
      ["&ldquo;minimum number to remove so none overlap&rdquo;", "sort by end, count keeps", "start order picks a long blocking interval"],
      ["&ldquo;minimum arrows / points to stab all intervals&rdquo;", "sort by end, greedy", "identical to activity selection, closed-interval ties"],
      ["&ldquo;minimum rooms / machines / boats at once&rdquo;", "sweep or heap of ends", "a count of non-overlapping intervals answers a different question"],
      ["coordinates are small integers and bounded", "difference array, O(range)", "sorting is unnecessary when you can bucket by time"],
      ["two lists, each already sorted", "two pointers", "re-sorting the concatenation throws away given structure"],
      ["intervals have weights / profits", "DP over end-sorted intervals + binary search", "greedy by profit or by end alone is not optimal"],
      ["per query, the smallest covering interval", "offline: sort queries, sweep with a heap", "per-query scanning is O(n&middot;q)"],
      ["the intervals are on a circle", "cut at a point, or duplicate the array", "linear sweeps assume a start and an end of time"],
      ["&ldquo;is the calendar double-booked&rdquo; with online inserts", "balanced BST / sorted container", "re-sorting on every insert is O(n log n) per operation"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty list", "<code>out[-1]</code> raises <code>IndexError</code>; the <code>if out and ...</code> guard covers it"],
      ["single interval", "merging returns it unchanged; the removal count is 0"],
      ["touching intervals <code>[1,2], [2,3]</code>", "with <code>s &le; out[-1][1]</code> they merge (treating intervals as closed); with <code>&lt;</code> they stay separate &mdash; the spec decides, so ask"],
      ["fully contained interval <code>[1,10], [2,3]</code>", "<code>out[-1][1] = e</code> shrinks the block from 10 to 3; needs <code>max</code>"],
      ["identical intervals", "must merge to one; the removal count must drop all but one"],
      ["unsorted input", "every proof here assumes the sort; forgetting it produces wrong output on plausible-looking inputs"],
      ["meeting ending exactly when another starts", "<code>&le;</code> vs <code>&lt;</code> in the sweep changes the room count by one"],
      ["zero-length interval <code>[5,5]</code>", "treated as a point; may or may not conflict, depending on the closed/half-open convention"],
      ["negative coordinates", "harmless for sorting, but breaks any difference array indexed from 0"],
      ["coordinates up to 10<sup>9</sup>", "a difference array is infeasible; use event sorting instead"],
      ["sorting by start when counting", "picks <code>[0,10]</code> over <code>[1,2]</code> and <code>[3,4]</code>: one instead of two"],
      ["mutating the caller&rsquo;s list with <code>.sort()</code>", "acceptable, but say so; use <code>sorted()</code> if the input must be preserved"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Merging by assignment instead of by maximum",
      wrong: [
        "for s, e in intervals:",
        "    if out and s <= out[-1][1]:",
        "        out[-1][1] = e      # overwrite",
        "    else:",
        "        out.append([s, e])",
        "",
        "# [[1,10],[2,3]] -> [[1,3]]",
        "# the contained interval SHRINKS",
        "# the merged block"
      ],
      right: [
        "for s, e in intervals:",
        "    if out and s <= out[-1][1]:",
        "        out[-1][1] = max(out[-1][1], e)",
        "    else:",
        "        out.append([s, e])",
        "",
        "# [[1,10],[2,3]] -> [[1,10]]"
      ],
      note:
        "Sorting by start says nothing about <em>ends</em>, so a later interval can finish earlier. The " +
        "<code>max</code> is the only thing standing between you and silently truncating the union. This bug passes " +
        "every test whose intervals happen to have increasing ends."
    },
    {
      n: 2,
      title: "Counting non-overlapping intervals after sorting by start",
      wrong: [
        "intervals.sort(key=lambda iv: iv[0])",
        "kept, last = 0, float('-inf')",
        "for s, e in intervals:",
        "    if s >= last:",
        "        kept += 1",
        "        last = e",
        "return len(intervals) - kept",
        "",
        "# [[0,10],[1,2],[3,4]] -> keeps only",
        "# [0,10]; reports 2 removals"
      ],
      right: [
        "intervals.sort(key=lambda iv: iv[1])   # by END",
        "kept, last = 0, float('-inf')",
        "for s, e in intervals:",
        "    if s >= last:",
        "        kept += 1",
        "        last = e",
        "return len(intervals) - kept",
        "",
        "# [[0,10],[1,2],[3,4]] -> keeps",
        "# [1,2] and [3,4]; reports 1 removal"
      ],
      note:
        "One character of difference in the sort key, and the greedy loses its proof. The exchange argument is " +
        "specifically about <em>finishing</em> early; nothing analogous holds for starting early. If you cannot " +
        "remember which, re-derive it from the <code>[[0,10],[1,2],[3,4]]</code> counter-example in five seconds."
    },
    {
      n: 3,
      title: "Sweep line processing a start before a coincident end",
      wrong: [
        "events = []",
        "for s, e in intervals:",
        "    events.append((s, 1))",
        "    events.append((e, -1))",
        "events.sort()     # (10,-1) sorts before",
        "                  # (10,1) only because",
        "                  # -1 < 1 -- fragile",
        "",
        "# with (s,0) and (e,1) tags, or with",
        "# +1 sorting first, [[0,10],[10,20]]",
        "# reports 2 rooms instead of 1"
      ],
      right: [
        "events = []",
        "for s, e in intervals:",
        "    events.append((s, 1))",
        "    events.append((e, -1))",
        "events.sort(key=lambda x: (x[0], x[1]))",
        "",
        "# -1 before +1 at equal times, made",
        "# explicit rather than accidental",
        "# [[0,10],[10,20]] -> 1 room"
      ],
      note:
        "Make the tie rule explicit in the sort key instead of relying on tuple-comparison luck, and pick the direction " +
        "from the problem&rsquo;s convention: <em>half-open</em> intervals (meetings, rooms) free the resource at e, so " +
        "ends come first; <em>closed</em> intervals (balloons, shooting a point) still overlap at e, so starts come " +
        "first."
    },
    {
      n: 4,
      title: "Insert Interval merging only once",
      wrong: [
        "for iv in intervals:",
        "    if overlaps(iv, new):",
        "        new = union(iv, new)",
        "        break            # stops after one",
        "    out.append(iv)",
        "",
        "# the new interval can swallow SEVERAL",
        "# existing ones: [[1,2],[3,5],[6,7]]",
        "# inserting [2,6] must merge three"
      ],
      right: [
        "out, i, n = [], 0, len(intervals)",
        "while i < n and intervals[i][1] < new[0]:",
        "    out.append(intervals[i]); i += 1",
        "while i < n and intervals[i][0] <= new[1]:",
        "    new = [min(new[0], intervals[i][0]),",
        "           max(new[1], intervals[i][1])]",
        "    i += 1               # absorb EVERY overlap",
        "out.append(new)",
        "out.extend(intervals[i:])",
        "return out"
      ],
      note:
        "The three-phase structure (strictly before, absorb all overlaps, strictly after) is worth memorising verbatim " +
        "&mdash; it is O(n) with no sort, since the input is already sorted, and the <code>while</code> in phase two is " +
        "what handles an insertion that spans many existing intervals."
    }
  ],

  practice: {
    caption: "Drill set for Intervals",
    rows: [
      ["Meeting Rooms", "LC 252", "Easy", "sort by start, one adjacent comparison; the touching-endpoint convention"],
      ["Insert Interval", "LC 57", "Medium", "the three-phase O(n) scan on an already-sorted list"],
      ["Minimum Number of Arrows to Burst Balloons", "LC 452", "Medium", "activity selection with closed-interval ties (<code>&gt;</code> not <code>&ge;</code>)"],
      ["Interval List Intersections", "LC 986", "Medium", "two pointers; advance whichever interval ends first"],
      ["Car Pooling", "LC 1094", "Medium", "difference array over a bounded coordinate range, O(n + R)"],
      ["My Calendar I", "LC 729", "Medium", "online inserts; sorted container or bisect over a kept-sorted list"],
      ["Minimum Interval to Include Each Query", "LC 1851", "Hard", "offline: sort queries, sweep with a heap keyed by length"],
      ["Maximum Profit in Job Scheduling", "LC 1235", "Hard", "end-sorted DP with bisect for the last compatible job"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;<strong>Merge</strong> all overlapping intervals.&rdquo;",
      options: ["Sort by end", "Sort by start", "Sort by length", "Sweep events"],
      answer: 1,
      why: "The answer is a set of intervals, so you need start order to make adjacency local — then only the last output block can overlap."
    },
    {
      prompt: "&ldquo;<strong>Minimum number to remove</strong> so that none overlap.&rdquo;",
      options: ["Sort by start", "Sort by end", "Sort by length", "Sweep events"],
      answer: 1,
      why: "The answer is a count, and the exchange argument is about finishing early. On [[0,10],[1,2],[3,4]] start order keeps one interval instead of two."
    },
    {
      prompt: "&ldquo;<strong>Minimum meeting rooms</strong> needed at once.&rdquo;",
      options: ["Sort by start and count", "Sweep events, or a heap of ends", "Sort by end", "Merge first"],
      answer: 1,
      why: "A count of non-overlapping intervals answers a different question. Peak concurrency is the running maximum of a +1/−1 prefix sum."
    },
    {
      prompt: "Two interval lists, each <strong>already sorted</strong>, and you want their intersections.",
      options: ["Concatenate and re-sort", "Two pointers", "Heap", "Difference array"],
      answer: 1,
      why: "Re-sorting throws away the structure you were handed. Advance whichever interval ends first, in O(n + m)."
    },
    {
      prompt: "Coordinates are small bounded integers, and you are counting occupancy.",
      options: ["Event sorting", "Difference array", "Heap", "Merge first"],
      answer: 1,
      why: "When you can bucket by time, sorting is unnecessary — O(n + R) beats O(n log n) and the code is shorter."
    },
    {
      prompt: "Meetings <code>[0,10)</code> and <code>[10,20)</code>. How many rooms?",
      options: ["2", "1", "Depends on the sort", "0"],
      answer: 1,
      why: "Half-open intervals free the resource at the end point, so an end equal to a start is processed first. That is the `ends[j] <= s` convention."
    },
    {
      prompt: "Intervals carry <strong>weights / profits</strong> and you want the best non-conflicting subset.",
      options: ["Greedy by end", "Greedy by profit", "DP over end-sorted intervals + binary search", "Sweep line"],
      answer: 2,
      why: "Neither greedy is optimal once weights exist. Sort by end and binary search for the last compatible job, then take a max over include/exclude."
    },
    {
      prompt: "Inserting into an <strong>already-sorted</strong> interval list.",
      options: ["Append and re-sort", "Three-phase O(n) scan", "Sweep events", "Heap"],
      answer: 1,
      why: "Re-sorting wastes the given order. Copy what is strictly before, absorb every overlap in a while loop, then extend with the rest."
    },
    {
      prompt: "In Merge Intervals, why is the update <code>max(out[-1][1], e)</code> rather than <code>e</code>?",
      options: ["Style", "A later interval can end earlier", "For speed", "To handle empty input"],
      answer: 1,
      why: "Sorting by start says nothing about ends. On [[1,10],[2,3]] a plain assignment shrinks the block to [1,3] and truncates the union."
    }
  ]
};
