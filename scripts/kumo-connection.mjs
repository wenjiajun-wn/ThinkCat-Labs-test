// Server-only connection settings. Never import this module into client code.
export function kumoEndpoint(value, previewOrigin) {
  if (!value?.trim()) throw new Error('KUMO_INFERENCE_URL is required when --kumo is enabled.');
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error('KUMO_INFERENCE_URL must be an absolute HTTP(S) prediction URL.');
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) {
    throw new Error('KUMO_INFERENCE_URL must use HTTP(S), without credentials or fragments.');
  }
  const localHosts = ['localhost', '127.0.0.1', '[::1]'];
  const preview = new URL(previewOrigin);
  if (localHosts.includes(url.hostname) && url.port === preview.port && url.protocol === preview.protocol) {
    throw new Error('KUMO_INFERENCE_URL must not point back to the preview server.');
  }
  return url.href;
}

export function connectionFailure(error, timedOut = false) {
  if (timedOut || error?.name === 'TimeoutError') return {kind: 'timeout', code: 'TIMEOUT'};
  const codes = new Set();
  const seen = new Set();
  function collect(current) {
    if (!current || typeof current !== 'object' || seen.has(current)) return;
    seen.add(current);
    if (typeof current.code === 'string') codes.add(current.code);
    collect(current.cause);
    if (Array.isArray(current.errors)) current.errors.forEach(collect);
  }
  collect(error);
  for (const code of ['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT']) {
    if (codes.has(code)) return {kind: 'timeout', code};
  }
  if (codes.has('ECONNREFUSED')) return {kind: 'connection_refused', code: 'ECONNREFUSED'};
  for (const code of ['ENOTFOUND', 'EAI_AGAIN']) {
    if (codes.has(code)) return {kind: 'dns_error', code};
  }
  for (const code of ['CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'ERR_TLS_CERT_ALTNAME_INVALID', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE']) {
    if (codes.has(code)) return {kind: 'tls_error', code};
  }
  return {kind: 'connection_error', code: 'NETWORK_ERROR'};
}

export function logKumoFailure(details) {
  // Only bounded diagnostic fields. No URL, payload, headers, or raw error message.
  console.error(JSON.stringify({event: 'kumo_proxy_failure', ...details}));
}
