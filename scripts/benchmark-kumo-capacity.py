"""Run the deployed predictor in an isolated process, without editing app.py.

Only the total-row validation is changed in memory (500 -> 10000).
No server is started, no query answers are supplied, no feature rows are sampled.
Run during a quiet period because this process shares the production GPU.
"""
import ast
import hashlib
import json
import math
from pathlib import Path
import sys
import time
import types


def candidate_source(source):
    tree = ast.parse(source)
    matches = 0
    for node in ast.walk(tree):
        if isinstance(node, ast.Compare) and ast.unparse(node) == '20 <= len(df) <= 500':
            node.comparators[-1] = ast.Constant(value=10000)
            matches += 1
        if isinstance(node, ast.Constant) and node.value == 'Requires 20-500 rows':
            node.value = 'Requires 20-10000 rows (capacity test only)'
    if matches != 1:
        raise RuntimeError('Deployed row validation differs from reviewed source; stopped.')
    return compile(ast.fix_missing_locations(tree), '<capacity-test-only>', 'exec')


def main():
    import torch
    app_path = Path('/root/kumo-api/app.py')
    here = Path(__file__).resolve().parent
    source = app_path.read_text()
    inputs = json.loads((here / 'bank-churn-capacity.json').read_text())
    sys.path.insert(0, str(app_path.parent))
    module = types.ModuleType('capacity_candidate')
    module.__file__ = str(app_path)
    exec(candidate_source(source), module.__dict__)
    report = {'app_sha256': hashlib.sha256(source.encode()).hexdigest(),
              'source': inputs['source'], 'source_sha256': inputs['source_sha256'],
              'mode': 'isolated process; only total-row guard changed in memory',
              'gpu': torch.cuda.get_device_name(0), 'results': []}
    destination = here / 'capacity-results.json'
    def save():
        destination.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    save()
    passed = True
    for count in (1000, 2000, 5000, 10000):
        rows = [dict(row) for row in inputs['rows'][:count]]
        target = inputs['target_column']
        query_indices = list(range(count - 50, count))
        for index in query_indices:
            rows[index][target] = None
        assert len({row[target] for row in rows[:-50]}) >= 2
        print(f'START rows={count} context={count-50} queries=50', flush=True)
        torch.cuda.empty_cache()
        torch.cuda.reset_peak_memory_stats()
        torch.cuda.synchronize()
        started = time.perf_counter()
        record = {'rows': count, 'context_rows': count-50, 'query_rows': 50}
        try:
            result = module.predict(module.PredictRequest(rows=rows, target_column=target))
            torch.cuda.synchronize()
            assert result['row_indices'] == query_indices
            assert len(result['predictions']) == len(result['probabilities']) == 50
            assert result['model'] == 'Kumo Tabular Medium'
            for label, probabilities in zip(result['predictions'], result['probabilities']):
                assert label in probabilities
                assert set(probabilities) == set(result['classes'])
                assert all(math.isfinite(p) and 0 <= p <= 1 for p in probabilities.values())
                assert abs(sum(probabilities.values())-1) <= .01
            record['status'] = 'passed'
        except Exception as error:
            record.update(status='failed', error_type=type(error).__name__,
                          detail=getattr(error, 'detail', 'See process stderr'))
            passed = False
        record.update(seconds=round(time.perf_counter()-started, 3),
                      peak_allocated_mib=round(torch.cuda.max_memory_allocated()/1024**2, 1),
                      peak_reserved_mib=round(torch.cuda.max_memory_reserved()/1024**2, 1))
        report['results'].append(record)
        save()
        print(json.dumps(record, ensure_ascii=False), flush=True)
        if not passed:
            break
    print(f'Report: {destination}', flush=True)
    print('app.py was not edited; the running service still has its original limits.', flush=True)
    return 0 if passed else 1


if __name__ == '__main__':
    sys.exit(main())
