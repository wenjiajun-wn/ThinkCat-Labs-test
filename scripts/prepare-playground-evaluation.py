"""从原始 TabArena 恢复现有示例的留出标签；不重新取样或改写输入数据。

用法：
  python scripts/prepare-playground-evaluation.py <TabArena-v0.1-45-datasets.zip>
  python scripts/prepare-playground-evaluation.py <TabArena-v0.1-45-datasets.zip> --check

仅依赖本地已有 pandas / pyarrow，不属于前端运行依赖。--check 不写任何文件。
sourceRecords 已由原生成脚本定义为 Parquet 原始行位置 + 1；这里使用 iloc
按位置定位，绝不依赖 DataFrame 的 index、特征值匹配或 CSV 表头偏移。
"""

import argparse
from collections import Counter
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


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'content' / 'datasets'
OUTPUT = DATA / 'evaluation.json'
VERSION_FIELDS = ('sourceSha256', 'headers', 'target', 'rows', 'sourceRecords',
                  'supportIndices', 'queryIndices')


def require(condition, dataset_id, message):
    if not condition:
        raise ValueError(f'{dataset_id}: {message}')


def sha256(raw):
    return hashlib.sha256(raw).hexdigest()


def serialize_label(value, boolean_target):
    # Only actual boolean targets become false/true, matching the input generator.
    # Other labels keep their exact case and spelling, including the string "0".
    if pd.isna(value):
        raise ValueError('目标标签缺失')
    result = ('true' if bool(value) else 'false') if boolean_target else str(value)
    if not result or result.strip() != result:
        raise ValueError('目标标签为空或包含不兼容的首尾空白')
    return result


def dataset_version(data):
    # Key order / compact UTF-8 must match the client's JSON.stringify payload.
    payload = {key: data[key] for key in VERSION_FIELDS}
    return sha256(json.dumps(payload, ensure_ascii=False, separators=(',', ':'),
                             allow_nan=False).encode('utf-8'))


