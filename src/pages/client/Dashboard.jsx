import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, PlayCircle, Clock, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';

const ClientDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [todaysWorkout, setTodaysWorkout] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fecha de hoy bonita
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                // Obtenemos las rutinas asignadas
                const token =     localStorage.getItem('token');
                const res = await axios.get('${API_URL}/api/client/workouts', {
                    headers: { 'x-auth-token': token }
                });
                
                // Tomamos la más reciente (la primera por el sort del backend)
                if (res.data && res.data.length > 0) {
                    setTodaysWorkout(res.data[0]);
                }
            } catch (err) {
                console.error("Error cargando rutina", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, []);

    // Cálculo estimado de duración (ej: 8 min por ejercicio)
    const estimatedDuration = todaysWorkout ? todaysWorkout.exercises.length * 8 : 0;

    return (
        <div className="space-y-6">
            {/* Header de Bienvenida */}
            <section>
                <p className="text-gray-500 text-sm capitalize">{today}</p>
                <h2 className="text-2xl font-bold text-gray-800">
                    ¡Vamos, {user?.name || "Calibrante"}! 💪
                </h2>
            </section>

            {/* Tarjeta de "Tu Rutina de Hoy" */}
            <section>
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-700 text-lg">Para hoy</h3>
                    <span className="bg-brand-secondary/10 text-brand-secondary text-xs px-2 py-0.5 rounded-full font-bold">DIA 1</span>
                </div>
                
                {loading ? (
                    <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-gray-400">
                        Cargando tu plan...
                    </div>
                ) : todaysWorkout ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/client/programa')}>
                        <div className="flex justify-between items-start z-10 relative">
                            <div>
                                <h4 className="font-bold text-xl text-brand-primary mb-1">{todaysWorkout.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1"><Clock size={14} /> ~{estimatedDuration} min</span>
                                    <span className="flex items-center gap-1"><CheckCircle size={14} /> {todaysWorkout.exercises.length} Ejercicios</span>
                                </div>
                            </div>
                            <div className="bg-brand-action text-white p-3 rounded-full shadow-lg shadow-brand-action/30 group-hover:scale-110 transition-transform">
                                <PlayCircle size={28} fill="currentColor" className="text-white" />
                            </div>
                        </div>
                        
                        {/* Decoración fondo */}
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-brand-bg rounded-full opacity-50 z-0"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
                         <div className="bg-gray-100 p-3 rounded-full text-gray-400">
                            <AlertCircle size={24} />
                         </div>
                         <div>
                             <h4 className="font-bold text-gray-700">Sin rutina asignada</h4>
                             <p className="text-sm text-gray-500 mt-1">Tu entrenador aún no ha publicado tu programa. ¡Avísale si crees que es un error!</p>
                         </div>
                    </div>
                )}
            </section>

            {/* Estado Semanal */}
            <section className="bg-brand-primary rounded-2xl p-5 text-white shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">Tu Semana</h3>
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">1/3 Completado</span>
                </div>
                <div className="flex justify-between gap-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <span className="text-xs opacity-80">{day}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-brand-action text-white shadow' : 'bg-white/10'}`}>
                                {idx === 0 ? '✓' : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Accesos Rápidos */}
            <section className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('/client/progreso')} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-brand-secondary transition-colors group">
                    <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-full group-hover:bg-brand-primary group-hover:text-white transition-colors"><Activity size={20} /></div>
                    <span className="text-sm font-bold text-gray-700">Mi Progreso</span>
                </button>
                <button className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:border-brand-secondary transition-colors group">
                    <div className="bg-brand-secondary/10 text-brand-secondary p-3 rounded-full group-hover:bg-brand-secondary group-hover:text-white transition-colors"><Calendar size={20} /></div>
                    <span className="text-sm font-bold text-gray-700">Calendario</span>
                </button>
            </section>
        </div>
    );
};

export default ClientDashboard;

