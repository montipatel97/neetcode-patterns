/* Topic content, transcribed from the Linked List chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["linked-list"] = {
  id: "linked-list",
  number: "06",
  title: "Linked List",
  subtitle: "Pointer rewiring with dummy heads, fast/slow pointers, Floyd cycle algebra",
  accent: "fuchsia",
  bounds: { time: "O(n)", space: "O(1)", driver: "pointer rewiring, no extra structure" },

  mechanics: {
    lede:
      "A linked list gives you no random access, no pointer arithmetic, and no way to shift elements. Everything " +
      "structural must therefore be done by <strong>rewiring <code>next</code> fields in a safe order</strong>. " +
      "Almost every bug in this topic is an ordering bug: writing <code>x.next</code> while <code>x.next</code> was " +
      "still the only reference to the rest of the list.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Three-pointer reversal",
        blurb: "Save, rewire, advance the boundary, advance the scan &mdash; in exactly that order.",
        caption: "Iterative reversal",
        code: [
          "def reverse_list(head):",
          "    prev, cur = None, head",
          "    while cur:",
          "        nxt = cur.next     # 1. SAVE the rest",
          "        cur.next = prev    # 2. rewire",
          "        prev = cur         # 3. advance the boundary",
          "        cur = nxt          # 4. advance the scan",
          "    return prev            # prev is the new head"
        ],
        invariant:
          "The list is partitioned into exactly two intact chains: <code>prev</code> heads the already-reversed prefix, " +
          "<code>cur</code> heads the untouched suffix, and no node belongs to both or to neither. Node count is " +
          "conserved at every step &mdash; the four statements must run in that order because step 2 destroys the only " +
          "reference to the suffix."
      },
      {
        tag: "Mechanism B",
        name: "Dummy head (sentinel)",
        blurb: "Makes &ldquo;the head changed&rdquo; stop being a special case.",
        caption: "Merge two sorted lists",
        code: [
          "def merge(a, b):",
          "    dummy = tail = ListNode(0)",
          "    while a and b:",
          "        if a.val <= b.val:",
          "            tail.next, a = a, a.next",
          "        else:",
          "            tail.next, b = b, b.next",
          "        tail = tail.next",
          "    tail.next = a or b     # attach the remainder",
          "    return dummy.next"
        ],
        invariant:
          "<code>dummy.next</code> is always the head of the finished output and <code>tail</code> always points at its " +
          "last node. Because the head is reachable <em>through a node you own</em>, &ldquo;the head changed&rdquo; " +
          "stops being a special case &mdash; this is the entire reason sentinels exist, and it eliminates an " +
          "<code>if</code>-branch in deletion, merging and partitioning problems alike."
      },
      {
        tag: "Mechanism C",
        name: "Fast/slow (two pointers at different speeds)",
        blurb:
          "Same-speed pointers with a fixed gap answer &ldquo;k-th from the end&rdquo; in one pass. Different-speed " +
          "pointers answer &ldquo;middle&rdquo; and &ldquo;is there a cycle&rdquo;.",
        caption: "Middle, and k-th from the end",
        code: [
          "def middle(head):",
          "    slow = fast = head",
          "    while fast and fast.next:   # guard order matters",
          "        slow, fast = slow.next, fast.next.next",
          "    return slow                 # second middle if even",
          "",
          "def remove_nth_from_end(head, n):",
          "    dummy = ListNode(0, head)",
          "    fast = slow = dummy",
          "    for _ in range(n + 1):      # gap of n+1",
          "        fast = fast.next",
          "    while fast:",
          "        slow, fast = slow.next, fast.next",
          "    slow.next = slow.next.next",
          "    return dummy.next"
        ],
        invariant:
          "For the gap form: <code>fast</code> is always exactly <code>n + 1</code> nodes ahead of <code>slow</code>. " +
          "When fast falls off the end, slow sits <code>n + 1</code> from the end, i.e. immediately <em>before</em> the " +
          "node to delete. For the speed form: after k steps slow has moved k and fast has moved 2k."
      }
    ],
    aside: {
      title: "The mechanical rule for every pointer edit",
      body:
        "<strong>Save, rewire, advance</strong> &mdash; in that order, and never write <code>x.next</code> until you " +
        "hold a separate reference to <code>x.next</code>. If you find yourself needing " +
        "<code>cur.next.next.next</code>, stop and introduce a named variable: chained dereferences are where " +
        "<code>AttributeError: 'NoneType' object has no attribute 'next'</code> comes from."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of reversal",
        sub: "invariant plus conservation",
        body:
          "<p>Let the original list be <code>v_0 ... v_{n-1}</code>. <strong>Claim:</strong> before each iteration, " +
          "<code>prev</code> is the chain <code>v_{i-1} &rarr; ... &rarr; v_0</code> and <code>cur</code> is " +
          "<code>v_i &rarr; ... &rarr; v_{n-1}</code>.</p>" +
          "<p><strong>Initialisation:</strong> <code>i = 0</code>, prev is the empty chain (<code>None</code>) and cur " +
          "is the whole list. <strong>Maintenance:</strong> the body saves <code>v_{i+1}</code>, points " +
          "<code>v_i</code> at <code>v_{i-1}</code> (extending the reversed chain), then sets " +
          "<code>prev = v_i</code> and <code>cur = v_{i+1}</code>, which is the claim for <code>i + 1</code>. " +
          "<strong>Termination:</strong> <code>cur == None</code> means <code>i == n</code>, so prev is " +
          "<code>v_{n-1} &rarr; ... &rarr; v_0</code> &mdash; the reversed list, with all n nodes present exactly once.</p>"
      },
      {
        title: "Correctness of Floyd cycle detection",
        sub: "the gap-decrement argument",
        body:
          "<p><strong>Detection.</strong> Suppose a cycle exists. Once slow has entered the cycle, both pointers are " +
          "inside it forever. Consider the forward distance d from slow to fast measured around the cycle of length L. " +
          "Each step, fast advances 2 and slow advances 1, so the distance from fast to slow <em>decreases by exactly " +
          "1</em> each step. A quantity that decreases by exactly 1 and lives in <code>{0, ..., L-1}</code> must hit " +
          "0 &mdash; so they meet, in at most L steps after slow enters. If no cycle exists, fast reaches " +
          "<code>None</code> first. Hence the test is exact in both directions.</p>"
      },
      {
        title: "Finding the cycle entry",
        sub: "m = kL &minus; x",
        body:
          "<p>Let m be the distance from the head to the cycle entry, L the cycle length, and x the distance from the " +
          "entry to the meeting point. When they meet, slow has travelled <code>m + x</code> and fast has travelled " +
          "<code>2(m + x)</code>; fast is also <code>m + x + kL</code> for some integer <code>k &ge; 1</code> because " +
          "it has lapped the cycle.</p>" +
          "<p>Setting them equal: <code>2(m + x) = m + x + kL</code>, therefore <code>m + x = kL</code>, therefore " +
          "<code>m = kL - x</code>.</p>" +
          "<p>So walking m steps from the head, and m steps from the meeting point, both land on the same node: the head " +
          "pointer arrives at the entry by definition, and the meeting pointer travels <code>x + m = kL</code> total " +
          "from the entry &mdash; a whole number of laps, also landing on the entry. Two <em>same-speed</em> pointers " +
          "therefore collide exactly at the cycle entry.</p>"
      },
      {
        title: "Complexity proof",
        sub: "why iterative is not just style",
        body:
          "<p><strong>Time.</strong> Reversal, merging and gap scans touch each node a constant number of times: O(n). " +
          "Floyd&rsquo;s first phase runs at most <code>m + L &le; n</code> steps and the second at most " +
          "<code>m &le; n</code>, so O(n) overall.</p>" +
          "<p><strong>Space.</strong> O(1) &mdash; a fixed number of node references, independent of n. This is the only " +
          "reason to prefer Floyd over a visited set, which is also O(n) time but O(n) space. Recursive reversal is O(n) " +
          "time but O(n) <em>stack</em>, which fails at <code>n = 10<sup>5</sup></code>; the iterative form is not just " +
          "stylistic preference.</p>" +
          "<p><strong>Merge k lists.</strong> With a heap of the k current heads: N pops, each O(log k), so " +
          "<code>O(N log k)</code> time and O(k) space &mdash; strictly better than repeated pairwise merging at " +
          "<code>O(kN)</code>.</p>"
      }
    ],
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "That <code>m = kL - x</code> identity is the whole reason the second phase uses speed 1 for <em>both</em> " +
        "pointers. Being able to derive it on the spot &mdash; rather than recalling the recipe &mdash; is the " +
        "difference between a shaky and a clean answer, and it is a standard follow-up for quant-adjacent loops because " +
        "it is pure modular arithmetic."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Note"],
      rows: [
        ["Reverse (iterative)", "O(n)", "O(1)", "three pointers"],
        ["Reverse (recursive)", "O(n)", "O(n) stack", "<code>RecursionError</code> past ~1000 nodes"],
        ["Merge two sorted", "O(n + m)", "O(1)", "dummy head, splice not copy"],
        ["Merge k sorted (heap)", "O(N log k)", "O(k)", "heap of heads, push the successor on pop"],
        ["Cycle detection (Floyd)", "O(n)", "O(1)", "gap-decrement argument"],
        ["Cycle detection (hash set)", "O(n)", "O(n)", "simpler to state, worse to defend"],
        ["Middle / k-th from end", "O(n)", "O(1)", "single pass with a gap"],
        ["Sort a list (merge sort)", "O(n log n)", "O(log n) stack", "split at the middle, merge with a dummy"],
        ["Copy list with random pointer", "O(n)", "O(n)", "node &rarr; clone map, or O(1) with interleaving"],
        ["LRU cache", "O(1) per op", "O(capacity)", "hash map + doubly linked list"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["the head may be removed or replaced", "dummy head", "otherwise every caller needs a special case for the head"],
      ["&ldquo;in one pass&rdquo;, positional target from the end", "two pointers with a fixed gap", "computing the length first is two passes (usually accepted, but the gap is the expected answer)"],
      ["&ldquo;detect a cycle&rdquo; with O(1) space demanded", "Floyd fast/slow", "a visited set is O(n) space"],
      ["cycle <em>entry</em>, not just existence", "Floyd phase two", "a set gives the entry for free, at O(n) space &mdash; state the trade"],
      ["&ldquo;reorder&rdquo;, &ldquo;palindrome&rdquo;, &ldquo;add two numbers II&rdquo;", "reverse a half, or use a stack", "indexing is unavailable, so reversal substitutes for backwards iteration"],
      ["need backwards traversal repeatedly", "doubly linked list, or copy to an array", "repeatedly re-walking forwards is O(n&sup2;)"],
      ["O(1) insert/delete <em>and</em> O(1) lookup", "hash map + doubly linked list (LRU)", "neither structure alone gives both"],
      ["merging many sorted sources", "heap <span class='topic-ref'>topic 09</span>", "pairwise merging re-reads the same prefixes"],
      ["sorting a linked list", "merge sort", "quicksort needs random access for partitioning"],
      ["deep recursive traversal, n up to 10<sup>5</sup>", "iterative rewiring", "Python&rsquo;s frame limit is ~1000"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>head is None</code>", "<code>while fast and fast.next</code> is safe, but <code>head.val</code> or <code>head.next</code> raises <code>AttributeError</code>"],
      ["single node", "cycle detection must not report a cycle; <code>slow == fast</code> holds at step 0 if you compare before moving"],
      ["two nodes", "middle returns the second; reversal must still return the tail as the new head"],
      ["comparing before the first move in Floyd", "<code>slow == fast == head</code> initially, so a do-while shape (or moving first) is required"],
      ["removing the head (<code>n == length</code>)", "without a dummy, <code>slow.next = slow.next.next</code> dereferences <code>None</code>"],
      ["n larger than the length", "the <code>for _ in range(n+1)</code> advance walks off the end; guard or trust the constraint, but say which"],
      ["even-length middle", "&ldquo;first middle&rdquo; needs <code>while fast.next and fast.next.next</code>; &ldquo;second middle&rdquo; needs <code>while fast and fast.next</code>"],
      ["cycle whose entry is the head (<code>m == 0</code>)", "phase two must terminate immediately &mdash; both pointers already equal the entry"],
      ["self-loop (<code>node.next is node</code>)", "<code>L == 1</code>; the gap argument still holds, but a <code>while fast != slow</code> do-while must not exit early"],
      ["duplicate values", "node identity checks must use <code>is</code>, not <code>==</code>, or a value collision fakes a cycle"],
      ["one list empty in a merge", "<code>tail.next = a or b</code> handles it; an explicit <code>while a:</code> loop is fine but longer"],
      ["losing the tail after splitting", "forgetting <code>prev.next = None</code> when splitting for merge sort makes an infinite list"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Rewiring before saving the successor",
      wrong: [
        "prev, cur = None, head",
        "while cur:",
        "    cur.next = prev  # destroys the link",
        "    cur = cur.next   # now reads prev!",
        "    prev = cur",
        "",
        "# 1->2->3 becomes an infinite",
        "# walk backwards; usually hangs"
      ],
      right: [
        "prev, cur = None, head",
        "while cur:",
        "    nxt = cur.next   # save first",
        "    cur.next = prev",
        "    prev = cur",
        "    cur = nxt",
        "return prev"
      ],
      note:
        "<code>cur = cur.next</code> after the rewire reads the <em>new</em> value of <code>cur.next</code>, which is " +
        "<code>prev</code>. The loop then oscillates between two nodes forever. Save, rewire, advance &mdash; in that " +
        "order, always."
    },
    {
      n: 2,
      title: "No dummy head, so deleting the head fails",
      wrong: [
        "fast = slow = head",
        "for _ in range(n):",
        "    fast = fast.next",
        "while fast.next:",
        "    slow, fast = slow.next, fast.next",
        "slow.next = slow.next.next",
        "return head",
        "",
        "# head=[1], n=1 -> fast=None ->",
        "# AttributeError on fast.next"
      ],
      right: [
        "dummy = ListNode(0, head)",
        "fast = slow = dummy",
        "for _ in range(n + 1):",
        "    fast = fast.next",
        "while fast:",
        "    slow, fast = slow.next, fast.next",
        "slow.next = slow.next.next",
        "return dummy.next"
      ],
      note:
        "The gap must be <code>n + 1</code> so that slow stops <em>before</em> the victim, and it must start at the " +
        "dummy so that the victim can be the real head. The loop condition changes from <code>while fast.next</code> to " +
        "<code>while fast</code> to match the extra node of slack."
    },
    {
      n: 3,
      title: "Fast/slow guard in the wrong order, or the wrong pair of tests",
      wrong: [
        "while fast.next and fast:   # wrong order",
        "    slow = slow.next",
        "    fast = fast.next.next",
        "",
        "# AttributeError: 'NoneType'",
        "# has no attribute 'next'",
        "# (fast.next evaluated before",
        "#  fast is known non-None)"
      ],
      right: [
        "while fast and fast.next:   # short-circuit",
        "    slow = slow.next",
        "    fast = fast.next.next"
      ],
      note:
        "<code>and</code> short-circuits left to right, so the null check must come first. Separately, the choice of " +
        "guard selects <em>which</em> middle you get: <code>while fast and fast.next</code> leaves slow on the second " +
        "middle of an even list, while <code>while fast.next and fast.next.next</code> leaves it on the first middle " +
        "&mdash; which is the one you need when splitting a list for merge sort."
    },
    {
      n: 4,
      title: "Comparing values instead of identity, and comparing before moving",
      wrong: [
        "while slow == fast:     # equal at step 0",
        "    slow = slow.next",
        "    fast = fast.next.next",
        "...",
        "if slow.val == fast.val:  # value collision",
        "    return True"
      ],
      right: [
        "while fast and fast.next:",
        "    slow = slow.next",
        "    fast = fast.next.next",
        "    if slow is fast:      # identity, after moving",
        "        return True",
        "return False"
      ],
      note:
        "Two defects. <code>slow</code> and <code>fast</code> both start at <code>head</code>, so any test placed " +
        "before the first move triggers immediately; move first, then compare. And nodes with equal <code>val</code> " +
        "are not the same node &mdash; on <code>1 &rarr; 1 &rarr; None</code> the value test reports a cycle that does " +
        "not exist. Use <code>is</code>."
    }
  ],

  practice: {
    caption: "Drill set for Linked List",
    rows: [
      ["Merge Two Sorted Lists", "LC 21", "Easy", "dummy head, splicing instead of copying"],
      ["Linked List Cycle", "LC 141", "Easy", "Floyd phase one only, identity comparison"],
      ["Reorder List", "LC 143", "Medium", "find middle, reverse the second half, interleave"],
      ["Copy List with Random Pointer", "LC 138", "Medium", "node &rarr; clone hash map; then the O(1)-space interleave trick"],
      ["Add Two Numbers", "LC 2", "Medium", "carry propagation with a dummy head and unequal lengths"],
      ["LRU Cache", "LC 146", "Medium", "hash map over a doubly linked list, O(1) eviction"],
      ["Merge k Sorted Lists", "LC 23", "Hard", "heap of heads, O(N log k)"],
      ["Reverse Nodes in k-Group", "LC 25", "Hard", "reversal invariant applied to a window, with a pre-count"]
    ]
  },

  quiz: [
    {
      prompt: "The <strong>head itself</strong> may be removed or replaced by the operation.",
      options: ["Dummy head", "Return early on head", "Copy to an array", "Recursion"],
      answer: 0,
      why: "Without a sentinel, every caller needs a special case for 'the head changed'. Owning a node in front of the head removes the branch entirely."
    },
    {
      prompt: "Detect a cycle, with <strong>O(1) space</strong> explicitly demanded.",
      options: ["Visited set", "Floyd fast/slow", "Sort the nodes", "Reverse and compare"],
      answer: 1,
      why: "A visited set is O(n) space. Floyd uses two references and nothing else — that space bound is its entire reason for existing."
    },
    {
      prompt: "You need the <strong>cycle entry</strong>, not merely whether one exists.",
      options: ["Floyd phase two", "Floyd phase one", "Count the nodes", "Two converging pointers"],
      answer: 0,
      why: "Phase one only finds some meeting point. Phase two walks m steps from the head and from the meeting point, using m = kL − x."
    },
    {
      prompt: "&ldquo;Remove the n-th node <strong>from the end, in one pass</strong>.&rdquo;",
      options: ["Compute the length first", "Two pointers with a gap of n+1", "Reverse the list", "Recursion"],
      answer: 1,
      why: "Computing the length is two passes. A gap of n+1 leaves slow immediately before the victim when fast falls off the end."
    },
    {
      prompt: "Merging <strong>k</strong> sorted lists.",
      options: ["Pairwise merging", "Heap of the k heads", "Concatenate and sort", "Two pointers"],
      answer: 1,
      why: "Pairwise merging re-reads the same prefixes for O(kN). A heap of heads gives O(N log k)."
    },
    {
      prompt: "You need <strong>both</strong> O(1) lookup and O(1) insert/delete at arbitrary positions.",
      options: ["Hash map alone", "Doubly linked list alone", "Hash map + doubly linked list", "Array"],
      answer: 2,
      why: "Neither structure alone gives both: the map has no order, the list has no lookup. Combining them is exactly the LRU cache."
    },
    {
      prompt: "Sorting a linked list.",
      options: ["Quicksort", "Merge sort", "Heapsort in place", "Insertion sort"],
      answer: 1,
      why: "Quicksort needs random access to partition. Merge sort only walks forwards, which is all a list offers."
    },
    {
      prompt: "Recursive traversal on a list of up to 10<sup>5</sup> nodes.",
      options: ["Keep the recursion", "Rewrite iteratively", "Increase the recursion limit", "Memoise"],
      answer: 1,
      why: "Python's frame limit is roughly 1000. Recursive reversal is O(n) stack, which is a correctness failure at this size, not a style preference."
    },
    {
      prompt: "Checking whether two nodes are the same node, where values may repeat.",
      options: ["==", "is", ".val comparison", "hash()"],
      answer: 1,
      why: "Equal values are not the same node. On 1 → 1 → None a value test reports a cycle that does not exist."
    }
  ]
};
