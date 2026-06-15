import type { LabelHTMLAttributes, ReactNode } from "react";

type Props = LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode };

export function Label({ children, ...props }: Props) {
  return (
    <label className="text-sm font-medium text-slate-700" {...props}>
      {children}
    </label>
  );
}
