import { API_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { Activity, Calendar, Trophy, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';

const Progreso = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/client/feedback`);
                setLogs(res.data);
            } catch (error) {
                console.error("Error al cargar historial", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Cálculo de estadísticas simples
    const totalWorkouts = logs.length;
    const avgRPE = totalWorkouts > 0 ? (logs.reduce((acc, curr) => acc + curr.rpe, 0) / totalWorkouts).toFixed(1) : 0;
    
    // Racha actual (simplificada, solo cuenta días consecutivos recientes o total reciente)
    // Para simplificar, mostraremos "Sesiones este mes"
    const currentMonth = new Date().getMonth();
    const sessionsThisMonth = logs.filter(l => new Date(l.date).getMonth() === currentMonth).length;


    if (loading) return <div className="p-8 text-center text-gray-400">Cargando tu progreso...</div>;

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h1 className="text-2xl font-bold text-brand-primary">Mi Progreso</h1>
                <p className="text-gray-500 text-sm">Registro de tu constancia y esfuerzo.</p>
            </header>

            {/* ESTADÍSTICAS */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-brand-primary/10 p-2 rounded-full text-brand-primary mb-2">
                        <Trophy size={20} />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{totalWorkouts}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Total</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-brand-secondary/10 p-2 rounded-full text-brand-secondary mb-2">
                        <Calendar size={20} />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{sessionsThisMonth}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Este Mes</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                    <div className="bg-brand-action/10 p-2 rounded-full text-brand-action mb-2">
                        <TrendingUp size={20} />
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{avgRPE}</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold">RPE Media</span>
                </div>
            </div>

            {/* HISTORIAL */}
            <div className="space-y-4">
                <h2 className="font-bold text-gray-700 text-lg">Historial de Entrenamientos</h2>
                
                {logs.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                        <Activity size={48} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400">Aún no has registrado actividad.</p>
                        <p className="text-sm text-gray-500 mt-2">¡Completa tu primera rutina para verla aquí!</p>
                    </div>
                ) : (
                    logs.map(log => (
                        <div 
                            key={log._id} 
                            onClick={() => setExpandedLog(expandedLog === log._id ? null : log._id)}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-transform cursor-pointer hover:shadow-md"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-brand-primary flex items-center gap-2">
                                        {log.workout?.title || "Rutina Archivada"}
                                        {expandedLog === log._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Calendar size={12} /> {new Date(log.date).toLocaleDateString()} 
                                        <span className="mx-1">·</span> 
                                        {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                                    log.rpe >= 8 ? 'bg-red-50 text-red-600' : 
                                    log.rpe >= 5 ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                }`}>
                                    RPE {log.rpe}
                                </div>
                            </div>
                            
                            {log.comments && (
                                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border-l-2 border-brand-secondary/30">
                                    "{log.comments}"
                                </div>
                            )}

                            {expandedLog === log._id && log.exercisesData && log.exercisesData.length > 0 && (
                                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700">Detalles por Ejercicio</h4>
                                    {log.exercisesData.map((ex, idx) => (
                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-gray-800 text-sm">{ex.exerciseName || "Ejercicio"}</span>
                                                {ex.rpe && (
                                                    <span className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 font-bold">
                                                        RPE {ex.rpe}
                                                    </span>
                                                )}
                                            </div>
                                            {ex.weightUsed && (
                                                <p className="text-xs text-gray-600">
                                                    <span className="font-semibold">Peso/Resistencia:</span> {ex.weightUsed}
                                                </p>
                                            )}
                                            {ex.notes && (
                                                <p className="text-xs text-gray-500 italic mt-1">
                                                    Nota: {ex.notes}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Progreso;

