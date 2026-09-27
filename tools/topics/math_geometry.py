"""Topic 17 -- Math and Geometry."""

ROTATE = '''
def rotate(m):
    n = len(m)
    for i in range(n):                    # transpose: reflect the diagonal
        for j in range(i + 1, n):         # j > i ONLY, or you swap back
            m[i][j], m[j][i] = m[j][i], m[i][j]
    for row in m:
        row.reverse()                     # then mirror horizontally
    return m
'''

SPIRAL = '''
def spiral_order(m):
    if not m or not m[0]:
        return []
    top, bottom = 0, len(m) - 1
    left, right = 0, len(m[0]) - 1
    out = []
    while top <= bottom and left <= right:
        for c in range(left, right + 1):        # top row
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):        # right column
            out.append(m[r][right])
        right -= 1
        if top <= bottom:                       # GUARD: rows exhausted?
            for c in range(right, left - 1, -1):
                out.append(m[bottom][c])
            bottom -= 1
        if left <= right:                       # GUARD: cols exhausted?
            for r in range(bottom, top - 1, -1):
                out.append(m[r][left])
            left += 1
    return out
'''

MY_POW = '''
def my_pow(x, n):
    if n < 0:
        x, n = 1 / x, -n       # normalise the sign FIRST
    res = 1.0
    while n:
        if n & 1:              # this bit is set
            res *= x
        x *= x                 # x^(2^k) for the next bit
        n >>= 1
    return res
'''

EXAMPLES = [
    {
        "id": "rotate-image",
        "title": "Rotate Image",
        "lc": "LC 48",
        "level": "Medium",
        "mechanism": "Mechanism A -- rotation as two involutions",
        "func": "rotate",
        "code": ROTATE,
        "args": ([[1, 2, 3], [4, 5, 6], [7, 8, 9]],),
        "watch": ["m", "n", "i", "j", "row"],
        "inputLabel": "m = [[1,2,3], [4,5,6], [7,8,9]]",
        "complexity": {"time": "O(n&sup2;)", "space": "O(1)"},
        "idea": (
            "Transpose sends <code>(i, j) &rarr; (j, i)</code>; horizontal mirroring sends "
            "<code>(i, j) &rarr; (i, n-1-j)</code>. Composing gives <code>(i, j) &rarr; (j, n-1-i)</code>, "
            "which <em>is</em> a clockwise quarter turn &mdash; no case analysis, no temporary matrix."
        ),
        "takeaway": (
            "Watch the transpose sweep only the strict upper triangle. A reflection is an involution, "
            "so covering the full square swaps every pair twice and returns the matrix unchanged &mdash; "
            "the rotation would collapse into just reversing rows. Note this works only for a "
            "<em>square</em> matrix; a rectangular one changes shape and must be reallocated."
        ),
        "view": {
            "grids": [{"name": "m", "label": "m", "row": "i", "col": "j",
                       "hint": "mutated in place"}],
            "scalars": ["i", "j", "n"],
        },
    },
    {
        "id": "spiral-matrix",
        "title": "Spiral Matrix",
        "lc": "LC 54",
        "level": "Medium",
        "mechanism": "Mechanism B -- four shrinking boundaries",
        "func": "spiral_order",
        "code": SPIRAL,
        "args": ([[1, 2, 3], [4, 5, 6], [7, 8, 9]],),
        "watch": ["m", "top", "bottom", "left", "right", "out", "r", "c"],
        "inputLabel": "m = [[1,2,3], [4,5,6], [7,8,9]]",
        "complexity": {"time": "O(n&middot;m)", "space": "O(1) aux"},
        "idea": (
            "The four boundaries always delimit the not-yet-emitted submatrix, and each pass emits "
            "one full edge then retires it. The <code>while</code> condition is checked once per lap, "
            "but the region can go degenerate <em>mid-lap</em> &mdash; hence the two inner guards."
        ),
        "takeaway": (
            "Output <code>[1, 2, 3, 6, 9, 8, 7, 4, 5]</code>. The guards are what a single-row matrix "
            "exposes: on <code>[[1,2,3]]</code> the unguarded version emits 1, 2, 3 and then re-emits "
            "2, 1 on the way back. Watch the four boundaries close in on the centre."
        ),
        "view": {
            "grids": [{"name": "m", "label": "m", "row": "r", "col": "c", "hint": "read-only here"}],
            "scalars": ["top", "bottom", "left", "right", "r", "c", "out"],
        },
    },
    {
        "id": "fast-pow",
        "title": "Pow(x, n) by fast exponentiation",
        "lc": "LC 50",
        "level": "Medium",
        "mechanism": "Binary expansion of the exponent",
        "func": "my_pow",
        "code": MY_POW,
        "args": (2.0, 10),
        "watch": ["x", "n", "res"],
        "inputLabel": "x = 2.0, n = 10  (binary 1010)",
        "complexity": {"time": "O(log n)", "space": "O(1)"},
        "idea": (
            "Write n in binary: <code>x^n</code> is the product of <code>x^(2^k)</code> over the set "
            "bits. The loop squares x once per bit position and multiplies into the accumulator "
            "exactly when that bit is set."
        ),
        "takeaway": (
            "Output 1024.0. The accumulator takes in <code>x&sup2; = 4</code> and <code>x&#8312; = 256</code> "
            "&mdash; precisely the set bits of <code>1010</code>, so <code>2^10 = 2^2 &middot; 2^8</code>. "
            "Four iterations for n = 10, matching <code>floor(log2 10) + 1</code>. The negative case is "
            "the edge that breaks naive code: without the normalisation, <code>-1 &gt;&gt; 1 == -1</code> "
            "in Python and the loop never terminates."
        ),
        "view": {
            "bits": [{"name": "n", "label": "n", "width": 5}],
            "scalars": ["x", "n", "res"],
        },
    },
]

TOPIC = {
    "id": "math-geometry",
    "number": "17",
    "title": "Math and Geometry",
    "subtitle": "In-place matrix transforms, boundary sweeps, number theory, precision discipline",
}
