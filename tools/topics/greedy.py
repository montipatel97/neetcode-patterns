"""Topic 15 -- Greedy."""

JUMP_GAME = '''
def can_jump(nums):
    reach = 0
    for i, x in enumerate(nums):
        if i > reach:
            return False          # CHECK before updating
        reach = max(reach, i + x)
    return True
'''

GAS_STATION = '''
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1                 # global feasibility, proved separately
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:              # no start in [start, i] can work
            start = i + 1
            tank = 0
    return start
'''

PARTITION_LABELS = '''
def partition_labels(s):
    last = {}
    for i, ch in enumerate(s):
        last[ch] = i              # last occurrence of each letter
    out, start, end = [], 0, 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])  # extend to cover this letter
        if i == end:              # nothing inside reaches beyond i
            out.append(i - start + 1)
            start = i + 1
    return out
'''

EXAMPLES = [
    {
        "id": "jump-game",
        "title": "Jump Game",
        "lc": "LC 55",
        "level": "Medium",
        "mechanism": "Mechanism A -- frontier scan, proved by staying ahead",
        "func": "can_jump",
        "code": JUMP_GAME,
        "args": ([2, 3, 1, 1, 4],),
        "watch": ["nums", "reach", "i", "x"],
        "inputLabel": "nums = [2, 3, 1, 1, 4]",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "<code>reach</code> is built <em>only</em> from indices you can actually stand on. That "
            "single integer dominates every strategy&rsquo;s reachable set &mdash; the collapse from "
            "exponentially many paths to one number is the whole algorithm."
        ),
        "takeaway": (
            "Returns <code>True</code>. The order of the two statements is the correctness condition: "
            "reading <code>nums[i]</code> before proving i is reachable imports information from an "
            "unreachable cell. On <code>[0, 1]</code> the wrong order returns True, because it uses a "
            "jump from index 1 that you can never legally stand on."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "pointers": [{"name": "i", "target": "nums", "label": "i"},
                         {"name": "reach", "target": "nums", "label": "reach"}],
            "scalars": ["i", "x", "reach"],
        },
    },
    {
        "id": "gas-station",
        "title": "Gas Station",
        "lc": "LC 134",
        "level": "Medium",
        "mechanism": "Mechanism B -- running deficit with a reset",
        "func": "can_complete_circuit",
        "code": GAS_STATION,
        "args": ([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]),
        "watch": ["gas", "cost", "tank", "start", "i"],
        "inputLabel": "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "The reset lemma proves <em>&ldquo;if a valid start exists, it is this one&rdquo;</em>. "
            "Existence is a separate claim, and the sum test is its proof &mdash; the two halves are "
            "not interchangeable."
        ),
        "takeaway": (
            "Answer 3. Differences are <code>[-2, -2, -2, 3, 3]</code>, summing to 0, so a start "
            "exists. Watch <code>tank</code> go negative and <code>start</code> jump past everything "
            "in between: by the lemma, no index in the failed window can be a valid start either, "
            "which is why one pass replaces n simulations."
        ),
        "view": {
            "arrays": [{"name": "gas", "label": "gas", "static": True},
                       {"name": "cost", "label": "cost", "static": True}],
            "pointers": [{"name": "i", "target": "gas", "label": "i"},
                         {"name": "start", "target": "gas", "label": "start"}],
            "scalars": ["i", "tank", "start"],
        },
    },
    {
        "id": "partition-labels",
        "title": "Partition Labels",
        "lc": "LC 763",
        "level": "Medium",
        "mechanism": "Extend to the last occurrence, then cut",
        "func": "partition_labels",
        "code": PARTITION_LABELS,
        "args": ("ababcbacadefegdehijhklij",),
        "watch": ["s", "last", "out", "start", "end", "i", "ch"],
        "inputLabel": 's = "ababcbacadefegdehijhklij"',
        "complexity": {"time": "O(n)", "space": "O(alphabet)"},
        "idea": (
            "A cut at i is legal exactly when no letter seen so far reappears after i. Tracking the "
            "running maximum last-occurrence turns that condition into a single comparison."
        ),
        "takeaway": (
            "Output <code>[9, 7, 8]</code>. The exchange argument: cutting at the <em>first</em> legal "
            "point is never worse, because any later cut yields the same suffix problem with a larger "
            "first piece. Watch <code>end</code> stretch as new letters arrive, then the cut fire the "
            "moment <code>i == end</code>."
        ),
        "view": {
            "maps": [{"name": "last", "label": "last", "caption": "letter → last index", "lookup": "ch"}],
            "scalars": ["i", "ch", "start", "end", "out"],
        },
    },
]

TOPIC = {
    "id": "greedy",
    "number": "15",
    "title": "Greedy",
    "subtitle": "Local choices with global proofs: exchange arguments, staying ahead, frontier scans",
}
