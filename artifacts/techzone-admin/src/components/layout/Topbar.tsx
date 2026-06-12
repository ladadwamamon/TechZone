import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAdminLogout } from "@workspace/api-client-react";
import { LogOut, TerminalSquare } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetCurrentAdminQueryKey } from "@workspace/api-client-react";

export function Topbar() {
  const { admin } = useAuth();
  const logout = useAdminLogout();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        queryClient.setQueryData(getGetCurrentAdminQueryKey(), null);
        queryClient.removeQueries({ queryKey: getGetCurrentAdminQueryKey() });
        setLocation("/login");
      },
    });
  };

  return (
    <header className="h-16 border-b border-primary/20 glass-panel bg-background/80 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-primary hover:text-primary hover:bg-primary/10" />
        <div className="hidden md:flex items-center gap-2 text-muted-foreground text-sm font-mono opacity-60">
          <TerminalSquare className="w-4 h-4" />
          <span>SYS_STATUS: ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={logout.isPending}
          data-testid="btn-logout"
        >
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </header>
  );
}
