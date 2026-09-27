/* Topic content, transcribed from the Bit Manipulation chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["bit-manipulation"] = {
  id: "bit-manipulation",
  number: "18",
  title: "Bit Manipulation",
  subtitle: "XOR algebra, the x & (x-1) family, masks as sets, and Python's unbounded integers",
  accent: "blue",
  bounds: { time: "O(n&middot;w) or O(n)", space: "O(1)", driver: "w = word width, treated as 32/64" },

  mechanics: {
    lede:
      "Six identities generate the whole topic. <code>x ^ x == 0</code> and <code>x ^ 0 == x</code>, with XOR " +
      "commutative and associative &mdash; Single Number, Missing Number. <code>x &amp; (x - 1)</code> clears the " +
      "lowest set bit &mdash; popcount, power-of-two test. <code>x &amp; -x</code> isolates it &mdash; partitioning by " +
      "a differing bit. <code>x &amp; 1</code> is parity; <code>x &gt;&gt; 1</code> and <code>x &lt;&lt; 1</code> " +
      "halve and double. And <code>1 &lt;&lt; k</code> with <code>mask &amp; (1 &lt;&lt; k)</code> turns an integer " +
      "into a set of up to ~20 elements.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "XOR as a cancelling accumulator",
        blurb: "Every value appearing an even number of times contributes nothing.",
        caption: "Single Number",
        code: [
          "def single_number(nums):",
          "    acc = 0",
          "    for x in nums:",
          "        acc ^= x     # pairs cancel, order irrelevant",
          "    return acc"
        ],
        invariant:
          "After processing any prefix, <code>acc</code> is the XOR of exactly the elements seen so far. Since XOR is " +
          "associative and commutative, that value is independent of order, and any element appearing an even number " +
          "of times contributes 0."
      },
      {
        tag: "Mechanism B",
        name: "Brian Kernighan&rsquo;s popcount",
        blurb: "Proportional to the answer, not to the word width.",
        caption: "Remove one set bit per iteration",
        code: [
          "def popcount(x):",
          "    n = 0",
          "    while x:",
          "        x &= x - 1   # clears the lowest set bit",
          "        n += 1",
          "    return n"
        ],
        invariant:
          "Each iteration strictly decreases the number of set bits by exactly one, so the loop runs " +
          "<code>popcount(x)</code> times &mdash; not 32 times. For dense inputs this is no better than a bit-by-bit " +
          "loop; for sparse inputs it is proportional to the answer."
      },
      {
        tag: "Mechanism C",
        name: "Per-bit DP for a whole range",
        blurb: "<code>i &gt;&gt; 1</code> is a strictly smaller index that is already final.",
        caption: "Counting Bits for 0..n in O(n)",
        code: [
          "def count_bits(n):",
          "    dp = [0] * (n + 1)",
          "    for i in range(1, n + 1):",
          "        dp[i] = dp[i >> 1] + (i & 1)",
          "    return dp"
        ],
        invariant:
          "<code>i &gt;&gt; 1</code> drops the last bit, so its popcount plus that bit is the popcount of i. Computing " +
          "each number separately would be <code>O(n &middot; w)</code>; reusing the table is O(n)."
      },
      {
        tag: "Mechanism D",
        name: "Arithmetic from logic, with a 32-bit mask",
        blurb: "The mask is a <strong>correctness requirement</strong>, not an optimisation.",
        caption: "Sum of Two Integers without + or -",
        code: [
          "def get_sum(a, b):",
          "    MASK = 0xFFFFFFFF",
          "    MAX_INT = 0x7FFFFFFF",
          "    a, b = a & MASK, b & MASK",
          "    while b:",
          "        carry = (a & b) << 1   # both 1 -> carry left",
          "        a = (a ^ b) & MASK     # sum without carries",
          "        b = carry & MASK       # mask makes this end",
          "    return a if a <= MAX_INT else ~(a ^ MASK)"
        ],
        invariant:
          "Each iteration shifts the carry left by at least one position, so after at most 32 iterations the mask " +
          "discards it entirely and b becomes 0. Without the mask, Python&rsquo;s unbounded integers let the carry " +
          "climb forever on negative inputs and the loop never ends."
      }
    ],
    aside: {
      title: "Why <code>x &amp; (x - 1)</code> clears the lowest set bit",
      body:
        "Write x in binary as <code>P 1 0^k</code> &mdash; some prefix P, then the lowest set bit, then k trailing " +
        "zeros. Subtracting 1 borrows through the zeros: <code>x - 1 = P 0 1^k</code>. ANDing the two, the prefix P is " +
        "unchanged (identical in both), the 1 meets a 0 and vanishes, and each of the k trailing positions has 0 in x. " +
        "The result is <code>P 0 0^k</code> &mdash; exactly x with its lowest set bit removed, and nothing else " +
        "touched. The <code>x &amp; -x</code> identity follows from the same decomposition: " +
        "<code>-x = ~x + 1 = (~P) 1 0^k</code>, so the AND keeps only that single bit."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Why XOR solves the &ldquo;odd one out&rdquo; family",
        sub: "an abelian group of exponent 2",
        body:
          "<p>XOR on <code>{0, 1}</code> is addition modulo 2, extended bitwise, so the integers under XOR form an " +
          "abelian group in which <em>every element is its own inverse</em>. Consequently, for a multiset where every " +
          "value occurs an even number of times except one:</p>" +
          "<p><code>XOR of all = (a^a) ^ (b^b) ^ ... ^ u = 0 ^ 0 ^ ... ^ u = u</code></p>" +
          "<p>Commutativity is what makes the input order irrelevant; self-inverseness is what makes pairs cancel.</p>" +
          "<p><strong>Two extensions follow directly.</strong> <em>Missing Number:</em> XOR the array together with " +
          "<code>0..n</code>; every present value appears twice and cancels, leaving the absent one. <em>Two unique " +
          "elements:</em> the total XOR is <code>a ^ b</code>, which is non-zero, so it has some set bit &mdash; take " +
          "<code>d = (a^b) &amp; -(a^b)</code>, the lowest. That bit <em>differs</em> between a and b by definition of " +
          "XOR, so partitioning the array on <code>x &amp; d</code> puts a and b in different groups, each of which " +
          "has all other values in pairs.</p>"
      },
      {
        title: "Why the carry loop computes addition, and why it terminates",
        sub: "the mask supplies the word boundary",
        body:
          "<p>Binary addition of a and b is: the sum bits where exactly one operand has a 1, which is " +
          "<code>a ^ b</code>; and a carry into the next position wherever both have a 1, which is " +
          "<code>(a &amp; b) &lt;&lt; 1</code>. Adding those two quantities gives <code>a + b</code>, so the loop " +
          "re-applies the same decomposition to the pair until no carries remain.</p>" +
          "<p><strong>Termination.</strong> Each iteration shifts the carry left by at least one position, so after at " +
          "most 32 iterations the mask <code>&amp; 0xFFFFFFFF</code> discards it entirely and b becomes 0. Without the " +
          "mask, Python&rsquo;s unbounded integers let the carry climb forever on negative inputs &mdash; the mask is a " +
          "<em>correctness requirement</em>, not an optimisation.</p>"
      },
      {
        title: "Complexity, and what &ldquo;O(1)&rdquo; means here",
        sub: "the word width as a constant",
        body:
          "<p>Treat the word width w (32 or 64) as a constant, so a single bitwise operation is O(1) and a loop over " +
          "all bit positions is <code>O(w) = O(1)</code>.</p>" +
          "<p>Under that convention: XOR scans are O(n), popcount is O(w) worst case and <code>O(popcount)</code> with " +
          "Kernighan, and bitmask subset enumeration over n elements is <code>O(2^n)</code> &mdash; the mask is O(1) " +
          "per operation, but there are exponentially many masks.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "Python integers are arbitrary precision and behave as <em>infinite</em> two&rsquo;s complement. So " +
        "<code>-1 &gt;&gt; k == -1</code> for every k, <code>~x == -x - 1</code>, and <code>1 &lt;&lt; 64</code> " +
        "simply works. Any algorithm that relies on bits falling off the top of a 32-bit word must mask explicitly with " +
        "<code>&amp; 0xFFFFFFFF</code>, and any loop of the form <code>while x:</code> over a negative number " +
        "<strong>never terminates</strong>."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Task", "Time", "Space", "Note"],
      rows: [
        ["Single Number (pairs)", "O(n)", "O(1)", "beats a hash map on space"],
        ["Missing Number", "O(n)", "O(1)", "XOR with <code>0..n</code>, or use the Gauss sum"],
        ["Single Number III (two uniques)", "O(n)", "O(1)", "two passes, partitioned by one differing bit"],
        ["Single Number II (triples)", "O(n&middot;w) or O(n)", "O(1)", "per-bit count mod 3, or the ones/twos state machine"],
        ["Number of 1 Bits", "O(popcount)", "O(1)", "Kernighan; <code>int.bit_count()</code> in Python 3.10+"],
        ["Counting Bits for 0..n", "O(n)", "O(n) output", "<code>dp[i] = dp[i&gt;&gt;1] + (i&amp;1)</code>"],
        ["Reverse Bits", "O(w)", "O(1)", "exactly 32 iterations, not <code>while x</code>"],
        ["Sum of Two Integers", "O(w)", "O(1)", "at most 32 carry propagations"],
        ["Power-of-two test", "O(1)", "O(1)", "<code>x &gt; 0 and x &amp; (x-1) == 0</code>"],
        ["Subset enumeration via masks", "O(2^n &middot; n)", "O(1) aux", "practical to n = 20, maybe 22"],
        ["Bitmask DP (e.g. TSP)", "O(2^n &middot; n&sup2;)", "O(2^n &middot; n)", "the mask is the DP state"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "Three signals, each nearly conclusive. <strong>&ldquo;O(1) extra space&rdquo; plus a duplicate/missing " +
        "element</strong> means XOR. <strong>&ldquo;Without using the <code>+</code>, <code>-</code>, <code>*</code> " +
        "or <code>/</code> operator&rdquo;</strong> means the bit-level construction of that operator. " +
        "<strong>n &le; 20 with subsets or permutations of a set</strong> means a bitmask &mdash; either as an " +
        "enumeration or as a DP state, since 2<sup>20</sup> is about a million and fits comfortably."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;appears twice except one&rdquo;, O(1) space", "XOR accumulator", "a hash map is O(n) space and the constraint forbids it"],
      ["&ldquo;appears three times except one&rdquo;", "per-bit count mod 3", "XOR has exponent 2 and cannot see multiples of 3"],
      ["&ldquo;find the two non-duplicated numbers&rdquo;", "total XOR, then split on its lowest set bit", "one accumulator cannot separate two survivors"],
      ["&ldquo;without the <code>+</code> operator&rdquo;", "carry loop with a 32-bit mask", "any arithmetic operator defeats the exercise"],
      ["subsets of a set with n &le; 20", "bitmask enumeration", "backtracking works too; the mask is shorter and cache-friendly"],
      ["DP whose state is &ldquo;which items are used&rdquo;", "bitmask DP <span class='topic-ref'>topics 13/14</span>", "a list-valued state cannot index a table"],
      ["tracking used columns/diagonals in N-Queens", "three integer masks", "set operations per node are slower by a large constant"],
      ["a 32-bit overflow requirement in Python", "explicit <code>&amp; 0xFFFFFFFF</code> and a sign fix-up", "Python will silently give the mathematically right, judge-wrong answer"],
      ["counting set bits for many numbers", "the <code>dp[i &gt;&gt; 1]</code> recurrence", "per-number popcount is O(n &middot; w)"],
      ["swapping two variables", "just use tuple assignment", "the XOR swap trick is slower, and fails when the two names alias"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>x == 0</code>", "<code>while x:</code> loops never run &mdash; usually correct, but <code>popcount(0) == 0</code> should be verified rather than assumed"],
      ["negative input with <code>while x:</code>", "Python&rsquo;s <code>-1 &gt;&gt; 1 == -1</code>, so the loop never terminates; mask first"],
      ["negative input with <code>~</code>", "<code>~5 == -6</code>, not <code>0b010</code>; Python has no fixed-width complement"],
      ["<code>1 &lt;&lt; 32</code> and beyond", "no overflow, so &ldquo;wrap around&rdquo; semantics must be written by hand"],
      ["32-bit signed output required", "a masked result above <code>0x7FFFFFFF</code> must be converted: <code>~(a ^ MASK)</code>"],
      ["Reverse Bits with <code>while x:</code>", "stops early on trailing zeros; the loop must run exactly 32 times"],
      ["<code>x &amp; 1 == 1</code>", "<code>==</code> binds tighter than <code>&amp;</code> in Python, so this parses as <code>x &amp; (1 == 1)</code>"],
      ["power-of-two test on 0", "<code>0 &amp; -1 == 0</code> passes the <code>x &amp; (x-1) == 0</code> test; require <code>x &gt; 0</code>"],
      ["<code>INT_MIN</code> (-2<sup>31</sup>)", "negating it overflows in fixed-width languages; in Python it is fine, but the judge may not be"],
      ["XOR for triples", "<code>u ^ u ^ u == u</code>, so the accumulator is polluted by every triple"],
      ["bitmask with n &gt; 22", "2<sup>n</sup> states exceed time and memory; the intended solution is something else"],
      ["<code>int.bit_count()</code> on an old runtime", "added in Python 3.10; <code>bin(x).count('1')</code> is the portable form"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Operator precedence: <code>&amp;</code> binds looser than <code>==</code>",
      wrong: [
        "if x & 1 == 1:    # parses as x & (1 == 1)",
        "    ...",
        "",
        "if x & 3 == 3:    # parses as x & (3 == 3)",
        "    ...           # == x & True == x & 1",
        "",
        "# the first works BY ACCIDENT;",
        "# the second is silently wrong"
      ],
      right: [
        "if x & 1:         # truthiness is enough",
        "    ...",
        "",
        "if (x & 3) == 3:  # parenthesise when",
        "    ...           # comparing a mask"
      ],
      note:
        "In Python the comparison operators bind tighter than the bitwise ones &mdash; the opposite of C&rsquo;s " +
        "precedence for <code>&amp;</code> versus <code>==</code>. <code>x &amp; 1 == 1</code> happens to give the " +
        "right truth value because <code>True == 1</code>, which is exactly why the habit survives until you write " +
        "<code>x &amp; 3 == 3</code> and it quietly tests the wrong bit. Parenthesise every mask comparison."
    },
    {
      n: 2,
      title: "Bit loop over a negative Python integer",
      wrong: [
        "def popcount(x):",
        "    n = 0",
        "    while x:",
        "        n += x & 1",
        "        x >>= 1",
        "    return n",
        "",
        "# popcount(-1): -1 >> 1 == -1",
        "# forever -> infinite loop"
      ],
      right: [
        "def popcount(x):",
        "    x &= 0xFFFFFFFF   # fix the width first",
        "    n = 0",
        "    while x:",
        "        x &= x - 1",
        "        n += 1",
        "    return n",
        "",
        "# popcount(-1) -> 32"
      ],
      note:
        "Right-shifting a negative integer in Python is an arithmetic shift on a conceptually <em>infinite</em> " +
        "two&rsquo;s-complement representation, so the sign bits never run out. Deciding the word width explicitly is " +
        "the fix; <code>x &amp;= x - 1</code> additionally makes the loop proportional to the popcount rather than to " +
        "the width."
    },
    {
      n: 3,
      title: "The carry loop without a mask",
      wrong: [
        "def get_sum(a, b):",
        "    while b:",
        "        carry = (a & b) << 1",
        "        a = a ^ b",
        "        b = carry",
        "    return a",
        "",
        "# get_sum(2, 3) -> 5, fine",
        "# get_sum(-2, 3) -> never terminates:",
        "# the carry climbs into ever-higher",
        "# bits of an unbounded integer"
      ],
      right: [
        "def get_sum(a, b):",
        "    MASK, MAX_INT = 0xFFFFFFFF, 0x7FFFFFFF",
        "    a, b = a & MASK, b & MASK",
        "    while b:",
        "        carry = (a & b) << 1",
        "        a = (a ^ b) & MASK",
        "        b = carry & MASK",
        "    return a if a <= MAX_INT else ~(a ^ MASK)"
      ],
      note:
        "Two obligations. The mask supplies the missing word boundary, which is what lets the carry fall off the top " +
        "and the loop terminate. And the final conversion reinterprets a masked value above <code>0x7FFFFFFF</code> as " +
        "a negative 32-bit integer &mdash; without it, <code>get_sum(-2, 3)</code> returns 4294967295 instead of 1."
    },
    {
      n: 4,
      title: "XOR applied to the triples problem",
      wrong: [
        "# Single Number II: every value",
        "# appears three times except one",
        "acc = 0",
        "for x in nums:",
        "    acc ^= x",
        "return acc",
        "",
        "# [2,2,3,2] -> 2^2^3^2 = 1",
        "# expected 3"
      ],
      right: [
        "res = 0",
        "for bit in range(32):",
        "    total = sum((x >> bit) & 1 for x in nums)",
        "    if total % 3:",
        "        res |= 1 << bit",
        "",
        "# sign fix-up for 32-bit inputs:",
        "return res if res < 2**31 else res - 2**32"
      ],
      note:
        "The XOR group has <em>exponent 2</em>: <code>u ^ u == 0</code> but <code>u ^ u ^ u == u</code>. Counting each " +
        "bit modulo 3 generalises the idea correctly &mdash; bits belonging to triples vanish, bits of the singleton " +
        "survive. The <code>ones</code>/<code>twos</code> two-accumulator version is the same computation compressed " +
        "into two words, and is worth knowing as the O(n) follow-up."
    }
  ],

  practice: {
    caption: "Drill set for Bit Manipulation",
    rows: [
      ["Number of 1 Bits", "LC 191", "Easy", "Kernighan&rsquo;s loop; the negative-input masking issue"],
      ["Reverse Bits", "LC 190", "Easy", "exactly 32 iterations, not <code>while x</code>"],
      ["Missing Number", "LC 268", "Easy", "XOR against <code>0..n</code>, and the Gauss-sum alternative"],
      ["Single Number II", "LC 137", "Medium", "per-bit count mod 3, then the ones/twos state machine"],
      ["Single Number III", "LC 260", "Medium", "split on the lowest set bit of the total XOR"],
      ["Bitwise AND of Numbers Range", "LC 201", "Medium", "the answer is the common prefix; shift until <code>left == right</code>"],
      ["Subsets via bitmask", "LC 78", "Medium", "enumerate <code>0..2^n - 1</code> and read the bits as membership"],
      ["Divide Two Integers", "LC 29", "Hard", "long division by repeated doubling; the <code>INT_MIN / -1</code> overflow case"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;Every value appears twice except one&rdquo;, with <strong>O(1) extra space</strong>.",
      options: ["Hash map", "XOR accumulator", "Sort first", "Two pointers"],
      answer: 1,
      why: "A hash map is O(n) space and the constraint forbids it. XOR is self-inverse, so every pair cancels to 0."
    },
    {
      prompt: "Every value appears <strong>three times</strong> except one.",
      options: ["XOR accumulator", "Per-bit count mod 3", "Hash map", "Sort"],
      answer: 1,
      why: "The XOR group has exponent 2: u ^ u ^ u == u, so triples pollute the accumulator. Counting each bit modulo 3 generalises correctly."
    },
    {
      prompt: "<strong>Two</strong> values appear once; everything else appears twice.",
      options: ["One XOR pass", "Total XOR, then split on its lowest set bit", "Hash map", "Sort"],
      answer: 1,
      why: "One accumulator cannot separate two survivors. Their XOR is non-zero, and any set bit in it differs between them — partition on that bit."
    },
    {
      prompt: "&ldquo;Add two integers <strong>without the + operator</strong>.&rdquo;",
      options: ["sum()", "Carry loop with a 32-bit mask", "Recursion", "Multiplication"],
      answer: 1,
      why: "Any arithmetic operator defeats the exercise. a^b is the sum bits, (a&b)<<1 is the carry — and the mask is what makes it terminate in Python."
    },
    {
      prompt: "Subsets of a set with <strong>n ≤ 20</strong>.",
      options: ["Bitmask enumeration", "Only backtracking", "DP table", "Heap"],
      answer: 0,
      why: "2²⁰ is about a million and fits comfortably. Backtracking works too, but the mask is shorter and cache-friendly."
    },
    {
      prompt: "A DP whose state is &ldquo;<strong>which items are used</strong>&rdquo;.",
      options: ["A list of booleans as the key", "Bitmask DP", "Greedy", "Sliding window"],
      answer: 1,
      why: "A list-valued state cannot index a table. An integer mask can, which is exactly what makes TSP-style DP possible."
    },
    {
      prompt: "In Python, <code>while x:</code> over a <strong>negative</strong> integer.",
      options: ["Terminates after 32 steps", "Never terminates", "Raises an error", "Terminates at 64"],
      answer: 1,
      why: "Python integers behave as infinite two's complement, so -1 >> k == -1 forever. Mask to a fixed width first."
    },
    {
      prompt: "You write <code>if x &amp; 3 == 3:</code>. What does Python do?",
      options: ["Tests bits 0 and 1", "Parses as x & (3 == 3), testing bit 0", "Syntax error", "Same as (x & 3) == 3"],
      answer: 1,
      why: "Comparison binds tighter than bitwise AND in Python — the opposite of C. Parenthesise every mask comparison."
    },
    {
      prompt: "Counting set bits for <strong>every number in 0..n</strong>.",
      options: ["Kernighan per number", "dp[i] = dp[i >> 1] + (i & 1)", "bin().count() per number", "A sieve"],
      answer: 1,
      why: "Per-number popcount is O(n·w). i >> 1 is a strictly smaller index already in the table, so each answer costs one lookup."
    }
  ]
};
