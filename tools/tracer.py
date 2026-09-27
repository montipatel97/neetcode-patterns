"""
Execution tracer: runs a Python solution under sys.settrace and records a
JSON-safe snapshot of every watched local at every line event.

The site's dry-run player replays these snapshots, so every trace shown on the
page is produced by really executing the code -- not transcribed by hand.

Linked lists and binary trees need special handling. Their nodes are mutated in
place (a reversal rewires .next; a rotation rewires .left/.right), so snapshotting
"the list reachable from head" loses the picture. Instead we enumerate every node
once, keep it at a fixed position, and record the edges as they are at each step.
That is what makes a reversal legible.
"""
import copy
import json
import sys
import textwrap

NL = chr(10)

# ----------------------------------------------------------------- node kinds


def is_list_node(v):
    return hasattr(v, "next") and (hasattr(v, "val") or hasattr(v, "value"))


def is_tree_node(v):
    return (hasattr(v, "left") or hasattr(v, "right")) and \
           (hasattr(v, "val") or hasattr(v, "value"))


def node_val(v):
    return getattr(v, "val", None) if hasattr(v, "val") else getattr(v, "value", None)


# ------------------------------------------------------------------ jsonify


def jsonify(v, depth=0):
    """Convert a Python value into something JSON can hold, tagging the
    container kind so the front end knows how to draw it."""
    if depth > 6:
        return {"kind": "scalar", "repr": "..."}
    if v is None or isinstance(v, (bool, int, float, str)):
        return {"kind": "scalar", "value": v, "repr": repr(v)}
    if is_list_node(v) or is_tree_node(v):
        # a pointer into a structure -- the structure itself is in the spine
        return {"kind": "ref", "id": id(v), "repr": repr(node_val(v))}
    if isinstance(v, (list, tuple)):
        return {
            "kind": "list" if isinstance(v, list) else "tuple",
            "items": [jsonify(x, depth + 1) for x in v],
        }
    if isinstance(v, set) or isinstance(v, frozenset):
        try:
            ordered = sorted(v, key=lambda x: (str(type(x)), x))
        except TypeError:
            ordered = list(v)
        return {"kind": "set", "items": [jsonify(x, depth + 1) for x in ordered]}
    if isinstance(v, dict):
        return {
            "kind": "dict",
            "entries": [[repr(k), jsonify(x, depth + 1)] for k, x in v.items()],
        }
    if hasattr(v, "__dict__"):
        return {
            "kind": "dict",
            "entries": [[k, jsonify(x, depth + 1)] for k, x in vars(v).items()],
        }
    return {"kind": "scalar", "repr": repr(v)}


def safe_copy(v):
    """Deep-copy so later mutation cannot rewrite history -- but never copy
    structure nodes, whose identity is the whole point."""
    if is_list_node(v) or is_tree_node(v):
        return v
    try:
        return copy.deepcopy(v)
    except Exception:
        return v


def snapshot(frame_locals, watch):
    out = {}
    for name in watch:
        if name not in frame_locals:
            continue
        try:
            out[name] = jsonify(safe_copy(frame_locals[name]))
        except Exception:
            out[name] = {"kind": "scalar", "repr": "?"}
    return out


# ------------------------------------------------------------------- spines


def walk_linked(node, seen, order, cap=64):
    """Follow .next, tolerating cycles, collecting nodes in encounter order."""
    while node is not None and id(node) not in seen and len(order) < cap:
        seen.add(id(node))
        order.append(node)
        node = getattr(node, "next", None)


def walk_tree(node, seen, order, cap=64):
    """Breadth-first so the emitted order is already row-major."""
    if node is None:
        return
    queue = [node]
    while queue and len(order) < cap:
        cur = queue.pop(0)
        if cur is None or id(cur) in seen:
            continue
        seen.add(id(cur))
        order.append(cur)
        queue.append(getattr(cur, "left", None))
        queue.append(getattr(cur, "right", None))


def gather(frame_locals, kind, seen, order):
    """Pick up nodes reachable from any local -- catches dummy heads and
    freshly built nodes that were not in the original input."""
    for v in list(frame_locals.values()):
        if kind == "linked" and is_list_node(v):
            walk_linked(v, seen, order)
        elif kind == "tree" and is_tree_node(v):
            walk_tree(v, seen, order)
        elif isinstance(v, (list, tuple)):
            for x in v:
                if kind == "linked" and is_list_node(x):
                    walk_linked(x, seen, order)
                elif kind == "tree" and is_tree_node(x):
                    walk_tree(x, seen, order)


def spine_snapshot(order, kind):
    """Record each node's current edges. Positions stay fixed across steps;
    only the edges move."""
    index = {}
    for i, n in enumerate(order):
        index[id(n)] = i

    nodes = []
    for n in order:
        rec = {"id": id(n), "val": jsonify(node_val(n))}
        if kind == "linked":
            nxt = getattr(n, "next", None)
            rec["next"] = id(nxt) if nxt is not None else None
        else:
            lf = getattr(n, "left", None)
            rt = getattr(n, "right", None)
            rec["left"] = id(lf) if lf is not None else None
            rec["right"] = id(rt) if rt is not None else None
        nodes.append(rec)
    return nodes


