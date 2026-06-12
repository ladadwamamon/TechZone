import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CartDrawer } from "@/components/CartDrawer";
import { CyberBackground } from "@/components/CyberBackground";
import { WishlistSync } from "@/components/WishlistSync";
import { CustomerAuthProvider } from "@/lib/customerAuth";

// Pages
import Home from "@/pages/Home";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import OrderSuccess from "@/pages/OrderSuccess";
import Deals from "@/pages/Deals";
import Search from "@/pages/Search";
import Brands from "@/pages/Brands";
import BrandDetail from "@/pages/BrandDetail";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPostPage";
import TrackOrder from "@/pages/TrackOrder";
import Wishlist from "@/pages/Wishlist";
import PcBuilder from "@/pages/PcBuilder";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Faq from "@/pages/Faq";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import GiftCards from "@/pages/GiftCards";
import SubscriptionPlans from "@/pages/SubscriptionPlans";
import CustomPage from "@/pages/CustomPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import ReturnPolicy from "@/pages/ReturnPolicy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={CategoryDetail} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/deals" component={Deals} />
      <Route path="/search" component={Search} />
      <Route path="/brands" component={Brands} />
      <Route path="/brands/:slug" component={BrandDetail} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/track-order" component={TrackOrder} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/pc-builder" component={PcBuilder} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/faq" component={Faq} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/account" component={Account} />
      <Route path="/gift-cards" component={GiftCards} />
      <Route path="/subscriptions" component={SubscriptionPlans} />
      <Route path="/p/:slug" component={CustomPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/return-policy" component={ReturnPolicy} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CustomerAuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <CyberBackground />
              <WishlistSync />
              <Router />
              <ScrollToTop />
              <CartDrawer />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </CustomerAuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
