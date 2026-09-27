/* Topic content, transcribed from the Sliding Window chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["sliding-window"] = {
  id: "sliding-window",
  number: "03",
  title: "Sliding Window",
  subtitle: "Variable and fixed windows, feasibility monotonicity, monotonic-deque extrema",
  accent: "indigo",
  bounds: { time: "O(n)", space: "O(k)", driver: "each index enters and leaves once" },

  mechanics: {
    lede:
      "A sliding window maintains a contiguous range <code>[l, r]</code> plus an <strong>O(1)-updatable summary</strong> " +
      "of its contents (a count map, a running sum, a deque of candidate extrema). The right edge always advances; the " +
      "left edge advances only to restore a property. Because neither edge ever retreats, the total work is linear " +
      "even though the code is a loop inside a loop.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Variable window, &ldquo;longest valid&rdquo;",
        blurb: "Grow always; shrink <em>while</em> invalid.",
        caption: "Longest substring without repeating characters",
        code: [
          "def longest_unique(s):",
          "    seen = set()",
          "    l = best = 0",
          "    for r, ch in enumerate(s):",
          "        while ch in seen:      # WHILE, not IF",
          "            seen.remove(s[l])",
          "            l += 1",
          "        seen.add(ch)",
          "        best = max(best, r - l + 1)",
          "    return best"
        ],
        invariant:
          "At the bottom of each iteration, <code>s[l..r]</code> is valid (here: all characters distinct) and is the " +
          "<em>longest</em> valid window ending at r. Any window ending at r that starts before l is invalid, so no " +
          "longer candidate exists at this r; taking the max over all r therefore covers the global optimum."
      },
      {
        tag: "Mechanism B",
        name: "Variable window, &ldquo;shortest valid&rdquo;",
        blurb: "Grow until valid, then shrink <em>while still</em> valid.",
        caption: "Minimum window substring, skeleton",
        code: [
          "def min_window(s, t):",
          "    need = Counter(t)",
          "    missing = len(t)       # multiplicity still unmet",
          "    l, best = 0, (float('inf'), 0, 0)",
          "    for r, ch in enumerate(s):",
          "        if need[ch] > 0:",
          "            missing -= 1",
          "        need[ch] -= 1      # may go negative = surplus",
          "        while missing == 0:            # valid -> shrink",
          "            if r - l + 1 < best[0]:",
          "                best = (r - l + 1, l, r)",
          "            need[s[l]] += 1",
          "            if need[s[l]] > 0:         # broke validity",
          "                missing += 1",
          "            l += 1",
          "    return '' if best[0] == float('inf') else s[best[1]:best[2]+1]"
        ],
        invariant:
          "<code>missing == 0</code> exactly when <code>s[l..r]</code> contains every character of t with sufficient " +
          "multiplicity. Inside the <code>while</code>, l is pushed to the largest value that keeps validity, so for " +
          "this r the window is the <em>shortest</em> valid window ending at r."
      },
      {
        tag: "Mechanism C",
        name: "Fixed window of size k",
        blurb: "Shrink by exactly one, with <code>if</code> rather than <code>while</code>.",
        caption: "Add the entering element, drop the leaving one",
        code: [
          "def max_sum_k(a, k):",
          "    run = sum(a[:k])",
          "    best = run",
          "    for r in range(k, len(a)):",
          "        run += a[r] - a[r - k]",
          "        best = max(best, run)",
          "    return best"
        ],
        invariant:
          "<code>run</code> is always the sum of exactly k consecutive elements ending at r. A <code>while</code> loop " +
          "here would be a bug: it can collapse the window below the required size k."
      },
      {
        tag: "Mechanism D",
        name: "Monotonic deque for window extrema",
        blurb:
          "Keep a deque of <em>indices</em> whose values are strictly decreasing (for a maximum). Before pushing i, pop " +
          "every tail index whose value is &le; <code>a[i]</code>: those can never again be the maximum, because " +
          "<code>a[i]</code> is both larger and stays in the window longer. Pop the head once it falls out of " +
          "<code>[r-k+1, r]</code>.",
        caption: "Monotonic deque, indices not values",
        code: [
          "def max_sliding_window(a, k):",
          "    dq, out = deque(), []",
          "    for i, x in enumerate(a):",
          "        while dq and a[dq[-1]] <= x:",
          "            dq.pop()          # dominated, never the max again",
          "        dq.append(i)",
          "        if dq[0] <= i - k:",
          "            dq.popleft()      # expired by index",
          "        if i >= k - 1:",
          "            out.append(a[dq[0]])",
          "    return out"
        ],
        invariant:
          "The deque holds exactly the indices in <code>[l, r]</code> that are <em>not dominated</em> by a later index " +
          "in the window; their values are strictly decreasing from head to tail, so the head is the maximum and the " +
          "tail is the newest element."
      }
    ],
    aside: {
      title: "The property that makes the window legal",
      body:
        "Let <code>V(l, r)</code> be true when <code>s[l..r]</code> is valid. The pattern is sound whenever validity is " +
        "<strong>downward closed</strong> in the window: if <code>V(l, r)</code> then <code>V(l', r)</code> for every " +
        "<code>l' &ge; l</code> &mdash; shrinking never breaks validity. For &ldquo;all distinct&rdquo; this is clear: " +
        "a subset of distinct characters is distinct. For &ldquo;contains all of t&rdquo; the closure runs the other " +
        "way (growing preserves validity), which is why Mechanism B tests <em>validity</em> and shrinks, rather than " +
        "testing invalidity and shrinking."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Why one forward-only left pointer suffices",
        sub: "monotonicity of L(r)",
        body:
          "<p>Define <code>L(r)</code> = the smallest l with <code>V(l, r)</code>. <strong>Claim:</strong> L is " +
          "non-decreasing.</p>" +
          "<p><strong>Proof.</strong> If <code>L(r+1) &lt; L(r)</code> then the window " +
          "<code>[L(r+1), r+1]</code> is valid, and by downward closure so is <code>[L(r+1), r]</code> (dropping the " +
          "last element cannot break &ldquo;all distinct&rdquo;). That contradicts minimality of <code>L(r)</code>.</p>" +
          "<p>Because L never decreases, a single left pointer that only advances visits every <code>L(r)</code> &mdash; " +
          "no restart is ever needed. <em>This monotonicity is the sliding window.</em> When it fails, the pattern is " +
          "invalid and you must fall back to prefix sums plus a hash map.</p>"
      },
      {
        title: "Correctness of the &ldquo;longest&rdquo; form",
        sub: "optimality at the recording step",
        body:
          "<p>The optimal window is <code>[l*, r*]</code> for some <code>r*</code>. At iteration <code>r = r*</code> the " +
          "algorithm holds <code>l = L(r*)</code>, the smallest valid start, so " +
          "<code>r* - L(r*) + 1 &ge; r* - l* + 1</code>.</p>" +
          "<p>The candidate it records is therefore at least as long as the optimum, and by the invariant it is valid, " +
          "so it is not longer than the optimum either. Equality holds, and <code>best</code> is exact.</p>"
      },
      {
        title: "Correctness of the monotonic deque",
        sub: "domination",
        body:
          "<p><strong>Claim:</strong> if <code>i &lt; j</code> and <code>a[i] &le; a[j]</code>, index i is never the " +
          "answer for any window containing both.</p>" +
          "<p>Any window containing i and extending to <code>r &ge; j</code> also contains j, whose value is at least " +
          "as large; so i can be discarded without loss. The deque discards exactly those dominated indices, and " +
          "retains everything else in index order &mdash; hence the head is the maximum of the live window.</p>"
      },
      {
        title: "Complexity proof",
        sub: "amortised, not per-iteration",
        body:
          "<p><strong>Time.</strong> r takes each of the n values exactly once. l only increases and is bounded by n, so " +
          "the total number of <code>while</code>-body executions <em>across the whole run</em> is at most n &mdash; " +
          "not n per iteration. Total operations &le; 2n, each O(1) (hash update, arithmetic, or one deque push/pop): " +
          "<strong>O(n)</strong>. This is an amortised argument: the inner loop is not O(n) per step, it is O(n) in " +
          "total. For the deque, each index is pushed once and popped at most once, giving the same &le; 2n count.</p>" +
          "<p><strong>Space.</strong> O(k) for the summary: the count map holds at most <code>min(n, A)</code> distinct " +
          "keys, the deque at most k indices, the running sum O(1).</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Bound driven by"],
      rows: [
        ["Longest valid window", "O(n)", "O(min(n, A))", "each index enters/leaves once"],
        ["Shortest valid window", "O(n)", "O(len(t))", "same, plus <code>missing</code> counter"],
        ["Fixed window sum/avg", "O(n)", "O(1)", "one add and one subtract per step"],
        ["Window maximum (deque)", "O(n)", "O(k)", "each index pushed and popped once"],
        ["Window maximum (heap, lazy delete)", "O(n log n)", "O(n)", "stale entries linger in the heap"],
        ["&ldquo;Exactly k distinct&rdquo; via <code>atMost(k) - atMost(k-1)</code>", "O(n)", "O(k)", "two linear passes"],
        ["Window with negatives (prefix + hash)", "O(n)", "O(n)", "not a window: monotonicity fails"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Three-part trigger for sliding window: <strong>(1)</strong> the answer is a contiguous run; " +
        "<strong>(2)</strong> validity is monotone under shrinking from the left; <strong>(3)</strong> the window " +
        "summary is incrementally updatable in O(1). Drop any one of the three and the pattern breaks &mdash; " +
        "non-contiguous means DP or greedy, non-monotone means prefix sums plus hashing, non-incremental means a heap " +
        "or a segment tree."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;longest/shortest substring or subarray&rdquo; with a content predicate", "sliding window", "two pointers only inspects endpoints"],
      ["sum target, all values non-negative", "sliding window", "monotone: growing raises the sum, shrinking lowers it"],
      ["sum target, values may be negative", "prefix sums + hash map", "shrinking can raise the sum, so <code>L(r)</code> is not monotone"],
      ["&ldquo;subsequence&rdquo; (not contiguous)", "DP <span class='topic-ref'>topics 13/14</span>", "a window cannot skip elements"],
      ["fixed length k stated in the prompt", "fixed window, <code>if</code> not <code>while</code>", "a <code>while</code> shrink loop can collapse the window below k"],
      ["max/min inside each window", "monotonic deque", "recomputing per window is O(nk)"],
      ["&ldquo;at most k replacements/deletions allowed&rdquo;", "window on the violation count", "equivalent to a validity predicate, still monotone"],
      ["&ldquo;exactly k distinct&rdquo;", "<code>atMost(k) - atMost(k-1)</code>", "&ldquo;exactly&rdquo; is not monotone; the difference of two monotone counts is"],
      ["k-th largest overall, not per window", "heap / quickselect <span class='topic-ref'>topic 09</span>", "no contiguity to exploit"],
      ["count of valid subarrays, not the best one", "window, add <code>r - l + 1</code> per step", "tracking only the max loses the count"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty input", "<code>sum(a[:k])</code> on <code>[]</code> gives 0 and reports a spurious best of 0 instead of an error or <code>\"\"</code>"],
      ["<code>k &gt; n</code> for a fixed window", "the primer <code>sum(a[:k])</code> silently sums the whole array and returns a wrong &ldquo;window&rdquo;"],
      ["<code>k == 0</code>", "fixed-window code divides by zero for averages; window code loops forever if the shrink test never fails"],
      ["all characters identical", "longest-unique must return 1; the <code>while</code> must run <code>r - l</code> times in one step, and still be amortised O(n)"],
      ["all characters distinct", "shrink loop never runs; make sure <code>best</code> is still updated every iteration"],
      ["t longer than s (min window)", "must return <code>\"\"</code>; <code>missing</code> never reaches 0, so the guard on <code>best == inf</code> is what saves you"],
      ["t has duplicate characters", "a set instead of a <code>Counter</code> accepts <code>\"AB\"</code> for <code>t = \"AAB\"</code>"],
      ["surplus characters in the window", "<code>need[ch]</code> must be allowed to go negative, else the shrink test fires too early"],
      ["window length off by one", "<code>r - l</code> instead of <code>r - l + 1</code> under-reports every answer by 1"],
      ["updating <code>best</code> before restoring validity", "reports an invalid window as the answer"],
      ["non-ASCII / full unicode", "a fixed <code>[0]*26</code> array indexes out of range; use a dict"],
      ["deque holding values instead of indices", "cannot tell when the maximum has slid out of the window"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "<code>if</code> instead of <code>while</code> when restoring validity",
      wrong: [
        "for r, ch in enumerate(s):",
        "    if ch in seen:      # removes only ONE",
        "        seen.remove(s[l]); l += 1",
        "    seen.add(ch)",
        "    best = max(best, r - l + 1)",
        "",
        "# s='abba': at r=3 one removal is not",
        "# enough; the window keeps a duplicate",
        "# 'b' and best is reported as 3"
      ],
      right: [
        "for r, ch in enumerate(s):",
        "    while ch in seen:   # as many as needed",
        "        seen.remove(s[l]); l += 1",
        "    seen.add(ch)",
        "    best = max(best, r - l + 1)",
        "",
        "# s='abba' -> 2, correct"
      ],
      note:
        "The <code>while</code> is not a pessimisation: the amortised bound still holds because l only moves forward. " +
        "Conversely, a <em>fixed-size</em> window needs <code>if</code> (exactly one eviction), since a " +
        "<code>while</code> there would shrink the window below k."
    },
    {
      n: 2,
      title: "Recording the answer before the window is valid again",
      wrong: [
        "for r, ch in enumerate(s):",
        "    seen.add(ch)",
        "    best = max(best, r - l + 1)  # too early",
        "    while len(seen) < r - l + 1:",
        "        seen.discard(s[l]); l += 1"
      ],
      right: [
        "for r, ch in enumerate(s):",
        "    while ch in seen:",
        "        seen.remove(s[l]); l += 1",
        "    seen.add(ch)",
        "    best = max(best, r - l + 1)  # after restore"
      ],
      note:
        "Order of the three steps <em>is</em> the algorithm: restore validity, then extend, then record. Recording " +
        "first reports windows that violate the constraint. The wrong version also mixes a set with a length test, " +
        "which cannot detect duplicates at all once <code>discard</code> is used."
    },
    {
      n: 3,
      title: "Count map never pruned, so the distinct-count test is wrong",
      wrong: [
        "cnt[s[l]] -= 1",
        "l += 1",
        "while len(cnt) > k:  # zero entries counted",
        "    ...",
        "",
        "# 'a' with count 0 keeps len(cnt) high",
        "# -> shrinks forever / wrong answer"
      ],
      right: [
        "cnt[s[l]] -= 1",
        "if cnt[s[l]] == 0:",
        "    del cnt[s[l]]    # keep len() == distinct",
        "l += 1",
        "while len(cnt) > k:",
        "    ..."
      ],
      note:
        "<code>len(counter)</code> counts keys, not <em>positive</em> keys. Either delete on zero, or track a separate " +
        "<code>distinct</code> integer that you increment on 0&rarr;1 and decrement on 1&rarr;0. Mixing the two " +
        "conventions in one function is a classic self-inflicted failure."
    },
    {
      n: 4,
      title: "Monotonic deque stores values, or uses the wrong comparison",
      wrong: [
        "while dq and dq[-1] < a[i]:",
        "    dq.pop()          # values, not indices",
        "dq.append(a[i])",
        "if i >= k - 1:",
        "    out.append(dq[0])",
        "if dq[0] == a[i-k+1]:  # ambiguous on ties",
        "    dq.popleft()"
      ],
      right: [
        "while dq and a[dq[-1]] <= a[i]:",
        "    dq.pop()          # indices",
        "dq.append(i)",
        "if dq[0] <= i - k:",
        "    dq.popleft()      # expired by index",
        "if i >= k - 1:",
        "    out.append(a[dq[0]])"
      ],
      note:
        "Two fixes. Store <strong>indices</strong> so expiry is decidable by position rather than by a value comparison " +
        "that duplicates break. Use <code>&le;</code> when popping the tail so equal values are collapsed &mdash; with " +
        "<code>&lt;</code> the deque keeps duplicate maxima, which is still correct for the answer but costs extra " +
        "space and confuses the expiry check."
    }
  ],

  practice: {
    caption: "Drill set for Sliding Window",
    rows: [
      ["Best Time to Buy and Sell Stock", "LC 121", "Easy", "degenerate window: track the running minimum"],
      ["Contains Duplicate II", "LC 219", "Easy", "fixed window of size k with a set, <code>if</code>-style eviction"],
      ["Longest Repeating Character Replacement", "LC 424", "Medium", "validity = <code>len - maxfreq &le; k</code>; why a stale maxfreq is still correct"],
      ["Permutation in String", "LC 567", "Medium", "fixed window + count-vector equality"],
      ["Fruit Into Baskets", "LC 904", "Medium", "prune zero counts to keep <code>len(cnt)</code> honest"],
      ["Max Consecutive Ones III", "LC 1004", "Medium", "window on a violation budget rather than on values"],
      ["Subarrays with K Different Integers", "LC 992", "Hard", "<code>atMost(k) - atMost(k-1)</code> decomposition"],
      ["Minimum Window Substring", "LC 76", "Hard", "surplus counts, strict improvement test, <code>missing</code> bookkeeping"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;Longest substring with at most k distinct characters.&rdquo;",
      options: ["Sliding window", "Two pointers", "Prefix sums + hash", "DP"],
      answer: 0,
      why: "Contiguous, the predicate is on the contents, and the count map updates in O(1). All three triggers fire."
    },
    {
      prompt: "Subarray summing to a target, and the array <strong>may contain negatives</strong>.",
      options: ["Sliding window", "Prefix sums + hash map", "Monotonic deque", "Two pointers"],
      answer: 1,
      why: "Shrinking can raise the sum once negatives exist, so L(r) is not monotone and the window invariant collapses."
    },
    {
      prompt: "The prompt says <strong>&ldquo;subsequence&rdquo;</strong>, not substring.",
      options: ["Sliding window", "DP", "Two pointers", "Heap"],
      answer: 1,
      why: "A window is contiguous by construction — it cannot skip elements. Non-contiguous selection is DP or greedy."
    },
    {
      prompt: "Maximum inside <strong>every window of fixed size k</strong>.",
      options: ["Recompute per window", "Monotonic deque", "Heap with lazy delete", "Sort each window"],
      answer: 1,
      why: "Recomputing is O(nk); a heap with lazy deletion is O(n log n). The deque is O(n) — each index is pushed once and popped at most once."
    },
    {
      prompt: "&ldquo;Longest subarray with <strong>at most k replacements</strong> allowed.&rdquo;",
      options: ["Window on the violation count", "Prefix sums", "Backtracking", "Binary search"],
      answer: 0,
      why: "The budget is just another validity predicate, and it is still monotone under shrinking, so the ordinary window applies."
    },
    {
      prompt: "&ldquo;Count subarrays with <strong>exactly</strong> k distinct integers.&rdquo;",
      options: ["One window for 'exactly k'", "atMost(k) − atMost(k−1)", "DP", "Two pointers"],
      answer: 1,
      why: "'Exactly' is not monotone, so no single window works. The difference of two monotone counts is, and each is a normal window."
    },
    {
      prompt: "A <strong>fixed-size</strong> window of size k. Which eviction does the shrink step use?",
      options: ["while (drain until valid)", "if (exactly one eviction)", "Neither — recompute", "Both, whichever fires"],
      answer: 1,
      why: "A while loop can collapse the window below k. Fixed size means exactly one element enters and exactly one leaves."
    },
    {
      prompt: "You need the <strong>k-th largest element overall</strong>, not per window.",
      options: ["Sliding window", "Heap or quickselect", "Monotonic deque", "Prefix fold"],
      answer: 1,
      why: "There is no contiguity to exploit, so the window buys nothing. That is a selection problem — topic 09."
    },
    {
      prompt: "You need the <strong>count</strong> of valid subarrays, not the longest one.",
      options: ["Track the max as usual", "Window, adding r − l + 1 per step", "Backtracking", "Sort first"],
      answer: 1,
      why: "Every start in [l, r] gives a valid subarray ending at r, so each step contributes r − l + 1. Tracking only the max throws that count away."
    }
  ]
};
