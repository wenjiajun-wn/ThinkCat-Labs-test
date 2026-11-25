# 占位接口调用示意，模型服务尚未上线。
#!/usr/bin/env python3
"""从同目录 request.json 读取数据，调用当前 模型 推理接口。"""

import json
import os
from pathlib import Path
import sys
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener


TIMEOUT_SECONDS = 120


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def api_origin():
    value = os.environ.get("THINKCAT_API_ORIGIN", "https://thinkcatlabs.ai").strip()
    if not value:
        raise ValueError("请先将 THINKCAT_API_ORIGIN 设置为已确认可访问的站点 origin。")
    parts = urlsplit(value)
    if (
        parts.scheme not in ("http", "https")
        or not parts.hostname
        or parts.username is not None
        or parts.password is not None
        or parts.path not in ("", "/")
        or parts.query
        or parts.fragment
    ):
        raise ValueError("THINKCAT_API_ORIGIN 只能包含协议、主机和可选端口，不能带页面路径或凭据。")
    return value.rstrip("/")


def print_predictions(body, payload):
    if not isinstance(body, dict):
        raise ValueError("响应 JSON 应为对象。")
    indices = body.get("row_indices")
    predictions = body.get("predictions")
    probabilities = body.get("probabilities")
    if not all(isinstance(value, list) for value in (indices, predictions, probabilities)):
        raise ValueError("响应缺少 row_indices、predictions 或 probabilities 数组。")
    expected = {
        index for index, row in enumerate(payload["rows"])
        if row[payload["target_column"]] is None
    }
    if not (len(indices) == len(predictions) == len(probabilities) == len(expected)):
        raise ValueError("响应数组长度与请求中的待预测行数不一致。")

    lines = []
    for position, index in enumerate(indices):
        label, scores = predictions[position], probabilities[position]
        if type(index) is not int or index not in expected:
            raise ValueError("row_indices 包含重复或非待预测行的下标。")
        if not isinstance(label, str) or not isinstance(scores, dict) or label not in scores:
            raise ValueError("预测类别与对应的概率对象不匹配。")
        expected.remove(index)
        lines.append(
            f"rows[{index}]: prediction={json.dumps(label, ensure_ascii=False)}, "
            f"probabilities={json.dumps(scores, ensure_ascii=False)}"
        )
    print("\n按原请求行下标读取结果（从 0 开始）：")
    print("\n".join(lines))


def main():
    try:
        origin = api_origin()
        payload_path = Path(__file__).resolve().with_name("request.json")
        payload = json.loads(payload_path.read_text(encoding="utf-8"))
        request = Request(
            origin + "/api/predict",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        # urllib 的 timeout 是底层 socket 操作超时，不是完整请求的总时限。
        with build_opener(NoRedirect).open(request, timeout=TIMEOUT_SECONDS) as response:
            raw = response.read().decode("utf-8")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError as error:
            raise ValueError("响应不是有效 JSON：\n" + raw) from error

        print("响应 JSON：")
        print(raw)
        print_predictions(body, payload)
        return 0
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        print(f"HTTP {error.code}：{error.reason}\n{detail or '(响应体为空)'}", file=sys.stderr)
    except URLError as error:
        print(f"连接失败或超时：{error.reason}", file=sys.stderr)
    except TimeoutError:
        print(f"socket 操作等待超过 {TIMEOUT_SECONDS} 秒，已停止本次客户端等待。", file=sys.stderr)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"调用失败：{error}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
