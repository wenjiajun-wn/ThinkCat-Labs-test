'use client';

import {useEffect, useId, useRef, useState, useSyncExternalStore} from 'react';
import type {Locale} from '../../config/i18n';
import {copyText} from '../../lib/copy-text';
import {homeCopy} from '../../content/home';
import {donationPayload, predictionExamples, predictionPath} from '../../content/developer-examples';
import styles from './developer.module.css';

function Highlight({value}: {value: string}) {
  const tokens = value.split(/("(?:\\.|[^"\\])*"|#[^\n]*|\/\/[^\n]*|\b(?:import|const|await|if|throw|new|None|null|\d+(?:\.\d+)?)\b)/g);
  return <code>{tokens.map((token, i) => {
    if (i % 2 === 0) return token;
    const color = token.startsWith('"') ? 'string' : /^(#|\/\/)/.test(token) ? 'comment'
      : /^(None|null|\d)/.test(token) ? 'literal' : 'keyword';
    return <span key={i} className={styles[color]}>{token}</span>;
  })}</code>;
}

type Output = {body: string; ms: number; status: string; ok: boolean};
const subscribeOrigin = () => () => {};
const previewOrigin = () => window.location.origin;
const productionOrigin = () => 'https://thinkcatlabs.ai';
export function DeveloperCard({locale}: {locale: Locale}) {
  const t = homeCopy[locale].developer;
  const responseId = useId();
  const origin = useSyncExternalStore(subscribeOrigin, previewOrigin, productionOrigin);
  const tabs = predictionExamples(origin);
  const [active, setActive] = useState(0);
  const selected = tabs[active].label;
  const runHint = selected === 'cURL' ? t.curl : '';
  const [copyState, setCopyState] = useState<'copy' | 'copied' | 'failed'>('copy');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<Output | null>(null);
  const [view, setView] = useState<'request' | 'result'>('request');
  const visibleText = view === 'request' ? tabs[active].code : output?.body;
  const request = useRef<AbortController | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => {request.current?.abort(); request.current = null; clearTimeout(copyTimer.current);}, []);

  async function copy() {
    try {
      if (!visibleText) return;
      await copyText(visibleText);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopyState('copy'), 2000);
  }

  async function run() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setRunning(true);
    setOutput(null);
    setCopyState('copy');
    setView('result');
    const start = performance.now();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    let status = '';
    let body: string;
    let ok = false;
    try {
      const res = await fetch(predictionPath, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(donationPayload),
        signal: controller.signal,
      });
      status = [res.status, res.statusText].filter(Boolean).join(' ');
      const raw = await res.text();
      body = raw || status;
      let data;
      try {
        data = JSON.parse(raw);
        body = JSON.stringify(data, null, 2);
      } catch { /* Preserve non-JSON gateway responses as plain text. */ }
      if (res.ok) {
        const index = donationPayload.rows.findIndex(row => row.returned === null);
        const scores = data?.probabilities?.[0];
        ok = data?.row_indices?.length === 1 && data.row_indices[0] === index &&
          data?.predictions?.length === 1 && ['Yes', 'No'].includes(data.predictions[0]) &&
          !!scores && [scores.Yes, scores.No].every(p => Number.isFinite(p) && p >= 0 && p <= 1);
        if (!ok) status += ' · ' + t.invalid;
      } else if (res.status === 502 || res.status === 503) {
        status += ' · ' + t.unavailable;
      }
    } catch (error) {
      body = controller.signal.aborted ? t.timeout : error instanceof Error ? error.message : t.error;
    } finally {
      clearTimeout(timeout);
    }
    if (request.current !== controller) return;
    setOutput({body, status: status || t.error, ok, ms: performance.now() - start});
    setView('result');
    setCopyState('copy');
    setRunning(false);
    request.current = null;
  }

  return <div className={styles.card}>
    <header className={styles.bar}>
      <div className={styles.views} role="group" aria-label={t.request + ' / ' + t.result}>
        {(['request', 'result'] as const).map(key => <button key={key} type="button"
          aria-controls={responseId} aria-pressed={key === view}
          onClick={() => {setView(key); setCopyState('copy');}}>{t[key]}</button>)}
      </div>
      <code className={styles.endpoint}>POST {predictionPath}</code>
    </header>
    <div className={styles.tools}>
      {view === 'request' ? <div className={styles.languages} role="group" aria-label={t.language}>
        {tabs.map((tab, i) => <button type="button" key={tab.label} aria-pressed={active === i}
          onClick={() => {setActive(i); setCopyState('copy');}}>{tab.label}</button>)}
      </div> : <span>{t.result}</span>}
      <button type="button" disabled={!visibleText} onClick={copy} aria-live="polite">{t[copyState]}</button>
    </div>
    <pre id={responseId} tabIndex={0} aria-label={view === 'request' ? tabs[active].label : t.result}>
      {view === 'request' ? <Highlight value={tabs[active].code} /> : (visibleText ?? (running ? t.running : t.idle))}
    </pre>
    <footer className={styles.actions}>
      <span role="status">{view === 'request' ? runHint : running ? t.running : output ? output.status + ' · ' + Math.round(output.ms) + ' ms' : ''}</span>
      <button type="button" className={styles.run} disabled={running} aria-busy={running} onClick={run}>
        {running ? t.running : output ? t.retry : t.run}
      </button>
    </footer>
  </div>;
}
