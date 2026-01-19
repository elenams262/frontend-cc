import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, Activity, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ClientLayout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return <div className="p-4 text-center">Cargando sesión...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Superior (Logo + Perfil) */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-md mx-auto px-4 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Logo" className="h-8 w-auto mix-blend-multiply" />
                        <h1 className="text-xl font-bold text-brand-primary tracking-tight">
                            Calibrado<span className="text-brand-secondary">Corporal</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-600 hidden sm:block">Hola, {user?.name}</span>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Contenido Principal (Scrollable) */}
            <main className="flex-1 overflow-y-auto pb-24 animate-fade-in">
                <div className="max-w-md mx-auto p-4">
                    <Outlet />
                </div>
            </main>

            {/* Bottom Navigation (Estilo App Móvil) */}
            <nav className="fixed bottom-0 w-full bg-brand-primary safe-area-pb z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="max-w-md mx-auto grid grid-cols-4 h-16">
                    <NavItem to="/client/dashboard" icon={<Home size={22} />} label="Inicio" />
                    <NavItem to="/client/programa" icon={<ClipboardList size={22} />} label="Mi Plan" />
                    <NavItem to="/client/progreso" icon={<Activity size={22} />} label="Progreso" />
                    <NavItem to="/client/perfil" icon={<User size={22} />} label="Perfil" />
                </div>
            </nav>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <NavLink 
        to={to} 
        className={({ isActive }) => `
            flex flex-col items-center justify-center space-y-1 transition-colors
            ${isActive ? 'text-white font-bold' : 'text-brand-secondary-light hover:text-white'}
        `}
    >
        {icon}
        <span className="text-[10px]">{label}</span>
    </NavLink>
);

export default ClientLayout;
