import { API_URL } from '../config/api';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Users, BookOpen, Dumbbell, LayoutDashboard, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const AdminLayout = () => {
  const { logout, user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const token = localStorage.getItem('token');
        const res = await fetch('${API_URL}/api/admin/avatar', {
            method: 'POST',
            headers: { 'x-auth-token': token },
            body: formData
        });
        const data = await res.json();
        if(res.ok) {
          setUser({ ...user, avatar: data.avatar });
        } else {
          alert(data.msg || "Error al subir foto");
        }
    } catch(err) {
        alert("Error conexión");
    }
  };

  const menuItems = [
    { icon: <Users size={20} />, label: 'Calibrantes', path: '/admin/calibrantes' },
    { icon: <BookOpen size={20} />, label: 'Programas', path: '/admin/programas' },
    { icon: <Dumbbell size={20} />, label: 'Ejercicios', path: '/admin/ejercicios' },
    { icon: <LayoutDashboard size={20} />, label: 'Panel', path: '/admin/panel' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* 📱 MOBILE HEADER (Visible only on mobile) */}
      <header className="md:hidden bg-brand-primary text-white p-4 sticky top-0 z-30 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="h-8 w-auto brightness-0 invert" />
             <div>
                <h1 className="text-lg font-bold leading-none">Calibrado</h1>
                <p className="text-[10px] text-brand-secondary-light uppercase tracking-wider">Zona Admin</p>
             </div>
        </div>
        <div className="flex items-center space-x-3">
             <div className="relative group">
                <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary font-bold overflow-hidden border-2 border-white/20">
                     {user?.avatar ? (
                        <img src={`${API_URL}/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                     ) : (
                        <span>{user?.name?.[0] || 'A'}</span>
                     )}
                </div>
                 {/* Input oculto para subir foto en móvil (visible siempre para UX fácil en touch) */}
                 <label className="absolute -bottom-2 -right-2 bg-white text-brand-primary p-1 rounded-full cursor-pointer shadow-md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
            </div>
            <button onClick={logout} className="text-white hover:text-red-200">
                <LogOut size={20} />
            </button>
        </div>
      </header>

      {/* 💻 DESKTOP BARRA LATERAL (Sidebar) - Hidden on Mobile */}
      <aside className="hidden md:flex w-64 bg-brand-primary text-white flex-col fixed h-full z-10 transition-all duration-300">
        <div className="p-6 border-b border-brand-primary-light flex flex-col items-center text-center">
            <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-3 brightness-0 invert" />
            <h1 className="text-xl font-bold text-white">Calibrado Corporal</h1>
            <p className="text-xs text-brand-secondary-light tracking-widest uppercase mt-1">Panel de Control</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive 
                                ? 'bg-white text-brand-primary font-semibold shadow-sm' 
                                : 'text-gray-100 hover:bg-brand-primary-light'
                        }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-brand-primary-light">
            <div className="flex items-center space-x-3 mb-4 px-2">
                <div className="relative group">
                    <div className="w-10 h-10 rounded-full bg-brand-secondary flex items-center justify-center text-brand-primary font-bold overflow-hidden border-2 border-white/20">
                         {user?.avatar ? (
                            <img src={`${API_URL}/${user.avatar}`} alt="Profile" className="w-full h-full object-cover" />
                         ) : (
                            <span>{user?.name?.[0] || 'D'}</span>
                         )}
                    </div>
                    {/* Botón oculto para subir foto */}
                     <label className="absolute -bottom-1 -right-1 bg-white text-brand-primary p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                </div>
                <div className="text-sm">
                    <p className="font-medium">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-brand-secondary-light">Administrador</p>
                </div>
            </div>
            <button 
                onClick={logout}
                className="w-full flex items-center space-x-2 px-4 py-2 text-red-200 hover:text-white hover:bg-red-900/20 rounded-lg transition-colors text-sm"
            >
                <LogOut size={18} />
                <span>Cerrar Sesión</span>
            </button>
        </div>
      </aside>

      {/* 🟡 CONTENIDO PRINCIPAL (Variable) */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        {/* Aquí se cargará la página que toque (Outlet) */}
        <Outlet /> 
      </main>

      {/* 📱 MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="grid grid-cols-4 h-16">
            {menuItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center space-y-1 transition-colors
                        ${isActive ? 'text-brand-primary font-bold' : 'text-gray-400 hover:text-gray-600'}
                    `}
                >
                    {item.icon}
                    <span className="text-[10px]">{item.label}</span>
                </NavLink>
            ))}
        </div>
      </nav>

    </div>
  );
};

export default AdminLayout;

