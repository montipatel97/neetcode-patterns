"""Topic 05 -- Binary Search."""

CLASSIC = '''
def search(a, target):
    lo, hi = 0, len(a) - 1        # both inclusive
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1          # updates SKIP mid
        else:
            hi = mid - 1
    return -1                     # range empty = absent
'''

ROTATED = '''
def search_rotated(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[lo] <= a[mid]:               # left half sorted
            if a[lo] <= target < a[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                             # right half sorted
            if a[mid] < target <= a[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
'''

KOKO = '''
def min_eating_speed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)

    lo, hi = 1, max(piles)        # lo = 1: k = 0 is illegal
    while lo < hi:
        mid = (lo + hi) // 2
        if hours(mid) <= h:       # feasible -> keep mid
            hi = mid
        else:
            lo = mid + 1
    return lo
'''

EXAMPLES = [
    {
        "id": "binary-search-basic",
        "title": "Binary Search, with the not-found path",
        "lc": "LC 704",
        "level": "Easy",
        "mechanism": "Mechanism A -- exact search, inclusive bounds",
        "func": "search",
        "code": CLASSIC,
        "args": ([-5, -2, 0, 3, 7, 9, 12], 8),
        "watch": ["a", "target", "lo", "hi", "mid"],
        "inputLabel": "a = [-5, -2, 0, 3, 7, 9, 12], target = 8",
        "complexity": {"time": "O(log n)", "space": "O(1)"},
        "idea": (
            "Each branch discards only elements <em>proven</em> unequal to the target. "
            "Termination with <code>lo &gt; hi</code> means the live range is empty, which is "
            "the proof that the target is absent."
        ),
        "takeaway": (
            "The target 8 is deliberately absent. Watch the live window collapse until "
            "<code>lo &gt; hi</code>, at which point <code>-1</code> is returned &mdash; the empty "
            "range <em>is</em> the not-found proof, not a special case bolted on afterwards. "
            "Three probes for n = 7, matching <code>ceil(log2 7) = 3</code>."
        ),
        "view": {
            "arrays": [{"name": "a", "label": "a", "static": True, "window": ["lo", "hi"]}],
            "pointers": [
                {"name": "lo", "target": "a", "label": "lo"},
                {"name": "mid", "target": "a", "label": "mid"},
                {"name": "hi", "target": "a", "label": "hi"},
            ],
            "scalars": ["lo", "mid", "hi", "target"],
        },
    },
    {
        "id": "search-rotated",
        "title": "Search in Rotated Sorted Array",
        "lc": "LC 33",
        "level": "Medium",
        "mechanism": "Mechanism D -- identify the sorted half first",
        "func": "search_rotated",
        "code": ROTATED,
        "args": ([4, 5, 6, 7, 0, 1, 2], 0),
        "watch": ["a", "target", "lo", "hi", "mid"],
        "inputLabel": "a = [4, 5, 6, 7, 0, 1, 2], target = 0",
        "complexity": {"time": "O(log n)", "space": "O(1)"},
        "idea": (
            "A rotated array is two sorted runs. Comparing <code>a[lo]</code> with "
            "<code>a[mid]</code> says which half is internally sorted; only inside that half is a "
            "range test meaningful."
        ),
        "takeaway": (
            "Output 4. The first probe lands on 7, which is <em>greater</em> than the target &mdash; "
            "a plain comparison would discard the right half and return -1. Identifying that "
            "<code>[4,5,6,7]</code> is the sorted half, and that 0 is not inside its range, is what "
            "sends the search rightward instead."
        ),
        "view": {
            "arrays": [{"name": "a", "label": "a", "static": True, "window": ["lo", "hi"]}],
            "pointers": [
                {"name": "lo", "target": "a", "label": "lo"},
                {"name": "mid", "target": "a", "label": "mid"},
                {"name": "hi", "target": "a", "label": "hi"},
            ],
            "scalars": ["lo", "mid", "hi", "target"],
        },
    },
    {
        "id": "koko-bananas",
        "title": "Koko Eating Bananas",
        "lc": "LC 875",
        "level": "Medium",
        "mechanism": "Mechanism C -- search on the answer",
        "func": "min_eating_speed",
        "only": ["min_eating_speed"],
        "code": KOKO,
        "args": ([3, 6, 7, 11], 8),
        "watch": ["piles", "h", "lo", "hi", "mid"],
        "inputLabel": "piles = [3, 6, 7, 11], h = 8",
        "complexity": {"time": "O(n log R)", "space": "O(1)"},
        "idea": (
            "The search space is not the array &mdash; it is the <em>eating speed</em>. Feasibility "
            "is monotone (a faster Koko never needs more hours), so the boundary form finds the "
            "smallest feasible speed."
        ),
        "takeaway": (
            "Output 4. Verification of the boundary: <code>hours(4) = 1+2+2+3 = 8 &le; 8</code> is "
            "feasible, and <code>hours(3) = 1+2+3+4 = 10 &gt; 8</code> is not, so 4 is exactly the "
            "minimum. The log is over the <em>value range</em>, so a constraint like "
            "<code>piles[i] &le; 10<sup>9</sup></code> costs only ~30 iterations."
        ),
        "view": {
            "arrays": [{"name": "piles", "label": "piles", "static": True}],
            "scalars": ["lo", "mid", "hi", "h"],
        },
    },
]

TOPIC = {
    "id": "binary-search",
    "number": "05",
    "title": "Binary Search",
    "subtitle": "Boundary search on a monotone predicate, rotated arrays, and search on the answer",
}
