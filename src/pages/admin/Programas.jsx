import { API_URL } from '../../config/api';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Search, ChevronRight, Dumbbell, Pencil } from 'lucide-react';
import axios from 'axios';

// Modal Simplificado para Crear/Editar Plantillas
const TemplateBuilderModal = ({ isOpen, onClose, onTemplateCreated, templateToEdit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [exercisesList, setExercisesList] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para configuración de cada ejercicio añadido
    const [configs, setConfigs] = useState({});

    // Cargar librería de ejercicios y rellenar datos si es edición
    useEffect(() => {
        if (isOpen) {
            // 1. Cargar ejercicios
            const fetchExercises = async () => {
                try {
                    const res = await axios.get('${API_URL}/api/admin/exercises');
                    setExercisesList(res.data);
                } catch (err) { console.error(err); }
            };
            fetchExercises();

            // 2. Rellenar datos si estamos editando
            if (templateToEdit) {
                setTitle(templateToEdit.title);
                setDescription(templateToEdit.description || '');
                
                const initialSelected = [];
                const initialConfigs = {};

                templateToEdit.exercises.forEach(item => {
                    // item.exercise es el objeto populado
                    if (item.exercise) {
                        initialSelected.push(item.exercise);
                        initialConfigs[item.exercise._id] = {
                            sets: item.sets || '3',
                            reps: item.reps || '10-12',
                            rest: item.rest || '60s',
                            notes: item.notes || ''
                        };
                    }
                });
                setSelectedExercises(initialSelected);
                setConfigs(initialConfigs);
            } else {
                // Resetear si es nuevo
                setTitle('');
                setDescription('');
                setSelectedExercises([]);
                setConfigs({});
                setSearchTerm('');
            }
        }
    }, [isOpen, templateToEdit]);

    const handleAddExercise = (exercise) => {
        // Evitar duplicados visuales si se quiere, o permitir (aquí permitimos pero seria raro configs duplicadas por ID, mejor check)
        if (selectedExercises.find(ex => ex._id === exercise._id)) {
            return alert("Este ejercicio ya está añadido. Ajusta sus series/repes.");
        }

        setSelectedExercises([...selectedExercises, exercise]);
        setConfigs({
            ...configs,
            [exercise._id]: { sets: '3', reps: '10-12', rest: '60s', notes: '' } // Valores por defecto
        });
    };

    const handleRemoveExercise = (index) => {
        const exerciseToRemove = selectedExercises[index];
        const newSelected = [...selectedExercises];
        newSelected.splice(index, 1);
        setSelectedExercises(newSelected);
        
        // Opcional: limpiar config (no estrictamente necesario pero limpio)
        const newConfigs = { ...configs };
        delete newConfigs[exerciseToRemove._id];
        setConfigs(newConfigs);
    };

    const handleConfigChange = (exId, field, value) => {
        setConfigs({
            ...configs,
            [exId]: { ...configs[exId], [field]: value }
        });
    };

    const handleSubmit = async () => {
        if (!title.trim() || selectedExercises.length === 0) return alert("Pon un título y elige ejercicios");

        // Preparar payload
        const finalExercises = selectedExercises.map(ex => ({
            exercise: ex._id,
            ...configs[ex._id]
        }));

        const payload = {
            title,
            description,
            exercises: finalExercises
        };

        try {
            if (templateToEdit) {
                // Editar
                await axios.put(`${API_URL}/api/admin/templates/${templateToEdit._id}`, payload);
            } else {
                // Crear
                await axios.post('${API_URL}/api/admin/templates', payload);
            }
            
            onTemplateCreated();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error al guardar plantilla");
        }
    };

    if (!isOpen) return null;

    // Filtrar ejercicios
    const filteredExercises = exercisesList.filter(ex => 
        (ex.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (ex.category || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl">
                
                {/* IZQUIERDA: Buscador */}
                <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <h3 className="font-bold text-gray-700 mb-2">Biblioteca de Ejercicios</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Buscar ejercicio..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredExercises.map(ex => (
                            <div key={ex._id} className="bg-white p-3 rounded-lg border border-gray-100 hover:border-brand-primary cursor-pointer group transition-all" onClick={() => handleAddExercise(ex)}>
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{ex.name || "Sin nombre"}</span>
                                    <Plus size={16} className="text-gray-400 group-hover:text-brand-primary" />
                                </div>
                                <span className="text-xs text-brand-text-muted uppercase font-bold tracking-wider">{ex.category || "General"}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* DERECHA: Constructor */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                        <div className="w-full mr-8 space-y-3">
                            <input 
                                type="text" 
                                placeholder="Nombre de la Plantilla (ej: Fuerza Nivel 1)"
                                className="text-2xl font-bold text-gray-800 placeholder-gray-300 outline-none w-full border-b border-transparent hover:border-gray-200 focus:border-brand-primary transition-colors"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                             <input 
                                type="text" 
                                placeholder="Descripción breve (opcional)"
                                className="text-sm text-gray-600 w-full outline-none"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                        {selectedExercises.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                <Dumbbell size={48} className="mb-4 opacity-50" />
                                <p>Selecciona ejercicios de la izquierda para construir la plantilla</p>
                            </div>
                        ) : (
                            selectedExercises.map((ex, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4 items-start animate-fade-in group">
                                    <span className="bg-brand-bg text-brand-primary font-bold w-8 h-8 flex items-center justify-center rounded-lg mt-1">{idx + 1}</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 mb-2">{ex.name || "Ejercicio"}</h4>
                                        <div className="grid grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Series</label>
                                                <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-mono text-sm" 
                                                    value={configs[ex._id]?.sets || ''} onChange={(e) => handleConfigChange(ex._id, 'sets', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Repes</label>
                                                <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-mono text-sm" 
                                                     value={configs[ex._id]?.reps || ''} onChange={(e) => handleConfigChange(ex._id, 'reps', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Descanso</label>
                                                <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-center font-mono text-sm" 
                                                     value={configs[ex._id]?.rest || ''} onChange={(e) => handleConfigChange(ex._id, 'rest', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Notas</label>
                                                <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm" placeholder="Opcional..."
                                                     value={configs[ex._id]?.notes || ''} onChange={(e) => handleConfigChange(ex._id, 'notes', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveExercise(idx)} className="text-gray-300 hover:text-red-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button onClick={handleSubmit} className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-brand-primary-light transition-colors shadow-lg flex justify-center items-center gap-2">
                            <Save size={20} /> {templateToEdit ? "Guardar Cambios" : "Guardar Plantilla"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente Principal de la Página
const Programas = () => {
    const [templates, setTemplates] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const fetchTemplates = async () => {
        try {
            const res = await axios.get('${API_URL}/api/admin/templates');
            setTemplates(res.data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTemplates(); }, []);

    const handleCreate = () => {
        setEditingTemplate(null);
        setShowModal(true);
    };

    const handleEdit = (tpl) => {
        setEditingTemplate(tpl);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta plantilla?")) return;
        try {
            await axios.delete(`${API_URL}/api/admin/templates/${id}`);
            fetchTemplates();
        } catch (err) {
            console.error(err);
            alert("Error al eliminar");
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mis Plantillas</h1>
                    <p className="text-gray-500">Crea modelos de rutina para reutilizar.</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-lg hover:bg-brand-primary-light transition-colors shadow-md font-medium"
                >
                    <Plus size={20} /> Nueva Plantilla
                </button>
            </header>

            {loading ? <p className="text-center text-gray-400 py-10">Cargando plantillas...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(tpl => (
                        <div key={tpl._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative">
                            <div className="flex justify-between items-start mb-3">
                                <div className="bg-brand-bg text-brand-primary p-3 rounded-lg group-hover:scale-105 transition-transform">
                                    <Dumbbell size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleEdit(tpl)}
                                        className="p-2 text-gray-400 hover:text-brand-primary hover:bg-gray-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(tpl._id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 mb-1">{tpl.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tpl.description || "Sin descripción"}</p>
                            
                            <div className="border-t border-gray-50 pt-3 flex justify-between items-center text-xs text-gray-400 uppercase font-bold tracking-wider">
                                <span>{tpl.exercises?.length || 0} Ejercicios</span>
                                <span className="flex items-center gap-1 hover:text-brand-primary cursor-pointer">Ver detalle <ChevronRight size={14} /></span>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            No tienes ninguna plantilla creada. ¡Dale al botón de arriba! 👆
                        </div>
                    )}
                </div>
            )}

            <TemplateBuilderModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                onTemplateCreated={fetchTemplates}
                templateToEdit={editingTemplate}
            />
        </div>
    );
};

export default Programas;

