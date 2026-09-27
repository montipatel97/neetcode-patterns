/* Topic content, transcribed from the Trees chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["trees"] = {
  id: "trees",
  number: "07",
  title: "Trees",
  subtitle: "Traversal orders as tools, postorder aggregation, range invariants, BFS by level",
  accent: "rose",
  bounds: { time: "O(n)", space: "O(h) / O(w)", driver: "each node visited once" },

  mechanics: {
    lede:
      "Pick the traversal from <strong>the direction the information flows</strong>. That single decision determines " +
      "the whole solution, and it is the thing to say out loud before writing any code.",
    mechanisms: [
      {
        tag: "The four shapes",
        name: "Which traversal, and what it is for",
        blurb:
          "<strong>Preorder</strong> (node, then children) pushes context <em>down</em>: path sums, serialize, copy. " +
          "<strong>Inorder</strong> (left, node, right) yields ascending key order in a BST: validate, k-th smallest. " +
          "<strong>Postorder</strong> (children, then node) aggregates <em>up</em>: height, diameter, balanced, subtree " +
          "sums, tree DP. <strong>BFS</strong> (level by level) measures distance from the root: level order, " +
          "right/left view, minimum depth, &ldquo;first/nearest&rdquo; queries.",
        caption: null,
        code: null,
        invariant: null
      },
      {
        tag: "Mechanism A",
        name: "Postorder aggregation",
        blurb: "The workhorse: <em>return one thing, side-effect another</em>.",
        caption: "Diameter: return height, accumulate the best path",
        code: [
          "def diameter(root):",
          "    best = 0",
          "",
          "    def height(node):      # edge-height of subtree",
          "        nonlocal best",
          "        if not node:",
          "            return 0",
          "        lh = height(node.left)",
          "        rh = height(node.right)",
          "        best = max(best, lh + rh)   # path APEX here",
          "        return 1 + max(lh, rh)      # what the parent needs",
          "",
          "    height(root)",
          "    return best"
        ],
        invariant:
          "When <code>height(node)</code> returns, (a) its return value is the exact edge-height of <code>node</code>&rsquo;s " +
          "subtree, and (b) <code>best</code> has been updated for every path whose highest point lies inside that " +
          "subtree. <strong>Separating &ldquo;what I return&rdquo; from &ldquo;what I record&rdquo; is the pattern; " +
          "conflating them is the bug.</strong>"
      },
      {
        tag: "Mechanism B",
        name: "Preorder with a pushed-down range",
        blurb: "BST validation. The constraint is transitive, so ancestors must travel down with the recursion.",
        caption: "Validate BST by interval, not by parent comparison",
        code: [
          "def is_valid_bst(root):",
          "    def ok(node, lo, hi):   # lo < key < hi",
          "        if not node:",
          "            return True",
          "        if not (lo < node.val < hi):",
          "            return False",
          "        return (ok(node.left, lo, node.val) and",
          "                ok(node.right, node.val, hi))",
          "",
          "    return ok(root, float('-inf'), float('inf'))"
        ],
        invariant:
          "Every node is validated against the open interval imposed by <em>all</em> of its ancestors, not just its " +
          "parent. Descending left tightens the upper bound to the parent key; descending right tightens the lower " +
          "bound. The interval only ever narrows, which is why a single pass suffices."
      },
      {
        tag: "Mechanism C",
        name: "BFS with a level snapshot",
        blurb: "Capturing the level width before consuming it is what keeps the levels apart.",
        caption: "Level order traversal",
        code: [
          "def level_order(root):",
          "    if not root:",
          "        return []",
          "    out, q = [], deque([root])",
          "    while q:",
          "        n = len(q)          # SNAPSHOT this level",
          "        level = []",
          "        for _ in range(n):  # consume exactly this level",
          "            node = q.popleft()",
          "            level.append(node.val)",
          "            if node.left:  q.append(node.left)",
          "            if node.right: q.append(node.right)",
          "        out.append(level)",
          "    return out"
        ],
        invariant:
          "At the top of the outer loop, the queue contains exactly the nodes at the current depth, in left-to-right " +
          "order. Capturing <code>len(q)</code> before the inner loop is what preserves that invariant &mdash; without " +
          "the snapshot, the inner loop consumes children of the same level it is producing and the levels smear together."
      }
    ],
    aside: {
      title: "Why local parent comparison does not validate a BST",
      body:
        "The BST property is <em>global</em>. Counter-example: root 5, left child 1, right child 6, and 6 has children " +
        "3 and 7. Every parent-child pair is individually consistent (<code>1 &lt; 5</code>, <code>6 &gt; 5</code>, " +
        "<code>3 &lt; 6</code>, <code>7 &gt; 6</code>), yet 3 sits in the right subtree of 5 while <code>3 &lt; 5</code> " +
        "&mdash; so an inorder walk yields <code>1, 5, 3, 6, 7</code>, not sorted. Any correct solution must propagate " +
        "ancestor constraints, whether as an explicit range or as &ldquo;previous value seen in inorder&rdquo;."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Inorder traversal of a BST is sorted",
        sub: "structural induction",
        body:
          "<p><strong>Claim:</strong> <code>inorder(T)</code> is strictly ascending for any BST T.</p>" +
          "<p><strong>Base:</strong> the empty tree gives the empty sequence. <strong>Step:</strong> by the BST property " +
          "every key in <code>T.left</code> is <code>&lt; T.val</code> and every key in <code>T.right</code> is " +
          "<code>&gt; T.val</code>. By induction <code>inorder(T.left)</code> and <code>inorder(T.right)</code> are each " +
          "ascending, so the concatenation <code>inorder(left) + [val] + inorder(right)</code> is ascending, since its " +
          "three blocks are ordered relative to one another.</p>" +
          "<p>This immediately gives two algorithms: validate a BST by checking the inorder sequence is increasing, and " +
          "find the k-th smallest by <em>stopping</em> the inorder walk after k emissions.</p>"
      },
      {
        title: "Completeness of the diameter argument",
        sub: "every path has a unique apex",
        body:
          "<p>Every path in a tree has a unique highest node, its <em>apex</em>: walk up from both endpoints; the paths " +
          "to the root converge at exactly one node, the LCA of the endpoints.</p>" +
          "<p>For a fixed apex v, the longest path with apex v is <code>height(v.left) + height(v.right)</code> edges, " +
          "since the two sides are independent and the best you can do on each is its height. The algorithm evaluates " +
          "exactly that quantity once per node, so it enumerates the optimum over every possible apex. Taking the " +
          "maximum is therefore exhaustive: no path is missed, and nothing that is not a path is counted.</p>"
      },
      {
        title: "Why BFS answers &ldquo;minimum depth&rdquo; and DFS does not cheaply",
        sub: "the queue orders by depth",
        body:
          "<p>BFS dequeues nodes in non-decreasing order of depth: the queue invariant says all nodes at depth d are " +
          "processed before any at depth <code>d+1</code>. Hence the first leaf dequeued has minimum depth and you can " +
          "return immediately.</p>" +
          "<p>DFS must explore an entire subtree before it knows whether a shallower leaf exists elsewhere, so it cannot " +
          "short-circuit. It is still O(n), but it always pays the full cost, and on a tree with one very deep and one " +
          "very shallow branch BFS wins dramatically.</p>"
      },
      {
        title: "Complexity proof",
        sub: "and why DFS/BFS space is incomparable",
        body:
          "<p><strong>Time.</strong> Each node is pushed and popped exactly once in BFS, and entered exactly once in DFS " +
          "(a tree has no cycles, so no visited set is needed). A tree with n nodes has exactly <code>n - 1</code> " +
          "edges. Total: <strong>O(n)</strong>, for all four traversal shapes &mdash; the order changes, the count does " +
          "not.</p>" +
          "<p><strong>Space.</strong> DFS uses O(h) stack frames: O(log n) for a balanced tree, O(n) for a degenerate " +
          "path (which is exactly the input that triggers <code>RecursionError</code> in Python at around 1000 nodes). " +
          "BFS uses O(w) where w is the maximum level width, up to <code>ceil(n/2)</code> for a complete tree&rsquo;s " +
          "bottom level. So DFS and BFS have <em>incomparable</em> space profiles: DFS is better on bushy trees, BFS on " +
          "deep skinny ones.</p>" +
          "<p>Morris inorder traversal achieves O(1) space by temporarily rewiring right pointers into threads &mdash; " +
          "worth naming as the follow-up answer, rarely worth coding under time pressure.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Note"],
      rows: [
        ["Any DFS traversal (recursive)", "O(n)", "O(h)", "h = height; O(n) worst case"],
        ["BFS level order", "O(n)", "O(w)", "w = max level width"],
        ["Validate BST (range)", "O(n)", "O(h)", "single pass, no sibling comparisons"],
        ["k-th smallest in a BST", "O(h + k)", "O(h)", "early-exit inorder, not O(n)"],
        ["Diameter / balanced / max path sum", "O(n)", "O(h)", "one postorder pass"],
        ["Serialize + deserialize", "O(n)", "O(n)", "output size is the bound"],
        ["Construct from preorder + inorder", "O(n)", "O(n)", "index map makes the split O(1)"],
        ["LCA in a BST", "O(h)", "O(1)", "descend by key comparison, iterative"],
        ["LCA in a general binary tree", "O(n)", "O(h)", "postorder &ldquo;found here&rdquo; reporting"],
        ["Morris inorder", "O(n)", "O(1)", "threads instead of a stack"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Decide the traversal from the direction the information flows. If a node&rsquo;s answer needs facts about its " +
        "<strong>children</strong>, it is postorder. If it needs facts about its <strong>ancestors</strong>, it is " +
        "preorder with an accumulator or a range. If it needs facts about its <strong>distance from the root</strong>, " +
        "it is BFS. If it needs the <strong>keys in order</strong>, it is inorder on a BST. Ask &ldquo;what does my " +
        "parent need from me, and what did my ancestors have to tell me?&rdquo; and the code writes itself."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;height&rdquo;, &ldquo;balanced&rdquo;, &ldquo;diameter&rdquo;, &ldquo;subtree sum&rdquo;", "postorder aggregation", "preorder cannot know child results yet"],
      ["&ldquo;root-to-leaf path&rdquo;, &ldquo;running sum from the root&rdquo;", "preorder with an accumulator", "postorder receives the context too late"],
      ["&ldquo;level&rdquo;, &ldquo;view from the right&rdquo;, &ldquo;zigzag&rdquo;, &ldquo;minimum depth&rdquo;", "BFS with a level snapshot", "DFS can do it with a depth-indexed list, but level logic gets fiddly"],
      ["BST + &ldquo;k-th smallest&rdquo;, &ldquo;validate&rdquo;, &ldquo;sorted output&rdquo;", "inorder", "a general-tree method throws away the ordering you were given"],
      ["BST + search / insert / LCA", "descend by comparison, O(h)", "a full traversal wastes the BST property"],
      ["&ldquo;nearest / shortest / fewest steps&rdquo; in a tree", "BFS", "DFS cannot short-circuit on distance"],
      ["the tree is given as an undirected edge list", "graph DFS/BFS with a visited set <span class='topic-ref'>topic 11</span>", "there is no root and no parent direction"],
      ["&ldquo;count paths summing to k&rdquo; (any start, any end)", "preorder + prefix-sum hash map", "postorder alone cannot cheaply count non-root paths"],
      ["n up to 10<sup>5</sup> and the tree may be a path", "iterative traversal with an explicit stack", "recursion dies at ~1000 frames"],
      ["tree DP with multiple states per node", "postorder returning a tuple", "a single scalar return cannot carry two states"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>root is None</code>", "<code>root.val</code> raises <code>AttributeError</code>; every recursive helper needs the null base case first"],
      ["single node", "diameter is 0 edges (not 1); minimum depth is 1 (not 0) &mdash; state the unit you are counting"],
      ["edges vs nodes for &ldquo;height&rdquo;", "mixing conventions makes diameter off by one or two; pick edge-height and keep it"],
      ["degenerate path-shaped tree", "recursion depth equals n; <code>RecursionError</code> at ~1000 nodes"],
      ["node values at the extremes of int", "range validation with sentinel ints breaks; <code>float('-inf')</code> / <code>float('inf')</code> are safe in Python"],
      ["duplicate keys in a &ldquo;BST&rdquo;", "the problem must define left-or-right; strict <code>lo &lt; v &lt; hi</code> rejects duplicates, <code>&le;</code> on one side admits them"],
      ["BFS without the <code>len(q)</code> snapshot", "levels merge; the output is one flat list"],
      ["minimum depth with a single child", "a node with one child is not a leaf; <code>min(left, right)</code> wrongly returns 0 through the missing side"],
      ["balanced check done top-down", "recomputes heights, O(n&sup2;); bottom-up with an early <code>-1</code> sentinel is O(n)"],
      ["LCA where one node is an ancestor of the other", "must return the ancestor itself, not its parent"],
      ["serialize with a delimiter that appears in values", "negative or multi-digit values collide; use a separator that cannot occur"],
      ["<code>nonlocal</code> forgotten in a nested helper", "<code>best = ...</code> creates a fresh local and the answer stays 0"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Validating a BST against the parent only",
      wrong: [
        "def ok(node):",
        "    if not node: return True",
        "    if node.left and node.left.val >= node.val:",
        "        return False",
        "    if node.right and node.right.val <= node.val:",
        "        return False",
        "    return ok(node.left) and ok(node.right)",
        "",
        "# tree 5(1, 6(3, 7)) -> returns True",
        "# but inorder is 1,5,3,6,7"
      ],
      right: [
        "def ok(node, lo, hi):",
        "    if not node: return True",
        "    if not (lo < node.val < hi):",
        "        return False",
        "    return (ok(node.left, lo, node.val) and",
        "            ok(node.right, node.val, hi))",
        "",
        "# ok(root, float('-inf'), float('inf'))",
        "# tree 5(1, 6(3, 7)) -> False"
      ],
      note:
        "The constraint is <em>transitive</em>: a node in the right subtree of 5 must exceed 5 no matter how deep it " +
        "sits. Equivalent correct alternative: walk inorder and assert each value exceeds the previous one &mdash; one " +
        "variable instead of two bounds."
    },
    {
      n: 2,
      title: "Returning the answer instead of the height",
      wrong: [
        "def height(node):",
        "    if not node: return 0",
        "    lh = height(node.left)",
        "    rh = height(node.right)",
        "    return lh + rh     # returns a PATH length",
        "",
        "# parent now receives a diameter,",
        "# not a height; on 1(2(4,5),3)",
        "# it reports 2, not 3"
      ],
      right: [
        "def height(node):",
        "    nonlocal best",
        "    if not node: return 0",
        "    lh = height(node.left)",
        "    rh = height(node.right)",
        "    best = max(best, lh + rh)   # record",
        "    return 1 + max(lh, rh)      # return"
      ],
      note:
        "One recursion, two different quantities: the parent needs a <em>height</em>, the answer is a <em>path</em>. " +
        "Whenever a tree problem has this shape (max path sum, longest univalue path, longest zigzag), the fix is the " +
        "same &mdash; record the through-path, return the extendable one."
    },
    {
      n: 3,
      title: "BFS without snapshotting the level width",
      wrong: [
        "q = deque([root])",
        "while q:",
        "    level = []",
        "    while q:          # drains children too",
        "        node = q.popleft()",
        "        level.append(node.val)",
        "        if node.left:  q.append(node.left)",
        "        if node.right: q.append(node.right)",
        "    out.append(level)",
        "",
        "# out = [[3,9,20,15,7]] -- one level"
      ],
      right: [
        "q = deque([root])",
        "while q:",
        "    level = []",
        "    for _ in range(len(q)):   # snapshot",
        "        node = q.popleft()",
        "        level.append(node.val)",
        "        if node.left:  q.append(node.left)",
        "        if node.right: q.append(node.right)",
        "    out.append(level)",
        "",
        "# out = [[3],[9,20],[15,7]]"
      ],
      note:
        "The inner <code>while q</code> keeps consuming nodes that the same loop just produced, so every level after the " +
        "first is absorbed into the one before it. Reading <code>len(q)</code> once, before the inner loop, freezes the " +
        "boundary."
    },
    {
      n: 4,
      title: "Minimum depth treating a one-child node as a leaf",
      wrong: [
        "def min_depth(node):",
        "    if not node: return 0",
        "    return 1 + min(min_depth(node.left),",
        "                   min_depth(node.right))",
        "",
        "# tree 1(2, None) -> returns 1",
        "# but the only leaf is at depth 2"
      ],
      right: [
        "def min_depth(node):",
        "    if not node: return 0",
        "    if not node.left:",
        "        return 1 + min_depth(node.right)",
        "    if not node.right:",
        "        return 1 + min_depth(node.left)",
        "    return 1 + min(min_depth(node.left),",
        "                   min_depth(node.right))"
      ],
      note:
        "A node with one child is <em>not</em> a leaf, but the missing side returns 0 and <code>min</code> happily takes " +
        "it. Either special-case the single-child node, or use BFS and return at the first genuinely childless node " +
        "dequeued &mdash; which also short-circuits."
    }
  ],

  practice: {
    caption: "Drill set for Trees",
    rows: [
      ["Invert Binary Tree", "LC 226", "Easy", "the minimal recursion shape; swap then recurse"],
      ["Maximum Depth of Binary Tree", "LC 104", "Easy", "postorder height, and the BFS alternative"],
      ["Balanced Binary Tree", "LC 110", "Easy", "bottom-up with a <code>-1</code> sentinel to avoid O(n&sup2;)"],
      ["Lowest Common Ancestor of a BST", "LC 235", "Medium", "descend by key comparison, O(h), iterative"],
      ["Binary Tree Right Side View", "LC 199", "Medium", "level snapshot, take the last element"],
      ["Kth Smallest Element in a BST", "LC 230", "Medium", "early-exit inorder with an explicit stack"],
      ["Construct Binary Tree from Preorder and Inorder", "LC 105", "Medium", "index map for O(1) splits; why both orders are needed"],
      ["Binary Tree Maximum Path Sum", "LC 124", "Hard", "the record-vs-return split again, with negative-value clamping"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;Compute the <strong>diameter</strong> of the tree.&rdquo;",
      options: ["Preorder with an accumulator", "Postorder aggregation", "BFS", "Inorder"],
      answer: 1,
      why: "The node's answer depends on facts about its children, so information flows upward. Preorder cannot know child results yet."
    },
    {
      prompt: "&ldquo;All <strong>root-to-leaf paths</strong> whose running sum equals a target.&rdquo;",
      options: ["Postorder", "Preorder with an accumulator", "BFS", "Inorder"],
      answer: 1,
      why: "The context travels downward from ancestors. Postorder receives it too late to have carried the running sum."
    },
    {
      prompt: "&ldquo;<strong>Right side view</strong> of the tree.&rdquo;",
      options: ["BFS with a level snapshot", "Postorder", "Inorder", "Preorder"],
      answer: 0,
      why: "The answer is defined by distance from the root. Take level[-1] on each pass — DFS can do it with a depth-indexed list, but the level logic gets fiddly."
    },
    {
      prompt: "BST, and the prompt asks for the <strong>k-th smallest</strong>.",
      options: ["Full traversal then sort", "Early-exit inorder", "BFS", "Postorder"],
      answer: 1,
      why: "Inorder on a BST is already sorted, so stop after k emissions: O(h + k), not O(n). Sorting throws away the property you were given."
    },
    {
      prompt: "The tree arrives as an <strong>undirected edge list</strong>, with no root given.",
      options: ["Tree recursion", "Graph DFS/BFS with a visited set", "Inorder", "Postorder"],
      answer: 1,
      why: "There is no root and no parent direction, so you need a visited set to avoid walking back up an edge you came down."
    },
    {
      prompt: "&ldquo;Count paths summing to k&rdquo;, where paths may <strong>start and end anywhere</strong>.",
      options: ["Postorder aggregation", "Preorder + prefix-sum hash map", "BFS", "Inorder"],
      answer: 1,
      why: "Postorder alone cannot cheaply count non-root paths. Carrying a prefix-sum map down the recursion reduces it to the topic-01 complement trick."
    },
    {
      prompt: "n up to 10<sup>5</sup>, and the tree may be a <strong>degenerate path</strong>.",
      options: ["Recursive DFS", "Iterative traversal with an explicit stack", "BFS by level", "Morris only"],
      answer: 1,
      why: "Recursion depth equals n on a path, and Python raises RecursionError at about 1000 frames."
    },
    {
      prompt: "Tree DP where each node needs to report <strong>two different states</strong> upward.",
      options: ["Two separate traversals", "Postorder returning a tuple", "BFS", "Preorder"],
      answer: 1,
      why: "A single scalar return cannot carry two states. Return the pair and let the parent destructure it — still one O(n) pass."
    },
    {
      prompt: "&ldquo;<strong>Minimum depth</strong>&rdquo; on a tree with one very deep and one very shallow branch.",
      options: ["DFS", "BFS", "Inorder", "Postorder"],
      answer: 1,
      why: "BFS dequeues in non-decreasing depth order, so the first leaf it reaches is the answer and it returns immediately. DFS always pays the full cost."
    }
  ]
};
