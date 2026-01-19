import { API_URL } from '../config/api';
/* eslint-disable react/prop-types */
import { X, Check } from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

const FeedbackModal = ({ isOpen, onClose, workoutId, workoutTitle, onSaved }) => {
    const [rpe, setRpe] = useState(5);
    const [comments, setComments] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post('${API_URL}/api/client/feedback', {
                workoutId,
                rpe,
                comments
            }, {
                headers: { 'x-auth-token': localStorage.getItem('token') }
            });
            onSaved(); // Notificar éxito
            onClose(); // Cerrar modal
        } catch (error) {
            console.error(error);
            alert("Error al guardar feedback");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-brand-primary">¡Entrenamiento Terminado! 🎉</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={24} /></button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">Has completado: <span className="font-bold">{workoutTitle}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            rows="3" 
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-secondary focus:border-transparent outline-none text-sm"
                            placeholder="¿Alguna molestia? ¿Peso fácil?"
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

