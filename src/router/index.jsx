import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserEdit from "../pages/admin/AdminUserEdit";
import AdminServiceForm from "../pages/admin/AdminServiceForm";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientBookAppointment from "../pages/client/ClientBookAppointment";
import ClientServices from "../pages/client/ClientServices";
import ClientBookings from "../pages/client/ClientBookings";
import ClientProfile from "../pages/client/ClientProfile";
import { useAuth } from "../context/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: profileLoading } = useUserProfile();

  if (authLoading || (user && profileLoading)) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/client"
          element={
            <PrivateRoute>
              <ClientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/book"
          element={
            <PrivateRoute>
              <ClientBookAppointment />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/services"
          element={
            <PrivateRoute>
              <ClientServices />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/bookings"
          element={
            <PrivateRoute>
              <ClientBookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <PrivateRoute>
              <ClientProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users/:profileId/edit"
          element={
            <AdminRoute>
              <AdminUserEdit />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/services/new"
          element={
            <AdminRoute>
              <AdminServiceForm />
            </AdminRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
