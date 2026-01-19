import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Activity, TrendingUp, Users, Calendar } from 'lucide-react';

const AdminStats = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        activeWorkouts: 0,
        recentFeedback: 0
    });
    const [activity, setActivity] = useState([]);
    const [rpeData, setRpeData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [resStats, resActivity] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/stats'),
                    axios.get('http://localhost:5000/api/admin/stats/activity')
                ]);
                setStats(resStats.data);
                setActivity(resActivity.data.recentFeedbacks);
                setRpeData(resActivity.data.rpeTrend || []);
            } catch (error) {
                console.error("Error loading stats", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando análisis...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Estadísticas y Análisis</h1>
                <p className="text-gray-500 mt-2">Visión general del rendimiento de tus calibrantes.</p>
            </header>

            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-500 rounded-full">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Total Calibrantes</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.totalClients}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-green-50 text-green-500 rounded-full">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Programas Activos</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.activeWorkouts}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-full">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase">Feedback (7 días)</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.recentFeedback}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LISTA DE FEEDBACK RECIENTE */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden order-last lg:order-first">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-gray-800">Último Feedback Recibido</h3>
                        <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-500">Tiempo Real</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {activity.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">No hay actividad reciente.</div>
                        ) : (
                            activity.map((item) => (
                                <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                         {item.client?.avatar ? (
                                            <img src={`http://localhost:5000/${item.client.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {item.client?.name?.[0]}
                                            </div>
                                         )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm text-gray-800">
                                                {item.client?.name} {item.client?.surname}
                                            </h4>
                                            <span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-brand-secondary font-medium mt-0.5">
                                            {item.workout?.title}
                                        </p>
                                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                            {item.comments || "Sin comentarios"}
                                        </div>
                                        <div className="mt-2 flex gap-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                item.rpe >= 8 ? 'bg-red-100 text-red-600' : 
                                                item.rpe >= 5 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                            }`}>RPE: {item.rpe}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* GRÁFICO (Datos Reales) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h3 className="font-bold text-lg text-gray-800 mb-6">Tendencia de RPE (Últ. sesiones)</h3>
                    
                    {rpeData.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Faltan datos para generar tendencia
                        </div>
                    ) : (
                        <div className="flex-1 flex items-end justify-between gap-3 h-96 px-2 pb-2">
                            {rpeData.map((item, idx) => (
                                <div key={idx} className="w-full flex flex-col justify-end h-full group relative">
                                    <div 
                                        className="w-full bg-brand-secondary rounded-t-lg transition-all hover:opacity-80 relative"
                                        style={{ height: `${(item.rpe / 10) * 100}%` }}
                                    >
                                       {/* Valor visible en móvil o pantallas pequeñas */}
                                        <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-500">
                                            {item.rpe}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-gray-300 text-center mt-1 truncate w-full">
                                        {new Date(item.date).getDate()}/{new Date(item.date).getMonth()+1}
                                    </div>
                                    
                                    {/* Tooltip detallado */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        RPE: {item.rpe} <br/>
                                        <span className="text-[10px] opacity-75">{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
                        <span>Antiguo</span>
                        <span>Reciente</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminStats;
