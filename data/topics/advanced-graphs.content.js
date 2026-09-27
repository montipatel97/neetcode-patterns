/* Topic content, transcribed from the Advanced Graphs chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["advanced-graphs"] = {
  id: "advanced-graphs",
  number: "12",
  title: "Advanced Graphs",
  subtitle: "Dijkstra, Bellman-Ford with a hop limit, MST by Kruskal and Prim, Eulerian paths",
  accent: "lime",
  bounds: { time: "O(E log V)", space: "O(V+E)", driver: "Dijkstra/MST heap operations" },

  mechanics: {
    lede:
      "Everything here is BFS with the uniform-cost assumption removed. Once edges carry different weights the BFS " +
      "queue stops being distance-ordered, and each algorithm in this topic is a different way of restoring that " +
      "ordering &mdash; by priority (Dijkstra), by round count (Bellman-Ford), by cut (MST), or by degree (Hierholzer).",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Dijkstra with a lazy heap",
        blurb: "Single-source shortest paths, non-negative weights.",
        caption: "Lazy deletion replaces decrease-key",
        code: [
          "def dijkstra(n, edges, src):",
          "    adj = defaultdict(list)",
          "    for u, v, w in edges:",
          "        adj[u].append((v, w))",
          "",
          "    dist = {}",
          "    h = [(0, src)]",
          "    while h:",
          "        d, u = heapq.heappop(h)",
          "        if u in dist:",
          "            continue      # STALE: finalised earlier",
          "        dist[u] = d       # final, never revised",
          "        for v, w in adj[u]:",
          "            if v not in dist:",
          "                heapq.heappush(h, (d + w, v))",
          "    return dist"
        ],
        invariant:
          "When a node is popped and not already in <code>dist</code>, its key d is its true shortest distance and is " +
          "never revised. Equivalently: every node in <code>dist</code> is final, and the heap holds <em>upper " +
          "bounds</em> for the frontier. The <code>if u in dist: continue</code> line is the lazy deletion that " +
          "replaces a decrease-key operation &mdash; a node may sit in the heap several times with different keys, and " +
          "only the smallest is honoured."
      },
      {
        tag: "Mechanism B",
        name: "Bellman-Ford, and the hop-limited variant",
        blurb: "At most k edges: relax from a <strong>snapshot</strong> of the previous round.",
        caption: "k stops means k + 1 edges",
        code: [
          "def cheapest_flights(n, flights, src, dst, k):",
          "    INF = float('inf')",
          "    dist = [INF] * n",
          "    dist[src] = 0",
          "    for _ in range(k + 1):",
          "        prev = dist[:]     # snapshot bounds the hops",
          "        for u, v, w in flights:",
          "            if prev[u] != INF and prev[u] + w < dist[v]:",
          "                dist[v] = prev[u] + w",
          "    return -1 if dist[dst] == INF else dist[dst]"
        ],
        invariant:
          "After round i, <code>dist[v]</code> is the cheapest cost to reach v using <em>at most i edges</em>. The " +
          "snapshot is what enforces &ldquo;at most i&rdquo;: relaxing against the live array would let one round chain " +
          "two or more edges together."
      },
      {
        tag: "Mechanism C",
        name: "MST: Kruskal (sort + DSU) and Prim (heap)",
        blurb: "Kruskal globally sorts edges; Prim grows one component. Both are the cut property applied differently.",
        caption: "Kruskal, with the cycle test for free",
        code: [
          "def kruskal(n, edges):        # edges: (w, u, v)",
          "    edges.sort()",
          "    dsu = DSU(n)",
          "    total, used = 0, 0",
          "    for w, u, v in edges:",
          "        if dsu.union(u, v):   # False => closes a cycle",
          "            total += w",
          "            used += 1",
          "            if used == n - 1:",
          "                break         # a tree has n-1 edges",
          "    return total if used == n - 1 else -1"
        ],
        invariant:
          "<strong>Kruskal:</strong> the accepted edges form a forest that is a subset of some MST. " +
          "<strong>Prim:</strong> <code>seen</code> is always a connected set whose selected edges form a subtree of " +
          "some MST, and the heap holds the edges crossing the cut <code>(seen, rest)</code>."
      },
      {
        tag: "Mechanism D",
        name: "Hierholzer for an Eulerian path",
        blurb:
          "Use every edge exactly once. Greedily walk until stuck, then prepend the stuck vertex as the recursion " +
          "unwinds &mdash; the reversed postorder <em>is</em> the Eulerian path.",
        caption: "Reconstruct Itinerary, lexicographically smallest",
        code: [
          "def find_itinerary(tickets):",
          "    adj = defaultdict(list)",
          "    for a, b in sorted(tickets, reverse=True):",
          "        adj[a].append(b)   # so pop() gives the smallest",
          "    route = []",
          "",
          "    def visit(u):",
          "        while adj[u]:",
          "            visit(adj[u].pop())   # consume the edge",
          "        route.append(u)           # AFTER exhausting u",
          "",
          "    visit('JFK')",
          "    return route[::-1]"
        ],
        invariant:
          "A vertex is recorded only once <em>no unused edges leave it</em>, so dead ends are pushed first and end up at " +
          "the back of the reversed route. Postorder is not a stylistic choice here &mdash; it is the correctness " +
          "condition."
      }
    ],
    aside: {
      title: "Read the weights first, then the question",
      body:
        "Weights absent &rarr; BFS. Weights non-negative, one source&rsquo;s distances &rarr; Dijkstra. A hop or stop " +
        "limit, or negative weights &rarr; Bellman-Ford (and the limit tells you the number of rounds). " +
        "&ldquo;Connect everything at minimum total cost&rdquo; &rarr; MST, and it is Kruskal unless the graph is dense " +
        "or implicit, in which case Prim. &ldquo;Use every edge exactly once&rdquo; &rarr; Eulerian, <em>not</em> " +
        "Hamiltonian, and the greedy-with-postorder algorithm is linear."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Dijkstra&rsquo;s correctness",
        sub: "and exactly where non-negativity is used",
        body:
          "<p><strong>Theorem.</strong> With all weights &ge; 0, every node popped for the first time carries its true " +
          "shortest distance.</p>" +
          "<p><strong>Proof.</strong> Suppose not, and let u be the first node popped with " +
          "<code>key(u) &gt; &delta;(src, u)</code>. Take a shortest path P from src to u. Let y be the first node on P " +
          "not yet finalised, and x its predecessor (so x is finalised and, by the choice of u, " +
          "<code>dist[x] = &delta;(src, x)</code>). When x was finalised, the edge <code>(x, y)</code> was relaxed, so " +
          "the heap contains a key for y of at most <code>dist[x] + w(x,y) = &delta;(src, y)</code>. Now:</p>" +
          "<p><code>key(y) &le; &delta;(src, y) &le; &delta;(src, u) &lt; key(u)</code></p>" +
          "<p>The middle step needs <code>w &ge; 0</code>: the remaining part of P (from y to u) has non-negative " +
          "length, so <code>&delta;(src,y)</code> cannot exceed <code>&delta;(src,u)</code>. Then y has a strictly " +
          "smaller key than u and would have been popped first &mdash; contradiction.</p>"
      },
      {
        title: "Bellman-Ford by induction on the hop count",
        sub: "why the snapshot is load-bearing",
        body:
          "<p><strong>Claim.</strong> After round i, <code>dist[v]</code> is the minimum cost over all walks from src to " +
          "v using <em>at most i edges</em>.</p>" +
          "<p><strong>Base:</strong> round 0 has <code>dist[src] = 0</code> and everything else infinite. " +
          "<strong>Step:</strong> a cheapest walk to v with at most <code>i+1</code> edges either uses at most i edges " +
          "(already recorded in <code>prev</code>), or ends with an edge <code>(u, v)</code> preceded by a cheapest " +
          "&le;i-edge walk to u, which is exactly <code>prev[u] + w</code>. Round <code>i+1</code> takes the minimum " +
          "over both cases.</p>" +
          "<p>Because a shortest path in a graph with no negative cycle is simple and so has at most <code>V - 1</code> " +
          "edges, <code>V - 1</code> rounds suffice; a further round that still improves something certifies a negative " +
          "cycle. For the hop-limited problem the induction <em>is</em> the point: k stops means at most " +
          "<code>k + 1</code> edges, so you run exactly <code>k + 1</code> rounds and the snapshot keeps each round to " +
          "one hop.</p>"
      },
      {
        title: "The cut property",
        sub: "which proves both MST algorithms",
        body:
          "<p><strong>Cut property.</strong> For any partition of the vertices into <code>(S, V \\ S)</code>, a " +
          "minimum-weight edge e crossing the cut belongs to some MST.</p>" +
          "<p><strong>Proof by exchange.</strong> Let T be an MST not containing <code>e = (u, v)</code>. Adding e to T " +
          "creates exactly one cycle, and that cycle must cross the cut an even number of times, so it contains another " +
          "crossing edge <code>f &ne; e</code>. Since e is a minimum crossing edge, <code>w(e) &le; w(f)</code>. Then " +
          "<code>T' = T - f + e</code> is a spanning tree with <code>w(T') &le; w(T)</code>. As T is minimum, equality " +
          "holds and T' is also an MST &mdash; one that contains e.</p>" +
          "<p><strong>Kruskal:</strong> each accepted edge is the lightest remaining edge joining two different " +
          "components; taking S to be one of those components, it is a minimum crossing edge. Rejected edges close a " +
          "cycle and are the heaviest on it, so by the symmetric cycle property they are in no MST. " +
          "<strong>Prim:</strong> the cut is always <code>(seen, rest)</code>, and the heap&rsquo;s minimum is a " +
          "minimum crossing edge. Same lemma, different cut sequence.</p>"
      },
      {
        title: "Complexity proof",
        sub: "where each log factor comes from",
        body:
          "<p><strong>Dijkstra.</strong> Each edge causes at most one push, so the heap holds O(E) entries; each push " +
          "and pop costs <code>O(log E) = O(log V)</code>. Total <code>O(E log V)</code>. The lazy variant can pop up " +
          "to E times, but each stale pop is O(1) after the <code>continue</code>, so the bound is unchanged. With a " +
          "Fibonacci heap it improves to <code>O(E + V log V)</code> &mdash; worth naming, never worth coding.</p>" +
          "<p><strong>Bellman-Ford.</strong> <code>V - 1</code> rounds over E edges: <code>O(VE)</code>. The " +
          "hop-limited version is <code>O(kE)</code>.</p>" +
          "<p><strong>Kruskal.</strong> Sorting dominates: <code>O(E log E)</code>, plus " +
          "<code>O(E &middot; &alpha;(V))</code> for the DSU. <strong>Prim.</strong> <code>O(E log V)</code> with a " +
          "binary heap; on a dense or implicit graph the <code>O(V&sup2;)</code> array version is preferable. " +
          "<strong>Floyd-Warshall.</strong> <code>O(V&sup3;)</code> time, <code>O(V&sup2;)</code> space &mdash; the " +
          "right choice only when <code>V &le; ~400</code> and you need all pairs.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "Non-negativity enters Dijkstra&rsquo;s proof in exactly one inequality, and that is precisely where it breaks " +
        "with negative edges. Counter-example: <code>A&rarr;B</code> weight 2, <code>A&rarr;C</code> weight 2, " +
        "<code>C&rarr;B</code> weight -3. Dijkstra finalises B at 2 and never revisits it, while the true distance is " +
        "<code>2 - 3 = -1</code>. <strong>Once a node is finalised it is never reconsidered, so a later negative edge " +
        "cannot repair it.</strong>"
    },
    table: {
      caption: "Complexity and applicability",
      head: ["Algorithm", "Time", "Requires", "Gives"],
      rows: [
        ["BFS", "O(V + E)", "unweighted", "shortest paths from one source"],
        ["0-1 BFS (deque)", "O(V + E)", "weights in {0,1}", "shortest paths from one source"],
        ["Dijkstra (binary heap)", "O(E log V)", "weights &ge; 0", "shortest paths from one source"],
        ["Bellman-Ford", "O(V &middot; E)", "no negative cycle", "shortest paths, detects negative cycles"],
        ["Bellman-Ford, hop-limited", "O(k &middot; E)", "nothing", "cheapest path with &le; k edges"],
        ["Floyd-Warshall", "O(V&sup3;)", "no negative cycle", "all-pairs shortest paths"],
        ["Kruskal", "O(E log E)", "undirected, connected", "MST weight and edges"],
        ["Prim (heap)", "O(E log V)", "undirected, connected", "MST, better on dense graphs"],
        ["Topological sort", "O(V + E)", "DAG", "a valid linear order"],
        ["Hierholzer (Eulerian path)", "O(E)", "degree conditions hold", "a walk using every edge once"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;minimum time for a signal to reach all nodes&rdquo;", "Dijkstra, then take the max distance", "BFS ignores the weights"],
      ["&ldquo;cheapest flight with at most k stops&rdquo;", "Bellman-Ford, k+1 rounds", "Dijkstra cannot bound the hop count; pruning by stops is subtly wrong"],
      ["any negative edge weight", "Bellman-Ford", "Dijkstra finalises too early, as proved above"],
      ["&ldquo;connect all points / cities at minimum cost&rdquo;", "MST", "shortest paths minimise <em>per-pair</em> cost, not total cost"],
      ["points given as coordinates, all pairs implicitly connected", "Prim, O(V&sup2;)", "Kruskal must materialise V&sup2;/2 edges first"],
      ["&ldquo;minimise the maximum edge on a path&rdquo;", "Dijkstra with <code>max</code> instead of <code>+</code>, or binary search + BFS", "summing weights answers a different question"],
      ["&ldquo;valid ordering&rdquo; with a lexicographic requirement", "topological sort with a <em>heap</em> instead of a queue", "a plain queue gives <em>an</em> order, not the smallest"],
      ["&ldquo;use every ticket exactly once&rdquo;", "Hierholzer", "backtracking is exponential and unnecessary"],
      ["all-pairs distances, V small", "Floyd-Warshall", "V runs of Dijkstra is O(VE log V), often worse and more code"],
      ["dynamic connectivity, no distances", "DSU <span class='topic-ref'>topic 11</span>", "shortest-path machinery is wasted"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["unreachable node", "<code>dist</code> lacks the key, or stays <code>inf</code>; &ldquo;return -1 if not all reachable&rdquo; must compare <code>len(dist) == n</code>"],
      ["disconnected graph in MST", "fewer than <code>n-1</code> edges are accepted; must return -1 rather than a partial total"],
      ["stale heap entries in Dijkstra", "without <code>if u in dist: continue</code>, a node is expanded several times; O(E&sup2;) and possibly a worse recorded distance"],
      ["negative weights with Dijkstra", "silently wrong answer, no error"],
      ["negative cycle with Bellman-Ford", "distances diverge; detect with one extra round"],
      ["k stops vs k edges", "off by one: k stops permits <code>k+1</code> flights"],
      ["relaxing against the live array in hop-limited BF", "one round chains multiple hops, so the limit is not enforced"],
      ["duplicate edges with different weights", "keep the minimum, or let the heap sort it out &mdash; but do not assume uniqueness"],
      ["self-loops", "harmless for Dijkstra, must be rejected by DSU in Kruskal (<code>union</code> returns False)"],
      ["1-indexed nodes", "size arrays <code>n+1</code>, or translate; <code>dist = [inf]*n</code> silently drops node n"],
      ["<code>src == dst</code>", "answer 0, not <code>inf</code>; check before looping"],
      ["Eulerian path with unbalanced degrees", "no path exists; Hierholzer returns a shorter route &mdash; verify <code>len(route) == len(edges)+1</code>"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Dijkstra without the stale-entry guard",
      wrong: [
        "while h:",
        "    d, u = heapq.heappop(h)",
        "    dist[u] = d          # overwrites",
        "    for v, w in adj[u]:",
        "        heapq.heappush(h, (d + w, v))",
        "",
        "# u is expanded once per heap entry;",
        "# a later, LARGER d overwrites the",
        "# correct distance"
      ],
      right: [
        "while h:",
        "    d, u = heapq.heappop(h)",
        "    if u in dist:",
        "        continue         # already final",
        "    dist[u] = d",
        "    for v, w in adj[u]:",
        "        if v not in dist:",
        "            heapq.heappush(h, (d + w, v))"
      ],
      note:
        "Lazy deletion means the heap can hold several keys for one node. The guard is what makes the <em>first</em> pop " +
        "authoritative &mdash; which is exactly the theorem. Without it you get both a blow-up in work and a wrong " +
        "answer, and the wrongness only shows on graphs where a node is reachable by two different-length routes."
    },
    {
      n: 2,
      title: "Hop-limited Bellman-Ford relaxing against the live array",
      wrong: [
        "for _ in range(k + 1):",
        "    for u, v, w in flights:",
        "        if dist[u] + w < dist[v]:",
        "            dist[v] = dist[u] + w",
        "",
        "# one round can chain 2+ edges, so",
        "# the k-stop limit is not enforced;",
        "# returns a cheaper, ILLEGAL route"
      ],
      right: [
        "for _ in range(k + 1):",
        "    prev = dist[:]          # snapshot",
        "    for u, v, w in flights:",
        "        if prev[u] != INF and prev[u] + w < dist[v]:",
        "            dist[v] = prev[u] + w"
      ],
      note:
        "Whether this bug bites depends on <em>the order of the edge list</em> &mdash; if <code>(0,1)</code> happens to " +
        "precede <code>(1,2)</code>, both relax in one round. That order dependence is the tell. The snapshot makes " +
        "each round exactly one hop, which is the induction the correctness proof relies on."
    },
    {
      n: 3,
      title: "Kruskal accepting every edge, or skipping the cycle test",
      wrong: [
        "edges.sort()",
        "total = 0",
        "for w, u, v in edges:",
        "    dsu.union(u, v)",
        "    total += w        # adds EVERY edge",
        "",
        "# returns the total weight of the",
        "# whole graph, not the MST"
      ],
      right: [
        "edges.sort()",
        "total, used = 0, 0",
        "for w, u, v in edges:",
        "    if dsu.union(u, v):    # False => cycle",
        "        total += w",
        "        used += 1",
        "        if used == n - 1:",
        "            break",
        "return total if used == n - 1 else -1"
      ],
      note:
        "<code>union</code> returning <code>False</code> <em>is</em> the cycle test, so the accept/reject decision costs " +
        "nothing extra. The <code>used == n - 1</code> check does double duty: it terminates early once the tree is " +
        "complete, and it detects a disconnected graph, where no spanning tree exists at all."
    },
    {
      n: 4,
      title: "Eulerian walk appending the node before its edges are exhausted",
      wrong: [
        "def visit(u):",
        "    route.append(u)    # preorder",
        "    while adj[u]:",
        "        visit(adj[u].pop())",
        "",
        "# a dead end mid-walk lands in the",
        "# middle of the route instead of at",
        "# the end -> invalid itinerary"
      ],
      right: [
        "def visit(u):",
        "    while adj[u]:",
        "        visit(adj[u].pop())",
        "    route.append(u)    # postorder",
        "",
        "return route[::-1]"
      ],
      note:
        "Hierholzer&rsquo;s correctness depends on postorder: a vertex is recorded only once no unused edges leave it, " +
        "so dead ends are pushed first and end up at the back of the reversed route. The preorder version produces the " +
        "right <em>multiset</em> of airports in the wrong order, which passes length checks and fails validity."
    }
  ],

  practice: {
    caption: "Drill set for Advanced Graphs",
    rows: [
      ["Number of Connected Components", "LC 323", "Medium", "DSU component counting, or a DFS sweep"],
      ["Redundant Connection", "LC 684", "Medium", "the first edge whose <code>union</code> returns False"],
      ["Accounts Merge", "LC 721", "Medium", "DSU over string keys via an index map, then group by root"],
      ["Path with Maximum Probability", "LC 1514", "Medium", "Dijkstra with a max-heap and multiplication instead of addition"],
      ["Course Schedule IV", "LC 1462", "Medium", "transitive closure: Floyd-Warshall on booleans, or per-node BFS"],
      ["Swim in Rising Water", "LC 778", "Hard", "minimise the maximum edge: Dijkstra with <code>max</code>, or binary search + BFS"],
      ["Alien Dictionary", "LC 269", "Hard", "derive edges from adjacent word pairs, then topological sort; the prefix edge case"],
      ["Reconstruct Itinerary", "LC 332", "Hard", "Hierholzer with postorder and a lexicographic tie-break"]
    ]
  },

  quiz: [
    {
      prompt: "Weighted edges, all non-negative, and you want <strong>one source&rsquo;s distances</strong>.",
      options: ["BFS", "Dijkstra", "Bellman-Ford", "MST"],
      answer: 1,
      why: "BFS ignores the weights entirely. Dijkstra restores the distance ordering with a priority queue."
    },
    {
      prompt: "&ldquo;Cheapest flight with <strong>at most k stops</strong>.&rdquo;",
      options: ["Dijkstra", "Bellman-Ford with k+1 rounds", "BFS", "MST"],
      answer: 1,
      why: "Dijkstra cannot bound the hop count, and pruning by stops is subtly wrong. Each Bellman-Ford round is exactly one hop."
    },
    {
      prompt: "The graph contains <strong>a negative edge weight</strong>.",
      options: ["Dijkstra", "Bellman-Ford", "0-1 BFS", "Prim"],
      answer: 1,
      why: "Dijkstra finalises a node the first time it is popped and never reconsiders it, so a later negative edge cannot repair the distance."
    },
    {
      prompt: "&ldquo;Connect all cities at <strong>minimum total cost</strong>.&rdquo;",
      options: ["Dijkstra from each city", "MST", "Floyd-Warshall", "BFS"],
      answer: 1,
      why: "Shortest paths minimise per-pair cost, which is a different objective. Total connection cost is exactly what an MST minimises."
    },
    {
      prompt: "Points given as <strong>coordinates</strong>, every pair implicitly connected.",
      options: ["Kruskal", "Prim, O(V²)", "Dijkstra", "DSU alone"],
      answer: 1,
      why: "Kruskal would have to materialise and sort V²/2 edges first. Prim's array version grows the tree without ever building the edge list."
    },
    {
      prompt: "&ldquo;<strong>Minimise the maximum</strong> edge on a path.&rdquo;",
      options: ["Dijkstra summing weights", "Dijkstra with max, or binary search + BFS", "MST only", "Bellman-Ford"],
      answer: 1,
      why: "Summing weights answers a different question. Replace the relaxation's + with max, or binary search the threshold and test reachability."
    },
    {
      prompt: "Topological order, but it must be the <strong>lexicographically smallest</strong>.",
      options: ["Kahn with a queue", "Kahn with a heap", "DFS postorder", "Dijkstra"],
      answer: 1,
      why: "A plain queue gives an order, not the smallest. Swapping in a min-heap picks the smallest available node at each step."
    },
    {
      prompt: "&ldquo;Use <strong>every ticket exactly once</strong>.&rdquo;",
      options: ["Hamiltonian path / backtracking", "Hierholzer (Eulerian)", "MST", "Dijkstra"],
      answer: 1,
      why: "Every edge once is Eulerian, not Hamiltonian — and Eulerian is linear while the Hamiltonian version is exponential."
    },
    {
      prompt: "All-pairs distances, with V around 300.",
      options: ["V runs of Dijkstra", "Floyd-Warshall", "BFS from each node", "MST"],
      answer: 1,
      why: "Three nested loops is O(V³) ≈ 2.7×10⁷ here, and it is far less code than V separate Dijkstra runs at O(VE log V)."
    }
  ]
};
