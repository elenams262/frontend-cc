/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Search } from 'lucide-react';
import axios from 'axios';

const WorkoutBuilderModal = ({ isOpen, onClose, clientId, onWorkoutCreated }) => {
  const [title, setTitle] = useState('');
  const [exercisesList, setExercisesList] = useState([]); // Base de datos de ejercicios para elegir
  const [selectedExercises, setSelectedExercises] = useState([]); // Ejercicios añadidos a la rutina
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [templates, setTemplates] = useState([]); // Estado para plantillas

  // Cargar lista de ejercicios y PLANTILLAS disponibles al abrir
  useEffect(() => {
    if (isOpen) {
        const fetchData = async () => {
            try {
                const [exercisesRes, templatesRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/exercises'),
                    axios.get('http://localhost:5000/api/admin/templates')
                ]);
                setExercisesList(exercisesRes.data);
                setTemplates(templatesRes.data);
            } catch (error) {
                console.error("Error cargando datos:", error);
            }
        };
        fetchData();
    }
  }, [isOpen]);

  // Cargar plantilla seleccionada
  const handleLoadTemplate = async (templateId) => {
      const template = templates.find(t => t._id === templateId);
      if (!template) return;

      if (!confirm("⚠️ Esto reemplazará los ejercicios actuales. ¿Seguro?")) return;

      setTitle(template.title); // Copiar título
      
      // Mapear ejercicios de la plantilla al formato del builder
      const mappedExercises = template.exercises.map(ex => ({
          exercise: ex.exercise._id,
          name: ex.exercise.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          notes: ex.notes
      }));
      
      setSelectedExercises(mappedExercises);
  };

  // Añadir ejercicio a la rutina
  const addExercise = (exercise) => {
    setSelectedExercises([...selectedExercises, {
        exercise: exercise._id,
        name: exercise.name, // Para mostrarlo en UI
        sets: "3",
        reps: "10",
        rest: "60s",
        notes: ""
    }]);
    setSearchTerm(''); // Limpiar buscador tras elegir
  };

  // Quitar ejercicio
  const removeExercise = (index) => {
    const newList = [...selectedExercises];
    newList.splice(index, 1);
    setSelectedExercises(newList);
  };

  // Actualizar campo (series, reps...)
  const updateField = (index, field, value) => {
    const newList = [...selectedExercises];
    newList[index][field] = value;
    setSelectedExercises(newList);
  };

  // Guardar Rutina COMPLETA en Backend
  const handleSubmit = async () => {
    if (!title || selectedExercises.length === 0) {
        alert("Pon un título y al menos un ejercicio.");
        return;
    }

    setLoading(true);
    try {
        await axios.post('http://localhost:5000/api/admin/workouts', {
            clientId,
            title,
            exercises: selectedExercises.map(ex => ({
                exercise: ex.exercise,
                sets: ex.sets,
                reps: ex.reps,
                rest: ex.rest,
                notes: ex.notes
            }))
        });
        alert("✅ Rutina asignada con éxito");
        onWorkoutCreated();
        onClose();
        setTitle('');
        setSelectedExercises([]);
    } catch (error) {
        console.error(error);
        alert("Error al guardar rutina");
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Filtrar buscador
  const filteredLibrary = exercisesList.filter(ex => 
    (ex.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col animate-fade-in overflow-hidden">
        
        {/* Cabecera */}
        <div className="bg-brand-primary p-4 flex justify-between items-center text-white shrink-0">
            <h2 className="text-lg font-bold">Asignar Nueva Rutina</h2>
            <button onClick={onClose}><X size={24} /></button>
        </div>

        {/* Cuerpo (2 Columnas) */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* COL 1: CONSTRUCTOR (Izquierda) */}
            <div className="w-2/3 p-6 overflow-y-auto border-r border-gray-200">
                <div className="mb-6 flex justify-between items-end gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Rutina</label>
                        <input 
                            className="w-full text-xl font-bold p-2 border-b-2 border-brand-secondary focus:border-brand-action outline-none" 
                            placeholder="Ej: Fase 1 - Adaptación Anatómica"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </div>

                {/* BOTÓN CARGAR PLANTILLA - NUEVO */}
                <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex items-center justify-between">
                    <div>
                        <h5 className="font-bold text-gray-800 text-sm">¿Quieres usar una plantilla?</h5>
                        <p className="text-xs text-gray-500">Carga una estructura predefinida para ir más rápido.</p>
                    </div>
                     <select 
                        onChange={(e) => {
                            if (e.target.value) handleLoadTemplate(e.target.value);
                            e.target.value = ""; // Reset select
                        }}
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2.5"
                    >
                        <option value="">📂 Cargar Plantilla...</option>
                        {templates.map(t => (
                            <option key={t._id} value={t._id}>{t.title}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    {selectedExercises.map((item, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative group">
                            <button 
                                onClick={() => removeExercise(index)}
                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                            
                            <h4 className="font-bold text-brand-primary mb-3">{index + 1}. {item.name}</h4>
                            
                            <div className="grid grid-cols-4 gap-3 mb-2">
                                <div>
                                    <label className="text-xs text-gray-500">Series</label>
                                    <input className="w-full p-1 border rounded" value={item.sets} onChange={e => updateField(index, 'sets', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Repeticiones</label>
                                    <input className="w-full p-1 border rounded" value={item.reps} onChange={e => updateField(index, 'reps', e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Descanso</label>
                                    <input className="w-full p-1 border rounded" value={item.rest} onChange={e => updateField(index, 'rest', e.target.value)} />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs text-gray-500">Notas</label>
                                    <input className="w-full p-1 border rounded" placeholder="Opcional" value={item.notes} onChange={e => updateField(index, 'notes', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    ))}

                    {selectedExercises.length === 0 && (
                        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                            Busca y añade ejercicios desde el panel derecho 👉
                        </div>
                    )}
                </div>
            </div>

            {/* COL 2: BIBLIOTECA MINI (Derecha) */}
            <div className="w-1/3 bg-gray-50 p-4 flex flex-col border-l border-gray-200">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        className="w-full pl-9 p-2 rounded-lg border border-gray-300 text-sm"
                        placeholder="Buscar ejercicio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {filteredLibrary.map(ex => (
                        <button 
                            key={ex._id}
                            onClick={() => addExercise(ex)}
                            className="w-full text-left bg-white p-3 rounded-lg border border-gray-200 hover:border-brand-secondary hover:shadow-sm transition-all flex justify-between items-center group"
                        >
                            <div>
                                <p className="font-semibold text-sm text-gray-700">{ex.name || "Sin nombre"}</p>
                                <span className="text-[10px] bg-gray-100 px-2 rounded-full text-gray-500">{ex.category || "General"}</span>
                            </div>
                            <Plus size={16} className="text-brand-action opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50 shrink-0">
            <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-brand-action text-white px-8 py-3 rounded-lg hover:bg-yellow-600 font-bold shadow-sm flex items-center gap-2"
            >
                <Save size={20} />
                <span>{loading ? 'Guardando...' : 'Asignar Rutina'}</span>
            </button>
        </div>

      </div>
    </div>
  );
};

export default WorkoutBuilderModal;