def restore(archive):
    input_paths = sorted(path for path in DATA.glob('*.json') if path.stem.isdigit())
    protected_paths = input_paths + [DATA / f'{path.stem}-source.json' for path in input_paths]
    original_hashes = {str(path.relative_to(ROOT)): sha256(path.read_bytes())
                       for path in protected_paths}
    specs, audits = {}, []
    with zipfile.ZipFile(archive) as zipped:
        manifest = json.loads(zipped.read('TabArena-v0.1/manifest.json'))
        entries = {item['dataset_id']: item for item in manifest}
        require(len(entries) == len(manifest), 'manifest', '数据集 ID 重复')
        for path in input_paths:
            data = json.loads(path.read_text(encoding='utf-8'))
            dataset_id = path.stem
            require(data['id'] == dataset_id, dataset_id, '文件名与数据集 ID 不匹配')
            require(dataset_id in entries, dataset_id, 'manifest 不包含此数据集')
            item = entries[dataset_id]
            require(data['sourceFile'] == item['file'], dataset_id, 'sourceFile 与 manifest 不一致')
            require(data['target'] == item['target'], dataset_id, 'target 与 manifest 不一致')
            raw = zipped.read('TabArena-v0.1/' + data['sourceFile'])
            require(sha256(raw) == data['sourceSha256'], dataset_id, '原始 Parquet SHA256 不匹配')
            table = pq.read_table(io.BytesIO(raw))
            frame = table.to_pandas()
            headers, rows, target = data['headers'], data['rows'], data['target']
            support, query, records = data['supportIndices'], data['queryIndices'], data['sourceRecords']
            require(len(frame) == data['originalRowCount'], dataset_id, '原始行数不一致')
            if 'originalFeatureCount' in data:
                require(len(frame.columns) - 1 == data['originalFeatureCount'], dataset_id, '原始特征数不一致')
            require(target in headers and len(set(headers)) == len(headers), dataset_id, '目标列缺失或表头重复')
            require(all(header in frame for header in headers), dataset_id, '原始 Parquet 缺少输入字段')
            features = [header for header in headers if header != target]
            numeric_features = [column for column in frame if column != target
                                and is_numeric_dtype(frame[column]) and not is_bool_dtype(frame[column])]
            require(features == numeric_features, dataset_id, '特征投影与已有全部数值字段规则不一致')
            omitted = [column for column in frame if column != target and column not in features]
            # The two earliest examples predate projection metadata and contain all
            # original features. Missing metadata must never conceal a projection.
            require(omitted == data.get('omittedFeatures', []), dataset_id, '省略字段记录不一致')
            require(20 <= len(rows) <= 10000 and 1 <= len(features) <= 30, dataset_id, '行数或特征数不符合当前接口')
            require(len(records) == len(rows) and len(set(records)) == len(records), dataset_id, '原始记录映射缺失或重复')
            require(all(type(record) is int and 1 <= record <= len(frame) for record in records), dataset_id, '原始一基位置越界')
            require(all(type(index) is int for index in support + query), dataset_id, '分割索引必须为整数')
            require(len(set(support)) == len(support) and len(set(query)) == len(query), dataset_id, '分割索引重复')
            require(not set(support) & set(query), dataset_id, '上下文与待预测集重叠')
            require(sorted(support + query) == list(range(len(rows))), dataset_id, '分割未完整覆盖示例')
            require(len(support) >= 10 and 1 <= len(query) <= 50, dataset_id, '上下文或待预测数不符合当前接口')
            boolean_target = is_bool_dtype(frame[target])
            label_index = headers.index(target)
            restored_labels = {}
            for index, (record, cells) in enumerate(zip(records, rows)):
                require(len(cells) == len(headers), dataset_id, f'示例第 {index} 行列数不一致')
                require(all(isinstance(cell, str) for cell in cells), dataset_id, f'示例第 {index} 行不是字符串单元格')
                original = frame.iloc[record - 1]
                for column_index, header in enumerate(headers):
                    if header == target:
                        continue
                    try:
                        observed = float(cells[column_index])
                        expected = float(original[header])
                    except (TypeError, ValueError) as error:
                        raise ValueError(f'{dataset_id}: 原始记录 {record} 字段 {header} 不是有效数值') from error
                    require(math.isfinite(observed) and math.isfinite(expected) and observed == expected,
                            dataset_id, f'原始记录 {record} 字段 {header} 与现有示例不一致')
                restored = serialize_label(original[target], boolean_target)
                restored_labels[index] = restored
                require(cells[label_index] == (restored if index in support else ''), dataset_id,
                        f'原始记录 {record} 的上下文标签或 query 空标签不一致')
            support_counts = Counter(restored_labels[index] for index in support)
            query_counts = Counter(restored_labels[index] for index in query)
            require(2 <= len(support_counts) <= 10, dataset_id, '上下文类别数量不兼容')
            require(set(query_counts).issubset(support_counts), dataset_id, '留出标签含上下文中未知类别')
            specs[dataset_id] = {
                'datasetId': dataset_id,
                'datasetVersion': dataset_version(data),
                'targetColumn': target,
                'queryLabels': [{'index': index, 'sourceRecord': records[index], 'label': restored_labels[index]}
                                for index in query],
            }
            metadata = json.loads((DATA / f'{dataset_id}-source.json').read_text(encoding='utf-8'))
            require(metadata['default_target_attribute'] == target, dataset_id, '来源元数据目标列不一致')
            audits.append({
                'datasetId': dataset_id, 'name': item['name'], 'sourceFile': data['sourceFile'],
                'sourceSha256': data['sourceSha256'], 'datasetVersion': specs[dataset_id]['datasetVersion'],
                'sourceUrl': item['url'], 'license': metadata.get('licence'),
                'originalRowCount': len(frame), 'rowCount': len(rows), 'featureCount': len(features),
                'targetColumn': target, 'supportCount': len(support), 'queryCount': len(query),
                'contextClassDistribution': dict(sorted(support_counts.items())),
                'evaluationClassDistribution': dict(sorted(query_counts.items())),
                'columns': [{'name': column, 'type': str(table.schema.field(column).type),
                             'missingInSource': int(frame[column].isna().sum())} for column in headers],
                'omittedFeatures': omitted,
                'selectedFeatureValuesChecked': len(rows) * len(features),
                'contextLabelsChecked': len(support), 'queryLabelsRestored': len(query),
                'sourceRecordsSemantics': 'one-based original Parquet row position (iloc[sourceRecord - 1])',
                'selectionUnchanged': data['selection'], 'status': 'verified',
            })
    after_hashes = {str(path.relative_to(ROOT)): sha256(path.read_bytes()) for path in protected_paths}
    require(original_hashes == after_hashes, 'inputs', '现有示例或来源元数据发生变化')
    return specs, {
        'archive': str(archive.resolve()), 'archiveSha256': sha256(archive.read_bytes()),
        'registeredExampleCount': len(input_paths), 'sourceParquetCount': len(manifest),
        'totalQueryLabelsRestored': sum(len(spec['queryLabels']) for spec in specs.values()),
        'originalFilesBeforeSha256': original_hashes, 'originalFilesAfterSha256': after_hashes,
        'originalFilesUnchanged': original_hashes == after_hashes, 'datasets': audits,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('archive', type=Path)
    parser.add_argument('--check', action='store_true', help='仅验证原数据与已生成评估元数据，不写文件')
    parser.add_argument('--audit-output', type=Path, default=ROOT / 'artifacts' / 'evaluation-data-audit.json')
    args = parser.parse_args()
    specs, audit = restore(args.archive)
    content = json.dumps(specs, ensure_ascii=False, indent=2, allow_nan=False) + '\n'
    if args.check:
        require(OUTPUT.is_file(), 'evaluation', '评估元数据文件不存在')
        require(OUTPUT.read_bytes() == content.encode('utf-8'), 'evaluation', '评估元数据与原数据恢复结果不一致')
    else:
        # Write only after all datasets pass; a partial run must never publish answers.
        OUTPUT.write_bytes(content.encode('utf-8'))
        args.audit_output.parent.mkdir(parents=True, exist_ok=True)
        args.audit_output.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    for dataset in audit['datasets']:
        print(f"{dataset['datasetId']}: {dataset['rowCount']} rows / {dataset['featureCount']} features / "
              f"{dataset['supportCount']} context / {dataset['queryCount']} evaluation; verified")
    print(f"{'CHECK' if args.check else 'GENERATED'}: {len(specs)} examples; "
          f"{audit['totalQueryLabelsRestored']} labels; input files unchanged")


if __name__ == '__main__':
    try:
        main()
    except (ValueError, KeyError, OSError, zipfile.BadZipFile) as error:
        print(f'恢复失败：{error}', file=sys.stderr)
        sys.exit(1)
