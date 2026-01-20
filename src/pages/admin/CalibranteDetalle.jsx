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

  // 2. Cargar Datos Pestañas
  const fetchEvaluations = async () => {
    try { const res = await axios.get(ROUTES.evaluations(id)); setEvaluations(res.data); } catch (e) { console.error(e); }
  };
  const fetchWorkouts = async () => {
    try { const res = await axios.get(ROUTES.workouts(id)); setWorkouts(res.data); } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (activeTab === 'lectura' && id) fetchEvaluations();
    if (activeTab === 'programa' && id) fetchWorkouts();
  }, [activeTab, id]);

  // Manejadores Evaluación
  const toggleZone = (zone) => {
    setEvalFormData(prev => {
        const zones = prev.priorityZones.includes(zone) ? prev.priorityZones.filter(z => z !== zone) : [...prev.priorityZones, zone];
        return { ...prev, priorityZones: zones };
    });
  };
  const handleEvalSubmit = async (e) => {
    e.preventDefault();
    try {
        await axios.post(ROUTES.createEvaluation, { clientId: id, ...evalFormData });
        alert("✅ Evaluación guardada");
        setShowEvalForm(false);
        setEvalFormData({ type: 'Seguimiento', priorityZones: [], focus: '', notes: '' });
        fetchEvaluations();
    } catch (e) { alert("Error al guardar"); }
  };

  // Manejador: Editar Usuario
  const handleUpdateUser = async () => {
      try {
          const res = await axios.put(`${API_URL}/api/admin/users/${id}`, editUserData);
          setUser(res.data);
          setIsEditingUser(false);
          alert("✅ Datos actualizados");
      } catch (err) { alert("Error al actualizar usuario"); }
  };

  // Manejador: Borrar Usuario
  const handleDeleteUser = async () => {
    if (!confirm("⚠️ ¿PELIGRO: Estás seguro de eliminar a este calibrante? Esta acción no se puede deshacer.")) return;
    const confirmName = prompt(`Escribe "${user.name}" para confirmar:`);
    if (confirmName !== user.name) return alert("Nombre incorrecto. No se ha eliminado.");

    try {
        await axios.delete(`${API_URL}/api/admin/users/${id}`);
        alert("Usuario eliminado correctamente.");
        navigate('/admin/calibrantes');
    } catch (err) { alert("Error al eliminar usuario"); }
  };

  const handleDeleteWorkout = async (workoutId) => {
    if(!confirm("¿Seguro que quieres eliminar esta rutina?")) return;
    try {
        await axios.delete(`${API_URL}/api/admin/workouts/${workoutId}`);
        fetchWorkouts();
    } catch (e) { alert("Error al eliminar rutina"); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando perfil...</div>;
  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Cabecera */}
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center space-x-4 w-full md:w-auto">
            <button onClick={() => navigate('/admin/calibrantes')} className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0">
                <ArrowLeft size={24} className="text-brand-primary" />
            </button>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-brand-primary">{user.name} {user.surname}</h1>
                <p className="text-gray-500 text-sm">Ficha de Calibrante</p>
            </div>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto md:ml-auto no-scrollbar">
            <button onClick={async () => {
                if(!confirm("¿Generar código de recuperación de contraseña?")) return;
                try {
                    const res = await axios.post(`${API_URL}/api/admin/users/${id}/recovery-code`);
                    alert(`Código generado: ${res.data.recoveryCode}\n\nEnvíalo al cliente para que pueda restablecer su contraseña.`);
                } catch(e) { alert("Error al generar código"); }
            }} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-yellow-200 rounded-lg text-sm font-bold text-yellow-600 hover:bg-yellow-50 shadow-sm transition-colors whitespace-nowrap">
                <AlertTriangle size={16} /> Recuperar Pass
            </button>
            <button onClick={() => { setEditUserData(user); setIsEditingUser(true); }} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors whitespace-nowrap">
                <Edit size={16} /> Editar Datos
            </button>
            <button onClick={handleDeleteUser} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-red-100 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 shadow-sm transition-colors whitespace-nowrap">
                <Trash2 size={16} /> Eliminar
            </button>
        </div>
      </div>

      {/* MODAL EDICIÓN USUARIO RAPIDO */}
      {isEditingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl animate-fade-in">
                <h3 className="text-lg font-bold mb-4">Editar Datos Personales</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-gray-500">Nombre</label><input className="w-full p-2 border rounded" value={editUserData.name || ''} onChange={(e) => setEditUserData({...editUserData, name: e.target.value})} /></div>
                        <div><label className="text-xs font-bold text-gray-500">Email</label><input className="w-full p-2 border rounded" value={editUserData.email || ''} onChange={(e) => setEditUserData({...editUserData, email: e.target.value})} /></div>
                    </div>
                     <div><label className="text-xs font-bold text-gray-500">Teléfono</label><input className="w-full p-2 border rounded" value={editUserData.phone || ''} onChange={(e) => setEditUserData({...editUserData, phone: e.target.value})} /></div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsEditingUser(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                        <button onClick={handleUpdateUser} className="px-6 py-2 bg-brand-primary text-white rounded-lg font-bold hover:bg-brand-primary-light">Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
        {/* Pestañas */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
            <TabButton active={activeTab === 'datos'} onClick={() => setActiveTab('datos')} icon={<User size={18} />} label="Datos Personales" />
            <TabButton active={activeTab === 'lectura'} onClick={() => setActiveTab('lectura')} icon={<Activity size={18} />} label="Lectura Corporal" />
            <TabButton active={activeTab === 'programa'} onClick={() => setActiveTab('programa')} icon={<ClipboardList size={18} />} label="Programa" />
            <TabButton active={activeTab === 'progreso'} onClick={() => setActiveTab('progreso')} icon={<Activity size={18} />} label="Progreso" /> {/* Nueva Pestaña */}
            <TabButton active={activeTab === 'notas'} onClick={() => setActiveTab('notas')} icon={<FileText size={18} />} label="Notas Internas" />
        </div>

        <div className="p-8">
            {/* PESTAÑA DATOS (Sin Cambios) */}
            {activeTab === 'datos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h3 className="text-sm uppercase text-gray-400 font-bold mb-6 tracking-wider">Información de Contacto</h3>
                        <div className="space-y-6">
                            <InfoItem label="Nombre Completo" value={`${user.name} ${user.surname}`} />
                            <InfoItem label="Email" value={user.email} />
                            <InfoItem label="Teléfono" value={user.phone || "-"} />
                            <InfoItem label="Estado" value={user.profile?.status || "Activo"} badge />
                            {user.inviteCode && (
                                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mt-2">
                                     <p className="text-[10px] text-yellow-700 font-bold uppercase mb-1">⚠️ Cuenta Pendiente de Activar</p>
                                     <div className="flex justify-between items-center">
                                        <code className="font-mono font-bold text-lg text-brand-primary bg-white px-2 py-1 rounded border border-yellow-100">{user.inviteCode}</code>
                                        <span className="text-xs text-yellow-600">Código de Invitación</span>
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm uppercase text-gray-400 font-bold mb-6 tracking-wider">Perfil Inicial</h3>
                        <div className="space-y-6">
                            <InfoItem label="Objetivo Principal" value={user.profile?.objectives?.[0]} />
                            <InfoItem label="Limitaciones / Dolor" value={user.profile?.limitations?.join(", ") || "Ninguna"} alert={user.profile?.limitations?.length > 0} />
                        </div>
                    </div>
                </div>
            )}

            {/* PESTAÑA LECTURA CORPORAL (Sin Cambios sustanciales) */}
            {activeTab === 'lectura' && (
                <div className="space-y-8">
                    {!showEvalForm ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-brand-primary">Historial de Evaluaciones</h2>
                                <button onClick={() => setShowEvalForm(true)} className="flex items-center space-x-2 bg-brand-action text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm">
                                    <Plus size={18} /><span>Nueva Lectura</span>
                                </button>
                            </div>
                            {evaluations.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <Activity size={40} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">No hay lecturas registradas aún.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {evaluations.map(eva => (
                                        <div key={eva._id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="bg-brand-bg-light p-2 rounded-full text-brand-primary"><Calendar size={18} /></div>
                                                    <div><p className="font-bold text-gray-800">{new Date(eva.date).toLocaleDateString()}</p><p className="text-xs text-gray-500 uppercase">{eva.type}</p></div>
                                                </div>
                                                <span className="bg-brand-secondary text-white px-3 py-1 rounded-full text-xs font-medium">{eva.focus || "Sin enfoque"}</span>
                                            </div>
                                            <div className="pl-12 space-y-2">
                                                <p className="text-sm text-gray-600"><span className="font-semibold">Zonas:</span> {eva.priorityZones.join(", ") || "-"}</p>
                                                {eva.notes && <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 italic border-l-4 border-gray-300">"{eva.notes}"</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        // Formulario de Evaluación (Mantenido igual al código anterior por brevedad, asumiendo que funciona)
                        <div className="max-w-3xl mx-auto bg-gray-50 p-6 rounded-xl border border-gray-200">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-brand-primary">Nueva Lectura Corporal</h3>
                                <button onClick={() => setShowEvalForm(false)} className="text-gray-500 hover:text-red-500"><X size={24} /></button>
                            </div>
                            <form onSubmit={handleEvalSubmit} className="space-y-6">
                                {/* ... [Formulario igual que antes] ... */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label><select className="w-full p-2 border rounded-lg" value={evalFormData.type} onChange={e => setEvalFormData({...evalFormData, type: e.target.value})}><option>Inicial</option><option>Re-evaluación</option><option>Seguimiento</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Enfoque</label><select className="w-full p-2 border rounded-lg" value={evalFormData.focus} onChange={e => setEvalFormData({...evalFormData, focus: e.target.value})}><option value="">Selecciona...</option>{FOCUS_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
                                </div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Zonas</label><div className="grid grid-cols-3 gap-2">{ZONES.map(z => <button key={z} type="button" onClick={() => toggleZone(z)} className={`py-2 px-3 rounded-lg text-sm border ${evalFormData.priorityZones.includes(z) ? 'bg-brand-primary text-white' : 'bg-white'}`}>{z}</button>)}</div></div>
                                <div><label className="block text-sm font-medium text-gray-700 mb-2">Notas</label><textarea className="w-full p-3 border rounded-lg h-24" value={evalFormData.notes} onChange={e => setEvalFormData({...evalFormData, notes: e.target.value})} /></div>
                                <div className="flex justify-end pt-4"><button type="submit" className="bg-brand-action text-white px-6 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"><Save size={18} /><span>Guardar</span></button></div>
                            </form>
                        </div>
                    )}
                </div>
            )}


            {/* PESTAÑA PROGRAMA */}
            {activeTab === 'programa' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-brand-primary">Programación Semanal</h2>
                            <p className="text-sm text-gray-500">Historial de rutinas asignadas.</p>
                        </div>
                        <button onClick={() => setShowWorkoutModal(true)} className="flex items-center space-x-2 bg-brand-action text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm">
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
                                                 {/* Botón Borrar Rutina (con stopPropagation para no abrir/cerrar plegable) */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteWorkout(workout._id); }} 
                                                    className="p-2 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all"
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

            {/* PESTAÑA PROGRESO (FEEDBACK) */}
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

