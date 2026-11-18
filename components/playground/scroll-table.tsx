'use client';
import {useRef, type ReactNode} from 'react';

/** Drag cell padding to pan; text spans retain native selection and copying. */
export function ScrollTable({children, label, className = ''}: {children: ReactNode; label: string; className?: string}) {
  const drag = useRef<{id: number; x: number; y: number; left: number; top: number; active: boolean} | null>(null);
  return <div className={`demo-scroll scroll-table ${className}`} tabIndex={0} role="region" aria-label={label}
    onPointerDown={event => {
      if (event.pointerType !== 'mouse' || event.button !== 0 || event.shiftKey || event.ctrlKey || event.metaKey) return;
      if ((event.target as Element).closest('button, a, input, select, textarea, [data-selectable]')) return;
      const el = event.currentTarget;
      if (el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight) return;
      drag.current = {id: event.pointerId, x: event.clientX, y: event.clientY, left: el.scrollLeft, top: el.scrollTop, active: false};
    }}
    onPointerMove={event => {
      const d = drag.current;
      if (!d || d.id !== event.pointerId) return;
      const dx = event.clientX - d.x, dy = event.clientY - d.y;
      if (!d.active && Math.hypot(dx, dy) < 6) return;
      const el = event.currentTarget;
      if (!d.active) { d.active = true; el.setPointerCapture(d.id); el.dataset.dragging = 'true'; }
      event.preventDefault();
      el.scrollLeft = d.left - dx;
      el.scrollTop = d.top - dy;
    }}
    onPointerUp={event => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      delete event.currentTarget.dataset.dragging;
      drag.current = null;
    }}
    onPointerCancel={event => { delete event.currentTarget.dataset.dragging; drag.current = null; }}
    onLostPointerCapture={event => { delete event.currentTarget.dataset.dragging; drag.current = null; }}
    onPointerLeave={() => { if (!drag.current?.active) drag.current = null; }}
  >{children}</div>;
}
