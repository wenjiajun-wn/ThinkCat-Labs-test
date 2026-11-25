// Placeholder endpoint example; model service is not live yet.
import {readFile} from 'node:fs/promises';

const timeoutMs = 120_000;

function apiOrigin() {
  const value = process.env.THINKCAT_API_ORIGIN?.trim() || 'https://thinkcatlabs.ai';
  if (!value) throw new Error('请先将 THINKCAT_API_ORIGIN 设置为已确认可访问的站点 origin。');
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('THINKCAT_API_ORIGIN 只能包含协议、主机和可选端口，不能带页面路径或凭据。');
  }
  return url.origin;
}

function printPredictions(body, payload) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('响应 JSON 应为对象。');
  }
  const {row_indices: indices, predictions, probabilities} = body;
  if (![indices, predictions, probabilities].every(Array.isArray)) {
    throw new Error('响应缺少 row_indices、predictions 或 probabilities 数组。');
  }
  const expected = new Set(payload.rows.flatMap((row, index) =>
    row[payload.target_column] === null ? [index] : []));
  if (indices.length !== predictions.length || indices.length !== probabilities.length ||
      indices.length !== expected.size) {
    throw new Error('响应数组长度与请求中的待预测行数不一致。');
  }
  const lines = indices.map((index, position) => {
    const label = predictions[position];
    const scores = probabilities[position];
    if (!Number.isInteger(index) || !expected.delete(index)) {
      throw new Error('row_indices 包含重复或非待预测行的下标。');
    }
    if (typeof label !== 'string' || !scores || typeof scores !== 'object' ||
        Array.isArray(scores) || !Object.hasOwn(scores, label)) {
      throw new Error('预测类别与对应的概率对象不匹配。');
    }
    return `rows[${index}]: prediction=${JSON.stringify(label)}, probabilities=${JSON.stringify(scores)}`;
  });
  console.log('\n按原请求行下标读取结果（从 0 开始）：');
  console.log(lines.join('\n'));
}

async function main() {
  const origin = apiOrigin();
  const payload = JSON.parse(await readFile(new URL('./request.json', import.meta.url), 'utf8'));
  // 等待时限覆盖本次 fetch 及响应体读取，不代表服务端的执行时限。
  const signal = AbortSignal.timeout(timeoutMs);
  let response;
  let raw;
  try {
    response = await fetch(`${origin}/api/predict`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(payload),
      redirect: 'error',
      signal,
    });
    raw = await response.text();
  } catch (error) {
    if (signal.aborted) throw new Error('请求等待超过 120 秒，已停止本次客户端等待。', {cause: error});
    throw error;
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}\n${raw || '(响应体为空)'}`);
  }
  let body;
  try {
    body = JSON.parse(raw);
  } catch (error) {
    throw new Error(`响应不是有效 JSON：\n${raw}`, {cause: error});
  }
  console.log('响应 JSON：');
  console.log(raw);
  printPredictions(body, payload);
}

main().catch(error => {
  console.error(`调用失败：${error.message}`);
  if (error.cause?.code) console.error(`连接错误代码：${error.cause.code}`);
  process.exitCode = 1;
});
