"use client";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/** Standard page wrapper: max-w-7xl mx-auto, space-y-8 between sections. Padding from parent layout. */
export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto flex flex-col space-y-8 min-w-0 ${className}`}>
      {children}
    </div>
  );
}
