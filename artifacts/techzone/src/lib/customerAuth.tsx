import { createContext, useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCustomerMe,
  useCustomerLogin,
  useCustomerRegister,
  useCustomerLogout,
  getCustomerMeQueryKey,
} from "@workspace/api-client-react";
import type {
  Customer,
  CustomerLoginInput,
  CustomerRegisterInput,
} from "@workspace/api-client-react";

interface CustomerAuthContextValue {
  customer: Customer | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (input: CustomerLoginInput) => Promise<Customer>;
  register: (input: CustomerRegisterInput) => Promise<Customer>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: customer, isLoading } = useCustomerMe({
    query: {
      queryKey: getCustomerMeQueryKey(),
      retry: false,
      staleTime: 60_000,
    },
  });

  const loginMutation = useCustomerLogin();
  const registerMutation = useCustomerRegister();
  const logoutMutation = useCustomerLogout();

  const refreshCustomer = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: getCustomerMeQueryKey() });
  }, [queryClient]);

  const login = useCallback(
    async (input: CustomerLoginInput) => {
      const result = await loginMutation.mutateAsync({ data: input });
      queryClient.setQueryData(getCustomerMeQueryKey(), result);
      await refreshCustomer();
      return result;
    },
    [loginMutation, queryClient, refreshCustomer],
  );

  const register = useCallback(
    async (input: CustomerRegisterInput) => {
      const result = await registerMutation.mutateAsync({ data: input });
      queryClient.setQueryData(getCustomerMeQueryKey(), result);
      await refreshCustomer();
      return result;
    },
    [registerMutation, queryClient, refreshCustomer],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
    queryClient.setQueryData(getCustomerMeQueryKey(), null);
    await refreshCustomer();
  }, [logoutMutation, queryClient, refreshCustomer]);

  const value: CustomerAuthContextValue = {
    customer: customer ?? null,
    isLoading,
    isAuthenticated: !!customer,
    login,
    register,
    logout,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}
