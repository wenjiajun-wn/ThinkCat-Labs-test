"""Prepare native numeric records from the user's extracted TabArena archive."""
import hashlib
import json
import math
from pathlib import Path
import sys
import pandas as pd
from pandas.api.types import is_numeric_dtype, is_bool_dtype

ROOT = Path(__file__).resolve().parents[1]
PLAN = {'46910': 10000, '46915': 5000, '46920': 4000, '46924': 8000,
        '46927': 1480, '46938': 1723, '46964': 6497}

def prepare(folder):
    manifest = json.loads((folder / 'manifest.json').read_text())
    evaluation_path = ROOT / 'content/datasets/evaluation.json'
    evaluation = json.loads(evaluation_path.read_text())
    for dataset_id, count in PLAN.items():
        entry = next(x for x in manifest if str(x['dataset_id']) == dataset_id)
        raw = (folder / entry['file']).read_bytes()
        frame = pd.read_parquet(folder / entry['file'])
        target = entry['target']
        features = [c for c in frame if c != target and is_numeric_dtype(frame[c]) and not is_bool_dtype(frame[c])]
        valid = frame[features].apply(lambda s: s.map(lambda v: pd.notna(v) and math.isfinite(float(v)))).all(axis=1) & frame[target].notna()
        positions = [i for i in range(len(frame)) if valid.iloc[i]][:count]
        assert len(positions) == count and 1 <= len(features) <= 30
        labels = [str(frame[target].iloc[i]) for i in positions]
        # Reserve at least two support examples per class, including rare wine grades.
        remaining = {label: labels.count(label) for label in set(labels)}
        queries = []
        for i in reversed(range(count)):
            if remaining[labels[i]] > 2:
                queries.append(i)
                remaining[labels[i]] -= 1
            if len(queries) == 50:
                break
        queries.sort()
        assert len(queries) == 50 and 2 <= len(remaining) <= 10
        query_set = set(queries)
        rows = [[str(frame[c].iloc[position]) for c in features] + ['' if i in query_set else labels[i]] for i, position in enumerate(positions)]
        data = dict(id=dataset_id, headers=features+[target], target=target, rows=rows,
                    sourceRecords=[p+1 for p in positions], supportIndices=[i for i in range(count) if i not in query_set], queryIndices=queries,
                    sourceFile=entry['file'], sourceSha256=hashlib.sha256(raw).hexdigest(),
                    selection=f'First {count} complete native numeric records in source order; last 50 eligible labels withheld, preserving at least two support rows per class. No feature values changed.',
                    originalRowCount=len(frame), originalFeatureCount=len(frame.columns)-1,
                    omittedFeatures=[c for c in frame if c != target and c not in features],
                    projectionPolicy='All native numeric non-boolean features retained; non-numeric features omitted. No encoding or imputation.')
        fields = ('sourceSha256','headers','target','rows','sourceRecords','supportIndices','queryIndices')
        version = hashlib.sha256(json.dumps({k:data[k] for k in fields},ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
        evaluation[dataset_id] = dict(datasetId=dataset_id,datasetVersion=version,targetColumn=target,
             queryLabels=[dict(index=i,sourceRecord=positions[i]+1,label=labels[i]) for i in queries])
        (ROOT / f'content/datasets/{dataset_id}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
        print(dataset_id, count, len(features), 'features; 50 queries')
    evaluation_path.write_text(json.dumps(evaluation,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__ == '__main__':
    prepare(Path(sys.argv[1]))
