'use client';

import { OptionItem } from '@/types/option';
import { CommonProps, InputProps, SelectProps } from './types';
import { ChangeEventHandler } from 'react';

type InputBoxProps = CommonProps &
  (InputProps | SelectProps) & {
    options?: OptionItem[];
  };

export default function InputBox({
  id,
  label,
  error,
  className = '',
  as = 'input',
  onChange,
  ...props
}: InputBoxProps) {
  return (
    <fieldset className='fieldset'>
      {label && (
        <label htmlFor={id} className='fieldset-legend text-md'>
          {label}
        </label>
      )}
      {as === 'input' ? (
        <input
          {...(props as InputProps)}
          id={id}
          className={`input w-full outline-0 ${className}`}
          onChange={
            onChange as ChangeEventHandler<HTMLInputElement> | undefined
          }
        />
      ) : (
        <select
          {...(props as SelectProps)}
          id={id}
          className={`select w-full outline-0 ${className}`}
          onChange={
            onChange as ChangeEventHandler<HTMLSelectElement> | undefined
          }
        >
          {props.options?.map(({ value, disabled, label }) => (
            <option key={value} disabled={disabled}>
              {label}
            </option>
          ))}
        </select>
      )}
      {error && (
        <span className='text-red-400 text-sm animate-pulse'>{error}</span>
      )}
    </fieldset>
  );
}
