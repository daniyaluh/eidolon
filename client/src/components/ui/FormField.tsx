import type { InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...inputProps }: FormFieldProps) {
  const fieldId = id ?? inputProps.name;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      <input
        id={fieldId}
        {...inputProps}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-white focus:outline-none"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
