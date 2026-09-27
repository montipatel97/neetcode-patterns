"""Topic 16 -- Intervals."""

MERGE = '''
def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])        # by START
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:             # overlaps the LAST block
            out[-1][1] = max(out[-1][1], e)     # max, not e: containment
        else:
            out.append([s, e])
    return out
'''

ERASE_OVERLAP = '''
def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda iv: iv[1])        # by END
    kept, last_end = 0, float('-inf')
    for s, e in intervals:
        if s >= last_end:                       # compatible with all kept
            kept += 1
            last_end = e
    return len(intervals) - kept
'''

MIN_ROOMS = '''
def min_rooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)
    rooms = best = 0
    j = 0
    for s in starts:
        while ends[j] <= s:        # <= : ending at s frees the room
            j += 1
            rooms -= 1
        rooms += 1
        best = max(best, rooms)
    return best
'''

EXAMPLES = [
    {
        "id": "merge-intervals",
        "title": "Merge Intervals",
        "lc": "LC 56",
        "level": "Medium",
        "mechanism": "Mechanism A -- sort by start, compare against the last block",
        "func": "merge",
        "code": MERGE,
        "args": ([[1, 3], [2, 6], [8, 10], [15, 18]],),
        "watch": ["intervals", "out", "s", "e"],
        "inputLabel": "intervals = [[1,3], [2,6], [8,10], [15,18]]",
        "complexity": {"time": "O(n log n)", "space": "O(n) output"},
        "idea": (
            "With the input sorted by start, an incoming interval can only overlap the <em>last</em> "
            "block in the output &mdash; proved by the fact that the blocks&rsquo; ends are increasing. "
            "That lemma is why merging is O(n log n) rather than O(n&sup2;)."
        ),
        "takeaway": (
            "Output <code>[[1, 6], [8, 10], [15, 18]]</code>. The <code>max</code> in the update is "
            "load-bearing: sorting by start says nothing about ends, so a later interval can finish "
            "<em>earlier</em>. On <code>[[1,10],[2,3]]</code> a plain assignment would shrink the block "
            "to <code>[1,3]</code>, silently truncating the union."
        ),
        "view": {
            "stacks": [{"name": "out", "label": "out", "hint": "disjoint blocks, sorted by start"}],
            "scalars": ["s", "e"],
        },
    },
    {
        "id": "erase-overlap",
        "title": "Non-overlapping Intervals",
        "lc": "LC 435",
        "level": "Medium",
        "mechanism": "Mechanism B -- sort by end, activity selection",
        "func": "erase_overlap_intervals",
        "code": ERASE_OVERLAP,
        "args": ([[0, 10], [1, 2], [3, 4]],),
        "watch": ["intervals", "kept", "last_end", "s", "e"],
        "inputLabel": "intervals = [[0,10], [1,2], [3,4]]",
        "complexity": {"time": "O(n log n)", "space": "O(1)"},
        "idea": (
            "Keeping the earliest-<em>finishing</em> compatible interval leaves the largest possible "
            "remaining time, which is the staying-ahead measure. Nothing analogous holds for starting "
            "early."
        ),
        "takeaway": (
            "Answer 1 removal &mdash; keep <code>[1,2]</code> and <code>[3,4]</code>, drop "
            "<code>[0,10]</code>. This input <em>is</em> the counter-example for sorting by start: start "
            "order picks <code>[0,10]</code> first and then nothing else, reporting 2 removals. One "
            "character of difference in the sort key, and the greedy loses its proof."
        ),
        "view": {
            "scalars": ["s", "e", "kept", "last_end"],
        },
    },
    {
        "id": "min-rooms",
        "title": "Meeting Rooms II — sweep line",
        "lc": "LC 253",
        "level": "Medium",
        "mechanism": "Mechanism C -- concurrency by sweeping two sorted arrays",
        "func": "min_rooms",
        "code": MIN_ROOMS,
        "args": ([[0, 30], [5, 10], [15, 20]],),
        "watch": ["intervals", "starts", "ends", "rooms", "best", "j", "s"],
        "inputLabel": "intervals = [[0,30], [5,10], [15,20]]",
        "complexity": {"time": "O(n log n)", "space": "O(n)"},
        "idea": (
            "The number of intervals containing a point t is <code>(starts &le; t) - (ends &le; t)</code>, "
            "which is the prefix sum of +1/-1 events. The maximum is attained at some start, so "
            "sweeping the starts visits every candidate."
        ),
        "takeaway": (
            "Answer 2. The <code>&le;</code> in <code>ends[j] &le; s</code> is the tie convention: "
            "half-open meetings <code>[0,10)</code> and <code>[10,20)</code> do not conflict, so an end "
            "equal to a start frees the room first. Flip it to <code>&lt;</code> for closed intervals "
            "(balloons) &mdash; getting it backwards changes the answer by exactly one room on touching "
            "inputs."
        ),
        "view": {
            "arrays": [{"name": "starts", "label": "starts", "static": True},
                       {"name": "ends", "label": "ends", "static": True}],
            "pointers": [{"name": "j", "target": "ends", "label": "j"}],
            "scalars": ["s", "j", "rooms", "best"],
        },
    },
]

TOPIC = {
    "id": "intervals",
    "number": "16",
    "title": "Intervals",
    "subtitle": "Sort by start to merge, sort by end to count, sweep lines and heaps for concurrency",
}
