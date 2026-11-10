'use client';
import {useId, useState} from 'react';
import {CodeBlock} from './code-block';

type Tab = {id: string; label: string; language: string; code: string};

type Props = {
  tabs: readonly Tab[];
  label: string;
  copyLabel: string;
  copiedLabel: string;
  failedLabel: string;
};

export function CodeTabs({tabs, label, copyLabel, copiedLabel, failedLabel}: Props) {
  const [active, setActive] = useState(tabs[0].id);
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return <div className="code-tabs">
    <div className="code-tablist" role="tablist" aria-label={label}>
      {tabs.map(tab => <button
        key={tab.id}
        id={`${id}-${tab.id}-tab`}
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        aria-controls={`${id}-${tab.id}-panel`}
        tabIndex={active === tab.id ? 0 : -1}
        onClick={() => setActive(tab.id)}
        onKeyDown={event => {
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          const index = tabs.findIndex(item => item.id === active);
          const offset = event.key === 'ArrowRight' ? 1 : -1;
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
          setActive(tabs[next].id);
          document.getElementById(`${id}-${tabs[next].id}-tab`)?.focus();
        }}
      >{tab.label}</button>)}
    </div>
    {tabs.map(tab => <div key={tab.id} id={`${id}-${tab.id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab.id}-tab`} hidden={active !== tab.id}>
      {active === tab.id && <CodeBlock code={tab.code} language={tab.language} label={label} copyLabel={copyLabel} copiedLabel={copiedLabel} failedLabel={failedLabel} />}
    </div>)}
  </div>;
}
