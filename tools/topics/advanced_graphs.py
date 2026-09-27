"""Topic 12 -- Advanced Graphs."""

DIJKSTRA = '''
def network_delay_time(times, n, k):
    adj = {}
    for u, v, w in times:
        adj.setdefault(u, []).append((v, w))

    dist = {}
    h = [(0, k)]
    while h:
        d, u = heapq.heappop(h)
        if u in dist:
            continue                  # STALE: u was finalised earlier
        dist[u] = d                   # final, never revised
        for v, w in adj.get(u, []):
            if v not in dist:
                heapq.heappush(h, (d + w, v))

    return max(dist.values()) if len(dist) == n else -1
'''

KRUSKAL = '''
def min_cost_connect_points(points):
    n = len(points)
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            w = (abs(points[i][0] - points[j][0]) +
                 abs(points[i][1] - points[j][1]))
            edges.append((w, i, j))
    edges.sort()

    parent = list(range(n))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]     # path halving
            x = parent[x]
        return x

    total, used = 0, 0
    for w, u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:
            continue                  # would close a cycle
        parent[rv] = ru               # link ROOT to ROOT
        total += w
        used += 1
        if used == n - 1:
            break                     # a spanning tree has n-1 edges
    return total
'''

BELLMAN_FORD = '''
def cheapest_flights(n, flights, src, dst, k):
    INF = float('inf')
    dist = [INF] * n
    dist[src] = 0

    for _ in range(k + 1):            # k stops = k+1 edges
        prev = dist[:]                # SNAPSHOT bounds the hop count
        for u, v, w in flights:
            if prev[u] != INF and prev[u] + w < dist[v]:
                dist[v] = prev[u] + w

    return -1 if dist[dst] == INF else dist[dst]
'''

PRELUDE = "import heapq\n"

EXAMPLES = [
    {
        "id": "network-delay",
        "title": "Network Delay Time",
        "lc": "LC 743",
        "level": "Medium",
        "mechanism": "Mechanism A -- Dijkstra with a lazy heap",
        "func": "network_delay_time",
        "code": DIJKSTRA,
        "prelude": PRELUDE,
        "args": ([[1, 2, 1], [1, 3, 4], [2, 3, 2], [3, 4, 1]], 4, 1),
        "watch": ["n", "k", "dist", "h", "d", "u", "v", "w"],
        "inputLabel": "n = 4, k = 1, times = [[1,2,1], [1,3,4], [2,3,2], [3,4,1]]",
        "complexity": {"time": "O(E log V)", "space": "O(V)"},
        "idea": (
            "When a node is popped and not already final, its key <em>is</em> its shortest distance. "
            "<code>if u in dist: continue</code> is lazy deletion standing in for decrease-key &mdash; "
            "a node may sit in the heap several times, and only the smallest key is honoured."
        ),
        "takeaway": (
            "Output 4, and <code>len(dist) == 4 == n</code> so no <code>-1</code>. Node 3 is reachable "
            "two ways &mdash; directly at cost 4, or via node 2 at cost 3 &mdash; so both keys sit in "
            "the heap at once. Watch the stale pop get skipped: that guard is exactly what makes the "
            "first pop authoritative, which is the theorem."
        ),
        "view": {
            "maps": [{"name": "dist", "label": "dist", "caption": "finalised distances", "lookup": "u"}],
            "stacks": [{"name": "h", "label": "h", "hint": "(distance, node) frontier"}],
            "scalars": ["d", "u", "v", "w"],
        },
    },
    {
        "id": "kruskal-mst",
        "title": "Min Cost to Connect All Points",
        "lc": "LC 1584",
        "level": "Medium",
        "mechanism": "Mechanism C -- Kruskal, sort plus DSU",
        "func": "min_cost_connect_points",
        "code": KRUSKAL,
        "prelude": "",
        "args": ([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]],),
        "watch": ["points", "n", "edges", "parent", "total", "used", "w", "u", "v", "ru", "rv"],
        "inputLabel": "points = [[0,0], [2,2], [3,10], [5,2], [7,0]]",
        "complexity": {"time": "O(E log E)", "space": "O(V)"},
        "idea": (
            "Each accepted edge is the lightest remaining one joining two different components, so by "
            "the cut property it belongs to some MST. <code>union</code> returning False <em>is</em> "
            "the cycle test &mdash; the accept/reject decision costs nothing extra."
        ),
        "takeaway": (
            "Output 20. Watch the rejected edges: each is the heaviest on the cycle it would close, so "
            "by the cycle property it belongs to no MST. The <code>used == n - 1</code> check does "
            "double duty &mdash; it terminates early once the tree is complete, and it is what would "
            "detect a disconnected graph."
        ),
        "view": {
            "arrays": [{"name": "parent", "label": "parent", "highlightWrites": True,
                        "hint": "DSU forest"}],
            "scalars": ["w", "u", "v", "ru", "rv", "total", "used"],
        },
    },
    {
        "id": "cheapest-flights",
        "title": "Cheapest Flights Within K Stops",
        "lc": "LC 787",
        "level": "Medium",
        "mechanism": "Mechanism B -- Bellman-Ford, hop-limited",
        "func": "cheapest_flights",
        "code": BELLMAN_FORD,
        "prelude": "",
        "args": (4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1),
        "watch": ["n", "src", "dst", "k", "dist", "prev", "u", "v", "w"],
        "inputLabel": "n = 4, src = 0, dst = 3, k = 1",
        "complexity": {"time": "O(k &middot; E)", "space": "O(V)"},
        "idea": (
            "After round i, <code>dist[v]</code> is the cheapest cost to reach v using <em>at most i "
            "edges</em>. The snapshot is what enforces &ldquo;at most i&rdquo;: relaxing against the "
            "live array would let one round chain two or more edges together."
        ),
        "takeaway": (
            "Output 700, the route 0&rarr;1&rarr;3 using two flights (one stop). The snapshot is the "
            "entire subtlety &mdash; without it, edge 2&rarr;3 could relax in the same round that "
            "1&rarr;2 did, producing the cheaper but <em>illegal</em> three-flight route at 400. "
            "<code>k + 1 = 2</code> rounds is the correct count: k stops means k + 1 edges."
        ),
        "view": {
            "arrays": [
                {"name": "prev", "label": "prev", "static": True, "hint": "last round's snapshot"},
                {"name": "dist", "label": "dist", "highlightWrites": True},
            ],
            "scalars": ["u", "v", "w", "k"],
        },
    },
]

TOPIC = {
    "id": "advanced-graphs",
    "number": "12",
    "title": "Advanced Graphs",
    "subtitle": "Dijkstra, Bellman-Ford with a hop limit, MST by Kruskal and Prim, Eulerian paths",
}
