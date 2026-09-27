/* Topic content, transcribed from the Math and Geometry chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["math-geometry"] = {
  id: "math-geometry",
  number: "17",
  title: "Math and Geometry",
  subtitle: "In-place matrix transforms, boundary sweeps, number theory, precision discipline",
  accent: "sky",
  bounds: { time: "O(n) to O(&radic;n)", space: "O(1)", driver: "closed form or bounded divisor scan" },

  mechanics: {
    lede:
      "This topic is a collection of identities rather than a single pattern. What unifies it is a discipline: " +
      "<strong>stay in integers whenever the problem is stated in integers</strong>. Compare squared distances rather " +
      "than square roots, use reduced fractions rather than float slopes, and bound loops with <code>i*i &le; n</code> " +
      "rather than <code>int(sqrt(n))</code>.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Matrix rotation as a composition of two involutions",
        blurb: "Transpose, then mirror. No case analysis and no temporary matrix.",
        caption: "Rotate 90&deg; clockwise, in place",
        code: [
          "def rotate(m):",
          "    n = len(m)",
          "    for i in range(n):          # transpose",
          "        for j in range(i + 1, n):   # j > i ONLY",
          "            m[i][j], m[j][i] = m[j][i], m[i][j]",
          "    for row in m:",
          "        row.reverse()           # then mirror horizontally"
        ],
        invariant:
          "After the transpose loop, <code>m[i][j]</code> holds the original <code>m[j][i]</code>; after the row " +
          "reversals, the element originally at <code>(i, j)</code> sits at <code>(j, n-1-i)</code>, which is exactly a " +
          "clockwise quarter turn. <strong>The <code>j &gt; i</code> bound is essential:</strong> iterating the full " +
          "square swaps every pair twice and restores the original matrix."
      },
      {
        tag: "Mechanism B",
        name: "Boundary sweep (spiral traversal)",
        blurb: "Four shrinking boundaries, and two guards that most people forget.",
        caption: "Spiral Matrix",
        code: [
          "def spiral_order(m):",
          "    if not m or not m[0]:",
          "        return []",
          "    top, bottom = 0, len(m) - 1",
          "    left, right = 0, len(m[0]) - 1",
          "    out = []",
          "    while top <= bottom and left <= right:",
          "        for c in range(left, right + 1):",
          "            out.append(m[top][c])",
          "        top += 1",
          "        for r in range(top, bottom + 1):",
          "            out.append(m[r][right])",
          "        right -= 1",
          "        if top <= bottom:       # GUARD: row exhausted?",
          "            for c in range(right, left - 1, -1):",
          "                out.append(m[bottom][c])",
          "            bottom -= 1",
          "        if left <= right:       # GUARD: col exhausted?",
          "            for r in range(bottom, top - 1, -1):",
          "                out.append(m[r][left])",
          "            left += 1",
          "    return out"
        ],
        invariant:
          "The four boundaries always delimit the not-yet-emitted submatrix <code>m[top..bottom][left..right]</code>, " +
          "and each pass emits one full edge and then retires it. The two inner guards are needed because after the " +
          "first two passes the remaining region can be a single row or column, in which case the third and fourth " +
          "passes would re-emit what the first two already took."
      },
      {
        tag: "Mechanism C",
        name: "Number theory identities worth having memorised",
        blurb: "Euclid, trial division to the square root, the sieve, and fast exponentiation.",
        caption: "Four functions you should be able to write cold",
        code: [
          "def gcd(a, b):              # O(log min(a,b))",
          "    while b:",
          "        a, b = b, a % b",
          "    return a",
          "",
          "def is_prime(n):",
          "    if n < 2: return False",
          "    i = 2",
          "    while i * i <= n:       # NOT i <= int(sqrt(n))",
          "        if n % i == 0:",
          "            return False",
          "        i += 1",
          "    return True",
          "",
          "def count_primes(n):        # O(n log log n)",
          "    if n < 3: return 0",
          "    sieve = bytearray([1]) * n",
          "    sieve[0] = sieve[1] = 0",
          "    i = 2",
          "    while i * i < n:",
          "        if sieve[i]:        # start at i*i, step i",
          "            sieve[i*i::i] = bytearray(len(sieve[i*i::i]))",
          "        i += 1",
          "    return sum(sieve)"
        ],
        invariant: null
      },
      {
        tag: "Mechanism D",
        name: "Precision and sign discipline",
        blurb: "The four Python facts that decide correctness in this topic.",
        caption: "Know these cold",
        code: [
          "-7 // 2 == -4      # FLOOR division, not truncation",
          "int(-7 / 2) == -3  # truncation; what most problems mean",
          "-7 % 3 == 2        # % is non-negative for a positive modulus",
          "2 ** 64            # no overflow: arbitrary precision",
          "",
          "# Geometry: compare SQUARED distances. sqrt is monotone",
          "# on non-negatives, so d1 < d2 <=> d1*d1 < d2*d2, and",
          "# the squared form is exact integer arithmetic."
        ],
        invariant: null
      }
    ],
    aside: {
      title: "Fast exponentiation, and why it generalises",
      body:
        "Write n in binary: <code>x^n</code> is the product of <code>x^(2^k)</code> over the set bits. The loop squares " +
        "x once per bit position and multiplies into the accumulator exactly when bit k is set, so there are " +
        "<code>floor(log2 n) + 1</code> multiplications. This is the same identity that underlies modular " +
        "exponentiation, matrix-power Fibonacci and RSA &mdash; worth deriving rather than memorising."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "The rotation identity, proved by composition",
        sub: "two maps that agree",
        body:
          "<p>Transposition T maps <code>(i, j) &rarr; (j, i)</code>. Horizontal mirroring M maps " +
          "<code>(i, j) &rarr; (i, n-1-j)</code>. Composing, <code>M(T(i, j)) = M(j, i) = (j, n-1-i)</code>.</p>" +
          "<p>A clockwise quarter turn sends row i to column <code>n-1-i</code>, i.e. " +
          "<code>(i, j) &rarr; (j, n-1-i)</code>. The two maps agree, so transpose-then-reverse <em>is</em> the " +
          "rotation. Counter-clockwise is the same pair in the other order (reverse rows first, then transpose), and " +
          "both facts are worth deriving on the spot rather than memorising, since it takes ten seconds.</p>"
      },
      {
        title: "Euclid&rsquo;s algorithm",
        sub: "correctness and the logarithmic bound",
        body:
          "<p><strong>Correctness.</strong> Let d be any common divisor of a and b, and write <code>a = qb + r</code>. " +
          "Then <code>r = a - qb</code> is divisible by d, so d divides b and r. Conversely any common divisor of b and " +
          "r divides <code>qb + r = a</code>. So the <em>set</em> of common divisors is unchanged by the replacement " +
          "<code>(a, b) &rarr; (b, a mod b)</code>, hence so is the greatest one.</p>" +
          "<p><strong>Speed.</strong> <code>a mod b &lt; b</code>, so the second argument strictly decreases. For the " +
          "bound: if <code>a &gt; b</code> then <code>a mod b &lt; a/2</code> whenever <code>b &le; a/2</code>, and " +
          "otherwise <code>a mod b = a - b &lt; a/2</code>; either way the pair shrinks geometrically, giving " +
          "<code>O(log min(a, b))</code> iterations. The worst case is consecutive Fibonacci numbers.</p>"
      },
      {
        title: "Why testing divisors up to the square root suffices",
        sub: "and why the loop bound matters",
        body:
          "<p>If <code>n = a &middot; b</code> with <code>a &le; b</code>, then " +
          "<code>a &middot; a &le; a &middot; b = n</code>, so <code>a &le; sqrt(n)</code>. Any non-trivial " +
          "factorisation therefore has its smaller factor at or below <code>sqrt(n)</code>; finding none proves " +
          "primality.</p>" +
          "<p>Using the loop condition <code>i*i &le; n</code> rather than <code>i &le; int(sqrt(n))</code> avoids the " +
          "floating-point boundary error entirely &mdash; <code>int(sqrt(9))</code> can land on 2 under some libm " +
          "implementations, and <code>range(2, int(n**0.5))</code> is off by one regardless, reporting 9 as prime.</p>" +
          "<p><strong>Sieve complexity.</strong> Marking multiples of prime p starting at <code>p*p</code> costs about " +
          "<code>n/p</code> operations. Summing over primes gives <code>n &middot; sum(1/p)</code>, and by Mertens&rsquo; " +
          "theorem that sum is <code>ln ln n + O(1)</code>. Hence <code>O(n log log n)</code>. Starting at " +
          "<code>p*p</code> rather than <code>2p</code> is what makes the constant small: every smaller multiple of p " +
          "has a smaller prime factor and was already marked.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "In-place rotation works only for a <strong>square</strong> matrix. Rotating an <code>n &times; m</code> matrix " +
        "in place is impossible without reallocation, because the result has different dimensions. If the interviewer " +
        "gives a rectangular grid, say that and allocate."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Task", "Time", "Space", "Note"],
      rows: [
        ["Rotate an n&times;n matrix in place", "O(n&sup2;)", "O(1)", "every element touched twice"],
        ["Spiral traversal", "O(n&middot;m)", "O(1) aux", "each cell emitted once"],
        ["Set Matrix Zeroes, O(1) space", "O(n&middot;m)", "O(1)", "first row/column reused as the marker array"],
        ["GCD (Euclid)", "O(log min(a,b))", "O(1)", "Fibonacci pairs are the worst case"],
        ["Primality test", "O(&radic;n)", "O(1)", "<code>i*i &le; n</code>"],
        ["Sieve of Eratosthenes", "O(n log log n)", "O(n) bits", "start marking at <code>p*p</code>"],
        ["Fast exponentiation", "O(log n)", "O(1)", "one squaring per bit"],
        ["Happy Number", "O(log n) per step", "O(1) with Floyd", "the value space is bounded, so a cycle is forced"],
        ["Multiply Strings", "O(n&middot;m)", "O(n+m)", "schoolbook; the product has at most n+m digits"],
        ["Max Points on a Line", "O(n&sup2;)", "O(n)", "slopes as reduced fractions, never floats"],
        ["Detect Squares", "O(n) per query", "O(n)", "iterate diagonal candidates, multiply counts"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "The recognition signal is <strong>a constraint too large to iterate</strong>: <code>n &le; 10<sup>9</sup></code>, " +
        "&ldquo;the answer may be astronomically large, return it mod 10<sup>9</sup>+7&rdquo;, or &ldquo;in O(1) " +
        "space&rdquo;. Those phrases mean a closed form, a cycle/period, or an arithmetic identity &mdash; not a loop " +
        "over n. The second signal is a problem that <em>looks</em> like DP but has a formula: Unique Paths is " +
        "<code>C(m+n-2, m-1)</code>, computable in <code>O(min(m,n))</code> with no table at all."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["n up to 10<sup>9</sup> with a per-step simulation", "closed form, or find the cycle length", "O(n) simulation cannot finish"],
      ["&ldquo;return the result modulo 10<sup>9</sup>+7&rdquo;", "modular arithmetic, fast exponentiation", "the answer does not fit, so exact big-int math is wasteful"],
      ["counting paths in a grid with <em>no</em> obstacles", "binomial coefficient", "the DP table is O(n&middot;m) for an O(n) formula"],
      ["counting paths <em>with</em> obstacles", "2-D DP <span class='topic-ref'>topic 14</span>", "no closed form survives arbitrary obstacles"],
      ["repeatedly applying a deterministic digit/number map", "Floyd cycle detection <span class='topic-ref'>topic 06</span>", "the state space is finite, so a cycle is guaranteed"],
      ["distances or comparisons between points", "squared integer distances", "<code>sqrt</code> introduces float error and is unnecessary"],
      ["slopes, collinearity", "reduced fractions <code>(dy/g, dx/g)</code> or cross products", "float slopes collide, and <code>dx == 0</code> divides by zero"],
      ["&ldquo;without using the division/multiplication operator&rdquo;", "bit shifts and subtraction <span class='topic-ref'>topic 18</span>", "the arithmetic operator is what the problem is testing"],
      ["factorial / combination with large arguments", "multiplicative formula with early division, or modular inverse", "computing n! first overflows the time limit, not the type"],
      ["matrix is rectangular, rotation requested", "allocate a new matrix", "in-place is impossible when the shape changes"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty matrix / empty first row", "<code>len(m[0])</code> raises <code>IndexError</code>; guard <code>if not m or not m[0]</code>"],
      ["single row or single column (spiral)", "without the two inner guards, cells are emitted twice"],
      ["1&times;1 matrix", "all four boundaries coincide; the guards make the first pass emit it and stop"],
      ["non-square matrix with in-place rotation", "the transpose indexes out of range; needs reallocation"],
      ["<code>j</code> looping over the full row in the transpose", "every pair swapped twice, so the matrix is unchanged"],
      ["<code>n &lt; 2</code> for primality", "0 and 1 are not prime; <code>while i*i &le; n</code> never runs and wrongly returns True"],
      ["<code>n == 2</code> in a sieve sized n", "the sieve counts primes <em>below</em> n; off-by-one on whether n itself is included"],
      ["<code>int(sqrt(n))</code> as a loop bound", "float rounding plus an exclusive range reports 9, 25, 49 as prime"],
      ["negative exponent in <code>pow</code>", "must invert the base; <code>n &gt; 1</code> on a negative n never terminates in Python"],
      ["32-bit overflow expectations (Reverse Integer)", "Python will not overflow, so the <code>[-2<sup>31</sup>, 2<sup>31</sup>-1]</code> check must be written explicitly"],
      ["<code>-7 // 2</code> where truncation was intended", "gives -4 instead of -3; use <code>int(a / b)</code> or <code>abs()</code> with an explicit sign"],
      ["division by zero in a slope calculation", "vertical lines must be a separate key, not <code>dy/dx</code>"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Transpose loop covering the whole square",
      wrong: [
        "for i in range(n):",
        "    for j in range(n):        # full square",
        "        m[i][j], m[j][i] = m[j][i], m[i][j]",
        "",
        "# every pair is swapped twice,",
        "# so the matrix comes back",
        "# unchanged and the rotation",
        "# reduces to just reversing rows"
      ],
      right: [
        "for i in range(n):",
        "    for j in range(i + 1, n):  # upper triangle",
        "        m[i][j], m[j][i] = m[j][i], m[i][j]",
        "for row in m:",
        "    row.reverse()"
      ],
      note:
        "A reflection is an <em>involution</em>: applying it twice is the identity. The fix is to visit each unordered " +
        "pair once, which means the strict upper triangle (<code>j &gt; i</code>). The diagonal needs no swap at all, " +
        "which <code>range(i+1, n)</code> also handles for free."
    },
    {
      n: 2,
      title: "Primality loop bounded by <code>int(sqrt(n))</code> in an exclusive range",
      wrong: [
        "import math",
        "def is_prime(n):",
        "    if n < 2: return False",
        "    for i in range(2, int(math.sqrt(n))):",
        "        if n % i == 0:",
        "            return False",
        "    return True",
        "",
        "# n=9: range(2, 3) -> tests only 2",
        "# -> reports 9 as PRIME"
      ],
      right: [
        "def is_prime(n):",
        "    if n < 2: return False",
        "    i = 2",
        "    while i * i <= n:",
        "        if n % i == 0:",
        "            return False",
        "        i += 1",
        "    return True",
        "",
        "# n=9: tests 2, then 3 -> composite"
      ],
      note:
        "Two independent defects: <code>range</code> excludes its upper bound, and <code>sqrt</code> is a float whose " +
        "rounding you do not control. <code>i * i &le; n</code> is exact integer arithmetic with an inclusive bound, so " +
        "it removes both at once. The same pattern applies to the sieve&rsquo;s outer loop."
    },
    {
      n: 3,
      title: "Spiral traversal without the single-row and single-column guards",
      wrong: [
        "while top <= bottom and left <= right:",
        "    for c in range(left, right+1):",
        "        out.append(m[top][c])",
        "    top += 1",
        "    for r in range(top, bottom+1):",
        "        out.append(m[r][right])",
        "    right -= 1",
        "    for c in range(right, left-1, -1):",
        "        out.append(m[bottom][c])   # no guard",
        "    bottom -= 1",
        "    ...",
        "",
        "# m = [[1,2,3]] -> emits 1,2,3",
        "# then re-emits 2,1"
      ],
      right: [
        "while top <= bottom and left <= right:",
        "    ...",
        "    right -= 1",
        "    if top <= bottom:",
        "        for c in range(right, left-1, -1):",
        "            out.append(m[bottom][c])",
        "        bottom -= 1",
        "    if left <= right:",
        "        for r in range(bottom, top-1, -1):",
        "            out.append(m[r][left])",
        "        left += 1"
      ],
      note:
        "The <code>while</code> condition is checked once per full lap, but the region can become degenerate " +
        "<em>mid-lap</em> &mdash; after <code>top += 1</code> the rows may be exhausted while the columns are not. The " +
        "two inner guards re-check exactly at those two points. Single-row and single-column matrices are the test " +
        "cases that expose this."
    },
    {
      n: 4,
      title: "Floating-point slopes and unguarded vertical lines",
      wrong: [
        "slope = (y2 - y1) / (x2 - x1)",
        "cnt[slope] += 1",
        "",
        "# ZeroDivisionError on a vertical line;",
        "# and 1/3 vs 2/6 can differ in the last",
        "# bit, splitting one line into two keys"
      ],
      right: [
        "dy, dx = y2 - y1, x2 - x1",
        "g = math.gcd(dy, dx)    # gcd(0, k) == abs(k)",
        "dy, dx = dy // g, dx // g",
        "if dx < 0:              # canonical sign",
        "    dy, dx = -dy, -dx",
        "cnt[(dy, dx)] += 1"
      ],
      note:
        "Reduced integer fractions give exact equality and handle <code>dx == 0</code> as the key " +
        "<code>(1, 0)</code>. The sign normalisation matters: <code>(1, 2)</code> and <code>(-1, -2)</code> are the " +
        "same direction and must hash to the same key. The general principle for this whole topic &mdash; <em>stay in " +
        "integers whenever the problem is stated in integers</em> &mdash; also covers comparing squared distances " +
        "instead of <code>sqrt</code>."
    }
  ],

  practice: {
    caption: "Drill set for Math and Geometry",
    rows: [
      ["Plus One", "LC 66", "Easy", "carry propagation in a digit array; the all-nines case needs a new leading digit"],
      ["Happy Number", "LC 202", "Easy", "deterministic map on a bounded state space; Floyd instead of a seen-set"],
      ["Palindrome Number", "LC 9", "Easy", "reverse only half the digits; negative input is never a palindrome"],
      ["Set Matrix Zeroes", "LC 73", "Medium", "encode the marker array into row 0 and column 0 for O(1) space"],
      ["Multiply Strings", "LC 43", "Medium", "schoolbook multiplication; the product has at most n+m digits"],
      ["Count Primes", "LC 204", "Medium", "sieve, marking from <code>p*p</code>; the &ldquo;strictly less than n&rdquo; boundary"],
      ["Detect Squares", "LC 2013", "Medium", "fix a diagonal, multiply the counts of the other two corners"],
      ["Max Points on a Line", "LC 149", "Hard", "reduced-fraction slope keys, vertical lines, duplicate points"]
    ]
  },

  quiz: [
    {
      prompt: "n up to 10<sup>9</sup>, with a per-step simulation described in the prompt.",
      options: ["Simulate it", "Closed form, or find the cycle length", "DP", "Sliding window"],
      answer: 1,
      why: "An O(n) simulation cannot finish. A constraint too large to iterate is the signal for a formula or a period."
    },
    {
      prompt: "Counting paths in a grid with <strong>no obstacles</strong>.",
      options: ["2-D DP table", "Binomial coefficient", "BFS", "Backtracking"],
      answer: 1,
      why: "The DP table is O(n·m) for something with a closed form: C(m+n−2, m−1), computable in O(min(m,n)) with no table."
    },
    {
      prompt: "The same problem but <strong>with obstacles</strong>.",
      options: ["Binomial coefficient", "2-D DP", "Closed form with a correction", "Greedy"],
      answer: 1,
      why: "No closed form survives arbitrary obstacles — the count at each cell now depends on which neighbours are blocked."
    },
    {
      prompt: "Comparing distances between integer points.",
      options: ["math.sqrt on each", "Compare squared distances", "Use Decimal", "Round to 6 places"],
      answer: 1,
      why: "sqrt is monotone on non-negatives, so the comparison is unchanged — and the squared form is exact integer arithmetic."
    },
    {
      prompt: "Collinearity / slope keys for Max Points on a Line.",
      options: ["Float dy/dx", "Reduced integer fraction with a canonical sign", "Angle in radians", "Sorted pairs"],
      answer: 1,
      why: "Float slopes collide on values like 1/3 vs 2/6, and dx == 0 divides by zero. Reduced fractions give exact equality and a real key for vertical lines."
    },
    {
      prompt: "Bounding a primality trial-division loop.",
      options: ["i <= int(sqrt(n))", "i * i <= n", "i <= n // 2", "i < n"],
      answer: 1,
      why: "int(sqrt(n)) mixes float rounding with an exclusive range and reports 9 as prime. i*i <= n is exact integer arithmetic with an inclusive bound."
    },
    {
      prompt: "Repeatedly applying a deterministic digit map, asking whether it terminates.",
      options: ["A seen-set", "Floyd cycle detection", "DP", "Sorting"],
      answer: 1,
      why: "The state space is bounded, so a cycle is guaranteed. Floyd finds it in O(1) space where the set costs O(n)."
    },
    {
      prompt: "Rotating a <strong>rectangular</strong> matrix in place.",
      options: ["Transpose then reverse", "Impossible — allocate a new matrix", "Reverse then transpose", "Rotate layer by layer"],
      answer: 1,
      why: "The result has different dimensions, so it cannot occupy the same storage. Say so explicitly rather than producing an index error."
    },
    {
      prompt: "You need truncation toward zero, and write <code>-7 // 2</code>.",
      options: ["Correct", "Gives −4; use int(a / b)", "Gives −3", "Raises an error"],
      answer: 1,
      why: "Python's // floors toward minus infinity. Most problems specify truncation, which is int(a / b) or abs() with an explicit sign."
    }
  ]
};
