"""Thinkcat tabular classification client."""
import json
import math
import os
from http.client import HTTPException
from importlib.resources import files
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


class PredictionError(Exception):
    def __init__(self, message, status=None):
        super().__init__(message)
        self.status = status


class _Redirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if code in (307, 308) and newurl == req.full_url.rstrip("/") + "/":
            return Request(newurl, data=req.data, headers=req.headers, method="POST")
        raise HTTPError(req.full_url, code, msg, headers, fp)


def load_example():
    """Return labeled rows, rows to predict, and the target column."""
    data = json.loads(files(__package__).joinpath("donation.json").read_text("utf-8"))
    target = data["target_column"]
    labeled = [row for row in data["rows"] if row[target] is not None]
    query = [{k: v for k, v in row.items() if k != target}
             for row in data["rows"] if row[target] is None]
    return labeled, query, target


class Client:
    def __init__(self, base_url=None, timeout=125):
        self.base_url = (base_url or os.getenv("THINKCAT_API_ORIGIN") or "https://thinkcatlabs.ai").rstrip("/")
        url = urlsplit(self.base_url)
        if url.scheme not in ("http", "https") or not url.hostname or url.username or url.path or url.query or url.fragment:
            raise ValueError("base_url must be an HTTP(S) origin")
        if not math.isfinite(timeout) or timeout <= 0:
            raise ValueError("timeout must be positive and finite")
        self.timeout = timeout

    def predict(self, labeled, query, target_column):
        """Return the gateway JSON, including model, row_indices and predictions."""
        support = list(labeled)
        pending = list(query)
        if not target_column or not support or not pending:
            raise ValueError("Provide labeled rows, query rows and a target column")
        if any(row.get(target_column) is None or not str(row[target_column]).strip() for row in support):
            raise ValueError("Every labeled row must contain a target value")
        if any(row.get(target_column) not in (None, "") for row in pending):
            raise ValueError("Query rows must omit the target or leave it empty")
        rows = support + [{**row, target_column: None} for row in pending]
        payload = json.dumps({"rows": rows, "target_column": target_column}, allow_nan=False).encode()
        request = Request(self.base_url + "/api/predict", data=payload,
                          headers={"Content-Type": "application/json", "Accept": "application/json"})
        try:
            with build_opener(_Redirect()).open(request, timeout=self.timeout) as response:
                result = json.load(response)
        except HTTPError as error:
            with error:
                detail = error.read(600).decode("utf-8", errors="replace")
            raise PredictionError(f"HTTP {error.code}: {detail}", error.code) from error
        except (URLError, OSError, HTTPException, ValueError) as error:
            raise PredictionError(f"Prediction request failed: {error}") from error
        expected = list(range(len(support), len(rows)))
        if (not isinstance(result, dict) or result.get("row_indices") != expected
                or not isinstance(result.get("model"), str)
                or not isinstance(result.get("predictions"), list)
                or len(result["predictions"]) != len(pending)
                or not isinstance(result.get("probabilities"), list)
                or len(result["probabilities"]) != len(pending)):
            raise PredictionError("Invalid prediction response")
        return result
