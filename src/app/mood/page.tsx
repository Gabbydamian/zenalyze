import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MoodPage() {
  return (
    <SidebarProvider>
      <div className="flex h-svh w-full">
        <AppSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-4">Mood Check-In</h1>
          <p>Log your mood and view your mood calendar here.</p>
        </main>
      </div>
    </SidebarProvider>
  );
}
