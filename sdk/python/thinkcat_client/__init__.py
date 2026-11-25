"""Estimator interface for the Thinkcat prediction service."""
from thinkcat import Client, PredictionError


class ThinkcatClassifier:
    """Classify numeric feature matrices using labeled context rows."""

    def __init__(self, base_url=None, timeout=125):
        self._client = Client(base_url=base_url, timeout=timeout)
        self._support = None

    @staticmethod
    def _rows(matrix, width):
        rows = []
        for row in matrix:
            values = list(row)
            if width is None:
                width = len(values)
            if not width or len(values) != width:
                raise ValueError("Expected a matrix with a consistent number of features")
            rows.append({f"x{i}": float(value) for i, value in enumerate(values)})
        return rows

    def fit(self, X, y):
        rows = self._rows(X, None)
        labels = list(y)
        if not rows or len(rows) != len(labels):
            raise ValueError("Provide one label for each training row")
        width = len(rows[0])
        classes = {}
        for row, label in zip(rows, labels):
            if label is None or not str(label).strip():
                raise ValueError("Training labels must be nonempty")
            key = str(label)
            if key in classes and classes[key] != label:
                raise ValueError("Distinct labels must have distinct string representations")
            classes[key] = label
            row["label"] = key
        self._support = rows
        self._classes = classes
        self.n_features_in_ = width
        return self

    def predict(self, X):
        if self._support is None:
            raise ValueError("Call fit before predict")
        rows = self._rows(X, self.n_features_in_)
        predictions = []
        for offset in range(0, len(rows), 50):
            result = self._client.predict(self._support, rows[offset:offset + 50], "label")
            for key in result["predictions"]:
                if not isinstance(key, str) or key not in self._classes:
                    raise PredictionError("Unknown class in prediction response")
                predictions.append(self._classes[key])
        return predictions
