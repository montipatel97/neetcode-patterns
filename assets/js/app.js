/* ============================================================
   NeetCode 150 — Patterns, Proofs & Traces
   Hash router + lazy topic loading + the dry-run players.
   ============================================================ */

(function () {
  "use strict";

  window.CONTENT = window.CONTENT || {};
  window.TRACES = window.TRACES || {};

  /* ---------------------------------------------------------- utilities */

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function truncate(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  /* ------------------------------------------------ python highlighting */

  var KW = "def|return|for|in|if|else|elif|while|not|and|or|None|True|False|" +
           "import|from|class|break|continue|pass|lambda|yield|with|as|try|" +
           "except|finally|raise|global|nonlocal|assert|del|is";
  var BI = "len|range|enumerate|set|dict|list|tuple|sorted|max|min|sum|abs|ord|" +
           "chr|str|int|float|print|zip|map|filter|any|all|reversed|defaultdict|" +
           "Counter|deque|append|join|add|remove|values|keys|items|sort|pop|" +
           "appendleft|popleft|heappush|heappop|heapify|bin|divmod|inf";

  var PY_RE = new RegExp(
    "(#.*$)" +
    "|(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*')" +
    "|\\b(def|class)(\\s+)(\\w+)" +
    "|\\b(" + KW + ")\\b" +
    "|\\b(" + BI + ")\\b" +
    "|\\b(\\d+)\\b",
    "gm"
  );

  function highlight(line) {
    var out = "", last = 0, m;
    PY_RE.lastIndex = 0;
    while ((m = PY_RE.exec(line)) !== null) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += '<span class="t-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="t-str">' + esc(m[2]) + "</span>";
      else if (m[3]) out += '<span class="t-kw">' + esc(m[3]) + "</span>" + esc(m[4]) +
                            '<span class="t-def">' + esc(m[5]) + "</span>";
      else if (m[6]) out += '<span class="t-kw">' + esc(m[6]) + "</span>";
      else if (m[7]) out += '<span class="t-bi">' + esc(m[7]) + "</span>";
      else if (m[8]) out += '<span class="t-num">' + esc(m[8]) + "</span>";
      last = m.index + m[0].length;
      if (m[0].length === 0) PY_RE.lastIndex++;
    }
    return out + esc(line.slice(last));
  }

  function codeBlock(lines) {
    var pre = el("pre", "code");
    pre.innerHTML = lines.map(highlight).join("\n");
    return pre;
  }

  /* ------------------------------------------------- value pretty-print */

  function nodeRepr(node) {
    if (!node) return "—";
    switch (node.kind) {
      case "scalar": return node.repr != null ? node.repr : String(node.value);
      case "ref":    return node.repr != null ? "node(" + node.repr + ")" : "node";
      case "list":   return "[" + node.items.map(nodeRepr).join(", ") + "]";
      case "tuple":  return "(" + node.items.map(nodeRepr).join(", ") + ")";
      case "set":    return node.items.length ? "{" + node.items.map(nodeRepr).join(", ") + "}" : "set()";
      case "dict":   return "{" + node.entries.map(function (e) {
                       return e[0] + ": " + nodeRepr(e[1]); }).join(", ") + "}";
      default:       return "?";
    }
  }

  function scalarValue(node) {
    return node && node.kind === "scalar" ? node.value : undefined;
  }

  function isMatrix(node) {
    return node && node.kind === "list" && node.items.length &&
           node.items.every(function (r) { return r && r.kind === "list"; });
  }

  /* ============================================================
     Dry-run player
     ============================================================ */

  function Player(example, host) {
    this.ex = example;
    this.steps = example.steps;
    this.i = 0;
    this.timer = null;
    this.speed = 1;
    this.host = host;
    this.build();
    this.render();
  }

  Player.prototype.build = function () {
    var ex = this.ex, self = this;

    var root = el("section", "runner card");
    root.id = "run-" + ex.id;
    root.tabIndex = 0;

    var head = el("div", "runner-head");
    var title = el("div", "runner-title");
    title.appendChild(el("h3", null, esc(ex.title)));
    title.appendChild(el("span", "runner-lc", esc(ex.lc)));
    title.appendChild(el("span", "lvl lvl-" + ex.level, esc(ex.level)));
    head.appendChild(title);
    head.appendChild(el("div", "runner-mech", ex.mechanism));
    head.appendChild(el("p", "runner-idea", ex.idea));

    var meta = el("div", "runner-meta");
    meta.appendChild(el("span", "chip", '<span class="lbl">input</span><b>' + esc(ex.inputLabel) + "</b>"));
    meta.appendChild(el("span", "chip", '<span class="lbl">time</span><b>' + esc(ex.complexity.time) + "</b>"));
    meta.appendChild(el("span", "chip", '<span class="lbl">space</span><b>' + esc(ex.complexity.space) + "</b>"));
    meta.appendChild(el("span", "chip", '<span class="lbl">steps</span><b>' + this.steps.length + "</b>"));
    head.appendChild(meta);
    root.appendChild(head);

    var body = el("div", "runner-body");

    var paneCode = el("div", "pane-code");
    paneCode.appendChild(el("div", "pane-label", "<span>Solution</span><span>python 3</span>"));
    var codeHost = el("div", "trace-code");
    this.lineEls = ex.code.map(function (line, idx) {
      var row = el("div", "cl");
      row.appendChild(el("span", "cl-n", String(idx + 1)));
      var t = el("span", "cl-t");
      t.innerHTML = highlight(line) || "&nbsp;";
      row.appendChild(t);
      codeHost.appendChild(row);
      return row;
    });
    paneCode.appendChild(codeHost);
    body.appendChild(paneCode);

    var paneViz = el("div", "pane-viz");
    paneViz.appendChild(el("div", "pane-label", "<span>State</span><span>live</span>"));
    this.viz = el("div", "viz");
    paneViz.appendChild(this.viz);
    body.appendChild(paneViz);
    root.appendChild(body);

    this.delta = el("div", "delta");
    root.appendChild(this.delta);

    var tr = el("div", "transport");
    this.btnReset = el("button", "btn btn--icon", icon("reset"));
    this.btnReset.title = "Reset to start";
    this.btnPrev = el("button", "btn btn--icon", icon("prev"));
    this.btnPrev.title = "Previous step";
    this.btnPlay = el("button", "btn btn--play", icon("play") + "<span>Play</span>");
    this.btnNext = el("button", "btn btn--icon", icon("next"));
    this.btnNext.title = "Next step";
    tr.appendChild(this.btnReset);
    tr.appendChild(this.btnPrev);
    tr.appendChild(this.btnPlay);
    tr.appendChild(this.btnNext);

    var scrubWrap = el("div", "scrub");
    this.scrub = document.createElement("input");
    this.scrub.type = "range";
    this.scrub.min = "0";
    this.scrub.max = String(this.steps.length - 1);
    this.scrub.value = "0";
    scrubWrap.appendChild(this.scrub);
    tr.appendChild(scrubWrap);

    this.counter = el("span", "counter");
    tr.appendChild(this.counter);

    var speed = el("div", "speed");
    [[0.5, "0.5×"], [1, "1×"], [2, "2×"], [4, "4×"]].forEach(function (s) {
      var b = el("button", s[0] === 1 ? "is-on" : null, s[1]);
      b.addEventListener("click", function () {
        self.speed = s[0];
        Array.prototype.forEach.call(speed.querySelectorAll("button"), function (x) {
          x.classList.remove("is-on");
        });
        b.classList.add("is-on");
        if (self.timer) { self.pause(); self.play(); }
      });
      speed.appendChild(b);
    });
    tr.appendChild(speed);
    root.appendChild(tr);

    var foot = el("div", "runner-foot");
    foot.innerHTML = '<span class="lbl">What the trace shows</span>' + ex.takeaway;
    root.appendChild(foot);

    this.btnPrev.addEventListener("click", function () { self.pause(); self.go(self.i - 1); });
    this.btnNext.addEventListener("click", function () { self.pause(); self.go(self.i + 1); });
    this.btnReset.addEventListener("click", function () { self.pause(); self.go(0); });
    this.btnPlay.addEventListener("click", function () { self.timer ? self.pause() : self.play(); });
    this.scrub.addEventListener("input", function () { self.pause(); self.go(+self.scrub.value); });
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); self.pause(); self.go(self.i + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); self.pause(); self.go(self.i - 1); }
      else if (e.key === " ") { e.preventDefault(); self.timer ? self.pause() : self.play(); }
    });

    this.root = root;
    this.host.appendChild(root);
  };

  Player.prototype.play = function () {
    var self = this;
    if (this.i >= this.steps.length - 1) this.go(0);
    this.btnPlay.innerHTML = icon("pause") + "<span>Pause</span>";
    this.timer = setInterval(function () {
      if (self.i >= self.steps.length - 1) { self.pause(); return; }
      self.go(self.i + 1);
    }, 780 / this.speed);
  };

  Player.prototype.pause = function () {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.btnPlay.innerHTML = icon("play") + "<span>Play</span>";
  };

  Player.prototype.destroy = function () { this.pause(); };

  Player.prototype.go = function (i) {
    this.i = clamp(i, 0, this.steps.length - 1);
    this.render();
  };

  Player.prototype.render = function () {
    var step = this.steps[this.i];
    var prev = this.i > 0 ? this.steps[this.i - 1] : null;

    this.lineEls.forEach(function (row, idx) {
      row.classList.toggle("is-live", idx === step.line);
      row.classList.toggle("is-done", idx < step.line);
    });

    this.scrub.value = String(this.i);
    this.counter.innerHTML = "<b>" + (this.i + 1) + "</b> / " + this.steps.length;
    this.btnPrev.disabled = this.i === 0;
    this.btnNext.disabled = this.i === this.steps.length - 1;

    this.renderViz(step, prev);
    this.renderDelta(step, prev);
  };

  /* ------------------------------------------------------ visualisation */

  function vizGroup(label, hint) {
    var g = el("div", "viz-group");
    g.appendChild(el("div", "viz-name",
      esc(label) + (hint ? ' <span class="hint">' + hint + "</span>" : "")));
    return g;
  }

  Player.prototype.renderViz = function (step, prev) {
    var view = this.ex.view || {};
    var state = step.state;
    var before = prev ? prev.state : {};
    var viz = this.viz;
    viz.innerHTML = "";

    /* ---- linear arrays with pointer flags ---- */
    (view.arrays || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || (node.kind !== "list" && node.kind !== "tuple")) return;
      if (isMatrix(node)) return;
      var old = before[spec.name];

      var g = vizGroup(spec.label, spec.static ? "input, never mutated" : spec.hint || "");
      var pointers = (view.pointers || []).filter(function (p) {
        return p.target === spec.name && state[p.name] !== undefined;
      });

      var arr = el("div", "arr");
      node.items.forEach(function (item, idx) {
        var wrap = el("div", "cell-wrap");
        var cell = el("div", "cell", esc(nodeRepr(item)));

        var here = pointers.filter(function (p) { return scalarValue(state[p.name]) === idx; });
        if (here.length) cell.classList.add("is-focus");

        if (spec.window && here.length === 0) {
          var lo = scalarValue(state[spec.window[0]]);
          var hi = scalarValue(state[spec.window[1]]);
          if (lo !== undefined && hi !== undefined && idx >= lo && idx <= hi) {
            cell.classList.add("is-inwindow");
          }
        }
        if (spec.highlightWrites && old && old.items && old.items[idx] &&
            nodeRepr(old.items[idx]) !== nodeRepr(item)) {
          cell.classList.add("is-write");
        }

        wrap.appendChild(cell);
        wrap.appendChild(el("div", "cell-i", String(idx)));
        if (here.length) {
          wrap.appendChild(el("div", "ptr",
            esc(here.map(function (p) { return p.label || p.name; }).join(" ")) +
            '<span class="tip">▾</span>'));
        }
        arr.appendChild(wrap);
      });
      g.appendChild(arr);
      viz.appendChild(g);
    });

    /* ---- 2-D grids / DP tables ---- */
    (view.grids || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!isMatrix(node)) return;
      var old = before[spec.name];
      var r = scalarValue(state[spec.row]);
      var c = scalarValue(state[spec.col]);

      var g = vizGroup(spec.label, spec.hint || "");
      var grid = el("div", "grid");
      node.items.forEach(function (rowNode, ri) {
        var rowEl = el("div", "grid-row");
        rowNode.items.forEach(function (item, ci) {
          var cell = el("div", "gcell", esc(nodeRepr(item)));
          if (ri === r && ci === c) cell.classList.add("is-focus");
          if (old && old.items[ri] && old.items[ri].items[ci] &&
              nodeRepr(old.items[ri].items[ci]) !== nodeRepr(item)) {
            cell.classList.add("is-write");
          }
          rowEl.appendChild(cell);
        });
        grid.appendChild(rowEl);
      });
      g.appendChild(grid);
      viz.appendChild(g);
    });

    /* ---- stacks (grow upward) ---- */
    (view.stacks || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || node.kind !== "list") return;
      var old = before[spec.name];
      var grew = old && node.items.length > old.items.length;

      var g = vizGroup(spec.label, spec.hint || "top of stack on the right");
      var row = el("div", "stack-row");
      if (!node.items.length) {
        row.appendChild(el("div", "map-empty", "[ ]  empty"));
      } else {
        node.items.forEach(function (item, idx) {
          var tok = el("div", "stok", esc(nodeRepr(item)));
          if (idx === node.items.length - 1) {
            tok.classList.add("is-top");
            if (grew) tok.classList.add("is-push");
          }
          row.appendChild(tok);
        });
      }
      g.appendChild(row);
      viz.appendChild(g);
    });

    /* ---- deques (both ends meaningful) ---- */
    (view.deques || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || (node.kind !== "list" && node.kind !== "dict")) return;
      var items = node.kind === "list" ? node.items : [];
      var g = vizGroup(spec.label, spec.hint || "front ← … → back");
      var row = el("div", "deque-row");
      if (!items.length) {
        row.appendChild(el("div", "map-empty", "empty"));
      } else {
        items.forEach(function (item, idx) {
          var tok = el("div", "dtok", esc(nodeRepr(item)));
          if (idx === 0) tok.classList.add("is-front");
          if (idx === items.length - 1) tok.classList.add("is-back");
          row.appendChild(tok);
        });
      }
      g.appendChild(row);
      viz.appendChild(g);
    });

    /* ---- linked list spine ---- */
    if (view.linked && step.spine) {
      var g = vizGroup(view.linked.label || "list", "boxes hold position; arrows move");
      var host = el("div", "linked");
      var refs = {};
      (view.linked.refs || []).forEach(function (name) {
        var v = state[name];
        if (v && v.kind === "ref") {
          refs[v.id] = refs[v.id] || [];
          refs[v.id].push(name);
        }
      });
      var boxes = {};
      step.spine.forEach(function (n) {
        var wrap = el("div", "lnode-wrap");
        var box = el("div", "lnode", esc(nodeRepr(n.val)));
        if (refs[n.id]) {
          box.classList.add("is-focus");
          wrap.appendChild(el("div", "ptr", esc(refs[n.id].join(" ")) + '<span class="tip">▾</span>'));
        }
        wrap.appendChild(box);
        host.appendChild(wrap);
        boxes[n.id] = wrap;
      });
      g.appendChild(host);
      viz.appendChild(g);
      drawLinkedEdges(host, boxes, step.spine);
    }

    /* ---- binary tree spine ---- */
    if (view.tree && step.spine) {
      var gt = vizGroup(view.tree.label || "tree", view.tree.hint || "");
      var treeHost = el("div", "tree");
      var trefs = {};
      (view.tree.refs || []).forEach(function (name) {
        var v = state[name];
        if (v && v.kind === "ref") { trefs[v.id] = trefs[v.id] || []; trefs[v.id].push(name); }
      });
      drawTree(treeHost, step.spine, trefs);
      gt.appendChild(treeHost);
      viz.appendChild(gt);
    }

    /* ---- tries (nested dicts) ---- */
    (view.tries || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || node.kind !== "dict") return;
      var pathNode = spec.path ? state[spec.path] : null;
      var path = pathNode && pathNode.kind === "scalar" ? String(pathNode.value || "") : "";

      var g = vizGroup(spec.label, spec.hint || "nested maps; $ marks a stored word");
      var host = el("div", "trie");
      if (!node.entries.length) {
        host.appendChild(el("div", "map-empty", "empty trie"));
      } else {
        trieLevel(node, 0, "", path, host);
      }
      g.appendChild(host);
      viz.appendChild(g);
    });

    /* ---- dicts ---- */
    (view.maps || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || node.kind !== "dict") return;
      var old = before[spec.name];
      var oldKeys = old && old.entries ? old.entries.map(function (e) { return e[0]; }) : [];
      var lookupName = spec.lookup || "need";
      var lookup = state[lookupName] !== undefined ? nodeRepr(state[lookupName]) : null;

      var g = vizGroup(spec.label, spec.caption ? esc(spec.caption) : "");
      var row = el("div", "map");
      if (!node.entries.length) {
        row.appendChild(el("div", "map-empty", "{ }  empty"));
      } else {
        node.entries.forEach(function (e) {
          var kv = el("div", "kv", '<span class="k">' + esc(e[0]) + '</span><span class="v">' +
            esc(truncate(nodeRepr(e[1]), 18)) + "</span>");
          if (oldKeys.indexOf(e[0]) === -1) kv.classList.add("is-new");
          else if (old) {
            var oldVal = null;
            old.entries.forEach(function (oe) { if (oe[0] === e[0]) oldVal = nodeRepr(oe[1]); });
            if (oldVal !== null && oldVal !== nodeRepr(e[1])) kv.classList.add("is-new");
          }
          if (lookup !== null && e[0] === lookup) kv.classList.add("is-hit");
          row.appendChild(kv);
        });
      }
      g.appendChild(row);
      viz.appendChild(g);
    });

    /* ---- sets ---- */
    (view.sets || []).forEach(function (spec) {
      var node = state[spec.name];
      if (!node || node.kind !== "set") return;
      var g = vizGroup(spec.label, "membership only, unordered");
      var cursors = (spec.cursors || []).map(function (c) {
        return { name: c, value: scalarValue(state[c]) };
      });
      var row = el("div", "set-row");
      if (!node.items.length) row.appendChild(el("div", "map-empty", "empty"));
      node.items.forEach(function (item) {
        var v = scalarValue(item);
        var tok = el("div", "tok", esc(nodeRepr(item)));
        var hit = cursors.filter(function (c) { return c.value === v; });
        if (hit.length) {
          tok.classList.add(hit.length > 1 || hit[0].name !== (spec.cursors || [])[0] ? "is-walk" : "is-cursor");
          tok.innerHTML = esc(nodeRepr(item)) + '<span class="tok-tag">' +
            esc(hit.map(function (h) { return h.name; }).join(" ")) + "</span>";
        }
        row.appendChild(tok);
      });
      g.appendChild(row);
      viz.appendChild(g);
    });

    /* ---- bit rows ---- */
    (view.bits || []).forEach(function (spec) {
      var v = scalarValue(state[spec.name]);
      if (typeof v !== "number") return;
      var width = spec.width || 8;
      var g = vizGroup(spec.label, "width " + width + ", msb first");
      var row = el("div", "bit-row");
      for (var b = width - 1; b >= 0; b--) {
        var on = (Math.abs(v) >> b) & 1;
        var cell = el("div", "bit" + (on ? " is-on" : ""), String(on));
        cell.appendChild(el("span", "bit-i", String(b)));
        row.appendChild(cell);
      }
      var wrapb = el("div", "bit-wrap");
      wrapb.appendChild(row);
      wrapb.appendChild(el("div", "bit-dec", "= " + v));
      g.appendChild(wrapb);
      viz.appendChild(g);
    });

    /* ---- scalars ---- */
    var scalarNames = (view.scalars || []).filter(function (n) { return state[n] !== undefined; });
    if (scalarNames.length) {
      var gs = vizGroup("variables", "");
      var box = el("div", "scalars");
      scalarNames.forEach(function (n) {
        var cur = nodeRepr(state[n]);
        var was = before[n] !== undefined ? nodeRepr(before[n]) : null;
        var sc = el("div", "sc", '<span class="n">' + esc(n) + '</span><span class="eq">=</span>' +
          '<span class="v">' + esc(truncate(cur, 30)) + "</span>");
        if (was !== null && was !== cur) sc.classList.add("is-changed");
        box.appendChild(sc);
      });
      gs.appendChild(box);
      viz.appendChild(gs);
    }

    if (step.event === "return") {
      viz.appendChild(el("div", "viz-return",
        '<span class="lbl">returns</span><span>' + esc(truncate(nodeRepr(step.returned), 90)) + "</span>"));
    }
  };

  function unquote(k) {
    return k.replace(/^['"]/, "").replace(/['"]$/, "");
  }

  /* Render a nested-dict trie as an indented outline, highlighting the branch
     that spells the prefix consumed so far. */
  function trieLevel(dictNode, depth, prefix, path, host) {
    dictNode.entries.forEach(function (e) {
      var key = unquote(e[0]);
      var child = e[1];
      var here = key === "$" ? prefix : prefix + key;

      var row = el("div", "trow");
      row.style.paddingLeft = (depth * 15) + "px";
      var chip = el("span", "tchip", esc(key === "$" ? "✓ word" : key));
      if (key === "$") chip.classList.add("is-word");
      else if (path && here.length <= path.length && path.slice(0, here.length) === here) {
        chip.classList.add("is-path");
      }
      row.appendChild(chip);
      host.appendChild(row);

      if (child && child.kind === "dict" && child.entries.length) {
        trieLevel(child, depth + 1, here, path, host);
      }
    });
  }

  /* -------------------------------------------------- structure drawing */

  function drawLinkedEdges(host, boxes, spine) {
    var hostRect = host.getBoundingClientRect();
    if (!hostRect.width) return;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "edges");
    var paths = [];
    var maxDrop = 0;

    spine.forEach(function (n) {
      if (!n.next || !boxes[n.id] || !boxes[n.next]) return;
      var a = boxes[n.id].querySelector(".lnode").getBoundingClientRect();
      var b = boxes[n.next].querySelector(".lnode").getBoundingClientRect();
      var x1 = a.left + a.width / 2 - hostRect.left;
      var x2 = b.left + b.width / 2 - hostRect.left;
      var y = a.bottom - hostRect.top + 3;
      var forward = x2 > x1;
      var span = Math.abs(x2 - x1);
      var drop = Math.min(10 + span * 0.16, 30);
      maxDrop = Math.max(maxDrop, drop);
      paths.push({ x1: x1, x2: x2, y: y, drop: drop, forward: forward });
    });

    svg.setAttribute("height", String(Math.ceil(maxDrop + 12)));
    paths.forEach(function (p) {
      var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var mid = (p.x1 + p.x2) / 2;
      path.setAttribute("d", "M " + p.x1 + " 2 Q " + mid + " " + (p.drop + 8) + " " + p.x2 + " 2");
      path.setAttribute("class", p.forward ? "edge edge--fwd" : "edge edge--back");
      svg.appendChild(path);

      var head = document.createElementNS("http://www.w3.org/2000/svg", "path");
      var dir = p.forward ? -1 : 1;
      head.setAttribute("d", "M " + (p.x2 + dir * 4) + " 6 L " + p.x2 + " 1 L " + (p.x2 - dir * 4) + " 6");
      head.setAttribute("class", p.forward ? "edge-head edge--fwd" : "edge-head edge--back");
      svg.appendChild(head);
    });
    host.appendChild(svg);
  }

  function drawTree(host, spine, refs) {
    if (!spine.length) return;
    var maxX = 0, maxD = 0;
    spine.forEach(function (n) {
      maxX = Math.max(maxX, n.x || 0);
      maxD = Math.max(maxD, n.depth || 0);
    });
    var colW = 54, rowH = 56, pad = 20;
    var w = (maxX + 1) * colW + pad * 2;
    var h = (maxD + 1) * rowH + 16;
    host.style.height = h + "px";
    host.style.minWidth = w + "px";

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "tree-edges");
    svg.setAttribute("width", String(w));
    svg.setAttribute("height", String(h));

    var pos = {};
    spine.forEach(function (n) {
      pos[n.id] = { x: pad + (n.x || 0) * colW + colW / 2, y: (n.depth || 0) * rowH + 22 };
    });

    spine.forEach(function (n) {
      ["left", "right"].forEach(function (side) {
        var cid = n[side];
        if (!cid || !pos[cid]) return;
        var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", pos[n.id].x);
        line.setAttribute("y1", pos[n.id].y + 13);
        line.setAttribute("x2", pos[cid].x);
        line.setAttribute("y2", pos[cid].y - 13);
        line.setAttribute("class", "tedge");
        svg.appendChild(line);
      });
    });
    host.appendChild(svg);

    spine.forEach(function (n) {
      var box = el("div", "tnode", esc(nodeRepr(n.val)));
      box.style.left = (pos[n.id].x - 16) + "px";
      box.style.top = (pos[n.id].y - 13) + "px";
      if (refs[n.id]) {
        box.classList.add("is-focus");
        box.appendChild(el("span", "tnode-tag", esc(refs[n.id].join(" "))));
      }
      host.appendChild(box);
    });
  }

  /* --------------------------------------------------- change commentary */

  Player.prototype.renderDelta = function (step, prev) {
    var d = this.delta;
    d.innerHTML = "";

    if (!prev) {
      d.appendChild(el("span", "idle", "—  start of trace; nothing has run yet"));
      return;
    }

    var changes = [], seen = {};
    Object.keys(prev.state).concat(Object.keys(step.state)).forEach(function (n) {
      if (seen[n]) return;
      seen[n] = 1;
      var a = prev.state[n] !== undefined ? nodeRepr(prev.state[n]) : null;
      var b = step.state[n] !== undefined ? nodeRepr(step.state[n]) : null;
      if (a === b) return;
      changes.push({ name: n, from: a, to: b });
    });

    if (!changes.length && prev.spine && step.spine) {
      var pe = prev.spine.map(function (n) { return n.next + "/" + n.left + "/" + n.right; }).join();
      var ce = step.spine.map(function (n) { return n.next + "/" + n.left + "/" + n.right; }).join();
      if (pe !== ce) {
        d.appendChild(el("span", "tag", "changed"));
        d.appendChild(el("span", "d", "<b>links</b> rewired"));
        return;
      }
    }

    if (!changes.length) {
      d.appendChild(el("span", "idle", "—  branch evaluated, no variable changed"));
      return;
    }

    d.appendChild(el("span", "tag", "changed"));
    changes.slice(0, 3).forEach(function (c) {
      var html = "<b>" + esc(c.name) + "</b> ";
      html += c.from === null ? '<span class="from">new</span>'
                              : '<span class="from">' + esc(truncate(c.from, 22)) + "</span>";
      html += '<span class="arrow">→</span>' + esc(truncate(c.to === null ? "gone" : c.to, 26));
      d.appendChild(el("span", "d", html));
    });
  };

  /* ---------------------------------------------------------- svg icons */

  function icon(kind) {
    var s = '<svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">';
    if (kind === "play")  return s + '<path d="M4 2.5v11l9-5.5z"/></svg>';
    if (kind === "pause") return s + '<rect x="4" y="2.5" width="3.2" height="11" rx="1"/><rect x="8.8" y="2.5" width="3.2" height="11" rx="1"/></svg>';
    if (kind === "next")  return s + '<path d="M3.5 2.5v11l8-5.5z"/><rect x="11.6" y="2.5" width="2" height="11" rx="1"/></svg>';
    if (kind === "prev")  return s + '<path d="M12.5 2.5v11l-8-5.5z"/><rect x="2.4" y="2.5" width="2" height="11" rx="1"/></svg>';
    if (kind === "reset") return s + '<path d="M8 3V1L4.8 3.4 8 5.8V3.8a4.2 4.2 0 1 1-4.2 4.2H2.3A5.7 5.7 0 1 0 8 3z"/></svg>';
    return s + "</svg>";
  }

  function check() {
    return '<svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#05221f" ' +
           'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
           '<path d="M3 8.4l3.2 3.2L13 4.8"/></svg>';
  }

  /* ============================================================
     Quiz
     ============================================================ */

  function buildQuiz(questions, host) {
    var pos = 0, score = 0, results = [];
    var card = el("section", "quiz card");

    var head = el("div", "quiz-head");
    head.appendChild(el("h3", null, "Which pattern does this prompt want?"));
    var scoreEl = el("div", "quiz-score");
    head.appendChild(scoreEl);
    card.appendChild(head);

    var body = el("div", "quiz-body");
    var qEl = el("p", "quiz-q");
    var optsEl = el("div", "quiz-opts");
    var whyEl = el("div", "quiz-why");
    var foot = el("div", "quiz-foot");
    var dots = el("div", "quiz-dots");
    var nextBtn = el("button", "btn", "Next question");

    body.appendChild(qEl); body.appendChild(optsEl); body.appendChild(whyEl);
    foot.appendChild(dots); foot.appendChild(nextBtn); body.appendChild(foot);
    card.appendChild(body);

    function paintDots() {
      dots.innerHTML = "";
      questions.forEach(function (_, i) {
        var d = el("i");
        if (results[i] === true) d.classList.add("is-on");
        if (results[i] === false) d.classList.add("is-miss");
        dots.appendChild(d);
      });
    }
    function paintScore() {
      var answered = results.filter(function (r) { return r !== undefined; }).length;
      scoreEl.innerHTML = "<b>" + score + "</b> / " + answered + (answered ? " correct" : "&nbsp;answered");
    }

    function show() {
      var q = questions[pos];
      qEl.innerHTML = q.prompt;
      whyEl.classList.remove("is-on");
      optsEl.innerHTML = "";
      nextBtn.style.visibility = "hidden";

      q.options.forEach(function (label, idx) {
        var b = el("button", "quiz-opt",
          '<span class="mark">' + "ABCD".charAt(idx) + "</span><span>" + esc(label) + "</span>");
        b.addEventListener("click", function () {
          if (results[pos] !== undefined) return;
          var right = idx === q.answer;
          results[pos] = right;
          if (right) score++;
          Array.prototype.forEach.call(optsEl.children, function (c, ci) {
            c.disabled = true;
            if (ci === q.answer) c.classList.add("is-right");
            else if (ci === idx) c.classList.add("is-wrong");
          });
          whyEl.innerHTML = '<span class="lbl">' + (right ? "Correct" : "The rule") + "</span>" + q.why;
          whyEl.classList.add("is-on");
          nextBtn.style.visibility = "visible";
          if (pos === questions.length - 1) nextBtn.textContent = "Start over";
          paintDots(); paintScore();
        });
        optsEl.appendChild(b);
      });
      paintDots(); paintScore();
    }

    nextBtn.addEventListener("click", function () {
      if (pos >= questions.length - 1) {
        pos = 0; score = 0; results = [];
        nextBtn.textContent = "Next question";
      } else { pos++; }
      show();
    });

    show();
    host.appendChild(card);
  }

  /* ============================================================
     Progress
     ============================================================ */

  var STORE = "nc150.progress.v1";

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); }
    catch (e) { return {}; }
  }
  function saveProgress(p) {
    try { localStorage.setItem(STORE, JSON.stringify(p)); } catch (e) { /* private mode */ }
  }

  function totalPracticeCount() {
    var n = 0;
    window.ROADMAP.forEach(function (t) { n += t.practice || 8; });
    return n;
  }

  function paintProgress() {
    var p = loadProgress();
    var done = 0;
    Object.keys(p).forEach(function (tid) {
      Object.keys(p[tid]).forEach(function (k) { if (p[tid][k]) done++; });
    });
    var total = totalPracticeCount();
    document.getElementById("prog-count").textContent = done + " / " + total;
    document.getElementById("prog-bar").style.width = (total ? (done / total) * 100 : 0) + "%";
  }

  /* ============================================================
     Rendering a topic
     ============================================================ */

  var livePlayers = [];

  function sectionShell(id, num, title, blurb) {
    var s = el("section", "section");
    s.id = id;
    var h = el("div", "section-head");
    h.innerHTML = '<span class="section-num">' + num + "</span><h2>" + title + "</h2>" +
      (blurb ? "<p>" + blurb + "</p>" : "");
    s.appendChild(h);
    return s;
  }

  function renderTable(spec, opts) {
    var wrap = el("div", "table-wrap");
    if (spec.caption) wrap.appendChild(el("div", "table-caption", spec.caption));
    var t = el("table");
    var thead = el("thead"), tr = el("tr");
    spec.head.forEach(function (h) { tr.appendChild(el("th", null, h)); });
    thead.appendChild(tr); t.appendChild(thead);
    var tb = el("tbody");
    spec.rows.forEach(function (row) {
      var r = el("tr");
      row.forEach(function (cell, ci) {
        r.appendChild(el("td", (opts && opts.mono && opts.mono.indexOf(ci) !== -1) ? "mono-cell" : null, cell));
      });
      tb.appendChild(r);
    });
    t.appendChild(tb); wrap.appendChild(t);
    return wrap;
  }

  function renderCallout(c) {
    var glyph = c.kind === "trap" ? "!" : "✦";
    var box = el("div", "callout callout--" + c.kind);
    box.innerHTML = '<span class="ico">' + glyph + '</span><div><span class="lbl">' +
      c.label + "</span>" + c.body + "</div>";
    return box;
  }

  function renderTopic(topic, traces) {
    livePlayers.forEach(function (p) { p.destroy(); });
    livePlayers = [];

    var main = document.getElementById("sections");
    main.innerHTML = "";

    document.documentElement.setAttribute("data-accent", topic.accent);
    document.title = topic.number + " · " + topic.title + " — NeetCode 150 Patterns";

    /* hero */
    var hero = document.getElementById("hero");
    hero.innerHTML =
      '<div class="hero-eyebrow"><span class="n">' + topic.number + "</span>" +
      '<span class="sep"></span><span>Pattern reference</span></div>' +
      "<h1>" + topic.title + "</h1>" +
      '<p class="hero-sub">' + topic.subtitle + "</p>";
    var chips = el("div", "hero-chips");
    chips.appendChild(el("span", "chip", '<span class="lbl">time</span><b>' + topic.bounds.time + "</b>"));
    chips.appendChild(el("span", "chip", '<span class="lbl">aux space</span><b>' + topic.bounds.space + "</b>"));
    chips.appendChild(el("span", "chip", '<span class="lbl">driven by</span><b>' + topic.bounds.driver + "</b>"));
    hero.appendChild(chips);

    /* 1. Mechanics */
    var s1 = sectionShell("mechanics", "Section 1", "Mechanics and invariant",
      "Memorise the invariant, not the code. Under pressure the invariant is what lets you re-derive the loop bounds and the update order.");
    s1.appendChild(el("div", "prose", "<p>" + topic.mechanics.lede + "</p>"));
    topic.mechanics.mechanisms.forEach(function (m) {
      var card = el("div", "card mech");
      var h = el("div", "mech-head");
      h.innerHTML = '<span class="mech-tag">' + m.tag + "</span><h3>" + m.name + "</h3><p>" + m.blurb + "</p>";
      card.appendChild(h);
      if (m.code) {
        var cb = el("div", "code-block");
        cb.appendChild(el("div", "code-caption", m.caption || ""));
        card.appendChild(cb);
        card.appendChild(codeBlock(m.code));
      }
      if (m.invariant) {
        var inv = el("div", "invariant");
        inv.innerHTML = '<span class="lbl">Invariant</span>' + m.invariant;
        card.appendChild(inv);
      }
      s1.appendChild(card);
    });
    if (topic.mechanics.aside) {
      var aside = el("div", "card");
      aside.appendChild(el("div", "mech-head",
        "<h3>" + topic.mechanics.aside.title + "</h3><p>" + topic.mechanics.aside.body + "</p>"));
      aside.appendChild(el("div", null, "<div style='height:18px'></div>"));
      s1.appendChild(aside);
    }
    main.appendChild(s1);

    /* 2. Why it works */
    var s2 = sectionShell("why", "Section 2", "Why it works",
      "A correctness proof by loop invariant or exchange argument, and a complexity proof that <em>accounts</em> for the work rather than asserting a bound.");
    topic.whyItWorks.proofs.forEach(function (p) {
      var card = el("div", "card mech");
      var h = el("div", "mech-head");
      h.innerHTML = "<h3>" + p.title + "</h3>" +
        '<p class="mech-sub">' + p.sub + "</p>";
      card.appendChild(h);
      var pr = el("div", "prose prose--inset");
      pr.innerHTML = p.body;
      card.appendChild(pr);
      s2.appendChild(card);
    });
    if (topic.whyItWorks.callout) s2.appendChild(renderCallout(topic.whyItWorks.callout));
    if (topic.whyItWorks.table) s2.appendChild(renderTable(topic.whyItWorks.table, { mono: [1, 2] }));
    main.appendChild(s2);

    /* 3. When to use */
    var s3 = sectionShell("when", "Section 3", "When to use vs. adjacent patterns", topic.whenToUse.lede);
    if (topic.whenToUse.callout) s3.appendChild(renderCallout(topic.whenToUse.callout));
    s3.appendChild(renderTable(topic.whenToUse));
    if (topic.whenToUse.after) {
      var after = el("div", "prose");
      after.innerHTML = topic.whenToUse.after;
      after.style.marginTop = "20px";
      s3.appendChild(after);
    }
    if (topic.quiz && topic.quiz.length) buildQuiz(topic.quiz, s3);
    main.appendChild(s3);

    /* 4. Edge cases */
    var s4 = sectionShell("edges", "Section 4", "Edge cases",
      "Enumerating these unprompted is what separates a hire from a weak hire far more often than writing the loop correctly.");
    s4.appendChild(renderTable(topic.edgeCases));
    main.appendChild(s4);

    /* 5. Common bugs */
    var s5 = sectionShell("bugs", "Section 5", "Common bugs",
      "Each pair is a real failure mode, with the exact input that exposes it.");
    topic.bugs.forEach(function (b) {
      var card = el("div", "card bug");
      var h = el("div", "bug-head");
      h.innerHTML = '<span class="bug-n">' + b.n + "</span><h3>" + b.title + "</h3>";
      card.appendChild(h);
      var grid = el("div", "bug-grid");
      var cw = el("div", "bug-col bug-col--wrong");
      cw.appendChild(el("div", "bug-col-head", "✕&nbsp; Wrong"));
      cw.appendChild(codeBlock(b.wrong));
      var cr = el("div", "bug-col bug-col--right");
      cr.appendChild(el("div", "bug-col-head", "✓&nbsp; Right"));
      cr.appendChild(codeBlock(b.right));
      grid.appendChild(cw); grid.appendChild(cr);
      card.appendChild(grid);
      card.appendChild(el("div", "bug-note", b.note));
      s5.appendChild(card);
    });
    main.appendChild(s5);

    /* 6. Dry runs */
    var s6 = sectionShell("dryrun", "Section 6", "Worked examples — dry runs",
      "Every step below was produced by <strong>actually executing</strong> the code under a tracer, one snapshot per line. " +
      "Step with the buttons, or with <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> once a player has focus.");
    if (traces && traces.examples) {
      traces.examples.forEach(function (ex) { livePlayers.push(new Player(ex, s6)); });
    }
    main.appendChild(s6);

    /* 7. Practice */
    var s7 = sectionShell("practice", "Section 7", "Practice problems", "Ticks are saved in this browser.");
    var progress = loadProgress();
    progress[topic.id] = progress[topic.id] || {};

    var wrap = el("div", "table-wrap");
    wrap.appendChild(el("div", "table-caption", topic.practice.caption));
    var table = el("table");
    var thead = el("thead");
    thead.innerHTML = "<tr><th>Problem</th><th>Level</th><th>What it drills</th></tr>";
    table.appendChild(thead);
    var tbody = el("tbody");
    topic.practice.rows.forEach(function (row) {
      var key = row[1];
      var tr = el("tr", "practice-row");
      tr.innerHTML =
        '<td><span class="tick">' + check() + "</span><span>" + row[0] +
        ' <span class="lc-tag">' + row[1] + "</span></span></td>" +
        '<td><span class="lvl lvl-' + row[2] + '">' + row[2] + "</span></td>" +
        "<td>" + row[3] + "</td>";
      if (progress[topic.id][key]) tr.classList.add("is-done");
      tr.addEventListener("click", function () {
        var done = tr.classList.toggle("is-done");
        progress[topic.id][key] = done;
        saveProgress(progress);
        paintProgress();
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); wrap.appendChild(table);
    s7.appendChild(wrap);

    var proto = el("div");
    proto.style.marginTop = "34px";
    proto.appendChild(el("div", "viz-name", "Interview protocol these sections are built around"));
    var ol = el("ol", "protocol");
    window.PROTOCOL.forEach(function (p) { ol.appendChild(el("li", null, "<span>" + p + "</span>")); });
    proto.appendChild(ol);
    s7.appendChild(proto);
    main.appendChild(s7);

    /* Appendix */
    var s8 = sectionShell("reference", "Appendix", "Master bounds and Python hot paths",
      "Reference bounds for all 18 patterns, and the constant-factor facts these bounds assume.");
    s8.appendChild(renderTable({
      caption: "Reference bounds for all 18 patterns",
      head: ["#", "Pattern", "Time", "Aux space", "Bound driven by"],
      rows: window.ROADMAP.map(function (t) { return [t.n, t.title, t.time, t.aux, t.driver]; })
    }, { mono: [0, 2, 3] }));
    s8.appendChild(renderTable(window.HOTPATH, { mono: [1] }));
    s8.appendChild(renderCallout({ kind: "trap", label: "Trap", body: window.HOTPATH.trap }));
    main.appendChild(s8);

    paintProgress();
    markRail(topic.id);
    wireScrollSpy();
    window.scrollTo(0, 0);
  }

  /* ============================================================
     Sidebar + router
     ============================================================ */

  function renderSidebar() {
    var rail = document.getElementById("rail");
    rail.innerHTML = "";
    window.ROADMAP.forEach(function (t) {
      var li = el("li");
      var a = el("a");
      a.href = "#/" + t.id;
      a.setAttribute("data-accent", t.accent);
      a.setAttribute("data-topic", t.id);
      a.innerHTML = '<span class="rail-n">' + t.n + "</span>" +
        '<span class="rail-dot" style="color:var(--accent)"></span><span>' + t.title + "</span>";
      li.appendChild(a);
      rail.appendChild(li);
    });
  }

  function markRail(id) {
    Array.prototype.forEach.call(document.querySelectorAll("#rail a"), function (a) {
      a.classList.toggle("is-active", a.getAttribute("data-topic") === id);
    });
  }

  function inject(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = function () { cb(null); };
    s.onerror = function () { cb(new Error(src)); };
    document.head.appendChild(s);
  }

  var loading = {};

  function loadTopic(id, cb) {
    if (window.CONTENT[id] && window.TRACES[id]) return cb(null);
    if (loading[id]) return;
    loading[id] = true;
    var pending = 2, failed = null;
    function done(err) {
      if (err) failed = err;
      if (--pending === 0) { loading[id] = false; cb(failed); }
    }
    inject("data/topics/" + id + ".content.js", done);
    inject("data/topics/" + id + ".traces.js", done);
  }

  function showMessage(title, body) {
    document.getElementById("hero").innerHTML =
      '<div class="hero-eyebrow"><span class="sep"></span><span>NeetCode 150</span></div>' +
      "<h1>" + title + "</h1><p class='hero-sub'>" + body + "</p>";
    document.getElementById("sections").innerHTML = "";
  }

  function route() {
    var id = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    var known = window.ROADMAP.filter(function (t) { return t.id === id; })[0];
    if (!known) {
      id = window.ROADMAP[0].id;
      known = window.ROADMAP[0];
    }
    markRail(id);
    showMessage("Loading " + known.title + "…", "Fetching the topic data and its traced examples.");
    loadTopic(id, function (err) {
      if (err || !window.CONTENT[id]) {
        showMessage(known.title,
          "This topic has not been written yet. Pick another from the sidebar — " +
          "each one carries the same seven sections and three traced dry runs.");
        return;
      }
      renderTopic(window.CONTENT[id], window.TRACES[id]);
    });
  }

  function wireScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".subnav a"));
    var targets = links.map(function (a) {
      return document.getElementById(a.getAttribute("data-sec"));
    }).filter(Boolean);
    if (!targets.length) return;

    function onScroll() {
      var y = window.scrollY + 130;
      var active = targets[0];
      targets.forEach(function (t) { if (t.offsetTop <= y) active = t; });
      links.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("data-sec") === active.id);
      });
    }
    if (wireScrollSpy._h) window.removeEventListener("scroll", wireScrollSpy._h);
    wireScrollSpy._h = onScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function wireSubnav() {
    Array.prototype.forEach.call(document.querySelectorAll(".subnav a"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var t = document.getElementById(a.getAttribute("data-sec"));
        if (t) window.scrollTo({ top: t.offsetTop - 58, behavior: "smooth" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSidebar();
    wireSubnav();
    paintProgress();
    route();
    window.addEventListener("hashchange", route);
  });
})();
