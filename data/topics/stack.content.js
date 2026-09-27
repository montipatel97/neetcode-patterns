/* Topic content, transcribed from the Stack chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["stack"] = {
  id: "stack",
  number: "04",
  title: "Stack",
  subtitle: "Nesting and matching, monotonic stacks, deferred computation, explicit recursion",
  accent: "violet",
  bounds: { time: "O(n)", space: "O(n)", driver: "each element pushed and popped once" },

  mechanics: {
    lede:
      "A stack is the right structure whenever <strong>the most recently seen unresolved item is the one that must be " +
      "resolved first</strong>. Three distinct patterns follow from that, and they look nothing alike in code even " +
      "though the invariant is always &ldquo;the stack holds exactly the items still waiting, innermost/newest on top&rdquo;.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Matching and nesting",
        blurb: "A closer is legal iff it matches the innermost open bracket &mdash; there is never a choice to make.",
        caption: "Valid parentheses",
        code: [
          "def is_valid(s):",
          "    pairs = {')': '(', ']': '[', '}': '{'}",
          "    st = []",
          "    for ch in s:",
          "        if ch in pairs:                      # a closer",
          "            if not st or st.pop() != pairs[ch]:",
          "                return False                 # empty check FIRST",
          "        else:",
          "            st.append(ch)",
          "    return not st        # leftovers = unmatched openers"
        ],
        invariant:
          "<code>st</code> holds exactly the openers seen so far that are still unmatched, in order of appearance, so " +
          "<code>st[-1]</code> is the innermost open bracket."
      },
      {
        tag: "Mechanism B",
        name: "Monotonic stack (nearest greater / smaller)",
        blurb:
          "Keep indices whose values are monotone from bottom to top. The current element resolves and evicts every " +
          "stack entry it dominates; each eviction emits one answer.",
        caption: "Next greater element to the right, as an index distance",
        code: [
          "def daily_temperatures(t):",
          "    res = [0] * len(t)   # unresolved indices keep 0",
          "    st = []              # indices, values decreasing",
          "    for i, x in enumerate(t):",
          "        while st and t[st[-1]] < x:",
          "            j = st.pop()",
          "            res[j] = i - j",
          "        st.append(i)",
          "    return res"
        ],
        invariant:
          "Bottom to top, the stack&rsquo;s values are non-increasing, and every index still on the stack has not yet " +
          "seen a greater element to its right. Indices are pushed in increasing order, so the stack is simultaneously " +
          "sorted <em>by position</em> and <em>by value</em> &mdash; that double ordering is what makes one pop answer " +
          "one query."
      },
      {
        tag: "Mechanism C",
        name: "Deferred computation",
        blurb:
          "Push operands (or partial results) and pop when an operator arrives: RPN evaluation, basic calculators, " +
          "decoding nested strings. A second parallel stack turns any O(1)-queryable aggregate into a " +
          "stack-with-that-query &mdash; the Min Stack pushes the running minimum alongside each value.",
        caption: null,
        code: null,
        invariant: null
      },
      {
        tag: "Mechanism D",
        name: "Explicit stack replacing recursion",
        blurb:
          "Any recursion is a stack machine; making it explicit is mandatory when depth can exceed Python&rsquo;s " +
          "~1000-frame limit (a degenerate tree, or a 10<sup>5</sup>-node path), and is the standard follow-up ask " +
          "after you write a recursive DFS.",
        caption: null,
        code: null,
        invariant: null
      }
    ],
    aside: {
      title: "Why one pass computes both boundaries",
      body:
        "In Largest Rectangle, the element <em>below</em> j on the stack at pop time is <code>prevSmaller(j)</code>, and " +
        "the index <em>causing</em> the pop is <code>nextSmaller(j)</code>. Both fall out of the same eviction, which is " +
        "why a single loop suffices where a naive approach needs two passes."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of bracket matching",
        sub: "the no-crossing argument",
        body:
          "<p>In a valid string, matched pairs never cross: if <code>(i, j)</code> and <code>(p, q)</code> are matched " +
          "pairs with <code>i &lt; p</code>, then either <code>j &lt; p</code> (disjoint) or <code>q &lt; j</code> " +
          "(nested).</p>" +
          "<p>Suppose a closer arrives at position j and the innermost unmatched opener is at i. If a valid matching " +
          "exists in which j is matched to some opener <code>i' != i</code>, then <code>i' &lt; i</code>, and the pair " +
          "<code>(i', j)</code> would strictly enclose the still-unmatched i &mdash; but i must be matched to something, " +
          "and its partner lies after j, producing a crossing. Contradiction.</p>" +
          "<p>So the only candidate partner for j is the top of the stack, and greedily matching it loses nothing. The " +
          "final emptiness check completes the argument: leftover openers have no partners.</p>"
      },
      {
        title: "Correctness of the monotonic stack",
        sub: "the nearest-element lemma",
        body:
          "<p><strong>Claim:</strong> when index j is popped while processing index i, then i is the <em>nearest</em> " +
          "index to the right of j with a greater value.</p>" +
          "<p><strong>It is greater:</strong> the pop condition is <code>t[j] &lt; t[i]</code>. " +
          "<strong>It is nearest:</strong> suppose some k with <code>j &lt; k &lt; i</code> had " +
          "<code>t[k] &gt; t[j]</code>. Indices are pushed in increasing order, so k was processed before i while j was " +
          "still on the stack; at that moment the <code>while</code> condition <code>t[j] &lt; t[k]</code> held, so j " +
          "would have been popped at k, not at i. Contradiction.</p>" +
          "<p>Indices never popped have no greater element to the right at all, which is why the default 0 (or -1) is " +
          "correct without any post-processing.</p>"
      },
      {
        title: "Correctness of Largest Rectangle",
        sub: "characterisation by the limiting bar",
        body:
          "<p>Every maximal rectangle is characterised by its <em>limiting bar</em>: the rectangle of height h " +
          "containing bar j with <code>h = t[j]</code> can be widened left and right until it meets a bar shorter than " +
          "<code>t[j]</code>.</p>" +
          "<p>So the optimum equals <code>max over j of t[j] * (nextSmaller(j) - prevSmaller(j) - 1)</code>, because " +
          "(a) every candidate in that family is achievable, and (b) any rectangle is dominated by the one generated " +
          "from its own minimum bar. The monotonic stack computes <code>prevSmaller</code> and <code>nextSmaller</code> " +
          "in the same pass.</p>"
      },
      {
        title: "Complexity proof",
        sub: "stack size as potential",
        body:
          "<p><strong>Time.</strong> Use the stack size as a potential. Each index is pushed exactly once and popped at " +
          "most once, so the total number of <code>while</code>-body executions over the whole run is at most n &mdash; " +
          "not n per iteration. Total operations are bounded by 2n, each O(1): <strong>O(n)</strong>.</p>" +
          "<p>The inner loop is therefore amortised O(1), and the standard interview follow-up " +
          "(&ldquo;isn&rsquo;t that a nested loop, so O(n&sup2;)?&rdquo;) is answered by this counting argument, not by " +
          "inspection.</p>" +
          "<p><strong>Space.</strong> O(n): a strictly monotone input (increasing heights, or <code>\"(((((\"</code>) " +
          "leaves every element on the stack. No pattern in this topic has a sublinear worst-case space bound.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Bound driven by"],
      rows: [
        ["Bracket matching", "O(n)", "O(n)", "one push per opener"],
        ["Next greater / smaller element", "O(n)", "O(n)", "each index pushed and popped once"],
        ["Daily Temperatures", "O(n)", "O(n)", "same, answers emitted on pop"],
        ["Largest Rectangle in Histogram", "O(n)", "O(n)", "both boundaries from one pass"],
        ["RPN evaluation", "O(n)", "O(n)", "operand stack depth"],
        ["Min Stack (all ops)", "O(1) each", "O(n)", "parallel minimum stack"],
        ["Queue via two stacks", "O(1) amortised", "O(n)", "each element moves between stacks once"],
        ["Iterative DFS", "O(V+E)", "O(V)", "explicit frame stack"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Trigger phrases that mean <strong>monotonic stack</strong> almost deterministically: <em>next greater, " +
        "previous smaller, span, how many days until, how far until a taller, largest rectangle, remove k digits to make " +
        "it smallest, how many elements can see</em>. All of them ask for the nearest element <em>in position</em> " +
        "satisfying a comparison &mdash; position-nearest is the stack&rsquo;s speciality and the heap&rsquo;s blind spot."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["nearest greater/smaller element by position", "monotonic stack", "a heap returns the global extreme, ignoring position"],
      ["extremum of every fixed-size window", "monotonic deque <span class='topic-ref'>topic 03</span>", "a stack cannot evict from the bottom when the window slides"],
      ["global k-th largest, dynamic inserts", "heap <span class='topic-ref'>topic 09</span>", "stack order is arrival order, not value order"],
      ["nested structure to validate or decode", "matching stack", "counters only work for a single bracket type"],
      ["single bracket type, only balance matters", "an integer counter", "a stack is O(n) space for a problem that needs O(1)"],
      ["&ldquo;evaluate expression&rdquo;, precedence, nesting", "operand + operator stacks", "recursion works too but blows the frame limit on long input"],
      ["recursion depth may hit 10<sup>5</sup>", "explicit stack", "Python raises <code>RecursionError</code> at ~1000 frames"],
      ["water trapped between bars", "two pointers (O(1) space) or stack (O(n))", "both are O(n) time; state the space trade-off"],
      ["need the minimum of the whole stack in O(1)", "parallel min-stack", "recomputing <code>min(st)</code> per query is O(n)"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["closer arrives with an empty stack (<code>\")(\"</code>, <code>\"]\"</code>)", "<code>st.pop()</code> raises <code>IndexError</code>; must test <code>if not st</code> before popping"],
      ["openers left at the end (<code>\"((\"</code>)", "returning <code>True</code> after the loop accepts an unbalanced string; <code>return not st</code>"],
      ["odd-length bracket string", "not itself a bug, but a valid O(1) early reject worth mentioning"],
      ["strictly increasing histogram", "nothing is popped inside the loop; without a trailing sentinel 0 the answer is 0"],
      ["all bars equal height", "<code>&lt;</code> vs <code>&le;</code> in the pop test changes which duplicate is the boundary; both give the right area, one gives wrong widths if you also report indices"],
      ["single-element input", "width arithmetic <code>i - left - 1</code> must still yield 1; check with <code>left = -1</code>"],
      ["duplicate minima in Min Stack", "pushing only on strict <code>&lt;</code> loses the duplicate, so popping one copy reports a stale minimum"],
      ["negative numbers in RPN", "<code>-7 // 2 == -4</code> in Python (floor), but the problem wants truncation toward zero: <code>int(-7 / 2) == -3</code>"],
      ["RPN operand order", "<code>b = pop(); a = pop()</code> then <code>a - b</code>; reversing gives sign errors that pass on symmetric inputs like <code>+</code> and <code>*</code>"],
      ["division by zero in a calculator", "guard or assume well-formed input, and say which you assumed"],
      ["very deep nesting", "recursive parsers hit <code>RecursionError</code>; the explicit stack does not"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Popping before checking that the stack is non-empty",
      wrong: [
        "for ch in s:",
        "    if ch in pairs:",
        "        if st.pop() != pairs[ch]:",
        "            return False",
        "    else:",
        "        st.append(ch)",
        "return True",
        "",
        "# s=')'  -> IndexError",
        "# s='((' -> returns True"
      ],
      right: [
        "for ch in s:",
        "    if ch in pairs:",
        "        if not st or st.pop() != pairs[ch]:",
        "            return False",
        "    else:",
        "        st.append(ch)",
        "return not st",
        "",
        "# s=')'  -> False",
        "# s='((' -> False"
      ],
      note:
        "Two defects in one snippet, and they fail differently: the missing emptiness guard <em>crashes</em>, while the " +
        "missing final <code>return not st</code> <em>silently accepts</em>. Short-circuit ordering matters &mdash; " +
        "<code>st.pop() != ... or not st</code> would still crash."
    },
    {
      n: 2,
      title: "Monotonic stack with no sentinel, so survivors are never resolved",
      wrong: [
        "st, best = [], 0",
        "for i, x in enumerate(h):",
        "    while st and h[st[-1]] >= x:",
        "        top = st.pop()",
        "        left = st[-1] if st else -1",
        "        best = max(best, h[top] *",
        "                   (i - left - 1))",
        "    st.append(i)",
        "return best",
        "",
        "# h=[2,3,4] -> nothing pops -> 0"
      ],
      right: [
        "hh = h + [0]                 # sentinel",
        "st, best = [], 0",
        "for i, x in enumerate(hh):",
        "    while st and hh[st[-1]] >= x:",
        "        top = st.pop()",
        "        left = st[-1] if st else -1",
        "        best = max(best, hh[top] *",
        "                   (i - left - 1))",
        "    st.append(i)",
        "return best",
        "",
        "# h=[2,3,4] -> 6"
      ],
      note:
        "Index <code>h[st[-1]]</code> still refers to the <em>original</em> array while <code>x</code> iterates the " +
        "extended one, so bind <code>hh = h + [0]</code> and index <code>hh</code> everywhere &mdash; consistently, not " +
        "half and half."
    },
    {
      n: 3,
      title: "Min Stack pushing only on a strict decrease",
      wrong: [
        "def push(self, x):",
        "    self.st.append(x)",
        "    if not self.mn or x < self.mn[-1]:",
        "        self.mn.append(x)",
        "",
        "def pop(self):",
        "    x = self.st.pop()",
        "    if x == self.mn[-1]:",
        "        self.mn.pop()",
        "",
        "# push 2, push 2, pop -> mn empty",
        "# -> getMin() crashes"
      ],
      right: [
        "def push(self, x):",
        "    self.st.append(x)",
        "    if not self.mn or x <= self.mn[-1]:",
        "        self.mn.append(x)      # note <=",
        "",
        "def pop(self):",
        "    x = self.st.pop()",
        "    if x == self.mn[-1]:",
        "        self.mn.pop()",
        "",
        "# duplicates of the minimum are tracked"
      ],
      note:
        "<code>&le;</code> makes the number of min-stack copies equal to the number of live copies of the minimum, " +
        "restoring the pop symmetry. The alternative is to store <code>(value, count)</code> pairs; the one thing that " +
        "does not work is strict <code>&lt;</code>."
    },
    {
      n: 4,
      title: "RPN: floor division and reversed operands",
      wrong: [
        "b, a = st.pop(), st.pop()",
        "if op == '-': st.append(b - a)",
        "if op == '/': st.append(a // b)",
        "",
        "# ['4','13','-'] -> 9 instead of -9",
        "# ['7','-2','/'] -> -4 instead of -3"
      ],
      right: [
        "b, a = st.pop(), st.pop()",
        "if op == '-': st.append(a - b)",
        "if op == '/': st.append(int(a / b))",
        "",
        "# ['4','13','-'] -> -9",
        "# ['7','-2','/'] -> -3"
      ],
      note:
        "The operand popped <em>first</em> is the right-hand side. Python&rsquo;s <code>//</code> floors toward minus " +
        "infinity, so it disagrees with the truncation semantics these problems specify whenever exactly one operand is " +
        "negative; <code>int(a / b)</code> truncates toward zero. For very large integers prefer " +
        "<code>abs(a) // abs(b)</code> with an explicit sign to avoid float rounding."
    }
  ],

  practice: {
    caption: "Drill set for Stack",
    rows: [
      ["Baseball Game", "LC 682", "Easy", "plain LIFO bookkeeping, no cleverness"],
      ["Backspace String Compare", "LC 844", "Easy", "stack build, then the O(1)-space two-pointer variant"],
      ["Min Stack", "LC 155", "Medium", "parallel aggregate stack, duplicate-minimum handling"],
      ["Evaluate Reverse Polish Notation", "LC 150", "Medium", "operand order, truncating division"],
      ["Car Fleet", "LC 853", "Medium", "sort by position, monotonic stack on arrival times"],
      ["Asteroid Collision", "LC 735", "Medium", "stack where an element can be destroyed mid-resolution"],
      ["Next Greater Element II", "LC 503", "Medium", "circular array: run the scan twice, mod the index"],
      ["Basic Calculator", "LC 224", "Hard", "sign stack plus nesting; recursion depth is the trap"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;For each day, how many days until a <strong>warmer</strong> temperature?&rdquo;",
      options: ["Monotonic stack", "Heap", "Sliding window", "Binary search"],
      answer: 0,
      why: "This asks for the nearest element by position satisfying a comparison. A heap returns the global extreme and ignores position entirely."
    },
    {
      prompt: "The maximum inside <strong>every fixed-size window</strong>.",
      options: ["Monotonic stack", "Monotonic deque", "Min stack", "Sort"],
      answer: 1,
      why: "A stack cannot evict from the bottom when the window slides. The deque can, which is exactly the difference."
    },
    {
      prompt: "k-th largest <strong>overall</strong>, with elements inserted dynamically.",
      options: ["Stack", "Heap", "Monotonic stack", "Two pointers"],
      answer: 1,
      why: "Stack order is arrival order, not value order. Dynamic inserts plus extreme queries is the heap's job description."
    },
    {
      prompt: "Only <strong>one</strong> bracket type, and you only need to know whether it balances.",
      options: ["Matching stack", "An integer counter", "Monotonic stack", "Recursion"],
      answer: 1,
      why: "A stack costs O(n) space for a problem solvable in O(1). With one bracket type there is nothing to remember but the depth."
    },
    {
      prompt: "You must return the <strong>minimum of the whole stack in O(1)</strong>, at any time.",
      options: ["Recompute min(st) per query", "A parallel min-stack", "Sort the stack", "Heap"],
      answer: 1,
      why: "Recomputing is O(n) per query. Pushing the running minimum alongside each value keeps every operation O(1)."
    },
    {
      prompt: "Recursive DFS on an input where depth may reach 10<sup>5</sup>.",
      options: ["Keep the recursion", "Convert to an explicit stack", "Use a heap", "Memoise"],
      answer: 1,
      why: "Python raises RecursionError at roughly 1000 frames. Any recursion is already a stack machine — make it explicit."
    },
    {
      prompt: "&ldquo;Largest rectangle in a histogram.&rdquo;",
      options: ["Monotonic stack", "Sliding window", "Two pointers", "Binary search"],
      answer: 0,
      why: "Each bar's rectangle is bounded by its previous-smaller and next-smaller neighbours, and one monotonic pass computes both."
    },
    {
      prompt: "Water trapped between bars, with an <strong>O(1) space</strong> requirement.",
      options: ["Monotonic stack", "Two pointers", "Prefix arrays", "Heap"],
      answer: 1,
      why: "Both the stack and two pointers are O(n) time, but only two pointers is O(1) space. State the trade-off out loud."
    },
    {
      prompt: "Validate and <strong>decode</strong> an arbitrarily nested string like <code>3[a2[c]]</code>.",
      options: ["An integer counter", "Matching / deferred-computation stacks", "Sliding window", "Sort"],
      answer: 1,
      why: "Counters only work for a single bracket type and cannot carry the partial results. Push operands, pop when the closer arrives."
    }
  ]
};
