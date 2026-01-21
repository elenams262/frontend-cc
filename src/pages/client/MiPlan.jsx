import { API_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, PlayCircle, Clock, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';
import FeedbackModal from '../../components/FeedbackModal';
import { getImageUrl } from '../../utils/imageUtils';

const MiPlan = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Nuevo estado de error
    const [expandedWorkout, setExpandedWorkout] = useState(null);

    useEffect(() => {
        const fetchWorkouts = async () => {
            try {
                // Obtenemos las rutinas del usuario logueado
                const res = await axios.get(`${API_URL}/api/client/workouts`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') } // Aseguramos enviar el token
                });
                setWorkouts(res.data);
                if (res.data.length > 0) setExpandedWorkout(res.data[0]._id);
            } catch (error) {
                console.error("Error cargando plan:", error);
                setError(error.message || "Error desconocido"); // Guardamos el mensaje
            } finally {
                setLoading(false);
            }
        };

        fetchWorkouts();
    }, []);

    // Helper para embed de YouTube
    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedWorkoutForFeedback, setSelectedWorkoutForFeedback] = useState(null);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);

    const handleOpenFeedback = (workout) => {
        setSelectedWorkoutForFeedback(workout);
        setShowFeedbackModal(true);
    };

    const handleFeedbackSaved = () => {
        setShowSuccessBanner(true);
        setTimeout(() => setShowSuccessBanner(false), 5000); // Ocultar banner a los 5s
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando tu plan...</div>;
    
    // Mostramos error si existe
    if (error) return (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-4 border border-red-200">
            <h3 className="font-bold">Error al cargar</h3>
            <p>{error}</p>
        </div>
    );

    if (workouts.length === 0) return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
            <div className="bg-gray-100 p-6 rounded-full">
                <Calendar size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-700">Aún no tienes rutina asignada</h2>
            <p className="text-gray-500 max-w-xs">Tu calibradora está diseñando tu programa personalizado. ¡Avisaremos pronto!</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Banner de Éxito */}
            {showSuccessBanner && (
                <div className="fixed top-4 left-4 right-4 bg-green-500 text-white p-4 rounded-xl shadow-lg z-50 flex items-center justify-center gap-2 animate-bounce">
                    <CheckCircle size={24} />
                    <span className="font-bold">¡Entrenamiento Guardado! 💪</span>
                </div>
            )}

            <header>
                <h1 className="text-2xl font-bold text-brand-primary">Mi Plan Actual</h1>
                <p className="text-gray-500 text-sm">Tus rutinas personalizadas.</p>
            </header>

            <div className="space-y-4">
                {workouts.map(workout => {
                    const isExpanded = expandedWorkout === workout._id;
                    return (
                        <div key={workout._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                            {/* Cabecera de la Tarjeta (Clickable) */}
                            <button 
                                onClick={() => setExpandedWorkout(isExpanded ? null : workout._id)}
                                className="w-full text-left p-5 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-1">{workout.title}</h3>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(workout.dateAssigned).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {workout.exercises.length} Ejercicios</span>
                                    </div>
                                </div>
                                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDown className="text-gray-400" />
                                </div>
                            </button>

                            {/* Contenido Desplegable (Ejercicios) */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 bg-gray-50/50 p-4 space-y-6 animate-fade-in">
                                    {workout.exercises.map((item, idx) => (
                                        <ExerciseCard key={idx} item={item} index={idx} />
                                    ))}

                                    {/* BOTÓN FINALIZAR ENTRENAMIENTO */}
                                    <button 
                                        onClick={() => handleOpenFeedback(workout)}
                                        className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-primary-light transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
                                    >
                                        <CheckCircle size={24} />
                                        ¡He terminado por hoy!
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE FEEDBACK */}
            <FeedbackModal 
                isOpen={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                workoutId={selectedWorkoutForFeedback?._id}
                workoutTitle={selectedWorkoutForFeedback?.title}
                exercises={selectedWorkoutForFeedback?.exercises || []}
                onSaved={handleFeedbackSaved}
            />
        </div>
    );
};

const ExerciseCard = ({ item, index }) => {
    // Si hay imagen, mostramos imagen por defecto. Si no, intentamos mostrar video.
    const [showVideo, setShowVideo] = useState(!item.exercise?.image);
    
    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Media Area */}
            <div className="aspect-video w-full bg-gray-100 relative">
                {!showVideo && item.exercise?.image ? (
                    <div className="w-full h-full relative group">
                        <img 
                            src={getImageUrl(item.exercise.image)} 
                            alt={item.exercise.name} 
                            className="w-full h-full object-cover"
                        />
                        {item.exercise.videoUrl && (
                            <button 
                                onClick={() => setShowVideo(true)}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
                            >
                                <div className="bg-white/90 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                                     <PlayCircle size={40} className="text-brand-action" />
                                </div>
                            </button>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                             Portada
                        </div>
                    </div>
                ) : (
                    item.exercise?.videoUrl ? (
                        <iframe 
                            src={getEmbedUrl(item.exercise.videoUrl)} 
                            title={item.exercise.name}
                            className="w-full h-full" 
                            frameBorder="0" 
                            allowFullScreen
                        ></iframe>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                            <PlayCircle size={32} className="opacity-20" />
                            <span className="text-xs">Sin video disponible</span>
                        </div>
                    )
                )}
                
                {/* Botón para volver a ver portada si estamos viendo video y hay portada */}
                {showVideo && item.exercise?.image && (
                     <button 
                        onClick={() => setShowVideo(false)}
                        className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded hover:bg-black/70 transition-colors z-10"
                     >
                        Ver Portada
                     </button>
                )}
            </div>
            
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-brand-primary text-lg">
                        {index + 1}. {item.exercise?.name || "Ejercicio"}
                    </h4>
                    <span className="bg-brand-bg text-brand-text-muted text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                        {item.exercise?.category || "General"}
                    </span>
                </div>

                {/* Link explícito al video si se solicita "luego tenga enlace disponible" */}
                {item.exercise?.videoUrl && (
                    <div className="mb-3 text-right">
                         <a 
                            href={item.exercise.videoUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-brand-action hover:underline flex items-center justify-end gap-1"
                         >
                            Abrir video en YouTube
                            <PlayCircle size={12} />
                         </a>
                    </div>
                )}

                {/* Grid de Series/Repes */}
                <div className="flex gap-2 my-3">
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center flex-1 border border-gray-100">
                        <span className="block text-xs text-gray-400 uppercase font-bold">Series</span>
                        <span className="font-mono font-bold text-brand-text">{item.sets}</span>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center flex-1 border border-gray-100">
                        <span className="block text-xs text-gray-400 uppercase font-bold">Repes</span>
                        <span className="font-mono font-bold text-brand-text">{item.reps}</span>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center flex-1 border border-gray-100">
                        <span className="block text-xs text-gray-400 uppercase font-bold">Descanso</span>
                        <span className="font-mono font-bold text-brand-text">{item.rest}</span>
                    </div>
                </div>

                {/* Notas e Instrucciones */}
                <div className="space-y-2 text-sm">
                    {item.notes && (
                        <p className="text-brand-action bg-yellow-50 p-2 rounded border border-yellow-100 flex gap-2 items-start">
                            <Info size={16} className="shrink-0 mt-0.5" />
                            <span className="italic">"{item.notes}"</span>
                        </p>
                    )}
                    {item.exercise?.instructions && (
                        <p className="text-gray-600 leading-relaxed mt-2 text-xs">
                            {item.exercise.instructions}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MiPlan;

