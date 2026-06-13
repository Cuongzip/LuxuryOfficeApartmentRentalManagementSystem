import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  placeholder = '',
  className = '',
  inputClassName = '',
  required = false,
  ...props
}) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-950 dark:focus:ring-blue-200 focus:border-transparent transition-all placeholder-slate-400 dark:placeholder-slate-500 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${inputClassName}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};
