import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:ml-56">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-3 pb-[calc(4.25rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-6 lg:pb-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
