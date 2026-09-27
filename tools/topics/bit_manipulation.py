"""Topic 18 -- Bit Manipulation."""

SINGLE_NUMBER = '''
def single_number(nums):
    acc = 0
    for x in nums:
        acc ^= x               # pairs cancel; order is irrelevant
    return acc
'''

COUNT_BITS = '''
def count_bits(n):
    dp = [0] * (n + 1)
    for i in range(1, n + 1):
        dp[i] = dp[i >> 1] + (i & 1)   # i>>1 drops the last bit
    return dp
'''

GET_SUM = '''
def get_sum(a, b):
    MASK = 0xFFFFFFFF
    MAX_INT = 0x7FFFFFFF
    a, b = a & MASK, b & MASK
    while b:
        carry = (a & b) << 1       # both bits 1 -> carry moves left
        a = (a ^ b) & MASK         # sum without carries
        b = carry & MASK           # the mask is what terminates this
    return a if a <= MAX_INT else ~(a ^ MASK)
'''

EXAMPLES = [
    {
        "id": "single-number",
        "title": "Single Number",
        "lc": "LC 136",
        "level": "Easy",
        "mechanism": "Mechanism A -- XOR as a cancelling accumulator",
        "func": "single_number",
        "code": SINGLE_NUMBER,
        "args": ([4, 1, 2, 1, 2],),
        "watch": ["nums", "acc", "x"],
        "inputLabel": "nums = [4, 1, 2, 1, 2]",
        "complexity": {"time": "O(n)", "space": "O(1)"},
        "idea": (
            "The integers under XOR form an abelian group in which every element is its own "
            "inverse. Commutativity makes the input order irrelevant; self-inverseness makes pairs "
            "cancel."
        ),
        "takeaway": (
            "Answer 4. Watch the bit rows: every value that appears twice returns the accumulator to "
            "where it was. This <em>cannot</em> be extended to triples &mdash; the group has exponent "
            "2, so <code>u ^ u ^ u == u</code>. Knowing why XOR fails there is a better answer than "
            "knowing the trick that replaces it."
        ),
        "view": {
            "arrays": [{"name": "nums", "label": "nums", "static": True}],
            "bits": [{"name": "acc", "label": "acc", "width": 4}],
            "scalars": ["x", "acc"],
        },
    },
    {
        "id": "counting-bits",
        "title": "Counting Bits",
        "lc": "LC 338",
        "level": "Easy",
        "mechanism": "Mechanism C -- per-bit DP for a whole range",
        "func": "count_bits",
        "code": COUNT_BITS,
        "args": (8,),
        "watch": ["n", "dp", "i"],
        "inputLabel": "n = 8",
        "complexity": {"time": "O(n)", "space": "O(n) output"},
        "idea": (
            "<code>i >> 1</code> is i with its last bit dropped, a strictly smaller index that is "
            "already final. So one table lookup plus the parity bit gives the whole popcount &mdash; "
            "no per-number loop at all."
        ),
        "takeaway": (
            "Output <code>[0, 1, 1, 2, 1, 2, 2, 3, 1]</code>. Computing each popcount separately would "
            "be O(n &middot; w); this reuses the answer for <code>i >> 1</code>, which is the same "
            "&ldquo;every state computed once&rdquo; argument as any other DP. Note the powers of two "
            "&mdash; 1, 2, 4, 8 &mdash; all drop back to 1."
        ),
        "view": {
            "arrays": [{"name": "dp", "label": "dp", "highlightWrites": True, "hint": "index = the number"}],
            "pointers": [{"name": "i", "target": "dp", "label": "i"}],
            "bits": [{"name": "i", "label": "i", "width": 4}],
            "scalars": ["i", "n"],
        },
    },
    {
        "id": "sum-two-integers",
        "title": "Sum of Two Integers — the negative case",
        "lc": "LC 371",
        "level": "Medium",
        "mechanism": "Mechanism D -- arithmetic from logic, with a 32-bit mask",
        "func": "get_sum",
        "code": GET_SUM,
        "args": (-2, 3),
        "watch": ["a", "b", "carry", "MASK", "MAX_INT"],
        "inputLabel": "a = -2, b = 3",
        "complexity": {"time": "O(w)", "space": "O(1)"},
        "idea": (
            "<code>a ^ b</code> is the sum bits; <code>(a &amp; b) &lt;&lt; 1</code> is the carry. "
            "Re-apply until no carries remain. The mask supplies the word boundary that Python&rsquo;s "
            "unbounded integers do not have."
        ),
        "takeaway": (
            "Output 1, which is <code>-2 + 3</code>. Watch the carry walk upward one bit per iteration "
            "until the mask annihilates it at bit 32 &mdash; that is both why the loop terminates and "
            "why omitting the mask <em>hangs forever</em> in Python. The final "
            "<code>~(a ^ MASK)</code> reinterprets a value above <code>0x7FFFFFFF</code> as a negative "
            "32-bit integer."
        ),
        "view": {
            "bits": [{"name": "b", "label": "b (the carry)", "width": 8}],
            "scalars": ["a", "b", "carry"],
        },
    },
]

TOPIC = {
    "id": "bit-manipulation",
    "number": "18",
    "title": "Bit Manipulation",
    "subtitle": "XOR algebra, the x & (x-1) family, masks as sets, and Python's unbounded integers",
}
