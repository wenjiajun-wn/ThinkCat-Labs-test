import type {ButtonHTMLAttributes, HTMLAttributes, SelectHTMLAttributes} from 'react';

export function Button({className = '', type = 'button', ...props}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`ui-button ${className}`} {...props} />;
}
export function Badge({className = '', ...props}: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`ui-badge ${className}`} {...props} />;
}
export function CodeSurface({className = '', ...props}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`ui-code-surface ${className}`} {...props} />;
}
export function FormControl({className = '', ...props}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`ui-form-control ${className}`} {...props} />;
}
