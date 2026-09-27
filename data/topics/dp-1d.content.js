/* Topic content, transcribed from the 1-D Dynamic Programming chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["dp-1d"] = {
  id: "dp-1d",
  number: "13",
  title: "1-D Dynamic Programming",
  subtitle: "State design over one index, recurrence proofs, loop order, rolling-variable space",
  accent: "green",
  bounds: { time: "O(n &middot; transitions)", space: "O(n) or O(1)", driver: "one state per index" },

  mechanics: {
    lede:
      "Four commitments, made out loud before any code. <strong>1. State</strong>: what does <code>dp[i]</code> mean, " +
      "in one sentence? <strong>2. Recurrence</strong>: how does <code>dp[i]</code> follow from smaller states? " +
      "<strong>3. Base cases.</strong> <strong>4. Order and answer</strong>: which direction fills the table, and where " +
      "is the answer? For House Robber those are: <em>max loot from houses 0..i</em>; " +
      "<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>; <code>dp[0] = nums[0]</code>, " +
      "<code>dp[1] = max(nums[0], nums[1])</code>; ascending i, answer at <code>dp[n-1]</code>.",
    mechanisms: [
      {
        tag: "Conventions",
        name: "Two state conventions &mdash; pick one and stay consistent",
        blurb:
          "<strong>A, index-inclusive:</strong> <code>dp[i]</code> is the best answer for the subarray/prefix " +
          "<em>ending at i</em>; <code>dp</code> has length n, and the answer is often <code>max(dp)</code>. Natural " +
          "for House Robber, Kadane, LIS. <strong>B, count-prefixed:</strong> <code>dp[i]</code> is the best answer " +
          "<em>using the first i items</em>; <code>dp</code> has length <code>n+1</code>, <code>dp[0]</code> is the " +
          "base, and the answer is at <code>dp[n]</code>. Natural for Climbing Stairs, Coin Change, Word Break.",
        caption: null,
        code: null,
        invariant:
          "When <code>dp[i]</code> is written, every state it reads is already final. That is the <em>only</em> " +
          "obligation the loop order has, and it is what makes an ascending loop correct here and a descending loop " +
          "correct for 0/1 knapsack <span class='topic-ref'>topic 14</span>."
      },
      {
        tag: "Mechanism A",
        name: "Bounded lookback, so rolling variables replace the table",
        blurb: "If <code>dp[i]</code> reads only <code>dp[i-1]</code> and <code>dp[i-2]</code>, keep two scalars.",
        caption: "House Robber in O(1) space",
        code: [
          "def rob(nums):",
          "    prev2 = prev1 = 0        # dp[i-2], dp[i-1]",
          "    for x in nums:",
          "        prev2, prev1 = prev1, max(prev1, prev2 + x)",
          "    return prev1"
        ],
        invariant:
          "The <em>simultaneous</em> assignment matters &mdash; sequential assignment would overwrite " +
          "<code>prev1</code> before it is read as <code>dp[i-1]</code>."
      },
      {
        tag: "Mechanism B",
        name: "Unbounded lookback, so the table stays",
        blurb: "When <code>dp[a]</code> can read any earlier state, you need all of them.",
        caption: "Coin Change: dp over amounts",
        code: [
          "def coin_change(coins, amount):",
          "    INF = float('inf')",
          "    dp = [0] + [INF] * amount   # fewest coins for a",
          "    for a in range(1, amount + 1):",
          "        for c in coins:",
          "            if c <= a and dp[a - c] + 1 < dp[a]:",
          "                dp[a] = dp[a - c] + 1",
          "    return -1 if dp[amount] == INF else dp[amount]"
        ],
        invariant:
          "A minimisation table must start at the identity for <code>min</code>, which is <code>+inf</code>. Only " +
          "<code>dp[0] = 0</code> is a real base case, and the <code>inf</code> sentinel doubles as the " +
          "unreachability flag &mdash; so the <code>-1</code> check is free."
      },
      {
        tag: "Mechanism C",
        name: "Counting DP and the loop-order trap",
        blurb: "For counting problems, <strong>the loop order decides what you count</strong>.",
        caption: "Combinations versus permutations",
        code: [
          "# Coin Change II -- count COMBINATIONS (multisets)",
          "for c in coins:                  # coins OUTSIDE",
          "    for a in range(c, amount + 1):",
          "        dp[a] += dp[a - c]",
          "",
          "# Combination Sum IV -- count PERMUTATIONS (sequences)",
          "for a in range(1, target + 1):   # amount OUTSIDE",
          "    for c in coins:",
          "        if c <= a:",
          "            dp[a] += dp[a - c]"
        ],
        invariant:
          "Both recurrences are <em>correct</em>; they answer different questions. &ldquo;Is order significant?&rdquo; " +
          "is the question to ask the interviewer before writing either."
      },
      {
        tag: "Mechanism D",
        name: "Top-down memo &mdash; the same DP with no order to reason about",
        blurb: "Memoisation derives the order from the call graph, so it is faster to write when the dependency structure is awkward.",
        caption: "One decorator away",
        code: [
          "from functools import cache",
          "",
          "def coin_change(coins, amount):",
          "    @cache",
          "    def best(a):",
          "        if a == 0: return 0",
          "        if a < 0:  return float('inf')",
          "        return min((best(a - c) + 1 for c in coins),",
          "                   default=float('inf'))",
          "    r = best(amount)",
          "    return -1 if r == float('inf') else r"
        ],
        invariant:
          "The cost is O(depth) stack &mdash; at <code>amount = 10^4</code> with coin 1 this is a " +
          "<code>RecursionError</code>, which is exactly when you convert to bottom-up."
      }
    ],
    aside: {
      title: "The convention-mixing trap",
      body:
        "Convention B shifts every array access: <code>dp[i]</code> depends on the item at <code>nums[i-1]</code>, not " +
        "<code>nums[i]</code>. Mixing the two conventions inside one function is the most common source of off-by-one " +
        "errors in the topic. State which one you are using out loud."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Optimal substructure, proved rather than assumed",
        sub: "house robber",
        body:
          "<p><strong>Claim:</strong> <code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>, where <code>dp[i]</code> is " +
          "the optimum over houses <code>0..i</code>.</p>" +
          "<p><strong>Upper bound.</strong> Take any valid (no two adjacent) selection S of <code>0..i</code>. Either i " +
          "is not in S, in which case S is a valid selection of <code>0..i-1</code>, so " +
          "<code>value(S) &le; dp[i-1]</code>; or i is in S, which forces <code>i-1</code> not in S, so " +
          "<code>S \\ {i}</code> is a valid selection of <code>0..i-2</code> and " +
          "<code>value(S) &le; dp[i-2] + nums[i]</code>.</p>" +
          "<p><strong>Achievability.</strong> Both branches are realisable: the optimal selection for " +
          "<code>0..i-1</code> is valid for <code>0..i</code>, and the optimal selection for <code>0..i-2</code> plus " +
          "house i is valid because it omits <code>i-1</code>. Equality follows.</p>" +
          "<p>The shape of this argument &mdash; <em>partition the solution set by the last decision, bound each class " +
          "by a smaller optimum, then check achievability</em> &mdash; is the general proof template for every " +
          "optimisation DP in this topic.</p>"
      },
      {
        title: "Why counting DP needs the loop order fixed",
        sub: "disjoint classes",
        body:
          "<p>For counting, the recurrence must partition the solution set into <em>disjoint</em> classes, or solutions " +
          "get counted more than once.</p>" +
          "<p>With coins outside, the state <code>dp[a]</code> after processing the first t coins means &ldquo;number of " +
          "multisets using only coins <code>1..t</code> summing to a&rdquo;. Each multiset is counted once, at the " +
          "moment its largest-indexed coin is processed &mdash; a canonical representative, so the classes are " +
          "disjoint.</p>" +
          "<p>With amount outside, <code>dp[a]</code> means &ldquo;number of <em>ordered sequences</em> summing to " +
          "a&rdquo;, classified by the first coin used; <code>1+2</code> and <code>2+1</code> are then distinct.</p>"
      },
      {
        title: "Kadane&rsquo;s algorithm and the all-negative case",
        sub: "why the seed is load-bearing",
        body:
          "<p><strong>State:</strong> <code>cur</code> = best sum of a subarray ending at i. <strong>Recurrence:</strong> " +
          "<code>cur = max(nums[i], cur + nums[i])</code> &mdash; either extend the previous best-ending-here or start " +
          "fresh at i.</p>" +
          "<p><strong>Proof:</strong> a subarray ending at i of length 1 is <code>nums[i]</code>; one of length &gt; 1 " +
          "is (a subarray ending at <code>i-1</code>) plus <code>nums[i]</code>, maximised by <code>cur</code>. These " +
          "are all the possibilities, so the max over them is exact.</p>" +
          "<p>The global answer must be seeded with <code>nums[0]</code>, <em>not 0</em> &mdash; seeding with 0 silently " +
          "asserts that the empty subarray is allowed, which is wrong whenever every element is negative.</p>"
      },
      {
        title: "Why the O(n log n) LIS is correct",
        sub: "tails is not an LIS",
        body:
          "<p>Maintain <code>tails</code>, where <code>tails[k]</code> is the smallest possible tail value of any " +
          "increasing subsequence of length <code>k+1</code> seen so far. <code>tails</code> is strictly increasing, so " +
          "it is binary-searchable: if <code>tails[k] &ge; tails[k+1]</code>, truncating the length-<code>k+2</code> " +
          "subsequence gives a length-<code>k+1</code> one with a smaller tail, contradicting minimality.</p>" +
          "<p>Processing x replaces the first entry <code>&ge; x</code> (keeping lengths achievable while lowering a " +
          "tail, which never hurts &mdash; a smaller tail admits at least as many future extensions), or appends when x " +
          "exceeds everything. Therefore <code>len(tails)</code> is the LIS length at every step.</p>" +
          "<p>Note <code>tails</code> is <em>not itself an LIS</em> &mdash; it is a set of best-possible tails, so if " +
          "the problem asks for the actual subsequence you must record predecessor indices separately.</p>" +
          "<p><strong>Complexity.</strong> Running time is <code>(number of states) &times; (cost per transition)</code>, " +
          "because each state is computed exactly once &mdash; that is what memoisation or a single-pass table " +
          "guarantees, and it is the entire speedup over the exponential recursion tree.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "<code>O(n &middot; amount)</code> is <strong>pseudo-polynomial</strong>: <code>amount</code> is a value, not " +
        "an input size, so the bound is exponential in the number of <em>bits</em> of amount. Saying this unprompted is " +
        "a strong signal in a quant-adjacent interview, and it is why Coin Change with " +
        "<code>amount = 10<sup>9</sup></code> is not a DP problem at all."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Problem", "States", "Transition", "Time / Space"],
      rows: [
        ["Climbing Stairs / Fibonacci", "n", "O(1)", "O(n) / O(1) rolling"],
        ["House Robber", "n", "O(1)", "O(n) / O(1) rolling"],
        ["House Robber II (circular)", "n", "O(1)", "O(n) / O(1), run twice"],
        ["Max Subarray (Kadane)", "n", "O(1)", "O(n) / O(1)"],
        ["Coin Change (min coins)", "amount", "O(len(coins))", "O(n &middot; amount) / O(amount)"],
        ["Coin Change II (count)", "amount", "O(1) amortised", "O(n &middot; amount) / O(amount)"],
        ["Word Break", "n", "O(n) substring checks", "O(n&sup2;) with a set / O(n)"],
        ["Decode Ways", "n", "O(1)", "O(n) / O(1) rolling"],
        ["LIS, table version", "n", "O(n)", "O(n&sup2;) / O(n)"],
        ["LIS, patience version", "n", "O(log n) binary search", "O(n log n) / O(n)"],
        ["Palindromic Substrings (expand)", "2n-1 centres", "O(n)", "O(n&sup2;) / O(1)"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "<strong>1-D or 2-D?</strong> Count the parameters you need to describe a subproblem completely: &ldquo;what " +
        "must I know about the past to decide the rest?&rdquo; One position in one sequence &rarr; 1-D. A pair of " +
        "positions in two sequences, or a position <em>plus</em> a remaining resource (capacity, budget, a count of " +
        "allowed transactions) &rarr; 2-D. A useful check: if you find yourself wanting to write <code>dp[i]</code> but " +
        "also needing to remember &ldquo;how much I have spent so far&rdquo;, the state is really " +
        "<code>dp[i][spent]</code> and you have a 2-D problem wearing a 1-D disguise."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;in how many ways&rdquo;, one sequence", "1-D counting DP", "backtracking enumerates instead of counting; exponential"],
      ["&ldquo;min/max over choices&rdquo;, one sequence, no capacity", "1-D optimisation DP", "greedy can be wrong; see the counter-example below"],
      ["a second sequence, or a capacity / budget / transaction count", "2-D DP <span class='topic-ref'>topic 14</span>", "one index cannot separate the states"],
      ["contiguous subarray, non-negative values, monotone predicate", "sliding window <span class='topic-ref'>topic 03</span>", "O(n) with O(1) space beats a DP table"],
      ["contiguous subarray, arbitrary signs, max sum", "Kadane (a 1-D DP)", "a window cannot shrink correctly with negatives"],
      ["a local rule is provably optimal", "greedy <span class='topic-ref'>topic 15</span>", "DP pays O(n &middot; amount) for a decision greedy makes in O(1)"],
      ["&ldquo;list all solutions&rdquo;", "backtracking <span class='topic-ref'>topic 10</span>", "DP stores values, not witness sets"],
      ["overlapping subproblems noticed inside a backtracking solution", "add <code>@cache</code> &mdash; that <em>is</em> the DP", "rewriting bottom-up first wastes interview time"],
      ["recursion depth could reach 10<sup>5</sup>", "bottom-up table", "top-down hits the frame limit"]
    ],
    after:
      "<p><strong>The canonical greedy-fails-DP-works example, worth memorising:</strong> coins " +
      "<code>[1, 3, 4]</code>, amount 6. Greedy takes 4, then 1, then 1 &mdash; three coins. The optimum is " +
      "<code>3 + 3</code> &mdash; two coins. Greedy is only valid for <em>canonical</em> coin systems, and nobody tells " +
      "you whether yours is canonical, so Coin Change is a DP problem.</p>"
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>n == 0</code>", "<code>dp[0] = nums[0]</code> raises <code>IndexError</code>; convention B&rsquo;s <code>dp[0]</code> base avoids this entirely"],
      ["<code>n == 1</code>", "<code>dp[1] = max(nums[0], nums[1])</code> reads past the end"],
      ["all values negative (Kadane)", "seeding <code>best = 0</code> returns 0 instead of the largest single element"],
      ["<code>amount == 0</code>", "Coin Change must return 0; Coin Change II must return 1 (the empty multiset)"],
      ["unreachable target", "<code>dp[amount]</code> stays <code>inf</code>; returning it instead of -1 fails the spec"],
      ["<code>dp</code> initialised to 0 instead of <code>inf</code> for a min-problem", "every amount looks reachable with 0 coins"],
      ["coin value 0 or negative", "infinite loop or nonsense; the constraints usually forbid it &mdash; confirm"],
      ["duplicate coins", "harmless for min-coins, but doubles the count in Coin Change II"],
      ["circular constraint (House Robber II)", "the first and last houses are adjacent; run the linear DP twice, on <code>nums[:-1]</code> and <code>nums[1:]</code>"],
      ["<code>n == 1</code> in House Robber II", "both slices are empty; special-case to <code>nums[0]</code>"],
      ["LIS strict vs non-strict", "<code>bisect_left</code> gives strictly increasing, <code>bisect_right</code> gives non-decreasing &mdash; one character, two problems"],
      ["top-down with <code>amount = 10<sup>4</sup></code> and coin 1", "<code>RecursionError</code> at ~1000 frames"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Kadane seeded with 0",
      wrong: [
        "best = cur = 0",
        "for x in nums:",
        "    cur = max(x, cur + x)",
        "    best = max(best, cur)",
        "return best",
        "",
        "# nums = [-3, -1, -2] -> returns 0,",
        "# asserting the empty subarray is legal"
      ],
      right: [
        "best = cur = nums[0]",
        "for x in nums[1:]:",
        "    cur = max(x, cur + x)",
        "    best = max(best, cur)",
        "return best",
        "",
        "# nums = [-3, -1, -2] -> returns -1"
      ],
      note:
        "Seeding with <code>nums[0]</code> encodes &ldquo;a subarray must be non-empty&rdquo;. The bug is invisible on " +
        "any input containing a positive number, which is why it survives hand-testing &mdash; always try the " +
        "all-negative case explicitly."
    },
    {
      n: 2,
      title: "Counting combinations with the loops the wrong way round",
      wrong: [
        "# Coin Change II: count COMBINATIONS",
        "dp = [1] + [0] * amount",
        "for a in range(1, amount + 1):",
        "    for c in coins:",
        "        if c <= a:",
        "            dp[a] += dp[a - c]",
        "",
        "# coins=[1,2], amount=3 -> 3",
        "# counts 1+1+1, 1+2, 2+1"
      ],
      right: [
        "dp = [1] + [0] * amount",
        "for c in coins:            # coins OUTSIDE",
        "    for a in range(c, amount + 1):",
        "        dp[a] += dp[a - c]",
        "",
        "# coins=[1,2], amount=3 -> 2",
        "# counts {1,1,1} and {1,2}"
      ],
      note:
        "Coins outside counts unordered multisets; amount outside counts ordered sequences. Both loops are three lines " +
        "and look interchangeable. Decide from the problem statement (&ldquo;how many combinations&rdquo; vs &ldquo;how " +
        "many ways to write the total as a sequence&rdquo;) and say which you chose."
    },
    {
      n: 3,
      title: "House Robber reading the adjacent state",
      wrong: [
        "for i in range(1, n):",
        "    dp[i] = max(dp[i-1],",
        "                dp[i-1] + nums[i])",
        "",
        "# dp[i-1] + nums[i] may include",
        "# house i-1, violating the",
        "# no-adjacent constraint;",
        "# [2,7,9] -> 18, but 9+2=11 is the max"
      ],
      right: [
        "dp[0] = nums[0]",
        "dp[1] = max(nums[0], nums[1])",
        "for i in range(2, n):",
        "    dp[i] = max(dp[i-1],",
        "                dp[i-2] + nums[i])",
        "",
        "# [2,7,9] -> 11"
      ],
      note:
        "The constraint lives in <em>the index of the state you add to</em>, so <code>i-2</code> is not a stylistic " +
        "choice &mdash; it <em>is</em> the constraint. Note this also forces two base cases, because the recurrence " +
        "first applies at <code>i = 2</code>."
    },
    {
      n: 4,
      title: "Min-DP initialised with 0, and the unreachable case not reported",
      wrong: [
        "dp = [0] * (amount + 1)",
        "for a in range(1, amount + 1):",
        "    for c in coins:",
        "        if c <= a:",
        "            dp[a] = min(dp[a], dp[a-c] + 1)",
        "return dp[amount]",
        "",
        "# every dp[a] starts at 0, so min()",
        "# keeps 0: returns 0 for any amount"
      ],
      right: [
        "INF = float('inf')",
        "dp = [0] + [INF] * amount",
        "for a in range(1, amount + 1):",
        "    for c in coins:",
        "        if c <= a:",
        "            dp[a] = min(dp[a], dp[a-c] + 1)",
        "return -1 if dp[amount] == INF else dp[amount]"
      ],
      note:
        "A minimisation table must start at the identity for <code>min</code>, which is <code>+inf</code>, and only " +
        "<code>dp[0] = 0</code> is a real base case. The <code>inf</code> sentinel then doubles as the unreachability " +
        "flag, so the <code>-1</code> check is free."
    }
  ],

  practice: {
    caption: "Drill set for 1-D DP",
    rows: [
      ["Climbing Stairs", "LC 70", "Easy", "the minimal recurrence; rolling variables"],
      ["Min Cost Climbing Stairs", "LC 746", "Easy", "two valid state definitions; pick one and keep the base cases straight"],
      ["Maximum Subarray", "LC 53", "Medium", "Kadane, and the all-negative seeding trap"],
      ["House Robber II", "LC 213", "Medium", "circular constraint handled by running the linear DP twice"],
      ["Decode Ways", "LC 91", "Medium", "two-character lookback plus leading-zero validity rules"],
      ["Word Break", "LC 139", "Medium", "<code>dp[i]</code> over prefixes with an O(n) inner scan and a word set"],
      ["Coin Change II", "LC 518", "Medium", "combinations vs permutations, decided by loop order"],
      ["Longest Increasing Subsequence", "LC 300", "Medium", "O(n&sup2;) table first, then the patience/bisect version"],
      ["Partition to K Equal Sum Subsets", "LC 698", "Hard", "when 1-D is not enough and bitmask state is needed"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;<strong>In how many ways</strong> can you climb the stairs?&rdquo;",
      options: ["Backtracking", "1-D counting DP", "Greedy", "Sliding window"],
      answer: 1,
      why: "Backtracking enumerates instead of counting, which is exponential. Counting only needs the number per state."
    },
    {
      prompt: "You need <code>dp[i]</code> but also must remember <strong>how much budget is left</strong>.",
      options: ["Still 1-D", "2-D: dp[i][spent]", "Greedy", "Sliding window"],
      answer: 1,
      why: "One index cannot separate the states. That is a 2-D problem wearing a 1-D disguise — the resource is a second dimension."
    },
    {
      prompt: "Maximum sum of a contiguous subarray, values of <strong>arbitrary sign</strong>.",
      options: ["Sliding window", "Kadane", "Prefix sums + heap", "Greedy"],
      answer: 1,
      why: "A window cannot shrink correctly once negatives are allowed. Kadane is the 1-D DP that handles it in O(n), O(1)."
    },
    {
      prompt: "Coin Change with <code>coins = [1, 3, 4]</code>, <code>amount = 6</code>. Is greedy correct?",
      options: ["Yes", "No — greedy gives 3 coins, optimum is 2", "Only if sorted", "Only for 2 coins"],
      answer: 1,
      why: "Greedy takes 4+1+1; the optimum is 3+3. Greedy is only valid for canonical coin systems, and nobody tells you whether yours is."
    },
    {
      prompt: "&ldquo;Count <strong>combinations</strong>&rdquo; (unordered multisets) summing to the target.",
      options: ["amount outside, coins inside", "coins outside, amount inside", "Either", "Backtracking"],
      answer: 1,
      why: "Coins outside counts each multiset once, at the moment its largest-indexed coin is processed. Amount outside counts ordered sequences instead."
    },
    {
      prompt: "You already wrote a backtracking solution and notice the same state recurring.",
      options: ["Rewrite bottom-up immediately", "Add @cache", "Switch to greedy", "Add pruning"],
      answer: 1,
      why: "That decorator IS the DP. Rewriting bottom-up first wastes interview time; convert only if recursion depth becomes a problem."
    },
    {
      prompt: "A minimisation DP table. What is the correct initial value?",
      options: ["0", "+inf, with dp[0] = 0", "-1", "The first element"],
      answer: 1,
      why: "A table must start at the identity for its operator. Starting at 0 makes min() keep 0 forever, and the inf sentinel doubles as the unreachability flag."
    },
    {
      prompt: "Coin Change where <code>amount = 10<sup>9</sup></code>.",
      options: ["Standard DP", "Not a DP problem at that size", "Add memoisation", "Use a heap"],
      answer: 1,
      why: "O(n·amount) is pseudo-polynomial — amount is a value, not an input size, so the bound is exponential in its bit length."
    },
    {
      prompt: "LIS, and the prompt says <strong>non-decreasing</strong> rather than strictly increasing.",
      options: ["Different algorithm", "bisect_right instead of bisect_left", "Sort first", "Reverse the array"],
      answer: 1,
      why: "One character, two problems. bisect_left keeps it strict; bisect_right admits equal values into the same run."
    }
  ]
};
