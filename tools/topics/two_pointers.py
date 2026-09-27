"""Topic 02 -- Two Pointers."""

TWO_SUM_II = '''
def two_sum_ii(a, target):      # problem wants 1-based indices
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1              # a[l] too small for any partner
        else:
            r -= 1              # a[r] too big for any partner
    return []
'''

THREE_SUM = '''
def three_sum(nums):
    nums.sort()
    n, out = len(nums), []
    for i in range(n - 2):
        if nums[i] > 0:
            break               # sorted: no triplet can reach 0
        if i and nums[i] == nums[i - 1]:
            continue            # outer dedup
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1      # inner dedup
    return out
'''

MAX_AREA = '''
def max_area(h):
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        area = min(h[l], h[r]) * (r - l)
        best = max(best, area)
        if h[l] < h[r]:
            l += 1              # discard the SHORTER wall
        else:
            r -= 1
    return best
'''

EXAMPLES = [
    {
        "id": "two-sum-ii",
        "title": "Two Sum II (sorted input)",
        "lc": "LC 167",
        "level": "Medium",
        "mechanism": "Mechanism A -- converging pointers",
        "func": "two_sum_ii",
        "code": TWO_SUM_II,
        "args": ([1, 3, 4, 6, 8, 11], 10),
        "watch": ["a", "target", "l", "r", "s"],
        "inputLabel": "a = [1, 3, 4, 6, 8, 11], target = 10",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "Each move deletes a whole band of the candidate triangle. If the sum is too "
            "small, <code>a[l]</code> cannot pair with anything at or below <code>r</code>, "
            "so index l is dead and can be retired."
        ),
        "takeaway": (
            "Five iterations for n = 6, consistent with the <code>n - 1</code> bound from the "
            "potential argument. Watch step 2: because <code>1 + 8 &lt; 10</code>, index 0 cannot "
            "pair with anything at or below index 4, so deleting it is safe even though "
            "<code>1 + 11</code> was previously too big &mdash; the two deletions are independent proofs."
        ),
        "view": {
            "arrays": [{"name": "a", "label": "a", "static": True, "window": ["l", "r"]}],
            "pointers": [
                {"name": "l", "target": "a", "label": "l"},
                {"name": "r", "target": "a", "label": "r"},
            ],
            "scalars": ["s", "target"],
        },
    },
    {
        "id": "three-sum",
        "title": "3Sum",
        "lc": "LC 15",
        "level": "Medium",
        "mechanism": "Mechanism D -- sort, fix one index, converge inside",
        "func": "three_sum",
        "code": THREE_SUM,
        "args": ([-1, 0, 1, 2, -1, -4],),
        "watch": ["nums", "n", "out", "i", "l", "r", "s"],
        "inputLabel": "nums = [-1, 0, 1, 2, -1, -4]",
        "complexity": {"time": "O(n²)", "space": "O(1) aux"},
        "idea": (
            "Sorting buys the monotonicity the inner scan needs. The outer loop fixes one "
            "element; the inner two pointers solve a 2-sum on the suffix. De-duplication has "
            "to happen at <em>both</em> levels."
        ),
        "takeaway": (
            "The outer dedup at <code>i = 2</code> is what prevents a third, duplicate triplet "
            "<code>[-1, -1, 2]</code>; without it the scan from i = 2 would rediscover it. Note "
            "the array shown is already sorted &mdash; <code>nums.sort()</code> mutates in place on step 1."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "hint": "sorted in place on line 2"}],
            "pointers": [
                {"name": "i", "target": "nums", "label": "i"},
                {"name": "l", "target": "nums", "label": "l"},
                {"name": "r", "target": "nums", "label": "r"},
            ],
            "scalars": ["s", "out"],
        },
    },
    {
        "id": "container-most-water",
        "title": "Container With Most Water",
        "lc": "LC 11",
        "level": "Medium",
        "mechanism": "Mechanism A with a maximisation objective",
        "func": "max_area",
        "code": MAX_AREA,
        "args": ([1, 8, 6, 2, 5, 4, 8, 3, 7],),
        "watch": ["h", "l", "r", "best", "area"],
        "inputLabel": "h = [1, 8, 6, 2, 5, 4, 8, 3, 7]",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "Same elimination, but with <em>&ldquo;not better&rdquo;</em> replacing "
            "<em>&ldquo;not a solution&rdquo;</em>. Every pair using the shorter wall is capped "
            "by that wall and has smaller width, so it is dominated."
        ),
        "takeaway": (
            "Output 49, from the pair (1, 8) with heights 8 and 7 over width 7. Eight iterations "
            "for n = 9: exactly <code>n - 1</code>, the worst case of the potential bound. The trace "
            "also shows why the greedy is safe at a tie &mdash; both alternatives are capped by the "
            "smaller height <em>and</em> a smaller width."
        ),
        "view": {
            "arrays": [{"name": "h", "label": "h", "static": True, "window": ["l", "r"]}],
            "pointers": [
                {"name": "l", "target": "h", "label": "l"},
                {"name": "r", "target": "h", "label": "r"},
            ],
            "scalars": ["area", "best"],
        },
    },
]

TOPIC = {
    "id": "two-pointers",
    "number": "02",
    "title": "Two Pointers",
    "subtitle": "Converging pointers on sorted data, fast/slow write pointers, pair-space elimination",
}
