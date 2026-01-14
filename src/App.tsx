import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './layouts/AdminLayout';
import Users from './pages/Users';
import Technicians from './pages/Technicians';
import Services from './pages/Services';
import Payments from './pages/Payments';
import UserDetail from './pages/UserDetail';
import TechnicianDetail from './pages/TechnicianDetail';
import ServiceDetail from './pages/ServiceDetail';
import Categories from './pages/Categories';
import AccessDenied from './pages/AccessDenied';



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/access-denied" element={<AccessDenied />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="users" element={<Users />} />
  <Route path="users/:id" element={<UserDetail />} />
  <Route path="technicians" element={<Technicians />} />
  <Route path="technicians/:id" element={<TechnicianDetail />} />
  <Route path="services" element={<Services />} />
  <Route path="services/:id" element={<ServiceDetail />} />
  <Route path="payments" element={<Payments />} />
  <Route path="categories" element={<Categories />} />
</Route>


      </Routes>
    </BrowserRouter>
  );
}
