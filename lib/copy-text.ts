export async function copyText(code: string) {
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
    } finally {
      textarea.remove();
      if (focused instanceof HTMLElement) focused.focus({preventScroll: true});
    }
  }
}
