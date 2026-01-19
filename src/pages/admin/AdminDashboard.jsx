import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { Users, Dumbbell, Calendar, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalClients: 0,
        totalExercises: 0,
        activeWorkouts: 0,
        recentFeedback: 0
    });

    const [activity, setActivity] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    axios.get(`${API_URL}/api/admin/stats`),
                    axios.get(`${API_URL}/api/admin/stats/activity`)
                ]);
                setStats(statsRes.data);
                setActivity(activityRes.data.recentFeedbacks || []);
            } catch (error) {
                console.error("Error cargando estadísticas", error);
            }
        };
        fetchStats();
    }, []);

    const menuItems = [
        {
            title: "Calibrantes",
            description: `${stats.totalClients} Activos`,
            icon: <Users size={32} className="text-blue-500" />,
            path: "/admin/calibrantes",
            color: "bg-blue-50 border-blue-100"
        },
        {
            title: "Programas",
            description: `${stats.activeWorkouts} Asignados`,
            icon: <Calendar size={32} className="text-green-500" />,
            path: "/admin/programas",
            color: "bg-green-50 border-green-100"
        },
        {
            title: "Biblioteca de Ejercicios",
            description: `${stats.totalExercises} Videos`,
            icon: <Dumbbell size={32} className="text-purple-500" />,
            path: "/admin/ejercicios",
            color: "bg-purple-50 border-purple-100"
        },
        {
            title: "Estadísticas",
            description: `${stats.recentFeedback} Feedback esta semana`,
            icon: <Activity size={32} className="text-orange-500" />,
            path: "/admin/estadisticas", 
            color: "bg-orange-50 border-orange-100"
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
                <p className="text-gray-500 mt-2">Bienvenido. Selecciona una sección para comenzar a trabajar.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems.map((item, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => item.path !== "#" && navigate(item.path)}
                        className={`p-6 rounded-2xl border ${item.color} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-4 items-start`}
                    >
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 font-medium">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
            
             {/* Sección Resumen Rápido (Opcional) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-96">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Actividad Reciente</h3>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {activity.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 border border-dashed rounded-lg">
                                No hay actividad reciente
                            </div>
                        ) : (
                            activity.map((item) => (
                                <div key={item._id} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 mt-1">
                                         {item.client?.avatar ? (
                                            <img src={`${API_URL}/${item.client.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-[10px]">
                                                {item.client?.name?.[0]}
                                            </div>
                                         )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {item.client?.name} {item.client?.surname}
                                        </p>
                                        <p className="text-xs text-brand-secondary truncate">
                                            Completó: {item.workout?.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(item.date).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className={`text-xs font-bold px-2 py-1 rounded ${
                                        item.rpe >= 8 ? 'bg-red-100 text-red-600' : 
                                        item.rpe >= 5 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                    }`}>
                                        RPE {item.rpe}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">Estado del Sistema</h3>
                    <div className="space-y-3">
                         <div className="flex justify-between text-sm"><span>Servidor</span><span className="text-green-500 font-bold">Online</span></div>
                         <div className="flex justify-between text-sm"><span>Base de Datos</span><span className="text-green-500 font-bold">Conectada</span></div>
                         <div className="flex justify-between text-sm"><span>Versión API</span><span className="text-gray-500">v1.0.0</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

