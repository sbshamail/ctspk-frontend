const LayoutSkeleton = ({
  sidebar,
  header,
  footer,
  main,
}: {
  sidebar?: boolean;
  header?: boolean;
  footer?: boolean;
  main?: boolean;
}) => {
  return (
    <div className="flex flex-col  animate-pulse">
      {/* Header */}
      {header && (
        <header className="h-16 border-b border-border bg-card flex items-center px-4">
          <div className="h-6 w-32 rounded bg-muted" /> {/* Logo */}
          <div className="ml-auto flex space-x-4">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-6 w-6 rounded-full bg-muted" />
          </div>
        </header>
      )}
      <div className="flex flex-1">
        {/* Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex md:flex-col w-64 border-r border-border bg-card p-4 space-y-4">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
            <div className="h-4 w-3/5 rounded bg-muted" />
          </aside>
        )}
        {/* Main Content */}
        {main && (
          <main className="flex-1 p-6 space-y-6">
            {/* Section title */}
            <div className="h-6 w-48 rounded bg-muted" />

            {/* Cards grid */}
            <div className="h-[calc(100vh/2)] w-full rounded bg-muted" />
          </main>
        )}
      </div>
      {/* Footer */}
      {footer && (
        <footer className="h-14 border-t border-border bg-card flex items-center justify-center">
          <div className="h-4 w-32 rounded bg-muted" />
        </footer>
      )}
    </div>
  );
};

export default LayoutSkeleton;
