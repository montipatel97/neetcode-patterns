/* Topic content, transcribed from the Graphs chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["graphs"] = {
  id: "graphs",
  number: "11",
  title: "Graphs",
  subtitle: "DFS and BFS on explicit and implicit graphs, cycle detection, topological order, DSU",
  accent: "yellow",
  bounds: { time: "O(V+E)", space: "O(V)", driver: "each vertex and edge scanned once" },

  mechanics: {
    lede:
      "Five templates cover the whole topic. <strong>DFS + visited</strong> answers reachability, components and flood " +
      "fill. <strong>BFS + visited</strong> answers shortest path in an unweighted graph. <strong>Multi-source " +
      "BFS</strong> answers &ldquo;distance to the nearest X&rdquo; for every cell in one pass. <strong>Cycle " +
      "detection</strong> (parent-skip when undirected, on-stack colours when directed) answers validity and deadlock. " +
      "<strong>Topological sort</strong> answers dependency ordering.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Representation",
        blurb: "An edge list becomes an adjacency list; a grid needs no list at all, because neighbours are computed.",
        caption: "Two representations you will write every time",
        code: [
          "adj = defaultdict(list)",
          "for u, v in edges:",
          "    adj[u].append(v)",
          "    adj[v].append(u)    # omit for a DIRECTED graph",
          "",
          "DIRS = ((1, 0), (-1, 0), (0, 1), (0, -1))",
          "def nbrs(r, c, R, C):",
          "    for dr, dc in DIRS:",
          "        nr, nc = r + dr, c + dc",
          "        if 0 <= nr < R and 0 <= nc < C:",
          "            yield nr, nc"
        ],
        invariant: null
      },
      {
        tag: "Mechanism B",
        name: "BFS, with the one detail that matters",
        blurb: "Mark <strong>on enqueue</strong>, not on dequeue.",
        caption: "Shortest path in an unweighted graph",
        code: [
          "def bfs(adj, src):",
          "    dist = {src: 0}",
          "    q = deque([src])",
          "    while q:",
          "        u = q.popleft()",
          "        for v in adj[u]:",
          "            if v not in dist:",
          "                dist[v] = dist[u] + 1   # mark ON ENQUEUE",
          "                q.append(v)",
          "    return dist"
        ],
        invariant:
          "The queue holds nodes in non-decreasing order of <code>dist</code>, and the values present differ by at most " +
          "1. <code>dist[v]</code> is assigned exactly once &mdash; at the moment v is first discovered &mdash; and " +
          "that value is final. Marking on enqueue is what enforces &ldquo;exactly once&rdquo;; marking on dequeue lets " +
          "the same node enter the queue many times."
      },
      {
        tag: "Mechanism C",
        name: "Cycle detection differs by graph type",
        blurb: "Undirected: skip the edge you came from. Directed: track the recursion stack with three colours.",
        caption: "Two different problems wearing the same name",
        code: [
          "def has_cycle_undirected(adj, u, parent, seen):",
          "    seen.add(u)",
          "    for v in adj[u]:",
          "        if v == parent:",
          "            continue         # the edge we came by",
          "        if v in seen or has_cycle_undirected(",
          "                adj, v, u, seen):",
          "            return True",
          "    return False",
          "",
          "WHITE, GREY, BLACK = 0, 1, 2",
          "def has_cycle_directed(adj, u, color):",
          "    color[u] = GREY          # on the current stack",
          "    for v in adj[u]:",
          "        if color[v] == GREY:",
          "            return True      # a genuine back edge",
          "        if color[v] == WHITE and has_cycle_directed(",
          "                adj, v, color):",
          "            return True",
          "    color[u] = BLACK         # fully explored",
          "    return False"
        ],
        invariant:
          "<code>GREY</code> means exactly <em>&ldquo;on the current path&rdquo;</em>, so a GREY neighbour is a genuine " +
          "back edge. A <code>BLACK</code> neighbour was explored on an earlier branch and cannot be part of the " +
          "current path."
      },
      {
        tag: "Mechanism D",
        name: "Kahn&rsquo;s topological sort",
        blurb: "In-degrees plus a queue &mdash; and the cycle certificate falls out for free.",
        caption: "edges are (prereq -> course)",
        code: [
          "def topo(n, edges):",
          "    adj = defaultdict(list)",
          "    indeg = [0] * n",
          "    for u, v in edges:",
          "        adj[u].append(v)",
          "        indeg[v] += 1",
          "    q = deque(u for u in range(n) if indeg[u] == 0)",
          "    order = []",
          "    while q:",
          "        u = q.popleft()",
          "        order.append(u)",
          "        for v in adj[u]:",
          "            indeg[v] -= 1",
          "            if indeg[v] == 0:",
          "                q.append(v)",
          "    return order if len(order) == n else []"
        ],
        invariant:
          "The queue holds exactly the nodes whose every prerequisite has already been emitted. <code>indeg[v]</code> " +
          "counts the prerequisites of v <em>not yet emitted</em>, so it reaching 0 is precisely the condition for v to " +
          "become available."
      },
      {
        tag: "Mechanism E",
        name: "Union-Find (disjoint set union)",
        blurb: "Path compression + union by size. The union must always be <strong>root to root</strong>.",
        caption: "DSU with both heuristics",
        code: [
          "def find(self, x):            # path halving",
          "    while self.p[x] != x:",
          "        self.p[x] = self.p[self.p[x]]",
          "        x = self.p[x]",
          "    return x",
          "",
          "def union(self, a, b):",
          "    ra, rb = self.find(a), self.find(b)",
          "    if ra == rb:",
          "        return False   # this edge closes a cycle",
          "    if self.sz[ra] < self.sz[rb]:",
          "        ra, rb = rb, ra",
          "    self.p[rb] = ra    # attach ROOT to ROOT",
          "    self.sz[ra] += self.sz[rb]",
          "    self.count -= 1",
          "    return True"
        ],
        invariant:
          "<code>find(x)</code> returns the representative of x&rsquo;s component, and <code>union</code> returning " +
          "<code>False</code> means the two were already connected &mdash; which is what makes DSU a cycle detector, " +
          "used directly by Kruskal and by Redundant Connection."
      }
    ],
    aside: {
      title: "Why visited is marked on enqueue",
      body:
        "If nodes are marked when <em>dequeued</em>, a node with k in-edges can be appended k times before its first " +
        "dequeue. The queue then holds O(E) entries instead of O(V), and on a dense graph the running time degrades to " +
        "O(VE). Marking on enqueue makes each node enter the queue exactly once, which is what the O(V + E) bound " +
        "assumes."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "BFS finds shortest paths",
        sub: "queue monotonicity",
        body:
          "<p><strong>Lemma.</strong> At every moment, the <code>dist</code> values in the queue are non-decreasing from " +
          "front to back, and the largest differs from the smallest by at most 1. <em>Proof:</em> initially the queue " +
          "holds only <code>src</code> with distance 0. Dequeuing the front (value d) appends only nodes with value " +
          "<code>d + 1</code>, which is &ge; every value already present and at most 1 more than the front&rsquo;s " +
          "successor.</p>" +
          "<p><strong>Theorem.</strong> <code>dist[v]</code> equals the true shortest-path length. Let v have distance " +
          "<code>d + 1</code> and let u be its predecessor on a shortest path. When u is dequeued, either v is already " +
          "discovered &mdash; necessarily with value <code>d + 1</code>, since by the lemma nothing with a smaller " +
          "value can still discover it &mdash; or it is discovered now and set to <code>dist[u] + 1</code>. And " +
          "<code>dist[v]</code> can never be smaller, since each assignment corresponds to an actual path.</p>" +
          "<p>The proof uses the fact that <em>every edge has the same cost</em>. As soon as edges have different " +
          "weights the queue is no longer distance-ordered and the lemma fails &mdash; which is precisely the gap " +
          "Dijkstra fills <span class='topic-ref'>topic 12</span>.</p>"
      },
      {
        title: "Why directed cycle detection needs three colours",
        sub: "the diamond counter-example",
        body:
          "<p>A single visited set cannot distinguish &ldquo;already fully explored on another branch&rdquo; from " +
          "&ldquo;currently on the stack&rdquo;.</p>" +
          "<p><strong>Counter-example:</strong> the diamond <code>1&rarr;2, 1&rarr;3, 2&rarr;4, 3&rarr;4</code>. DFS " +
          "from 1 visits 2 then 4, returns, visits 3, and finds 4 already visited. A two-state algorithm reports a " +
          "cycle; there is none.</p>" +
          "<p>The GREY state is exactly &ldquo;on the current path&rdquo;, so a GREY neighbour is a genuine back edge. " +
          "In an undirected graph the analogous trap is the <em>parent edge</em>, which every DFS traverses and which " +
          "must be excluded explicitly.</p>"
      },
      {
        title: "Correctness of Kahn&rsquo;s algorithm",
        sub: "and the free cycle certificate",
        body:
          "<p>Every finite DAG has a node of in-degree 0. Otherwise every node has a predecessor; follow predecessors " +
          "from any node, and after <code>V + 1</code> steps some node repeats, giving a directed cycle &mdash; " +
          "contradiction.</p>" +
          "<p><strong>Induction.</strong> Emitting an in-degree-0 node u is safe because u has no unmet prerequisites. " +
          "Deleting u leaves a DAG on <code>V - 1</code> nodes, and the decrements maintain the in-degree invariant.</p>" +
          "<p><strong>Cycle certificate.</strong> If the loop ends with <code>len(order) &lt; n</code>, every remaining " +
          "node has a surviving predecessor among the remaining nodes, so by the same argument there is a cycle. The " +
          "length check is therefore a <em>complete</em> cycle test, not a heuristic &mdash; which is why Course " +
          "Schedule needs no separate DFS.</p>"
      },
      {
        title: "Union-Find complexity",
        sub: "why both heuristics are needed",
        body:
          "<p>Union by size alone gives O(log n) depth. A root&rsquo;s subtree size at least doubles whenever its depth " +
          "could grow, since the smaller tree is attached to the larger; the size cannot double more than " +
          "<code>log2 n</code> times.</p>" +
          "<p>With path compression the amortised cost per operation drops to <code>O(&alpha;(n))</code>, the inverse " +
          "Ackermann function, which is below 5 for any n writable in this universe &mdash; quote this as " +
          "&ldquo;effectively constant&rdquo; and note that <em>the two heuristics must be combined</em> to get it.</p>" +
          "<p><strong>Traversals.</strong> Each node is pushed and popped once; each edge is examined once per " +
          "direction: <code>O(V + E)</code> with an adjacency list. With an adjacency <em>matrix</em>, scanning a " +
          "node&rsquo;s neighbours costs O(V) regardless of degree, so the total becomes O(V&sup2;). For an R&times;C " +
          "grid, <code>V = RC</code> and <code>E &le; 4RC</code>, so every traversal is O(RC).</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Note"],
      rows: [
        ["DFS / BFS, adjacency list", "O(V + E)", "O(V)", "each edge seen twice if undirected"],
        ["DFS / BFS, adjacency matrix", "O(V&sup2;)", "O(V)", "neighbour scan is O(V) per node"],
        ["Grid traversal", "O(R&middot;C)", "O(R&middot;C)", "recursion depth can be R&middot;C &mdash; use BFS or an explicit stack"],
        ["Multi-source BFS", "O(V + E)", "O(V)", "k sources cost the same as one"],
        ["Cycle detection (either kind)", "O(V + E)", "O(V)", "colours or parent tracking"],
        ["Kahn topological sort", "O(V + E)", "O(V)", "plus the cycle certificate for free"],
        ["DSU: n-1 unions, m finds", "O((n + m) &middot; &alpha;(n))", "O(n)", "effectively O(n + m)"],
        ["Connected components via DSU", "O(E &middot; &alpha;(V))", "O(V)", "better than DFS when edges arrive online"],
        ["0-1 weighted shortest path", "O(V + E)", "O(V)", "deque BFS: push front on 0, back on 1"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Decision order that resolves almost every graph prompt in seconds: <strong>unweighted shortest " +
        "path</strong> &rarr; BFS. <strong>Non-negative weights</strong> &rarr; Dijkstra. <strong>Negative weights or a " +
        "hop limit</strong> &rarr; Bellman-Ford. <strong>Just connectivity or components</strong> &rarr; DFS, or DSU if " +
        "edges arrive one at a time. <strong>Ordering constraints</strong> &rarr; topological sort. <strong>All edges " +
        "used exactly once</strong> &rarr; Eulerian path."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;shortest / fewest steps / minimum moves&rdquo;, all edges equal", "BFS", "DFS finds <em>a</em> path, not the shortest"],
      ["&ldquo;does a path exist&rdquo;, &ldquo;count regions&rdquo;, &ldquo;flood fill&rdquo;", "DFS", "BFS also works; DFS is shorter and the order does not matter"],
      ["&ldquo;distance to the nearest gate / rotten orange / 0&rdquo; for <em>every</em> cell", "multi-source BFS", "one BFS per source is O(V &middot; E)"],
      ["edges have weights", "Dijkstra / Bellman-Ford <span class='topic-ref'>topic 12</span>", "BFS&rsquo;s distance ordering breaks"],
      ["weights are only 0 and 1", "0-1 BFS with a deque", "Dijkstra&rsquo;s log factor is unnecessary"],
      ["&ldquo;prerequisites&rdquo;, &ldquo;build order&rdquo;, &ldquo;is it possible to finish&rdquo;", "topological sort", "a plain DFS gives no order, only a yes/no"],
      ["&ldquo;is this graph a tree&rdquo;", "<code>E == V - 1</code> <em>and</em> connected, or DSU with no cycle", "either test alone is insufficient"],
      ["edges added incrementally, connectivity queried between", "DSU", "re-running DFS per query is O(q &middot; (V+E))"],
      ["need the actual path, not just its length", "BFS/DFS with a parent map", "DSU forgets structure entirely"],
      ["grid up to 10<sup>6</sup> cells", "BFS or iterative DFS", "recursive DFS exceeds the frame limit"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["disconnected graph", "starting only from node 0 misses whole components; loop over all nodes"],
      ["empty graph / empty grid", "<code>len(grid[0])</code> raises <code>IndexError</code>; guard <code>if not grid</code>"],
      ["single node, no edges", "components = 1, diameter 0, topological order <code>[0]</code> &mdash; not an error, but often mis-handled"],
      ["self-loop <code>(u, u)</code>", "undirected cycle detection sees the parent and skips it, missing the cycle; directed detection catches it as GREY"],
      ["parallel edges", "the parent check <em>by node</em> wrongly skips the second edge; track the edge index instead"],
      ["visited marked on dequeue", "duplicate queue entries; O(VE) time and, with weights, wrong distances"],
      ["1-indexed node labels", "<code>range(n)</code> misses node n; size arrays as <code>n + 1</code>"],
      ["unreachable nodes", "<code>dist</code> stays missing or <code>inf</code>; &ldquo;return -1 if any node is unreachable&rdquo; is a common requirement"],
      ["grid bounds", "negative indices wrap around in Python and read the far edge silently"],
      ["all-water grid / no sources", "island count 0; multi-source BFS with an empty queue must return 0 or -1 per the spec"],
      ["mutating the grid as the visited marker", "fine, but the caller&rsquo;s input is destroyed; say so or use a set"],
      ["recursion on a path-shaped graph of 10<sup>5</sup> nodes", "<code>RecursionError</code>"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Marking visited on dequeue instead of on enqueue",
      wrong: [
        "q = deque([src]); seen = set()",
        "while q:",
        "    u = q.popleft()",
        "    if u in seen:",
        "        continue",
        "    seen.add(u)          # too late",
        "    for v in adj[u]:",
        "        q.append(v)      # v enqueued once",
        "                         # per in-edge"
      ],
      right: [
        "q = deque([src]); seen = {src}",
        "while q:",
        "    u = q.popleft()",
        "    for v in adj[u]:",
        "        if v not in seen:",
        "            seen.add(v)  # on enqueue",
        "            q.append(v)"
      ],
      note:
        "The wrong version still returns the right <em>set</em> of reachable nodes, which is why it survives small " +
        "tests, but the queue can hold O(E) entries and on a dense graph it times out. When distances are involved it " +
        "is also <em>wrong</em>, because a later, longer discovery can overwrite the first."
    },
    {
      n: 2,
      title: "Undirected cycle detection that counts the parent edge",
      wrong: [
        "def dfs(u):",
        "    seen.add(u)",
        "    for v in adj[u]:",
        "        if v in seen:",
        "            return True   # the parent is",
        "                          # always in seen",
        "        if dfs(v):",
        "            return True",
        "    return False",
        "",
        "# edges [(0,1)] -> reports a cycle"
      ],
      right: [
        "def dfs(u, parent):",
        "    seen.add(u)",
        "    for v in adj[u]:",
        "        if v == parent:",
        "            continue      # the edge we came by",
        "        if v in seen or dfs(v, u):",
        "            return True",
        "    return False"
      ],
      note:
        "Every undirected edge appears in <em>both</em> adjacency lists, so the trivial &ldquo;back to parent&rdquo; " +
        "step must be excluded. With parallel edges, <code>v == parent</code> wrongly skips the second u-v edge, which " +
        "<em>is</em> a genuine cycle &mdash; then you must exclude by edge identity rather than by node."
    },
    {
      n: 3,
      title: "Directed cycle detection with only two states",
      wrong: [
        "def dfs(u):",
        "    seen.add(u)",
        "    for v in adj[u]:",
        "        if v in seen:",
        "            return True   # false positive",
        "        if dfs(v):",
        "            return True",
        "    return False",
        "",
        "# diamond 1->2, 1->3, 2->4, 3->4",
        "# reports a cycle; there is none"
      ],
      right: [
        "def dfs(u):",
        "    color[u] = GREY",
        "    for v in adj[u]:",
        "        if color[v] == GREY:",
        "            return True   # true back edge",
        "        if color[v] == WHITE and dfs(v):",
        "            return True",
        "    color[u] = BLACK      # leaving the stack",
        "    return False"
      ],
      note:
        "The missing state is <em>&ldquo;finished&rdquo;</em>. A BLACK neighbour was explored on some earlier branch " +
        "and cannot be part of the current path, so it is not a cycle. Kahn&rsquo;s algorithm sidesteps the whole issue " +
        "&mdash; if you only need a yes/no answer, the in-degree count is less error-prone."
    },
    {
      n: 4,
      title: "DSU union that links nodes instead of roots",
      wrong: [
        "def union(a, b):",
        "    self.p[a] = b     # links NODES",
        "",
        "# after union(1,2), union(3,4),",
        "# union(2,3): find(1) walks",
        "# 1->2->3->4 by luck here, but",
        "# union(2,4) then overwrites",
        "# p[2]=4 and detaches 1's chain"
      ],
      right: [
        "def union(a, b):",
        "    ra, rb = self.find(a), self.find(b)",
        "    if ra == rb:",
        "        return False",
        "    if self.sz[ra] < self.sz[rb]:",
        "        ra, rb = rb, ra",
        "    self.p[rb] = ra   # links ROOTS",
        "    self.sz[ra] += self.sz[rb]",
        "    return True"
      ],
      note:
        "Assigning a non-root&rsquo;s parent can orphan an entire subtree, silently splitting one component into two. " +
        "The union must always be root-to-root, and returning <code>False</code> when the roots already match is what " +
        "makes DSU a cycle detector."
    }
  ],

  practice: {
    caption: "Drill set for Graphs",
    rows: [
      ["Flood Fill", "LC 733", "Easy", "the minimal grid DFS, plus the &ldquo;same colour&rdquo; infinite-loop trap"],
      ["Max Area of Island", "LC 695", "Medium", "DFS returning an aggregate instead of just marking"],
      ["Clone Graph", "LC 133", "Medium", "old-node &rarr; new-node map created <em>before</em> recursing"],
      ["Surrounded Regions", "LC 130", "Medium", "invert the problem: BFS inward from the border"],
      ["Pacific Atlantic Water Flow", "LC 417", "Medium", "two multi-source BFS passes, then intersect"],
      ["Course Schedule II", "LC 210", "Medium", "Kahn returning the order, with the cycle certificate"],
      ["Graph Valid Tree", "LC 261", "Medium", "<code>E == V-1</code> plus connectivity, or DSU cycle detection"],
      ["Word Ladder", "LC 127", "Hard", "implicit graph over words; bucket by wildcard pattern to avoid O(n&sup2;) edges"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;<strong>Fewest moves</strong> to reach the target&rdquo;, every edge costing the same.",
      options: ["DFS", "BFS", "Dijkstra", "Topological sort"],
      answer: 1,
      why: "DFS finds a path, not the shortest. With uniform edge costs the BFS queue is distance-ordered, which is exactly the shortest-path proof."
    },
    {
      prompt: "&ldquo;Distance to the nearest exit&rdquo; for <strong>every</strong> cell.",
      options: ["One BFS per exit", "Multi-source BFS", "DFS", "Dijkstra"],
      answer: 1,
      why: "One BFS per source is O(V·E). Seeding the queue with all sources at once costs the same as seeding it with one."
    },
    {
      prompt: "Edges have <strong>weights</strong>, all non-negative.",
      options: ["BFS", "Dijkstra", "Multi-source BFS", "DFS"],
      answer: 1,
      why: "BFS's distance ordering relies on every edge costing the same. Once weights differ, the queue is no longer distance-ordered."
    },
    {
      prompt: "Weights are <strong>only 0 and 1</strong>.",
      options: ["Dijkstra", "0-1 BFS with a deque", "Plain BFS", "Bellman-Ford"],
      answer: 1,
      why: "Push front on a 0-edge and back on a 1-edge: the deque stays distance-ordered, so you get O(V+E) without Dijkstra's log factor."
    },
    {
      prompt: "&ldquo;Is it possible to finish all courses given these <strong>prerequisites</strong>?&rdquo;",
      options: ["DFS reachability", "Topological sort", "BFS", "DSU"],
      answer: 1,
      why: "A plain DFS gives a yes/no on reachability, not an ordering. Kahn's length check doubles as a complete cycle certificate."
    },
    {
      prompt: "Edges arrive <strong>one at a time</strong>, with connectivity queried in between.",
      options: ["Re-run DFS per query", "DSU", "BFS", "Topological sort"],
      answer: 1,
      why: "Re-running DFS per query is O(q·(V+E)). DSU handles each union and find in effectively constant amortised time."
    },
    {
      prompt: "&ldquo;Is this graph a <strong>tree</strong>?&rdquo;",
      options: ["E == V − 1 alone", "Connected alone", "Both together", "Cycle detection alone"],
      answer: 2,
      why: "Either test alone is insufficient — a graph can have V−1 edges and still be disconnected with a cycle elsewhere."
    },
    {
      prompt: "You need the <strong>actual path</strong>, not just its length.",
      options: ["DSU", "BFS/DFS with a parent map", "Count edges", "Topological sort"],
      answer: 1,
      why: "DSU forgets structure entirely — it knows components, not routes. Record each node's discoverer and walk back."
    },
    {
      prompt: "Grid of up to 10<sup>6</sup> cells, and you want a traversal.",
      options: ["Recursive DFS", "BFS or iterative DFS", "Dijkstra", "DSU"],
      answer: 1,
      why: "Recursion depth can reach R·C on a snake-shaped region, which blows Python's frame limit long before the algorithm is the problem."
    }
  ]
};
