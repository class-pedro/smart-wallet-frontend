import { ChangeEventHandler } from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export type CommonProps = {
  id: string;
  label?: string;
  error?: string;
  className?: string;
  as?: 'input' | 'select';
  onChange?:
    | (ChangeEventHandler<HTMLInputElement> | undefined)
    | (ChangeEventHandler<HTMLSelectElement> | undefined);
};
