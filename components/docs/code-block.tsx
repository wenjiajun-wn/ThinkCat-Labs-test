'use client';
import {useEffect, useRef, useState, type ReactNode} from 'react';

type Props = {
  code: string;
  language: string;
  label: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
};

const jsonPattern = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g;
const keywordPattern = /\b(const|let|await|async|function|return|import|from|export|if|else|for|of|in|new|true|false|null|None|True|False|def|with|as|try|except|raise|os|requests)\b/g;

function tokenize(code: string, language: string): ReactNode[] {
  if (language === 'JSON') {
    const nodes: ReactNode[] = [];
    let last = 0;
    for (const match of code.matchAll(jsonPattern)) {
      const index = match.index ?? 0;
      if (index > last) nodes.push(code.slice(last, index));
      const isKey = Boolean(match[2]);
      nodes.push(<span key={`${index}-token`} className={isKey ? 'tok-key' : match[3] ? 'tok-bool' : 'tok-string'}>{match[1] ?? match[0]}</span>);
      if (isKey) nodes.push(<span key={`${index}-colon`} className="tok-punct">{match[2]}</span>);
      last = index + match[0].length;
    }
    if (last < code.length) nodes.push(code.slice(last));
    return nodes;
  }
  if (language === 'cURL') {
    return code.split(/(\s--?[\w-]+|\s-H|\s-d|"[^"]*"|'[^']*'|#.*$)/gm).filter(Boolean).map((part, index) => {
      if (/^'|^"/.test(part)) return <span key={index} className="tok-string">{part}</span>;
      if (/^\s--?/.test(part) || /^\s-[Hd]$/.test(part)) return <span key={index} className="tok-key">{part}</span>;
      if (/^#/.test(part)) return <span key={index} className="tok-comment">{part}</span>;
      return part;
    });
  }
  const nodes: ReactNode[] = [];
  let cursor = 0;
  for (const match of code.matchAll(keywordPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(code.slice(cursor, index));
    nodes.push(<span key={`${index}-kw`} className="tok-key">{match[0]}</span>);
    cursor = index + match[0].length;
  }
  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

export function CodeBlock({code, language, label, copyLabel, copiedLabel, failedLabel}: Props) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(reset.current), []);

  async function copy() {
    clearTimeout(reset.current);
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const focused = document.activeElement;
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.className = 'visually-hidden';
      textarea.readOnly = true;
      document.body.appendChild(textarea);
      try {
        textarea.select();
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
      } catch {
        setStatus('failed');
        return;
      } finally {
        textarea.remove();
        if (focused instanceof HTMLElement) focused.focus({preventScroll: true});
      }
    }
    setStatus('copied');
    reset.current = setTimeout(() => setStatus('idle'), 2000);
  }

  return <figure className="code-block">
    <figcaption>
      <span className="code-label"><span className="code-language">{language}</span>{label}</span>
      <button type="button" onClick={copy}>{status === 'copied' ? copiedLabel : copyLabel}<span aria-hidden="true">{status === 'copied' ? '✓' : '⧉'}</span></button>
    </figcaption>
    <pre tabIndex={0} aria-label={`${label} · ${language}`}><code>{tokenize(code, language)}</code></pre>
    {status === 'failed' && <p className="code-feedback" role="alert">{failedLabel}</p>}
    <span className="visually-hidden" role="status">{status === 'copied' ? copiedLabel : ''}</span>
  </figure>;
}
