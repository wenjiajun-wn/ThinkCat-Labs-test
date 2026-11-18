"""从用户提供的 TabArena 压缩包生成数值分类演示子集，不改动原始特征值。

用法：python scripts/prepare-playground-datasets.py <TabArena-v0.1-45-datasets.zip>
需要本地已有 pandas / pyarrow；不属于网站运行依赖。
"""
import hashlib
import io
import json
import math
from pathlib import Path
import sys
import zipfile

import pandas as pd
from pandas.api.types import is_bool_dtype, is_numeric_dtype
import pyarrow.parquet as pq


# 已有献血、孕产示例维持原样。示例行数各异，列数取真实数值字段数量。
PLAN = [
    ('46979', 80, 21), ('46935', 30, 2), ('46910', 100, 5),
    ('46918', 120, 7), ('46921', 150, 8), ('46947', 180, 10),
    ('46956', 210, 11), ('46940', 240, 16), ('46960', 300, 19),
    ('46932', 400, 23), ('46930', 480, 30),
    ('46919', 260, 20),
    ('46906', 35, 6),
]
OUTPUT = Path(__file__).resolve().parents[1] / 'content' / 'datasets'


def label(value):
    return str(value).lower() if isinstance(value, bool) or str(value) in ('True', 'False') else str(value)


def prepare(archive):
    with zipfile.ZipFile(archive) as zipped:
        manifest = json.loads(zipped.read('TabArena-v0.1/manifest.json'))
        for dataset_id, count, feature_count in PLAN:
            item = next(entry for entry in manifest if entry['dataset_id'] == dataset_id)
            raw = zipped.read('TabArena-v0.1/' + item['file'])
            frame = pq.read_table(io.BytesIO(raw)).to_pandas()
            target = item['target']
            features = [column for column in frame if column != target
                        and is_numeric_dtype(frame[column]) and not is_bool_dtype(frame[column])]
            assert len(features) == feature_count, (dataset_id, features)
            omitted = [column for column in frame if column not in features and column != target]
            # 只选完整数值记录，不编码类别、不插补、不对数值归一化。
            valid = frame[features].apply(lambda series: series.map(lambda value: pd.notna(value) and math.isfinite(float(value)))).all(axis=1) & frame[target].notna()
            labels = frame[target].map(label)
            classes = sorted(labels[valid].unique())
            assert 2 <= len(classes) <= 10
            query_count = max(2 * len(classes), min(48, math.ceil(count / 10)))
            selected = []
            for ordinal, category in enumerate(classes):
                take = count // len(classes) + (ordinal < count % len(classes))
                queries = query_count // len(classes) + (ordinal < query_count % len(classes))
                positions = [i for i in range(len(frame)) if valid.iloc[i] and labels.iloc[i] == category][:take]
                assert len(positions) == take and take - queries >= 2, (dataset_id, category, len(positions), take)
                selected.extend((position, j >= take - queries) for j, position in enumerate(positions))
            selected.sort()
            headers = features + [target]
            rows = []
            for position, query in selected:
                values = [str(frame[column].iloc[position]) for column in features]
                values.append('' if query else label(frame[target].iloc[position]))
                rows.append(values)
            result = {
                'id': dataset_id, 'headers': headers, 'target': target, 'rows': rows,
                'sourceRecords': [position + 1 for position, _ in selected],
                'supportIndices': [i for i, (_, query) in enumerate(selected) if not query],
                'queryIndices': [i for i, (_, query) in enumerate(selected) if query],
                'sourceFile': item['file'], 'sourceSha256': hashlib.sha256(raw).hexdigest(),
                'selection': f'First complete numeric-feature records per class in source order, balanced quotas totaling {count}; last records per class withheld, {query_count} queries total. No feature values changed.',
                'originalRowCount': len(frame), 'originalFeatureCount': len(frame.columns) - 1,
                'omittedFeatures': omitted,
                'projectionPolicy': 'All native numeric non-boolean features retained; non-numeric features omitted. No categorical encoding or imputation.',
            }
            OUTPUT.joinpath(dataset_id + '.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
            print(f'{dataset_id}: {count} rows, {len(headers)} columns, {query_count} queries; omitted {len(omitted)} categorical features')


if __name__ == '__main__':
    prepare(sys.argv[1])
