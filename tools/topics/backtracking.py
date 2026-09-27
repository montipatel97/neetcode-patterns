"""Topic 10 -- Backtracking."""

SUBSETS = '''
def subsets(nums):
    out, path = [], []

    def dfs(start):
        out.append(path[:])            # SNAPSHOT, not the live list
        for i in range(start, len(nums)):
            path.append(nums[i])       # choose
            dfs(i + 1)                 # explore -- i+1 forbids reuse
            path.pop()                 # un-choose

    dfs(0)
    return out
'''

COMBINATION_SUM = '''
def combination_sum(candidates, target):
    candidates.sort()                  # enables the early break
    out, path = [], []

    def dfs(start, rem):
        if rem == 0:
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > rem:
                break                  # sorted: so are all later ones
            path.append(candidates[i])
            dfs(i, rem - candidates[i])    # SAME i: reuse allowed
            path.pop()

    dfs(0, target)
    return out
'''

PERMUTATIONS = '''
def permute(nums):
    out, path = [], []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):     # from 0: order matters
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            dfs()
            path.pop()                 # undo BOTH,
            used[i] = False            # after the call

    dfs()
    return out
'''

EXAMPLES = [
    {
        "id": "subsets",
        "title": "Subsets",
        "lc": "LC 78",
        "level": "Medium",
        "mechanism": "Shape 1 -- include / exclude, recurse with i + 1",
        "func": "subsets",
        "code": SUBSETS,
        "args": ([1, 2, 3],),
        "watch": ["nums", "out", "path", "start", "i"],
        "inputLabel": "nums = [1, 2, 3]",
        "complexity": {"time": "O(n &middot; 2^n)", "space": "O(n) + output"},
        "idea": (
            "<code>start</code> is what makes this combinations rather than permutations: passing "
            "<code>i + 1</code> forbids revisiting earlier elements, so each subset is generated "
            "exactly once in index order."
        ),
        "takeaway": (
            "All 8 subsets. Note the recording position: <em>every</em> node records, not only leaves, "
            "because every prefix is itself a valid subset. Watch <code>path</code> grow and shrink &mdash; "
            "it is one mutable list shared by the whole recursion, which is exactly why "
            "<code>path[:]</code> and not <code>path</code> goes into the output."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "pointers": [{"name": "i", "target": "nums", "label": "i"}],
            "stacks": [{"name": "path", "label": "path", "hint": "the current partial candidate"}],
            "scalars": ["start", "i", "out"],
        },
    },
    {
        "id": "combination-sum",
        "title": "Combination Sum",
        "lc": "LC 39",
        "level": "Medium",
        "mechanism": "Shape 3 -- reuse allowed, recurse with i",
        "func": "combination_sum",
        "code": COMBINATION_SUM,
        "args": ([2, 3, 6, 7], 7),
        "watch": ["candidates", "target", "out", "path", "start", "rem", "i"],
        "inputLabel": "candidates = [2, 3, 6, 7], target = 7",
        "complexity": {"time": "O(n^(T/min))", "space": "O(T/min)"},
        "idea": (
            "Recursing with <code>i</code> rather than <code>i + 1</code> is the entire difference "
            "between this and Subsets. The sorted early <code>break</code> is a sound prune only "
            "because every candidate is positive."
        ),
        "takeaway": (
            "Output <code>[[2, 2, 3], [7]]</code>. Watch <code>rem</code> fall and the "
            "<code>break</code> fire: once a sorted candidate exceeds the remaining budget, so do all "
            "later ones, so the whole tail of the loop is provably empty of solutions. With a negative "
            "candidate in the list that prune becomes unsound and the recursion may not terminate."
        ),
        "view": {
            "arrays": [{"name": "candidates", "label": "candidates", "static": True}],
            "pointers": [{"name": "i", "target": "candidates", "label": "i"}],
            "stacks": [{"name": "path", "label": "path", "hint": "the current partial candidate"}],
            "scalars": ["start", "rem", "i", "out"],
        },
    },
    {
        "id": "permutations",
        "title": "Permutations",
        "lc": "LC 46",
        "level": "Medium",
        "mechanism": "Shape 2 -- any unused element, loop from 0",
        "func": "permute",
        "code": PERMUTATIONS,
        "args": ([1, 2, 3],),
        "watch": ["nums", "out", "path", "used", "i"],
        "inputLabel": "nums = [1, 2, 3]",
        "complexity": {"time": "O(n &middot; n!)", "space": "O(n) + output"},
        "idea": (
            "Looping from 0 with a <code>used</code> set allows any order, so all n! arrangements "
            "appear. The <code>used</code> array must describe <em>exactly</em> the decisions "
            "currently in <code>path</code> &mdash; no more, no less."
        ),
        "takeaway": (
            "All 6 permutations. Watch <code>used</code> and <code>path</code> move in lockstep: both "
            "undos sit <em>after</em> the recursive call and outside any conditional. Undo either one "
            "in the wrong place and the next sibling inherits a decision that was supposed to have been "
            "retracted."
        ),
        "view": {
            "arrays": [
                {"name": "nums", "label": "nums", "static": True},
                {"name": "used", "label": "used", "highlightWrites": True},
            ],
            "pointers": [{"name": "i", "target": "nums", "label": "i"}],
            "stacks": [{"name": "path", "label": "path", "hint": "the current partial candidate"}],
            "scalars": ["i", "out"],
        },
    },
]

TOPIC = {
    "id": "backtracking",
    "number": "10",
    "title": "Backtracking",
    "subtitle": "Choose / explore / un-choose, decision-tree shapes, de-duplication and pruning",
}
