# 快速开始（调用方式示意）

> 自有模型服务尚未上线。本文地址及模型名称为占位示意，不是现有在线体验的调用协议；正式版本以上线公告为准。

以下代码仅供阅读和接入准备，暂不能直接调用自有模型服务。教学 request.json 包含完整输入；示例使用 cURL、Python 3 或 Node.js 22。上线后再替换占位地址并按正式协议接入。

Bash：export THINKCAT_API_ORIGIN="https://your-confirmed-host.example"；PowerShell：$env:THINKCAT_API_ORIGIN="https://your-confirmed-host.example"。请替换示意地址；Windows 下用 curl.exe。JavaScript 保存为 predict.mjs 后运行 node predict.mjs；Python 保存为 predict.py 后运行 python3 predict.py。

本地预览只展示文档，不提供本页占位接口。现有在线体验的内部调用不因本文案调整而改变。

将 [request.json](examples/request.json) 放在当前工作目录。

## curl

```curl
export THINKCAT_API_ORIGIN="https://your-confirmed-host.example"
curl --fail-with-body --show-error --silent \
  --max-time 120 \
  -X POST "${THINKCAT_API_ORIGIN%/}/api/model/predict" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  --data-binary @request.json
```

## javascript

```javascript
// Node.js 22+. Save request.json in the working directory.
import {readFile} from 'node:fs/promises';
const origin = process.env.THINKCAT_API_ORIGIN;
if (!origin) throw new Error('Set THINKCAT_API_ORIGIN first');
const payload = JSON.parse(await readFile('request.json', 'utf8'));
const response = await fetch(new URL('/api/model/predict', origin), {
  method: 'POST',
  headers: {'Content-Type': 'application/json', Accept: 'application/json'},
  body: JSON.stringify(payload),
  signal: AbortSignal.timeout(120_000),
  redirect: 'error',
});
const text = await response.text();
if (!response.ok) throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
const result = JSON.parse(text);
console.log(result);
result.row_indices.forEach((rowIndex, i) => {
  console.log(rowIndex, result.predictions[i], result.probabilities[i]);
});
```

## python

```python
# Python 3 standard library. Save request.json in the working directory.
import json
import os
from pathlib import Path
from urllib.request import Request, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None

origin = os.environ["THINKCAT_API_ORIGIN"].rstrip("/")
payload = json.loads(Path("request.json").read_text(encoding="utf-8"))
request = Request(origin + "/api/model/predict",
    data=json.dumps(payload).encode("utf-8"), method="POST",
    headers={"Content-Type": "application/json", "Accept": "application/json"})
try:
    with build_opener(NoRedirect).open(request, timeout=120) as response:
        result = json.load(response)
except HTTPError as error:
    print("HTTP", error.code, error.read(500).decode("utf-8", errors="replace"))
    raise
print(result)
for i, row_index in enumerate(result["row_indices"]):
    print(row_index, result["predictions"][i], result["probabilities"][i])
```

## CSV

下载同一份教学 CSV，在在线体验上传。保留原始列名，最后两行目标单元格留空。网页将数值特征转为 JSON 数字，将空目标转为 null；此调用流程不使用 multipart/form-data。

[input.csv](examples/input.csv)
