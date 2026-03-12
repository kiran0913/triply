"use client";

import Link from "next/link";

interface ListItemProps {
  avatar?: React.ReactNode;
  main: React.ReactNode;
  secondary?: React.ReactNode;
  action?: React.ReactNode;
  href?: string;
  className?: string;
}

/**
 * Standard list row: avatar/icon, main text, secondary text, optional action.
 * Prevents overflow with truncation.
 */
export function ListItem({ avatar, main, secondary, action, href, className = "" }: ListItemProps) {
  const content = (
    <div className="flex items-center gap-4 min-w-0 py-3">
      {avatar && <div className="shrink-0">{avatar}</div>}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-900 truncate">{main}</div>
        {secondary && (
          <div className="text-sm text-slate-500 truncate mt-0.5">{secondary}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`block hover:bg-gray-50 rounded-lg transition-colors -mx-2 px-2 ${className}`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
