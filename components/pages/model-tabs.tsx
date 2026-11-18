'use client';

import {useSyncExternalStore, type ReactNode, type KeyboardEvent} from 'react';
import {modelIds, type ModelId} from '../../config/models';

type Item = {id: ModelId; index: string; name: string; content: ReactNode};

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener('hashchange', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

function currentModel(): ModelId {
  return modelIds.find(id => window.location.hash === `#${id}`) ?? 'tabular';
}

function selectModel(id: ModelId) {
  if (currentModel() === id) return;
  // Preserve deep links and browser history without scrolling between sections.
  window.history.pushState(window.history.state, '', `#${id}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function ModelTabs({label, items}:{label: string; items: Item[]}) {
  const active = useSyncExternalStore(subscribe, currentModel, () => 'tabular' as ModelId);

  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case 'ArrowRight': next = (index + 1) % items.length; break;
      case 'ArrowLeft': next = (index + items.length - 1) % items.length; break;
      case 'Home': next = 0; break;
      case 'End': next = items.length - 1; break;
      default: return;
    }
    event.preventDefault();
    selectModel(items[next].id);
    document.getElementById(`model-tab-${items[next].id}`)?.focus();
  }

  return <div className="model-browser">
    <div className="study-index" role="tablist" aria-label={label}>
      {items.map((item, index) => <button
        key={item.id}
        id={`model-tab-${item.id}`}
        type="button"
        role="tab"
        aria-selected={active === item.id}
        aria-controls={`model-panel-${item.id}`}
        tabIndex={active === item.id ? 0 : -1}
        onClick={() => selectModel(item.id)}
        onKeyDown={event => handleKey(event, index)}
      >
        <span className="mono-label">{item.index}</span>
        <span>{item.name}</span>
      </button>)}
    </div>
    {items.map(item => <div
      key={item.id}
      id={`model-panel-${item.id}`}
      role="tabpanel"
      aria-labelledby={`model-tab-${item.id}`}
      hidden={active !== item.id}
      tabIndex={0}
    >{item.content}</div>)}
  </div>;
}
