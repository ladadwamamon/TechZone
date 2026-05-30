import React, { createContext, useContext, ReactNode } from "react";
import { useGetCurrentAdmin, getGetCurrentAdminQueryKey } from "@workspace/api-client-react";
import type { AdminAccountPublic } from "@workspace/api-client-react";

interface AuthContextValue {
  admin: AdminAccountPublic | null;
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetCurrentAdmin({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
      queryKey: getGetCurrentAdminQueryKey(),
    },
  });

  const value: AuthContextValue = {
    admin: data?.admin || null,
    permissions: data?.permissions || [],
    isLoading,
    isAuthenticated: !!data?.admin,
    hasPermission: (perm: string) => data?.permissions?.includes(perm) || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
