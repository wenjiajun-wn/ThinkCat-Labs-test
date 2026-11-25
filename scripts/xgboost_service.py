"""Loopback CPU inference service for the static Playground."""
import json
import math
from http.server import BaseHTTPRequestHandler, HTTPServer
from time import perf_counter

import numpy as np
import xgboost as xgb


def predict(payload):
    rows, target = payload["rows"], payload["target_column"]
    if not isinstance(rows, list) or not 20 <= len(rows) <= 10000:
        raise ValueError("rows")
    features = [key for key in rows[0] if key != target]
    if not 1 <= len(features) <= 30:
        raise ValueError("features")
    support, queries, indices, labels = [], [], [], []
    for i, row in enumerate(rows):
        if not isinstance(row, dict) or len(row) != len(features) + 1:
            raise ValueError("columns")
        vector = [row[key] for key in features]
        if not all(type(v) in (int, float) and math.isfinite(v) for v in vector):
            raise ValueError("features")
        label = row[target]
        if label is None:
            queries.append(vector)
            indices.append(i)
        elif isinstance(label, str) and label.strip():
            support.append(vector)
            labels.append(label)
        else:
            raise ValueError("label")
    classes = sorted(set(labels))
    if len(support) < 10 or not 1 <= len(queries) <= 50 or not 2 <= len(classes) <= 10:
        raise ValueError("split")

    started = perf_counter()
    train = xgb.DMatrix(np.asarray(support), label=[classes.index(v) for v in labels], nthread=1)
    model = xgb.train(dict(objective="multi:softprob", num_class=len(classes),
                           tree_method="hist", max_depth=4, nthread=1, seed=0),
                      train, num_boost_round=50)
    scores = model.predict(xgb.DMatrix(np.asarray(queries), nthread=1))
    return dict(model="XGBoost", elapsedMs=(perf_counter() - started) * 1000,
                classes=classes, row_indices=indices,
                predictions=[classes[i] for i in scores.argmax(axis=1)],
                probabilities=[dict(zip(classes, row.tolist())) for row in scores])


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/xgboost/predict":
            return self.send_error(404)
        if self.headers.get_content_type() != "application/json":
            return self.send_error(415)
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= 8 * 1024 * 1024:
                return self.send_error(413)
            body = json.dumps(predict(json.loads(self.rfile.read(length)))).encode()
        except (ValueError, TypeError, KeyError, OverflowError, xgb.core.XGBoostError):
            return self.send_error(422)
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