def tree_layout(nodes):
    """Assign (depth, x) to each node by walking the recorded edges from the
    first node, so the front end can place them without re-deriving shape."""
    by_id = {}
    for n in nodes:
        by_id[n["id"]] = n
    if not nodes:
        return

    children = set()
    for n in nodes:
        for side in ("left", "right"):
            if n.get(side):
                children.add(n[side])
    roots = [n for n in nodes if n["id"] not in children] or [nodes[0]]

    counter = {"x": 0}
    depth_cap = 6

    def place(nid, depth, seen):
        if nid is None or nid in seen or depth > depth_cap:
            return
        seen.add(nid)
        node = by_id.get(nid)
        if node is None:
            return
        place(node.get("left"), depth + 1, seen)
        node["depth"] = depth
        node["x"] = counter["x"]
        counter["x"] += 1
        place(node.get("right"), depth + 1, seen)

    seen = set()
    for r in roots:
        place(r["id"], 0, seen)
    for n in nodes:
        n.setdefault("depth", 0)
        n.setdefault("x", 0)


# -------------------------------------------------------------------- tracing


def trace_call(source, func_name, args, watch, spine_kind=None,
               max_steps=4000, prelude="", only=None):
    """Execute source[func_name](*args), recording one step per line event.

    Each step holds the state *before* that line runs, so stepping forward in
    the UI shows the effect of the line you just left.
    """
    src = textwrap.dedent(source).strip(NL)
    namespace = {}
    if prelude:
        exec(compile(textwrap.dedent(prelude), "<prelude>", "exec"), namespace)
    exec(compile(src + NL, "<solution>", "exec"), namespace)
    fn = namespace[func_name]

    steps = []
    seen_ids = set()
    node_order = []
    depth = {"n": 0}

    def capture(frame, event, arg):
        # line numbers are 1-based within the compiled source, so any function
        # defined in it -- including nested recursive helpers -- maps directly
        rec = {
            "line": frame.f_lineno - 1,
            "event": event,
            "fn": frame.f_code.co_name,
            "depth": depth["n"],
            "state": snapshot(frame.f_locals, watch),
        }
        if spine_kind:
            gather(frame.f_locals, spine_kind, seen_ids, node_order)
            rec["spine"] = spine_snapshot(node_order, spine_kind)
            if spine_kind == "tree":
                tree_layout(rec["spine"])
        if event == "return":
            rec["returned"] = jsonify(arg)
        steps.append(rec)

    def traceable(frame):
        if frame.f_code.co_filename != "<solution>":
            return False
        name = frame.f_code.co_name
        if name.startswith("<"):        # comprehensions and genexps are noise
            return False
        return only is None or name in only

    def local_tracer(frame, event, arg):
        if not traceable(frame):
            return None
        if event == "line" and len(steps) < max_steps:
            capture(frame, "line", None)
        elif event == "return":
            capture(frame, "return", arg)
            depth["n"] = max(0, depth["n"] - 1)
        return local_tracer

    def global_tracer(frame, event, arg):
        # follow every frame defined in the traced source, so nested recursive
        # helpers are traced alongside the entry point
        if event == "call" and traceable(frame):
            depth["n"] += 1
            return local_tracer
        return None

    call_args = [a if _holds_nodes(a) else copy.deepcopy(a) for a in args]

    sys.settrace(global_tracer)
    try:
        result = fn(*call_args)
    finally:
        sys.settrace(None)

    return {"lines": src.split(NL), "steps": steps, "result": jsonify(result)}


def _holds_nodes(a):
    if is_list_node(a) or is_tree_node(a):
        return True
    if isinstance(a, (list, tuple)):
        return any(is_list_node(x) or is_tree_node(x) for x in a)
    return False


# --------------------------------------------------------------------- output


def build(example):
    traced = trace_call(
        example["code"],
        example["func"],
        example["args"],
        example["watch"],
        example.get("spine"),
        prelude=example.get("prelude", ""),
        only=example.get("only"),
    )
    record = dict(example)
    for k in ("args", "watch", "func", "prelude", "only"):
        record.pop(k, None)
    record["code"] = traced["lines"]
    record["steps"] = traced["steps"]
    record["result"] = traced["result"]
    return record


def write(topic, examples, path):
    """Emit a plain <script> file, not JSON: the site has to run from file://
    by double-click, and fetch() is blocked there by CORS."""
    payload = dict(topic)
    payload["examples"] = [build(e) for e in examples]
    body = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    js = (
        "/* generated by tools/tracer.py -- do not edit by hand */" + NL +
        "window.TRACES = window.TRACES || {};" + NL +
        "window.TRACES[%s] = %s;" % (json.dumps(topic["id"]), body) + NL
    )
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(js)
    total = sum(len(e["steps"]) for e in payload["examples"])
    print("  %-22s %d examples, %4d steps" % (topic["id"], len(payload["examples"]), total))
    return total
