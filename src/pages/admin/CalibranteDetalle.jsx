import { API_URL } from '../../config/api';
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, Activity, ClipboardList, AlertTriangle, Plus, X, Save, Calendar, Clock, Dumbbell, ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';
import axios from 'axios';
import WorkoutBuilderModal from '../../components/WorkoutBuilderModal';

const ROUTES = {
    user: (id) => `${API_URL}/api/admin/users/${id}`,
    evaluations: (id) => `${API_URL}/api/admin/evaluations/${id}`,
    createEvaluation: `${API_URL}/api/admin/evaluations`,
    workouts: (id) => `${API_URL}/api/admin/workouts/client/${id}`
};

const ZONES = ["Hombro", "Raquis", "Cadera", "Rodilla", "Tobillo", "Core", "Pie", "Codo", "Muñeca"];
const FOCUS_OPTIONS = ["Fuerza máxima", "Hipertrofia", "Movilidad", "Control motor", "Integración", "Rendimiento", "Readaptación"];

const CalibranteDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('datos');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados Lectura Corporal
  const [evaluations, setEvaluations] = useState([]);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [evalFormData, setEvalFormData] = useState({ type: 'Seguimiento', priorityZones: [], focus: '', notes: '' });
  
  // Estado Edición de Usuario
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserData, setEditUserData] = useState({});

  // Estados Programa (Rutinas)
  const [workouts, setWorkouts] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState(null); // Para acordeón de rutinas
  const [workoutToEdit, setWorkoutToEdit] = useState(null); // NUEVO: Estado para la rutina que se va a editar

  // ... (otros efectos)

  // 1. Cargar Usuario
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await axios.get(ROUTES.user(id));
            setUser(res.data);
        } catch (error) {
            console.error("Error al cargar ficha:", error);
            alert("Error al cargar el usuario.");
            navigate('/admin/calibrantes');
        } finally {
            setLoading(false);
        }
    };
    if (id) fetchUser();
  }, [id]);

  // ... (otros efectos)

  // Funciones para abrir modal
  const openCreateWorkoutModal = () => {
    setWorkoutToEdit(null); // Limpiamos para que sea una nueva rutina
    setShowWorkoutModal(true);
  };

  const openEditWorkoutModal = (workout, e) => {
    e.stopPropagation(); // Evitamos que se abra/cierre el acordeón
    setWorkoutToEdit(workout); // Pasamos la rutina a editar
    setShowWorkoutModal(true);
  };

  // ... (renders)

            {/* PESTAÑA PROGRAMA */}
            {activeTab === 'programa' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-brand-primary">Programación Semanal</h2>
                            <p className="text-sm text-gray-500">Historial de rutinas asignadas.</p>
                        </div>
                        <button onClick={openCreateWorkoutModal} className="flex items-center space-x-2 bg-brand-action text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm">
                            <Plus size={18} /><span>Asignar Rutina</span>
                        </button>
                    </div>

                    {workouts.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <Dumbbell size={40} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No hay rutinas asignadas. ¡Crea la primera!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {workouts.map(workout => {
                                const isExpanded = expandedWorkout === workout._id;
                                return (
                                    <div key={workout._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        {/* Cabecera Tarjeta */}
                                        <div 
                                            className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => setExpandedWorkout(isExpanded ? null : workout._id)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="bg-brand-bg-light p-2 rounded-lg text-brand-primary">
                                                    <ClipboardList size={22} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800">{workout.title}</h3>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Calendar size={12} /> {new Date(workout.dateAssigned).toLocaleDateString()}
                                                        <span className="mx-1">•</span> {workout.exercises.length} Ejercicios
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                 {/* Botón Editar Rutina */}
                                                 <button 
                                                    onClick={(e) => openEditWorkoutModal(workout, e)} 
                                                    className="p-2 text-gray-400 hover:text-brand-primary rounded-full hover:bg-gray-100 transition-all"
                                                    title="Editar Rutina"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                 {/* Botón Borrar Rutina */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(workout._id); }} 
                                                    className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                            </div>
                                        </div>

                                        {/* Detalle Desplegable */}
                                        {isExpanded && (
                                            <div className="border-t border-gray-100 bg-gray-50 p-5">
                                                <div className="space-y-3">
                                                    {workout.exercises.map((exItem, idx) => (
                                                        <div key={idx} className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center">
                                                            <div className="flex items-center gap-3">
                                                                <span className="bg-gray-100 text-gray-500 px-2 rounded font-bold text-sm">#{idx+1}</span>
                                                                <div>
                                                                    <p className="font-semibold text-brand-primary">{exItem.exercise?.name || "Ejercicio eliminado"}</p>
                                                                    {exItem.notes && <p className="text-xs text-gray-500 italic">"{exItem.notes}"</p>}
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-4 text-sm text-gray-600">
                                                                <div className="text-center"><p className="font-bold">{exItem.sets}</p><p className="text-[10px] text-gray-400 uppercase">Series</p></div>
                                                                <div className="text-center"><p className="font-bold">{exItem.reps}</p><p className="text-[10px] text-gray-400 uppercase">Repes</p></div>
                                                                <div className="text-center"><p className="font-bold">{exItem.rest}</p><p className="text-[10px] text-gray-400 uppercase">Desc</p></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* PESTAÑA PROGRESO (FEEDBACK) ... */}
            {activeTab === 'progreso' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-brand-primary mb-4">Registro de Actividad</h2>
                    <FeedbackList clientId={id} />
                </div>
            )}


             {activeTab === 'notas' && (
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-brand-primary mb-4">Notas Internas</h2>
                    <NotesSection clientId={id} />
                </div>
            )}
        </div>
      </div>

      {/* MODAL DE RUTINAS */}
      <WorkoutBuilderModal 
        isOpen={showWorkoutModal} 
        onClose={() => setShowWorkoutModal(false)}
        clientId={id}
        onWorkoutCreated={fetchWorkouts}
        workoutToEdit={workoutToEdit} // Pasamos la prop de edición
      />
    </div>
  );
};

// Componente para listar Feedback
const FeedbackList = ({ clientId }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/admin/feedback/${clientId}`);
                setLogs(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [clientId]);

    if (loading) return <p className="text-gray-400">Cargando actividad...</p>;
    if (logs.length === 0) return <div className="p-8 bg-gray-50 text-center rounded-lg text-gray-500">Aún no hay actividad registrada.</div>;

    return (
        <div className="space-y-4">
            {logs.map(log => (
                <div key={log._id} className="bg-white border-l-4 border-brand-secondary p-4 rounded shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-bold text-gray-800">{log.workout?.title || "Rutina Eliminada"}</h4>
                            <p className="text-xs text-gray-500">{new Date(log.date).toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded font-bold text-sm ${log.rpe > 8 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                            RPE: {log.rpe}/10
                        </div>
                    </div>
                    {log.comments && (
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 mt-2 italic">
                            "{log.comments}"
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Componente para Notas Internas
const NotesSection = ({ clientId }) => {
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingNote, setEditingNote] = useState(null); // Estado para editar

    const fetchNotes = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/notes/${clientId}`);
            setNotes(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, [clientId]);

    const handleSaveNote = async (e) => {
        e.preventDefault();
        const contentToSave = editingNote ? editingNote.content : newNote;
        if(!contentToSave.trim()) return;

        try {
            if (editingNote) {
                // Modo Edición
                await axios.put(`${API_URL}/api/admin/notes/${editingNote._id}`, {
                    content: contentToSave
                });
                setEditingNote(null);
            } else {
                // Modo Creación
                await axios.post(`${API_URL}/api/admin/notes`, {
                    clientId, content: newNote
                });
                setNewNote('');
            }
            fetchNotes(); 
        } catch (err) { alert("Error al guardar nota"); }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm("¿Borrar esta nota?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/notes/${noteId}`);
            fetchNotes();
        } catch (err) { alert("Error al borrar nota"); }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Formulario Nueva Nota / Editando */}
            <div className="md:col-span-1">
                <div className={`p-4 rounded-xl shadow-sm border sticky top-4 ${editingNote ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                    <h3 className="font-bold text-gray-700 mb-3">{editingNote ? '✏️ Editando Nota' : 'Nueva Nota'}</h3>
                    <form onSubmit={handleSaveNote}>
                        <textarea
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none mb-3"
                            rows="6"
                            placeholder="Escribe aquí observaciones privadas..."
                            value={editingNote ? editingNote.content : newNote}
                            onChange={(e) => editingNote ? setEditingNote({ ...editingNote, content: e.target.value }) : setNewNote(e.target.value)}
                        ></textarea>
                        
                        <div className="flex gap-2">
                             <button type="submit" className="flex-1 bg-brand-primary text-white py-2 rounded-lg font-bold hover:bg-brand-primary-light transition-colors">
                                {editingNote ? 'Actualizar' : 'Guardar Nota'}
                            </button>
                            {editingNote && (
                                <button type="button" onClick={() => setEditingNote(null)} className="px-3 bg-gray-200 text-gray-600 rounded-lg font-bold hover:bg-gray-300">
                                    X
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Lista de Notas */}
            <div className="md:col-span-2 space-y-4">
                {loading ? <p className="text-gray-400">Cargando notas...</p> : notes.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No hay notas registradas.</p>
                    </div>
                ) : (
                    notes.map(note => (
                        <div key={note._id} className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg shadow-sm relative group">
                             {/* Botones de acción (ocultos hasta hover) */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1">
                                <button onClick={() => setEditingNote(note)} className="p-1 text-gray-400 hover:text-brand-primary"><Edit size={14} /></button>
                                <button onClick={() => handleDeleteNote(note._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>

                            <p className="text-gray-800 whitespace-pre-line text-sm pr-6">{note.content}</p>
                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                                {new Date(note.date).toLocaleString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};


// Componentes Auxiliares
const TabButton = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center space-x-2 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap px-4 ${active ? 'border-brand-primary text-brand-primary bg-white shadow-sm' : 'border-transparent text-gray-500 hover:text-brand-primary hover:bg-gray-100'}`}>
        {icon}<span>{label}</span>
    </button>
);
const InfoItem = ({ label, value, badge, alert }) => (
    <div className="border-b border-gray-100 pb-3"><p className="text-xs text-gray-500 mb-1 font-medium">{label}</p><div className={`text-base ${alert ? 'text-red-600 flex items-center gap-2 font-semibold' : 'text-brand-text'}`}>{alert && <AlertTriangle size={18} />}{badge ? <span className="bg-brand-bg px-3 py-1 rounded-full text-xs font-semibold text-brand-primary">{value}</span> : ( value || "-" )}</div></div>
);

export default CalibranteDetalle;

