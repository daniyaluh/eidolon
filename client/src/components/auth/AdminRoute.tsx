import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Spinner } from "../ui/Spinner";

export function AdminRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const role = useAuthStore((state) => state.user?.role);
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex justify-center py-20">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role !== "ADMIN") {
    return <Navigate to="/games" replace />;
  }

  return <Outlet />;
}
