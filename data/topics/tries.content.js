/* Topic content, transcribed from the Tries chapter. */
window.CONTENT = window.CONTENT || {};

window.CONTENT["tries"] = {
  id: "tries",
  number: "08",
  title: "Tries",
  subtitle: "Prefix trees, the prefix-to-node bijection, wildcard DFS, and trie-pruned grid search",
  accent: "red",
  bounds: { time: "O(L) per op", space: "O(A&middot;N&middot;L)", driver: "path length = key length" },

  mechanics: {
    lede:
      "A trie turns a set of strings into a tree in which <strong>every path from the root spells a prefix</strong>. " +
      "That one structural fact is what makes prefix queries into subtree queries, and what makes a lookup cost " +
      "O(key length) rather than O(number of keys).",
    mechanisms: [
      {
        tag: "Mechanism A",
        name: "The node and the three core operations",
        blurb: "One walk, three endings. <code>search</code> and <code>startsWith</code> differ only in the final test.",
        caption: "Dict-based trie",
        code: [
          "class TrieNode:",
          "    __slots__ = ('kids', 'word')   # per-instance!",
          "    def __init__(self):",
          "        self.kids = {}             # char -> TrieNode",
          "        self.word = False          # does a word END here?",
          "",
          "def insert(self, w):",
          "    node = self.root",
          "    for ch in w:",
          "        node = node.kids.setdefault(ch, TrieNode())",
          "    node.word = True               # NOT optional",
          "",
          "def _walk(self, w):     # node for prefix w, or None",
          "    node = self.root",
          "    for ch in w:",
          "        node = node.kids.get(ch)",
          "        if node is None:",
          "            return None",
          "    return node",
          "",
          "def search(self, w):",
          "    node = self._walk(w)",
          "    return node is not None and node.word",
          "",
          "def starts_with(self, p):",
          "    return self._walk(p) is not None"
        ],
        invariant:
          "After consuming a prefix p, <code>node</code> is the <em>unique</em> node reachable from the root by spelling " +
          "p, and the set of stored words beginning with p is exactly the set of nodes marked <code>word</code> in that " +
          "node&rsquo;s subtree."
      },
      {
        tag: "Mechanism B",
        name: "Wildcard search (DFS at the branch points)",
        blurb:
          "A <code>.</code> matches any single character, so the walk stops being deterministic and becomes a DFS that " +
          "forks over all children at that position.",
        caption: "Fork on the dot, pin otherwise",
        code: [
          "def search(self, w):",
          "    def dfs(i, node):",
          "        if i == len(w):",
          "            return node.word",
          "        ch = w[i]",
          "        if ch == '.':",
          "            return any(dfs(i + 1, kid)",
          "                       for kid in node.kids.values())",
          "        kid = node.kids.get(ch)",
          "        return kid is not None and dfs(i + 1, kid)",
          "    return dfs(0, self.root)"
        ],
        invariant:
          "At depth i, <code>node</code> is a node whose root path is consistent with <code>w[:i]</code>. " +
          "<code>any(...)</code> is exhaustive over the admitted branches &mdash; returning after the first child " +
          "instead would test one branch and reject patterns that match via another."
      },
      {
        tag: "Mechanism C",
        name: "Trie-pruned grid DFS (Word Search II)",
        blurb:
          "Searching each word independently re-walks shared prefixes once per word. Instead, drive <em>one</em> DFS " +
          "over the grid with the trie as the guide: a dead prefix prunes the entire subtree of grid paths at once.",
        caption: "One DFS, guided by the trie",
        code: [
          "def dfs(r, c, node):",
          "    ch = board[r][c]",
          "    nxt = node.kids.get(ch)",
          "    if nxt is None:",
          "        return                  # PRUNE: dead prefix",
          "    if nxt.word:",
          "        out.append(nxt.word)",
          "        nxt.word = None         # de-duplicate",
          "    board[r][c] = '#'           # on the current path",
          "    for dr, dc in ((1,0), (-1,0), (0,1), (0,-1)):",
          "        nr, nc = r + dr, c + dc",
          "        if 0 <= nr < R and 0 <= nc < C \\",
          "                and board[nr][nc] != '#':",
          "            dfs(nr, nc, nxt)",
          "    board[r][c] = ch            # restore on the way out"
        ],
        invariant:
          "<code>board[r][c] == '#'</code> exactly for the cells on the <em>current DFS path</em>, so a path never " +
          "reuses a cell; and <code>node</code> is always the trie node spelling the path traversed so far, so the " +
          "prefix constraint is enforced at every step rather than checked at the end."
      }
    ],
    aside: {
      title: "Why the terminal flag is necessary",
      body:
        "Without <code>word</code>, the trie stores only the <em>prefix closure</em> of the inserted set, and prefix " +
        "closure is lossy: inserting <code>\"apple\"</code> alone makes <code>search(\"app\")</code> indistinguishable " +
        "from <code>startsWith(\"app\")</code>. The flag restores injectivity &mdash; the stored set is recoverable as " +
        "exactly the marked nodes. This is the single most common omission in a live implementation, and it fails " +
        "<em>silently</em> on inputs where every prefix happens to also be a word."
    }
  },

  whyItWorks: {
    proofs: [
      {
        title: "The prefix-to-node bijection",
        sub: "induction on prefix length",
        body:
          "<p><strong>Claim:</strong> for every string p over the alphabet, there is at most one node reachable from the " +
          "root by spelling p, and it exists iff p is a prefix of some inserted word.</p>" +
          "<p><strong>Proof.</strong> The empty prefix maps to the root, uniquely. If p maps to a unique node v, then " +
          "<code>p + ch</code> maps to <code>v.kids[ch]</code> if present and to nothing otherwise &mdash; " +
          "<code>kids</code> is a map, so there is at most one such child. Insertion creates exactly the missing nodes " +
          "along one path, so a node exists iff some inserted word runs through it.</p>" +
          "<p>Two consequences justify the whole structure. First, <em>search is exact</em>: the walk either reaches the " +
          "unique node for w or proves no word has w as a prefix. Second, <em>prefix queries are subtree queries</em>, " +
          "so counting or enumerating all words with a given prefix costs &ldquo;walk the prefix, then traverse a " +
          "subtree&rdquo; &mdash; with no scan over unrelated words.</p>"
      },
      {
        title: "Correctness of the wildcard DFS",
        sub: "exhaustiveness over admitted branches",
        body:
          "<p>The set of stored words matching a pattern w is defined character by character: position i either pins one " +
          "child or admits all of them. The DFS explores the product of those choices, which is exactly the set of root " +
          "paths consistent with the pattern, and accepts iff some consistent path ends on a word node.</p>" +
          "<p><code>any(...)</code> is therefore exhaustive over the admitted branches &mdash; returning after the first " +
          "child instead would test one branch and reject patterns that match via another.</p>"
      },
      {
        title: "Why trie pruning bounds the grid search",
        sub: "intersection of two trees",
        body:
          "<p>Plain grid DFS from one cell explores up to <code>4 &middot; 3^(L-1)</code> paths of length L (four first " +
          "steps, then at most three, since you cannot immediately return to the previous cell). Running that per word " +
          "costs <code>O(W &middot; R &middot; C &middot; 4 &middot; 3^(L-1))</code>.</p>" +
          "<p>With the trie, a path is extended only while it spells a prefix of some word, so the explored tree is the " +
          "<em>intersection</em> of the grid path tree with the trie &mdash; bounded by the number of (prefix, path) " +
          "pairs rather than by W times the full path tree. Words sharing prefixes are searched once, and a first " +
          "character absent from the trie kills an entire starting cell in O(1). Worst case is unchanged; typical case " +
          "collapses by orders of magnitude, which is why the trie version passes and the naive one does not.</p>"
      },
      {
        title: "Complexity proof",
        sub: "independent of N",
        body:
          "<p>Let L be the key length, N the number of words, A the alphabet size, T the total number of characters " +
          "inserted.</p>" +
          "<p><strong>Insert / search / startsWith:</strong> one loop iteration per character, each doing one hash " +
          "lookup in <code>kids</code>: <strong>O(L)</strong>. Crucially this is <em>independent of N</em> &mdash; " +
          "adding a million words does not slow a lookup, which is the asymptotic argument for a trie over a linear " +
          "scan, and the reason it ties a hash set on exact lookups while strictly beating it on prefixes.</p>" +
          "<p><strong>Space:</strong> at most one node per distinct prefix, so O(T) nodes with dict children, or " +
          "<code>O(T &middot; A)</code> machine words with fixed 26-slot arrays. The array form is faster by a constant " +
          "but wastes 26 pointers per node; for sparse or large alphabets the dict wins outright.</p>" +
          "<p><strong>Wildcard search:</strong> with d dots, the branching factor at each dot is at most A, so the worst " +
          "case is <code>O(A^d &middot; L)</code>. All dots (<code>\"...\"</code>) degenerates to enumerating every " +
          "stored word of that length.</p>"
      }
    ],
    table: {
      caption: "Complexity of the standard operations",
      head: ["Operation", "Time", "Space", "Note"],
      rows: [
        ["insert", "O(L)", "O(L) new nodes worst case", "independent of N"],
        ["search / startsWith", "O(L)", "O(1)", "same walk, different final test"],
        ["count words with prefix p", "O(len(p))", "O(1)", "store a counter per node during insert"],
        ["enumerate words with prefix p", "O(len(p) + output)", "O(L) stack", "subtree DFS"],
        ["wildcard search, d dots", "O(A^d &middot; L)", "O(L) stack", "A = alphabet size"],
        ["build a trie of N words", "O(T)", "O(T) nodes", "T = total characters"],
        ["Word Search II", "O(R&middot;C&middot;4&middot;3^(L-1)) worst", "O(T)", "pruning dominates in practice"],
        ["max XOR pair (bitwise trie)", "O(n &middot; 32)", "O(n &middot; 32)", "one node per bit per number"],
        ["hash set (for comparison)", "O(L) exact only", "O(T)", "no prefix, no wildcard, no ordering"]
      ]
    }
  },

  whenToUse: {
    lede: "Discrimination rules against the patterns that look similar in the prompt.",
    callout: {
      kind: "key",
      label: "Key idea",
      body:
        "A trie earns its memory only when queries are about <strong>prefixes, wildcards, or lexicographic order</strong>. " +
        "For pure exact-membership, a set is shorter, faster and smaller &mdash; saying so unprompted signals judgement " +
        "rather than pattern-matching. The other unmistakable tell is <em>many queries against a static dictionary</em>, " +
        "where the O(T) build amortises away."
    },
    head: ["Signal in the prompt", "Reach for", "Why not the neighbour"],
    rows: [
      ["&ldquo;prefix&rdquo;, &ldquo;starts with&rdquo;, autocomplete, search suggestions", "trie", "a hash set cannot enumerate by prefix"],
      ["exact membership only", "set", "a trie is strictly more memory for no benefit"],
      ["pattern matching with <code>.</code> or <code>?</code> wildcards", "trie + DFS", "hashing cannot branch mid-key"],
      ["find all dictionary words inside a grid / stream", "trie-guided DFS", "per-word search re-walks shared prefixes"],
      ["static sorted dictionary, few prefix queries", "sorted list + <code>bisect</code>", "O(L log N) with no build cost or pointer overhead"],
      ["longest common prefix of a whole list", "vertical character scan", "building a trie for one query is overkill"],
      ["&ldquo;maximum XOR of two numbers&rdquo;", "bitwise trie over 32 bits", "sorting does not expose the bit structure"],
      ["word break / concatenation into dictionary words", "trie + DP <span class='topic-ref'>topic 13</span>", "the trie supplies transitions, the DP supplies memoisation"],
      ["substring (not prefix) queries at scale", "suffix automaton / suffix array", "a trie of suffixes is O(n&sup2;) nodes"],
      ["counting duplicates of whole strings", "<code>Counter</code>", "a trie counter works but is far more code"]
    ]
  },

  edgeCases: {
    head: ["Case", "What breaks if unhandled"],
    rows: [
      ["empty string inserted", "the root itself must be markable; code that requires at least one edge silently drops it"],
      ["<code>search(\"\")</code>", "must return whether the root is marked, not crash on <code>w[0]</code>"],
      ["a word that is a prefix of another (<code>app</code>, <code>apple</code>)", "without the word flag, <code>search(\"app\")</code> wrongly returns True (or False) depending on insertion order"],
      ["duplicate inserts", "must be idempotent; a per-node counter is needed only if deletion is supported"],
      ["deletion", "naive node removal orphans longer words; use a reference count or only unset the flag"],
      ["mutable default <code>kids = {}</code> as a class attribute", "every node shares one dict &mdash; the trie collapses into a single path"],
      ["large or unicode alphabet", "a fixed <code>[None]*26</code> indexes out of range; <code>ord(ch) - 97</code> assumes lowercase ASCII"],
      ["all-wildcard query (<code>\"...\"</code>)", "degenerates to a full enumeration; fine, but say the bound out loud"],
      ["Word Search II: word longer than the cell count", "the DFS simply never reaches the terminal; no special case needed"],
      ["Word Search II: duplicate words in the input", "the same word is emitted twice unless the terminal is cleared or the output de-duplicated"],
      ["Word Search II: forgetting to restore the cell", "the board stays corrupted, so later start cells see <code>'#'</code> and paths vanish"],
      ["deep recursion on long words", "a 10<sup>5</sup>-character key overflows the frame limit; loop instead of recursing for the non-wildcard walk"]
    ]
  },

  bugs: [
    {
      n: 1,
      title: "No terminal flag, so <code>search</code> and <code>startsWith</code> cannot differ",
      wrong: [
        "def insert(self, w):",
        "    node = self.root",
        "    for ch in w:",
        "        node = node.kids.setdefault(ch, TrieNode())",
        "    # no node.word = True",
        "",
        "def search(self, w):",
        "    return self._walk(w) is not None",
        "",
        "# insert('apple'); search('app') -> True"
      ],
      right: [
        "def insert(self, w):",
        "    node = self.root",
        "    for ch in w:",
        "        node = node.kids.setdefault(ch, TrieNode())",
        "    node.word = True",
        "",
        "def search(self, w):",
        "    node = self._walk(w)",
        "    return node is not None and node.word",
        "",
        "# insert('apple'); search('app') -> False"
      ],
      note:
        "The trie without the flag stores the <em>prefix closure</em> of the word set, which is a strictly larger set. " +
        "Every &ldquo;my Trie passes <code>startsWith</code> but fails <code>search</code>&rdquo; bug is this."
    },
    {
      n: 2,
      title: "Children dict declared as a class attribute",
      wrong: [
        "class TrieNode:",
        "    kids = {}      # SHARED by every node",
        "    word = False",
        "",
        "# inserting 'ab' then 'cd' produces one",
        "# tangled structure: root.kids is the",
        "# same object as every child's kids, so",
        "# search('ad') returns True"
      ],
      right: [
        "class TrieNode:",
        "    __slots__ = ('kids', 'word')",
        "    def __init__(self):",
        "        self.kids = {}    # per instance",
        "        self.word = False"
      ],
      note:
        "A class-level mutable is created once and shared by all instances. The symptom is bizarre &mdash; unrelated " +
        "words appear to be present &mdash; because every node&rsquo;s children are literally the same dictionary. " +
        "<code>__slots__</code> additionally cuts per-node memory, which matters when a trie holds 10<sup>5</sup> words."
    },
    {
      n: 3,
      title: "Wildcard search that tests only one branch",
      wrong: [
        "if ch == '.':",
        "    for kid in node.kids.values():",
        "        return dfs(i + 1, kid)   # FIRST child only",
        "",
        "# words ['bad','dad','mad'],",
        "# search('.ad') -> depends on dict",
        "# order; can return False"
      ],
      right: [
        "if ch == '.':",
        "    return any(dfs(i + 1, kid)",
        "               for kid in node.kids.values())",
        "",
        "# equivalently:",
        "# for kid in node.kids.values():",
        "#     if dfs(i + 1, kid):",
        "#         return True",
        "# return False"
      ],
      note:
        "<code>return</code> inside the loop collapses a disjunction into its first term. The correct shape is " +
        "&ldquo;return True on success, and only return False <em>after</em> the loop completes&rdquo; &mdash; the same " +
        "structural mistake appears in backtracking <span class='topic-ref'>topic 10</span> and in grid DFS."
    },
    {
      n: 4,
      title: "Grid DFS that does not restore the visited marker",
      wrong: [
        "board[r][c] = '#'",
        "for dr, dc in DIRS:",
        "    ...",
        "    dfs(nr, nc, nxt)",
        "# no restore",
        "",
        "# the cell stays '#' forever, so any",
        "# later word needing it fails; results",
        "# depend on the order of start cells"
      ],
      right: [
        "board[r][c] = '#'",
        "for dr, dc in DIRS:",
        "    ...",
        "    dfs(nr, nc, nxt)",
        "board[r][c] = ch        # undo"
      ],
      note:
        "The marker encodes <em>&ldquo;on the current path&rdquo;</em>, not &ldquo;seen at some point&rdquo;, so it " +
        "must be undone as the recursion unwinds &mdash; this is backtracking discipline applied to a grid. Using a " +
        "separate visited set has the same obligation (<code>visited.remove(cell)</code> after the loop); mutating the " +
        "board just avoids the extra allocation."
    }
  ],

  practice: {
    caption: "Drill set for Tries",
    rows: [
      ["Longest Common Prefix", "LC 14", "Easy", "why a vertical scan beats building a trie for one query"],
      ["Search Suggestions System", "LC 1268", "Medium", "prefix node plus a bounded subtree DFS for the top 3"],
      ["Replace Words", "LC 648", "Medium", "shortest-prefix match: stop at the first terminal node"],
      ["Map Sum Pairs", "LC 677", "Medium", "per-node aggregate maintained during insert, with key updates"],
      ["Maximum XOR of Two Numbers in an Array", "LC 421", "Medium", "bitwise trie, greedy from the high bit"],
      ["Word Break", "LC 139", "Medium", "trie supplies the transitions, DP supplies the memoisation"],
      ["Concatenated Words", "LC 472", "Hard", "trie + DP over each word, sorted by length"],
      ["Palindrome Pairs", "LC 336", "Hard", "reversed-word trie plus palindromic-remainder bookkeeping"]
    ]
  },

  quiz: [
    {
      prompt: "&ldquo;Autocomplete: return all words <strong>starting with</strong> a given prefix.&rdquo;",
      options: ["Hash set", "Trie", "Sorted list + bisect", "Counter"],
      answer: 1,
      why: "A hash set cannot enumerate by prefix at all — prefix queries are subtree queries, which is exactly what the trie structure gives you."
    },
    {
      prompt: "You only ever need <strong>exact membership</strong> of whole strings.",
      options: ["Trie", "Set", "Bitwise trie", "Sorted list"],
      answer: 1,
      why: "A trie is strictly more memory for no benefit here. Saying so unprompted signals judgement rather than pattern-matching."
    },
    {
      prompt: "Pattern matching where <code>.</code> matches <strong>any single character</strong>.",
      options: ["Hashing", "Trie + DFS", "Sorted list + bisect", "Counter"],
      answer: 1,
      why: "Hashing cannot branch mid-key. The dot turns a deterministic walk into a DFS that forks over all children at that position."
    },
    {
      prompt: "Find <strong>every dictionary word</strong> hidden inside a character grid.",
      options: ["Search each word separately", "Trie-guided grid DFS", "Hash set of words", "Sort the grid"],
      answer: 1,
      why: "Per-word search re-walks shared prefixes once per word. One trie-guided DFS prunes a dead prefix — and its whole subtree of grid paths — at once."
    },
    {
      prompt: "A <strong>static sorted dictionary</strong> with only a handful of prefix queries.",
      options: ["Build a trie", "Sorted list + bisect", "Hash set", "Suffix array"],
      answer: 1,
      why: "O(L log N) with no build cost and no pointer overhead. The trie's O(T) build only amortises away across many queries."
    },
    {
      prompt: "&ldquo;<strong>Maximum XOR</strong> of two numbers in an array.&rdquo;",
      options: ["Sort then scan", "Bitwise trie over 32 bits", "Hash set", "Heap"],
      answer: 1,
      why: "Sorting does not expose the bit structure. Insert each number as a 32-bit path, then walk greedily from the high bit, preferring the opposite branch."
    },
    {
      prompt: "<strong>Substring</strong> (not prefix) queries, at scale.",
      options: ["Trie of all suffixes", "Suffix automaton / suffix array", "Hash set", "Trie of prefixes"],
      answer: 1,
      why: "A trie of suffixes is O(n²) nodes. Substring structure needs a suffix automaton or suffix array to stay linear."
    },
    {
      prompt: "&ldquo;Longest common prefix&rdquo; of a whole list of strings.",
      options: ["Build a trie", "Vertical character scan", "Sort then compare ends", "Hash map"],
      answer: 1,
      why: "Building a whole trie for one query is overkill. Scan column by column until a mismatch — same answer, no structure to allocate."
    },
    {
      prompt: "&ldquo;Word break&rdquo;: can the string be cut into dictionary words?",
      options: ["Trie alone", "Trie + DP", "Greedy longest match", "Hash set alone"],
      answer: 1,
      why: "The trie supplies the transitions, but you still need memoisation over split points — greedy longest match is provably wrong on inputs like 'aaaab'."
    }
  ]
};
