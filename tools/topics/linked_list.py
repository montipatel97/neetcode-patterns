"""Topic 06 -- Linked List."""
import common

REVERSE = '''
def reverse_list(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next        # 1. SAVE the rest
        cur.next = prev       # 2. rewire
        prev = cur            # 3. advance the boundary
        cur = nxt             # 4. advance the scan
    return prev               # prev is the new head
'''

REMOVE_NTH = '''
def remove_nth_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):    # gap of n+1
        fast = fast.next
    while fast:               # slow stops BEFORE the victim
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next
'''

DETECT_CYCLE = '''
def detect_cycle(head):
    slow = fast = head
    while fast and fast.next:        # phase 1: meeting point
        slow = slow.next
        fast = fast.next.next
        if slow is fast:             # identity, AFTER moving
            break
    else:
        return None                  # fell off the end: no cycle
    p = head                         # phase 2: m = kL - x
    while p is not slow:             # both at speed 1
        p = p.next
        slow = slow.next
    return p
'''


def _reverse_args():
    head, _ = common.make_list([1, 2, 3, 4])
    return (head,)


def _remove_args():
    head, _ = common.make_list([1, 2, 3, 4, 5])
    return (head, 2)


def _cycle_args():
    head, _ = common.make_list([1, 2, 3, 4, 5, 6])
    node = head
    nodes = []
    while node:
        nodes.append(node)
        node = node.next
    nodes[5].next = nodes[2]         # 6 points back to 3: m=2, L=4
    return (head,)


EXAMPLES = [
    {
        "id": "reverse-list",
        "title": "Reverse Linked List",
        "lc": "LC 206",
        "level": "Easy",
        "mechanism": "Mechanism A -- three-pointer reversal",
        "func": "reverse_list",
        "code": REVERSE,
        "prelude": common.LIST_PRELUDE,
        "args": _reverse_args(),
        "watch": ["head", "prev", "cur", "nxt"],
        "spine": "linked",
        "inputLabel": "1 → 2 → 3 → 4 → None",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "The list is always partitioned into exactly two intact chains: <code>prev</code> "
            "heads the reversed prefix, <code>cur</code> heads the untouched suffix. The four "
            "statements must run in that order, because the rewire destroys the only reference "
            "to the suffix."
        ),
        "takeaway": (
            "Nodes hold their positions; only the arrows move. Watch them flip one at a time from "
            "forward (teal) to backward (dashed amber) &mdash; that is the reversed prefix growing. "
            "Every step has exactly four nodes across the two chains, which is the conservation "
            "argument made visible."
        ),
        "view": {
            "linked": {"label": "nodes", "refs": ["head", "prev", "cur", "nxt"]},
            "scalars": ["prev", "cur", "nxt"],
        },
    },
    {
        "id": "remove-nth-from-end",
        "title": "Remove N-th Node From End",
        "lc": "LC 19",
        "level": "Medium",
        "mechanism": "Mechanism B + C -- dummy head and a fixed gap",
        "func": "remove_nth_from_end",
        "code": REMOVE_NTH,
        "prelude": common.LIST_PRELUDE,
        "args": _remove_args(),
        "watch": ["head", "n", "dummy", "fast", "slow"],
        "spine": "linked",
        "inputLabel": "1 → 2 → 3 → 4 → 5, n = 2",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "<code>fast</code> is always exactly <code>n + 1</code> nodes ahead of <code>slow</code>. "
            "When fast falls off the end, slow sits immediately <em>before</em> the victim &mdash; "
            "which is the only position from which you can unlink it."
        ),
        "takeaway": (
            "Output <code>1 → 2 → 3 → 5</code>. The gap of <code>n + 1 = 3</code> is what puts "
            "slow on node 3, the predecessor of the victim; a gap of n would leave it <em>on</em> the "
            "victim, with no way back. The dummy node at the front is what would let the real head "
            "be deleted without a special case."
        ),
        "view": {
            "linked": {"label": "nodes", "refs": ["dummy", "slow", "fast", "head"]},
            "scalars": ["n", "slow", "fast"],
        },
    },
    {
        "id": "detect-cycle",
        "title": "Linked List Cycle II — find the entry",
        "lc": "LC 142",
        "level": "Medium",
        "mechanism": "Floyd, both phases",
        "func": "detect_cycle",
        "code": DETECT_CYCLE,
        "prelude": common.LIST_PRELUDE,
        "args": _cycle_args(),
        "watch": ["head", "slow", "fast", "p"],
        "spine": "linked",
        "inputLabel": "1 → 2 → 3 → 4 → 5 → 6 → back to 3  (m = 2, L = 4)",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "Phase 1 finds <em>a</em> meeting point; phase 2 converts it into <em>the</em> entry "
            "using <code>m = kL - x</code>. That identity is why the second phase runs both "
            "pointers at speed 1."
        ),
        "takeaway": (
            "Output: node 3, the cycle entry. The backward arrow from 6 to 3 is the cycle. Phase 2 "
            "takes exactly <code>m = 2</code> steps, as the algebra predicts. Had the entry been the "
            "head (<code>m = 0</code>), the <code>while p is not slow</code> loop would exit before "
            "its first iteration &mdash; which is why the test sits at the top of the loop."
        ),
        "view": {
            "linked": {"label": "nodes", "refs": ["slow", "fast", "p", "head"]},
            "scalars": ["slow", "fast", "p"],
        },
    },
]

TOPIC = {
    "id": "linked-list",
    "number": "06",
    "title": "Linked List",
    "subtitle": "Pointer rewiring with dummy heads, fast/slow pointers, Floyd cycle algebra",
}
