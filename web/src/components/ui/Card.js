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
      className={`rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className="border-b border-neutral-100 p-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-neutral-900 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">
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
