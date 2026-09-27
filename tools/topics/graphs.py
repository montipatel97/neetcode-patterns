"""Topic 11 -- Graphs."""

NUM_ISLANDS = '''
def num_islands(grid):
    if not grid or not grid[0]:
        return 0
    R, C, count = len(grid), len(grid[0]), 0

    def sink(r, c):
        if r < 0 or r >= R or c < 0 or c >= C or grid[r][c] != "1":
            return
        grid[r][c] = "0"               # mark visited by sinking
        sink(r + 1, c)
        sink(r - 1, c)
        sink(r, c + 1)
        sink(r, c - 1)

    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1":
                count = count + 1      # one new component
                sink(r, c)
    return count
'''

COURSE_SCHEDULE = '''
def can_finish(n, prerequisites):
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for course, prereq in prerequisites:
        adj[prereq].append(course)     # prereq -> course
        indeg[course] += 1

    q = [u for u in range(n) if indeg[u] == 0]
    done = 0
    while q:
        u = q.pop(0)
        done += 1
        for v in adj[u]:
            indeg[v] -= 1              # one prerequisite met
            if indeg[v] == 0:
                q.append(v)
    return done == n                   # short order => a cycle
'''

ROTTING = '''
def oranges_rotting(grid):
    R, C = len(grid), len(grid[0])
    q, fresh = [], 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 2:
                q.append((r, c))       # seed EVERY source
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while q and fresh:                 # fresh test stops the last tick
        for _ in range(len(q)):        # snapshot = one minute
            r, c = q.pop(0)
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes
'''

EXAMPLES = [
    {
        "id": "num-islands",
        "title": "Number of Islands",
        "lc": "LC 200",
        "level": "Medium",
        "mechanism": "DFS + visited on an implicit grid graph",
        "func": "num_islands",
        "code": NUM_ISLANDS,
        "args": ([["1", "1", "0"], ["1", "0", "0"], ["0", "0", "1"]],),
        "watch": ["grid", "R", "C", "count", "r", "c"],
        "inputLabel": '3×3 grid, "1" = land',
        "complexity": {"time": "O(R&middot;C)", "space": "O(R&middot;C)"},
        "idea": (
            "A grid needs no adjacency list &mdash; neighbours are computed. Sinking each cell as "
            "it is visited doubles as the visited set, so every land cell is consumed exactly once "
            "across all calls."
        ),
        "takeaway": (
            "Output 2. The outer double loop visits every cell once, and <code>sink</code> visits each "
            "land cell once <em>across all calls</em> &mdash; so the total is O(R&middot;C), not "
            "O(R&middot;C) per island. Note the cost: the caller&rsquo;s grid is destroyed. Say so, or "
            "use a separate visited set."
        ),
        "view": {
            "grids": [{"name": "grid", "label": "grid", "row": "r", "col": "c",
                       "hint": "cells sink to 0 as they are absorbed"}],
            "scalars": ["r", "c", "count"],
        },
    },
    {
        "id": "course-schedule",
        "title": "Course Schedule",
        "lc": "LC 207",
        "level": "Medium",
        "mechanism": "Mechanism D -- Kahn's topological sort",
        "func": "can_finish",
        "code": COURSE_SCHEDULE,
        "args": (4, [[1, 0], [2, 0], [3, 1], [3, 2]]),
        "watch": ["n", "adj", "indeg", "q", "done", "u", "v"],
        "inputLabel": "n = 4, edges 0→1, 0→2, 1→3, 2→3",
        "complexity": {"time": "O(V + E)", "space": "O(V)"},
        "idea": (
            "<code>indeg[v]</code> counts the prerequisites of v <em>not yet emitted</em>, so it "
            "reaching 0 is precisely the condition for v to become available. The final length check "
            "is a complete cycle certificate, not a heuristic."
        ),
        "takeaway": (
            "<code>done == 4 == n</code>, so <code>True</code>. Watch node 3: it is decremented once "
            "when 1 is emitted and only becomes available after 2 is emitted too. Had the graph "
            "contained a cycle, those nodes would never reach in-degree 0 and the length check alone "
            "would detect it &mdash; which is why Course Schedule needs no separate DFS."
        ),
        "view": {
            "arrays": [{"name": "indeg", "label": "indeg", "highlightWrites": True}],
            "deques": [{"name": "q", "label": "q", "hint": "nodes with every prerequisite emitted"}],
            "scalars": ["u", "v", "done", "n"],
        },
    },
    {
        "id": "rotting-oranges",
        "title": "Rotting Oranges",
        "lc": "LC 994",
        "level": "Medium",
        "mechanism": "Multi-source BFS",
        "func": "oranges_rotting",
        "code": ROTTING,
        "args": ([[2, 1, 1], [1, 1, 0], [0, 1, 1]],),
        "watch": ["grid", "q", "fresh", "minutes", "r", "c", "nr", "nc"],
        "inputLabel": "grid = [[2,1,1], [1,1,0], [0,1,1]]",
        "complexity": {"time": "O(R&middot;C)", "space": "O(R&middot;C)"},
        "idea": (
            "Seeding the queue with <em>every</em> source costs the same as one source, and makes "
            "the BFS level number the elapsed time. The level snapshot converts BFS depth into minutes."
        ),
        "takeaway": (
            "Output 4. Three details worth naming. The snapshot <code>for _ in range(len(q))</code> is "
            "what converts BFS depth into elapsed minutes. The <code>fresh</code> counter is the "
            "reachability certificate &mdash; an isolated fresh orange leaves it positive and forces "
            "<code>-1</code>. And the loop guard is <code>while q and fresh</code>, not "
            "<code>while q</code>: without the <code>fresh</code> test the last level would still tick "
            "<code>minutes</code> up after nothing rots."
        ),
        "view": {
            "grids": [{"name": "grid", "label": "grid", "row": "r", "col": "c",
                       "hint": "2 = rotten, 1 = fresh, 0 = empty"}],
            "deques": [{"name": "q", "label": "q", "hint": "the current rot frontier"}],
            "scalars": ["fresh", "minutes", "r", "c"],
        },
    },
]

TOPIC = {
    "id": "graphs",
    "number": "11",
    "title": "Graphs",
    "subtitle": "DFS and BFS on explicit and implicit graphs, cycle detection, topological order, DSU",
}
