import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function InsightsPage() {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Insights</h1>
          <p>See AI-powered insights, summaries, and trends here.</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
