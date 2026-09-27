"""Topic 04 -- Stack."""

VALID_PARENS = '''
def is_valid(s):
    pairs = {')': '(', ']': '[', '}': '{'}
    st = []
    for ch in s:
        if ch in pairs:                # a closer
            if not st or st.pop() != pairs[ch]:
                return False           # empty check FIRST
        else:
            st.append(ch)
    return not st                      # leftovers = unmatched
'''

DAILY_TEMPS = '''
def daily_temperatures(t):
    res = [0] * len(t)                 # unresolved keep 0
    st = []                            # indices, decreasing
    for i, x in enumerate(t):
        while st and t[st[-1]] < x:
            j = st.pop()
            res[j] = i - j             # one pop, one answer
        st.append(i)
    return res
'''

LARGEST_RECT = '''
def largest_rectangle_area(h):
    hh = h + [0]                       # sentinel flushes stack
    st, best = [], 0
    for i, x in enumerate(hh):
        while st and hh[st[-1]] >= x:
            top = st.pop()
            left = st[-1] if st else -1
            best = max(best, hh[top] * (i - left - 1))
        st.append(i)
    return best
'''

EXAMPLES = [
    {
        "id": "valid-parentheses",
        "title": "Valid Parentheses",
        "lc": "LC 20",
        "level": "Easy",
        "mechanism": "Mechanism A -- matching and nesting",
        "func": "is_valid",
        "code": VALID_PARENS,
        "args": ("{[()]}",),
        "watch": ["s", "pairs", "st", "ch"],
        "inputLabel": 's = "{[()]}"',
        "complexity": {"time": "O(n)", "space": "O(n)"},
        "idea": (
            "By the no-crossing argument the only candidate partner for a closer is the "
            "innermost unmatched opener, so greedily matching the top of the stack loses "
            "nothing. There is never a choice to make."
        ),
        "takeaway": (
            "The stack depth traces the nesting depth exactly: it rises to 3 at the innermost "
            "<code>(</code>, then unwinds in mirror order. The final <code>return not st</code> is "
            "what rejects <code>\"((\"</code> &mdash; without it an unbalanced string is silently accepted."
        ),
        "view": {
            "stacks": [{"name": "st", "label": "st", "hint": "unmatched openers, innermost on the right"}],
            "scalars": ["ch"],
        },
    },
    {
        "id": "daily-temperatures",
        "title": "Daily Temperatures",
        "lc": "LC 739",
        "level": "Medium",
        "mechanism": "Mechanism B -- monotonic stack",
        "func": "daily_temperatures",
        "code": DAILY_TEMPS,
        "args": ([73, 74, 75, 71, 69, 72, 76, 73],),
        "watch": ["t", "res", "st", "i", "x", "j"],
        "inputLabel": "t = [73, 74, 75, 71, 69, 72, 76, 73]",
        "complexity": {"time": "O(n)", "space": "O(n)"},
        "idea": (
            "The stack is sorted by position <em>and</em> by value at the same time. That double "
            "ordering is what lets a single pop answer a single query, with no search."
        ),
        "takeaway": (
            "Output <code>[1, 1, 4, 2, 1, 1, 0, 0]</code>. Indices 6 and 7 are never popped, so their "
            "answers stay 0 &mdash; correct, since no later day is warmer. Watch the step where 72 "
            "arrives: index 3 (71) waited past index 4 (69) precisely because 69 could not resolve "
            "it, and 72 resolves both at once in decreasing-index order."
        ),
        "view": {
            "arrays": [
                {"name": "t", "label": "t", "static": True},
                {"name": "res", "label": "res", "highlightWrites": True},
            ],
            "pointers": [{"name": "i", "target": "t", "label": "i"}],
            "stacks": [{"name": "st", "label": "st", "hint": "indices; values non-increasing"}],
            "scalars": ["i", "x", "j"],
        },
    },
    {
        "id": "largest-rectangle",
        "title": "Largest Rectangle in Histogram",
        "lc": "LC 84",
        "level": "Hard",
        "mechanism": "Mechanism B with both boundaries in one pass",
        "func": "largest_rectangle_area",
        "code": LARGEST_RECT,
        "args": ([2, 1, 5, 6, 2, 3],),
        "watch": ["h", "hh", "st", "best", "i", "x", "top", "left"],
        "inputLabel": "h = [2, 1, 5, 6, 2, 3]",
        "complexity": {"time": "O(n)", "space": "O(n)"},
        "idea": (
            "Every maximal rectangle is characterised by its limiting bar, widened until it meets "
            "something shorter. The element <em>below</em> the popped index gives "
            "<code>prevSmaller</code>; the index <em>causing</em> the pop gives <code>nextSmaller</code>."
        ),
        "takeaway": (
            "Output 10, the 5&times;2 block spanning bars 5 and 6. The appended sentinel 0 is what "
            "flushes survivors at the end &mdash; without it a strictly increasing histogram never "
            "pops anything and returns 0."
        ),
        "view": {
            "arrays": [{"name": "hh", "label": "hh", "static": True, "hint": "input plus a sentinel 0"}],
            "pointers": [{"name": "i", "target": "hh", "label": "i"}],
            "stacks": [{"name": "st", "label": "st", "hint": "indices; heights non-decreasing"}],
            "scalars": ["x", "top", "left", "best"],
        },
    },
]

TOPIC = {
    "id": "stack",
    "number": "04",
    "title": "Stack",
    "subtitle": "Nesting and matching, monotonic stacks, deferred computation, explicit recursion",
}
