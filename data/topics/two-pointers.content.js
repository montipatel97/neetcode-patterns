/* Topic content, transcribed from the Two Pointers chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["two-pointers"] = {
  id: "two-pointers",
  number: "02",
  title: "Two Pointers",
  subtitle: "Converging pointers on sorted data, fast/slow write pointers, pair-space elimination",
  accent: "sky",
  bounds: { time: "O(n) after O(n log n) sort", space: "O(1)", driver: "pointers only move inward" },

  mechanics: {
    lede:
      "Two pointers is a <strong>search-space elimination</strong> method. The candidate space is the set of index " +
      "pairs <code>(i, j)</code> with <code>i &lt; j</code> &mdash; an upper-triangular set of size " +
      "<code>n(n-1)/2</code>. A brute-force double loop enumerates all of it. Two pointers instead starts at the " +
      "extreme corner <code>(0, n-1)</code> and, at every step, <em>proves</em> that an entire row or column of that " +
      "triangle contains no better candidate, then deletes it by moving one pointer. After at most " +
      "<code>n-1</code> deletions the space is empty, so the scan is linear.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Converging pointers",
        blurb: "Requires sorted or otherwise monotone data. The two ends walk toward each other, and each move retires a whole band of candidates.",
        caption: "Pair sum on a sorted array",
        code: [
          "def two_sum_sorted(a, target):   # strict: never pair i with itself",
          "    l, r = 0, len(a) - 1",
          "    while l < r:                 # a[l] too small for ANY partner <= r",
          "        s = a[l] + a[r]          # a[r] too big for ANY partner >= l",
          "        if s == target:",
          "            return [l, r]",
          "        if s < target:",
          "            l += 1",
          "        else:",
          "            r -= 1",
          "    return []"
        ],
        invariant:
          "Every pair <code>(i, j)</code> with <code>i &lt; l</code> or <code>j &gt; r</code> has already been proven " +
          "not to be a solution (or not better than the best found so far). The live candidate set is exactly the pairs " +
          "inside <code>[l, r]</code>, and it shrinks strictly every iteration."
      },
      {
        tag: "Mechanism B",
        name: "Fast/slow, same direction (read pointer plus write pointer)",
        blurb: "Used for in-place compaction, partitioning and de-duplication. One pointer scans; the other marks the boundary of the finished region.",
        caption: "In-place de-duplication of a sorted array",
        code: [
          "def remove_duplicates(a):",
          "    if not a:",
          "        return 0",
          "    w = 1                        # next write position",
          "    for r in range(1, len(a)):   # a[:w] is the answer so far",
          "        if a[r] != a[w - 1]:",
          "            a[w] = a[r]",
          "            w += 1",
          "    return w"
        ],
        invariant:
          "<code>a[0:w]</code> is exactly the sorted, de-duplicated version of <code>a[0:r+1]</code>, and " +
          "<code>w &le; r+1</code> always, so the write pointer never overtakes the read pointer and cannot clobber " +
          "unread data. That inequality is the whole safety argument for in-place rewriting."
      },
      {
        tag: "Mechanism C",
        name: "Mirror / palindrome scan",
        blurb:
          "Pointers start at both ends and must agree. <code>while l &lt; r</code> leaves the exact centre of an " +
          "odd-length string unvisited, which is correct because a single character is trivially a palindrome.",
        caption: "Mirror scan with filtering",
        code: [
          "def is_palindrome(s):",
          "    l, r = 0, len(s) - 1",
          "    while l < r:",
          "        while l < r and not s[l].isalnum():   # skip junk INSIDE",
          "            l += 1",
          "        while l < r and not s[r].isalnum():",
          "            r -= 1",
          "        if s[l].lower() != s[r].lower():",
          "            return False",
          "        l += 1",
          "        r -= 1",
          "    return True"
        ],
        invariant:
          "Everything strictly outside <code>[l, r]</code> has been checked and matched. The inner skip loops must " +
          "also carry the <code>l &lt; r</code> guard, or a string of pure punctuation walks off the end."
      },
      {
        tag: "Mechanism D",
        name: "Sort, then fix one index and run Mechanism A inside",
        blurb:
          "The shape of 3Sum, 4Sum and &ldquo;closest sum&rdquo;: an outer loop fixes the first element and reduces the " +
          "problem to a 2-sum on the suffix, which two pointers solves in O(n). Sorting is what buys the monotonicity; " +
          "de-duplication then has to happen at <em>both</em> levels.",
        caption: null,
        code: null,
        invariant: null
      }
    ],
    aside: {
      title: "Why the potential argument matters",
      body:
        "Define <code>P = l + (n - 1 - r)</code>, the number of positions consumed from the two ends. Every iteration " +
        "increments P by exactly 1, and the loop condition caps it at <code>n - 2</code>. That is the general reason " +
        "all two-pointer scans are linear: there is no hidden re-scanning, because neither pointer ever moves backwards. " +
        "Being able to say this out loud is what turns &ldquo;it looks linear&rdquo; into a proof."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of the elimination step",
        sub: "pair sum",
        body:
          "<p>Suppose <code>a</code> is sorted ascending and <code>a[l] + a[r] &lt; target</code>. For any j with " +
          "<code>l &lt; j &le; r</code> we have <code>a[j] &le; a[r]</code>, hence " +
          "<code>a[l] + a[j] &le; a[l] + a[r] &lt; target</code>. So no pair using index l and any partner still inside " +
          "the live window can reach target: index l is dead, and <code>l += 1</code> deletes exactly the set of dead " +
          "pairs and nothing else. The symmetric argument for <code>a[l] + a[r] &gt; target</code> kills index r.</p>" +
          "<p>Because each move deletes only provably-dead pairs, no solution is ever discarded; because the window " +
          "shrinks each step, the loop terminates. Together: if a solution exists it is still live when the pointers " +
          "meet, and the only way the pointers meet is through the <code>s == target</code> return. Hence the algorithm " +
          "is exact.</p>"
      },
      {
        title: "Correctness for an optimisation objective",
        sub: "container with most water",
        body:
          "<p>Objective <code>A(l, r) = min(h[l], h[r]) * (r - l)</code>. Assume <code>h[l] &lt; h[r]</code> and " +
          "consider any pair <code>(l, j)</code> with <code>j &lt; r</code>. Then " +
          "<code>min(h[l], h[j]) &le; h[l]</code> and <code>(j - l) &lt; (r - l)</code>, so " +
          "<code>A(l, j) &lt; A(l, r)</code>.</p>" +
          "<p>Every remaining pair that uses the shorter wall is strictly worse than the pair we just evaluated, so " +
          "discarding index l cannot discard a unique optimum. The argument is the same exchange-style reasoning as " +
          "above, but with <em>&ldquo;not better&rdquo;</em> replacing <em>&ldquo;not a solution&rdquo;</em> &mdash; " +
          "this is the template for adapting two pointers to a maximisation objective.</p>"
      },
      {
        title: "Complexity proof",
        sub: "monotone potential",
        body:
          "<p><strong>Time.</strong> Define the potential <code>P = l + (n - 1 - r)</code>, the number of positions " +
          "consumed from the two ends. Initially <code>P = 0</code>; the loop condition <code>l &lt; r</code> forces " +
          "<code>P &le; n - 2</code>; every iteration increments P by exactly 1. Therefore the loop body runs at most " +
          "<code>n - 1</code> times, each iteration doing O(1) work: <strong>O(n) total</strong>.</p>" +
          "<p><strong>Space.</strong> Two integer indices, so O(1) auxiliary. Sorting, when required, dominates the time " +
          "at O(n log n) and adds O(log n) stack space for Timsort&rsquo;s merge bookkeeping.</p>" +
          "<p><strong>3Sum.</strong> The outer loop runs n times; each inner two-pointer scan is O(n) by the potential " +
          "argument, giving O(n&sup2;) after an O(n log n) sort. The bound is tight and also optimal in the sense that " +
          "the output itself can contain &Theta;(n&sup2;) triplets.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "The proof requires you to move the pointer at the <strong>shorter</strong> wall. Moving the taller one is not " +
        "justified: <code>min(h[l], h[j])</code> can rise when the short wall is kept, so pairs you would delete may " +
        "still be optimal. On a tie, either move is safe because both pairs evaluated next are dominated by the current one."
    },
    table: {
      caption: "Complexity of the standard forms",
      head: ["Form", "Time", "Aux space", "Comment"],
      rows: [
        ["Pair sum, already sorted", "O(n)", "O(1)", "beats hashing on space"],
        ["Pair sum, unsorted, values needed", "O(n log n)", "O(1)", "sort then scan"],
        ["Pair sum, unsorted, indices needed", "O(n)", "O(n)", "use a hash map instead <span class='topic-ref'>topic 01</span>"],
        ["In-place compaction / dedup", "O(n)", "O(1)", "single pass, write pointer"],
        ["Palindrome check", "O(n)", "O(1)", "n/2 comparisons"],
        ["3Sum", "O(n&sup2;)", "O(1) aux", "sort + n two-pointer scans"],
        ["4Sum", "O(n&sup3;)", "O(1) aux", "two fixed indices + scan"],
        ["Trapping Rain Water", "O(n)", "O(1)", "prefix maxima tracked on the fly"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "The single question that separates two pointers from sliding window: <strong>are the pointers bounding a " +
        "pair, or bounding a contiguous block?</strong> Two pointers evaluates the endpoints " +
        "<code>(a[l], a[r])</code> and moves them toward each other; sliding window evaluates the <em>contents</em> of " +
        "<code>a[l..r]</code> and moves both pointers in the same direction. If the answer depends on what is inside " +
        "the window, it is a window. If it depends only on the two ends, it is two pointers."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["sorted input (or you may sort) + &ldquo;find a pair/triplet summing to X&rdquo;", "two pointers", "hashing costs O(n) space for no time gain once sorted"],
      ["unsorted + &ldquo;return the indices&rdquo;", "hash map <span class='topic-ref'>topic 01</span>", "sorting destroys the indices"],
      ["&ldquo;contiguous subarray/substring&rdquo; + a predicate on its contents", "sliding window <span class='topic-ref'>topic 03</span>", "endpoints alone do not determine validity"],
      ["contiguous + values can be negative", "prefix sums + hash", "shrinking no longer restores validity monotonically"],
      ["&ldquo;in-place, O(1) extra space, remove/partition/move&rdquo;", "fast/slow pointers", "a second array violates the space constraint"],
      ["sorted + &ldquo;count pairs with sum &lt; X&rdquo;", "two pointers (count <code>r - l</code> at once)", "per-element binary search is O(n log n)"],
      ["&ldquo;k-th smallest pair sum / distance&rdquo;", "binary search on the answer + two pointers", "direct enumeration is O(n&sup2;)"],
      ["cycle detection in a sequence or list", "fast/slow (Floyd) <span class='topic-ref'>topic 06</span>", "a visited set costs O(n) space"],
      ["need all pairs regardless of order, small n", "brute force", "two pointers needs a monotone structure to exploit"]
    ],
    after:
      "<p><strong>Against binary search:</strong> if the data is sorted and you want one partner for one fixed element, " +
      "binary search is O(log n) and two pointers is overkill. If you want partners for <em>every</em> element, two " +
      "pointers amortises to O(1) per element and beats the O(n log n) of n binary searches.</p>" +
      "<p><strong>Against heaps:</strong> two pointers cannot handle dynamic insertion; once you need &ldquo;add " +
      "elements as you go and query extremes&rdquo;, switch to a heap.</p>"
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>n == 0</code>", "<code>r = len(a) - 1 = -1</code>; <code>while l &lt; r</code> is false so it is safe, but <code>a[r]</code> outside the guard reads the last element"],
      ["<code>n == 1</code>", "any <code>while l &lt; r</code> body never runs; code that assumes at least one comparison returns garbage"],
      ["<code>while l &le; r</code> instead of <code>l &lt; r</code>", "pairs an index with itself: &ldquo;two sum&rdquo; accepts <code>2 * a[i] == target</code>"],
      ["duplicates in 3Sum", "the same triplet is emitted many times; needs a skip at the fixed index <em>and</em> after each hit"],
      ["all elements equal", "3Sum dedup must collapse to at most one triplet; naive skips still emit O(n) copies"],
      ["target unreachable", "must return <code>[]</code> / <code>-1</code>, not fall through to an undefined value"],
      ["odd-length palindrome", "<code>l &lt; r</code> correctly skips the centre; <code>l &le; r</code> compares a character to itself (harmless but signals confusion)"],
      ["non-alphanumeric filtering", "&ldquo;Valid Palindrome&rdquo; needs both pointers to skip junk before comparing, <em>inside</em> <code>while l &lt; r</code>"],
      ["write pointer starting at 0 vs 1", "dedup with <code>w = 0</code> compares against <code>a[-1]</code>, silently using the last element"],
      ["in-place with <code>a[w] = a[r]</code> when <code>w == r</code>", "a no-op, which is fine; but <em>swapping</em> instead of assigning breaks sorted order"],
      ["sorted descending", "every inequality flips; always assert the sort direction out loud"],
      ["huge values", "Python has no overflow, but stating &ldquo;no overflow risk in Python, would need care in C++&rdquo; scores points"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "<code>l &le; r</code> allows an index to pair with itself",
      wrong: [
        "l, r = 0, len(a) - 1",
        "while l <= r:",
        "    s = a[l] + a[r]",
        "    ...",
        "",
        "# a=[3,4], target=6 -> l=r=0, 3+3=6",
        "# returns [0,0]: a single 3 used twice"
      ],
      right: [
        "l, r = 0, len(a) - 1",
        "while l < r:",
        "    s = a[l] + a[r]",
        "    ...",
        "",
        "# a=[3,4], target=6 -> no pair, returns []"
      ],
      note:
        "Use <code>l &lt; r</code> whenever the two pointers must land on <em>distinct</em> elements, and " +
        "<code>l &le; r</code> only when the pointers scan a region for their own sake (binary search bounds, or " +
        "Dutch-flag partitioning where <code>mid</code> may equal <code>hi</code>)."
    },
    {
      n: 2,
      title: "3Sum de-duplication at only one of the two levels",
      wrong: [
        "for i in range(n - 2):",
        "    if i and a[i] == a[i-1]:",
        "        continue          # outer dedup only",
        "    l, r = i + 1, n - 1",
        "    while l < r:",
        "        s = a[i] + a[l] + a[r]",
        "        if s == 0:",
        "            out.append([a[i],a[l],a[r]])",
        "            l += 1; r -= 1    # no inner dedup",
        "        elif s < 0: l += 1",
        "        else: r -= 1"
      ],
      right: [
        "for i in range(n - 2):",
        "    if a[i] > 0: break        # pruning, sorted input",
        "    if i and a[i] == a[i-1]:",
        "        continue",
        "    l, r = i + 1, n - 1",
        "    while l < r:",
        "        s = a[i] + a[l] + a[r]",
        "        if s == 0:",
        "            out.append([a[i],a[l],a[r]])",
        "            l += 1; r -= 1",
        "            while l < r and a[l] == a[l-1]:",
        "                l += 1        # inner dedup",
        "        elif s < 0: l += 1",
        "        else: r -= 1"
      ],
      note:
        "On <code>a = [-2,0,0,2,2]</code> the wrong version emits <code>[-2,0,2]</code> twice. Advancing <code>l</code> " +
        "past equal values after a hit is mandatory; advancing <code>r</code> too is optional, since a duplicate " +
        "<code>r</code> with the new <code>l</code> gives a different sum and is rejected anyway."
    },
    {
      n: 3,
      title: "Moving the taller wall in Container With Most Water",
      wrong: [
        "while l < r:",
        "    best = max(best,",
        "        min(h[l],h[r]) * (r - l))",
        "    if h[l] > h[r]:",
        "        l += 1   # discards the TALL wall",
        "    else:",
        "        r -= 1",
        "",
        "# h=[1,8,6,2,5,4,8,3,7] -> 8, not 49"
      ],
      right: [
        "while l < r:",
        "    best = max(best,",
        "        min(h[l],h[r]) * (r - l))",
        "    if h[l] < h[r]:",
        "        l += 1   # discard the SHORT wall",
        "    else:",
        "        r -= 1",
        "",
        "# h=[1,8,6,2,5,4,8,3,7] -> 49"
      ],
      note:
        "The dominance proof only licenses deleting the <em>short</em> wall. Getting this backwards is the most common " +
        "silent wrong-answer in the topic, because the code still runs in O(n) and still returns a plausible number."
    },
    {
      n: 4,
      title: "Write pointer initialised so it reads outside the finished region",
      wrong: [
        "w = 0",
        "for r in range(len(a)):",
        "    if a[r] != a[w - 1]:   # w-1 == -1 first",
        "        a[w] = a[r]; w += 1",
        "",
        "# a=[1,2,3] -> compares 1 against a[-1]==3",
        "# drops elements when the array ends",
        "# with the first value"
      ],
      right: [
        "if not a:",
        "    return 0",
        "w = 1                  # a[0] is always kept",
        "for r in range(1, len(a)):",
        "    if a[r] != a[w - 1]:",
        "        a[w] = a[r]; w += 1",
        "return w"
      ],
      note:
        "The invariant <code>a[0:w]</code> <em>is the finished prefix</em> must hold before the first comparison. " +
        "Starting at <code>w = 1</code> establishes it for free, and the empty-array guard is what keeps " +
        "<code>a[0]</code> a legal read."
    }
  ],

  practice: {
    caption: "Drill set for Two Pointers",
    rows: [
      ["Valid Palindrome", "LC 125", "Easy", "mirror scan with in-loop filtering of non-alphanumerics"],
      ["Merge Sorted Array", "LC 88", "Easy", "writing backwards from the end to avoid clobbering"],
      ["Remove Duplicates from Sorted Array", "LC 26", "Easy", "write-pointer invariant, return length not array"],
      ["Two Sum II", "LC 167", "Medium", "the core elimination argument, 1-based output"],
      ["3Sum", "LC 15", "Medium", "sort + fix + scan, two-level de-duplication"],
      ["3Sum Closest", "LC 16", "Medium", "objective becomes minimise <code>abs(s - target)</code>, no early exit"],
      ["Sort Colors", "LC 75", "Medium", "Dutch national flag, three pointers, <code>mid &le; hi</code> bound"],
      ["Trapping Rain Water", "LC 42", "Hard", "prefix maxima from both ends, O(1) space version"]
    ]
  },

  quiz: [
    {
      prompt: "Sorted input, and the prompt asks for a <strong>pair summing to X</strong>.",
      options: ["Two pointers", "Hash map", "Sliding window", "Heap"],
      answer: 0,
      why: "Hashing costs O(n) space for no time gain once the data is sorted. Converging pointers do it in O(1) space."
    },
    {
      prompt: "Unsorted input, and the prompt asks you to <strong>return the indices</strong>.",
      options: ["Two pointers", "Hash map", "Binary search", "Sort + scan"],
      answer: 1,
      why: "Sorting destroys the indices. This is the one case where you must pay O(n) space for a map."
    },
    {
      prompt: "&ldquo;Longest <strong>contiguous substring</strong> satisfying a predicate on its contents.&rdquo;",
      options: ["Two pointers", "Sliding window", "Hash set", "Prefix fold"],
      answer: 1,
      why: "The endpoints alone do not determine validity — the answer depends on what is inside the window. Contents means window."
    },
    {
      prompt: "Contiguous subarray, target on the sum, and <strong>values can be negative</strong>.",
      options: ["Sliding window", "Prefix sums + hash", "Two pointers", "Heap"],
      answer: 1,
      why: "Shrinking no longer restores validity monotonically once negatives are allowed, so the window invariant collapses."
    },
    {
      prompt: "&ldquo;Remove / partition / move elements <strong>in place, O(1) extra space</strong>.&rdquo;",
      options: ["Fast/slow pointers", "Hash set", "Sort first", "Build a new array"],
      answer: 0,
      why: "A second array violates the space constraint. A read pointer plus a write pointer rewrites in place in one pass."
    },
    {
      prompt: "Sorted array, &ldquo;<strong>count</strong> pairs with sum &lt; X&rdquo;.",
      options: ["Binary search per element", "Two pointers, counting r − l at once", "Hash map", "Heap"],
      answer: 1,
      why: "When a[l] + a[r] < X, every index between l and r also works, so you add r − l in one move. Per-element binary search is O(n log n) for the same answer."
    },
    {
      prompt: "&ldquo;Find the <strong>k-th smallest pair distance</strong>.&rdquo;",
      options: ["Direct enumeration", "Binary search on the answer + two pointers", "Sort the pairs", "Heap of all pairs"],
      answer: 1,
      why: "Enumerating pairs is O(n²). Guess a distance, count pairs below it with a two-pointer sweep, and binary search the guess."
    },
    {
      prompt: "Detect a <strong>cycle</strong> in a sequence or linked list.",
      options: ["Visited set", "Fast/slow pointers (Floyd)", "Sort", "Two converging pointers"],
      answer: 1,
      why: "A visited set costs O(n) space. Floyd's tortoise and hare does it in O(1) — see topic 06 for the algebra of the meeting point."
    },
    {
      prompt: "You want one partner for <strong>one fixed element</strong> in a sorted array.",
      options: ["Two pointers", "Binary search", "Hash map", "Sliding window"],
      answer: 1,
      why: "Two pointers is overkill for a single query: binary search is O(log n). Two pointers wins only when you need partners for every element."
    }
  ]
};
