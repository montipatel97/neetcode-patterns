"""Topic 08 -- Tries.

The solutions use nested dicts rather than a TrieNode class, so the structure
itself is visible in the trace: a node simply *is* its children map, and '$'
marks a stored word.
"""

INSERT_SEARCH = '''
def build_and_search(words, query):
    root = {}
    for w in words:                    # --- insert every word
        node, path = root, ""
        for ch in w:
            node = node.setdefault(ch, {})
            path = path + ch           # prefix consumed so far
        node["$"] = True               # the flag is NOT optional

    node, path = root, ""              # --- now walk the query
    for ch in query:
        node = node.get(ch)
        if node is None:
            return False               # no word has this prefix
        path = path + ch
    return "$" in node                 # search, not startsWith
'''

WILDCARD = '''
def search_wildcard(words, pattern):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True

    def dfs(i, node, path):
        if i == len(pattern):
            return "$" in node
        ch = pattern[i]
        if ch == ".":                  # fork over EVERY child
            for k, kid in node.items():
                if k != "$" and dfs(i + 1, kid, path + k):
                    return True
            return False               # only after the whole loop
        kid = node.get(ch)
        return kid is not None and dfs(i + 1, kid, path + ch)

    return dfs(0, root, "")
'''

WORD_SEARCH = '''
def find_words(board, words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w                  # store the word at the terminal

    R, C, out = len(board), len(board[0]), []

    def dfs(r, c, node, path):
        ch = board[r][c]
        nxt = node.get(ch)
        if nxt is None:
            return                     # PRUNE: dead prefix
        if "$" in nxt:
            out.append(nxt["$"])
            del nxt["$"]               # de-duplicate without a set
        board[r][c] = "#"              # mark: on the current path
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != "#":
                dfs(nr, nc, nxt, path + ch)
        board[r][c] = ch               # restore on the way out

    for r in range(R):
        for c in range(C):
            dfs(r, c, root, "")
    return out
'''

EXAMPLES = [
    {
        "id": "implement-trie",
        "title": "Implement Trie — insert then search",
        "lc": "LC 208",
        "level": "Medium",
        "mechanism": "Mechanism A -- the walk, and the terminal flag",
        "func": "build_and_search",
        "code": INSERT_SEARCH,
        "args": (["app", "apple", "bat"], "app"),
        "watch": ["words", "query", "root", "node", "path", "w", "ch"],
        "inputLabel": 'words = ["app", "apple", "bat"], query = "app"',
        "complexity": {"time": "O(L)", "space": "O(T) nodes"},
        "idea": (
            "<code>search</code> and <code>startsWith</code> share the identical walk and differ "
            "only in the final test. That is precisely what the <code>$</code> flag exists to "
            "distinguish &mdash; without it the trie stores the <em>prefix closure</em>, which is a "
            "strictly larger set."
        ),
        "takeaway": (
            "Returns <code>True</code>, because <code>\"app\"</code> was inserted as a word in its own "
            "right. Watch the shared <code>a &rarr; p &rarr; p</code> spine: inserting "
            "<code>\"apple\"</code> creates only the two <em>missing</em> nodes. Had only "
            "<code>\"apple\"</code> been inserted, the same walk would succeed but the final "
            "<code>\"$\" in node</code> test would fail &mdash; which is the whole point of the flag."
        ),
        "view": {
            "tries": [{"name": "root", "label": "trie", "path": "path"}],
            "scalars": ["w", "ch", "path", "query"],
        },
    },
    {
        "id": "wildcard-search",
        "title": "Design Add and Search Words — wildcard",
        "lc": "LC 211",
        "level": "Medium",
        "mechanism": "Mechanism B -- DFS forking at the dots",
        "func": "search_wildcard",
        "code": WILDCARD,
        "args": (["bad", "dad", "mad"], ".ad"),
        "watch": ["words", "pattern", "root", "node", "path", "i", "ch", "k"],
        "inputLabel": 'words = ["bad", "dad", "mad"], pattern = ".ad"',
        "complexity": {"time": "O(A^d &middot; L)", "space": "O(L) stack"},
        "idea": (
            "A <code>.</code> stops the walk being deterministic: position i either pins one child "
            "or admits all of them. The DFS explores exactly the product of those choices."
        ),
        "takeaway": (
            "Returns <code>True</code>. The critical shape is <em>return True on success, and only "
            "return False after the loop completes</em> &mdash; a <code>return</code> inside the loop "
            "would collapse the disjunction into its first branch and make the answer depend on dict "
            "order. The same structural mistake appears in backtracking and grid DFS."
        ),
        "view": {
            "tries": [{"name": "root", "label": "trie", "path": "path"}],
            "scalars": ["i", "ch", "k", "path", "pattern"],
        },
    },
    {
        "id": "word-search-ii",
        "title": "Word Search II — trie-pruned grid DFS",
        "lc": "LC 212",
        "level": "Hard",
        "mechanism": "Mechanism C -- the trie guides the grid walk",
        "func": "find_words",
        "code": WORD_SEARCH,
        "args": ([["a", "b"], ["c", "d"]], ["ab", "abd", "ac", "acd", "ba"]),
        "watch": ["board", "words", "root", "out", "r", "c", "path", "ch"],
        "inputLabel": 'board = [["a","b"],["c","d"]], 5 words',
        "complexity": {"time": "O(R&middot;C&middot;4&middot;3^(L-1)) worst", "space": "O(T)"},
        "idea": (
            "Searching each word independently re-walks shared prefixes once per word. Driving one "
            "DFS with the trie as the guide means a dead prefix prunes the entire subtree of grid "
            "paths at once."
        ),
        "takeaway": (
            "All five words are found. The emission order follows the DFS, not the input order, "
            "which the problem leaves unspecified. Two of the four start cells are "
            "rejected in O(1) by a single failed lookup, and the <code>ac</code>/<code>acd</code> pair "
            "reuses the <code>a</code> node already walked for <code>ab</code> &mdash; the two savings "
            "that make the trie version viable. Deleting the terminal after emitting prevents a "
            "duplicate without maintaining a separate result set."
        ),
        "view": {
            "grids": [{"name": "board", "label": "board", "row": "r", "col": "c",
                       "hint": "# marks cells on the current path"}],
            "tries": [{"name": "root", "label": "trie", "path": "path"}],
            "scalars": ["r", "c", "ch", "path", "out"],
        },
    },
]

TOPIC = {
    "id": "tries",
    "number": "08",
    "title": "Tries",
    "subtitle": "Prefix trees, the prefix-to-node bijection, wildcard DFS, and trie-pruned grid search",
}
