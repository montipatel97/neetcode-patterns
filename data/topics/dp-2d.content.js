/* Topic content, transcribed from the 2-D Dynamic Programming chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["dp-2d"] = {
  id: "dp-2d",
  number: "14",
  title: "2-D Dynamic Programming",
  subtitle: "Two-sequence tables, knapsack capacity states, grid paths, interval DP, space reduction",
  accent: "emerald",
  bounds: { time: "O(n&middot;m)", space: "O(n&middot;m) or O(min(n,m))", driver: "one state per index pair" },

  mechanics: {
    lede:
      "The second dimension always comes from one of four places. <strong>Two sequences</strong>: " +
      "<code>dp[i][j]</code> over a prefix of each &mdash; LCS, Edit Distance, Regex Matching. <strong>A resource or " +
      "budget</strong>: <code>dp[i][w]</code>, first i items within capacity w &mdash; 0/1 Knapsack, Partition Equal " +
      "Subset Sum, Target Sum. <strong>A grid</strong>: <code>dp[r][c]</code> &mdash; Unique Paths, Min Path Sum, " +
      "Maximal Square. <strong>An interval</strong>: <code>dp[i][j]</code> over the subarray <code>i..j</code> &mdash; " +
      "Longest Palindromic Subsequence, Burst Balloons.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Two sequences",
        blurb: "The table is 1-indexed so that row 0 and column 0 are the &ldquo;one sequence is empty&rdquo; base cases.",
        caption: "Longest Common Subsequence",
        code: [
          "def lcs(a, b):",
          "    n, m = len(a), len(b)",
          "    dp = [[0] * (m + 1) for _ in range(n + 1)]",
          "    for i in range(1, n + 1):",
          "        for j in range(1, m + 1):",
          "            if a[i - 1] == b[j - 1]:   # note the -1",
          "                dp[i][j] = dp[i - 1][j - 1] + 1",
          "            else:",
          "                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])",
          "    return dp[n][m]"
        ],
        invariant:
          "<code>dp[i][j]</code> is the answer for the prefixes <code>a[:i]</code> and <code>b[:j]</code>. Every read " +
          "is from <code>dp[i-1][j-1]</code>, <code>dp[i-1][j]</code> or <code>dp[i][j-1]</code> &mdash; all strictly " +
          "earlier in row-major order, which is why a plain nested ascending loop is a valid fill order."
      },
      {
        tag: "Mechanism B",
        name: "0/1 knapsack, and why the 1-D version iterates downwards",
        blurb: "<strong>The sweep direction is the algorithm.</strong>",
        caption: "Partition Equal Subset Sum, reduced to one row",
        code: [
          "def can_partition(nums):",
          "    total = sum(nums)",
          "    if total % 2:",
          "        return False           # odd total: impossible",
          "    target = total // 2",
          "    dp = [False] * (target + 1)",
          "    dp[0] = True               # empty subset sums to 0",
          "    for x in nums:",
          "        for w in range(target, x - 1, -1):   # DESCENDING",
          "            if dp[w - x]:",
          "                dp[w] = True",
          "    return dp[target]"
        ],
        invariant:
          "After processing the first t items, <code>dp[w]</code> is True iff some subset of those t items sums to w. " +
          "Descending w guarantees that <code>dp[w - x]</code> still refers to the state <em>before</em> item x was " +
          "considered. Ascending would read a value already updated with x, which silently permits using x twice " +
          "&mdash; that is exactly the <em>unbounded</em> knapsack recurrence, a different problem."
      },
      {
        tag: "Mechanism C",
        name: "Grid DP",
        blurb: "The last step is a single move, so the path sets partition and the counts add.",
        caption: "Unique Paths",
        code: [
          "def unique_paths(m, n):",
          "    dp = [[1] * n for _ in range(m)]  # row 0, col 0 = 1",
          "    for r in range(1, m):",
          "        for c in range(1, n):",
          "            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]",
          "    return dp[m - 1][n - 1]"
        ],
        invariant:
          "The base cases are the single degenerate paths along the top row and left column. For Min Path Sum the same " +
          "partition applies with <code>min</code> and the cell&rsquo;s own cost added."
      },
      {
        tag: "Mechanism D",
        name: "Interval DP, filled by increasing length",
        blurb: "Row-major order is <em>wrong</em> here &mdash; the reads sit below the writes.",
        caption: "Longest Palindromic Subsequence",
        code: [
          "def lps(s):",
          "    n = len(s)",
          "    dp = [[0] * n for _ in range(n)]",
          "    for i in range(n):",
          "        dp[i][i] = 1               # length-1 intervals",
          "    for length in range(2, n + 1):  # OUTER is the LENGTH",
          "        for i in range(n - length + 1):",
          "            j = i + length - 1",
          "            if s[i] == s[j]:",
          "                dp[i][j] = 2 + (dp[i+1][j-1]",
          "                                if length > 2 else 0)",
          "            else:",
          "                dp[i][j] = max(dp[i+1][j], dp[i][j-1])",
          "    return dp[0][n - 1]"
        ],
        invariant:
          "Interval DP reads <code>dp[i+1][j-1]</code>, <code>dp[i+1][j]</code> and <code>dp[i][j-1]</code> &mdash; all " +
          "<em>shorter</em> intervals, some of which sit below <code>(i, j)</code> in the table. Iterating by " +
          "increasing length (or i descending and j ascending) is mandatory, not stylistic."
      }
    ],
    aside: {
      title: "The 1-D vs 2-D test, stated operationally",
      body:
        "Write down what you must know, at the moment you make a decision about item i, in order to finish optimally. " +
        "If the answer is &ldquo;just where I am&rdquo;, the state is <code>dp[i]</code> and the DP is 1-D. If it is " +
        "&ldquo;where I am, <em>and</em> how much capacity/budget/transactions/characters-of-the-other-string I have " +
        "left&rdquo;, each of those extra facts is another dimension. Two corollaries: a fixed small bound on the extra " +
        "fact (at most 2 transactions, at most k deletions) still means 2-D, just with a short second axis; and if the " +
        "second fact is <em>unbounded</em>, a DP is probably not the intended approach at all."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of the LCS recurrence",
        sub: "the matching case needs an exchange argument",
        body:
          "<p><strong>Case <code>a[i-1] == b[j-1] = ch</code>.</strong> Claim: some LCS of the two prefixes ends with " +
          "<code>ch</code> used as that final pair. Suppose an LCS L does not. If L uses <code>a[i-1]</code> matched to " +
          "some earlier <code>b[j']</code> with <code>j' &lt; j-1</code>, then re-matching it to <code>b[j-1]</code> " +
          "keeps L a valid common subsequence <em>of the same length</em> (all other matched pairs remain in order, " +
          "since <code>b[j-1]</code> is last). Same for the mirror case; and if L uses neither character, appending the " +
          "pair increases the length, contradicting optimality. So we may assume the final pair is used, giving " +
          "<code>dp[i][j] = 1 + dp[i-1][j-1]</code>.</p>" +
          "<p><strong>Case <code>a[i-1] != b[j-1]</code>.</strong> No LCS can use both as a matched pair, so at least " +
          "one of the two final characters is unused. If <code>a[i-1]</code> is unused the answer is " +
          "<code>dp[i-1][j]</code>; if <code>b[j-1]</code> is unused it is <code>dp[i][j-1]</code>. These cases cover " +
          "everything (they may overlap, which is harmless for a maximum), so the answer is their max.</p>"
      },
      {
        title: "Correctness of the 0/1 knapsack recurrence",
        sub: "and why the 1-D reduction is a provable rewrite",
        body:
          "<p><code>dp[i][w]</code> = best value using the first i items within capacity w. Partition by the last " +
          "decision: either item i is excluded, giving <code>dp[i-1][w]</code>, or it is included, requiring " +
          "<code>w &ge; weight_i</code> and giving <code>dp[i-1][w - weight_i] + value_i</code>. Every feasible " +
          "selection falls into exactly one class, and both classes are achievable, so the max is exact.</p>" +
          "<p>The 1-D reduction is valid because row i reads <em>only</em> row <code>i-1</code>; the descending sweep is " +
          "what simulates the second row without allocating it. This is a provable rewrite, not a trick &mdash; and " +
          "whenever you compress a 2-D DP into one row, the question to ask is &ldquo;which cells of the previous row " +
          "do I still need?&rdquo;, then pick the direction that preserves them.</p>"
      },
      {
        title: "Correctness of grid path counting",
        sub: "the last step is a single move",
        body:
          "<p>Every path to <code>(r, c)</code> (moving only down and right) arrives from <code>(r-1, c)</code> or " +
          "<code>(r, c-1)</code>, and <em>never both</em> &mdash; the last step is a single move. So the path sets " +
          "partition, and the counts add.</p>" +
          "<p>The base cases are the single degenerate paths along the top row and left column. For Min Path Sum the " +
          "same partition applies with <code>min</code> and the cell&rsquo;s own cost added.</p>" +
          "<p><strong>Complexity.</strong> Again <code>(states) &times; (transition cost)</code>, with each state " +
          "computed once.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "<code>O(n&middot;W)</code> for knapsack is <strong>pseudo-polynomial</strong> &mdash; W is a value, so the " +
        "running time is exponential in the bit-length of the input. That is why 0/1 knapsack is NP-hard in general yet " +
        "routinely solved in interviews: <em>the constraints quietly bound W</em>. If W is up to " +
        "10<sup>9</sup>, the DP is dead and the intended solution is something else (meet in the middle, or a greedy " +
        "relaxation)."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Problem", "States", "Time", "Space (reduced)"],
      rows: [
        ["LCS / Edit Distance", "n&middot;m", "O(n&middot;m)", "O(min(n,m)) with two rows"],
        ["Interleaving String", "n&middot;m", "O(n&middot;m)", "O(m)"],
        ["Regex / Wildcard Matching", "n&middot;m", "O(n&middot;m)", "O(m)"],
        ["0/1 Knapsack", "n&middot;W", "O(n&middot;W)", "O(W) one row, descending"],
        ["Partition Equal Subset Sum", "n&middot;(S/2)", "O(n&middot;S)", "O(S)"],
        ["Target Sum", "n&middot;(2S+1)", "O(n&middot;S)", "O(S)"],
        ["Unique Paths / Min Path Sum", "n&middot;m", "O(n&middot;m)", "O(m) one row"],
        ["Maximal Square", "n&middot;m", "O(n&middot;m)", "O(m)"],
        ["Longest Palindromic Subsequence", "n&sup2;", "O(n&sup2;)", "O(n) with care"],
        ["Burst Balloons / Matrix Chain", "n&sup2;", "O(n&sup3;) with split points", "O(n&sup2;)"],
        ["Longest Increasing Path in a Matrix", "n&middot;m", "O(n&middot;m)", "O(n&middot;m) memo"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["two strings / arrays compared", "2-D over both prefixes", "one index cannot say where you are in the other sequence"],
      ["&ldquo;subsequence&rdquo; between two sequences", "2-D (LCS family)", "a window requires contiguity"],
      ["&ldquo;subarray&rdquo;/&ldquo;substring&rdquo; that must be contiguous", "1-D DP or sliding window", "contiguity collapses one dimension"],
      ["a weight/value budget that must be respected", "2-D <code>dp[i][w]</code>", "without the capacity axis, items can be reused or over-spent"],
      ["unbounded item reuse", "1-D over capacity, <strong>ascending</strong>", "the descending sweep forbids reuse"],
      ["each item used at most once", "1-D over capacity, <strong>descending</strong>", "ascending silently allows reuse"],
      ["grid with moves down/right only", "2-D grid DP", "BFS is for arbitrary movement; DP exploits the DAG order"],
      ["grid with 4-directional movement and costs", "Dijkstra / BFS <span class='topic-ref'>topics 11-12</span>", "cyclic movement has no valid DP fill order"],
      ["the subproblem is a range, and the split point matters", "interval DP, O(n&sup3;)", "prefix DP cannot express &ldquo;choose a split&rdquo;"],
      ["&ldquo;longest palindromic <em>substring</em>&rdquo;", "expand around centres, O(n&sup2;) time O(1) space", "the interval DP table is O(n&sup2;) space for no gain"],
      ["&ldquo;at most k transactions/deletions/replacements&rdquo;", "2-D with k as the second axis", "folding k into one index loses the state"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["either sequence empty", "row 0 / column 0 must be initialised; for Edit Distance they are <code>0..n</code>, not zeros"],
      ["both sequences empty", "answer 0 (LCS) or 0 edits; the <code>(n+1)&times;(m+1)</code> table handles it for free"],
      ["<code>dp</code> indexed <code>[i]</code> instead of <code>[i-1]</code> into the input", "off-by-one comparisons; the table is 1-indexed, the strings are 0-indexed"],
      ["odd total in Partition Equal Subset Sum", "no split exists; returning <code>dp[total//2]</code> on the floored half gives a wrong True"],
      ["capacity 0", "<code>dp[0] = True</code> is the only reachable state; the loop <code>range(target, x-1, -1)</code> must not run"],
      ["item heavier than the capacity", "<code>range(target, x-1, -1)</code> is empty, which is correct &mdash; verify rather than special-casing"],
      ["ascending sweep in a 1-D 0/1 knapsack", "items get reused; solves the unbounded variant instead"],
      ["obstacle at the start or end cell (Unique Paths II)", "<code>dp[0][0] = 1</code> unconditionally counts a path through a wall"],
      ["first row after an obstacle", "must be 0 from the obstacle onward, not 1"],
      ["interval DP filled row-major", "reads <code>dp[i+1][j-1]</code> before it is written; fill by increasing length"],
      ["interval of length 2 (the <code>length &gt; 2</code> guard)", "<code>dp[i+1][j-1]</code> with <code>i+1 &gt; j-1</code> indexes a garbage cell"],
      ["negative numbers in subset-sum style problems", "array indices go negative; shift by an offset or use a dict/set"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "1-D 0/1 knapsack sweeping the capacity upwards",
      wrong: [
        "dp = [False] * (target + 1)   # ASC",
        "dp[0] = True",
        "for x in nums:",
        "    for w in range(x, target + 1):",
        "        dp[w] = dp[w] or dp[w - x]",
        "",
        "# nums=[5], target=10 -> dp[5]=True",
        "# then dp[10] |= dp[5] -> True,",
        "# reusing the single 5 twice"
      ],
      right: [
        "dp = [False] * (target + 1)   # DESC",
        "dp[0] = True",
        "for x in nums:",
        "    for w in range(target, x - 1, -1):",
        "        dp[w] = dp[w] or dp[w - x]",
        "",
        "# nums=[5], target=10 -> dp[10] False"
      ],
      note:
        "The sweep direction is the difference between the 0/1 and unbounded knapsack. Descending means " +
        "<code>dp[w-x]</code> has <em>not yet</em> seen item x; ascending means it has. Whenever you compress a 2-D DP " +
        "into one row, check which cells of the previous row you still need and pick the direction that preserves them."
    },
    {
      n: 2,
      title: "Table 1-indexed, strings indexed as if 0-based",
      wrong: [
        "for i in range(1, n + 1):",
        "    for j in range(1, m + 1):",
        "        if a[i] == b[j]:      # IndexError",
        "            dp[i][j] = dp[i-1][j-1] + 1",
        "        else:",
        "            dp[i][j] = max(dp[i-1][j],",
        "                           dp[i][j-1])"
      ],
      right: [
        "for i in range(1, n + 1):",
        "    for j in range(1, m + 1):",
        "        if a[i-1] == b[j-1]:  # shift by one",
        "            dp[i][j] = dp[i-1][j-1] + 1",
        "        else:",
        "            dp[i][j] = max(dp[i-1][j],",
        "                           dp[i][j-1])"
      ],
      note:
        "The <code>(n+1)&times;(m+1)</code> table exists so that index 0 means &ldquo;empty prefix&rdquo;, which removes " +
        "all base-case branching. The price is a permanent <code>-1</code> on every input access. Say &ldquo;dp is " +
        "one-indexed, the strings are zero-indexed&rdquo; before you start typing."
    },
    {
      n: 3,
      title: "Edit Distance with zeroed base cases",
      wrong: [
        "dp = [[0] * (m+1) for _ in range(n+1)]",
        "# first row/col left at 0",
        "for i in range(1, n+1):",
        "    for j in range(1, m+1):",
        "        ...",
        "",
        "# converting 'abc' to '' costs 0",
        "# -> answers are too small"
      ],
      right: [
        "dp = [[0] * (m+1) for _ in range(n+1)]",
        "for i in range(n+1):",
        "    dp[i][0] = i     # delete i chars",
        "for j in range(m+1):",
        "    dp[0][j] = j     # insert j chars",
        "for i in range(1, n+1):",
        "    for j in range(1, m+1):",
        "        ..."
      ],
      note:
        "Base cases are part of the recurrence, not boilerplate. For LCS zeros happen to be correct (no common " +
        "subsequence with an empty string); for Edit Distance they are wrong, because turning a length-i string into an " +
        "empty one costs i deletions. Always ask <em>&ldquo;what is the answer when one side is empty?&rdquo;</em> " +
        "rather than defaulting to 0."
    },
    {
      n: 4,
      title: "Interval DP filled in the wrong order",
      wrong: [
        "for i in range(n):",
        "    for j in range(i, n):",
        "        if s[i] == s[j]:",
        "            dp[i][j] = 2 + dp[i+1][j-1]",
        "        else:",
        "            dp[i][j] = max(dp[i+1][j],",
        "                           dp[i][j-1])",
        "",
        "# dp[i+1][*] is a LATER row,",
        "# still all zeros -> answers too small"
      ],
      right: [
        "for i in range(n):",
        "    dp[i][i] = 1",
        "for length in range(2, n + 1):",
        "    for i in range(n - length + 1):",
        "        j = i + length - 1",
        "        if s[i] == s[j]:",
        "            dp[i][j] = 2 + (dp[i+1][j-1]",
        "                            if length > 2 else 0)",
        "        else:",
        "            dp[i][j] = max(dp[i+1][j],",
        "                           dp[i][j-1])"
      ],
      note:
        "Equivalent fix: iterate i from <code>n-1</code> down to 0 with j from <code>i+1</code> up. Either way the rule " +
        "is the invariant &mdash; a state may only read states already final. The <code>length &gt; 2</code> guard is " +
        "the second half of the bug: at length 2 the inner interval is empty and <code>dp[i+1][j-1]</code> would index " +
        "a cell with <code>i+1 &gt; j-1</code>."
    }
  ],

  practice: {
    caption: "Drill set for 2-D DP",
    rows: [
      ["Unique Paths II", "LC 63", "Medium", "obstacles, and the first-row propagation edge case"],
      ["Min Path Sum", "LC 64", "Medium", "same table with <code>min</code>; in-place reduction to O(1) extra"],
      ["Maximal Square", "LC 221", "Medium", "<code>1 + min</code> of three neighbours; why min and not max"],
      ["Target Sum", "LC 494", "Medium", "reduce +/- assignment to a subset-sum with an offset"],
      ["Longest Palindromic Subsequence", "LC 516", "Medium", "interval DP, fill by increasing length"],
      ["Best Time to Buy and Sell Stock IV", "LC 188", "Hard", "k transactions as the second axis; two states per cell"],
      ["Edit Distance", "LC 72", "Hard", "three operations, non-zero base rows"],
      ["Regular Expression Matching", "LC 10", "Hard", "<code>*</code> consuming zero or more; the trickiest transition in the topic"],
      ["Burst Balloons", "LC 312", "Hard", "interval DP with a split point: O(n&sup3;), and why you pick the <em>last</em> balloon"]
    ]
  },

  quiz: [
    {
      prompt: "Two strings compared, and the prompt says <strong>subsequence</strong>.",
      options: ["Sliding window", "2-D over both prefixes", "1-D DP", "Greedy"],
      answer: 1,
      why: "One index cannot say where you are in the other sequence, and a window requires contiguity that a subsequence does not have."
    },
    {
      prompt: "0/1 knapsack compressed to one row. Which sweep direction?",
      options: ["Ascending", "Descending", "Either", "Two passes"],
      answer: 1,
      why: "Descending keeps dp[w−x] referring to the state before item x. Ascending reads a value already updated with x, which reuses the item."
    },
    {
      prompt: "The same problem but items may be <strong>reused unlimited times</strong>.",
      options: ["Descending sweep", "Ascending sweep", "2-D table only", "Greedy"],
      answer: 1,
      why: "Ascending is exactly the unbounded recurrence: dp[w−x] has already seen x, so x can be taken again."
    },
    {
      prompt: "Grid with <strong>4-directional</strong> movement and per-cell costs.",
      options: ["2-D grid DP", "Dijkstra / BFS", "Interval DP", "Knapsack"],
      answer: 1,
      why: "Cyclic movement has no valid DP fill order — you can return to a cell you already finalised. That is a shortest-path problem."
    },
    {
      prompt: "The subproblem is a <strong>range</strong>, and where you split it matters.",
      options: ["Prefix DP", "Interval DP", "Sliding window", "Knapsack"],
      answer: 1,
      why: "Prefix DP cannot express 'choose a split point'. Interval DP over dp[i][j] can, at O(n³)."
    },
    {
      prompt: "Interval DP. What is the correct fill order?",
      options: ["Row-major ascending", "By increasing interval length", "Column-major", "Any order"],
      answer: 1,
      why: "The reads are shorter intervals, some of which sit below (i, j) in the table. Row-major reads them before they are written."
    },
    {
      prompt: "&ldquo;Longest palindromic <strong>substring</strong>&rdquo; (contiguous).",
      options: ["Interval DP table", "Expand around centres", "LCS with the reverse", "Knapsack"],
      answer: 1,
      why: "Expanding around 2n−1 centres is O(n²) time and O(1) space; the interval table costs O(n²) space for no gain."
    },
    {
      prompt: "Edit Distance. What goes in row 0 and column 0?",
      options: ["All zeros", "0..n and 0..m", "All infinity", "All ones"],
      answer: 1,
      why: "Turning a length-i string into an empty one costs i deletions. Zeros are right for LCS and wrong here — base cases are part of the recurrence."
    },
    {
      prompt: "Knapsack where the capacity W is up to 10<sup>9</sup>.",
      options: ["Standard DP", "Not a DP problem at that size", "Compress to one row", "Memoise"],
      answer: 1,
      why: "O(n·W) is pseudo-polynomial. At that W the DP is dead and the intended solution is something else — meet in the middle, or a greedy relaxation."
    }
  ]
};
