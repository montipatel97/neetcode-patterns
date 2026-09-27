"""Topic 14 -- 2-D Dynamic Programming."""

UNIQUE_PATHS = '''
def unique_paths(m, n):
    dp = [[1] * n for _ in range(m)]    # row 0 and col 0 are all 1
    for r in range(1, m):
        for c in range(1, n):
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1]
    return dp[m - 1][n - 1]
'''

LCS = '''
def lcs(a, b):
    n, m = len(a), len(b)
    dp = [[0] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:     # dp 1-indexed, strings 0-indexed
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[n][m]
'''

PARTITION = '''
def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False                     # odd total: impossible
    target = total // 2
    dp = [False] * (target + 1)
    dp[0] = True                         # the empty subset sums to 0
    for x in nums:
        for w in range(target, x - 1, -1):    # DESCENDING
            if dp[w - x]:
                dp[w] = True
        if dp[target]:
            return True
    return dp[target]
'''

EXAMPLES = [
    {
        "id": "unique-paths",
        "title": "Unique Paths",
        "lc": "LC 62",
        "level": "Medium",
        "mechanism": "Mechanism C -- grid DP",
        "func": "unique_paths",
        "code": UNIQUE_PATHS,
        "args": (3, 4),
        "watch": ["m", "n", "dp", "r", "c"],
        "inputLabel": "m = 3 rows, n = 4 columns",
        "complexity": {"time": "O(n&middot;m)", "space": "O(m)"},
        "idea": (
            "Every path to <code>(r, c)</code> arrives from <code>(r-1, c)</code> or "
            "<code>(r, c-1)</code>, and never both &mdash; the last step is a single move. So the "
            "path sets <em>partition</em>, and the counts add."
        ),
        "takeaway": (
            "Answer 10. The base cases are the single degenerate paths along the top row and left "
            "column, which is why the table is pre-filled with 1s rather than 0s. Every read is from "
            "a cell above or to the left &mdash; strictly earlier in row-major order &mdash; which is "
            "exactly what makes the plain ascending nested loop a valid fill order."
        ),
        "view": {
            "grids": [{"name": "dp", "label": "dp", "row": "r", "col": "c",
                       "hint": "paths reaching each cell"}],
            "scalars": ["r", "c", "m", "n"],
        },
    },
    {
        "id": "lcs",
        "title": "Longest Common Subsequence",
        "lc": "LC 1143",
        "level": "Medium",
        "mechanism": "Mechanism A -- two sequences",
        "func": "lcs",
        "code": LCS,
        "args": ("abcde", "ace"),
        "watch": ["a", "b", "n", "m", "dp", "i", "j"],
        "inputLabel": 'a = "abcde", b = "ace"',
        "complexity": {"time": "O(n&middot;m)", "space": "O(min(n,m))"},
        "idea": (
            "Row 0 and column 0 are the &ldquo;one sequence is empty&rdquo; base cases. The "
            "<code>(n+1)&times;(m+1)</code> table exists so that index 0 means <em>empty prefix</em>, "
            "which removes all base-case branching &mdash; at the price of a permanent <code>-1</code> "
            "on every input access."
        ),
        "takeaway": (
            "Answer 3, the subsequence <code>\"ace\"</code>. Watch the diagonal steps: they are the "
            "matched pairs. On a match the recurrence commits to the pair and jumps to "
            "<code>dp[i-1][j-1]</code>; on a mismatch at least one of the two final characters must go "
            "unused, and the two cases cover everything."
        ),
        "view": {
            "grids": [{"name": "dp", "label": "dp", "row": "i", "col": "j",
                       "hint": "rows = prefixes of a, cols = prefixes of b"}],
            "scalars": ["i", "j", "a", "b"],
        },
    },
    {
        "id": "partition-equal-subset",
        "title": "Partition Equal Subset Sum",
        "lc": "LC 416",
        "level": "Medium",
        "mechanism": "Mechanism B -- 0/1 knapsack reduced to one row",
        "func": "can_partition",
        "code": PARTITION,
        "args": ([1, 5, 11, 5],),
        "watch": ["nums", "total", "target", "dp", "x", "w"],
        "inputLabel": "nums = [1, 5, 11, 5]  (total 22, target 11)",
        "complexity": {"time": "O(n&middot;S)", "space": "O(S)"},
        "idea": (
            "<strong>The sweep direction is the algorithm.</strong> Descending w guarantees that "
            "<code>dp[w - x]</code> still refers to the state <em>before</em> item x was considered. "
            "Ascending would read a value already updated with x, silently permitting x twice."
        ),
        "takeaway": (
            "Returns <code>True</code>: <code>{11}</code> and <code>{1, 5, 5}</code> both sum to 11. "
            "Watch the row fill right-to-left. Reverse that direction and you are solving the "
            "<em>unbounded</em> knapsack instead &mdash; a different problem that happens to compile."
        ),
        "view": {
            "arrays": [
                {"name": "nums", "label": "nums", "static": True},
                {"name": "dp", "label": "dp", "highlightWrites": True, "hint": "index = reachable sum"},
            ],
            "pointers": [{"name": "w", "target": "dp", "label": "w"}],
            "scalars": ["x", "w", "total", "target"],
        },
    },
]

TOPIC = {
    "id": "dp-2d",
    "number": "14",
    "title": "2-D Dynamic Programming",
    "subtitle": "Two-sequence tables, knapsack capacity states, grid paths, interval DP, space reduction",
}
