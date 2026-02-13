import { API_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, PlayCircle, Clock, Info, CheckCircle, Save, Check } from 'lucide-react';
import axios from 'axios';
import FeedbackModal from '../../components/FeedbackModal';
import { getImageUrl } from '../../utils/imageUtils';

const MiPlan = () => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Nuevo estado de error
    const [expandedWorkout, setExpandedWorkout] = useState(null);

    const [todaysFeedback, setTodaysFeedback] = useState({}); // Map: workoutId -> feedbackDoc

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Obtener Workouts
                const resWorkouts = await axios.get(`${API_URL}/api/client/workouts`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                const workoutsData = Array.isArray(resWorkouts.data) ? resWorkouts.data : [];
                setWorkouts(workoutsData);
                if (workoutsData.length > 0) setExpandedWorkout(workoutsData[0]._id);

                // 2. Obtener Feedback Histórico y filtrar por HOY
                const resFeedback = await axios.get(`${API_URL}/api/client/feedback`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                
                const today = new Date().toDateString();
                const feedbackMap = {};
                
                resFeedback.data.forEach(fb => {
                    const fbDate = new Date(fb.date).toDateString();
                    if (fbDate === today && fb.workout) {
                        // fb.workout can be populated object or ID string
                        const workoutId = fb.workout._id || fb.workout;
                        if (workoutId) {
                            feedbackMap[workoutId] = fb; 
                        }
                    }
                });
                setTodaysFeedback(feedbackMap);

            } catch (error) {
                console.error("Error cargando datos:", error);
                setError(error.message || "Error desconocido");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleFeedbackUpdate = (workoutId, data) => {
        setTodaysFeedback(prev => {
            const workoutFeedback = prev[workoutId] || { exercisesData: [] };
            const existingIndex = workoutFeedback.exercisesData.findIndex(ex => ex.exerciseId === data.exerciseId);
            
            let newExercisesData = [...(workoutFeedback.exercisesData || [])];
            if (existingIndex > -1) {
                newExercisesData[existingIndex] = { ...newExercisesData[existingIndex], ...data };
            } else {
                newExercisesData.push(data);
            }
            
            return {
                ...prev,
                [workoutId]: { ...workoutFeedback, exercisesData: newExercisesData }
            };
        });
    };

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
                            <div className={`border-t border-gray-100 bg-gray-50/50 p-4 space-y-6 animate-fade-in ${isExpanded ? 'block' : 'hidden'}`}>
                                {workout.exercises.map((item, idx) => {
                                    const feedbackForWorkout = todaysFeedback[workout._id];
                                    const exerciseFeedback = feedbackForWorkout?.exercisesData?.find(
                                        ex => ex.exerciseId === item.exercise?._id
                                    );
                                    
                                    return (
                                        <ExerciseCard 
                                            key={idx} 
                                            item={item} 
                                            index={idx} 
                                            workoutId={workout._id} 
                                            initialData={exerciseFeedback}
                                            onFeedbackUpdate={(data) => handleFeedbackUpdate(workout._id, data)}
                                        />
                                    );
                                })}

                                {/* BOTÓN FINALIZAR ENTRENAMIENTO */}
                                <button 
                                    onClick={() => handleOpenFeedback(workout)}
                                    className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-primary-light transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
                                >
                                    <CheckCircle size={24} />
                                    ¡He terminado por hoy!
                                </button>
                            </div>
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
                feedbackData={todaysFeedback[selectedWorkoutForFeedback?._id]}
                onSaved={handleFeedbackSaved}
            />
        </div>
    );
};

const ExerciseCard = ({ item, index, workoutId, initialData, onFeedbackUpdate }) => {
    // Si hay imagen, mostramos imagen por defecto. Si no, intentamos mostrar video.
    const [showVideo, setShowVideo] = useState(!item.exercise?.image);
    
    // Estados locales para feedback inmediato
    const [weight, setWeight] = useState('');
    const [rpe, setRpe] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        if (initialData) {
            setWeight(initialData.weightUsed || '');
            setRpe(initialData.rpe || '');
            setNotes(initialData.notes || '');
        }
    }, [initialData]);

    const handleSave = async () => {
        if (!weight && !rpe && !notes) return; // Nada que guardar

        setSaving(true);
        try {
            await axios.post(`${API_URL}/api/client/feedback`, {
                workoutId,
                exercisesData: [{
                    exerciseId: item.exercise?._id,
                    exerciseName: item.exercise?.name,
                    weightUsed: weight,
                    rpe: rpe ? Number(rpe) : undefined,
                    notes: notes
                }]
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            
            // Notificar al padre para actualizar estado global (por si abren modal o colapsan)
            if (onFeedbackUpdate) {
                onFeedbackUpdate({
                    exerciseId: item.exercise?._id,
                    weightUsed: weight,
                    rpe: rpe ? Number(rpe) : undefined,
                    notes: notes
                });
            }

        } catch (error) {
            console.error("Error saving exercise feedback:", error);
            alert("No se pudo guardar. Intenta de nuevo.");
        } finally {
            setSaving(false);
        }
    };
    
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

                 {/* *** NUEVO: AREA DE REGISTRO *** */}
                 <div className="mt-4 bg-brand-bg/30 p-3 rounded-lg border border-brand-bg">
                    <div className="flex justify-between items-center mb-2">
                         <h5 className="font-bold text-xs text-brand-primary uppercase tracking-wide">Registro de Ejecución</h5>
                         {saved && <span className="text-green-600 text-[10px] font-bold flex items-center gap-1 animate-fade-in"><Check size={12} /> Guardado</span>}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                             <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Carga</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 20kg" 
                                    className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                />
                             </div>
                             <div className="w-20">
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">RPE (1-10)</label>
                                <input 
                                    type="number" 
                                    min="1" max="10" 
                                    className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    value={rpe}
                                    onChange={(e) => setRpe(e.target.value)}
                                />
                             </div>
                        </div>
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Notas / Sensaciones</label>
                                <input 
                                    type="text"
                                    placeholder="Notas opcionales..."
                                    className="w-full text-sm p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-brand-primary outline-none"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-brand-primary text-white p-2 rounded-lg hover:bg-brand-primary-light transition-colors flex items-center justify-center disabled:opacity-50 h-[38px] w-[38px] shrink-0"
                                title="Guardar Progreso"
                            >
                                {saving ? <span className="animate-spin text-xs">...</span> : <Save size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notas e Instrucciones */}
                <div className="space-y-2 text-sm mt-3">
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

