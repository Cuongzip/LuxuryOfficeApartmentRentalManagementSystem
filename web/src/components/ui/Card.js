import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  actions,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="border-b border-slate-100 dark:border-slate-800/80 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
