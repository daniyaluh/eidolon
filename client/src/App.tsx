import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { NavBar } from "./components/nav/NavBar";
import { SideRail } from "./components/nav/SideRail";
import { CartDrawer } from "./components/cart/CartDrawer";
import { ChatWidget } from "./components/chat/ChatWidget";
import { CursorLens } from "./components/ui/CursorLens";
import { PageTransition } from "./components/layout/PageTransition";
import { HomePage } from "./pages/HomePage";
import { GamesGridPage } from "./pages/GamesGridPage";
import { GameDetailPage } from "./pages/GameDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LibraryPage } from "./pages/LibraryPage";
import { WishlistPage } from "./pages/WishlistPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { BillingPage } from "./pages/BillingPage";
import { CheckoutSuccessPage } from "./pages/CheckoutSuccessPage";
import { CheckoutCancelledPage } from "./pages/CheckoutCancelledPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminGamesPage } from "./pages/admin/AdminGamesPage";
import { AdminAnalyticsPage } from "./pages/admin/AdminAnalyticsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { useAuthStore } from "./store/authStore";
import { useCartStore } from "./store/cartStore";
import { useChatStore } from "./store/chatStore";

function App() {
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.reset);
  const resetChat = useChatStore((state) => state.reset);
  const location = useLocation();

  // Immersive, full-bleed screens — hide the app chrome.
  const isAuthRoute =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/onboarding";

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart().catch(() => undefined);
    } else {
      resetCart();
      resetChat();
    }
  }, [isAuthenticated, fetchCart, resetCart, resetChat]);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <CursorLens />
      {!isAuthRoute && <NavBar />}
      {!isAuthRoute && <SideRail />}
      {!isAuthRoute && <CartDrawer />}
      <main className={`flex-1 ${isAuthRoute ? "" : "lg:pl-24"}`}>
        <AnimatedRoutes />
      </main>
      {!isAuthRoute && <ChatWidget />}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/games" element={<PageTransition><GamesGridPage /></PageTransition>} />
        <Route path="/games/:slug" element={<PageTransition><GameDetailPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        <Route path="/checkout/success" element={<PageTransition><CheckoutSuccessPage /></PageTransition>} />
        <Route path="/checkout/cancelled" element={<PageTransition><CheckoutCancelledPage /></PageTransition>} />

        <Route element={<ProtectedRoute />}>
          {/* No PageTransition wrapper: its scale transform would break the
              onboarding page's position:sticky scroll animation. */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/library" element={<PageTransition><LibraryPage /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
          <Route path="/orders" element={<PageTransition><OrderHistoryPage /></PageTransition>} />
          <Route path="/billing" element={<PageTransition><BillingPage /></PageTransition>} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/games" replace />} />
            <Route path="games" element={<AdminGamesPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
