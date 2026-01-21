import { API_URL } from '../../config/api';
import { getImageUrl } from '../../utils/imageUtils';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, LogOut, Settings, Bell, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Perfil = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return <div className="text-center p-8 text-gray-400">Cargando perfil...</div>;

    return (
        <div className="space-y-6 pb-20 animate-fade-in relative">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-brand-primary">Mi Perfil</h1>
                <p className="text-gray-500 text-sm">Gestiona tus datos personales y cuenta.</p>
            </header>

            {/* Tarjeta de Usuario */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="relative">
                    <div className="w-16 h-16 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary border-2 border-brand-primary/10 overflow-hidden">
                         {user.avatar ? (
                            <img src={getImageUrl(user.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <User size={32} />
                         )}
                    </div>
                     <label className="absolute bottom-0 right-0 bg-brand-secondary text-white p-1 rounded-full cursor-pointer hover:bg-yellow-600 transition-colors shadow-sm">
                        <Settings size={12} />
                        <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                            const file = e.target.files[0];
                            if(!file) return;

                            const formData = new FormData();
                            formData.append('avatar', file);

                            try {
                                // Subida
                                const token = localStorage.getItem('token');
                                const res = await fetch(`${API_URL}/api/client/avatar`, {
                                    method: 'POST',
                                    headers: { 'x-auth-token': token },
                                    body: formData
                                });
                                const data = await res.json();
                                if(res.ok) {
                                  // Forzamos recarga usuario (chapuza rápida pero efectiva)
                                  window.location.reload(); 
                                } else {
                                  alert(data.msg || "Error al subir foto");
                                }
                            } catch(err) {
                                alert("Error de conexión");
                            }
                        }} />
                    </label>
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">{user.name} {user.surname}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary text-[10px] font-bold uppercase rounded">
                        Calibrante Activo
                    </span>
                </div>
            </div>




            {/* Botón Logout */}
            <button 
                onClick={handleLogout}
                className="w-full bg-white border border-red-100 text-red-500 p-4 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 mt-8"
            >
                <LogOut size={20} />
                Cerrar Sesión
            </button>
            
            <p className="text-center text-xs text-gray-300 mt-4">Calibrado Corporal v1.0.0</p>
        </div>
    );
};

export default Perfil;

