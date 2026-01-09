import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
    return (
      <div className={twMerge("flex flex-col gap-1.5", containerClassName)}>
        {label && (
          <label className="text-text-main text-sm font-medium leading-normal">
            {label}
          </label>
        )}
        
        <div className={clsx(
          "flex items-center rounded-lg border bg-white overflow-hidden transition-all h-12",
          "focus-within:ring-1 focus-within:ring-primary",
          error 
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-200" 
            : "border-border-light focus-within:border-primary"
        )}>
          {leftIcon && (
            <div className="pl-4 text-text-secondary flex items-center justify-center">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={twMerge(
              "flex-1 w-full h-full bg-transparent border-none text-text-main placeholder-text-secondary px-3 focus:outline-none focus:ring-0 text-base",
              className
            )}
            {...props}
          />
          
          {rightIcon && (
            <div className="pr-4 text-text-secondary flex items-center justify-right">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
