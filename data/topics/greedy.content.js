/* Topic content, transcribed from the Greedy chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["greedy"] = {
  id: "greedy",
  number: "15",
  title: "Greedy",
  subtitle: "Local choices with global proofs: exchange arguments, staying ahead, frontier scans",
  accent: "teal",
  bounds: { time: "O(n) or O(n log n)", space: "O(1)", driver: "single scan, sort if ordering needed" },

  mechanics: {
    lede:
      "Greedy code is trivial; greedy <em>proofs</em> are the topic. &ldquo;Why is that optimal?&rdquo; is the " +
      "guaranteed follow-up, so the mechanics here are really the mechanics of two proof templates. " +
      "<strong>Exchange argument:</strong> take any optimal <code>OPT</code>; if it lacks the greedy choice g, swap g " +
      "in for one of OPT&rsquo;s choices; show the result is still feasible and no worse; conclude g is in an optimal " +
      "solution, then induct on the rest. <strong>Greedy stays ahead:</strong> define a measure (reach, finish time, " +
      "count); prove by induction on k that greedy&rsquo;s measure after k steps is at least as good as any " +
      "strategy&rsquo;s; conclude it cannot be beaten at the end.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Frontier / reachability scan",
        blurb: "One integer replaces an exponential set of paths.",
        caption: "Jump Game: track the farthest reachable index",
        code: [
          "def can_jump(nums):",
          "    reach = 0",
          "    for i, x in enumerate(nums):",
          "        if i > reach:",
          "            return False    # a gap: i is unreachable,",
          "                            # and so is everything after",
          "        reach = max(reach, i + x)",
          "    return True"
        ],
        invariant:
          "Before processing index i, <code>reach</code> is the farthest index reachable using only jumps from indices " +
          "<code>&lt; i</code>. If <code>i &gt; reach</code> then no index <code>&ge; i</code> is reachable either, " +
          "because reaching anything beyond i requires standing on some index <code>&le; i</code> first. That second " +
          "clause is what licenses the early <code>return False</code>."
      },
      {
        tag: "Mechanism B",
        name: "Running deficit with a reset",
        blurb: "Two independent accumulators: one global feasibility test, one local candidate.",
        caption: "Gas Station",
        code: [
          "def can_complete_circuit(gas, cost):",
          "    if sum(gas) < sum(cost):",
          "        return -1          # global feasibility test",
          "    tank = start = 0",
          "    for i in range(len(gas)):",
          "        tank += gas[i] - cost[i]",
          "        if tank < 0:       # every start in [start, i] fails",
          "            start = i + 1",
          "            tank = 0",
          "    return start"
        ],
        invariant:
          "<code>tank</code> is the fuel balance of the partial trip beginning at <code>start</code>, and that balance " +
          "has been non-negative at every step so far. When it goes negative at i, the reset is justified by the reset " +
          "lemma: no index in <code>[start, i]</code> can be a valid start."
      },
      {
        tag: "Mechanism C",
        name: "Sort, then scan",
        blurb:
          "When the greedy choice depends on an ordering (earliest finishing, largest ratio, smallest remaining), " +
          "sorting is the pre-pass and the greedy is a single sweep. This is the shape of almost all of topic 16, and " +
          "of Kruskal in topic 12.",
        caption: null,
        code: null,
        invariant: null
      },
      {
        tag: "Mechanism D",
        name: "Heap-driven greedy",
        blurb:
          "When the &ldquo;best remaining&rdquo; changes as you go, the heap <em>is</em> the greedy " +
          "<span class='topic-ref'>topic 09</span>: Task Scheduler, Reorganize String, IPO. The proof is still one of " +
          "the two templates; the heap is only the bookkeeping.",
        caption: null,
        code: null,
        invariant: null
      }
    ],
    aside: {
      title: "Why greedy fails when it fails",
      body:
        "The canonical failure is non-canonical coin systems: with <code>coins = [1, 3, 4]</code> and " +
        "<code>amount = 6</code>, greedy takes 4, then 1, then 1 (three coins) while the optimum is " +
        "<code>3 + 3</code> (two). No exchange argument exists, because swapping the greedy&rsquo;s 4 into an optimal " +
        "solution <em>does</em> make it worse. <strong>The diagnostic question:</strong> can I swap my choice into an " +
        "arbitrary optimal solution without breaking feasibility or losing value? If you cannot write that sentence, " +
        "you need DP."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Jump Game: greedy stays ahead",
        sub: "one integer dominates every strategy",
        body:
          "<p><strong>Claim.</strong> After considering indices <code>0..i</code>, <code>reach</code> equals the maximum " +
          "index reachable by <em>any</em> sequence of legal jumps that only uses indices in <code>0..i</code>.</p>" +
          "<p><strong>Induction.</strong> For <code>i = 0</code>, <code>reach = nums[0]</code>, which is exactly the " +
          "set of one-jump destinations. Assume the claim at <code>i - 1</code>. Any strategy that lands somewhere " +
          "beyond <code>reach</code> must make its last jump from some index <code>j &le; i</code>; if " +
          "<code>j &lt; i</code> the destination is at most <code>reach_{i-1}</code>, and if <code>j == i</code> the " +
          "destination is at most <code>i + nums[i]</code>. Taking the max over both cases is precisely the update.</p>" +
          "<p>So the greedy&rsquo;s single number dominates every strategy&rsquo;s reachable set &mdash; there is " +
          "nothing to be gained by remembering <em>which</em> path got there, and that collapse from exponential paths " +
          "to one integer is the whole algorithm.</p>"
      },
      {
        title: "Gas Station: the reset lemma",
        sub: "and why the sum test is the other half",
        body:
          "<p><strong>Lemma.</strong> If starting at s the tank first goes negative at index j, then no start k with " +
          "<code>s &lt; k &le; j</code> can complete the circuit.</p>" +
          "<p><strong>Proof.</strong> Write <code>T_s(m)</code> for the tank balance at index m when starting from s. By " +
          "assumption <code>T_s(j) &lt; 0</code> and <code>T_s(m) &ge; 0</code> for all <code>s &le; m &lt; j</code>. " +
          "For any k in <code>(s, j]</code>, <code>T_k(j) = T_s(j) - T_s(k-1)</code>. Since " +
          "<code>T_s(k-1) &ge; 0</code>, we get <code>T_k(j) &le; T_s(j) &lt; 0</code>, so a start at k also fails by " +
          "index j. Hence the scan may skip directly to <code>j + 1</code>.</p>" +
          "<p><strong>Completeness.</strong> If <code>sum(gas) &ge; sum(cost)</code>, a valid start exists. The " +
          "scan&rsquo;s final <code>start</code> has a non-negative run to the end of the array, and the total being " +
          "non-negative forces the wrapped remainder to be non-negative too. The global sum test is therefore " +
          "<em>not a shortcut</em> &mdash; it is the other half of the proof.</p>"
      },
      {
        title: "Complexity proof",
        sub: "the interest is entirely in correctness",
        body:
          "<p>A greedy scan touches each element a constant number of times, so it is O(n) plus the sort when one is " +
          "needed. There is no amortisation subtlety here &mdash; unlike the stack and window topics, the running time " +
          "is obvious and the <em>correctness</em> is where all the difficulty lives.</p>" +
          "<p>Heap-driven greedies inherit O(n log n) from the heap operations.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Problem", "Greedy rule", "Time", "Proof template"],
      rows: [
        ["Jump Game", "maximise reach", "O(n)", "stays ahead"],
        ["Jump Game II", "exhaust the current level before jumping", "O(n)", "stays ahead (BFS levels)"],
        ["Gas Station", "reset the start on a deficit", "O(n)", "exchange + global sum"],
        ["Best Time to Buy/Sell Stock II", "take every upward step", "O(n)", "exchange"],
        ["Partition Labels", "extend to the last occurrence", "O(n)", "stays ahead"],
        ["Hand of Straights", "always start a group at the smallest card", "O(n log n)", "exchange"],
        ["Task Scheduler", "schedule the most frequent task first", "O(n log n) or O(n)", "exchange"],
        ["Largest Number", "pairwise comparator <code>a+b &gt; b+a</code>", "O(n log n &middot; L)", "exchange (comparator is a total order)"],
        ["Candy", "two sweeps, left then right", "O(n)", "stays ahead in both directions"],
        ["Non-overlapping Intervals", "earliest finishing time", "O(n log n)", "exchange <span class='topic-ref'>topic 16</span>"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Try greedy <strong>only after you can state the exchange argument in one sentence</strong>. In an interview " +
        "the correct order is: propose the greedy rule, state the proof sketch, <em>then</em> code. If the proof will " +
        "not come in about thirty seconds, switch to DP &mdash; the cost of a wrong greedy is a wrong answer discovered " +
        "late, while the cost of an unnecessary DP is a log factor."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["a local rule that provably cannot be improved by lookahead", "greedy", "DP pays O(n &middot; W) for a decision greedy makes in O(1)"],
      ["&ldquo;minimum number of X to cover / remove / schedule&rdquo;", "greedy after sorting", "usually an exchange argument exists; try it first"],
      ["choices interact through a shared budget", "DP <span class='topic-ref'>topics 13/14</span>", "greedy cannot see the trade-off across the budget"],
      ["the greedy choice depends on a value you must recompute each step", "heap-driven greedy <span class='topic-ref'>topic 09</span>", "re-scanning for the max is O(n) per step"],
      ["&ldquo;maximum profit&rdquo; with weights and conflicts", "DP + binary search", "greedy by profit or by end time alone is not optimal"],
      ["you can construct a counter-example to your own rule", "DP", "<em>one counter-example is a proof of incorrectness</em>"],
      ["intervals, and the question is a count or a cover", "sort + greedy <span class='topic-ref'>topic 16</span>", "DP is usually unnecessary"],
      ["&ldquo;all solutions&rdquo; rather than one optimum", "backtracking <span class='topic-ref'>topic 10</span>", "greedy returns a single witness"],
      ["a tree or graph, and you want a minimum total", "MST <span class='topic-ref'>topic 12</span>", "that greedy <em>is</em> Kruskal/Prim, with the cut property as its proof"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty input", "<code>nums[0]</code> raises; most greedy scans return the identity, which may or may not be the spec"],
      ["<code>n == 1</code>", "Jump Game must return True (already at the last index) even if <code>nums[0] == 0</code>"],
      ["a zero in the middle of Jump Game", "the frontier stalls; the <code>i &gt; reach</code> check is what detects it"],
      ["all zeros after index 0", "<code>reach</code> never grows past <code>nums[0]</code>; correct only if the check runs <em>before</em> the update"],
      ["Gas Station with <code>total == 0</code> exactly", "feasible: the test must be <code>sum(gas) &lt; sum(cost)</code>, strictly less"],
      ["Gas Station where index 0 works", "the scan never resets and returns <code>start = 0</code> &mdash; verify rather than special-casing"],
      ["ties in the sort key", "a stable sort keeps input order; if the greedy needs a specific tie-break, encode it in the key"],
      ["a comparator that is not a total order", "<code>sorted</code> produces garbage; Largest Number&rsquo;s <code>a+b &gt; b+a</code> must be checked for transitivity"],
      ["negative values", "&ldquo;take every upward step&rdquo; is unaffected, but ratio-based rules can flip sign"],
      ["the greedy returns a count but the spec wants the set", "track witnesses as you go; recovering them afterwards may be impossible"],
      ["k larger than the input size", "loops that assume <code>k &le; n</code> silently under-deliver; clamp explicitly"],
      ["duplicate elements in Hand of Straights", "a <code>Counter</code> is required; a set loses multiplicity and reports a false success"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Checking reachability after updating the frontier",
      wrong: [
        "reach = 0",
        "for i, x in enumerate(nums):",
        "    reach = max(reach, i + x)  # update first",
        "    if i > reach:",
        "        return False",
        "return True",
        "",
        "# nums=[0,1]: i=1, reach was 0, but",
        "# it is updated to 1+1=2 using an",
        "# index we cannot legally stand on",
        "# -> returns True, should be False"
      ],
      right: [
        "reach = 0",
        "for i, x in enumerate(nums):",
        "    if i > reach:              # check first",
        "        return False",
        "    reach = max(reach, i + x)",
        "return True",
        "",
        "# nums=[0,1] -> False"
      ],
      note:
        "The invariant says <code>reach</code> is built <em>only</em> from indices you can actually stand on. Reading " +
        "<code>nums[i]</code> before proving i is reachable imports information from an unreachable cell &mdash; the " +
        "greedy stops dominating, and the answer is wrong on any input with an interior zero."
    },
    {
      n: 2,
      title: "Gas Station returning the candidate without the global test",
      wrong: [
        "tank = start = 0",
        "for i in range(n):",
        "    tank += gas[i] - cost[i]",
        "    if tank < 0:",
        "        start = i + 1",
        "        tank = 0",
        "return start    # no feasibility test",
        "",
        "# gas=[1,2], cost=[2,2]: total is",
        "# -1, impossible, yet this returns 0"
      ],
      right: [
        "if sum(gas) < sum(cost):",
        "    return -1",
        "tank = start = 0",
        "for i in range(n):",
        "    tank += gas[i] - cost[i]",
        "    if tank < 0:",
        "        start = i + 1",
        "        tank = 0",
        "return start"
      ],
      note:
        "The reset lemma only proves <em>&ldquo;if a valid start exists, it is this one&rdquo;</em>. Existence is a " +
        "separate claim, and the sum test is its proof. A common variant of the same bug resets a running total " +
        "alongside <code>tank</code>, which destroys the global test &mdash; keep the two accumulators independent."
    },
    {
      n: 3,
      title: "Jump Game II counting a jump at the boundary",
      wrong: [
        "jumps = cur_end = far = 0",
        "for i in range(len(nums)):",
        "    far = max(far, i + nums[i])",
        "    if i == cur_end:",
        "        jumps += 1",
        "        cur_end = far",
        "return jumps",
        "",
        "# the loop reaches i == n-1, which",
        "# is the final cur_end, so it counts",
        "# one jump too many: [2,3,1,1,4] -> 3"
      ],
      right: [
        "jumps = cur_end = far = 0",
        "for i in range(len(nums) - 1):   # stop before last",
        "    far = max(far, i + nums[i])",
        "    if i == cur_end:",
        "        jumps += 1",
        "        cur_end = far",
        "return jumps",
        "",
        "# [2,3,1,1,4] -> 2"
      ],
      note:
        "Arriving at the last index is not a jump <em>from</em> it. The <code>len(nums) - 1</code> bound encodes that. " +
        "Thinking of the algorithm as BFS over levels makes it obvious: you count level transitions, and the " +
        "destination level needs no outgoing edge."
    },
    {
      n: 4,
      title: "Greedy applied where no exchange argument exists",
      wrong: [
        "# Coin Change, greedy by largest coin",
        "coins.sort(reverse=True)",
        "n = 0",
        "for c in coins:",
        "    while amount >= c:",
        "        amount -= c",
        "        n += 1",
        "return n if amount == 0 else -1",
        "",
        "# coins=[1,3,4], amount=6",
        "# -> 4+1+1 = 3 coins (wrong)"
      ],
      right: [
        "# no exchange argument exists, so DP",
        "dp = [0] + [float('inf')] * amount",
        "for a in range(1, amount + 1):",
        "    for c in coins:",
        "        if c <= a:",
        "            dp[a] = min(dp[a], dp[a-c] + 1)",
        "return (-1 if dp[amount] == float('inf')",
        "        else dp[amount])",
        "",
        "# -> 3+3 = 2 coins"
      ],
      note:
        "Greedy coin change is correct only for <em>canonical</em> systems (like real currency), and the problem never " +
        "promises canonicity. This is the reference counter-example to keep in your head: before committing to any " +
        "greedy, try to build the analogous two-element trap for your own rule."
    }
  ],

  practice: {
    caption: "Drill set for Greedy",
    rows: [
      ["Best Time to Buy and Sell Stock II", "LC 122", "Easy", "sum every positive delta; the one-line exchange proof"],
      ["Jump Game II", "LC 45", "Medium", "level-by-level frontier, and the boundary off-by-one"],
      ["Hand of Straights", "LC 846", "Medium", "always start a run at the smallest remaining card; <code>Counter</code> bookkeeping"],
      ["Merge Triplets to Form Target Triplet", "LC 1899", "Medium", "filter out disqualified candidates, then take coordinate-wise maxima"],
      ["Valid Parenthesis String", "LC 678", "Medium", "track an interval <code>[lo, hi]</code> of possible open counts"],
      ["Largest Number", "LC 179", "Medium", "custom comparator <code>a+b &gt; b+a</code>; prove it is a total order"],
      ["Task Scheduler", "LC 621", "Medium", "most-frequent-first, plus the closed-form idle calculation"],
      ["Candy", "LC 135", "Hard", "two independent sweeps; neither direction alone is sufficient"]
    ]
  },

  quiz: [
    {
      prompt: "You have a local rule and <strong>can state its exchange argument in one sentence</strong>.",
      options: ["DP anyway", "Greedy", "Backtracking", "Heap"],
      answer: 1,
      why: "That sentence IS the licence to use greedy. DP would pay O(n·W) for a decision greedy makes in O(1)."
    },
    {
      prompt: "You try to prove your greedy rule and <strong>find a counter-example</strong>.",
      options: ["Patch the rule", "Switch to DP", "Add a tie-break", "Sort differently"],
      answer: 1,
      why: "One counter-example is a proof of incorrectness. Patching a rule you cannot prove just moves the failure somewhere you have not tested."
    },
    {
      prompt: "Choices interact through a <strong>shared budget</strong> or capacity.",
      options: ["Greedy", "DP", "Sort + scan", "Heap"],
      answer: 1,
      why: "Greedy cannot see the trade-off across the budget — a locally worse choice may free capacity that pays off later."
    },
    {
      prompt: "The &ldquo;best remaining&rdquo; choice <strong>changes as you go</strong>.",
      options: ["Re-scan for the max each step", "Heap-driven greedy", "Sort once", "DP"],
      answer: 1,
      why: "Re-scanning is O(n) per step. The heap is just bookkeeping — the proof is still an exchange argument."
    },
    {
      prompt: "In Jump Game, where does the reachability check go?",
      options: ["After updating reach", "Before updating reach", "Either", "Outside the loop"],
      answer: 1,
      why: "Updating first imports nums[i] from a cell you may not be able to stand on. On [0,1] that wrongly returns True."
    },
    {
      prompt: "Gas Station: the reset lemma alone tells you&hellip;",
      options: ["A valid start exists", "If one exists, it is this one", "The answer is always 0", "Nothing useful"],
      answer: 1,
      why: "Existence is a separate claim, proved by the sum(gas) ≥ sum(cost) test. Without it the scan happily returns an index on an infeasible input."
    },
    {
      prompt: "&ldquo;Minimum number of arrows / rooms / removals to cover these intervals.&rdquo;",
      options: ["DP", "Sort + greedy", "Backtracking", "Heap only"],
      answer: 1,
      why: "An exchange argument almost always exists for interval covering — try it before reaching for a table."
    },
    {
      prompt: "You want <strong>every</strong> optimal solution, not one of them.",
      options: ["Greedy", "Backtracking", "DP", "Heap"],
      answer: 1,
      why: "Greedy returns a single witness by construction. Enumerating the whole solution set is a search problem."
    },
    {
      prompt: "A tree or graph, and you want a <strong>minimum total connection cost</strong>.",
      options: ["Dijkstra", "MST (Kruskal/Prim)", "Plain greedy scan", "DP"],
      answer: 1,
      why: "That greedy already has a name and a proof: Kruskal and Prim, both licensed by the cut property."
    }
  ]
};
