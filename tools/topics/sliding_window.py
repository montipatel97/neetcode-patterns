"""Topic 03 -- Sliding Window."""

LONGEST_UNIQUE = '''
def length_of_longest_substring(s):
    seen = set()
    l = best = 0
    for r, ch in enumerate(s):
        while ch in seen:       # WHILE: may need several
            seen.remove(s[l])
            l += 1
        seen.add(ch)
        best = max(best, r - l + 1)
    return best
'''

MIN_WINDOW = '''
def min_window(s, t):
    need = {}
    for c in t:
        need[c] = need.get(c, 0) + 1
    missing = len(t)
    best = (10 ** 9, 0, 0)
    l = 0
    for r, ch in enumerate(s):
        if need.get(ch, 0) > 0:
            missing -= 1
        need[ch] = need.get(ch, 0) - 1   # may go negative
        while missing == 0:              # valid -> shrink
            if r - l + 1 < best[0]:
                best = (r - l + 1, l, r)
            need[s[l]] += 1
            if need[s[l]] > 0:           # broke validity
                missing += 1
            l += 1
    return "" if best[0] == 10 ** 9 else s[best[1]:best[2] + 1]
'''

MAX_WINDOW = '''
def max_sliding_window(a, k):
    dq, out = [], []                 # dq holds INDICES
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()                 # dominated forever
        dq.append(i)
        if dq[0] <= i - k:
            dq.pop(0)                # expired by index
        if i >= k - 1:
            out.append(a[dq[0]])
    return out
'''

EXAMPLES = [
    {
        "id": "longest-unique",
        "title": "Longest Substring Without Repeating Characters",
        "lc": "LC 3",
        "level": "Medium",
        "mechanism": "Mechanism A -- variable window, longest valid",
        "func": "length_of_longest_substring",
        "code": LONGEST_UNIQUE,
        "args": ("abcabcbb",),
        "watch": ["s", "seen", "l", "best", "r", "ch"],
        "inputLabel": 's = "abcabcbb"',
        "complexity": {"time": "O(n)", "space": "O(min(n, A))"},
        "idea": (
            "Restore validity, then extend, then record &mdash; that order is the whole "
            "algorithm. The <code>while</code> can fire several times in one step, which "
            "looks quadratic locally but is not."
        ),
        "takeaway": (
            "Output 3. The later rows each run the <code>while</code> twice, yet <code>l</code> "
            "advances only 7 times in total across all 8 iterations. That is the amortised "
            "argument made visible: the inner loop is O(n) <em>in total</em>, not per step."
        ),
        "view": {
            "arrays": [],
            "pointers": [],
            "sets": [{"name": "seen", "label": "seen", "cursors": ["ch"]}],
            "scalars": ["r", "ch", "l", "best"],
        },
    },
    {
        "id": "min-window",
        "title": "Minimum Window Substring",
        "lc": "LC 76",
        "level": "Hard",
        "mechanism": "Mechanism B -- variable window, shortest valid",
        "func": "min_window",
        "code": MIN_WINDOW,
        "args": ("ADOBECODEBANC", "ABC"),
        "watch": ["s", "t", "need", "missing", "best", "l", "r", "ch"],
        "inputLabel": 's = "ADOBECODEBANC", t = "ABC"',
        "complexity": {"time": "O(n)", "space": "O(len(t))"},
        "idea": (
            "<code>missing</code> counts unmet multiplicity, not distinct characters. Letting "
            "<code>need</code> go negative records surplus, which is what stops the shrink "
            "test firing one character too early."
        ),
        "takeaway": (
            'Output <code>&quot;BANC&quot;</code>. Watch <code>need</code> go negative on surplus letters: '
            "that is the bookkeeping that lets the window shrink past a duplicate without "
            "declaring itself invalid. <code>missing</code> returns to 1 only when a genuinely "
            "required character leaves."
        ),
        "view": {
            "maps": [{"name": "need", "label": "need", "caption": "unmet multiplicity; negative = surplus"}],
            "scalars": ["r", "ch", "l", "missing", "best"],
        },
    },
    {
        "id": "sliding-window-maximum",
        "title": "Sliding Window Maximum",
        "lc": "LC 239",
        "level": "Hard",
        "mechanism": "Mechanism D -- monotonic deque",
        "func": "max_sliding_window",
        "code": MAX_WINDOW,
        "args": ([1, 3, -1, -3, 5, 3, 6, 7], 3),
        "watch": ["a", "k", "dq", "out", "i", "x"],
        "inputLabel": "a = [1, 3, -1, -3, 5, 3, 6, 7], k = 3",
        "complexity": {"time": "O(n)", "space": "O(k)"},
        "idea": (
            "The deque holds only indices not dominated by a later one, so its values fall "
            "from head to tail and the head is the window maximum. Storing indices rather "
            "than values is what makes expiry decidable."
        ),
        "takeaway": (
            "Output <code>[3, 3, 5, 5, 6, 7]</code>. Total deque operations: 8 pushes and 7 pops "
            "across n = 8 &mdash; at most 2n, the amortised proof made concrete. Watch the step "
            "where 5 arrives: it evicts three older, smaller indices at once, and those indices "
            "are never reconsidered."
        ),
        "view": {
            "arrays": [{"name": "a", "label": "a", "static": True}],
            "pointers": [{"name": "i", "target": "a", "label": "i"}],
            "deques": [{"name": "dq", "label": "dq", "hint": "indices, values strictly decreasing"}],
            "scalars": ["i", "x", "k", "out"],
        },
    },
]

TOPIC = {
    "id": "sliding-window",
    "number": "03",
    "title": "Sliding Window",
    "subtitle": "Variable and fixed windows, feasibility monotonicity, monotonic-deque extrema",
}
