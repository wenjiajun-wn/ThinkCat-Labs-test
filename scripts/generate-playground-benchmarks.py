"""Generate static Playground recordings. Install dependencies with pip install xgboost numpy.

For GPU recordings, pass --api-url https://thinkcatlabs.ai/api/kumo/predict.
Without that argument the primary recording uses a standardized five-neighbor CPU baseline.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
from tempfile import NamedTemporaryFile
from time import perf_counter
from urllib.request import Request, urlopen

import numpy as np
from xgboost_service import predict as predict_xgboost

CONTENT = Path(__file__).resolve().parents[1] / "content"
VERSION_FIELDS = ("sourceSha256", "headers", "target", "rows", "sourceRecords", "supportIndices", "queryIndices")


def prepare(data):
    support, query = data["supportIndices"], data["queryIndices"]
    if sorted(support + query) != list(range(len(data["rows"]))):
        raise ValueError("Invalid support/query partition")
    target = data["target"]
    queries = set(query)
    rows = []
    for i, cells in enumerate(data["rows"]):
        row = dict(zip(data["headers"], cells, strict=True))
        label = row[target].strip()
        if bool(label) == (i in queries):
            raise ValueError("Labels do not match the declared split")
        rows.append({key: (label or None) if key == target else float(v) for key, v in row.items()})
    return {"rows": rows, "target_column": target}


def local_baseline(data):
    start = perf_counter()
    target = data["headers"].index(data["target"])
    x = np.asarray([[float(v) for j, v in enumerate(row) if j != target] for row in data["rows"]])
    support, queries = data["supportIndices"], data["queryIndices"]
    train = x[support]
    scale = train.std(axis=0)
    scale[scale == 0] = 1
    labels = [data["rows"][i][target].strip() for i in support]
    classes = sorted(set(labels))
    scores, predictions = [], []
    for query in x[queries]:
        distances = np.sum(((train - query) / scale) ** 2, axis=1)
        neighbors = [labels[i] for i in np.argsort(distances, kind="stable")[:5]]
        vote = {label: neighbors.count(label) / len(neighbors) for label in classes}
        scores.append(vote)
        predictions.append(max(neighbors, key=vote.get))
    return dict(model="5-NN", source="precomputed", timing="compute", elapsedMs=(perf_counter()-start)*1000,
                classes=classes, row_indices=queries, predictions=predictions, probabilities=scores)


def fetch_live(url, payload):
    request = Request(url, data=json.dumps(payload, allow_nan=False).encode(),
                      headers={"Content-Type": "application/json", "Accept": "application/json"})
    start = perf_counter()
    with urlopen(request, timeout=125) as response:
        body = json.load(response)
    if body.get("model") != "Kumo Tabular Medium":
        raise ValueError("Unexpected model identifier")
    body["timing"] = "server" if "elapsedMs" in body else "request"
    body.setdefault("elapsedMs", (perf_counter()-start)*1000)
    body["source"] = "live"
    return body


def validate(result, queries, classes):
    elapsed = result["elapsedMs"]
    if not math.isfinite(elapsed) or elapsed <= 0 or set(result["classes"]) != classes:
        raise ValueError("Invalid timing or classes")
    if sorted(result["row_indices"]) != sorted(queries):
        raise ValueError("Prediction indices do not match query rows")
    for _, label, scores in zip(queries, result["predictions"], result["probabilities"], strict=True):
        if label not in classes or set(scores) != classes or not all(0 <= n <= 1 for n in scores.values()):
            raise ValueError("Invalid prediction")
        if not math.isclose(sum(scores.values()), 1, abs_tol=0.01):
            raise ValueError("Invalid class probabilities")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--api-url")
    args = parser.parse_args()
    results = {}
    for path in sorted((CONTENT / "datasets").glob("*.json")):
        if not path.stem.isdigit():
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        payload = prepare(data)
        classes = {payload["rows"][i][data["target"]] for i in data["supportIndices"]}
        primary = fetch_live(args.api_url, payload) if args.api_url else local_baseline(data)
        baseline = dict(predict_xgboost(payload), source="precomputed", timing="compute")
        for result in (primary, baseline):
            validate(result, data["queryIndices"], classes)
        identity = json.dumps({k: data[k] for k in VERSION_FIELDS}, ensure_ascii=False, separators=(",", ":"))
        results[path.stem] = dict(datasetVersion=hashlib.sha256(identity.encode()).hexdigest(),
                                  thinkcat=primary, xgboost=baseline)
        print(path.stem, len(data["queryIndices"]), primary["model"], baseline["model"])
    if len(results) != 21:
        raise ValueError(f"Expected 21 datasets, found {len(results)}")
    output = CONTENT / "playground-precomputed.json"
    with NamedTemporaryFile("w", dir=CONTENT, encoding="utf-8", delete=False) as temp:
        json.dump(results, temp, ensure_ascii=False, allow_nan=False, indent=2)
        temp.write("\n")
    Path(temp.name).replace(output)


if __name__ == "__main__":
    main()
