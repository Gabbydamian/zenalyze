import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AudioPage() {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Audio Journal</h1>
          <p>Record and manage your voice journal entries here.</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
