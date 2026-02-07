import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full relative overflow-hidden">
      {/* Background Elements */}
      <div
        className="blob w-72 h-72 bg-[var(--organic-sage)]"
        style={{ top: "5%", right: "5%" }}
      />
      <div
        className="blob w-56 h-56 bg-[var(--organic-sky)]"
        style={{ bottom: "10%", left: "40%", animationDelay: "-8s" }}
      />

      {/* Fixed Sidebar */}
      <aside className="hidden md:flex w-[240px] lg:w-[280px] flex-col fixed left-0 top-0 h-screen bg-white/50 backdrop-blur-sm border-r border-[var(--organic-sage)]/20 z-40">
        <div className="flex h-16 items-center border-b border-[var(--organic-sage)]/20 px-6 shrink-0">
          <a href="/" className="flex items-center gap-3">
            <span className="text-2xl">🌿</span>
            <span className="display-font text-xl text-[var(--organic-forest)]">
              Self Manager
            </span>
          </a>
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <DashboardSidebar />
        </div>
        <div className="p-4 border-t border-[var(--organic-sage)]/20 shrink-0">
          <p className="handwritten text-sm text-[var(--organic-earth)] opacity-60">
            ...growing together 🌱
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 relative z-10 md:ml-[240px] lg:ml-[280px]">
        <header className="flex h-16 items-center gap-4 border-b border-[var(--organic-sage)]/20 bg-white/30 backdrop-blur-sm px-6 sticky top-0 z-30">
          <div className="md:hidden">
            <span className="text-xl">🌿</span>
          </div>
          <div className="flex-1" />
          <div className="organic-tag text-sm">
            <span>🌤️</span>
            Good day!
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
