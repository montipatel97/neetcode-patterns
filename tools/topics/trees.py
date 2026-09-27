"""Topic 07 -- Trees."""
import common

DIAMETER = '''
def diameter(root):
    best = 0

    def height(node):          # returns EDGE-height of subtree
        nonlocal best
        if not node:
            return 0
        lh = height(node.left)
        rh = height(node.right)
        best = max(best, lh + rh)      # record the through-path
        return 1 + max(lh, rh)         # return the extendable one

    height(root)
    return best
'''

VALID_BST = '''
def is_valid_bst(root):
    def ok(node, lo, hi):      # key must satisfy lo < key < hi
        if not node:
            return True
        if not (lo < node.val < hi):
            return False
        return (ok(node.left, lo, node.val) and
                ok(node.right, node.val, hi))

    return ok(root, float('-inf'), float('inf'))
'''

LEVEL_ORDER = '''
def level_order(root):
    if not root:
        return []
    out, q = [], [root]
    while q:
        n = len(q)             # SNAPSHOT this level's width
        level = []
        for _ in range(n):     # consume exactly this level
            node = q.pop(0)
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out
'''


def _diameter_args():
    root, _ = common.make_tree([1, 2, 3, 4, 5])
    return (root,)


def _bst_args():
    # 5(1, 6(3, 7)) -- every parent/child pair is fine, the tree is not a BST
    root, _ = common.make_tree([5, 1, 6, None, None, 3, 7])
    return (root,)


def _level_args():
    root, _ = common.make_tree([3, 9, 20, None, None, 15, 7])
    return (root,)


EXAMPLES = [
    {
        "id": "diameter",
        "title": "Diameter of Binary Tree",
        "lc": "LC 543",
        "level": "Easy",
        "mechanism": "Mechanism A -- postorder aggregation",
        "func": "diameter",
        "code": DIAMETER,
        "prelude": common.TREE_PRELUDE,
        "args": _diameter_args(),
        "watch": ["root", "node", "lh", "rh", "best"],
        "spine": "tree",
        "inputLabel": "1(2(4, 5), 3)",
        "complexity": {"time": "O(n)", "space": "O(h)"},
        "idea": (
            "One recursion, two different quantities: the parent needs a <em>height</em>, the "
            "answer is a <em>path</em>. Record the through-path, return the extendable one. "
            "Conflating them is the bug."
        ),
        "takeaway": (
            "Answer 3, the path 4 &rarr; 2 &rarr; 1 &rarr; 3. Every path has a unique apex, and the "
            "algorithm evaluates <code>lh + rh</code> exactly once per node &mdash; so taking the "
            "maximum enumerates the optimum over every possible apex. Watch <code>node</code> walk "
            "the tree bottom-up: leaves resolve first, and the root is visited last."
        ),
        "view": {
            "tree": {"label": "tree", "refs": ["node", "root"], "hint": "postorder: children before parent"},
            "scalars": ["node", "lh", "rh", "best"],
        },
    },
    {
        "id": "validate-bst",
        "title": "Validate Binary Search Tree",
        "lc": "LC 98",
        "level": "Medium",
        "mechanism": "Mechanism B -- preorder with a pushed-down range",
        "func": "is_valid_bst",
        "code": VALID_BST,
        "prelude": common.TREE_PRELUDE,
        "args": _bst_args(),
        "watch": ["root", "node", "lo", "hi"],
        "spine": "tree",
        "inputLabel": "5(1, 6(3, 7))  — a deliberate near-miss",
        "complexity": {"time": "O(n)", "space": "O(h)"},
        "idea": (
            "The BST property is <strong>global, not parent-local</strong>. Descending left "
            "tightens the upper bound to the parent key; descending right tightens the lower "
            "bound. The interval only ever narrows."
        ),
        "takeaway": (
            "Returns <code>False</code>. Every parent/child pair here is individually consistent "
            "(<code>1 &lt; 5</code>, <code>6 &gt; 5</code>, <code>3 &lt; 6</code>, <code>7 &gt; 6</code>), "
            "yet 3 sits in the right subtree of 5. Watch <code>lo</code> and <code>hi</code>: the check "
            "fails at node 3 with <code>lo = 5</code>, because the ancestor constraint travelled down "
            "with it."
        ),
        "view": {
            "tree": {"label": "tree", "refs": ["node", "root"], "hint": "preorder: bounds pushed down"},
            "scalars": ["node", "lo", "hi"],
        },
    },
    {
        "id": "level-order",
        "title": "Binary Tree Level Order Traversal",
        "lc": "LC 102",
        "level": "Medium",
        "mechanism": "Mechanism C -- BFS with a level snapshot",
        "func": "level_order",
        "code": LEVEL_ORDER,
        "prelude": common.TREE_PRELUDE,
        "args": _level_args(),
        "watch": ["root", "q", "out", "level", "node", "n"],
        "spine": "tree",
        "inputLabel": "3(9, 20(15, 7))",
        "complexity": {"time": "O(n)", "space": "O(w)"},
        "idea": (
            "Capturing <code>len(q)</code> <em>before</em> the inner loop is what keeps the levels "
            "apart. Without the snapshot, the inner loop consumes children of the very level it is "
            "producing and the levels smear together."
        ),
        "takeaway": (
            "Output <code>[[3], [9, 20], [15, 7]]</code>. The second pass is where the snapshot earns "
            "its keep: <code>n</code> is read as 2 while the loop body pushes two more nodes, so the "
            "inner loop still stops after consuming exactly 9 and 20. Three variants fall straight "
            "out of this skeleton &mdash; <code>level[-1]</code> for the right side view, "
            "<code>max(level)</code> for largest-per-level, and reversing on alternating passes for zigzag."
        ),
        "view": {
            "tree": {"label": "tree", "refs": ["node", "root"], "hint": "BFS: level by level"},
            "deques": [{"name": "q", "label": "q", "hint": "front ← … → back"}],
            "scalars": ["n", "node", "level", "out"],
        },
    },
]

TOPIC = {
    "id": "trees",
    "number": "07",
    "title": "Trees",
    "subtitle": "Traversal orders as tools, postorder aggregation, range invariants, BFS by level",
}
