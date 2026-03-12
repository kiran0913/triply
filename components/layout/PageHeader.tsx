"use client";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/** Standard page header with title, optional description, and optional actions */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-slate-600 mt-1 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
