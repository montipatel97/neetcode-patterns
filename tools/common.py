"""Shared helpers for topic build scripts."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, "..", "data", "topics"))

# Node classes injected before each traced solution that needs them, so the
# solution source on screen stays free of boilerplate.
LIST_PRELUDE = """
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
"""

TREE_PRELUDE = """
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
"""


def make_list(values):
    """Build a linked list, returning its head."""
    ns = {}
    exec(LIST_PRELUDE, ns)
    ListNode = ns["ListNode"]
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head, ListNode


def make_tree(level_order):
    """Build a binary tree from a LeetCode-style level-order list with None
    holes, returning its root."""
    ns = {}
    exec(TREE_PRELUDE, ns)
    TreeNode = ns["TreeNode"]
    if not level_order or level_order[0] is None:
        return None, TreeNode
    root = TreeNode(level_order[0])
    queue = [root]
    i = 1
    while queue and i < len(level_order):
        node = queue.pop(0)
        if i < len(level_order):
            v = level_order[i]; i += 1
            if v is not None:
                node.left = TreeNode(v)
                queue.append(node.left)
        if i < len(level_order):
            v = level_order[i]; i += 1
            if v is not None:
                node.right = TreeNode(v)
                queue.append(node.right)
    return root, TreeNode


def out_path(topic_id):
    return os.path.join(DATA, topic_id + ".traces.js")
