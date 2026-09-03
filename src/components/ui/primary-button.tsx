import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: string;
  children: ReactNode;
};

export function PrimaryButton({
  icon,
  children,
  className = '',
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn-primary self-start text-body-lg font-medium ${className}`}
      {...props}
    >
      {icon && (
        <span className='material-symbols-outlined text-[18px]'>{icon}</span>
      )}
      {children}
    </button>
  );
}
