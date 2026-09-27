"""Regenerate every topic's trace bundle.

    python tools/build_all.py            # all topics
    python tools/build_all.py trees      # just one
"""
import importlib
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import common  # noqa: E402
import tracer  # noqa: E402

ORDER = [
    "arrays_hashing", "two_pointers", "sliding_window", "stack",
    "binary_search", "linked_list", "trees", "tries", "heap",
    "backtracking", "graphs", "advanced_graphs", "dp_1d", "dp_2d",
    "greedy", "intervals", "math_geometry", "bit_manipulation",
]


def main(only=None):
    os.makedirs(common.DATA, exist_ok=True)
    total_steps = 0
    built = 0
    missing = []

    for name in ORDER:
        if only and only not in name:
            continue
        try:
            mod = importlib.import_module("topics." + name)
        except ImportError:
            missing.append(name)
            continue
        total_steps += tracer.write(
            mod.TOPIC, mod.EXAMPLES, common.out_path(mod.TOPIC["id"])
        )
        built += 1

    print("")
    print("built %d topics, %d traced steps" % (built, total_steps))
    if missing:
        print("not yet written: " + ", ".join(missing))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else None)
