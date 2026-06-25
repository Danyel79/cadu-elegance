import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Home from "../pages/Home";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserEdit from "../pages/admin/AdminUserEdit";
import AdminStaff from "../pages/admin/AdminStaff";
import AdminStaffEdit from "../pages/admin/AdminStaffEdit";
import AdminServiceForm from "../pages/admin/AdminServiceForm";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminStore from "../pages/admin/AdminStore";
import AdminUserNew from "../pages/admin/AdminUserNew";
import ClientDashboard from "../pages/client/ClientDashboard";
import ClientBookAppointment from "../pages/client/ClientBookAppointment";
import ClientServices from "../pages/client/ClientServices";
import ClientBookings from "../pages/client/ClientBookings";
import ClientProfile from "../pages/client/ClientProfile";
import ProfessionalDashboard from "../pages/professional/ProfessionalDashboard";
import ProfessionalBookings from "../pages/professional/ProfessionalBookings";
import ProfessionalSchedule from "../pages/professional/ProfessionalSchedule";
import StorePage from "../pages/store/StorePage";
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

function ProfessionalRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { isProfessional, loading: profileLoading } = useUserProfile();

  if (authLoading || (user && profileLoading)) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isProfessional) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function ClientRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { loading: profileLoading } = useUserProfile();

  if (authLoading || (user && profileLoading)) {
    return <div>Carregando...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
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
            <ClientRoute>
              <ClientDashboard />
            </ClientRoute>
          }
        />
        <Route
          path="/client/book"
          element={
            <ClientRoute>
              <ClientBookAppointment />
            </ClientRoute>
          }
        />
        <Route
          path="/client/bookings"
          element={
            <ClientRoute>
              <ClientBookings />
            </ClientRoute>
          }
        />
        <Route
          path="/client/services"
          element={
            <ClientRoute>
              <ClientServices />
            </ClientRoute>
          }
        />
        <Route
          path="/client/profile"
          element={
            <ClientRoute>
              <ClientProfile />
            </ClientRoute>
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
          path="/admin/users/new"
          element={
            <AdminRoute>
              <AdminUserNew />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <AdminRoute>
              <AdminStaff />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/staff/:profileId/edit"
          element={
            <AdminRoute>
              <AdminStaffEdit />
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
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/store"
          element={
            <AdminRoute>
              <AdminStore />
            </AdminRoute>
          }
        />
        <Route
          path="/store"
          element={
            <PrivateRoute>
              <StorePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/professional"
          element={
            <ProfessionalRoute>
              <ProfessionalDashboard />
            </ProfessionalRoute>
          }
        />
        <Route
          path="/professional/bookings"
          element={
            <ProfessionalRoute>
              <ProfessionalBookings />
            </ProfessionalRoute>
          }
        />
        <Route
          path="/professional/schedule"
          element={
            <ProfessionalRoute>
              <ProfessionalSchedule />
            </ProfessionalRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
