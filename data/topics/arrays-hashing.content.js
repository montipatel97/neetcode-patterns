/* Topic content, transcribed from the Arrays and Hashing chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["arrays-hashing"] = {
  id: "arrays-hashing",
  number: "01",
  title: "Arrays and Hashing",
  subtitle: "Complement maps, canonical keys, frequency counts, prefix/suffix folds",
  accent: "teal",
  bounds: { time: "O(n)", space: "O(n)", driver: "one pass, expected O(1) hash ops" },

  mechanics: {
    lede:
      "Everything in this topic is one idea applied three ways: <strong>replace a search with a lookup</strong>. " +
      "A nested loop asks &ldquo;does a partner for <code>a[i]</code> exist somewhere?&rdquo; in O(n) per query. " +
      "A hash table answers the same question in expected O(1), so the O(n&sup2;) collapses to O(n). " +
      "The three mechanisms below cover essentially every problem in the section.",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "Complement / index map (one pass)",
        blurb:
          "Walk left to right. Before you insert the current element, ask whether the element that completes it has already been inserted.",
        caption: "Canonical complement-map loop",
        code: [
          "def two_sum(nums, target):          # value -> index, over the strict prefix",
          "    seen = {}",
          "    for i, x in enumerate(nums):    # ask BEFORE inserting",
          "        need = target - x",
          "        if need in seen:",
          "            return [seen[need], i]",
          "        seen[x] = i                 # extend the prefix",
          "    return []"
        ],
        invariant:
          "At the top of iteration <code>i</code>, <code>seen</code> holds exactly the pairs " +
          "<code>{a[j]: j}</code> for all <code>j &lt; i</code> &mdash; the strict prefix, never including " +
          "<code>i</code> itself. Every read is therefore a question about the past only, which is what makes " +
          "the &ldquo;same element used twice&rdquo; bug <em>structurally impossible</em> rather than merely unlikely."
      },
      {
        tag: "Mechanism B",
        name: "Canonical key / grouping",
        blurb:
          "Choose a function k(x) that maps an object to a hashable signature that is equal exactly when two objects belong in the same group. Bucket by k(x).",
        caption: "Grouping by canonical key (count-vector key beats sorted key)",
        code: [
          "from collections import defaultdict",
          "",
          "def group_anagrams(strs):",
          "    groups = defaultdict(list)",
          "    for s in strs:",
          "        key = [0] * 26",
          "        for ch in s:",
          "            key[ord(ch) - 97] += 1",
          "        groups[tuple(key)].append(s)   # tuple is hashable, list is not",
          "    return list(groups.values())"
        ],
        invariant:
          "After processing a prefix of <code>strs</code>, for every key <code>k</code> seen so far, " +
          "<code>groups[k]</code> is exactly the list of processed strings <code>s</code> with " +
          "<code>k(s) == k</code>, in input order. Group identity is decided by the key alone, never by " +
          "comparing two members to each other."
      },
      {
        tag: "Mechanism C",
        name: "Prefix / suffix fold",
        blurb:
          "To answer &ldquo;aggregate of everything except / before / after index i&rdquo; for all i, carry a running fold left to right, then a second running fold right to left, writing into the output array in place.",
        caption: "Two-pass prefix/suffix fold, O(1) auxiliary space",
        code: [
          "def product_except_self(nums):",
          "    n = len(nums)",
          "    res = [1] * n",
          "    pre = 1",
          "    for i in range(n):              # res[i] = product of nums[:i]",
          "        res[i] = pre",
          "        pre *= nums[i]",
          "    suf = 1",
          "    for i in range(n - 1, -1, -1):  # multiply in product of nums[i+1:]",
          "        res[i] *= suf",
          "        suf *= nums[i]",
          "    return res"
        ],
        invariant:
          "After the forward pass, <code>res[i] = prod(nums[0..i-1])</code> and <code>pre = prod(nums[0..i])</code>. " +
          "After the backward pass reaches <code>i</code>, <code>suf = prod(nums[i+1..n-1])</code>, so the in-place " +
          "multiply turns <code>res[i]</code> into <code>prod(all except i)</code>. The output array doubles as the " +
          "scratch buffer, which is why aux space is O(1) even though the answer is O(n)."
      }
    ],
    aside: {
      title: "What a hash table actually does",
      body:
        "A dict is a bucket array of size m plus a hash function. <code>hash(key) mod m</code> picks a slot; CPython " +
        "resolves collisions by open addressing with a perturbation sequence, and grows m (doubling-ish) whenever the " +
        "load factor &alpha; = n/m exceeds 2/3. Two requirements you must respect: the key must be " +
        "immutable-by-convention (<code>__hash__</code> stable for its lifetime), and <code>__hash__</code> must agree " +
        "with <code>__eq__</code>. Violate the first with a mutated list and you get a <code>TypeError</code>; violate " +
        "the second and entries silently disappear."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "Correctness of Mechanism A",
        sub: "soundness and completeness",
        body:
          "<p><strong>Soundness.</strong> If the loop returns <code>[seen[need], i]</code>, then <code>need</code> was " +
          "inserted at some index <code>j &lt; i</code>, so <code>nums[j] == need == target - nums[i]</code>, hence " +
          "<code>nums[j] + nums[i] == target</code> and <code>j != i</code>. Any returned pair is a genuine solution.</p>" +
          "<p><strong>Completeness.</strong> Suppose a solution <code>(p, q)</code> exists with <code>p &lt; q</code>. " +
          "Consider the iteration <code>i = q</code> (the loop reaches it unless it returned earlier, which by soundness " +
          "is also a correct answer). By the invariant, <code>seen</code> contains every index <code>&lt; q</code>, in " +
          "particular <code>p</code>, so <code>seen</code> contains the key " +
          "<code>nums[p] = target - nums[q] = need</code>, and the branch fires. Therefore the loop cannot terminate " +
          "empty while a solution exists.</p>" +
          "<p>Soundness plus completeness gives exact correctness in a single pass &mdash; no second pass is needed, " +
          "because the pair is detected at its later index.</p>"
      },
      {
        title: "Correctness of Mechanism B",
        sub: "complete invariant argument",
        body:
          "<p>Define <code>x ~ y</code> iff x and y are anagrams. This is an equivalence relation. The count vector " +
          "<code>k</code> satisfies <code>k(x) == k(y)</code> iff x and y have identical multisets of characters, which " +
          "is precisely <code>x ~ y</code>. So k is a <strong>complete invariant</strong>: it separates non-equivalent " +
          "items and never separates equivalent ones. Bucketing by a complete invariant therefore reproduces the " +
          "equivalence classes exactly.</p>" +
          "<p>This is the property to check whenever you invent a key &mdash; a key that is merely <em>necessary</em> " +
          "(for example, string length, or sum of character codes) produces over-merged buckets and wrong answers.</p>"
      },
      {
        title: "Correctness of Mechanism C",
        sub: "induction",
        body:
          "<p><strong>Claim:</strong> after the forward pass, <code>res[i] = prod(nums[0..i-1])</code> for all i, with " +
          "the empty product 1.</p>" +
          "<p><strong>Base:</strong> at <code>i = 0</code>, <code>pre = 1 = prod(empty)</code>, and " +
          "<code>res[0] = pre</code>. <strong>Step:</strong> if <code>pre</code> equals " +
          "<code>prod(nums[0..i-1])</code> when the body starts at i, then <code>res[i]</code> receives exactly that, " +
          "and <code>pre *= nums[i]</code> makes <code>pre = prod(nums[0..i])</code>, which is the hypothesis for " +
          "<code>i+1</code>.</p>" +
          "<p>The backward pass is the mirror image with <code>suf</code>, and the two folds are independent, so " +
          "multiplying them gives <code>prod(nums[0..i-1]) &middot; prod(nums[i+1..n-1])</code>, the answer at i. Note " +
          "that <strong>no division is used anywhere</strong>, which is what makes zeros harmless.</p>"
      },
      {
        title: "Complexity proof",
        sub: "amortised accounting, not assertion",
        body:
          "<p><strong>Per-operation cost.</strong> Under simple uniform hashing with load factor &alpha;, the expected " +
          "number of probes for an unsuccessful open-addressing lookup is <code>1/(1 - &alpha;)</code>. CPython keeps " +
          "&alpha; &le; 2/3, so the expected probe count is at most 3 &mdash; a constant independent of n. Hence insert " +
          "and lookup are expected O(1).</p>" +
          "<p><strong>Resizing is free in amortised terms.</strong> A resize rehashes all n entries at cost O(n), but " +
          "only when the table doubles. Starting from size 8, the total rehash work after n inserts is bounded by " +
          "<code>8 + 16 + ... + n &lt; 2n</code>, a geometric series. Spread over n inserts, that is O(1) amortised " +
          "each. (Potential-function form: define <code>&Phi; = 2n - m</code>; each insert pays 1 unit of real work " +
          "plus at most 2 units into the potential, and a resize is funded entirely from &Phi;.)</p>" +
          "<p><strong>Total.</strong> Mechanism A performs one dict lookup and at most one insert per element: n " +
          "expected-O(1) operations, so O(n) expected time; the dict holds at most n keys, so O(n) space. Mechanism B " +
          "additionally spends O(L) building the key for a string of length L, giving O(sum of L). Mechanism C is two " +
          "linear passes with two scalar accumulators: O(n) time, O(1) aux.</p>"
      }
    ],
    callout: {
      kind: "trap",
      label: "Trap",
      body:
        "The O(n) bound is <strong>expected</strong>, not worst case. If every key hashes to one bucket, each lookup " +
        "degrades to O(n) and the total to O(n&sup2;). This is reachable by an adversary for <code>int</code> keys, " +
        "since <code>hash(i) == i</code> for small ints, while <code>str</code> and <code>bytes</code> hashes are " +
        "randomised per process (<code>PYTHONHASHSEED</code>). Saying <em>&ldquo;expected O(n), worst case O(n&sup2;) " +
        "under adversarial hash collisions&rdquo;</em> is the answer that lands well in a quant interview."
    },
    table: {
      caption: "Complexity by mechanism",
      head: ["Variant", "Time", "Aux space", "Note"],
      rows: [
        ["Complement map", "O(n) expected", "O(n)", "one pass, detect at later index"],
        ["Frequency count, alphabet A", "O(n + A)", "O(A)", "fixed array beats dict for A &le; 128"],
        ["Group by count-vector key", "O(n &middot; L)", "O(n &middot; L)", "L = string length, A treated as const"],
        ["Group by sorted-string key", "O(n &middot; L log L)", "O(n &middot; L)", "simpler to write, strictly slower"],
        ["Prefix/suffix fold", "O(n)", "O(1)", "output array reused as scratch"],
        ["Set-frontier scan (runs)", "O(n) expected", "O(n)", "amortised: each value walked once"],
        ["<code>nums.count(x)</code> inside a loop", "O(n&sup2;)", "O(1)", "the classic accidental quadratic"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules. This is the highest-value section per unit of reading time.",
    head: ["Signal in the prompt", "Reach for", "Not this, because"],
    rows: [
      ["&ldquo;return the indices&rdquo;", "hash map", "sorting destroys original indices"],
      ["&ldquo;return the values / the pair&rdquo; and O(1) space is demanded", "sort + two pointers", "a dict costs O(n) space"],
      ["&ldquo;count / group / detect duplicates&rdquo;, order irrelevant", "hash set or dict", "sorting adds a log factor for nothing"],
      ["Values bounded and small (letters, 0..100, digits)", "fixed-size list", "a dict pays hashing per access for no benefit"],
      ["&ldquo;k most frequent&rdquo;, k &lt;&lt; n", "dict + heap or bucket sort", "full sort is O(n log n) vs O(n log k)"],
      ["Range-sum / range-aggregate queries, values may be negative", "prefix sums + hash", "sliding window needs monotone contribution"],
      ["Contiguous subarray, all values non-negative, target on the sum", "sliding window <span class='topic-ref'>topic 03</span>", "prefix+hash also works but is more code"],
      ["Prefix / autocomplete / shared-prefix queries", "trie <span class='topic-ref'>topic 08</span>", "a dict only answers exact keys"],
      ["Need the k-th smallest, not the whole order", "heap or quickselect <span class='topic-ref'>topic 09</span>", "sorting computes more than asked"]
    ],
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "The fastest live-interview discriminator: ask <em>&ldquo;do I need order, or only membership?&rdquo;</em> " +
        "Membership only &rarr; hash. Order or adjacency &rarr; sort, then very likely two pointers. Order and dynamic " +
        "updates &rarr; heap or balanced structure. If you additionally need original positions, you cannot sort in " +
        "place; sort <code>(value, index)</code> pairs or fall back to the map."
    }
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["<code>nums == []</code>", "prefix folds return <code>[]</code> correctly, but <code>max(...)</code> on an empty generator raises <code>ValueError</code>"],
      ["<code>n == 1</code>", "Product Except Self must return <code>[1]</code>, not <code>[]</code>; guard loops that assume <code>i+1</code> exists"],
      ["<code>target == 2 * x</code> and x appears once", "inserting before checking returns <code>[i, i]</code> &mdash; an invalid pair"],
      ["duplicate values in a value&rarr;index dict", "later index silently overwrites earlier; fine for Two Sum, wrong for &ldquo;first occurrence&rdquo;"],
      ["a single zero in the array", "division-based Product Except Self raises <code>ZeroDivisionError</code>"],
      ["two or more zeros", "division &ldquo;fix up&rdquo; logic gives wrong non-zero entries; prefix/suffix needs no special case"],
      ["all elements identical", "Longest Consecutive must return 1, and must not re-walk the run per duplicate (O(n&sup2;))"],
      ["huge value range (-10<sup>9</sup>..10<sup>9</sup>)", "counting array is infeasible; must use a dict"],
      ["mixed int / float keys", "<code>hash(1) == hash(1.0)</code> and <code>1 == 1.0</code>, so <code>{1: 'a', 1.0: 'b'}</code> has one entry"],
      ["mutable key (<code>sorted(s)</code> is a list)", "<code>TypeError: unhashable type: 'list'</code>"],
      ["case / unicode in anagrams", "<code>ord(ch) - 97</code> indexes out of range for uppercase or non-ASCII"],
      ["negative numbers with prefix sums", "any sliding-window shortcut becomes invalid; only prefix+hash is sound"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "Inserting into the map before querying it (self-pairing)",
      wrong: [
        "for i, x in enumerate(nums):",
        "    seen[x] = i              # inserted too early",
        "    if target - x in seen:",
        "        return [seen[target - x], i]",
        "",
        "# nums=[3,1], target=6 -> returns [0,0]"
      ],
      right: [
        "for i, x in enumerate(nums):",
        "    if target - x in seen:",
        "        return [seen[target - x], i]",
        "    seen[x] = i              # extend after querying",
        "",
        "# nums=[3,1], target=6 -> returns []"
      ],
      note:
        "The query must see the strict prefix. Ordering the two statements correctly is the entire fix; no " +
        "<code>if j != i</code> guard is needed, and adding one hides the real defect."
    },
    {
      n: 2,
      title: "Unhashable or non-canonical grouping key",
      wrong: [
        "key = sorted(s)              # list -> unhashable",
        "groups[key].append(s)",
        "# TypeError: unhashable type: 'list'",
        "",
        "key = sum(ord(c) for c in s)",
        "# 'ad' and 'bc' collide -> over-merged"
      ],
      right: [
        "key = ''.join(sorted(s))     # or tuple(counts)",
        "groups[key].append(s)",
        "",
        "# count vector is a complete invariant:",
        "key = tuple(counts)          # len 26"
      ],
      note:
        "A key must be both hashable and <em>complete</em>. A merely necessary key (length, character-code sum) " +
        "over-merges buckets and silently returns wrong groups."
    },
    {
      n: 3,
      title: "Division in Product Except Self",
      wrong: [
        "total = 1",
        "for x in nums:",
        "    total *= x",
        "return [total // x for x in nums]",
        "",
        "# nums=[2,3,0,4] -> ZeroDivisionError"
      ],
      right: [
        "# two folds, no division at all",
        "pre = 1",
        "for i in range(n):",
        "    res[i] = pre; pre *= nums[i]",
        "suf = 1",
        "for i in range(n - 1, -1, -1):",
        "    res[i] *= suf; suf *= nums[i]"
      ],
      note:
        "Interviewers almost always add &ldquo;without division&rdquo; after you propose it, so skip the detour. The " +
        "zero cases are also where the division patch-up gets subtly wrong: one zero means every other slot is 0, two " +
        "zeros mean every slot is 0."
    },
    {
      n: 4,
      title: "Rebuilding runs from every element instead of only from run starts",
      wrong: [
        "best = 0",
        "for n in nums:          # iterates the LIST",
        "    cur = n; run = 1",
        "    while cur + 1 in s: # no start guard",
        "        cur += 1; run += 1",
        "    best = max(best, run)",
        "",
        "# [1,1,1,...,1,2,3,...,m] -> O(n*m)"
      ],
      right: [
        "best = 0",
        "s = set(nums)",
        "for n in s:             # iterate the SET",
        "    if n - 1 in s:",
        "        continue        # not a run start",
        "    cur = n; run = 1",
        "    while cur + 1 in s:",
        "        cur += 1; run += 1",
        "    best = max(best, run)"
      ],
      note:
        "Two defects, both needed for the O(n) bound: iterate the set (so duplicates cannot trigger repeated walks) " +
        "and skip any n with <code>n-1</code> present (so each run is walked from its unique left endpoint exactly once)."
    }
  ],

  practice: {
    caption: "Drill set for Arrays and Hashing",
    rows: [
      ["Contains Duplicate", "LC 217", "Easy", "set-vs-list membership; the <code>len(set(x))</code> one-liner"],
      ["Valid Anagram", "LC 242", "Easy", "count vector, alphabet assumptions, unicode caveat"],
      ["Group Anagrams", "LC 49", "Medium", "canonical key design, complete-invariant reasoning"],
      ["Top K Frequent Elements", "LC 347", "Medium", "dict + heap O(n log k) vs bucket sort O(n)"],
      ["Encode and Decode Strings", "LC 271", "Medium", "length-prefix framing; delimiter injection"],
      ["Valid Sudoku", "LC 36", "Medium", "three key families at once; <code>(r//3, c//3)</code> box key"],
      ["Subarray Sum Equals K", "LC 560", "Medium", "prefix sums + hash with negatives; seed <code>{0: 1}</code>"],
      ["First Missing Positive", "LC 41", "Hard", "index-as-hash in place, O(1) space, cyclic placement"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;Return the <strong>indices</strong> of the two numbers that add to target.&rdquo;",
      options: ["Hash map", "Sort + two pointers", "Sliding window", "Heap"],
      answer: 0,
      why: "Sorting destroys the original indices. The moment a prompt asks for positions, you cannot reorder in place."
    },
    {
      prompt: "&ldquo;Return the two <strong>values</strong> that add to target, using O(1) extra space.&rdquo;",
      options: ["Hash map", "Sort + two pointers", "Prefix sums + hash", "Trie"],
      answer: 1,
      why: "A dict costs O(n) space. With values-only output and an O(1) space demand, sort in place and converge two pointers."
    },
    {
      prompt: "&ldquo;Count duplicates&rdquo; &mdash; order of the output is irrelevant.",
      options: ["Sort first", "Hash set or dict", "Heap", "Two pointers"],
      answer: 1,
      why: "Sorting adds a log factor for nothing. Membership-only questions are answered by a hash in expected O(n)."
    },
    {
      prompt: "Values are bounded and small &mdash; lowercase letters, or 0..100.",
      options: ["Fixed-size list", "Dict", "Trie", "Heap"],
      answer: 0,
      why: "A dict pays hashing per access for no benefit. A length-26 or length-101 array is a perfect hash with zero collisions."
    },
    {
      prompt: "&ldquo;k most frequent elements&rdquo;, with k much smaller than n.",
      options: ["Full sort", "Dict + heap, or bucket sort", "Two pointers", "Prefix fold"],
      answer: 1,
      why: "A full sort is O(n log n); a dict plus a size-k heap is O(n log k), and bucket sort on frequency is O(n)."
    },
    {
      prompt: "Range-sum queries where the array <strong>may contain negatives</strong>.",
      options: ["Sliding window", "Prefix sums + hash", "Two pointers", "Hash set"],
      answer: 1,
      why: "A sliding window needs monotone contribution to be sound. Negatives break that, so only prefix + hash survives."
    },
    {
      prompt: "Contiguous subarray, <strong>all values non-negative</strong>, target on the sum.",
      options: ["Sliding window", "Prefix sums + hash", "Sort + two pointers", "Trie"],
      answer: 0,
      why: "Prefix+hash also works, but is more code. Non-negativity makes the sum monotone in window width, which is exactly the sliding-window precondition."
    },
    {
      prompt: "Autocomplete / shared-prefix queries over a dictionary of words.",
      options: ["Hash map", "Trie", "Heap", "Prefix fold"],
      answer: 1,
      why: "A dict only answers exact keys. Prefix structure is what a trie encodes in its edges."
    },
    {
      prompt: "You need the k-th smallest element, not the whole sorted order.",
      options: ["Sort", "Heap or quickselect", "Hash map", "Sliding window"],
      answer: 1,
      why: "Sorting computes far more than was asked. Quickselect is O(n) expected; a size-k heap is O(n log k)."
    }
  ]
};
