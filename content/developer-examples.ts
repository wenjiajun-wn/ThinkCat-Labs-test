import donationPayload from '../public/api-examples/donation-request.json';

export {donationPayload};
export const predictionPath = '/api/predict';

export function clientExpression(origin: string) {
  return origin === 'https://thinkcatlabs.ai' ? 'Client()' : `Client(base_url="${origin}")`;
}

export function sdkExample(origin: string) {
  return `from thinkcat import Client, load_example

labeled, query, target = load_example()
client = ${clientExpression(origin)}
result = client.predict(labeled, query, target)
print(result["model"], result["predictions"])`;
}

export function predictionExamples(origin: string) {
  return [
    {label: 'Python SDK', code: sdkExample(origin)},
    {label: 'JavaScript', code: `const base = "${origin}";
const sample = await fetch(base + "/api-examples/donation-request.json");
if (!sample.ok) throw new Error(\`Sample: HTTP \${sample.status}\`);

const response = await fetch(base + "${predictionPath}", {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: await sample.text(), signal: AbortSignal.timeout(125_000)
});
if (!response.ok) throw new Error(\`HTTP \${response.status}: \${await response.text()}\`);
const { model, predictions } = await response.json();
console.log(model, predictions);`},
    {label: 'cURL', code: `base="${origin}"
sample=$(curl -fsSL --max-time 30 "$base/api-examples/donation-request.json") &&
  curl -sSL --fail-with-body --max-time 125 "$base${predictionPath}" \\
    -H 'Content-Type: application/json' \\
    --data-binary "$sample"`},
  ];
}
