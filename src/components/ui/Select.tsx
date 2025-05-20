import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helperText,
      fullWidth = false,
      className = '',
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    
    const baseSelectClass = `
      block rounded-md shadow-sm border-gray-300 
      focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50
      disabled:bg-gray-100 disabled:cursor-not-allowed
      transition duration-150 ease-in-out
    `;
    
    const errorSelectClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const widthClass = fullWidth ? 'w-full' : '';
    
    const selectClass = `
      ${baseSelectClass}
      ${errorSelectClass}
      ${widthClass}
      ${className}
    `;
    
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(event.target.value);
      }
    };
    
    return (
      <div className={`${fullWidth ? 'w-full' : ''} mb-4`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <select
          ref={ref}
          id={selectId}
          className={selectClass}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helperText || error ? `${selectId}-description` : undefined}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {(helperText || error) && (
          <p
            id={`${selectId}-description`}
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

Select.displayName = 'Select';

export default Select;