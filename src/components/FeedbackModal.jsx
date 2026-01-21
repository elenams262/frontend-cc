import { API_URL } from '../config/api';
/* eslint-disable react/prop-types */
import { X, Check } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const FeedbackModal = ({ isOpen, onClose, workoutId, workoutTitle, exercises = [], onSaved }) => {
    const [rpe, setRpe] = useState(5);
    const [comments, setComments] = useState('');
    const [saving, setSaving] = useState(false);
    // Estado para guardar el peso de cada ejercicio. Key: exerciseId, Value: weight
    const [weights, setWeights] = useState({});

    if (!isOpen) return null;

    const handleWeightChange = (exerciseId, value) => {
        setWeights(prev => ({ ...prev, [exerciseId]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        // Preparamos el array de ejercicios para guardar
        const exercisesData = exercises.map(item => ({
            exerciseId: item.exercise?._id,
            exerciseName: item.exercise?.name,
            weightUsed: weights[item.exercise?._id] || ''
        }));

        try {
            await axios.post(`${API_URL}/api/client/feedback`, {
                workoutId,
                rpe,
                comments,
                exercisesData // Enviamos los pesos
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            onSaved(); 
            onClose(); 
        } catch (error) {
            console.error(error);
            alert("Error al guardar feedback");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 my-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-brand-primary">¡Entrenamiento Terminado! 🎉</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 font-medium">Completa los datos de: <span className="font-bold text-brand-secondary">{workoutTitle}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Registro de Cargas (Iteramos sobre los ejercicios de la rutina) */}
                    {exercises.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="font-bold text-sm text-brand-primary mb-3">Registro de Cargas (Opcional)</h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {exercises.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                                        <span className="font-medium text-gray-700 flex-1">{item.exercise?.name || "Ejercicio"}</span>
                                        <input 
                                            type="text" 
                                            placeholder="Ej: 20kg"
                                            className="w-full sm:w-24 p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-secondary outline-none bg-white"
                                            value={weights[item?.exercise?._id] || ''}
                                            onChange={(e) => item?.exercise?._id && handleWeightChange(item.exercise._id, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RPE Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-bold text-gray-700">Esfuerzo (RPE)</label>
                            <span className={`text-lg font-bold px-3 py-1 rounded bg-brand-bg ${rpe > 7 ? 'text-red-500' : 'text-brand-primary'}`}>{rpe}/10</span>
                        </div>
                        <input 
                            type="range" min="1" max="10" step="1" 
                            value={rpe} onChange={(e) => setRpe(parseInt(e.target.value))}
                            className="w-full accent-brand-action h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                            <span>Muy Fácil</span>
                            <span>Mortal</span>
                        </div>
                    </div>

                    {/* Comentarios */}
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">Notas / Sensaciones</label>
                        <textarea 
                            rows="2" 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none text-sm"
                            placeholder="¿Alguna molestia?"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={saving}
                        className="w-full bg-brand-primary text-white py-3 rounded-xl font-bold hover:bg-brand-primary-light transition-colors flex justify-center items-center gap-2"
                    >
                        {saving ? 'Guardando...' : <><Check size={20} /> Guardar Progreso</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
