import { useAuth } from "@/lib/auth";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-glow text-primary font-mono text-xl neon-text">
          جارٍ التحميل...
        </div>
      </div>
    );
  }

  // Shell is only rendered on authenticated routes, but just in case
  if (!isAuthenticated) {
    return null; 
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background cyber-grid relative overflow-hidden">
        {/* Vignette overlay for depth */}
        <div className="absolute inset-0 vignette pointer-events-none z-0" />
        
        <Sidebar />
        
        <main className="flex-1 flex flex-col relative z-10 w-full">
          <Topbar />
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full h-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
