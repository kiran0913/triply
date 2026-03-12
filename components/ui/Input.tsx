"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`input-base ${error ? "input-error" : ""} ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
