import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/server";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
} from "@/components/ui/sidebar";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-svh w-full">
        <Sidebar>
          <SidebarHeader>
            <span className="font-bold">Dashboard</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Home</SidebarMenuButton>
              </SidebarMenuItem>
              {/* Add more menu items here */}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <LogoutButton />
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-8">
            <p>
              Hello <span>{data.user.email}</span>
            </p>
            {/* Main dashboard content goes here */}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
