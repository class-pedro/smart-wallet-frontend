import { ChangeEventHandler, HTMLInputTypeAttribute, useState } from 'react';
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { IconType } from 'react-icons';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface IconOptions {
  icon: IconType;
  size?: number;
}

interface InputProps<FormType extends FieldValues> {
  label: string;
  labelFor: string;
  inputName: Path<FormType>;
  inputId: string;
  inputType: HTMLInputTypeAttribute;
  inputPlaceholder?: string;
  errors: FieldError | undefined;
  errorMessage?: string;
  value?: string;
  autoComplete?: 'on' | 'off';
  maxLength?: number;
  IconOptions?: IconOptions;
  register: UseFormRegister<FormType>;
  onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function Input<FormType extends FieldValues>({
  label,
  labelFor,
  inputName,
  inputId,
  inputType = 'text',
  inputPlaceholder = '',
  errors,
  errorMessage,
  value,
  autoComplete,
  maxLength,
  IconOptions,
  register,
  onChange,
}: InputProps<FormType>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const isPasswordInput = inputType === 'password';

  const validatedInputType =
    isPasswordInput && showPassword ? 'text' : inputType;

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (onChange) onChange(e);
    register(inputName).onChange(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <fieldset className='w-full flex flex-col'>
      <label className='text-sm font-semibold' htmlFor={labelFor}>
        {label}
      </label>
      <div
        className={`w-full flex items-center px-4 py-2 gap-4 rounded-md border border-gray-300 ${
          !errors && 'focus:border-swBlue500'
        } ${errors && 'border-red-500 focus:border-red-500'}`}
      >
        {IconOptions?.icon && (
          <IconOptions.icon
            className={`${
              errors ? 'text-red-400 animate-pulse' : 'text-gray-400'
            }`}
            size={IconOptions.size ?? 24}
          />
        )}
        <input
          id={inputId}
          type={validatedInputType}
          value={value}
          maxLength={maxLength}
          autoComplete={autoComplete ?? 'new-password'}
          className={
            'w-full text-gray-700 outline-none placeholder:text-gray-400'
          }
          placeholder={inputPlaceholder}
          {...register(inputName)}
          onChange={handleChange}
        />
        {isPasswordInput && (
          <span onClick={togglePasswordVisibility}>
            {showPassword ? (
              <FaEyeSlash
                className={`${
                  errors ? 'text-red-400 animate-pulse' : 'text-gray-400'
                }`}
              />
            ) : (
              <FaEye
                className={`${
                  errors ? 'text-red-400 animate-pulse' : 'text-gray-400'
                }`}
              />
            )}
          </span>
        )}
      </div>
      {errors && (
        <span className='text-red-500 text-sm animate-pulse'>
          {errorMessage}
        </span>
      )}
    </fieldset>
  );
}
