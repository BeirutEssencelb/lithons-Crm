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
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:ml-64 xl:ml-72">
        <Header />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-2 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 md:max-w-5xl md:px-8 lg:max-w-none lg:px-8 lg:pb-10">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
