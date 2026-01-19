import { API_URL } from '../../config/api';
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Search, Plus, ChevronRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // <--- Importado para redirigir
import axios from 'axios';
import NewCalibranteModal from '../../components/NewCalibranteModal';

const Calibrantes = () => {
    const navigate = useNavigate(); // <--- Hook de navegación
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Función para cargar usuarios del backend
    const fetchUsers = async () => {
        try {
            const res = await axios.get('${API_URL}/api/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Filtrar usuarios por búsqueda
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.surname.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-primary">Calibrantes</h1>
                    <p className="text-gray-500">Gestiona a tus alumnos y sus progresos.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto flex items-center justify-center space-x-2 bg-brand-action text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                >
                    <Plus size={20} />
                    <span>Nuevo Calibrante</span>
                </button>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                    />
                </div>
            </div>

            {/* Lista de Usuarios */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Cargando calibrantes...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
                    <p>No se encontraron calibrantes.</p>
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-brand-primary font-medium hover:underline">
                        ¡Crea el primero ahora!
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredUsers.map(user => (
                        <div 
                            key={user._id} 
                            onClick={() => navigate(`/admin/calibrantes/${user._id}`)} // <--- AL CLICKAR: VA AL DETALLE
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                        {user.avatar ? (
                                            <img src={`${API_URL}/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-gray-100">
                                                {user.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-brand-primary group-hover:text-brand-action transition-colors">
                                            {user.name} {user.surname}
                                        </h3>
                                        <p className="text-sm text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="bg-brand-bg px-3 py-1 rounded-full text-xs font-medium text-brand-text-muted">
                                    {user.profile?.status || "Activo"}
                                </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Objetivo</p>
                                    <p className="text-sm text-gray-700 line-clamp-2">
                                        {user.profile?.objectives?.[0] || "Sin objetivo definido"}
                                    </p>
                                </div>
                            </div>

                            {/* Alerta de dolor si existe */}
                            {user.profile?.limitations?.length > 0 && (
                                <div className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 p-2 rounded-lg mb-4">
                                    <AlertTriangle size={16} />
                                    <span className="font-medium">Reporta Dolor/Limitación</span>
                                </div>
                            )}

                            <div className="flex items-center text-brand-secondary font-medium text-sm group-hover:translate-x-1 transition-transform">
                                <span>Ver ficha completa</span>
                                <ChevronRight size={16} className="ml-1" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Creación */}
            <NewCalibranteModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onUserCreated={fetchUsers}
            />
        </div>
    );
};

export default Calibrantes;

