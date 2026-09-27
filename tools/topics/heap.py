"""Topic 09 -- Heap and Priority Queue."""

KTH_LARGEST = '''
def find_kth_largest(nums, k):
    h = []                          # min-heap of the k largest so far
    for x in nums:
        heapq.heappush(h, x)
        if len(h) > k:
            heapq.heappop(h)        # drop the weakest champion
    return h[0]                     # smallest of the k largest
'''

MEDIAN = '''
def running_median(stream):
    lo, hi = [], []                 # lo: max-heap (negated), hi: min-heap
    out = []
    for x in stream:
        heapq.heappush(lo, -x)                    # ALWAYS via lo
        heapq.heappush(hi, -heapq.heappop(lo))    # move lo's max across
        if len(hi) > len(lo):                     # restore balance
            heapq.heappush(lo, -heapq.heappop(hi))
        if len(lo) > len(hi):
            out.append(float(-lo[0]))
        else:
            out.append((-lo[0] + hi[0]) / 2)
    return out
'''

MERGE_K = '''
def merge_k(lists):
    h = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(h)                # O(n), not O(n log n)
    out = []
    while h:
        val, i, j = heapq.heappop(h)
        out.append(val)
        if j + 1 < len(lists[i]):   # push this source's successor
            heapq.heappush(h, (lists[i][j + 1], i, j + 1))
    return out
'''

PRELUDE = "import heapq\n"

EXAMPLES = [
    {
        "id": "kth-largest",
        "title": "Kth Largest Element in an Array",
        "lc": "LC 215",
        "level": "Medium",
        "mechanism": "Mechanism A -- bounded heap for top-k",
        "func": "find_kth_largest",
        "code": KTH_LARGEST,
        "prelude": PRELUDE,
        "args": ([3, 2, 1, 5, 6, 4], 2),
        "watch": ["nums", "k", "h", "x"],
        "inputLabel": "nums = [3, 2, 1, 5, 6, 4], k = 2",
        "complexity": {"time": "O(n log k)", "space": "O(k)"},
        "idea": (
            "To keep the k <em>largest</em> you maintain a <strong>min</strong>-heap of size k. The "
            "root is the weakest of the current champions, so it is exactly the one to evict &mdash; "
            "and the direction flip is what trips people up."
        ),
        "takeaway": (
            "Output 5, the 2nd largest. The heap never exceeds k+1 entries, which is the whole point: "
            "an unbounded max-heap gives the same answer but costs O(n log n) time and O(n) space, and "
            "fails outright when <code>nums</code> is a stream. Only <code>h[0]</code> is specified by "
            "heapq &mdash; the rest of the array order is an implementation detail."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "stacks": [{"name": "h", "label": "h", "hint": "min-heap; h[0] is the root"}],
            "scalars": ["x", "k"],
        },
    },
    {
        "id": "running-median",
        "title": "Find Median from Data Stream",
        "lc": "LC 295",
        "level": "Hard",
        "mechanism": "Mechanism C -- two heaps straddling the split",
        "func": "running_median",
        "code": MEDIAN,
        "prelude": PRELUDE,
        "args": ([5, 15, 1, 3],),
        "watch": ["stream", "lo", "hi", "x", "out"],
        "inputLabel": "stream = [5, 15, 1, 3]",
        "complexity": {"time": "O(log n) per add", "space": "O(n)"},
        "idea": (
            "Two invariants at once: <code>max(lo) &le; min(hi)</code> and the sizes differ by at most "
            "one. Routing <em>every</em> element through <code>lo</code> and transferring its maximum "
            "enforces the ordering unconditionally, which deletes all the case analysis."
        ),
        "takeaway": (
            "Medians <code>5, 10, 5, 4</code>. Watch the unconditional route: when 1 arrives it enters "
            "<code>lo</code>, is immediately moved to <code>hi</code>, and then comes back on the "
            "rebalance &mdash; three sifts, no branching on where it belongs. <code>lo</code> holds "
            "<em>negated</em> values, so its root prints as the negative of the true maximum."
        ),
        "view": {
            "stacks": [
                {"name": "lo", "label": "lo", "hint": "max-heap, values negated"},
                {"name": "hi", "label": "hi", "hint": "min-heap"},
            ],
            "scalars": ["x", "out"],
        },
    },
    {
        "id": "merge-k-lists",
        "title": "Merge k Sorted Lists",
        "lc": "LC 23",
        "level": "Hard",
        "mechanism": "Mechanism B -- k-way merge",
        "func": "merge_k",
        "code": MERGE_K,
        "prelude": PRELUDE,
        "args": ([[1, 4, 5], [1, 3, 4], [2, 6]],),
        "watch": ["lists", "h", "out", "val", "i", "j"],
        "inputLabel": "lists = [[1, 4, 5], [1, 3, 4], [2, 6]]",
        "complexity": {"time": "O(N log k)", "space": "O(k)"},
        "idea": (
            "The heap holds exactly one candidate per non-exhausted source: its smallest unconsumed "
            "element. The global minimum is therefore always in the heap, so popping the root emits "
            "in sorted order."
        ),
        "takeaway": (
            "Output <code>[1, 1, 2, 3, 4, 4, 5, 6]</code>. The heap holds at most 3 entries throughout, "
            "never 8 &mdash; that is the O(k) space claim. The tie between <code>(4, 0)</code> and "
            "<code>(4, 1)</code> is resolved by the list index, which is why that field is in the tuple: "
            "it makes the order deterministic and keeps the payload out of the comparison."
        ),
        "view": {
            "stacks": [{"name": "h", "label": "h", "hint": "(value, list, position) per live source"}],
            "scalars": ["val", "i", "j", "out"],
        },
    },
]

TOPIC = {
    "id": "heap",
    "number": "09",
    "title": "Heap and Priority Queue",
    "subtitle": "Bounded top-k heaps, k-way merge, two-heap median, and the O(n) heapify argument",
}
