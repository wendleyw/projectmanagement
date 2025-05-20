import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      startIcon,
      endIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    
    const baseInputClass = `
      block rounded-md shadow-sm border-gray-300 
      focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50
      disabled:bg-gray-100 disabled:cursor-not-allowed
      transition duration-150 ease-in-out
    `;
    
    const errorInputClass = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : '';
    
    const iconClass = (startIcon || endIcon) ? 'pl-10' : '';
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const inputClass = `
      ${baseInputClass}
      ${errorInputClass}
      ${iconClass}
      ${widthClass}
      ${className}
    `;
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClass}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={helperText || error ? `${inputId}-description` : undefined}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
              {endIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p
            id={`${inputId}-description`}
            className={`mt-1 text-sm ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;