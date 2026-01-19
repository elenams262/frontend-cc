import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import Calibrantes from "./pages/admin/Calibrantes";
import { useAuth } from './context/AuthContext';
import CalibranteDetalle from './pages/admin/CalibranteDetalle';
import Ejercicios from './pages/admin/Ejercicios';
import Programas from './pages/admin/Programas';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStats from './pages/admin/AdminStats';
import ActivateAccount from './pages/ActivateAccount';
// CLIENTE
import ClientLayout from './layouts/ClientLayout';

import ClientDashboard from './pages/client/Dashboard';
import MiPlan from './pages/client/MiPlan';
import Progreso from './pages/client/Progreso';
import Perfil from './pages/client/Perfil';

// Pequeño componente para proteger rutas (si no estás logueado, fuera)
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/" />;
  // Si pedimos rol específico y no coincide (ej: cliente intentando entrar a zona admin)
  if (role && user.role !== role) return <Navigate to="/" />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<Login />} />
        <Route path="/activate" element={<ActivateAccount />} />

        {/* Rutas Privadas de Admin */}
        <Route path="/admin" element={
            <PrivateRoute role="admin">
                <AdminLayout />
            </PrivateRoute>
        }>
            {/* Al entrar a /admin, redirigir directo al Panel */}
            <Route index element={<Navigate to="/admin/panel" />} />
            <Route path="panel" element={<AdminDashboard />} />
            <Route path="estadisticas" element={<AdminStats />} />
            <Route path="calibrantes" element={<Calibrantes />} />
            <Route path="calibrantes/:id" element={<CalibranteDetalle />} /> 
            <Route path="programas" element={<Programas />} />
            <Route path="ejercicios" element={<Ejercicios />} />
        </Route>

        {/* RUTAS CLIENTE */}
        <Route path="/client" element={
            <PrivateRoute role="client">
                <ClientLayout />
            </PrivateRoute>
        }>
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="programa" element={<MiPlan />} />
            <Route path="progreso" element={<Progreso />} />
            <Route path="perfil" element={<Perfil />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
