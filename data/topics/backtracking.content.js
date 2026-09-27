/* Topic content, transcribed from the Backtracking chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["backtracking"] = {
  id: "backtracking",
  number: "10",
  title: "Backtracking",
  subtitle: "Choose / explore / un-choose, decision-tree shapes, de-duplication and pruning",
  accent: "amber",
  bounds: { time: "O(branch^depth &middot; work)", space: "O(depth)", driver: "size of the output/search tree" },

  mechanics: {
    lede:
      "Backtracking is depth-first search over a <em>decision tree</em>, with one obligation that every bug in the " +
      "topic violates: <strong>the function must be a no-op on the shared state from its caller&rsquo;s point of " +
      "view</strong>. Choose, explore, un-choose.",
    mechanisms: [
      {
        tag: "The skeleton",
        name: "Choose / explore / un-choose",
        blurb: "Four lines, and the fourth is the one people forget.",
        caption: "The shape every problem in this topic reduces to",
        code: [
          "def solve(state):",
          "    if is_complete(state):",
          "        record(copy_of(state))     # COPY, never the live object",
          "        return",
          "    for choice in candidates(state):",
          "        if not allowed(choice, state):",
          "            continue               # prune: provably no solution",
          "        apply(choice, state)       # choose",
          "        solve(state)               # explore",
          "        undo(choice, state)        # un-choose <- the obligation"
        ],
        invariant:
          "On entry to <em>and on exit from</em> <code>solve</code>, <code>state</code> is identical. <code>path</code> " +
          "always spells a valid partial candidate, and every auxiliary structure (<code>used</code> set, board marks, " +
          "column/diagonal counters) describes exactly the decisions currently in <code>path</code> &mdash; no more, no " +
          "less. <strong>Every bug in this topic is a violation of that one sentence.</strong>"
      },
      {
        tag: "The four shapes",
        name: "Shape determines the loop bounds, and the loop bounds determine correctness",
        blurb:
          "<strong>Include/exclude per element</strong>: <code>for i in range(start, n)</code>, recurse with " +
          "<code>i+1</code> &mdash; Subsets, Combinations, Palindrome Partitioning. " +
          "<strong>Pick any unused element</strong>: <code>for i in range(n)</code> plus a <code>used</code> set, " +
          "recurse with the same n &mdash; Permutations. " +
          "<strong>Reuse allowed</strong>: <code>for i in range(start, n)</code>, recurse with <code>i</code> (not " +
          "<code>i+1</code>) &mdash; Combination Sum. " +
          "<strong>Fill a cell, then move on</strong>: one position at a time, recurse with the next position &mdash; " +
          "N-Queens, Sudoku, Word Search.",
        caption: null,
        code: null,
        invariant: null
      },
      {
        tag: "De-duplication",
        name: "Sort first, then skip repeats at the same level",
        blurb: "The guard must be <code>i &gt; start</code>, never <code>i &gt; 0</code>.",
        caption: "Subsets with duplicate input",
        code: [
          "def subsets_with_dup(nums):",
          "    nums.sort()",
          "    out, path = [], []",
          "",
          "    def dfs(start):",
          "        out.append(path[:])",
          "        for i in range(start, len(nums)):",
          "            if i > start and nums[i] == nums[i - 1]:",
          "                continue    # same value, same level",
          "            path.append(nums[i])",
          "            dfs(i + 1)",
          "            path.pop()",
          "",
          "    dfs(0)",
          "    return out"
        ],
        invariant:
          "The guard means <em>&ldquo;this value was already tried at this level&rdquo;</em>. Indices below " +
          "<code>start</code> belong to ancestors, where using the value again is legitimate &mdash; that is precisely " +
          "how a candidate containing two copies of the value gets built."
      },
      {
        tag: "Pruning",
        name: "Only legal when the pruned subtree is provably empty",
        blurb:
          "Three reliable sources of such proofs: a <strong>monotone budget</strong> (<code>remaining &lt; 0</code> " +
          "with all-positive candidates), a <strong>sorted-candidate early break</strong> (if this candidate already " +
          "exceeds the budget, so do all later ones), and a <strong>constraint set</strong> (a column already occupied " +
          "by a queen).",
        caption: null,
        code: null,
        invariant: null
      }
    ],
    aside: {
      title: "The start parameter is the whole game",
      body:
        "Passing <code>i + 1</code> forbids revisiting earlier elements, so each subset is generated exactly once in " +
        "index order. Looping from 0 with a <code>used</code> set allows any order, so all n! arrangements appear. " +
        "Passing <code>i</code> allows the same element again, which is unbounded reuse. <strong>Choosing the wrong one " +
        "of these three is the highest-frequency error in the topic</strong> &mdash; state your choice out loud before " +
        "coding, it is cheaper than debugging it."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Exhaustiveness",
        sub: "nothing missed, nothing repeated",
        body:
          "<p><strong>Claim:</strong> the recursion enumerates every valid candidate exactly once.</p>" +
          "<p><strong>Induction on depth.</strong> At depth 0 the single node is the empty prefix. Assume every valid " +
          "prefix of length d is generated exactly once. At such a node, the loop iterates over a set of " +
          "<em>distinct</em> choices, producing one child per choice, so every valid prefix of length <code>d+1</code> " +
          "appears exactly once &mdash; distinctness of the loop&rsquo;s choices is doing all the work.</p>" +
          "<p>This is where the shape parameters become <em>correctness conditions</em> rather than style. With " +
          "<code>start</code>, the children of a node are exactly the elements at indices <code>&ge; start</code>, so a " +
          "subset is only ever generated in increasing index order &mdash; one path per subset. Looping from 0 without " +
          "a used set would generate <code>{1,2}</code> as both <code>1,2</code> and <code>2,1</code>; using " +
          "<code>i</code> instead of <code>i + 1</code> would generate <code>{1,1}</code> from a single 1.</p>"
      },
      {
        title: "Why the un-choose step is mandatory",
        sub: "one mutable object, many nodes",
        body:
          "<p><code>path</code> is a single mutable object shared by every node of the recursion. After exploring the " +
          "subtree under choice c, the state <em>must</em> be restored or the next sibling inherits c&rsquo;s decisions " +
          "&mdash; corrupting every candidate in the rest of the subtree.</p>" +
          "<p>The formal statement is the invariant above: <code>solve</code> must be a no-op on <code>state</code> from " +
          "its caller&rsquo;s point of view. The same obligation applies to a mutated grid (restore the cell), a " +
          "<code>used</code> set (discard the element) and a counter array (decrement).</p>"
      },
      {
        title: "Why de-duplication is correct",
        sub: "subtree containment",
        body:
          "<p>Sort so equal values are adjacent. At a fixed level with start index <code>start</code>, consider a run of " +
          "equal values at indices <code>start &le; p &lt; q</code>. Choosing index q when index p was skipped produces " +
          "a candidate identical (as a multiset) to the one from choosing p, and the subtree below q is a " +
          "<em>subset</em> of the subtree below p &mdash; because p&rsquo;s subtree may still select q&rsquo;s value " +
          "later from index q, while q&rsquo;s subtree can never reach back to p.</p>" +
          "<p>So skipping every occurrence after the first <em>at this level</em> loses no distinct candidate and " +
          "removes every duplicate. The guard must be <code>i &gt; start</code>, not <code>i &gt; 0</code>: at " +
          "<code>i == start</code> the value has not yet been tried at this level, and blocking it would lose the " +
          "candidates that legitimately contain two copies.</p>"
      },
      {
        title: "Why pruning preserves correctness, and the complexity",
        sub: "soundness of allowed()",
        body:
          "<p>If <code>allowed</code> is <em>sound</em> &mdash; it rejects only choices that cannot appear in any " +
          "complete solution extending the current prefix &mdash; then the pruned subtree contains no solutions and " +
          "skipping it changes nothing. For Combination Sum with all-positive candidates, " +
          "<code>remaining &lt; 0</code> is sound because every extension only adds positive amounts. Note the " +
          "hypothesis: with a negative candidate in the list, the same prune becomes unsound.</p>" +
          "<p><strong>Complexity.</strong> The running time is " +
          "<code>O(nodes in the explored tree &times; work per node)</code>. There is no amortisation trick available: " +
          "the output itself is exponential, so the algorithm is <em>output-sensitive</em> and that is the best possible.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Problem", "Nodes explored", "Work per node", "Total"],
      rows: [
        ["Subsets", "2^n", "O(n) to copy", "O(n &middot; 2^n)"],
        ["Subsets with duplicates", "&le; 2^n", "O(n)", "O(n &middot; 2^n)"],
        ["Permutations", "n! leaves", "O(n) to copy", "O(n &middot; n!)"],
        ["Combinations C(n,k)", "C(n,k) leaves", "O(k)", "O(k &middot; C(n,k))"],
        ["Combination Sum", "bounded by T/min branching", "O(T/min)", "O(n^(T/min))"],
        ["Palindrome Partitioning", "2^(n-1) cut sets", "O(n) per check, O(n&sup2;) with a DP table", "O(n &middot; 2^n)"],
        ["N-Queens", "n! upper bound, heavily pruned", "O(1) with constraint sets", "O(n!) upper bound"],
        ["Sudoku Solver", "huge, heavily pruned", "O(1) per check", "exponential worst case"],
        ["Word Search (grid)", "O(4 &middot; 3^(L-1)) per start", "O(1)", "O(R&middot;C&middot;3^L)"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "The deciding question: does the problem ask for <strong>all solutions</strong> (or a valid configuration), or " +
        "for a <strong>count / optimum</strong>? Enumeration is backtracking. Counting or optimising over overlapping " +
        "subproblems is DP. If you are backtracking and notice that the same <code>(index, remaining)</code> pair " +
        "recurs on different branches, you are one <code>@cache</code> away from converting it into DP &mdash; and that " +
        "conversion is the expected follow-up on problems like Word Break and Coin Change."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;return all&rdquo;, &ldquo;list every&rdquo;, &ldquo;generate all&rdquo;", "backtracking", "DP computes values, not the set of witnesses"],
      ["&ldquo;how many ways&rdquo; / &ldquo;minimum cost&rdquo; with overlapping states", "DP <span class='topic-ref'>topics 13/14</span>", "backtracking re-solves identical subproblems exponentially"],
      ["&ldquo;does any valid configuration exist&rdquo; (sudoku, colouring)", "backtracking with pruning", "no optimal substructure to exploit"],
      ["&ldquo;shortest sequence of moves&rdquo;", "BFS <span class='topic-ref'>topic 11</span>", "DFS finds <em>a</em> path, not the shortest"],
      ["a provable local rule gives the optimum", "greedy <span class='topic-ref'>topic 15</span>", "exploring all branches is wasted work"],
      ["enumerate subsets, n &le; 20", "backtracking or bitmask enumeration", "both fine; bitmask is shorter, backtracking prunes"],
      ["enumerate subsets, n &gt; 25", "rethink &mdash; 2^25 is 33M", "no algorithm choice saves an exponential output"],
      ["constraint satisfaction with strong propagation", "backtracking + constraint sets", "recomputing validity per node is the slow version"],
      ["the answer is one number, and the tree is a DAG of states", "memoised DFS = top-down DP", "identical code, one decorator apart"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty input", "Subsets must return <code>[[]]</code>, not <code>[]</code>; Permutations must return <code>[[]]</code>"],
      ["<code>record(path)</code> without a copy", "every recorded result is the same list object, which ends up empty"],
      ["duplicates in the input", "identical candidates are emitted many times; needs sort plus the <code>i &gt; start</code> skip"],
      ["dedup guard written <code>i &gt; 0</code>", "loses legitimate candidates containing two equal elements"],
      ["<code>target == 0</code> initially", "Combination Sum must record the empty combination or reject it &mdash; read the spec"],
      ["negative candidates", "the <code>remaining &lt; 0</code> prune becomes unsound and the recursion may not terminate"],
      ["reuse allowed vs not", "<code>dfs(i)</code> vs <code>dfs(i + 1)</code>: one difference decides between two different problems"],
      ["<code>k &gt; n</code> for combinations", "the loop body never fires; must return <code>[]</code>, not crash"],
      ["missing undo on a grid", "the board stays marked, so later branches see phantom obstacles"],
      ["<code>used</code> set restored in the wrong place", "restoring inside the <code>if</code> instead of after the recursion leaks state to siblings"],
      ["recursion depth equal to n (10<sup>4</sup>+)", "<code>RecursionError</code>; convert to an explicit stack or bound n from the constraints"],
      ["output order compared strictly", "most judges accept any order, but say so rather than assuming"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Recording the live list instead of a copy",
      wrong: [
        "def dfs(start):",
        "    out.append(path)      # same object",
        "    for i in range(start, n):",
        "        path.append(nums[i])",
        "        dfs(i + 1)",
        "        path.pop()",
        "",
        "# out = [[], [], [], ...] -- every",
        "# entry aliases the one list, which",
        "# is empty when the recursion ends"
      ],
      right: [
        "def dfs(start):",
        "    out.append(path[:])   # snapshot",
        "    for i in range(start, n):",
        "        path.append(nums[i])",
        "        dfs(i + 1)",
        "        path.pop()"
      ],
      note:
        "<code>path[:]</code>, <code>list(path)</code> or <code>path.copy()</code> all work. The symptom is " +
        "unmistakable once seen &mdash; the right <em>number</em> of results, all identical and all empty &mdash; and it " +
        "is the single most common backtracking bug in interviews."
    },
    {
      n: 2,
      title: "Missing or misplaced un-choose",
      wrong: [
        "for i in range(n):",
        "    if used[i]:",
        "        continue",
        "    used[i] = True",
        "    path.append(nums[i])",
        "    dfs()",
        "    # no pop, no used[i] = False"
      ],
      right: [
        "for i in range(n):",
        "    if used[i]:",
        "        continue",
        "    used[i] = True",
        "    path.append(nums[i])",
        "    dfs()",
        "    path.pop()        # undo both,",
        "    used[i] = False   # after the call"
      ],
      note:
        "Both undos must sit <em>after</em> the recursive call and <em>outside</em> any conditional. A related subtle " +
        "variant: undoing inside the <code>if is_complete</code> early-return branch, which skips the undo on the path " +
        "that returns early &mdash; always structure the function so the undo cannot be bypassed."
    },
    {
      n: 3,
      title: "Dedup guard compared against 0 instead of <code>start</code>",
      wrong: [
        "nums.sort()",
        "for i in range(start, n):",
        "    if i > 0 and nums[i] == nums[i-1]:",
        "        continue",
        "",
        "# nums=[1,2,2]: the second 2 is",
        "# skipped at EVERY level, so [1,2,2]",
        "# and [2,2] are never generated"
      ],
      right: [
        "nums.sort()",
        "for i in range(start, n):",
        "    if i > start and nums[i] == nums[i-1]:",
        "        continue",
        "",
        "# nums=[1,2,2] -> [], [1], [1,2],",
        "# [1,2,2], [2], [2,2]"
      ],
      note:
        "The guard must mean &ldquo;this value was already tried <em>at this level</em>&rdquo;. Indices below " +
        "<code>start</code> belong to ancestors, where using the value again is legitimate &mdash; that is precisely " +
        "how a candidate with two copies of the value gets built."
    },
    {
      n: 4,
      title: "<code>i + 1</code> versus <code>i</code> versus <code>0</code>: solving a different problem",
      wrong: [
        "# Combination Sum: reuse IS allowed",
        "for i in range(start, n):",
        "    path.append(c[i])",
        "    dfs(i + 1, rem - c[i])  # forbids reuse",
        "    path.pop()",
        "",
        "# candidates=[2,3,6,7], target=7",
        "# -> [[7]] only; [2,2,3] is lost"
      ],
      right: [
        "for i in range(start, n):",
        "    if c[i] > rem:",
        "        break             # sorted: prune tail",
        "    path.append(c[i])",
        "    dfs(i, rem - c[i])    # SAME i: reuse",
        "    path.pop()",
        "",
        "# -> [[2,2,3], [7]]"
      ],
      note:
        "Three cases to keep straight: <code>dfs(i + 1)</code> = each element at most once; <code>dfs(i)</code> = reuse " +
        "allowed; <code>for i in range(n)</code> with a <code>used</code> set = order matters. Read the problem " +
        "statement for which one, and state your choice out loud before coding."
    }
  ],

  practice: {
    caption: "Drill set for Backtracking",
    rows: [
      ["Letter Combinations of a Phone Number", "LC 17", "Medium", "fixed-depth tree, one level per input digit"],
      ["Subsets II", "LC 90", "Medium", "the <code>i &gt; start</code> dedup guard on sorted input"],
      ["Combination Sum II", "LC 40", "Medium", "each element once <em>and</em> duplicates present &mdash; both rules at once"],
      ["Permutations II", "LC 47", "Medium", "dedup with a <code>used</code> array instead of a start index"],
      ["Palindrome Partitioning", "LC 131", "Medium", "cut-point enumeration plus an O(n&sup2;) palindrome table"],
      ["Word Search", "LC 79", "Medium", "grid marking with mandatory restore on unwind"],
      ["N-Queens", "LC 51", "Hard", "constraint sets for columns and both diagonals, O(1) validity"],
      ["Sudoku Solver", "LC 37", "Hard", "pick the most-constrained cell; propagation beats raw enumeration"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;<strong>Return all</strong> subsets that sum to the target.&rdquo;",
      options: ["DP", "Backtracking", "Greedy", "BFS"],
      answer: 1,
      why: "DP computes values, not the set of witnesses. Once you need the actual solutions enumerated, you need the search tree."
    },
    {
      prompt: "&ldquo;<strong>How many ways</strong> can the amount be made?&rdquo; with heavily overlapping states.",
      options: ["Backtracking", "DP", "Greedy", "Heap"],
      answer: 1,
      why: "Backtracking re-solves identical subproblems exponentially. If the same (index, remaining) recurs on different branches, memoise."
    },
    {
      prompt: "&ldquo;<strong>Shortest</strong> sequence of moves to reach the goal.&rdquo;",
      options: ["Backtracking / DFS", "BFS", "Greedy", "DP"],
      answer: 1,
      why: "DFS finds a path, not the shortest one. Minimum number of steps on an unweighted state graph is BFS by definition."
    },
    {
      prompt: "Each element may be used <strong>at most once</strong>, order irrelevant. What do you recurse with?",
      options: ["dfs(i)", "dfs(i + 1)", "for i in range(n) + used set", "dfs(0)"],
      answer: 1,
      why: "i + 1 forbids revisiting earlier elements, so each combination is generated exactly once in index order."
    },
    {
      prompt: "The same element may be <strong>reused unlimited times</strong>. What do you recurse with?",
      options: ["dfs(i + 1)", "dfs(i)", "for i in range(n) + used set", "dfs(start + 1)"],
      answer: 1,
      why: "Passing the same i leaves the current element in the candidate window, which is exactly unbounded reuse."
    },
    {
      prompt: "<strong>Order matters</strong> — you want all n! arrangements.",
      options: ["dfs(i + 1)", "dfs(i)", "Loop from 0 with a used set", "Sort first"],
      answer: 2,
      why: "Any start index imposes an order on the choices. Looping from 0 and tracking what is already used is what admits every arrangement."
    },
    {
      prompt: "Input has duplicates. Where does the dedup guard compare?",
      options: ["i > 0", "i > start", "i >= start", "nums[i] != nums[0]"],
      answer: 1,
      why: "The guard must mean 'already tried at this level'. i > 0 also blocks ancestors' indices, losing candidates that legitimately contain two copies."
    },
    {
      prompt: "You want to prune with <code>remaining &lt; 0</code>, but the candidate list <strong>contains negatives</strong>.",
      options: ["Still sound", "Unsound — the prune is invalid", "Sound if you sort", "Sound if you memoise"],
      answer: 1,
      why: "The prune relies on every extension only adding positive amounts. With a negative available, remaining can return to 0, so the subtree is not provably empty."
    },
    {
      prompt: "Enumerating subsets with <strong>n &gt; 25</strong>.",
      options: ["Backtracking with better pruning", "Bitmask enumeration", "Rethink the problem", "Memoise"],
      answer: 2,
      why: "2^25 is 33 million and it only doubles from there. No algorithm choice saves you from an exponential output — the problem must want something else."
    }
  ]
};
