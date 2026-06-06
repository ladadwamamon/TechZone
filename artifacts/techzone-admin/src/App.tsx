import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Shell } from "@/components/layout/Shell";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Brands from "@/pages/Brands";
import Coupons from "@/pages/Coupons";
import Navigation from "@/pages/Navigation";
import Pages from "@/pages/Pages";
import Reviews from "@/pages/Reviews";
import Blog from "@/pages/Blog";
import Media from "@/pages/Media";
import Newsletter from "@/pages/Newsletter";
import Customers from "@/pages/Customers";
import Accounts from "@/pages/Accounts";
import Settings from "@/pages/Settings";
import Audit from "@/pages/Audit";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, perm, ...rest }: any) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (perm && !hasPermission(perm)) return <NotFound />;
  
  return (
    <Shell>
      <Component {...rest} />
    </Shell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {(params) => <ProtectedRoute component={Dashboard} perm="analytics:read" {...params} />}
      </Route>
      <Route path="/orders">
        {(params) => <ProtectedRoute component={Orders} perm="orders:write" {...params} />}
      </Route>
      <Route path="/products">
        {(params) => <ProtectedRoute component={Products} perm="products:write" {...params} />}
      </Route>
      <Route path="/categories">
        {(params) => <ProtectedRoute component={Categories} perm="categories:write" {...params} />}
      </Route>
      <Route path="/brands">
        {(params) => <ProtectedRoute component={Brands} perm="brands:write" {...params} />}
      </Route>
      <Route path="/coupons">
        {(params) => <ProtectedRoute component={Coupons} perm="coupons:write" {...params} />}
      </Route>
      <Route path="/navigation">
        {(params) => <ProtectedRoute component={Navigation} perm="navigation:write" {...params} />}
      </Route>
      <Route path="/pages">
        {(params) => <ProtectedRoute component={Pages} perm="pages:write" {...params} />}
      </Route>
      <Route path="/reviews">
        {(params) => <ProtectedRoute component={Reviews} perm="reviews:write" {...params} />}
      </Route>
      <Route path="/blog">
        {(params) => <ProtectedRoute component={Blog} perm="blog:write" {...params} />}
      </Route>
      <Route path="/media">
        {(params) => <ProtectedRoute component={Media} perm="media:write" {...params} />}
      </Route>
      <Route path="/newsletter">
        {(params) => <ProtectedRoute component={Newsletter} perm="newsletter:read" {...params} />}
      </Route>
      <Route path="/customers">
        {(params) => <ProtectedRoute component={Customers} perm="orders:write" {...params} />}
      </Route>
      <Route path="/accounts">
        {(params) => <ProtectedRoute component={Accounts} perm="admins:manage" {...params} />}
      </Route>
      <Route path="/settings">
        {(params) => <ProtectedRoute component={Settings} perm="settings:write" {...params} />}
      </Route>
      <Route path="/audit">
        {(params) => <ProtectedRoute component={Audit} perm="audit:read" {...params} />}
      </Route>
      <Route>
        {(params) => <ProtectedRoute component={NotFound} {...params} />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
