import { API_URL } from '../config/api';
import { useState, useRef } from 'react';
import { X, Save, Video, Tag, Image } from 'lucide-react';
import axios from 'axios';

const CATEGORIES = ["Movilidad", "Fuerza", "Respiración", "Activación", "Estiramiento", "Cardio"];

const NewExerciseModal = ({ isOpen, onClose, onExerciseCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Movilidad',
    videoUrl: '',
    instructions: '',
    tags: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('videoUrl', formData.videoUrl);
      data.append('instructions', formData.instructions);
      
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      tagsArray.forEach(tag => data.append('tags', tag));

      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post(`${API_URL}/api/admin/exercises`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("✅ Ejercicio añadido");
      onExerciseCreated();
      onClose();
      setFormData({ name: '', category: 'Movilidad', videoUrl: '', instructions: '', tags: '' });
      setImageFile(null);
    } catch (error) {
      console.error(error);
      alert("Error al guardar ejercicio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
        <div className="bg-brand-primary p-4 flex justify-between items-center text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Video size={20} /> Nuevo Ejercicio
            </h2>
            <button onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ejercicio</label>
                <input required className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej: Cat-Camel" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas (sep. comas)</label>
                     <div className="flex items-center border rounded-lg pr-2">
                        <input className="w-full p-2 rounded-l-lg outline-none" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="hombro, goma..." />
                        <Tag size={16} className="text-gray-400" />
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enlace de Video</label>
                    <input className="w-full p-2 border rounded-lg" value={formData.videoUrl} onChange={e => setFormData({...formData, videoUrl: e.target.value})} placeholder="URL..." />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Portada (Opcional)</label>
                    <div 
                        className="border border-gray-300 rounded-lg p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-50"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <Image size={20} className="text-gray-400" />
                        <span className="text-xs text-gray-500 truncate">{imageFile ? imageFile.name : 'Subir imagen...'}</span>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files[0])}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones / Claves</label>
                <textarea className="w-full p-2 border rounded-lg" rows="3" value={formData.instructions} onChange={e => setFormData({...formData, instructions: e.target.value})} placeholder="Mantén la espalda recta..." />
            </div>

            <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading} className="bg-brand-action text-white px-6 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2">
                    <Save size={18} /> <span>{loading ? 'Guardando...' : 'Guardar Ejercicio'}</span>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default NewExerciseModal;
