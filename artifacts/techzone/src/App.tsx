import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartDrawer } from "@/components/CartDrawer";

// Pages
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Placeholder components for pages not yet implemented
const Placeholder = ({ name }: { name: string }) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">صفحة {name}</h1>
      <p className="text-muted-foreground">جاري بناء هذه الصفحة...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={CategoryDetail} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      
      {/* Placeholders for remaining pages */}
      <Route path="/deals" component={() => <Placeholder name="عروض فلاش" />} />
      <Route path="/search" component={() => <Placeholder name="البحث" />} />
      <Route path="/brands" component={() => <Placeholder name="الماركات" />} />
      <Route path="/brands/:slug" component={() => <Placeholder name="الماركة" />} />
      <Route path="/blog" component={() => <Placeholder name="المدونة" />} />
      <Route path="/blog/:slug" component={() => <Placeholder name="المقال" />} />
      <Route path="/checkout" component={() => <Placeholder name="الدفع" />} />
      <Route path="/order-success" component={() => <Placeholder name="تأكيد الطلب" />} />
      <Route path="/track-order" component={() => <Placeholder name="تتبع الطلب" />} />
      <Route path="/wishlist" component={() => <Placeholder name="المفضلة" />} />
      <Route path="/pc-builder" component={() => <Placeholder name="تجميعة PC" />} />
      <Route path="/about" component={() => <Placeholder name="من نحن" />} />
      <Route path="/contact" component={() => <Placeholder name="اتصل بنا" />} />
      <Route path="/faq" component={() => <Placeholder name="الأسئلة الشائعة" />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
          <ScrollToTop />
          <CartDrawer />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
