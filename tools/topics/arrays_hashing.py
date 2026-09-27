"""Topic 01 -- Arrays and Hashing."""

TWO_SUM = '''
def two_sum(nums, target):
    seen = {}                   # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:        # ask BEFORE inserting
            return [seen[need], i]
        seen[x] = i             # extend the prefix
    return []
'''

PRODUCT = '''
def product_except_self(nums):
    n = len(nums)
    res = [1] * n
    pre = 1
    for i in range(n):          # res[i] = prod(nums[:i])
        res[i] = pre
        pre *= nums[i]
    suf = 1
    for i in range(n - 1, -1, -1):
        res[i] *= suf           # fold in the suffix
        suf *= nums[i]
    return res
'''

LONGEST = '''
def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for n in s:                 # iterate the SET
        if n - 1 in s:
            continue            # not a run start
        cur, run = n, 1
        while cur + 1 in s:
            cur += 1
            run += 1
        best = max(best, run)
    return best
'''

EXAMPLES = [
    {
        "id": "two-sum",
        "title": "Two Sum",
        "lc": "LC 1",
        "level": "Easy",
        "mechanism": "Mechanism A -- complement / index map",
        "func": "two_sum",
        "code": TWO_SUM,
        "args": ([5, -1, 3, 8, 2], 10),
        "watch": ["nums", "target", "seen", "i", "x", "need"],
        "inputLabel": "nums = [5, -1, 3, 8, 2], target = 10",
        "complexity": {"time": "O(n) expected", "space": "O(n)"},
        "idea": (
            "Replace the inner search with a lookup. At index i the map holds "
            "exactly the strict prefix, so asking <em>before</em> inserting makes "
            "the self-pairing bug structurally impossible."
        ),
        "takeaway": (
            "The hit fires at the <em>later</em> index of the pair -- exactly what the "
            "completeness argument predicts. At i = 0 the prefix is empty, so a lone 5 "
            "with target 10 cannot false-pair with itself."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "pointers": [{"name": "i", "target": "nums", "label": "i", "tone": "primary"}],
            "maps": [{"name": "seen", "label": "seen", "caption": "value \u2192 index"}],
            "scalars": ["x", "need", "target"],
        },
    },
    {
        "id": "product-except-self",
        "title": "Product of Array Except Self",
        "lc": "LC 238",
        "level": "Medium",
        "mechanism": "Mechanism C -- prefix / suffix fold",
        "func": "product_except_self",
        "code": PRODUCT,
        "args": ([2, 3, 0, 4],),
        "watch": ["nums", "n", "res", "pre", "suf", "i"],
        "inputLabel": "nums = [2, 3, 0, 4]",
        "complexity": {"time": "O(n)", "space": "O(1) aux"},
        "idea": (
            "Two independent running folds. The forward pass leaves "
            "<code>res[i] = prod(nums[:i])</code>; the backward pass multiplies in "
            "<code>prod(nums[i+1:])</code>. No division anywhere, which is what makes "
            "zeros harmless."
        ),
        "takeaway": (
            "The input <code>[2, 3, 0, 4]</code> is chosen because the zero kills every "
            "division-based solution. Watch <code>res</code> double as the scratch buffer -- "
            "that reuse is why aux space is O(1) even though the answer is O(n)."
        ),
        "view": {
            "arrays": [
                {"name": "nums", "label": "nums", "static": True},
                {"name": "res", "label": "res", "highlightWrites": True},
            ],
            "pointers": [{"name": "i", "target": "res", "label": "i", "tone": "primary"}],
            "maps": [],
            "scalars": ["pre", "suf", "n"],
        },
    },
    {
        "id": "longest-consecutive",
        "title": "Longest Consecutive Sequence",
        "lc": "LC 128",
        "level": "Medium",
        "mechanism": "Set-frontier scan from run starts only",
        "func": "longest_consecutive",
        "code": LONGEST,
        "args": ([100, 4, 200, 1, 3, 2],),
        "watch": ["nums", "s", "best", "n", "cur", "run"],
        "inputLabel": "nums = [100, 4, 200, 1, 3, 2]",
        "complexity": {"time": "O(n)", "space": "O(n)"},
        "idea": (
            "Two guards carry the linear bound: iterate the <em>set</em> so duplicates "
            "cannot trigger repeated walks, and skip any n whose predecessor is present "
            "so each run is walked from its unique left endpoint exactly once."
        ),
        "takeaway": (
            "The amortisation is visible in the steps: the inner <code>while</code> advances "
            "3 times in total across the whole run, and every skipped value costs O(1). "
            "Each value is the target of at most one inner step -- so a loop inside a loop "
            "is still O(n)."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "pointers": [],
            "sets": [{"name": "s", "label": "s", "cursors": ["n", "cur"]}],
            "maps": [],
            "scalars": ["n", "cur", "run", "best"],
        },
    },
]

TOPIC = {
    "id": "arrays-hashing",
    "number": "01",
    "title": "Arrays and Hashing",
    "subtitle": "Complement maps, canonical keys, frequency counts, prefix/suffix folds",
}

