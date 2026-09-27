"""Topic 13 -- 1-D Dynamic Programming."""

HOUSE_ROBBER = '''
def rob(nums):
    prev2 = prev1 = 0            # dp[i-2], dp[i-1]
    for x in nums:
        # simultaneous: sequential assignment would clobber prev1
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
'''

COIN_CHANGE = '''
def coin_change(coins, amount):
    INF = float('inf')
    dp = [0] + [INF] * amount    # dp[a] = fewest coins summing to a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return -1 if dp[amount] == INF else dp[amount]
'''

LIS = '''
def length_of_lis(nums):
    tails = []                   # tails[k] = smallest tail of an LIS of length k+1
    for x in nums:
        lo, hi = 0, len(tails)
        while lo < hi:           # bisect_left: strictly increasing
            mid = (lo + hi) // 2
            if tails[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(x)      # x extends the longest run
        else:
            tails[lo] = x        # lower a tail; never hurts
    return len(tails)
'''

EXAMPLES = [
    {
        "id": "house-robber",
        "title": "House Robber",
        "lc": "LC 198",
        "level": "Medium",
        "mechanism": "Mechanism A -- bounded lookback, rolling variables",
        "func": "rob",
        "code": HOUSE_ROBBER,
        "args": ([2, 7, 9, 3, 1],),
        "watch": ["nums", "prev2", "prev1", "x"],
        "inputLabel": "nums = [2, 7, 9, 3, 1]",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>. Because it reads only two states "
            "back, the table is never needed &mdash; two scalars suffice. The <code>i-2</code> is not "
            "a stylistic choice; <em>it is the no-adjacent constraint</em>."
        ),
        "takeaway": (
            "Answer 12, from houses 2 + 9 + 1. Watch the simultaneous assignment: sequential "
            "assignment would overwrite <code>prev1</code> before it is read as <code>dp[i-1]</code>. "
            "Adding to <code>prev1</code> instead of <code>prev2</code> would allow two adjacent "
            "houses and report 18."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "scalars": ["x", "prev2", "prev1"],
        },
    },
    {
        "id": "coin-change",
        "title": "Coin Change",
        "lc": "LC 322",
        "level": "Medium",
        "mechanism": "Mechanism B -- unbounded lookback, the table stays",
        "func": "coin_change",
        "code": COIN_CHANGE,
        "args": ([1, 2, 5], 11),
        "watch": ["coins", "amount", "dp", "a", "c"],
        "inputLabel": "coins = [1, 2, 5], amount = 11",
        "complexity": {"time": "O(n &middot; amount)", "space": "O(amount)"},
        "idea": (
            "A minimisation table must start at the identity for <code>min</code>, which is "
            "<code>+inf</code>. Only <code>dp[0] = 0</code> is a real base case, and the "
            "<code>inf</code> sentinel then doubles as the unreachability flag."
        ),
        "takeaway": (
            "Answer 3, from <code>5 + 5 + 1</code>. Watch <code>dp</code> fill left to right: every "
            "state it reads is already final, which is the only obligation the loop order has. Greedy "
            "fails here in general &mdash; with coins <code>[1, 3, 4]</code> and amount 6 it takes "
            "4+1+1 while the optimum is 3+3."
        ),
        "view": {
            "arrays": [
                {"name": "coins", "label": "coins", "static": True},
                {"name": "dp", "label": "dp", "highlightWrites": True, "hint": "index = amount"},
            ],
            "pointers": [{"name": "a", "target": "dp", "label": "a"}],
            "scalars": ["a", "c"],
        },
    },
    {
        "id": "lis",
        "title": "Longest Increasing Subsequence, O(n log n)",
        "lc": "LC 300",
        "level": "Medium",
        "mechanism": "Patience: binary search over best-possible tails",
        "func": "length_of_lis",
        "code": LIS,
        "args": ([10, 9, 2, 5, 3, 7, 101, 18],),
        "watch": ["nums", "tails", "x", "lo", "hi", "mid"],
        "inputLabel": "nums = [10, 9, 2, 5, 3, 7, 101, 18]",
        "complexity": {"time": "O(n log n)", "space": "O(n)"},
        "idea": (
            "<code>tails[k]</code> is the smallest possible tail of an increasing subsequence of "
            "length <code>k+1</code>. It is strictly increasing, so it is binary-searchable &mdash; "
            "and lowering a tail never hurts, because a smaller tail admits at least as many future "
            "extensions."
        ),
        "takeaway": (
            "Answer 4, the subsequence <code>2, 3, 7, 18</code>. Note what <code>tails</code> is "
            "<em>not</em>: it is not itself an LIS &mdash; it ends as "
            "<code>[2, 3, 7, 18]</code> here only by coincidence. It is a set of best-possible tails, "
            "so if the problem asks for the actual subsequence you must record predecessor indices "
            "separately. Swapping to <code>bisect_right</code> makes it non-decreasing: one character, "
            "two problems."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "stacks": [{"name": "tails", "label": "tails", "hint": "smallest tail per length"}],
            "scalars": ["x", "lo", "hi", "mid"],
        },
    },
]

TOPIC = {
    "id": "dp-1d",
    "number": "13",
    "title": "1-D Dynamic Programming",
    "subtitle": "State design over one index, recurrence proofs, loop order, rolling-variable space",
}
